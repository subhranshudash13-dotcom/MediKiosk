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


def detect_audio_container(audio_bytes: bytes) -> Tuple[str, str]:
    """
    Detects container format and MIME type from audio magic bytes.
    Returns: (filename, mime_type)
    """
    if not audio_bytes or len(audio_bytes) < 4:
        return ("speech.webm", "audio/webm")

    # EBML header for WebM / MKV (Chrome/Firefox/Edge MediaRecorder default)
    if audio_bytes[:4] == b"\x1a\x45\xdf\xa3":
        return ("speech.webm", "audio/webm")

    # RIFF header for WAV
    if audio_bytes[:4] == b"RIFF":
        return ("speech.wav", "audio/wav")

    # Ogg container (Firefox / Opera default in some versions)
    if audio_bytes[:4] == b"OggS":
        return ("speech.ogg", "audio/ogg")

    # MP3 header
    if audio_bytes[:3] == b"ID3" or (len(audio_bytes) > 2 and audio_bytes[0] == 0xFF and (audio_bytes[1] & 0xE0) == 0xE0):
        return ("speech.mp3", "audio/mpeg")

    # MP4 / M4A (Safari iOS / macOS default)
    if len(audio_bytes) >= 12 and audio_bytes[4:8] == b"ftyp":
        return ("speech.m4a", "audio/mp4")

    # Default to webm for modern browser media recorder streams
    return ("speech.webm", "audio/webm")


class ASRService:
    """
    Multilingual Speech-to-Text service supporting Hindi, Telugu, Tamil, Bengali,
    Marathi, Kannada, Gujarati, Malayalam, English, and Code-Mixed Hinglish.
    """

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
        Transcribes audio bytes into text using Groq Whisper API, OpenAI Whisper, or local fallback.
        Returns: (transcript_text, detected_language, confidence)
        """
        if not audio_bytes or len(audio_bytes) < 100:
            return "", language_code or "hi", 0.0

        filename, mime_type = detect_audio_container(audio_bytes)
        logger.info(f"ASRService: Processing audio size={len(audio_bytes)} bytes, detected container={filename} ({mime_type})")

        # Map language code for Whisper (supports ISO-639-1)
        whisper_lang = None
        if language_code:
            norm_lang = language_code.split("-")[0].lower()
            if norm_lang in ["hi", "te", "en", "ta", "bn", "mr", "kn", "gu", "ml", "pa", "ur"]:
                whisper_lang = norm_lang
            elif norm_lang == "hinglish":
                whisper_lang = "hi"

        # 1. Use Groq Whisper Cloud API (Ultra-fast < 0.2s, High Accuracy)
        if settings.GROQ_API_KEY or self.groq_client:
            for model_name in ["whisper-large-v3-turbo", "whisper-large-v3"]:
                try:
                    client = self.groq_client
                    if client:
                        transcription = await client.audio.transcriptions.create(
                            file=(filename, audio_bytes, mime_type),
                            model=model_name,
                            language=whisper_lang,
                            prompt="Indian patient talking to clinical doctor in Hindi, Telugu, Tamil, Marathi, Bengali, Hinglish, or English describing medical symptoms and pain."
                        )
                        transcript_text = (transcription.text or "").strip()
                        if transcript_text:
                            logger.info(f"Groq Whisper ({model_name}) Transcribed: '{transcript_text}'")
                            return transcript_text, language_code or "hi", 0.99
                except Exception as e:
                    logger.warning(f"ASRService: Groq Whisper ({model_name}) transcription failed ({e}).")

        # 2. Try OpenAI Whisper if available
        if settings.OPENAI_API_KEY or self.openai_client:
            try:
                client = self.openai_client
                if client:
                    transcription = await client.audio.transcriptions.create(
                        file=(filename, audio_bytes),
                        model="whisper-1",
                        language=whisper_lang,
                        prompt="Indian patient talking to clinical doctor in Hindi, Telugu, Hinglish, or English describing symptoms."
                    )
                    transcript_text = (transcription.text or "").strip()
                    if transcript_text:
                        logger.info(f"OpenAI Whisper Transcribed: '{transcript_text}'")
                        return transcript_text, language_code or "hi", 0.95
            except Exception as e:
                logger.warning(f"ASRService: OpenAI Whisper transcription failed: {e}")

        # 3. Local faster-whisper fallback if loaded
        if self._is_whisper_available and self._whisper_model:
            try:
                with tempfile.NamedTemporaryFile(suffix=os.path.splitext(filename)[1], delete=False) as tmp_file:
                    tmp_file.write(audio_bytes)
                    tmp_path = tmp_file.name

                try:
                    segments, info = self._whisper_model.transcribe(
                        tmp_path,
                        language=whisper_lang,
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

        # If transcription could not resolve, return empty so the agent prompts user to repeat
        return "", language_code or "hi", 0.0


asr_service = ASRService()
