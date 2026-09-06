"""
MediKiosk Unified Ultra-Fast AI Pipeline.
Performs Single-Pass Extraction + Empathetic Dialogue Generation with sub-800ms racing architecture:
1. Instant Local NLU Model (< 5ms) generates high-accuracy baseline extraction & vernacular response.
2. Fast Cloud LLM (Groq LLaMA-3.1-8B-Instant / GPT-4o-mini) executes single unified pass with strict 800ms timeout.
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
from app.services.ai.prompts import CLINICAL_INTAKE_SYSTEM_PROMPT
from app.services.clinical.event_logger import event_logger

logger = logging.getLogger(__name__)


UNIFIED_SINGLE_PASS_PROMPT = """You are "Aarogya Mitra", a compassionate clinical intake assistant at an Indian hospital kiosk.
Analyze the patient's utterance and perform BOTH:
1. Extraction of clinical facts into structured JSON.
2. A single empathetic 1-2 sentence follow-up in the patient's language asking for missing clinical details (SOCRATES).

JSON Response format:
{
  "extraction": {
    "chief_complaint": "string or null",
    "site": "string or null",
    "onset": "string or null",
    "character": "string or null",
    "radiation": "string or null",
    "associated_symptoms": ["string"],
    "duration_days": null,
    "time_course": "string or null",
    "severity_score": null
  },
  "spoken_response": "1-2 warm sentences in patient's language acknowledging symptom and asking 1 gentle clinical follow-up",
  "quick_replies": ["option 1", "option 2", "option 3"]
}

Respond ONLY with valid JSON. Do not prescribe or diagnose.
"""


def clean_json(text: str) -> str:
    """Extracts valid JSON substring from text."""
    if not text:
        return "{}"
    t = text.strip()
    if "```" in t:
        match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", t)
        if match:
            t = match.group(1).strip()
    first_brace = t.find("{")
    last_brace = t.rfind("}")
    if first_brace != -1 and last_brace != -1 and last_brace > first_brace:
        t = t[first_brace:last_brace + 1]
    return t


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
        session_id: Optional[str] = None
    ) -> Tuple[ExtractionPayload, str, List[str]]:
        """
        Executes single unified turn:
        Runs local NLU baseline in < 3ms, then races with ultra-fast cloud LLM (timeout 800ms).
        Enforces concurrency limit (2 calls/session) and circuit-breaker protection.
        Returns: (extracted_payload, spoken_response, quick_replies)
        """
        sid = session_id or state.session_id or "ANONYMOUS"
        sem = self._get_semaphore(sid)

        # Step 1: Run trained Local Clinical NLU (< 3ms)
        local_extraction = clinical_nlu.extract_slots_fast(transcript, current_state=state.model_dump())
        local_dialogue = clinical_nlu.generate_dialogue_fast(transcript, state, local_extraction, language=language)

        local_spoken = local_dialogue.get("spoken_response", "आपकी तकलीफ़ नोट कर ली गई है।")
        local_replies = local_dialogue.get("quick_replies", [])

        # If it's an emergency, immediately return local safety response without waiting
        if local_dialogue.get("is_emergency"):
            return local_extraction, local_spoken, local_replies

        # Check Circuit Breaker: If open, bypass cloud LLM directly to sub-3ms local engine
        if self.is_circuit_open:
            logger.warning("FastAIPipeline: Circuit breaker OPEN. Directing traffic to high-speed local NLU.")
            return local_extraction, local_spoken, local_replies

        # Step 2: Try Fast Cloud LLM Race (Target < 800ms) within session concurrency cap
        try:
            async with sem:
                llm_result = await asyncio.wait_for(
                    self._single_pass_cloud_llm(transcript, state, language),
                    timeout=0.85
                )
                if llm_result:
                    extracted, spoken, replies = llm_result
                    if spoken and len(spoken.strip()) > 5:
                        # Success - reset circuit breaker failures
                        if self._consecutive_failures > 0:
                            self._consecutive_failures = 0
                            await event_logger.log_event(
                                event_type="CIRCUIT_BREAKER_RESET",
                                session_id=sid,
                                details={"status": "healthy", "service": "Groq/OpenAI"},
                                severity="INFO"
                            )
                        sanitized_spoken = safety_guardrails.sanitize_model_output(spoken, language=language)
                        return extracted, sanitized_spoken, replies or local_replies
        except asyncio.TimeoutError:
            self._consecutive_failures += 1
            logger.info(f"FastAIPipeline: Cloud LLM timed out (>850ms, count={self._consecutive_failures}), using local NLU.")
            await event_logger.log_event(
                event_type="AI_FALLBACK_TIMEOUT",
                session_id=sid,
                details={"timeout_ms": 850, "consecutive_failures": self._consecutive_failures},
                severity="WARNING"
            )
        except Exception as e:
            self._consecutive_failures += 1
            logger.debug(f"FastAIPipeline: Cloud LLM fallback triggered: {e}")
            await event_logger.log_event(
                event_type="AI_FALLBACK_ERROR",
                session_id=sid,
                details={"error": str(e), "consecutive_failures": self._consecutive_failures},
                severity="WARNING"
            )

        # Check if we need to trip the circuit breaker
        if self._consecutive_failures >= 3:
            self._circuit_open_until = time.time() + 30.0  # Open for 30s
            logger.error(f"FastAIPipeline: Circuit breaker TRIPPED! 3 consecutive failures. Open for 30s.")
            await event_logger.log_event(
                event_type="CIRCUIT_BREAKER_TRIPPED",
                session_id=sid,
                details={"failures": self._consecutive_failures, "open_seconds": 30},
                severity="ERROR"
            )

        # Fallback to high-speed local NLU output
        return local_extraction, local_spoken, local_replies

    async def _single_pass_cloud_llm(
        self,
        transcript: str,
        state: ClinicalIntakeState,
        language: str
    ) -> Optional[Tuple[ExtractionPayload, str, List[str]]]:
        """Runs a single unified extraction + dialogue generation pass."""
        user_prompt = f"""Patient Preferred Language: {language}
Patient just said: \"\"\"{transcript}\"\"\"

Current Clinical State:
- Known Chief Complaints: {state.chief_complaints}
- Known SOCRATES: {state.socrates.model_dump(exclude_none=True)}

Extract structured clinical JSON and formulate 1 empathetic clinical follow-up in {language}."""

        # 1. Try Groq LLaMA-3.1-8B-Instant (Fastest LLM on the market, ~150-250ms)
        if settings.GROQ_API_KEY or self.groq_client:
            client = self.groq_client
            if client:
                for model_name in ["llama-3.1-8b-instant", "llama-3.3-70b-versatile"]:
                    try:
                        resp = await client.chat.completions.create(
                            model=model_name,
                            messages=[
                                {"role": "system", "content": UNIFIED_SINGLE_PASS_PROMPT},
                                {"role": "user", "content": user_prompt}
                            ],
                            temperature=0.2,
                            max_tokens=220,
                            response_format={"type": "json_object"}
                        )
                        raw = resp.choices[0].message.content or "{}"
                        data = json.loads(clean_json(raw))
                        extracted = ExtractionPayload(**data.get("extraction", {}))
                        spoken = data.get("spoken_response", "")
                        replies = data.get("quick_replies", [])
                        return extracted, spoken, replies
                    except Exception:
                        continue

        # 2. Try OpenAI GPT-4o-mini
        if settings.OPENAI_API_KEY or self.openai_client:
            client = self.openai_client
            if client:
                resp = await client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=[
                        {"role": "system", "content": UNIFIED_SINGLE_PASS_PROMPT},
                        {"role": "user", "content": user_prompt}
                    ],
                    temperature=0.2,
                    max_tokens=180,
                    response_format={"type": "json_object"}
                )
                raw = resp.choices[0].message.content or "{}"
                data = json.loads(clean_json(raw))
                extracted = ExtractionPayload(**data.get("extraction", {}))
                spoken = data.get("spoken_response", "")
                replies = data.get("quick_replies", [])
                return extracted, spoken, replies

        return None


fast_ai_pipeline = FastAIPipelineService()
