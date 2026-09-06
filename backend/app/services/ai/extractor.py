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
from app.services.ai.clinical_nlu_model import clinical_nlu

logger = logging.getLogger(__name__)


def clean_json_text(raw_text: str) -> str:
    """Extracts and cleans raw JSON from LLM output."""
    if not raw_text:
        return "{}"
    t = raw_text.strip()
    if "```" in t:
        match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", t)
        if match:
            t = match.group(1).strip()
    first_brace = t.find("{")
    last_brace = t.rfind("}")
    if first_brace != -1 and last_brace != -1 and last_brace > first_brace:
        t = t[first_brace:last_brace + 1]
    return t


class ClinicalExtractorService:
    """Structured clinical entity extractor with trained local NLU fallback."""

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

    async def extract_clinical_entities(self, transcript: str, current_state: Optional[Dict[str, Any]] = None) -> ExtractionPayload:
        """
        Extracts structured clinical facts from transcript into strict Pydantic ExtractionPayload.
        Uses trained local NLU directly or fast Groq/OpenAI.
        """
        if not transcript or not transcript.strip():
            return ExtractionPayload()

        # 1. Fast Groq LLaMA-3.1-8B-Instant
        if settings.GROQ_API_KEY or self.groq_client:
            try:
                return await self._extract_via_groq(transcript)
            except Exception as e:
                logger.debug(f"ClinicalExtractor: Groq extraction skipped: {e}")

        # 2. OpenAI GPT-4o-mini
        if settings.OPENAI_API_KEY or self.openai_client:
            try:
                return await self._extract_via_openai(transcript)
            except Exception as e:
                logger.debug(f"ClinicalExtractor: OpenAI extraction skipped: {e}")

        # 3. High-Speed Trained Multilingual NLU Model (< 3ms)
        return clinical_nlu.extract_slots_fast(transcript, current_state=current_state)

    async def _extract_via_groq(self, transcript: str) -> ExtractionPayload:
        client = self.groq_client
        if not client:
            raise ValueError("Groq client not configured")

        user_content = f"""Patient Transcript:
\"\"\"{transcript}\"\"\"

Target JSON Schema format:
{EXTRACTION_JSON_SCHEMA_HINT}

Respond ONLY with valid JSON."""

        models_to_try = ["llama-3.1-8b-instant", "llama-3.3-70b-versatile"]
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
                    response_format={"type": "json_object"}
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


clinical_extractor = ClinicalExtractorService()
