import hmac
import hashlib
import logging
from typing import Optional
from fastapi import APIRouter, HTTPException, Depends, status, Body

from app.core.config import settings
from app.core.database import get_database
from app.models.auth import (
    AbhaVerifyStartRequest,
    AbhaVerifyConfirmRequest,
    UserContext,
)
from app.models.user import generate_abha_link_id, get_current_utc_iso
from app.services.auth.dependencies import get_current_user
from app.services.auth.audit import record_audit_event
from app.services.abdm.gateway import abdm_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/abha", tags=["ABHA Healthcare Identity"])


def compute_abha_hash(abha_number: str) -> str:
    """Compute keyed HMAC of ABHA number for privacy-preserving duplicate checks."""
    clean = abha_number.replace("-", "").strip()
    return hmac.new(
        settings.PII_LOOKUP_HMAC_KEY.encode("utf-8"),
        clean.encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()


def mask_abha_number(abha_number: str) -> str:
    """Mask 14-digit ABHA ID into 91-XXXX-XXXX-1234."""
    clean = abha_number.replace("-", "").strip()
    if len(clean) >= 14:
        return f"{clean[:2]}-XXXX-XXXX-{clean[-4:]}"
    elif len(clean) >= 4:
        return f"XXXX-XXXX-{clean[-4:]}"
    return "XXXX-XXXX-XXXX"


@router.post("/verification/start")
async def start_abha_verification(
    payload: AbhaVerifyStartRequest,
    current_user: UserContext = Depends(get_current_user),
):
    """
    Step 1: Initiate ABDM ABHA verification flow for authenticated patient.
    Sends verification OTP through ABDM Gateway.
    """
    res = await abdm_service.generate_otp(payload.abha_id)
    await record_audit_event(
        event_type="ABHA_VERIFICATION_STARTED",
        user_id=current_user.user_id,
        metadata={"identifier_masked": mask_abha_number(payload.abha_id)},
    )
    return {
        "status": "OTP_DISPATCHED",
        "txn_id": res.get("txn_id"),
        "message": res.get("message", "Verification OTP sent."),
    }


@router.post("/verification/confirm")
async def confirm_abha_verification(
    payload: AbhaVerifyConfirmRequest,
    current_user: UserContext = Depends(get_current_user),
):
    """
    Step 2: Confirm OTP with ABDM Gateway, verify identity, and bind ABHA to MediKiosk patient.
    Enforces privacy-preserving duplicate ABHA link collision prevention.
    """
    # 1. Verify OTP with ABDM service
    kyc_profile = await abdm_service.verify_otp(
        txn_id=payload.txn_id,
        otp=payload.otp,
        identifier="ABHA_M1_FLOW",
    )

    abha_num = kyc_profile.abha_id
    clean_num = abha_num.replace("-", "").strip()
    abha_hash = compute_abha_hash(clean_num)
    now_iso = get_current_utc_iso()

    db = get_database()

    # 2. Check duplicate link collision: another user already has this active ABHA link?
    existing_other = await db["abha_links"].find_one({
        "abha_number_hash": abha_hash,
        "unlinked_at": None,
        "verification_status": "verified",
        "user_id": {"$ne": current_user.user_id},
    })
    if existing_other:
        logger.warning(f"ABHA duplicate link conflict detected for user {current_user.user_id}")
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This ABHA identity is already linked to another active account.",
        )

    # 3. Create or update current user's abha_links document
    masked_num = mask_abha_number(clean_num)
    last4 = clean_num[-4:] if len(clean_num) >= 4 else "0000"

    current_link = await db["abha_links"].find_one({"user_id": current_user.user_id})

    link_data = {
        "user_id": current_user.user_id,
        "abha_number_masked": masked_num,
        "abha_number_hash": abha_hash,
        "abha_number_last4": last4,
        "abha_address": kyc_profile.abha_address,
        "verification_status": "verified",
        "verification_method": "abdm_mobile_otp",
        "verified_at": now_iso,
        "last_reverified_at": now_iso,
        "unlinked_at": None,
    }

    if current_link:
        await db["abha_links"].update_one(
            {"_id": current_link["_id"]},
            {"$set": link_data},
        )
        link_id = current_link["_id"]
    else:
        link_id = generate_abha_link_id()
        link_data["_id"] = link_id
        await db["abha_links"].insert_one(link_data)

    # 4. Record audit events
    await record_audit_event(
        event_type="ABHA_VERIFIED",
        user_id=current_user.user_id,
        metadata={"abha_masked": masked_num, "method": "abdm_mobile_otp"},
    )
    await record_audit_event(
        event_type="ABHA_LINKED",
        user_id=current_user.user_id,
        metadata={"link_id": link_id},
    )

    return {
        "success": True,
        "link_id": link_id,
        "abha_status": "VERIFIED",
        "abha_number_masked": masked_num,
        "abha_address": kyc_profile.abha_address,
        "name": kyc_profile.name,
        "gender": kyc_profile.gender,
        "dob": kyc_profile.dob,
    }


@router.get("/status")
async def get_abha_status(current_user: UserContext = Depends(get_current_user)):
    """
    Check current ABHA link state for authenticated patient.
    """
    db = get_database()
    link = await db["abha_links"].find_one({
        "user_id": current_user.user_id,
        "unlinked_at": None,
    })

    if not link or link.get("verification_status") != "verified":
        return {
            "linked": False,
            "status": "NOT_LINKED",
        }

    return {
        "linked": True,
        "status": "VERIFIED",
        "link_id": link.get("_id"),
        "abha_number_masked": link.get("abha_number_masked"),
        "abha_address": link.get("abha_address"),
        "verified_at": link.get("verified_at"),
    }


@router.delete("/link")
async def unlink_abha(current_user: UserContext = Depends(get_current_user)):
    """
    Unlink ABHA identity from current MediKiosk user account.
    Does NOT delete the patient's national ABHA or clinical records.
    """
    db = get_database()
    now_iso = get_current_utc_iso()

    res = await db["abha_links"].update_one(
        {"user_id": current_user.user_id, "unlinked_at": None},
        {"$set": {"verification_status": "UNLINKED", "unlinked_at": now_iso}},
    )

    if res.matched_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active ABHA link found to unlink.",
        )

    await record_audit_event(
        event_type="ABHA_UNLINKED",
        user_id=current_user.user_id,
    )

    return {"success": True, "message": "ABHA identity successfully unlinked."}


@router.post("/qr/resolve")
async def resolve_qr_and_link(
    qr_token: str = Body(default="SAMPLE_COUNTER_TOKEN", embed=True),
    current_user: UserContext = Depends(get_current_user),
):
    """
    Scan & Share ABHA Counter QR Code and link to authenticated patient.
    """
    kyc_profile = await abdm_service.scan_qr_code(qr_token)
    clean_num = kyc_profile.abha_id.replace("-", "").strip()
    abha_hash = compute_abha_hash(clean_num)
    now_iso = get_current_utc_iso()

    db = get_database()
    # Check duplicate
    existing_other = await db["abha_links"].find_one({
        "abha_number_hash": abha_hash,
        "unlinked_at": None,
        "verification_status": "verified",
        "user_id": {"$ne": current_user.user_id},
    })
    if existing_other:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This ABHA identity is already linked to another active account.",
        )

    masked_num = mask_abha_number(clean_num)
    last4 = clean_num[-4:] if len(clean_num) >= 4 else "0000"

    link_data = {
        "user_id": current_user.user_id,
        "abha_number_masked": masked_num,
        "abha_number_hash": abha_hash,
        "abha_number_last4": last4,
        "abha_address": kyc_profile.abha_address,
        "verification_status": "verified",
        "verification_method": "abdm_qr",
        "verified_at": now_iso,
        "last_reverified_at": now_iso,
        "unlinked_at": None,
    }

    current_link = await db["abha_links"].find_one({"user_id": current_user.user_id})
    if current_link:
        await db["abha_links"].update_one(
            {"_id": current_link["_id"]},
            {"$set": link_data},
        )
        link_id = current_link["_id"]
    else:
        link_id = generate_abha_link_id()
        link_data["_id"] = link_id
        await db["abha_links"].insert_one(link_data)

    await record_audit_event(
        event_type="ABHA_LINKED",
        user_id=current_user.user_id,
        metadata={"method": "abdm_qr"},
    )

    return {
        "success": True,
        "link_id": link_id,
        "abha_number_masked": masked_num,
        "abha_address": kyc_profile.abha_address,
        "name": kyc_profile.name,
    }
