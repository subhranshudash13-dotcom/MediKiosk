"""
MediKiosk Unified Ultra-Fast AI Pipeline.
Performs Single-Pass Extraction + Empathetic Dialogue Generation with sub-second racing architecture:
1. Instant Local NLU Model (< 5ms) generates high-accuracy baseline extraction & vernacular response.
2. Fast Cloud LLM (Groq LLaMA-3.3-70B / LLaMA-3.1-8B / OpenAI GPT-4o-mini) executes single unified pass with 4.5s timeout.
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
    HistoricalCorrelation,
)
from app.services.ai.clinical_nlu_model import clinical_nlu
from app.services.ai.safety_guardrails import safety_guardrails
from app.services.clinical.event_logger import event_logger

logger = logging.getLogger(__name__)


UNIFIED_SINGLE_PASS_PROMPT = """You are "Aarogya Mitra", a highly capable, compassionate AI Clinical Intake & Pre-Consultation Assistant at an Indian hospital smart kiosk.
You converse fluently, naturally, and warmly in English, Hindi (हिंदी), Bengali (বাংলা), Telugu (తెలుగు), Tamil (தமிழ்), Marathi (मराठी), and Hinglish.

ROLE & MISSION:
You are an intelligent pre-consultation intake chatbot and triage assistant designed to understand the patient's complaints deeply, provide supportive guidance and recommend immediate practical next steps, and prepare a structured pre-consultation summary for the attending physician.
You are NOT a doctor: you do not make final clinical diagnoses and do not write medical prescriptions.

BEHAVIORAL DIRECTIVES:
1. DIRECT CONVERSATIONAL RELEVANCE & ANSWERING PATIENT QUERIES:
   - Always DIRECTLY ACKNOWLEDGE AND ANSWER what the patient just said or asked before proceeding to clinical probing:
     * If the patient asks your identity / name: Introduce yourself as Aarogya Mitra, explain you are an AI pre-consultation assistant helping prepare their medical summary for the doctor, and ask what symptoms they are experiencing.
     * If the patient asks about taking a medicine (e.g. Paracetamol, antacid): Provide safe, supportive guidance (e.g., Paracetamol can offer temporary relief for mild pain/fever, but consulting the doctor for the exact dose and cause is best), and guide them to describe where and how severe their discomfort is.
     * If the patient asks about a disease or advice: Reassure them empathetically, explain potential general factors, recommend next supportive steps (e.g. resting, sitting comfortably, staying hydrated), and explain that the doctor will provide the definitive assessment.
     * NEVER IGNORE the patient's statement to ask a disconnected, rigid question. Always sound like a warm, attentive medical concierge.

2. SUPPORTIVE GUIDANCE & RECOMMENDING NEXT STEPS:
   - As an assistant, recommend helpful, non-prescriptive immediate next steps when appropriate (e.g. keeping past prescription slips ready, resting without exertion if experiencing chest tightness, drinking warm fluids for throat irritation, or reporting immediately to emergency triage if red flags are detected).
   - Reassure the patient that their symptoms and medical background are being neatly documented for the physician to save their consultation time.

3. STRICT UNIQUE QUESTIONS & ZERO REPETITION:
   - NEVER repeat a question or ask about an aspect that the patient has ALREADY mentioned in previous turns or conversation history.
   - If the patient already said where the pain is, DO NOT ask "Where is the pain?".
   - If the patient already said how many days, DO NOT ask "How long have you had it?".
   - Ask exactly 1 focused, empathetic follow-up question per turn based on the clinical context:
     * Chest / Cardiac: Radiating heaviness to left arm/jaw, breathlessness, sweating, aggravation on walking/stairs.
     * Abdomen / GI: Burning vs cramping, upper vs lower quadrant, relation to food/meals, vomiting or loose stools.
     * Fever / Infectious: Chills/rigors, body aches, sore throat, cough with phlegm, skin rashes.
     * Head / Neuro: Throbbing vs tight band, visual disturbances, dizziness, nausea.
     * Joints / Limbs: Swelling, stiffness, recent injury or trauma.

4. AI LONGITUDINAL HISTORY CORRELATION:
   - You are provided with the patient's Known Medical History (past chronic conditions, previous admissions, past prescriptions, and lab tests).
   - ACTIVELY CORRELATE the patient's current symptoms with their medical history in your clinical assessment:
     * If patient has Hypertension/Diabetes and reports chest discomfort, correlate with cardiovascular risk/angina.
     * If patient has prior TB or Asthma and reports cough/breathlessness, correlate with respiratory reactivation or bronchospasm.
     * If patient has prior GI/ulcer issues and reports stomach pain, correlate with dyspepsia/NSAID gastritis.
   - In your spoken response, acknowledge this correlation when appropriate (e.g. "I see you have a history of high BP; are you taking your daily medications, and did this discomfort increase during physical exertion?").
   - Populate the "historical_correlation" object in the JSON output.

5. COMPREHENSIVE CLINICAL INTAKE BUDGET (TARGET 7-8 FOCUSED QUESTIONS):
   - Ask an average of 7-8 unique, clinically grounded questions exploring all core dimensions before concluding:
     1. Exact Anatomical Site & Depth
     2. Onset, Duration, & Progression Timeline
     3. Sensation, Quality, & Character (sharp, burning, cramping, throbbing, pressure)
     4. Radiation & Spread
     5. Aggravating & Relieving Factors (food, walking, exertion, posture, rest)
     6. Associated Organ Symptoms (fever, nausea, dyspnea, sweats, bowel/urinary changes)
     7. Longitudinal Medical History / Comorbidity & Regular Medications Correlation
     8. Clinical Severity / Pain / Functional Limitation Scale (1-10)
   - If Current Turn Count >= 7 and key dimensions are gathered, OR if Turn Count >= 8, OR if an emergency red flag is detected:
     * STOP ASKING QUESTIONS IMMEDIATELY.
     * Conclude the interview warmly in {language}, summarize that all symptoms, timeline, and past medical history have been compiled into a structured pre-consultation report for the consulting physician, and guide them with their next steps (e.g. taking their OPD token to the doctor's room).

6. Output Format:
   Return ONLY a valid JSON object matching this schema:
   {{
     "extraction": {{
       "chief_complaint": "brief description or null",
       "site": "anatomical site or null",
       "onset": "onset time/character or null",
       "character": "symptom quality or null",
       "radiation": "radiation path or null",
       "associated_symptoms": ["symptom1", "symptom2"],
       "duration_days": null,
       "time_course": "time course description or null",
       "severity_score": null,
       "past_history": ["condition1"],
       "current_medications": ["med1"],
       "allergies": ["allergy1"],
       "historical_correlation": {{
         "related_past_condition": "e.g. Essential Hypertension & Diabetes",
         "clinical_link": "Acute exertional chest discomfort in patient with long-standing hypertension suggests possible ischemic angina.",
         "relevance_note": "Correlated with documented Amlodipine prescription and elevated HbA1c."
       }}
     }},
     "spoken_response": "Direct, empathetic response answering patient question/statement in {language} followed by supportive guidance, practical next step, or the next natural clinical follow-up question",
     "quick_replies": ["option 1", "option 2", "option 3"]
   }}

Do not prescribe medications or make definitive diagnoses."""


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
            self._groq_client = AsyncGroq(api_key=settings.GROQ_API_KEY, max_retries=0)
        return self._groq_client

    @property
    def openai_client(self) -> Optional[AsyncOpenAI]:
        if not self._openai_client and settings.OPENAI_API_KEY and AsyncOpenAI:
            self._openai_client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY, max_retries=0)
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
        local_dialogue = clinical_nlu.generate_dialogue_fast(
            transcript, state, local_extraction, language=language, history=history
        )

        local_spoken = local_dialogue.get("spoken_response", "आपकी तकलीफ़ नोट कर ली गई है।")
        local_replies = local_dialogue.get("quick_replies", [])

        # If it's an emergency, immediately return local safety response without waiting
        if local_dialogue.get("is_emergency"):
            return local_extraction, local_spoken, local_replies

        # Check cloud keys availability
        has_cloud_keys = bool(
            (settings.GROQ_API_KEY and not settings.GROQ_API_KEY.startswith("gsk_placeholder"))
            or (settings.OPENAI_API_KEY and not settings.OPENAI_API_KEY.startswith("sk-placeholder"))
        )
        if not has_cloud_keys or self.is_circuit_open:
            return local_extraction, local_spoken, local_replies

        # Step 2: Fast Cloud LLM Race (Target < 1.5s, Timeout 6.0s)
        try:
            async with sem:
                llm_result = await asyncio.wait_for(
                    self._single_pass_cloud_llm(transcript, state, language, history=history),
                    timeout=6.0
                )
                if llm_result:
                    extracted, spoken, replies = llm_result
                    extracted = safety_guardrails.verify_grounding(extracted, transcript)
                    if spoken and len(spoken.strip()) > 5:
                        if self._consecutive_failures > 0:
                            self._consecutive_failures = 0
                        sanitized_spoken = safety_guardrails.sanitize_model_output(spoken, language=language)
                        return extracted, sanitized_spoken, replies or local_replies
        except asyncio.TimeoutError:
            self._consecutive_failures += 1
            logger.info("FastAIPipeline: Cloud LLM timed out (>6000ms), using high-speed local NLU.")
        except Exception as e:
            self._consecutive_failures += 1
            logger.info(f"FastAIPipeline: Cloud LLM unavailable ({e}), using high-speed local NLU.")

        if self._consecutive_failures >= 5:
            self._circuit_open_until = time.time() + 60.0
            logger.info("FastAIPipeline: Circuit breaker open. Routing to high-speed local NLU engine.")

        return local_extraction, local_spoken, local_replies

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

        # Past medical history and historical clues
        past_hist_str = ", ".join(state.past_history) if state.past_history else "None documented"
        meds_str = ", ".join(state.current_medications) if state.current_medications else "None documented"
        allergies_str = ", ".join(state.allergies) if state.allergies else "No known allergies"
        clues_str = "\n".join([f"  * {c.get('condition', '')} ({c.get('year', '')}): {c.get('relevanceNote', '')}" for c in state.historical_clues]) if state.historical_clues else "No historical records linked"

        user_prompt = f"""Patient Preferred Language: {language}
Current Turn Count: {state.turn_count + 1}
Patient Name: {state.patient_name or 'Patient'} ({state.age or 35} yrs, {state.gender or 'Adult'})

Patient's Longitudinal Medical History (EHR / ABDM Records):
- Past Chronic Diseases / Admissions: {past_hist_str}
- Active Prescriptions / Ongoing Medications: {meds_str}
- Known Allergies: {allergies_str}
- Historical Clinical Clues:
{clues_str}

Conversation History So Far:
{hist_text or "No prior history (Start of consultation)"}

Patient Just Said: \"\"\"{transcript}\"\"\"

Current Clinical Intake State:
- Identified Chief Complaints: {state.chief_complaints}
- Recorded SOCRATES: {state.socrates.model_dump(exclude_none=True)}
- Associated Symptoms: {state.associated_symptoms}
- Questions Already Asked: {state.asked_questions}

Respond as Aarogya Mitra following all directives. Directly address whatever the patient just asked/said and then naturally ask the next relevant question. Return strictly valid raw JSON."""

        # 1. Try Active High-Speed Groq Models
        if settings.GROQ_API_KEY or self.groq_client:
            client = self.groq_client
            if client:
                for model_name in ["groq/compound-mini", "qwen/qwen3.6-27b", "openai/gpt-oss-20b", "groq/compound"]:
                    try:
                        resp = await client.chat.completions.create(
                            model=model_name,
                            messages=[
                                {"role": "system", "content": UNIFIED_SINGLE_PASS_PROMPT.format(language=language)},
                                {"role": "user", "content": user_prompt}
                            ],
                            temperature=0.15,
                            max_tokens=600
                        )
                        raw = resp.choices[0].message.content or "{}"
                        data = clean_json_dict(raw)
                        if not data:
                            continue

                        extraction_dict = data.get("extraction", {})
                        if not isinstance(extraction_dict, dict):
                            extraction_dict = {}

                        extracted = ExtractionPayload(**extraction_dict)
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
                        temperature=0.15,
                        max_tokens=500
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


