import logging
from typing import Optional, Dict, Any, List, Tuple
from app.models.user import (
    generate_user_id,
    generate_profile_id,
    generate_identity_id,
    get_current_utc_iso,
)
from app.core.database import get_database
from app.services.auth.audit import record_audit_event

logger = logging.getLogger(__name__)


def normalize_email(email: str) -> str:
    """Standardize email address string."""
    return email.strip().lower()


async def find_identity(provider: str, provider_subject: str) -> Optional[Dict[str, Any]]:
    """Lookup auth identity record in MongoDB."""
    db = get_database()
    return await db["auth_identities"].find_one({
        "provider": provider,
        "provider_subject": provider_subject,
    })


async def find_identities_for_user(user_id: str) -> List[Dict[str, Any]]:
    """Retrieve all linked login identities for a user."""
    db = get_database()
    cursor = db["auth_identities"].find({"user_id": user_id})
    return await cursor.to_list()


async def create_patient_account(
    provider: str,
    provider_subject: str,
    full_name: str,
    preferred_language: str = "hi",
    normalized_email: Optional[str] = None,
    password_hash: Optional[str] = None,
    mobile: Optional[str] = None,
    date_of_birth: Optional[str] = None,
    gender: Optional[str] = None,
    verified: bool = False,
) -> Tuple[str, str]:
    """
    Atomically establish core patient identity:
    1. users (usr_...)
    2. patient_profiles (pat_...)
    3. auth_identities (aid_...)
    """
    db = get_database()
    user_id = generate_user_id()
    profile_id = generate_profile_id()
    identity_id = generate_identity_id()
    now_iso = get_current_utc_iso()

    # 1. users doc
    user_doc = {
        "_id": user_id,
        "role": "patient",
        "status": "active",
        "created_at": now_iso,
        "updated_at": now_iso,
        "last_login_at": now_iso,
        "terms_version": "2026-09",
        "privacy_version": "2026-09",
    }
    await db["users"].insert_one(user_doc)

    # 2. patient_profiles doc
    profile_doc = {
        "_id": profile_id,
        "user_id": user_id,
        "full_name": full_name,
        "date_of_birth": date_of_birth,
        "gender": gender,
        "preferred_language": preferred_language,
        "mobile": mobile,
        "email": normalized_email,
        "profile_source": "self_declared",
        "created_at": now_iso,
        "updated_at": now_iso,
    }
    await db["patient_profiles"].insert_one(profile_doc)

    # 3. auth_identities doc
    identity_doc = {
        "_id": identity_id,
        "user_id": user_id,
        "provider": provider,
        "provider_subject": provider_subject,
        "normalized_email": normalized_email,
        "password_hash": password_hash,
        "verified": verified,
        "verified_at": now_iso if verified else None,
        "created_at": now_iso,
    }
    await db["auth_identities"].insert_one(identity_doc)

    await record_audit_event(
        event_type="SIGNUP_COMPLETED",
        user_id=user_id,
        metadata={"provider": provider, "full_name": full_name},
    )

    return user_id, profile_id


async def link_identity_to_user(
    user_id: str,
    provider: str,
    provider_subject: str,
    normalized_email: Optional[str] = None,
    password_hash: Optional[str] = None,
    verified: bool = True,
) -> str:
    """Link an additional authentication identity to existing user account."""
    db = get_database()

    # Verify not already claimed
    existing = await find_identity(provider, provider_subject)
    if existing:
        if existing["user_id"] == user_id:
            return existing["_id"]
        raise ValueError(f"This {provider} account is already linked to another user.")

    identity_id = generate_identity_id()
    now_iso = get_current_utc_iso()

    identity_doc = {
        "_id": identity_id,
        "user_id": user_id,
        "provider": provider,
        "provider_subject": provider_subject,
        "normalized_email": normalized_email,
        "password_hash": password_hash,
        "verified": verified,
        "verified_at": now_iso if verified else None,
        "created_at": now_iso,
    }
    await db["auth_identities"].insert_one(identity_doc)

    await record_audit_event(
        event_type="IDENTITY_LINKED",
        user_id=user_id,
        metadata={"provider": provider},
    )
    return identity_id


async def unlink_identity_from_user(user_id: str, provider: str):
    """Safely unlink an authentication identity, preventing account abandonment."""
    db = get_database()
    identities = await find_identities_for_user(user_id)

    if len(identities) <= 1:
        raise ValueError("Cannot remove your only authentication method. Please add another method first.")

    target = next((i for i in identities if i["provider"] == provider), None)
    if not target:
        raise ValueError(f"No {provider} identity found for this account.")

    await db["auth_identities"].delete_one({"_id": target["_id"]})
    await record_audit_event(
        event_type="IDENTITY_UNLINKED",
        user_id=user_id,
        metadata={"provider": provider},
    )


async def get_patient_profile_data(user_id: str) -> Dict[str, Any]:
    """Fetch consolidated patient identity, profile, and ABHA link state."""
    db = get_database()
    user = await db["users"].find_one({"_id": user_id})
    if not user:
        raise ValueError("User not found.")

    profile = await db["patient_profiles"].find_one({"user_id": user_id}) or {}
    identities = await find_identities_for_user(user_id)
    
    # Active ABHA link
    abha_link = await db["abha_links"].find_one({
        "user_id": user_id,
        "verification_status": "verified",
        "unlinked_at": None,
    })

    return {
        "user_id": user_id,
        "role": user.get("role", "patient"),
        "status": user.get("status", "active"),
        "full_name": profile.get("full_name", "Patient"),
        "preferred_language": profile.get("preferred_language", "hi"),
        "date_of_birth": profile.get("date_of_birth"),
        "gender": profile.get("gender"),
        "mobile": profile.get("mobile"),
        "email": profile.get("email"),
        "identities": [i["provider"] for i in identities],
        "abha_status": "VERIFIED" if abha_link else "NOT_LINKED",
        "abha_address": abha_link.get("abha_address") if abha_link else None,
        "abha_number_masked": abha_link.get("abha_number_masked") if abha_link else None,
        "created_at": user.get("created_at"),
        "last_login_at": user.get("last_login_at"),
    }
