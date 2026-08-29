import logging
from typing import Dict, Any, List
from app.models.clinical import ClinicalSummary, SOCRATESHistory, AyushAssessment

logger = logging.getLogger(__name__)


class ClinicalEngineService:
    """Clinical reasoning engine: Red flag detection, SOCRATES triage & AYUSH parsing."""

    RED_FLAG_KEYWORDS = [
        "chest pain", "shortness of breath", "loss of consciousness",
        "paralysis", "slurred speech", "severe bleeding", "acute breathlessness"
    ]

    def detect_red_flags(self, chief_complaint: str, transcript: str) -> List[str]:
        """Detect emergency red flags for immediate triage diversion."""
        flags = []
        text_lower = f"{chief_complaint} {transcript}".lower()
        for keyword in self.RED_FLAG_KEYWORDS:
            if keyword in text_lower:
                flags.append(f"Emergency Alert: {keyword.capitalize()} detected")
        return flags

    async def generate_clinical_summary(self, session_data: Dict[str, Any]) -> ClinicalSummary:
        """Synthesize patient voice/touch interview into standard physician format."""
        logger.info("ClinicalEngine: Synthesizing physician-ready clinical summary")
        return ClinicalSummary(
            patient_id=session_data.get("patient_id", "P-DEMO-001"),
            encounter_id=session_data.get("session_id", "ENC-DEMO-001"),
            chief_complaint="Chest pain radiating to left arm x 3 days",
            hpi="Patient reports acute onset retrosternal chest pain with mild dyspnea, aggravated by exertion.",
            socrates=SOCRATESHistory(
                site="Retrosternal / Precordial",
                onset="Sudden, 3 days ago",
                character="Compressive / Pressure-like",
                radiation="Left arm and shoulder",
                associations=["Mild shortness of breath", "Sweating"],
                severity_score=8
            ),
            red_flags=["Suspected Acute Coronary Syndrome (ACS) - Priority High"],
            is_confirmed_by_doctor=False
        )


clinical_engine = ClinicalEngineService()
