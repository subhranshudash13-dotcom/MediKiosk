import logging
from typing import Dict, Any, List, Optional
from app.models.clinical import ClinicalSummary, SOCRATESHistory, AyushAssessment
from app.core.database import get_database

logger = logging.getLogger(__name__)


class ClinicalEngineService:
    """Clinical reasoning engine: Dynamic summary generation, SOCRATES history & red flag synthesis."""

    RED_FLAG_KEYWORDS = [
        "chest pain", "shortness of breath", "loss of consciousness",
        "paralysis", "slurred speech", "severe bleeding", "acute breathlessness", "stroke", "anaphylaxis"
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
        """
        Synthesizes patient voice/touch interview into standard physician format
        dynamically querying the specific session from MongoDB.
        """
        session_id = session_data.get("session_id", "")
        db = get_database()
        
        session_doc = None
        if session_id:
            session_doc = await db["sessions"].find_one({"session_id": session_id})
        
        if not session_doc:
            # Check by patient_id or encounter token
            session_doc = await db["sessions"].find_one({"$or": [{"patient_id": session_id}, {"token": session_id}]})

        if session_doc:
            logger.info(f"ClinicalEngine: Generating dynamic summary for session '{session_id}'")
            raw_socrates = session_doc.get("socrates", {})
            socrates_obj = SOCRATESHistory(
                site=raw_socrates.get("site"),
                onset=raw_socrates.get("onset") or (f"{raw_socrates.get('duration_days')} days ago" if raw_socrates.get("duration_days") else None),
                character=raw_socrates.get("character"),
                radiation=raw_socrates.get("radiation"),
                associations=raw_socrates.get("associations", []) or session_doc.get("associated_symptoms", []),
                time_course=raw_socrates.get("time_course"),
                exacerbating_relieving=raw_socrates.get("exacerbating_relieving"),
                severity_score=raw_socrates.get("severity_score")
            )

            # Generate natural HPI narrative
            chief = session_doc.get("chief_complaint") or (session_doc.get("chief_complaints", ["Patient presentation"])[0] if session_doc.get("chief_complaints") else "Clinical evaluation requested")
            hpi_parts = [f"Patient presents with {chief.lower()}."]
            if socrates_obj.onset:
                hpi_parts.append(f"Onset is described as {socrates_obj.onset}.")
            if socrates_obj.character:
                hpi_parts.append(f"Character is {socrates_obj.character.lower()}.")
            if socrates_obj.radiation:
                hpi_parts.append(f"Radiates to {socrates_obj.radiation.lower()}.")
            if socrates_obj.severity_score:
                hpi_parts.append(f"Patient rates current severity at {socrates_obj.severity_score}/10.")
            if socrates_obj.associations:
                hpi_parts.append(f"Associated with {', '.join(socrates_obj.associations)}.")
            
            hpi_text = " ".join(hpi_parts)

            # Extract red flags
            red_flag_strings = []
            for rf in session_doc.get("red_flags", []):
                if isinstance(rf, dict):
                    red_flag_strings.append(f"{rf.get('flag_type', 'EMERGENCY')}: {rf.get('recommended_action', 'Immediate evaluation required')}")
                elif isinstance(rf, str):
                    red_flag_strings.append(rf)

            # Extract Ayush assessment if present
            ayush_doc = session_doc.get("ayush")
            ayush_obj = None
            if ayush_doc:
                ayush_obj = AyushAssessment(
                    prakriti=ayush_doc.get("prakriti"),
                    vikriti=ayush_doc.get("vikriti"),
                    agni=ayush_doc.get("agni"),
                    koshtha=ayush_doc.get("koshtha"),
                    ahara_vihara=ayush_doc.get("ahara_vihara"),
                    nidana=ayush_doc.get("nidana")
                )

            return ClinicalSummary(
                patient_id=session_doc.get("patient_id", f"P-{session_id[:6]}"),
                encounter_id=session_id,
                chief_complaint=chief,
                hpi=hpi_text,
                socrates=socrates_obj,
                ayush=ayush_obj,
                past_medical_history=session_doc.get("past_history", []),
                medications_current=session_doc.get("current_medications", []),
                allergies=session_doc.get("allergies", []),
                red_flags=red_flag_strings,
                abnormal_lab_alerts=session_doc.get("abnormal_lab_alerts", []),
                physician_notes=session_doc.get("clinical_notes"),
                is_confirmed_by_doctor=(session_doc.get("status") == "completed")
            )

        # Fallback if session ID is completely unknown
        logger.warning(f"ClinicalEngine: Session '{session_id}' not found in database. Returning uninitialized summary.")
        return ClinicalSummary(
            patient_id=session_data.get("patient_id", "P-UNKNOWN"),
            encounter_id=session_id or "ENC-NEW",
            chief_complaint="Unregistered Intake Session",
            hpi="Intake session record has not yet collected patient symptoms.",
            socrates=SOCRATESHistory(),
            red_flags=[],
            is_confirmed_by_doctor=False
        )


clinical_engine = ClinicalEngineService()
