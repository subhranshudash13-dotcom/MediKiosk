"""
MediKiosk Unified Ultra-Fast AI Pipeline.
Performs Single-Pass Extraction + Empathetic Dialogue Generation with sub-second racing architecture:
1. Instant Local NLU Model (< 5ms) generates high-accuracy baseline extraction & vernacular response.
2. Fast Cloud LLM (Groq GPT-OSS-120B / GPT-OSS-20B / GPT-4o-mini) executes single unified pass with 4.5s timeout.
3. If network delays or errors occur, local NLU response is returned seamlessly with zero user-visible lag.
"""

import asyncio
import json
import logging
import re
import time
from typing import Dict, Any, Optional, Tuple, List
from groq import AsyncGroq
try:
    from openai import AsyncOpenAI
except ImportError:
    AsyncOpenAI = None
import httpx

from app.core.config import settings
from app.services.ai.schemas import (
    ClinicalIntakeState,
    ExtractionPayload,
    DialogueTurnResponse,
    RedFlagAlert,
)
from app.services.ai.clinical_nlu_model import clinical_nlu
from app.services.ai.safety_guardrails import safety_guardrails
from app.services.clinical.event_logger import event_logger

logger = logging.getLogger(__name__)


UNIFIED_SINGLE_PASS_PROMPT = """You are "Aarogya Mitra", a highly skilled, compassionate AI Clinical Intake Assistant at an Indian hospital smart kiosk.
You converse fluently, naturally, and warmly in English, Hindi (हिंदी), Bengali (বাংলা), Telugu (తెలుగు), Tamil (தமிழ்), Marathi (मराठी), and Hinglish.

BEHAVIORAL DIRECTIVES:
1. Meta-Questions, Greetings, & Name Inquiries:
   - If the patient asks what your name is, who you are, or greets you in ANY language:
     * English: "I am Aarogya Mitra, your AI clinical assistant at MediKiosk. Please tell me what symptoms or health trouble you are experiencing today."
     * Hindi / Hinglish: "नमस्ते! मैं आरोग्य मित्र हूँ — मेडीकियोस्क का एआई क्लिनिकल सहायक। कृपया बताएं आज आपको क्या तकलीफ़ या समस्या है?"
     * Bengali ("Tumára nám kjá er?", "Apnar naam ki?"): "নমস্কার! আমি আরোগ্য মিত্র — মেডিকিয়স্কের এআই ক্লিনিকাল সহকারী। আপনার কী সমস্যা বা অসুস্থতা হচ্ছে দয়া করে বলুন।"
     * Telugu: "నమస్కారం! నేను ఆరోగ్య మిత్ర — మేడికియోస్క్ AI క్లినికల్ సహాయకుడిని. మీకు ఏ విధమైన ఆరోగ్య సమస్య ఉంది?"
   - Do NOT treat greeting/identity questions as clinical symptoms or advance intake slots.
   - If the patient asks how you can help, explain that you record their symptoms and prepare a structured pre-consultation summary for the doctor.

2. Deep Clinical SOCRATES Inquiry (Specialty-Specific):
   - When the patient reports symptoms, do NOT ask generic robotic questions. Probe deeply based on anatomical system:
     * Abdomen / Stomach: Exact quadrant (upper, lower, right, left), burning vs cramping vs sharp, relation to food/meals, nausea, vomiting, loose motions or constipation.
     * Chest / Heart: Heavy crushing pressure vs sharp, radiation to left arm/jaw/back, shortness of breath, cold sweating, worsens with exertion.
     * Fever / Infection: High vs low grade, chills/rigors, cough with sputum, sore throat, burning urination, rash.
     * Head / Neuro: Throbbing vs tight band, unilateral vs bilateral, sensitivity to light/sound, nausea, dizziness.
     * Limbs / Joints: Swelling, morning stiffness, trauma/injury history.
   - NEVER ask more than 1 or 2 focused follow-up questions per turn.
   - NEVER repeat questions already answered in conversation history.

3. Deepening Details & Handling Patient Feedback:
   - If the patient says "you didn't take all details", "ask more questions", "be more specific", or adds more symptoms:
     * Graciously acknowledge and ask about aggravating/relieving factors, previous episodes, past medical history (hypertension, diabetes, thyroid), or ongoing medications.

4. Intake Completion & Maximum Question Limit (STRICT MAX 7-8 QUESTIONS):
   - Ask NO MORE than 7-8 unique questions total in the entire conversation.
   - If Current Turn Count >= 7, OR if 4-5 SOCRATES dimensions have been gathered, OR if an emergency red flag is triggered:
     * YOU MUST STOP ASKING QUESTIONS IMMEDIATELY.
     * DO NOT ASK ANY FURTHER QUESTIONS.
     * Warmly conclude intake in {language}, state that all clinical details have been recorded and sent to the consulting doctor, and instruct them to proceed with their OPD token.


5. Output Format:
   Return ONLY a valid JSON object matching this schema:
   {{
     "extraction": {{
       "chief_complaint": "brief description or null",
       "site": "anatomical site or null",
       "onset": "time or null",
       "character": "character or null",
       "radiation": "radiation or null",
       "associated_symptoms": [],
       "duration_days": null,
       "time_course": "time course or null",
       "severity_score": null
     }},
     "spoken_response": "1-2 natural empathetic sentences in {language} answering the patient and asking the next focused clinical question",
     "quick_replies": ["option 1", "option 2", "option 3"]
   }}

Do not prescribe medications or make final medical diagnoses."""


def clean_json_dict(text: str) -> dict:
    """Extracts valid JSON dictionary from text with support for markdown fences and loose keys."""
    if not text:
        return {}
    t = text.strip()
    if "```" in t:
        match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", t)
        if match:
            t = match.group(1).strip()
    first_brace = t.find("{")
    last_brace = t.rfind("}")
    if first_brace != -1 and last_brace != -1 and last_brace > first_brace:
        t = t[first_brace:last_brace + 1]
    try:
        return json.loads(t)
    except Exception:
        # Fallback regex extraction of spoken response
        spoken_m = re.search(r'"(?:spoken_response|spoken|response|message)":\s*"([^"]+)"', t)
        if spoken_m:
            return {"spoken_response": spoken_m.group(1), "quick_replies": []}
        return {}


class FastAIPipelineService:
    """Unified Single-Pass AI Pipeline with Concurrency Throttling and Circuit Breaking."""

    def __init__(self):
        self._groq_client: Optional[AsyncGroq] = None
        self._openai_client: Optional[AsyncOpenAI] = None
        self._consecutive_failures: int = 0
        self._circuit_open_until: float = 0.0
        self._session_semaphores: Dict[str, asyncio.Semaphore] = {}

    def _get_semaphore(self, session_id: str) -> asyncio.Semaphore:
        """Enforces max 2 concurrent AI calls per kiosk session."""
        if session_id not in self._session_semaphores:
            self._session_semaphores[session_id] = asyncio.Semaphore(2)
        return self._session_semaphores[session_id]

    @property
    def is_circuit_open(self) -> bool:
        """Returns True if circuit is currently tripped open to protect backend."""
        return time.time() < self._circuit_open_until

    @property
    def groq_client(self) -> Optional[AsyncGroq]:
        if not self._groq_client and settings.GROQ_API_KEY:
            self._groq_client = AsyncGroq(api_key=settings.GROQ_API_KEY)
        return self._groq_client

    @property
    def openai_client(self) -> Optional[AsyncOpenAI]:
        if not self._openai_client and settings.OPENAI_API_KEY and AsyncOpenAI:
            self._openai_client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        return self._openai_client

    async def execute_turn(
        self,
        transcript: str,
        state: ClinicalIntakeState,
        language: str = "hi",
        session_id: Optional[str] = None,
        history: Optional[List[Dict[str, str]]] = None
    ) -> Tuple[ExtractionPayload, str, List[str]]:
        """
        Executes single unified turn:
        Runs local NLU baseline in < 3ms, then races with ultra-fast cloud LLM.
        Enforces concurrency limit (2 calls/session) and circuit-breaker protection.
        Returns: (extracted_payload, spoken_response, quick_replies)
        """
        sid = session_id or state.session_id or "ANONYMOUS"
        sem = self._get_semaphore(sid)

        # Step 1: Run trained Local Clinical NLU (< 3ms)
        local_extraction = clinical_nlu.extract_slots_fast(transcript, current_state=state.model_dump())
        local_dialogue = clinical_nlu.generate_dialogue_fast(transcript, state, local_extraction, language=language, history=history)

        local_spoken = local_dialogue.get("spoken_response", "आपकी तकलीफ़ नोट कर ली गई है।")
        local_replies = local_dialogue.get("quick_replies", [])

        # If it's an emergency, immediately return local safety response without waiting
        if local_dialogue.get("is_emergency"):
            return local_extraction, local_spoken, local_replies

        # If no cloud API keys are configured or valid, use zero-latency local NLU directly
        has_cloud_keys = bool((settings.GROQ_API_KEY and not settings.GROQ_API_KEY.startswith("gsk_placeholder")) or (settings.OPENAI_API_KEY and not settings.OPENAI_API_KEY.startswith("sk-placeholder")))
        if not has_cloud_keys or self.is_circuit_open:
            return local_extraction, local_spoken, local_replies

        # Step 2: Fast Cloud LLM Race (Target < 1.5s)
        try:
            async with sem:
                llm_result = await asyncio.wait_for(
                    self._single_pass_cloud_llm(transcript, state, language, history=history),
                    timeout=1.5
                )
                if llm_result:
                    extracted, spoken, replies = llm_result
                    # Apply grounding verification to LLM extraction
                    extracted = safety_guardrails.verify_grounding(extracted, transcript)
                    if spoken and len(spoken.strip()) > 5:
                        if self._consecutive_failures > 0:
                            self._consecutive_failures = 0
                        sanitized_spoken = safety_guardrails.sanitize_model_output(spoken, language=language)
                        return extracted, sanitized_spoken, replies or local_replies
        except asyncio.TimeoutError:
            self._consecutive_failures += 1
            logger.info(f"FastAIPipeline: Cloud LLM timed out (>1500ms), using high-speed local NLU.")
        except Exception as e:
            self._consecutive_failures += 1
            logger.info(f"FastAIPipeline: Cloud LLM unavailable ({e}), using high-speed local NLU.")

        # Check if we need to trip the circuit breaker (after 5 consecutive failures)
        if self._consecutive_failures >= 5:
            self._circuit_open_until = time.time() + 60.0  # Open for 60s
            logger.info("FastAIPipeline: Directing traffic to high-speed local NLU engine.")

        # Fallback to high-speed local NLU output
        return local_extraction, local_spoken, local_replies

    def _build_dynamic_quick_replies(self, state: ClinicalIntakeState, target_slot: str, language: str = "hi") -> List[str]:
        """Builds contextual quick replies based on missing SOCRATES slots and language."""
        if language == "hi":
            if target_slot == "site":
                return ["सीने में दर्द है", "पेट में दर्द है", "सिर में तेज दर्द"]
            elif target_slot == "duration":
                return ["आज सुबह से है", "2-3 दिनों से है", "1 हफ्ते से ज्यादा"]
            elif target_slot == "severity":
                return ["10 में से 8 (तेज दर्द)", "10 में से 5 (मध्यम)", "10 में से 3 (हल्का)"]
            elif target_slot == "character":
                return ["भारी दबाव जैसा लग रहा है", "तेज चुभन वाला दर्द है", "जलन जैसी तकलीफ़"]
            elif target_slot == "associated":
                return ["उल्टी और कमजोरी महसूस हो रही है", "सांस फूलने की शिकायत है", "कोई अन्य लक्षण नहीं है"]
            elif target_slot == "history":
                return ["बीपी और शुगर की दवा चल रही है", "पहले से कोई बीमारी नहीं है", "थायराइड की समस्या है"]
            else:
                return ["डॉक्टर वर्कस्टेशन खोलें", "टोकन नंबर दिखाएं"]
        elif language == "bn":
            if target_slot == "site":
                return ["পেটে ব্যথা হচ্ছে", "বুকে ব্যথা বা চাপ", "মাথায় তীব্র যন্ত্রণা"]
            elif target_slot == "duration":
                return ["আজ সকাল থেকে", "২-৩ দিন ধরে", "এক সপ্তাহের বেশি"]
            elif target_slot == "severity":
                return ["১০ এ ৮ (তীব্র কষ্ট)", "১০ এ ৫ (মাঝারি কষ্ট)", "১০ এ ৩ (হালকা কষ্ট)"]
            else:
                return ["ওপিডি টোকেন দেখুন", "ডাক্তার পোর্টাল খুলুন"]
        else:
            if target_slot == "site":
                return ["In my stomach/abdomen", "In my chest", "In my head"]
            elif target_slot == "duration":
                return ["Since today morning", "For 2-3 days", "More than 1 week"]
            elif target_slot == "severity":
                return ["8 out of 10 (Severe)", "5 out of 10 (Moderate)", "3 out of 10 (Mild)"]
            else:
                return ["View OPD Token", "Open Doctor Cockpit"]

    async def _single_pass_cloud_llm(
        self,
        transcript: str,
        state: ClinicalIntakeState,
        language: str,
        history: Optional[List[Dict[str, str]]] = None
    ) -> Optional[Tuple[ExtractionPayload, str, List[str]]]:
        """Runs a single unified extraction + dialogue generation pass with full context history."""
        hist_text = ""
        if history:
            hist_text = "\n".join([f"- {h['role'].upper()}: \"{h['content']}\"" for h in history[-8:]])

        user_prompt = f"""Patient Preferred Language: {language}
Current Turn Count: {state.turn_count + 1}

Conversation History So Far:
{hist_text or "No prior history (Start of conversation)"}

Patient Just Said: \"\"\"{transcript}\"\"\"

Known Clinical State:
- Known Chief Complaints: {state.chief_complaints}
- Known SOCRATES: {state.socrates.model_dump(exclude_none=True)}
- Associated Symptoms: {state.associated_symptoms}

Respond as Aarogya Mitra following all instructions. Return strictly valid raw JSON."""

        # 1. Try Groq (Ultra-Fast < 1000ms using llama-3.1-8b-instant)
        if settings.GROQ_API_KEY or self.groq_client:
            client = self.groq_client
            if client:
                for model_name in ["llama-3.1-8b-instant", "llama3-70b-8192", "mixtral-8x7b-32768"]:
                    try:
                        resp = await client.chat.completions.create(
                            model=model_name,
                            messages=[
                                {"role": "system", "content": UNIFIED_SINGLE_PASS_PROMPT.format(language=language)},
                                {"role": "user", "content": user_prompt}
                            ],
                            temperature=0.1,
                            max_tokens=500
                        )
                        raw = resp.choices[0].message.content or "{}"
                        data = clean_json_dict(raw)
                        if not data:
                            continue

                        extraction_dict = data.get("extraction", {})
                        if not isinstance(extraction_dict, dict):
                            extraction_dict = {}

                        extracted = ExtractionPayload(**extraction_dict)
                        # Filter LLM extraction with strict grounding
                        extracted = safety_guardrails.verify_grounding(extracted, transcript)

                        spoken = (
                            data.get("spoken_response")
                            or data.get("spoken")
                            or data.get("response")
                            or data.get("message")
                            or ""
                        )
                        replies = data.get("quick_replies") or data.get("replies") or data.get("options") or []
                        if isinstance(replies, list):
                            replies = [str(r) for r in replies if r]
                        else:
                            replies = []

                        if spoken:
                            return extracted, spoken, replies
                    except Exception as e:
                        logger.debug(f"Groq model {model_name} failed: {e}")
                        continue

        # 2. Try OpenAI GPT-4o-mini
        if settings.OPENAI_API_KEY or self.openai_client:
            client = self.openai_client
            if client:
                try:
                    resp = await client.chat.completions.create(
                        model="gpt-4o-mini",
                        messages=[
                            {"role": "system", "content": UNIFIED_SINGLE_PASS_PROMPT.format(language=language)},
                            {"role": "user", "content": user_prompt}
                        ],
                        temperature=0.1,
                        max_tokens=400
                    )
                    raw = resp.choices[0].message.content or "{}"
                    data = clean_json_dict(raw)
                    extracted = ExtractionPayload(**data.get("extraction", {}))
                    extracted = safety_guardrails.verify_grounding(extracted, transcript)
                    spoken = data.get("spoken_response") or data.get("response") or data.get("spoken") or ""
                    replies = data.get("quick_replies") or data.get("replies") or []
                    if spoken:
                        return extracted, spoken, replies
                except Exception as e:
                    logger.debug(f"OpenAI fallback failed: {e}")

        return None


fast_ai_pipeline = FastAIPipelineService()

