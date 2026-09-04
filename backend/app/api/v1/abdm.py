from typing import List, Optional
from pydantic import BaseModel
from fastapi import APIRouter, Query, Body
from app.models.abdm import AbhaKYC, ConsentArtifact
from app.services.abdm.gateway import abdm_service

router = APIRouter(prefix="/abdm", tags=["ABDM Gateway & ABHA"])


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

