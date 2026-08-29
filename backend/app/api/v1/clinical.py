from fastapi import APIRouter
from app.models.clinical import ClinicalSummary
from app.services.clinical.engine import clinical_engine

router = APIRouter(prefix="/clinical", tags=["Clinical Engine"])


@router.get("/summary/{session_id}", response_model=ClinicalSummary)
async def get_clinical_summary(session_id: str):
    """Retrieve structured physician-ready summary for a session."""
    return await clinical_engine.generate_clinical_summary({"session_id": session_id})
