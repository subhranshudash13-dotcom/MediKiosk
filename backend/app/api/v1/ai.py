from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Query
from typing import Optional
from pydantic import BaseModel

from app.services.ai.orchestrator import ai_orchestrator
from app.services.ai.schemas import DialogueTurnResponse, ClinicalIntakeState

router = APIRouter(prefix="/ai", tags=["AI Clinical Voice Agent"])


class ChatIntakeRequest(BaseModel):
    session_id: Optional[str] = None
    transcript: str
    language_code: str = "hi"
    synthesize_audio: bool = True


@router.post("/chat-intake", response_model=DialogueTurnResponse)
async def chat_intake(req: ChatIntakeRequest):
    """
    Process a text-based patient clinical intake turn.
    Returns dynamic spoken response, structured clinical state, and optional neural TTS audio.
    """
    return await ai_orchestrator.process_text_turn(
        transcript=req.transcript,
        session_id=req.session_id,
        language_code=req.language_code,
        synthesize_audio=req.synthesize_audio
    )


@router.post("/voice-intake", response_model=DialogueTurnResponse)
async def voice_intake(
    file: UploadFile = File(...),
    session_id: Optional[str] = Form(None),
    language_code: str = Form("hi"),
    synthesize_audio: bool = Form(True)
):
    """
    Process an audio recording from patient push-to-talk microphone.
    Transcribes vernacular speech, updates clinical state, checks red flags, and returns audio reply.
    """
    audio_bytes = await file.read()
    if not audio_bytes:
        raise HTTPException(status_code=400, detail="Empty audio file provided.")

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
