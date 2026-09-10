import uuid
import hashlib
import logging
from datetime import datetime, timezone, timedelta
from typing import Optional, Dict, Any, List, Tuple
import jwt

from app.core.config import settings
from app.core.database import get_database
from app.core.redis_client import get_redis

logger = logging.getLogger(__name__)


def hash_token(token: str) -> str:
    """Compute SHA-256 digest of refresh token for safe storage."""
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def create_access_token(
    user_id: str,
    session_id: str,
    role: str = "patient",
    amr: Optional[List[str]] = None,
    expires_delta: Optional[timedelta] = None,
) -> str:
    """
    Generate short-lived signed JWT access token.
    """
    now = datetime.now(timezone.utc)
    expires = now + (expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_TTL_MINUTES))
    jti = f"jwt_{uuid.uuid4().hex}"

    payload = {
        "sub": user_id,
        "sid": session_id,
        "role": role,
        "amr": amr or ["password"],
        "iat": int(now.timestamp()),
        "exp": int(expires.timestamp()),
        "jti": jti,
    }

    token = jwt.encode(
        payload,
        settings.JWT_SECRET,
        algorithm=settings.JWT_ALGORITHM,
    )
    return token


async def create_refresh_session(
    user_id: str,
    device_type: str = "web",
    user_agent: Optional[str] = None,
    ip_address: Optional[str] = None,
    session_family_id: Optional[str] = None,
) -> Tuple[str, str]:
    """
    Issue a fresh rotating refresh token and persist its hashed metadata in MongoDB.
    Returns: (raw_refresh_token, session_id)
    """
    db = get_database()
    raw_refresh_token = f"mk_rt_{uuid.uuid4().hex}{uuid.uuid4().hex}"
    token_hash = hash_token(raw_refresh_token)
    session_id = f"sessauth_{uuid.uuid4().hex[:16]}"
    family_id = session_family_id or f"fam_{uuid.uuid4().hex[:16]}"

    now = datetime.now(timezone.utc)
    expires = now + timedelta(days=settings.REFRESH_TOKEN_TTL_DAYS)

    ip_hash = hashlib.sha256(ip_address.encode("utf-8")).hexdigest()[:16] if ip_address else None

    session_doc = {
        "_id": session_id,
        "user_id": user_id,
        "refresh_token_hash": token_hash,
        "session_family_id": family_id,
        "device_type": device_type,
        "ip_hash": ip_hash,
        "user_agent": (user_agent[:255] if user_agent else None),
        "created_at": now.isoformat(),
        "last_used_at": now.isoformat(),
        "expires_at": expires.isoformat(),
        "revoked_at": None,
        "revoke_reason": None,
    }

    await db["auth_sessions"].insert_one(session_doc)
    return raw_refresh_token, session_id


async def rotate_refresh_token(
    old_raw_token: str,
    device_type: str = "web",
    user_agent: Optional[str] = None,
    ip_address: Optional[str] = None,
) -> Tuple[str, str, str, str]:
    """
    Validate and rotate refresh token.
    Implements Refresh Token Family Reuse Detection:
    If an already-revoked refresh token is re-presented, revoke the entire session family.
    
    Returns: (new_access_token, new_refresh_token, user_id, role)
    """
    db = get_database()
    old_hash = hash_token(old_raw_token)
    session_doc = await db["auth_sessions"].find_one({"refresh_token_hash": old_hash})

    if not session_doc:
        raise ValueError("Invalid refresh token.")

    user_id = session_doc["user_id"]
    family_id = session_doc.get("session_family_id")
    now_iso = datetime.now(timezone.utc).isoformat()

    # Reuse detection: if this session was already revoked, terminate the entire family!
    if session_doc.get("revoked_at"):
        logger.warning(
            f"REFRESH TOKEN REUSE DETECTED! Family: {family_id}, User: {user_id}. Revoking all family sessions."
        )
        if family_id:
            await db["auth_sessions"].update_many(
                {"session_family_id": family_id, "revoked_at": None},
                {"$set": {"revoked_at": now_iso, "revoke_reason": "family_reuse_detected"}},
            )
        raise ValueError("Refresh token reuse detected. Session terminated.")

    # Check expiration
    expires_at = datetime.fromisoformat(session_doc["expires_at"].replace("Z", "+00:00"))
    if datetime.now(timezone.utc) > expires_at:
        await db["auth_sessions"].update_one(
            {"_id": session_doc["_id"]},
            {"$set": {"revoked_at": now_iso, "revoke_reason": "expired"}},
        )
        raise ValueError("Refresh token has expired.")

    # Check user active status
    user = await db["users"].find_one({"_id": user_id})
    if not user or user.get("status") != "active":
        raise ValueError("User account is inactive.")

    # Invalidate current session (rotate)
    await db["auth_sessions"].update_one(
        {"_id": session_doc["_id"]},
        {"$set": {"revoked_at": now_iso, "revoke_reason": "rotated", "last_used_at": now_iso}},
    )

    # Issue next token in family
    new_refresh_token, new_session_id = await create_refresh_session(
        user_id=user_id,
        device_type=device_type or session_doc.get("device_type", "web"),
        user_agent=user_agent or session_doc.get("user_agent"),
        ip_address=ip_address,
        session_family_id=family_id,
    )

    role = user.get("role", "patient")
    new_access_token = create_access_token(
        user_id=user_id,
        session_id=new_session_id,
        role=role,
        amr=["refresh_token"],
    )

    return new_access_token, new_refresh_token, user_id, role


async def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    """
    Verify signature, expiration, and check fast Redis revocation.
    """
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET,
            algorithms=[settings.JWT_ALGORITHM],
        )
    except jwt.PyJWTError as e:
        logger.debug(f"JWT decode failed: {e}")
        return None

    # Check Redis revocation blacklist
    jti = payload.get("jti")
    if jti:
        r = get_redis()
        is_revoked = await r.exists(f"auth:revoked:{jti}")
        if is_revoked:
            logger.info(f"Token with jti {jti} has been revoked.")
            return None

    return payload


async def revoke_session(session_id: str, reason: str = "logout", jti: Optional[str] = None):
    """Revoke single auth session."""
    db = get_database()
    now_iso = datetime.now(timezone.utc).isoformat()
    await db["auth_sessions"].update_one(
        {"_id": session_id},
        {"$set": {"revoked_at": now_iso, "revoke_reason": reason}},
    )
    if jti:
        r = get_redis()
        # Revoke in Redis for access token TTL duration
        await r.set(f"auth:revoked:{jti}", "1", ex=settings.ACCESS_TOKEN_TTL_MINUTES * 60)


async def revoke_all_user_sessions(user_id: str, reason: str = "logout_all"):
    """Revoke all active sessions for a user across all devices."""
    db = get_database()
    now_iso = datetime.now(timezone.utc).isoformat()
    await db["auth_sessions"].update_many(
        {"user_id": user_id, "revoked_at": None},
        {"$set": {"revoked_at": now_iso, "revoke_reason": reason}},
    )
