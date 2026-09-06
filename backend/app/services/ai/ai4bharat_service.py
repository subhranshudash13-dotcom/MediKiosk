"""
AI4Bharat / Bhashini National Language Translation Mission (NLTM) Client Service.
Provides integration for:
1. IndicASR / IndicConformer (Multilingual Indian Speech-to-Text)
2. IndicTrans2 (High-accuracy vernacular translation and code-mixed normalization)
3. IndicTTS (Regional vernacular voice synthesis)

Hybrid Architecture:
- If Bhashini API Key, User ID, and Pipeline ID are configured, connects to live Bhashini ULCA endpoints.
- Otherwise seamlessly delegates to Groq Whisper Turbo & Edge TTS for zero-downtime execution.
"""

import logging
import base64
import httpx
from typing import Optional, Tuple, Dict, Any

from app.core.config import settings
from app.services.ai.asr_service import asr_service
from app.services.ai.tts_service import tts_service

logger = logging.getLogger(__name__)

BHASHINI_PIPELINE_ENDPOINT = "https://dhruva-api.bhashini.gov.in/services/inference/pipeline"
BHASHINI_CONFIG_ENDPOINT = "https://meity-auth.ulcacontrib.org/ulca/apis/v0/model/getModelsPipeline"


class AI4BharatBhashiniService:
    """
    Official AI4Bharat / Bhashini Indic Language Service.
    Supports 22 scheduled Indian languages with intelligent Groq fallback.
    """

    def __init__(self):
        self.is_configured = bool(
            settings.BHASHINI_API_KEY and settings.BHASHINI_USER_ID and settings.BHASHINI_PIPELINE_ID
        )

    def check_status(self) -> Dict[str, Any]:
        """Returns Bhashini engine configuration and readiness status."""
        return {
            "provider": "AI4Bharat / Bhashini (NLTM)",
            "is_live": self.is_configured,
            "asr_engine": "IndicConformer / Whisper-Large-v3-Turbo",
            "translation_engine": "IndicTrans2",
            "tts_engine": "IndicTTS / Neural Indic Voices",
            "supported_languages": [
                "Hindi (hi)", "Telugu (te)", "Tamil (ta)", "Bengali (bn)",
                "Marathi (mr)", "Kannada (kn)", "Gujarati (gu)", "Malayalam (ml)",
                "Punjabi (pa)", "Odia (or)", "Assamese (as)", "English (en)"
            ]
        }

    async def transcribe_speech(
        self,
        audio_bytes: bytes,
        language_code: str = "hi"
    ) -> Tuple[str, str, float]:
        """
        Transcribes vernacular Indian speech.
        Uses Bhashini IndicASR when configured, or Groq Whisper Turbo.
        """
        if not audio_bytes or len(audio_bytes) < 50:
            return "", language_code, 0.0

        if self.is_configured:
            try:
                # Bhashini ULCA ASR Pipeline Call
                encoded_audio = base64.b64encode(audio_bytes).decode("utf-8")
                headers = {
                    "Authorization": settings.BHASHINI_API_KEY,
                    "User-Id": settings.BHASHINI_USER_ID,
                    "ulcaApiKey": settings.BHASHINI_API_KEY,
                    "Content-Type": "application/json"
                }
                payload = {
                    "pipelineTasks": [
                        {
                            "taskType": "asr",
                            "config": {
                                "language": {"sourceLanguage": language_code},
                                "audioFormat": "wav",
                                "samplingRate": 16000
                            }
                        }
                    ],
                    "inputData": {
                        "audio": [{"audioContent": encoded_audio}]
                    }
                }
                async with httpx.AsyncClient(timeout=4.0) as client:
                    resp = await client.post(BHASHINI_PIPELINE_ENDPOINT, json=payload, headers=headers)
                    if resp.status_code == 200:
                        data = resp.json()
                        pipeline_resp = data.get("pipelineResponse", [])
                        if pipeline_resp:
                            transcript = pipeline_resp[0].get("output", [{}])[0].get("source", "")
                            if transcript:
                                logger.info(f"Bhashini IndicASR: Transcribed '{transcript}'")
                                return transcript.strip(), language_code, 0.98
            except Exception as e:
                logger.warning(f"Bhashini ASR pipeline error ({e}), falling back to Groq Whisper.")

        # Fallback to ultra-fast Groq Whisper
        return await asr_service.transcribe_audio(audio_bytes, language_code=language_code)

    async def translate_code_switched_text(
        self,
        text: str,
        source_lang: str = "hi",
        target_lang: str = "en"
    ) -> str:
        """
        Translates or normalizes code-mixed Indian vernacular text (IndicTrans2).
        """
        if not text or not text.strip():
            return ""

        if self.is_configured:
            try:
                headers = {
                    "Authorization": settings.BHASHINI_API_KEY,
                    "User-Id": settings.BHASHINI_USER_ID,
                    "ulcaApiKey": settings.BHASHINI_API_KEY,
                    "Content-Type": "application/json"
                }
                payload = {
                    "pipelineTasks": [
                        {
                            "taskType": "translation",
                            "config": {
                                "language": {
                                    "sourceLanguage": source_lang,
                                    "targetLanguage": target_lang
                                }
                            }
                        }
                    ],
                    "inputData": {
                        "input": [{"source": text}]
                    }
                }
                async with httpx.AsyncClient(timeout=3.0) as client:
                    resp = await client.post(BHASHINI_PIPELINE_ENDPOINT, json=payload, headers=headers)
                    if resp.status_code == 200:
                        data = resp.json()
                        pipeline_resp = data.get("pipelineResponse", [])
                        if pipeline_resp:
                            translated = pipeline_resp[0].get("output", [{}])[0].get("target", "")
                            if translated:
                                return translated.strip()
            except Exception as e:
                logger.warning(f"Bhashini IndicTrans2 translation error: {e}")

        return text

    async def synthesize_vernacular_speech(
        self,
        text: str,
        language_code: str = "hi",
        gender: str = "female"
    ) -> str:
        """
        Synthesizes natural Indic speech with Bhashini IndicTTS / Edge-TTS fallback.
        Returns base64 audio data URI.
        """
        if not text or not text.strip():
            return ""

        if self.is_configured:
            try:
                headers = {
                    "Authorization": settings.BHASHINI_API_KEY,
                    "User-Id": settings.BHASHINI_USER_ID,
                    "ulcaApiKey": settings.BHASHINI_API_KEY,
                    "Content-Type": "application/json"
                }
                payload = {
                    "pipelineTasks": [
                        {
                            "taskType": "tts",
                            "config": {
                                "language": {"sourceLanguage": language_code},
                                "gender": gender
                            }
                        }
                    ],
                    "inputData": {
                        "input": [{"source": text}]
                    }
                }
                async with httpx.AsyncClient(timeout=3.0) as client:
                    resp = await client.post(BHASHINI_PIPELINE_ENDPOINT, json=payload, headers=headers)
                    if resp.status_code == 200:
                        data = resp.json()
                        pipeline_resp = data.get("pipelineResponse", [])
                        if pipeline_resp:
                            audio_content = pipeline_resp[0].get("audio", [{}])[0].get("audioContent", "")
                            if audio_content:
                                return f"data:audio/wav;base64,{audio_content}"
            except Exception as e:
                logger.warning(f"Bhashini IndicTTS error ({e}), falling back to cached Edge-TTS.")

        # Fallback to high-speed cached neural TTS
        return await tts_service.synthesize_speech_base64(text, language_code=language_code)


ai4bharat_service = AI4BharatBhashiniService()
