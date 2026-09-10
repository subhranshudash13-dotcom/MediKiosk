from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Query
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

from app.services.ai.orchestrator import ai_orchestrator
from app.services.ai.schemas import DialogueTurnResponse, ClinicalIntakeState

router = APIRouter(prefix="/ai", tags=["AI Clinical Voice Agent"])


class ChatIntakeRequest(BaseModel):
    session_id: Optional[str] = None
    transcript: Optional[str] = None
    user_utterance: Optional[str] = None
    text: Optional[str] = None
    language_code: str = "hi"
    synthesize_audio: bool = True
    patient_name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    abha_id: Optional[str] = None
    past_history: Optional[List[str]] = None
    current_medications: Optional[List[str]] = None
    allergies: Optional[List[str]] = None
    historical_clues: Optional[List[Dict[str, Any]]] = None


@router.post("/chat-intake", response_model=DialogueTurnResponse)
@router.post("/dialogue", response_model=DialogueTurnResponse)
async def chat_intake(req: ChatIntakeRequest):
    """
    Process a text-based patient clinical intake turn.
    Accepts transcript, user_utterance, or text field along with optional longitudinal health profile.
    Returns dynamic spoken response, structured clinical state, and optional Bhashini neural TTS audio.
    """
    utterance = req.transcript or req.user_utterance or req.text or ""
    
    # Pre-seed session with patient history if provided
    ai_orchestrator.get_or_create_session(
        session_id=req.session_id,
        language=req.language_code,
        patient_name=req.patient_name,
        age=req.age,
        gender=req.gender,
        abha_id=req.abha_id,
        past_history=req.past_history,
        current_medications=req.current_medications,
        allergies=req.allergies,
        historical_clues=req.historical_clues
    )

    return await ai_orchestrator.process_text_turn(
        transcript=utterance,
        session_id=req.session_id,
        language_code=req.language_code,
        synthesize_audio=req.synthesize_audio
    )


@router.post("/voice-intake", response_model=DialogueTurnResponse)
async def voice_intake(
    file: UploadFile = File(...),
    session_id: Optional[str] = Form(None),
    language_code: str = Form("hi"),
    synthesize_audio: bool = Form(True),
    patient_name: Optional[str] = Form(None),
    age: Optional[int] = Form(None),
    gender: Optional[str] = Form(None),
    abha_id: Optional[str] = Form(None)
):
    """
    Process an audio recording from patient push-to-talk microphone.
    Transcribes vernacular speech via Bhashini IndicASR, updates clinical state, checks red flags, and returns audio reply.
    """
    audio_bytes = await file.read()
    if not audio_bytes:
        raise HTTPException(status_code=400, detail="Empty audio file provided.")

    ai_orchestrator.get_or_create_session(
        session_id=session_id,
        language=language_code,
        patient_name=patient_name,
        age=age,
        gender=gender,
        abha_id=abha_id
    )

    return await ai_orchestrator.process_voice_turn(
        audio_bytes=audio_bytes,
        session_id=session_id,
        language_code=language_code,
        synthesize_audio=synthesize_audio
    )


@router.get("/session/{session_id}/state", response_model=Optional[ClinicalIntakeState])
async def get_session_state(session_id: str):
    """Retrieve the current structured clinical summary and SOCRATES intake details."""
    state = ai_orchestrator.get_session_state(session_id)
    if not state:
        raise HTTPException(status_code=404, detail=f"Session {session_id} not found.")
    return state


@router.post("/session/{session_id}/reset")
async def reset_session(session_id: str):
    """Reset a clinical session for a new patient."""
    ai_orchestrator.reset_session(session_id)
    return {"status": "success", "message": f"Session {session_id} has been reset."}

