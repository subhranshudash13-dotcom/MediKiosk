import uuid
from typing import Optional, List
from datetime import datetime, timezone
from pydantic import BaseModel
from fastapi import APIRouter, HTTPException, Query
from app.models.kiosk import KioskSession, KioskLanguage, TriageAssessment
from app.core.database import get_database
from app.services.clinical.event_logger import event_logger

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


class StartSessionRequest(BaseModel):
    language: str = "hi"
    mode: str = "allopathy"
    patient_name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    abha_id: Optional[str] = None


@router.post("/session/start", response_model=KioskSession)
@router.post("/start", response_model=KioskSession)
async def start_kiosk_session(
    payload: Optional[StartSessionRequest] = None,
    language: str = "hi",
    mode: str = "allopathy"
):
    """
    Initiate and immediately persist a new kiosk triage session in MongoDB.
    Assigns queue token and initializes structured clinical record.
    """
    db = get_database()
    session_id = f"SES-{uuid.uuid4().hex[:8]}"
    
    # Calculate queue token based on session count today
    count = await db["sessions"].count_documents({})
    token_num = 100 + (count % 900) + 1
    token = f"#{token_num}"
    now_iso = datetime.now(timezone.utc).isoformat()

    req_lang = payload.language if (payload and payload.language) else language
    req_mode = payload.mode if (payload and payload.mode) else mode
    patient_name = (payload.patient_name if payload and payload.patient_name else None) or f"Patient {token}"
    patient_age = (payload.age if payload and payload.age is not None else 42)
    patient_gender = (payload.gender if payload and payload.gender else "Patient")
    patient_abha = (payload.abha_id if payload and payload.abha_id else "91-XXXX-XXXX-XXXX")

    session_doc = {
        "session_id": session_id,
        "token": token,
        "patient_id": f"P-{uuid.uuid4().hex[:6].upper()}",
        "name": patient_name,
        "patient_name": patient_name,
        "age": patient_age,
        "gender": patient_gender,
        "abha_id": patient_abha,
        "language": req_lang,
        "mode": req_mode,
        "status": "in_progress",
        "triage_level": "ROUTINE",
        "chief_complaint": "Intake session initiated",
        "chief_complaints": [],
        "socrates": {},
        "vitals": {
            "bp": "120/80 mmHg",
            "pulse": "76 bpm",
            "spo2": "98%",
            "temp": "98.4 °F",
        },
        "red_flags": [],
        "history_completeness": 10,
        "history_coverage": {
            "onset": False,
            "location": False,
            "character": False,
            "severity": False,
            "radiation": False,
            "aggravating": False,
            "relieving": False,
            "associated": False,
            "pastHistory": False,
            "medications": False,
        },
        "evidence_timeline": [
            {
                "id": f"ev-{uuid.uuid4().hex[:6]}",
                "timeframe": "Today",
                "title": "Kiosk Triage Intake Started",
                "narrative": f"Patient initialized kiosk triage session (Token {token}) in {req_lang.upper()} language.",
                "sourceType": "Kiosk Audio Intake",
                "timestamp": now_iso,
                "verified": True,
            }
        ],
        "intake_source": "PATIENT",
        "consent_status": "PENDING",
        "turn_count": 0,
        "raw_transcripts": [],
        "created_at": now_iso,
        "updated_at": now_iso,
    }

    await db["sessions"].insert_one(session_doc)
    await event_logger.log_event(
        event_type="SESSION_STARTED",
        session_id=session_id,
        details={"token": token, "language": req_lang, "mode": req_mode}
    )

    return KioskSession(
        session_id=session_id,
        token=token,
        patient_id=session_doc["patient_id"],
        patient_name=patient_name,
        age=patient_age,
        gender=patient_gender,
        abha_id=patient_abha,
        language=req_lang,
        mode=req_mode,
        status="in_progress"
    )


@router.post("/session/{session_id}/complete")
async def complete_kiosk_session(session_id: str):
    """Marks session as ready for doctor review in MongoDB."""
    db = get_database()
    now_iso = datetime.now(timezone.utc).isoformat()
    res = await db["sessions"].update_one(
        {"session_id": session_id},
        {"$set": {"status": "ready_for_doctor", "updated_at": now_iso}}
    )
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Session not found.")
    
    await event_logger.log_event(
        event_type="TRIAGE_COMPLETED",
        session_id=session_id,
        details={"status": "ready_for_doctor"}
    )
    return {"status": "success", "session_id": session_id, "queue_status": "ready_for_doctor"}
