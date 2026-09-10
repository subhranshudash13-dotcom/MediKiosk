import logging
from typing import Optional, Dict, Any
from app.models.user import generate_audit_event_id, get_current_utc_iso
from app.core.database import get_database

logger = logging.getLogger(__name__)

# Keys that must never be recorded in audit logs
_SENSITIVE_KEYS = {"password", "otp", "token", "access_token", "refresh_token", "aadhaar", "secret"}


def sanitize_audit_metadata(metadata: Dict[str, Any]) -> Dict[str, Any]:
    """Sanitize any sensitive fields from audit event payload."""
    clean = {}
    for k, v in metadata.items():
        if any(sens in k.lower() for sens in _SENSITIVE_KEYS):
            clean[k] = "[REDACTED]"
        elif isinstance(v, dict):
            clean[k] = sanitize_audit_metadata(v)
        else:
            clean[k] = v
    return clean


async def record_audit_event(
    event_type: str,
    user_id: Optional[str] = None,
    session_id: Optional[str] = None,
    actor_type: str = "patient",
    result: str = "success",
    metadata: Optional[Dict[str, Any]] = None,
):
    """
    Append an immutable security audit event into MongoDB audit_events collection.
    """
    try:
        db = get_database()
        sanitized_meta = sanitize_audit_metadata(metadata or {})
        doc = {
            "event_id": generate_audit_event_id(),
            "user_id": user_id,
            "session_id": session_id,
            "event_type": event_type,
            "actor_type": actor_type,
            "result": result,
            "timestamp": get_current_utc_iso(),
            "metadata": sanitized_meta,
        }
        await db["audit_events"].insert_one(doc)
    except Exception as e:
        logger.warning(f"Failed to record audit event {event_type}: {e}")
