from fastapi import APIRouter
from app.api.v1.kiosk import router as kiosk_router
from app.api.v1.clinical import router as clinical_router
from app.api.v1.documents import router as documents_router
from app.api.v1.fhir import router as fhir_router
from app.api.v1.abdm import router as abdm_router
from app.api.v1.ai import router as ai_router

api_router = APIRouter()

api_router.include_router(kiosk_router)
api_router.include_router(clinical_router)
api_router.include_router(documents_router)
api_router.include_router(fhir_router)
api_router.include_router(abdm_router)
api_router.include_router(ai_router)
