import uuid
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, ConfigDict


def generate_user_id() -> str:
    """Generate sovereign immutable MediKiosk user ID."""
    return f"usr_{uuid.uuid4().hex}"


def generate_profile_id() -> str:
    return f"pat_{uuid.uuid4().hex[:12]}"


def generate_identity_id() -> str:
    return f"aid_{uuid.uuid4().hex[:12]}"


def generate_abha_link_id() -> str:
    return f"abhalink_{uuid.uuid4().hex[:12]}"


def generate_session_auth_id() -> str:
    return f"sessauth_{uuid.uuid4().hex[:16]}"


def generate_consent_id() -> str:
    return f"cnst_{uuid.uuid4().hex[:12]}"


def generate_audit_event_id() -> str:
    return f"evt_{uuid.uuid4().hex[:16]}"


def get_current_utc_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


class User(BaseModel):
    """
    Sovereign MediKiosk account identity record.
    Collection: users
    """
    model_config = ConfigDict(populate_by_name=True)

    id: str = Field(default_factory=generate_user_id, alias="_id")
    role: str = "patient"  # "patient" | "doctor" | "admin"
    status: str = "active"  # "active" | "suspended" | "deactivated"
    created_at: str = Field(default_factory=get_current_utc_iso)
    updated_at: str = Field(default_factory=get_current_utc_iso)
    last_login_at: Optional[str] = None
    terms_version: str = "2026-09"
    privacy_version: str = "2026-09"


class PatientProfile(BaseModel):
    """
    Demographic & clinical contact profile.
    Collection: patient_profiles
    """
    model_config = ConfigDict(populate_by_name=True)

    id: str = Field(default_factory=generate_profile_id, alias="_id")
    user_id: str
    full_name: str
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None  # "male" | "female" | "other"
    preferred_language: str = "hi"
    mobile: Optional[str] = None
    email: Optional[str] = None
    profile_source: str = "self_declared"  # "self_declared" | "abha" | "hospital"
    created_at: str = Field(default_factory=get_current_utc_iso)
    updated_at: str = Field(default_factory=get_current_utc_iso)


class AuthIdentity(BaseModel):
    """
    Linked authentication mechanism for a user.
    Collection: auth_identities
    """
    model_config = ConfigDict(populate_by_name=True)

    id: str = Field(default_factory=generate_identity_id, alias="_id")
    user_id: str
    provider: str  # "phone" | "password" | "google"
    provider_subject: str  # phone (+91...), email, or Google 'sub'
    normalized_email: Optional[str] = None
    password_hash: Optional[str] = None
    verified: bool = False
    verified_at: Optional[str] = None
    created_at: str = Field(default_factory=get_current_utc_iso)


class AbhaLink(BaseModel):
    """
    Optional ABDM healthcare identity link.
    Collection: abha_links
    """
    model_config = ConfigDict(populate_by_name=True)

    id: str = Field(default_factory=generate_abha_link_id, alias="_id")
    user_id: str
    abha_number_masked: Optional[str] = None  # "91-XXXX-XXXX-1234"
    abha_number_encrypted: Optional[str] = None
    abha_number_hash: Optional[str] = None  # Keyed HMAC for duplicate check
    abha_number_last4: Optional[str] = None
    abha_address: Optional[str] = None  # "user@abdm"
    verification_status: str = "NOT_LINKED"  # "NOT_LINKED"|"VERIFICATION_STARTED"|"VERIFIED"|"LINKED"|"UNLINKED"|"FAILED"
    verification_method: Optional[str] = None  # "abdm_mobile_otp" | "abdm_aadhaar_otp" | "abdm_qr"
    verified_at: Optional[str] = None
    last_reverified_at: Optional[str] = None
    unlinked_at: Optional[str] = None


class AuthSession(BaseModel):
    """
    Refresh session metadata for token rotation & revocation tracking.
    Collection: auth_sessions
    """
    model_config = ConfigDict(populate_by_name=True)

    id: str = Field(default_factory=generate_session_auth_id, alias="_id")
    user_id: str
    refresh_token_hash: str
    session_family_id: str
    device_type: str = "web"  # "web" | "kiosk" | "mobile"
    ip_hash: Optional[str] = None
    user_agent: Optional[str] = None
    created_at: str = Field(default_factory=get_current_utc_iso)
    last_used_at: str = Field(default_factory=get_current_utc_iso)
    expires_at: str
    revoked_at: Optional[str] = None
    revoke_reason: Optional[str] = None  # "logout" | "family_reuse_detected" | "logout_all"


class AbdmConsent(BaseModel):
    """
    Asynchronous stateful ABDM consent request & artifact lifecycle.
    Collection: abdm_consents
    """
    model_config = ConfigDict(populate_by_name=True)

    id: str = Field(default_factory=generate_consent_id, alias="_id")
    user_id: str
    abha_link_id: Optional[str] = None
    abdm_consent_id: str
    purpose: str = "CAREGIV"
    hi_types: List[str] = ["Prescription", "DiagnosticReport", "OPConsultation"]
    status: str = "REQUESTED"  # "REQUESTED"|"GRANTED"|"DENIED"|"EXPIRED"|"REVOKED"|"FAILED"
    requested_at: str = Field(default_factory=get_current_utc_iso)
    granted_at: Optional[str] = None
    expires_at: Optional[str] = None
    revoked_at: Optional[str] = None


class AuditEvent(BaseModel):
    """
    Immutable security & identity event audit log.
    Collection: audit_events
    """
    event_id: str = Field(default_factory=generate_audit_event_id)
    user_id: Optional[str] = None
    session_id: Optional[str] = None
    event_type: str
    actor_type: str = "patient"  # "patient" | "kiosk" | "staff" | "system"
    result: str = "success"  # "success" | "failure" | "denied"
    timestamp: str = Field(default_factory=get_current_utc_iso)
    metadata: Dict[str, Any] = Field(default_factory=dict)
