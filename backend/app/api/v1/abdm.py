import uuid
from typing import List, Optional
from pydantic import BaseModel
from fastapi import APIRouter, Query, Body, Depends, HTTPException, status

from app.models.abdm import AbhaKYC, ConsentArtifact
from app.models.auth import AbdmConsentCreateRequest, AbdmConsentResponse, UserContext
from app.models.user import generate_consent_id, get_current_utc_iso
from app.core.database import get_database
from app.services.abdm.gateway import abdm_service
from app.services.auth.dependencies import get_current_user, require_abha_linked
from app.services.auth.audit import record_audit_event

router = APIRouter(prefix="/abdm", tags=["ABDM Gateway & Consent"])


class OTPRequest(BaseModel):
    identifier: str


class OTPVerifyRequest(BaseModel):
    txn_id: str
    otp: str
    identifier: str


class ConsentCreateRequest(BaseModel):
    abha_id: str
    hi_types: List[str] = ["Prescription", "DiagnosticReport", "OPConsultation"]
    purpose: str = "CAREGIV"


@router.post("/generate-otp")
async def generate_abdm_otp(payload: OTPRequest):
    """Generate ABDM OTP for Mobile or ABHA ID (M1)."""
    return await abdm_service.generate_otp(payload.identifier)


@router.post("/verify-otp", response_model=AbhaKYC)
async def verify_abdm_otp(payload: OTPVerifyRequest):
    """Verify ABDM OTP and fetch KYC profile (M1)."""
    return await abdm_service.verify_otp(payload.txn_id, payload.otp, payload.identifier)


@router.post("/verify-abha", response_model=AbhaKYC)
async def verify_abha_identity(abha_id: str = Query(..., description="14-digit ABHA ID or abhaAddress@abdm")):
    """Verify or link ABHA ID with ABDM Sandbox M1 flow."""
    return await abdm_service.verify_abha(abha_id)


@router.post("/scan-qr", response_model=AbhaKYC)
async def scan_abdm_qr(qr_token: str = Body(default="SAMPLE_COUNTER_TOKEN")):
    """Scan & Share ABHA Counter QR Code (M1)."""
    return await abdm_service.scan_qr_code(qr_token)


@router.post("/consent/request", response_model=ConsentArtifact)
async def request_abdm_consent(payload: ConsentCreateRequest):
    """Create ABDM M3 Consent Request to fetch historic health records."""
    return await abdm_service.create_consent_request(payload.abha_id, payload.hi_types, payload.purpose)


@router.get("/linked-records/{abha_id}")
async def get_patient_linked_records(abha_id: str):
    """Retrieve discovered FHIR health records from linked HIPs (M3)."""
    return await abdm_service.get_linked_records(abha_id)


# Stateful Consent Lifecycle Endpoints (Persisted in MongoDB abdm_consents)

@router.post("/consents", response_model=AbdmConsentResponse, status_code=status.HTTP_201_CREATED)
async def create_stateful_consent(
    payload: AbdmConsentCreateRequest,
    current_user: UserContext = Depends(require_abha_linked),
):
    """
    Create a persistent ABDM Consent Request for the authenticated patient.
    Requires an active verified ABHA link. State is initialized as REQUESTED.
    """
    db = get_database()
    abha_link = await db["abha_links"].find_one({
        "user_id": current_user.user_id,
        "verification_status": "verified",
        "unlinked_at": None,
    })

    consent_id = generate_consent_id()
    abdm_id = f"abdm-req-{uuid.uuid4().hex[:8]}"
    now_iso = get_current_utc_iso()

    doc = {
        "_id": consent_id,
        "user_id": current_user.user_id,
        "abha_link_id": abha_link.get("_id") if abha_link else None,
        "abdm_consent_id": abdm_id,
        "purpose": payload.purpose,
        "hi_types": payload.hi_types,
        "status": "REQUESTED",
        "requested_at": now_iso,
        "granted_at": None,
        "expires_at": None,
        "revoked_at": None,
    }
    await db["abdm_consents"].insert_one(doc)

    await record_audit_event(
        event_type="ABDM_CONSENT_REQUESTED",
        user_id=current_user.user_id,
        metadata={"consent_id": consent_id, "purpose": payload.purpose},
    )

    return AbdmConsentResponse(
        id=consent_id,
        user_id=current_user.user_id,
        abha_link_id=doc["abha_link_id"],
        abdm_consent_id=abdm_id,
        purpose=payload.purpose,
        hi_types=payload.hi_types,
        status="REQUESTED",
        requested_at=now_iso,
    )


@router.get("/consents", response_model=List[AbdmConsentResponse])
async def list_consents(current_user: UserContext = Depends(get_current_user)):
    """List all consent requests for current patient."""
    db = get_database()
    cursor = db["abdm_consents"].find({"user_id": current_user.user_id})
    docs = await cursor.to_list()
    return [
        AbdmConsentResponse(
            id=d["_id"],
            user_id=d["user_id"],
            abha_link_id=d.get("abha_link_id"),
            abdm_consent_id=d["abdm_consent_id"],
            purpose=d["purpose"],
            hi_types=d.get("hi_types", []),
            status=d["status"],
            requested_at=d["requested_at"],
            granted_at=d.get("granted_at"),
            expires_at=d.get("expires_at"),
            revoked_at=d.get("revoked_at"),
        )
        for d in docs
    ]


@router.get("/consents/{consent_id}", response_model=AbdmConsentResponse)
async def get_consent_details(
    consent_id: str,
    current_user: UserContext = Depends(get_current_user),
):
    """Retrieve detailed state of a specific consent."""
    db = get_database()
    doc = await db["abdm_consents"].find_one({
        "_id": consent_id,
        "user_id": current_user.user_id,
    })
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Consent not found.")

    return AbdmConsentResponse(
        id=doc["_id"],
        user_id=doc["user_id"],
        abha_link_id=doc.get("abha_link_id"),
        abdm_consent_id=doc["abdm_consent_id"],
        purpose=doc["purpose"],
        hi_types=doc.get("hi_types", []),
        status=doc["status"],
        requested_at=doc["requested_at"],
        granted_at=doc.get("granted_at"),
        expires_at=doc.get("expires_at"),
        revoked_at=doc.get("revoked_at"),
    )


@router.post("/consents/{consent_id}/revoke")
async def revoke_consent(
    consent_id: str,
    current_user: UserContext = Depends(get_current_user),
):
    """Revoke an existing patient consent."""
    db = get_database()
    now_iso = get_current_utc_iso()

    res = await db["abdm_consents"].update_one(
        {"_id": consent_id, "user_id": current_user.user_id},
        {"$set": {"status": "REVOKED", "revoked_at": now_iso}},
    )
    if res.matched_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Consent not found.")

    await record_audit_event(
        event_type="ABDM_CONSENT_REVOKED",
        user_id=current_user.user_id,
        metadata={"consent_id": consent_id},
    )
    return {"success": True, "message": "Consent successfully revoked."}
