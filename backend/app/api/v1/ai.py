from fastapi import APIRouter
from app.services.ai.orchestrator import ai_orchestrator

router = APIRouter(prefix="/ai", tags=["AI Orchestrator"])


@router.post("/chat")
async def conversational_chat(prompt: str):
    """Interact with conversational clinical agent."""
    return await ai_orchestrator.generate_conversational_response(prompt, {})
