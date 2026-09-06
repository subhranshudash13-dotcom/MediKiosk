import logging
from typing import Dict, Any, List, Optional
from groq import AsyncGroq
try:
    from openai import AsyncOpenAI
except ImportError:
    AsyncOpenAI = None

from app.core.config import settings
from app.services.ai.schemas import ClinicalIntakeState, ExtractionPayload
from app.services.ai.prompts import CLINICAL_INTAKE_SYSTEM_PROMPT
from app.services.ai.safety_guardrails import safety_guardrails
from app.services.ai.clinical_nlu_model import clinical_nlu

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

    async def generate_response(
        self,
        transcript: str,
        state: ClinicalIntakeState,
        extracted: ExtractionPayload,
        conversation_history: List[Dict[str, str]]
    ) -> Dict[str, Any]:
        """
        Generates dynamic, empathetic triage inquiry and quick reply options based on current intake state.
        Uses trained local NLU model with Groq LLaMA-3.1-8B-Instant fallback.
        """
        # 1. Try Groq Cloud (Ultra-fast LLaMA-3.1-8B-Instant)
        if settings.GROQ_API_KEY or self.groq_client:
            try:
                spoken_text, quick_options = await self._generate_via_groq(
                    transcript, state, extracted, conversation_history
                )
                if spoken_text:
                    sanitized = safety_guardrails.sanitize_model_output(spoken_text, language=state.language)
                    return {
                        "spoken_response": sanitized,
                        "quick_replies": quick_options
                    }
            except Exception as e:
                logger.debug(f"DialogueEngine: Groq generation skipped ({e})")

        # 2. High-Speed Local Trained NLU Model (< 3ms)
        local_output = clinical_nlu.generate_dialogue_fast(
            transcript=transcript,
            state=state,
            extracted=extracted,
            language=state.language
        )
        return local_output

    async def _generate_via_groq(
        self,
        transcript: str,
        state: ClinicalIntakeState,
        extracted: ExtractionPayload,
        conversation_history: List[Dict[str, str]]
    ) -> tuple[str, List[str]]:
        client = self.groq_client
        if not client:
            raise ValueError("Groq client unavailable")

        context_prompt = f"""
Current Clinical State:
- Chief Complaints: {state.chief_complaints or [extracted.chief_complaint]}
- Known SOCRATES: {state.socrates.model_dump(exclude_none=True)}
- Preferred Language: {state.language}

Patient just said: \"{transcript}\"
Acknowledge empathetically and ask 1 focused clinical question in {state.language} exploring missing symptoms. (1-2 sentences).
"""

        messages = [{"role": "system", "content": CLINICAL_INTAKE_SYSTEM_PROMPT}]
        for turn in conversation_history[-3:]:
            messages.append(turn)
        messages.append({"role": "user", "content": context_prompt})

        models_to_try = ["llama-3.1-8b-instant", "llama-3.3-70b-versatile"]
        for model_name in models_to_try:
            try:
                response = await client.chat.completions.create(
                    model=model_name,
                    messages=messages,
                    temperature=0.3,
                    max_tokens=150,
                )
                content = (response.choices[0].message.content or "").strip()
                if content:
                    quick_options = clinical_nlu._build_dynamic_quick_replies(extracted, state.language)
                    return content, quick_options
            except Exception:
                continue

        raise ValueError("Groq generation failed")


dialogue_engine = DialogueEngineService()
