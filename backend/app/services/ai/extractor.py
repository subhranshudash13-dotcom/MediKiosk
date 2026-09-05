import json
import logging
import re
from typing import Optional, Dict, Any
from groq import AsyncGroq
import httpx
try:
    from openai import AsyncOpenAI
except ImportError:
    AsyncOpenAI = None

from app.core.config import settings
from app.services.ai.schemas import ExtractionPayload
from app.services.ai.prompts import STRUCTURED_EXTRACTION_SYSTEM_PROMPT, EXTRACTION_JSON_SCHEMA_HINT
from app.services.ai.safety_guardrails import safety_guardrails

logger = logging.getLogger(__name__)


def clean_json_text(raw_text: str) -> str:
    """Extracts and cleans raw JSON from LLM output (handling markdown ticks, preambles, etc.)."""
    if not raw_text:
        return "{}"
    t = raw_text.strip()
    # Strip markdown ```json ... ```
    if "```" in t:
        match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", t)
        if match:
            t = match.group(1).strip()
    # Extract first JSON object bounds if extra text exists
    first_brace = t.find("{")
    last_brace = t.rfind("}")
    if first_brace != -1 and last_brace != -1 and last_brace > first_brace:
        t = t[first_brace:last_brace + 1]
    return t


class ClinicalExtractorService:
    """Zero-hallucination structured clinical entity extractor using OpenAI, Groq, or local Ollama."""

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

    async def extract_clinical_entities(self, transcript: str, current_state: Optional[Dict[str, Any]] = None) -> ExtractionPayload:
        """
        Extracts structured clinical facts from transcript into strict Pydantic ExtractionPayload.
        Falls back through Groq -> OpenAI -> Gemini -> Ollama -> Rule-based fallback.
        """
        if not transcript or not transcript.strip():
            return ExtractionPayload()

        # 1. Try Groq Cloud (Ultra-fast and highly accurate)
        if settings.GROQ_API_KEY or self.groq_client:
            try:
                return await self._extract_via_groq(transcript)
            except Exception as e:
                logger.warning(f"ClinicalExtractor: Groq extraction failed ({e}), trying OpenAI/Gemini.")

        # 2. Try OpenAI (GPT-4o-mini)
        if settings.OPENAI_API_KEY or self.openai_client:
            try:
                return await self._extract_via_openai(transcript)
            except Exception as e:
                logger.warning(f"ClinicalExtractor: OpenAI extraction failed ({e}), attempting Ollama fallback.")

        # 3. Try Local Ollama (100% offline)
        if await self._check_ollama_available():
            try:
                return await self._extract_via_ollama(transcript)
            except Exception as e:
                logger.warning(f"ClinicalExtractor: Ollama extraction failed ({e}), using deterministic heuristic.")

        # 4. Deterministic Heuristic Fallback
        return self._extract_heuristic_fallback(transcript)

    async def _extract_via_groq(self, transcript: str) -> ExtractionPayload:
        client = self.groq_client
        if not client:
            raise ValueError("Groq client not configured")

        user_content = f"""Patient Transcript:
\"\"\"{transcript}\"\"\"

Target JSON Schema format:
{EXTRACTION_JSON_SCHEMA_HINT}

Respond ONLY with valid JSON."""

        models_to_try = ["qwen/qwen3.8-27b", "openai/gpt-oss-120b", "openai/gpt-oss-20b", "qwen/qwen3.6-27b"]
        last_err = None
        for model_name in models_to_try:
            try:
                response = await client.chat.completions.create(
                    model=model_name,
                    messages=[
                        {"role": "system", "content": STRUCTURED_EXTRACTION_SYSTEM_PROMPT},
                        {"role": "user", "content": user_content},
                    ],
                    temperature=0.0,
                )
                raw_json = clean_json_text(response.choices[0].message.content or "{}")
                parsed = json.loads(raw_json)
                payload = ExtractionPayload(**parsed)
                safety_guardrails.validate_extraction(payload)
                return payload
            except Exception as err:
                last_err = err
                continue

        if last_err:
            raise last_err
        raise ValueError("All Groq extraction models failed")

    async def _extract_via_openai(self, transcript: str) -> ExtractionPayload:
        client = self.openai_client
        if not client:
            raise ValueError("OpenAI client not configured")

        user_content = f"""Patient Transcript:
\"\"\"{transcript}\"\"\"

Target JSON Schema format:
{EXTRACTION_JSON_SCHEMA_HINT}

Respond ONLY with valid JSON."""

        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": STRUCTURED_EXTRACTION_SYSTEM_PROMPT},
                {"role": "user", "content": user_content},
            ],
            temperature=0.0,
        )
        raw_json = clean_json_text(response.choices[0].message.content or "{}")
        parsed = json.loads(raw_json)
        payload = ExtractionPayload(**parsed)
        safety_guardrails.validate_extraction(payload)
        return payload

    async def _extract_via_ollama(self, transcript: str) -> ExtractionPayload:
        user_content = f"""Patient Transcript:
\"\"\"{transcript}\"\"\"

Target JSON Schema format:
{EXTRACTION_JSON_SCHEMA_HINT}

Respond ONLY with valid JSON."""

        async with httpx.AsyncClient(timeout=2.0) as http_client:
            resp = await http_client.post(
                f"{settings.OLLAMA_BASE_URL}/api/chat",
                json={
                    "model": "qwen2.5:7b-instruct",
                    "format": "json",
                    "messages": [
                        {"role": "system", "content": STRUCTURED_EXTRACTION_SYSTEM_PROMPT},
                        {"role": "user", "content": user_content}
                    ],
                    "stream": False,
                    "options": {"temperature": 0.1}
                }
            )
            resp.raise_for_status()
            data = resp.json()
            raw_json = clean_json_text(data.get("message", {}).get("content", "{}"))
            parsed = json.loads(raw_json)
            return ExtractionPayload(**parsed)

    def _extract_heuristic_fallback(self, transcript: str) -> ExtractionPayload:
        """Deterministic regex-based fallback for Indian multilingual inputs."""
        text_lower = transcript.lower()
        payload = ExtractionPayload(chief_complaint=transcript[:120], extraction_confidence=0.75)

        # Detect duration
        duration_match = re.search(r"(\d+)\s*(din|days?|mahine|months?|hafte|weeks?|rojulu|rojula)", text_lower)
        if duration_match:
            val = int(duration_match.group(1))
            unit = duration_match.group(2)
            if any(k in unit for k in ["din", "day", "roju"]):
                payload.duration_days = val
            elif any(k in unit for k in ["hafte", "week"]):
                payload.duration_days = val * 7
            elif any(k in unit for k in ["mahine", "month"]):
                payload.duration_days = val * 30
            payload.time_course = f"{val} {unit}"

        # Detect severity score (1-10)
        sev_match = re.search(r"(10\s*(?:mein|me|lo|out\s*of)\s*(?:se\s*)?(\d+)|(?:score|severity|scale|rate|rating|dard)\s*(?:is\s*)?(\d+)\s*(?:/|out\s*of)\s*10|(\d+)\s*/\s*10)", text_lower)
        if sev_match:
            num = sev_match.group(2) or sev_match.group(3) or (sev_match.group(4) and sev_match.group(4).split("/")[0])
            if num:
                try:
                    s_val = int(num.strip())
                    if 1 <= s_val <= 10:
                        payload.severity_score = s_val
                except ValueError:
                    pass

        # Detect site / anatomical region
        if any(k in text_lower for k in ["chest", "chhati", "seene", "chhatilo", "छाती", "सीना", "ఛాతీ"]):
            payload.site = "Chest"
        elif any(k in text_lower for k in ["stomach", "pet", "abdomen", "kadupu", "पेट", "కడుపు"]):
            payload.site = "Abdomen/Stomach"
        elif any(k in text_lower for k in ["head", "sar", "sir", "tala", "सिर", "सर", "తల"]):
            payload.site = "Head"
        elif any(k in text_lower for k in ["throat", "gala", "gontu", "गला", "గొంతు"]):
            payload.site = "Throat"
        elif any(k in text_lower for k in ["back", "peeth", "venuka", "कमर", "पीठ"]):
            payload.site = "Back/Spine"
        elif any(k in text_lower for k in ["leg", "pair", "kaalu", "टांग", "पैर"]):
            payload.site = "Lower Limbs"

        # Detect radiation
        if any(k in text_lower for k in ["left arm", "baaye hath", "baye hath", "edama cheyi", "बाएं हाथ", "ఎడమ చేయి"]):
            payload.radiation = "Left Arm"
        elif any(k in text_lower for k in ["jaw", "jabde", "davada", "जबड़े"]):
            payload.radiation = "Jaw"
        elif any(k in text_lower for k in ["back", "peeth", "venuka", "पीठ"]):
            payload.radiation = "Back"

        # Detect character
        if any(k in text_lower for k in ["sharp", "tez", "teevram", "चुभन", "तेज"]):
            payload.character = "Sharp / Severe"
        elif any(k in text_lower for k in ["heavy", "bhaari", "pressure", "dabav", "भारीपन", "दबाव"]):
            payload.character = "Heavy / Crushing Pressure"
        elif any(k in text_lower for k in ["burning", "jalan", "manta", "जलन"]):
            payload.character = "Burning"

        # Detect symptoms
        symptoms = []
        if any(k in text_lower for k in ["chest pain", "chhati me dard", "seene mein dard", "छाती में दर्द", "ఛాతీ నొప్పి"]):
            symptoms.append("Chest pain")
        if any(k in text_lower for k in ["fever", "bukhar", "jwaram", "ताप", "बुखार", "జ్వరం"]):
            symptoms.append("Fever")
        if any(k in text_lower for k in ["cough", "khansi", "daggu", "खांसी", "దగ్గు"]):
            symptoms.append("Cough")
        if any(k in text_lower for k in ["headache", "sar dard", "sir dard", "talanopi", "सिर दर्द", "తలనొప్పి"]):
            symptoms.append("Headache")
        if any(k in text_lower for k in ["vomiting", "ulti", "vanti", "उल्टी", "వాంతులు"]):
            symptoms.append("Vomiting")
        if any(k in text_lower for k in ["sweat", "paseena", "chemata", "पसीना"]):
            symptoms.append("Diaphoresis (Sweating)")
        if any(k in text_lower for k in ["breath", "saans", "oosiri", "सांस फूलना", "శ్వాస"]):
            symptoms.append("Dyspnea (Shortness of breath)")

        payload.associated_symptoms = symptoms
        return payload


clinical_extractor = ClinicalExtractorService()
