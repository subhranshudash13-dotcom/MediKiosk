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
        if not state.socrates.onset and state.socrates.duration_days is None:
            missing_slots.append("Onset and duration (when it started)")
        if not state.socrates.character:
            missing_slots.append("Quality/character of symptom (sharp, burning, heavy, dull)")
        if not state.socrates.radiation:
            missing_slots.append("Radiation to another area (arm, jaw, back, shoulder)")
        if not state.socrates.severity_score:
            missing_slots.append("Severity score (1-10)")
        if not state.associated_symptoms:
            missing_slots.append("Associated symptoms (fever, breathlessness, nausea)")

        spoken_text = ""
        quick_options = []

        # 1. Try Groq Cloud (Ultra-fast and high quality)
        if settings.GROQ_API_KEY or self.groq_client:
            try:
                spoken_text, quick_options = await self._generate_via_groq(
                    transcript, state, extracted, missing_slots, conversation_history
                )
            except Exception as e:
                logger.warning(f"DialogueEngine: Groq generation failed ({e}), trying OpenAI/Gemini.")

        # 2. Try OpenAI (if credits available)
        if not spoken_text and (settings.OPENAI_API_KEY or self.openai_client):
            try:
                spoken_text, quick_options = await self._generate_via_openai(
                    transcript, state, extracted, missing_slots, conversation_history
                )
            except Exception as e:
                logger.warning(f"DialogueEngine: OpenAI generation failed ({e}), trying Gemini.")

        # 3. Try Gemini Free Tier
        if not spoken_text and settings.GEMINI_API_KEY:
            try:
                spoken_text, quick_options = await self._generate_via_gemini(
                    transcript, state, extracted, missing_slots, conversation_history
                )
            except Exception as e:
                logger.warning(f"DialogueEngine: Gemini generation failed ({e}), trying Ollama.")

        # 4. Try Local Ollama
        if not spoken_text and await self._check_ollama_available():
            try:
                spoken_text, quick_options = await self._generate_via_ollama(
                    transcript, state, extracted, missing_slots, conversation_history
                )
            except Exception as e:
                logger.warning(f"DialogueEngine: Ollama generation failed ({e}), using dynamic fallback.")

        # 5. Deterministic fallback
        if not spoken_text:
            spoken_text, quick_options = self._generate_dynamic_fallback(
                transcript, state, extracted, missing_slots
            )

        sanitized_text = safety_guardrails.sanitize_model_output(spoken_text, language=state.language)

        return {
            "spoken_response": sanitized_text,
            "quick_replies": quick_options or self._generate_quick_options(missing_slots, state.language),
            "missing_slots": missing_slots
        }

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
- Patient Preferred Language: {state.language} (Respond naturally in this language: Hindi/Telugu/English/Hinglish/Tamil)

Patient just said:
\"{transcript}\"

Instructions:
1. Empathize and acknowledge what the patient said in 1 short sentence.
2. If the patient asked a question (e.g. for pills or diagnosis), address it gently and reassure them that the doctor will examine them.
3. Ask ONE focused, natural clinical follow-up question in their language exploring the most relevant missing clinical dimension.
4. Keep the total response strictly to 1-2 warm, conversational sentences.
"""

        messages = [{"role": "system", "content": CLINICAL_INTAKE_SYSTEM_PROMPT}]
        for turn in conversation_history[-4:]:
            messages.append(turn)
        messages.append({"role": "user", "content": context_prompt})

        models_to_try = ["qwen/qwen3.8-27b", "openai/gpt-oss-120b", "openai/gpt-oss-20b", "qwen/qwen3.6-27b"]
        last_err = None
        for model_name in models_to_try:
            try:
                response = await client.chat.completions.create(
                    model=model_name,
                    messages=messages,
                    temperature=0.3,
                    max_tokens=180,
                )
                content = (response.choices[0].message.content or "").strip()
                if content:
                    quick_options = self._generate_quick_options(missing_slots, state.language)
                    return content, quick_options
            except Exception as err:
                last_err = err
                continue

        if last_err:
            raise last_err
        raise ValueError("All Groq dialogue models failed")

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
Acknowledge with empathy and ask 1 focused triage question in {state.language} exploring missing slots. Keep under 2 sentences."""

        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.post(url, json={
                "contents": [{"parts": [{"text": user_prompt}]}]
            })
            resp.raise_for_status()
            data = resp.json()
            content = data["candidates"][0]["content"]["parts"][0]["text"].strip()
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

        async with httpx.AsyncClient(timeout=2.0) as http_client:
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
        lang = state.language or "hi"
        missing_str = " ".join(missing_slots)

        # 1. Location missing
        if "location" in missing_str.lower():
            if lang == "hi" or "hindi" in lang or "hinglish" in lang:
                return "मैं समझ गया। कृपया बताएं कि यह दर्द या तकलीफ़ शरीर के किस हिस्से में हो रही है?", ["छाती में (Chest)", "पेट में (Stomach)", "सिर में (Head)", "गले में (Throat)"]
            elif lang == "te":
                return "నేను అర్థం చేసుకున్నాను. దయచేసి ఈ నొప్పి లేదా అసౌకర్యం శరీరంలో ఎక్కడ ఉంది?", ["ఛాతీలో (Chest)", "కడుపులో (Stomach)", "తలలో (Head)"]
            else:
                return "Understood. Could you please tell me exactly where on your body you are feeling this discomfort?", ["Chest", "Stomach / Abdomen", "Head", "Back"]

        # 2. Duration / Onset missing
        if "onset" in missing_str.lower() or "duration" in missing_str.lower():
            if lang == "hi" or "hindi" in lang or "hinglish" in lang:
                return "मैंने आपकी परेशानी नोट कर ली है। यह तकलीफ़ कब से हो रही है और क्या यह अचानक शुरू हुई थी?", ["आज से शुरू हुई", "2-3 दिन से", "1 हफ्ते से अधिक"]
            elif lang == "te":
                return "మీరు చెప్పినది నమోదు చేశాను. ఈ సమస్య ఎప్పటి నుండి ఉంది మరియు హఠాత్తుగా మొదలైందా?", ["ఈ రోజు నుండి", "2-3 రోజుల నుండి", "వారం పైగా"]
            else:
                return "I have noted your complaint. How long have you had this symptom, and did it start suddenly or gradually?", ["Started today", "2-3 days", "Over a week"]

        # 3. Radiation missing
        if "radiation" in missing_str.lower():
            if lang == "hi" or "hindi" in lang or "hinglish" in lang:
                return "क्या यह दर्द आपके कंधे, बाएं हाथ, जबड़े या पीठ की तरफ भी फैल रहा है?", ["हाँ, बाएं हाथ में जा रहा है", "नहीं, सिर्फ एक ही जगह है", "पीठ की तरफ जाता है"]
            elif lang == "te":
                return "ఈ నొప్పి మీ ఎడమ చేయి, దవడ లేదా వెనుక భాగానికి వ్యాపిస్తుందా?", ["అవును, ఎడమ చేతికి వ్యాపిస్తుంది", "లేదు, ఒకే చోట ఉంది"]
            else:
                return "Does this pain spread anywhere else, such as to your left arm, shoulder, jaw, or back?", ["Yes, to left arm", "No, stays in one place", "Spreads to back"]

        # 4. Severity missing
        if "severity" in missing_str.lower():
            if lang == "hi" or "hindi" in lang or "hinglish" in lang:
                return "1 से 10 के पैमाने पर आप इस दर्द या परेशानी को कितना गंभीर मानेंगे?", ["1-3 (हल्का)", "4-6 (मध्यम)", "7-10 (बहुत तेज)"]
            elif lang == "te":
                return "1 నుండి 10 స్కేలులో మీ నొప్పి తీవ్రత ఎంతగా ఉంది?", ["1-3 (తేలికపాటి)", "4-6 (మధ్యస్థం)", "7-10 (తీవ్రం)"]
            else:
                return "On a scale of 1 to 10, how severe is this pain or discomfort right now?", ["1-3 (Mild)", "4-6 (Moderate)", "7-10 (Severe)"]

        # Default symptom check
        if lang == "hi" or "hindi" in lang or "hinglish" in lang:
            return "आपकी जानकारी नोट कर ली गई है। क्या इसके साथ आपको बुखार, उल्टी या सांस फूलने जैसी कोई और तकलीफ़ भी है?", ["हाँ, बुखार है", "हाँ, सांस फूल रही है", "नहीं, और कोई तकलीफ़ नहीं"]
        elif lang == "te":
            return "మీ వివరాలు నమోదు చేశాను. దీనితో పాటు జ్వరం, వాంతులు లేదా శ్వాస తీసుకోవడంలో ఇబ్బంది ఉందా?", ["అవును, జ్వరం ఉంది", "అవును, శ్వాస ఆడటం లేదు", "లేదు, ఇతర సమస్యలు లేవు"]
        else:
            return "Thank you for sharing that. Are you also experiencing any fever, nausea, or shortness of breath?", ["Yes, fever", "Yes, shortness of breath", "No other symptoms"]

    def _generate_quick_options(self, missing_slots: List[str], language: str) -> List[str]:
        lang = language or "hi"
        if not missing_slots:
            if lang == "hi" or "hinglish" in lang:
                return ["सब ठीक है (All noted)", "डॉक्टर से मिलना है (Ready)"]
            elif lang == "te":
                return ["అంతా నమోదైంది", "డాక్టర్ కోసం సిద్ధం"]
            else:
                return ["All noted", "Ready to see doctor"]

        first_slot = missing_slots[0].lower()
        if "location" in first_slot:
            if lang == "hi" or "hinglish" in lang:
                return ["छाती में", "पेट में", "सिर में", "गले में"]
            elif lang == "te":
                return ["ఛాతీలో", "కడుపులో", "తలలో"]
            else:
                return ["Chest", "Stomach", "Head", "Throat"]

        if "radiation" in first_slot:
            if lang == "hi" or "hinglish" in lang:
                return ["बाएं हाथ में जा रहा है", "सिर्फ छाती में है", "पीठ में जाता है"]
            elif lang == "te":
                return ["ఎడమ చేతికి వ్యాపిస్తుంది", "కేవలం ఛాతీలోనే ఉంది", "వెనుక భాగం"]
            else:
                return ["Radiates to left arm", "Chest only", "Radiates to back"]

        if "severity" in first_slot:
            if lang == "hi" or "hinglish" in lang:
                return ["1-3 (हल्का)", "4-6 (मध्यम)", "7-10 (बहुत तेज)"]
            elif lang == "te":
                return ["1-3 (తేలికపాటి)", "4-6 (మధ్యస్థం)", "7-10 (తీవ్రం)"]
            else:
                return ["1-3 (Mild)", "4-6 (Moderate)", "7-10 (Severe)"]

        if "onset" in first_slot or "duration" in first_slot:
            if lang == "hi" or "hinglish" in lang:
                return ["आज से", "2-3 दिन से", "1 हफ्ते से"]
            elif lang == "te":
                return ["ఈ రోజు నుండి", "2-3 రోజుల నుండి", "వారం నుండి"]
            else:
                return ["Today", "2-3 days", "Over a week"]

        if lang == "hi" or "hinglish" in lang:
            return ["हाँ", "नहीं", "कभी-कभी"]
        elif lang == "te":
            return ["అవును", "లేదు", "కొన్నిసార్లు"]
        else:
            return ["Yes", "No", "Occasionally"]


dialogue_engine = DialogueEngineService()
