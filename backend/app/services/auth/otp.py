import re
import json
import hmac
import hashlib
import secrets
import logging
from typing import Tuple, Optional
from app.core.config import settings
from app.core.redis_client import get_redis

logger = logging.getLogger(__name__)


def normalize_phone(phone: str) -> str:
    """Normalize phone number to E.164-style standard (+91XXXXXXXXXX)."""
    cleaned = re.sub(r"[^\d+]", "", phone.strip())
    if cleaned.startswith("+"):
        return cleaned
    if cleaned.startswith("91") and len(cleaned) == 12:
        return f"+{cleaned}"
    if len(cleaned) == 10:
        return f"+91{cleaned}"
    return f"+{cleaned}"


def compute_otp_hmac(challenge_id: str, otp: str) -> str:
    """Hash OTP challenge with server secret to avoid plaintext storage."""
    msg = f"{challenge_id}:{otp}".encode("utf-8")
    return hmac.new(settings.OTP_HMAC_SECRET.encode("utf-8"), msg, hashlib.sha256).hexdigest()


async def check_otp_rate_limit(phone: str) -> bool:
    """
    Check if phone has exceeded OTP request rate limit.
    Allows up to 5 requests per 15-minute rolling window.
    """
    r = get_redis()
    phone_hash = hashlib.sha256(phone.encode("utf-8")).hexdigest()[:16]
    key = f"auth:otp:rate:{phone_hash}"

    count = await r.incr(key)
    if count == 1:
        await r.expire(key, 900)  # 15 minutes
    
    return count <= 5


async def request_otp_challenge(phone: str, purpose: str = "login") -> Tuple[str, Optional[str]]:
    """
    Create a new OTP challenge, store its HMAC in Redis, and dispatch OTP.
    Returns: (challenge_id, demo_otp_if_dev)
    """
    normalized_phone = normalize_phone(phone)
    if not await check_otp_rate_limit(normalized_phone):
        raise ValueError("Too many OTP requests. Please wait a few minutes before trying again.")

    # Generate 6-digit random code
    otp = f"{secrets.randbelow(900000) + 100000}"
    challenge_id = f"otpch_{secrets.token_hex(12)}"
    otp_hmac = compute_otp_hmac(challenge_id, otp)

    challenge_data = {
        "phone": normalized_phone,
        "hmac": otp_hmac,
        "purpose": purpose,
        "attempts_remaining": settings.OTP_MAX_ATTEMPTS,
    }

    r = get_redis()
    await r.set(
        f"auth:otp:{challenge_id}",
        json.dumps(challenge_data),
        ex=settings.OTP_TTL_SECONDS,
    )

    logger.info(
        f"[OTP-SERVICE] Generated challenge {challenge_id} for {normalized_phone[:6]}**** (provider: {settings.OTP_PROVIDER})"
    )

    # In mock or development mode, provide demo_otp for automated testing / kiosk intake demonstration
    demo_otp = otp if settings.OTP_PROVIDER == "mock" or settings.ENVIRONMENT != "production" else None
    return challenge_id, demo_otp


async def verify_otp_challenge(challenge_id: str, submitted_otp: str) -> Tuple[bool, Optional[str], Optional[str]]:
    """
    Verify submitted OTP against challenge HMAC stored in Redis.
    Returns: (is_valid, phone, purpose)
    """
    r = get_redis()
    key = f"auth:otp:{challenge_id}"
    data_str = await r.get(key)

    if not data_str:
        return False, None, None

    try:
        challenge_data = json.loads(data_str)
    except Exception:
        await r.delete(key)
        return False, None, None

    attempts = challenge_data.get("attempts_remaining", 1) - 1
    stored_hmac = challenge_data.get("hmac", "")
    phone = challenge_data.get("phone")
    purpose = challenge_data.get("purpose", "login")

    computed_hmac = compute_otp_hmac(challenge_id, submitted_otp.strip())

    if hmac.compare_digest(stored_hmac, computed_hmac):
        # Challenge consumed successfully
        await r.delete(key)
        return True, phone, purpose

    # Mismatch: update remaining attempts or delete if exhausted
    if attempts <= 0:
        await r.delete(key)
        logger.warning(f"OTP challenge {challenge_id} exhausted max attempts.")
    else:
        challenge_data["attempts_remaining"] = attempts
        await r.set(key, json.dumps(challenge_data), ex=settings.OTP_TTL_SECONDS)

    return False, None, None
