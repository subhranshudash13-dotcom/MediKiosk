from fastapi import APIRouter
from app.models.abdm import AbhaKYC
from app.services.abdm.gateway import abdm_service

router = APIRouter(prefix="/abdm", tags=["ABDM Gateway & ABHA"])


@router.post("/verify-abha", response_model=AbhaKYC)
async def verify_abha_identity(abha_id: str):
    """Verify or link ABHA ID with ABDM Sandbox M1 flow."""
    return await abdm_service.verify_abha(abha_id)
