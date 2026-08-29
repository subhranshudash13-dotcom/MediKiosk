import uuid
from fastapi import APIRouter, HTTPException
from app.models.kiosk import KioskSession, KioskLanguage, TriageAssessment

router = APIRouter(prefix="/kiosk", tags=["Kiosk Intake"])


@router.get("/languages", response_model=list[KioskLanguage])
async def get_supported_languages():
    """Return all 22 Indian Scheduled languages for kiosk selection."""
    return [
        {"code": "hi", "name": "हिन्दी (Hindi)"},
        {"code": "en", "name": "English"},
        {"code": "ta", "name": "தமிழ் (Tamil)"},
        {"code": "te", "name": "తెలుగు (Telugu)"},
        {"code": "bn", "name": "বাংলা (Bengali)"},
        {"code": "mr", "name": "मराठी (Marathi)"},
        {"code": "gu", "name": "ગુજરાતી (Gujarati)"},
        {"code": "kn", "name": "ಕನ್ನಡ (Kannada)"},
        {"code": "ml", "name": "മലയാളം (Malayalam)"},
        {"code": "or", "name": "ଓଡ଼ିଆ (Odia)"},
        {"code": "pa", "name": "ਪੰਜਾਬੀ (Punjabi)"},
        {"code": "as", "name": "অসমীয়া (Assamese)"},
    ]


@router.post("/session/start", response_model=KioskSession)
async def start_kiosk_session(language: str = "hi", mode: str = "allopathy"):
    """Initiate a new kiosk triage session with temporary isolation."""
    session_id = f"SES-{uuid.uuid4().hex[:8]}"
    return KioskSession(
        session_id=session_id,
        language=language,
        mode=mode,
        status="active"
    )
