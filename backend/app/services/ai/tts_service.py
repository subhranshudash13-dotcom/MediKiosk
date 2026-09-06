import io
import base64
import hashlib
import logging
import asyncio
from typing import Optional, Dict
import edge_tts

from app.core.redis_client import get_redis

logger = logging.getLogger(__name__)

# Free, ultra-natural neural voices across Indic languages
VOICE_MAP = {
    "hi": "hi-IN-SwaraNeural",       # Hindi Female
    "hi-male": "hi-IN-MadhurNeural",  # Hindi Male
    "te": "te-IN-ShrutiNeural",      # Telugu Female
    "te-male": "te-IN-MohanNeural",   # Telugu Male
    "en": "en-IN-NeerjaNeural",      # Indian English Female
    "en-male": "en-IN-PrabhatNeural", # Indian English Male
    "hinglish": "hi-IN-SwaraNeural",
    "ta": "ta-IN-PallaviNeural",     # Tamil Female
    "ta-male": "ta-IN-ValluvarNeural",# Tamil Male
    "bn": "bn-IN-TanishaaNeural",    # Bengali Female
    "bn-male": "bn-IN-BashkarNeural", # Bengali Male
    "mr": "mr-IN-AarohiNeural",      # Marathi Female
    "mr-male": "mr-IN-ManoharNeural", # Marathi Male
    "kn": "kn-IN-SapnaNeural",       # Kannada Female
    "kn-male": "kn-IN-GaganNeural",   # Kannada Male
    "gu": "gu-IN-DhwaniNeural",      # Gujarati Female
    "ml": "ml-IN-SobhanaNeural",     # Malayalam Female
}


class TTSService:
    """Zero-cost, natural neural Text-to-Speech service for Indian languages with instant Redis caching."""

    def __init__(self):
        # In-memory LRU cache for audio base64 representations
        self._cache: Dict[str, str] = {}
        self._max_cache_size = 250

    async def synthesize_speech(
        self,
        text: str,
        language_code: str = "hi",
        gender: str = "female"
    ) -> bytes:
        """
        Synthesizes text into high quality MP3 audio bytes with a tight 4.0s timeout.
        """
        if not text or not text.strip():
            return b""

        # Normalize language code (e.g. 'hi-IN' -> 'hi')
        norm_lang = language_code.split("-")[0].lower() if language_code else "hi"
        key = f"{norm_lang}-{gender}" if gender == "male" else norm_lang
        voice = VOICE_MAP.get(key, VOICE_MAP.get(norm_lang, "hi-IN-SwaraNeural"))

        try:
            communicate = edge_tts.Communicate(text=text, voice=voice, rate="+5%", pitch="+0Hz")
            audio_buffer = io.BytesIO()
            
            async def _stream():
                async for chunk in communicate.stream():
                    if chunk["type"] == "audio":
                        audio_buffer.write(chunk["data"])
            
            await asyncio.wait_for(_stream(), timeout=4.0)
            return audio_buffer.getvalue()
        except asyncio.TimeoutError:
            logger.warning(f"TTSService: Timeout synthesizing speech for '{text[:25]}...'")
            return b""
        except Exception as e:
            logger.error(f"TTSService: Speech synthesis failed for text '{text[:30]}...': {e}")
            return b""

    async def synthesize_speech_base64(self, text: str, language_code: str = "hi") -> str:
        """Returns synthesized audio as base64 data URI with two-tier (Memory + Redis) cache lookup."""
        if not text or not text.strip():
            return ""

        cache_key = f"{language_code}:{text.strip()}"
        # 1. Tier 1: In-memory LRU
        if cache_key in self._cache:
            return self._cache[cache_key]

        # 2. Tier 2: Persistent Redis cache
        hash_digest = hashlib.md5(cache_key.encode("utf-8")).hexdigest()
        redis_key = f"tts:{language_code}:{hash_digest}"
        try:
            redis = get_redis()
            cached_audio = await redis.get(redis_key)
            if cached_audio:
                self._cache[cache_key] = cached_audio
                return cached_audio
        except Exception as e:
            logger.debug(f"TTSService: Redis cache read failed ({e})")

        # 3. Cache miss: Synthesize neural speech
        audio_bytes = await self.synthesize_speech(text, language_code=language_code)
        if not audio_bytes:
            return ""

        encoded = base64.b64encode(audio_bytes).decode("utf-8")
        result = f"data:audio/mp3;base64,{encoded}"

        # Maintain in-memory cache bounds
        if len(self._cache) >= self._max_cache_size:
            self._cache.pop(next(iter(self._cache)))
        self._cache[cache_key] = result

        # Save to Redis with 24-hour expiration
        try:
            redis = get_redis()
            await redis.set(redis_key, result, ex=86400)
        except Exception as e:
            logger.debug(f"TTSService: Redis cache set failed ({e})")

        return result


tts_service = TTSService()
