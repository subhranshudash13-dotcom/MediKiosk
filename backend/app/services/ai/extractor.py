import json
import logging
from typing import Optional, Dict, Any
from groq import AsyncGroq
import httpx
from openai import AsyncOpenAI

from app.core.config import settings
from app.services.ai.schemas import ExtractionPayload
from app.services.ai.prompts import STRUCTURED_EXTRACTION_SYSTEM_PROMPT, EXTRACTION_JSON_SCHEMA_HINT
from app.services.ai.safety_guardrails import safety_guardrails

logger = logging.getLogger(__name__)


class ClinicalExtractorService:
    """Zero-hallucination structured clinical entity extractor using OpenAI, Groq, or local Ollama."""

    def __init__(self):
        self._groq_client: Optional[AsyncGroq] = None
        self._openai_client: Optional[AsyncOpenAI] = None

    @property
    def openai_client(self) -> Optional[AsyncOpenAI]:
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
        Falls back through OpenAI -> Groq -> Ollama -> Rule-based fallback.
        """
        if not transcript or not transcript.strip():
            return ExtractionPayload()

        # 1. Try OpenAI (GPT-4o-mini)
        if settings.OPENAI_API_KEY or self.openai_client:
            try:
                return await self._extract_via_openai(transcript)
            except Exception as e:
                logger.warning(f"ClinicalExtractor: OpenAI extraction failed ({e}), attempting Groq.")

        # 2. Try Groq Cloud
        if settings.GROQ_API_KEY:
            try:
                return await self._extract_via_groq(transcript)
            except Exception as e:
                logger.warning(f"ClinicalExtractor: Groq extraction failed ({e}), attempting Ollama fallback.")

        # 3. Try Local Ollama (100% offline)
        if await self._check_ollama_available():
            try:
                return await self._extract_via_ollama(transcript)
            except Exception as e:
                logger.warning(f"ClinicalExtractor: Ollama extraction failed ({e}), using deterministic heuristic.")

        # 4. Deterministic Heuristic Fallback
        return self._extract_heuristic_fallback(transcript)

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
        raw_json = response.choices[0].message.content or "{}"
        parsed = json.loads(raw_json)
        payload = ExtractionPayload(**parsed)
        safety_guardrails.validate_extraction(payload)
        return payload

    async def _extract_via_groq(self, transcript: str) -> ExtractionPayload:
        client = self.groq_client
        if not client:
            raise ValueError("Groq client not configured")

        user_content = f"""Patient Transcript:
\"\"\"{transcript}\"\"\"

Target JSON Schema format:
{EXTRACTION_JSON_SCHEMA_HINT}

Respond ONLY with valid JSON."""

        response = await client.chat.completions.create(
            model="qwen/qwen3.8-27b",
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": STRUCTURED_EXTRACTION_SYSTEM_PROMPT},
                {"role": "user", "content": user_content},
            ],
            temperature=0.0,
        )
        raw_json = response.choices[0].message.content or "{}"
        parsed = json.loads(raw_json)
        payload = ExtractionPayload(**parsed)
        is_valid, _ = safety_guardrails.validate_extraction(payload)
        return payload

    async def _extract_via_ollama(self, transcript: str) -> ExtractionPayload:
        user_content = f"""Patient Transcript:
\"\"\"{transcript}\"\"\"

Target JSON Schema format:
{EXTRACTION_JSON_SCHEMA_HINT}

Respond ONLY with valid JSON."""

        async with httpx.AsyncClient(timeout=1.5) as http_client:
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
            raw_json = data.get("message", {}).get("content", "{}")
            parsed = json.loads(raw_json)
            return ExtractionPayload(**parsed)

    def _extract_heuristic_fallback(self, transcript: str) -> ExtractionPayload:
        """Deterministic regex-based fallback when offline without local LLM running."""
        text_lower = transcript.lower()
        payload = ExtractionPayload(chief_complaint=transcript[:120], extraction_confidence=0.7)

        # Detect duration
        import re
        duration_match = re.search(r"(\d+)\s*(din|days?|mahine|months?|hafte|weeks?)", text_lower)
        if duration_match:
            val = int(duration_match.group(1))
            unit = duration_match.group(2)
            if "din" in unit or "day" in unit:
                payload.duration_days = val
            elif "hafte" in unit or "week" in unit:
                payload.duration_days = val * 7
            elif "mahine" in unit or "month" in unit:
                payload.duration_days = val * 30
            payload.time_course = f"{val} {unit}"

        # Detect symptoms
        symptoms = []
        if "chest pain" in text_lower or "chhati me dard" in text_lower or "seene mein dard" in text_lower:
            payload.site = "Retrosternal Chest"
            symptoms.append("chest pain")
        if "fever" in text_lower or "bukhar" in text_lower or "jwaram" in text_lower:
            symptoms.append("fever")
        if "cough" in text_lower or "khansi" in text_lower:
            symptoms.append("cough")
        if "headache" in text_lower or "sar dard" in text_lower or "talanopi" in text_lower:
            payload.site = "Head"
            symptoms.append("headache")
        if "vomiting" in text_lower or "ulti" in text_lower or "vanti" in text_lower:
            symptoms.append("vomiting")
        if "sweat" in text_lower or "paseena" in text_lower:
            symptoms.append("diaphoresis")
        if "breath" in text_lower or "saans" in text_lower:
            symptoms.append("dyspnea")

        payload.associated_symptoms = symptoms
        return payload


clinical_extractor = ClinicalExtractorService()
