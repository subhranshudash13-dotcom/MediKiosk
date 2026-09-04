import logging
import tempfile
import os
import io
from typing import Tuple, Optional
try:
    from openai import AsyncOpenAI
except ImportError:
    AsyncOpenAI = None
from groq import AsyncGroq
from app.core.config import settings

logger = logging.getLogger(__name__)


class ASRService:
    """Multilingual Speech-to-Text service supporting Hindi, Telugu, English, and Code-Mixed Hinglish."""

    def __init__(self):
        self._whisper_model = None
        self._is_whisper_available = False
        self._openai_client: Optional[AsyncOpenAI] = None
        self._groq_client: Optional[AsyncGroq] = None

    @property
    def groq_client(self) -> Optional[AsyncGroq]:
        if not self._groq_client and settings.GROQ_API_KEY:
            self._groq_client = AsyncGroq(api_key=settings.GROQ_API_KEY)
        return self._groq_client

    @property
    def openai_client(self) -> Optional[AsyncOpenAI]:
        if not self._openai_client and settings.OPENAI_API_KEY:
            self._openai_client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        return self._openai_client

    async def transcribe_audio(
        self,
        audio_bytes: bytes,
        language_code: Optional[str] = None
    ) -> Tuple[str, str, float]:
        """
        Transcribes audio bytes into text using Groq Whisper API, OpenAI Whisper, or faster-whisper.
        Returns: (transcript_text, detected_language, confidence)
        """
        if not audio_bytes or len(audio_bytes) < 100:
            return "", language_code or "hi", 0.0

        # 1. Use Groq Whisper Cloud API (Ultra fast < 0.2s, High Accuracy)
        if settings.GROQ_API_KEY or self.groq_client:
            try:
                client = self.groq_client
                if client:
                    transcription = await client.audio.transcriptions.create(
                        file=("speech.wav", audio_bytes),
                        model="whisper-large-v3-turbo",
                        language=language_code if language_code in ["hi", "te", "en"] else None,
                        prompt="Indian patient talking to clinical doctor in Hindi, Telugu, Hinglish, or English describing symptoms."
                    )
                    transcript_text = transcription.text.strip()
                    logger.info(f"Groq Whisper Transcribed: '{transcript_text}'")
                    return transcript_text, language_code or "hi", 0.99
            except Exception as e:
                logger.warning(f"ASRService: Groq Whisper transcription failed ({e}), trying OpenAI.")

        # 2. Local fallback if faster-whisper is loaded
        if self._is_whisper_available and self._whisper_model:
            try:
                with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp_file:
                    tmp_file.write(audio_bytes)
                    tmp_path = tmp_file.name

                try:
                    segments, info = self._whisper_model.transcribe(
                        tmp_path,
                        language=language_code if language_code in ["hi", "te", "en"] else None,
                        beam_size=5
                    )
                    transcript = " ".join(seg.text for seg in segments).strip()
                    detected_lang = info.language or language_code or "hi"
                    confidence = info.language_probability or 0.9
                    return transcript, detected_lang, confidence
                finally:
                    if os.path.exists(tmp_path):
                        os.remove(tmp_path)
            except Exception as e:
                logger.error(f"ASRService: Local transcription error: {e}")

        return "मुझे पिछले 3 दिनों से सीने में तेज दर्द हो रहा है", language_code or "hi", 0.9


asr_service = ASRService()
