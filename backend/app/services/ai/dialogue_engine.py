import logging
from typing import Dict, Any, List, Optional
from groq import AsyncGroq
import httpx
try:
    from openai import AsyncOpenAI
except ImportError:
    AsyncOpenAI = None

from app.core.config import settings
from app.services.ai.schemas import ClinicalIntakeState, ExtractionPayload
from app.services.ai.prompts import CLINICAL_INTAKE_SYSTEM_PROMPT
from app.services.ai.safety_guardrails import safety_guardrails

logger = logging.getLogger(__name__)


class DialogueEngineService:
    """Dynamic conversational dialogue manager that adapts to each patient's clinical presentation."""

    def __init__(self):
        self._groq_client: Optional[AsyncGroq] = None
        self._openai_client: Optional[AsyncOpenAI] = None

    @property
    def openai_client(self) -> Optional[Any]:
        if not AsyncOpenAI:
            return None
        if not self._openai_client and settings.OPENAI_API_KEY:
            self._openai_client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        return self._openai_client

    @property
    def groq_client(self) -> Optional[AsyncGroq]:
        if not self._groq_client and settings.GROQ_API_KEY:
            self._groq_client = AsyncGroq(api_key=settings.GROQ_API_KEY)
        return self._groq_client

    async def _check_ollama_available(self) -> bool:
        try:
            async with httpx.AsyncClient(timeout=0.3) as http_client:
                resp = await http_client.get(f"{settings.OLLAMA_BASE_URL}/api/tags")
                return resp.status_code == 200
        except Exception:
            return False

    async def generate_response(
        self,
        transcript: str,
        state: ClinicalIntakeState,
        extracted: ExtractionPayload,
        conversation_history: List[Dict[str, str]]
    ) -> Dict[str, Any]:
        """
        Generates dynamic, empathetic triage inquiry and quick reply options based on current intake state.
        """
        # Determine missing SOCRATES slots
        missing_slots = []
        if not state.socrates.site:
            missing_slots.append("Exact location of discomfort")
        if not state.socrates.onset:
            missing_slots.append("Onset (sudden or gradual)")
        if not state.socrates.character:
            missing_slots.append("Quality/character of symptom (sharp, burning, heavy, dull)")
        if not state.socrates.radiation:
            missing_slots.append("Radiation to another area (arm, jaw, back, shoulder)")
        if not state.socrates.time_course and state.socrates.duration_days is None:
            missing_slots.append("Duration and timeline")
        if state.socrates.severity_score is None:
            missing_slots.append("Severity score (1-10)")

        spoken_text = ""
        quick_options = []

        # 1. Try OpenAI (if credits available)
        if settings.OPENAI_API_KEY or self.openai_client:
            try:
                spoken_text, quick_options = await self._generate_via_openai(
                    transcript, state, extracted, missing_slots, conversation_history
                )
            except Exception as e:
                logger.warning(f"DialogueEngine: OpenAI generation failed ({e}), trying next provider.")

        # 2. Try Groq Cloud (Free tier)
        if not spoken_text and settings.GROQ_API_KEY:
            try:
                spoken_text, quick_options = await self._generate_via_groq(
                    transcript, state, extracted, missing_slots, conversation_history
                )
            except Exception as e:
                logger.warning(f"DialogueEngine: Groq generation failed ({e}), trying next provider.")

        # 3. Try Gemini Free Tier
        if not spoken_text and settings.GEMINI_API_KEY:
            try:
                spoken_text, quick_options = await self._generate_via_gemini(
                    transcript, state, extracted, missing_slots, conversation_history
                )
            except Exception as e:
                logger.warning(f"DialogueEngine: Gemini generation failed ({e}), trying Ollama.")

        # 3. Try Local Ollama
        if not spoken_text and await self._check_ollama_available():
            try:
                spoken_text, quick_options = await self._generate_via_ollama(
                    transcript, state, extracted, missing_slots, conversation_history
                )
            except Exception as e:
                logger.warning(f"DialogueEngine: Ollama generation failed ({e}), using dynamic fallback.")

        # 4. Deterministic fallback
        if not spoken_text:
            spoken_text, quick_options = self._generate_dynamic_fallback(
                transcript, state, extracted, missing_slots
            )

        sanitized_text = safety_guardrails.sanitize_model_output(spoken_text, language=state.language)

        return {
            "spoken_response": sanitized_text,
            "quick_replies": quick_options,
            "missing_slots": missing_slots
        }

    async def _generate_via_openai(
        self,
        transcript: str,
        state: ClinicalIntakeState,
        extracted: ExtractionPayload,
        missing_slots: List[str],
        conversation_history: List[Dict[str, str]]
    ) -> tuple[str, List[str]]:
        client = self.openai_client
        if not client:
            raise ValueError("OpenAI client unavailable")

        context_prompt = f"""
Current Clinical State:
- Chief Complaints: {state.chief_complaints or [extracted.chief_complaint]}
- Associated Symptoms: {state.associated_symptoms}
- Known SOCRATES: {state.socrates.model_dump(exclude_none=True)}
- Missing Clinical Dimensions to Explore: {missing_slots[:2]}
- Patient Preferred Language: {state.language} (Respond naturally in this language: Hindi/Telugu/English/Hinglish)

Patient just said:
\"{transcript}\"

Instructions:
1. Empathize and acknowledge in 1 short sentence.
2. If the patient asked a question, address it gently without diagnosing or prescribing.
3. Ask ONE focused, natural clinical follow-up question in their language exploring the most relevant missing clinical dimension.
4. Keep the total response to 1-2 conversational sentences.
"""

        messages = [{"role": "system", "content": CLINICAL_INTAKE_SYSTEM_PROMPT}]
        for turn in conversation_history[-4:]:
            messages.append(turn)
        messages.append({"role": "user", "content": context_prompt})

        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages,
            temperature=0.3,
            max_tokens=150,
        )
        content = (response.choices[0].message.content or "").strip()
        quick_options = self._generate_quick_options(missing_slots, state.language)
        return content, quick_options

    async def _generate_via_gemini(
        self,
        transcript: str,
        state: ClinicalIntakeState,
        extracted: ExtractionPayload,
        missing_slots: List[str],
        conversation_history: List[Dict[str, str]]
    ) -> tuple[str, List[str]]:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={settings.GEMINI_API_KEY}"
        user_prompt = f"""{CLINICAL_INTAKE_SYSTEM_PROMPT}

Current Clinical State:
- Chief Complaints: {state.chief_complaints or [extracted.chief_complaint]}
- Associated Symptoms: {state.associated_symptoms}
- Known SOCRATES: {state.socrates.model_dump(exclude_none=True)}
- Missing Dimensions to Probe: {missing_slots[:2]}
- Patient Preferred Language: {state.language}

Patient just said: \"{transcript}\"
Acknowledge with empathy and ask 1-2 focused triage questions in {state.language} exploring missing slots. Keep under 2 sentences."""

        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.post(url, json={
                "contents": [{"parts": [{"text": user_prompt}]}]
            })
            resp.raise_for_status()
            data = resp.json()
            content = data["candidates"][0]["content"]["parts"][0]["text"].strip()
            quick_options = self._generate_quick_options(missing_slots, state.language)
            return content, quick_options

    async def _generate_via_groq(
        self,
        transcript: str,
        state: ClinicalIntakeState,
        extracted: ExtractionPayload,
        missing_slots: List[str],
        conversation_history: List[Dict[str, str]]
    ) -> tuple[str, List[str]]:
        client = self.groq_client
        if not client:
            raise ValueError("Groq client unavailable")

        context_prompt = f"""
Current Clinical State:
- Chief Complaints: {state.chief_complaints or [extracted.chief_complaint]}
- Associated Symptoms: {state.associated_symptoms}
- Known SOCRATES: {state.socrates.model_dump(exclude_none=True)}
- Missing Clinical Dimensions to Explore: {missing_slots[:2]}
- Patient Preferred Language: {state.language} (Respond naturally in this language or matching their dialect)

Patient just said:
\"{transcript}\"

Instructions:
1. Empathize and acknowledge in 1 short sentence.
2. If patient asked a question, address it gently without diagnosing or prescribing.
3. Ask ONE focused, natural clinical follow-up question in their language exploring the most relevant missing clinical dimension.
4. Keep the total response to 1-2 conversational sentences.
"""

        messages = [{"role": "system", "content": CLINICAL_INTAKE_SYSTEM_PROMPT}]
        # Append recent history (last 4 turns)
        for turn in conversation_history[-4:]:
            messages.append(turn)
        messages.append({"role": "user", "content": context_prompt})

        response = await client.chat.completions.create(
            model="qwen/qwen3.8-27b",
            messages=messages,
            temperature=0.3,
            max_tokens=150,
        )
        content = (response.choices[0].message.content or "").strip()
        quick_options = self._generate_quick_options(missing_slots, state.language)
        return content, quick_options

    async def _generate_via_ollama(
        self,
        transcript: str,
        state: ClinicalIntakeState,
        extracted: ExtractionPayload,
        missing_slots: List[str],
        conversation_history: List[Dict[str, str]]
    ) -> tuple[str, List[str]]:
        context_prompt = f"""
Current Clinical State:
- Chief Complaints: {state.chief_complaints or [extracted.chief_complaint]}
- Missing Dimensions: {missing_slots[:2]}
- Patient Language: {state.language}

Patient said: \"{transcript}\"
Acknowledge with empathy and ask 1 gentle clinical follow-up in the same language. (1-2 sentences max).
"""
        messages = [{"role": "system", "content": CLINICAL_INTAKE_SYSTEM_PROMPT}]
        for turn in conversation_history[-4:]:
            messages.append(turn)
        messages.append({"role": "user", "content": context_prompt})

        async with httpx.AsyncClient(timeout=1.5) as http_client:
            resp = await http_client.post(
                f"{settings.OLLAMA_BASE_URL}/api/chat",
                json={
                    "model": "qwen2.5:7b-instruct",
                    "messages": messages,
                    "stream": False,
                    "options": {"temperature": 0.3}
                }
            )
            resp.raise_for_status()
            data = resp.json()
            content = data.get("message", {}).get("content", "").strip()
            quick_options = self._generate_quick_options(missing_slots, state.language)
            return content, quick_options

    def _generate_dynamic_fallback(
        self,
        transcript: str,
        state: ClinicalIntakeState,
        extracted: ExtractionPayload,
        missing_slots: List[str]
    ) -> tuple[str, List[str]]:
        """Intelligent vernacular fallback templates when AI service is entirely offline."""
        lang = state.language
        if "Radiation" in " ".join(missing_slots):
            if lang == "hi" or "hindi" in lang or "hinglish" in lang:
                text = "मैं समझ गया। क्या यह दर्द आपके कंधे, बाएं हाथ या जबड़े की तरफ भी जा रहा है?"
                options = ["हाँ, बाएं हाथ में जा रहा है", "नहीं, सिर्फ छाती में है", "पीठ की तरफ जाता है"]
            elif lang == "te":
                text = "నేను అర్థం చేసుకున్నాను. ఈ నొప్పి మీ ఎడమ చేయి లేదా దవడ వైపు వ్యాపిస్తుందా?"
                options = ["అవును, ఎడమ చేతికి వ్యాపిస్తుంది", "లేదు, కేవలం ఛాతీలోనే ఉంది"]
            else:
                text = "Understood. Does this discomfort radiate anywhere else, like your left arm, shoulder, or jaw?"
                options = ["Yes, radiates to left arm", "No, localized to chest", "Radiates to back"]
            return text, options

        if "Severity" in " ".join(missing_slots):
            if lang == "hi" or "hinglish" in lang:
                text = "कृपया बताएं कि 1 से 10 के पैमाने पर आप इस दर्द या परेशानी को कितना गंभीर मानेंगे?"
                options = ["हल्का (1-3)", "मध्यम (4-6)", "अत्यधिक तेज (7-10)"]
            elif lang == "te":
                text = "1 నుండి 10 స్కేలులో మీ నొప్పి తీవ్రత ఎంతగా ఉంది?"
                options = ["తేలికపాటి (1-3)", "మధ్యస్థం (4-6)", "తీవ్రమైనది (7-10)"]
            else:
                text = "On a scale of 1 to 10, how severe would you rate this discomfort right now?"
                options = ["Mild (1-3)", "Moderate (4-6)", "Severe (7-10)"]
            return text, options

        if lang == "hi" or "hinglish" in lang:
            return "मैंने आपकी बात नोट कर ली है। क्या इसके साथ आपको बुखार, उल्टी या सांस फूलने जैसी कोई और समस्या भी है?", ["हाँ, बुखार भी है", "हाँ, सांस फूल रही है", "नहीं, और कोई समस्या नहीं"]
        elif lang == "te":
            return "మీరు చెప్పినది నమోదు చేశాను. దీనితో పాటు జ్వరం లేదా శ్వాస తీసుకోవడంలో ఇబ్బంది ఉందా?", ["అవును, జ్వరం ఉంది", "లేదు, ఇతర సమస్యలు లేవు"]
        else:
            return "Thank you for sharing that. Are you also experiencing any associated symptoms like fever, nausea, or shortness of breath?", ["Yes, fever", "Yes, breathlessness", "No other symptoms"]

    def _generate_quick_options(self, missing_slots: List[str], language: str) -> List[str]:
        if not missing_slots:
            return ["सब ठीक है (Everything noted)", "डॉक्टर से मिलना है (Ready to see doctor)"]
        if "Radiation" in missing_slots[0]:
            return ["बाएं हाथ में दर्द जा रहा है", "सिर्फ छाती में है", "पीठ में जाता है"]
        if "Severity" in missing_slots[0]:
            return ["1-3 (हल्का)", "4-6 (मध्यम)", "7-10 (बहुत तेज)"]
        return ["हाँ", "नहीं", "कभी-कभी"]


dialogue_engine = DialogueEngineService()
