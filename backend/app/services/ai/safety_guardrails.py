import re
from typing import List, Optional, Tuple
from app.services.ai.schemas import RedFlagAlert, ExtractedSOCRATES, ExtractionPayload


# Deterministic Red Flag Regex Patterns for Emergency Medical Triage (Multilingual: English, Hindi, Hinglish, Telugu)
RED_FLAG_PATTERNS = [
    {
        "type": "CARDIOVASCULAR_ACUTE",
        "pattern": r"(chest\s*pain|seene\s*mein\s*dard|chhati\s*me\s*dard|left\s*arm|jaw\s*pain|crushing\s*pressure|radiat(ing|es)\s*to\s*(arm|jaw|back)|chhati\s*lo\s*noppi|सीने\s*में\s*दर्द|छाती\s*में\s*दर्द|बाएं\s*हाथ|छाती\s*నొప్పి)",
        "action": "Immediate Emergency Triage: Potential Acute Coronary Syndrome. Alert Attending Medical Officer.",
    },
    {
        "type": "RESPIRATORY_DISTRESS",
        "pattern": r"(cannot\s*breathe|saans|gasping|gale\s*me\s*dum|oosiri\s*aadatam\s*ledu|shortness\s*of\s*breath|stridor|सांस|दम\s*घुट|శ్వాస)",
        "action": "Urgent Oxygen & Airway Assessment: Acute Respiratory Distress.",
    },
    {
        "type": "STROKE_NEUROLOGICAL",
        "pattern": r"(face\s*droop|slurred\s*speech|ek\s*taraf\s*kamzori|sudden\s*numbness|loss\s*of\s*consciousness|behosh|convulsion|daura|बेहोश|दौरा|लकवा|ముఖం\s*వంకర)",
        "action": "Code Stroke / Neuro Priority: Immediate Neurological Examination Required.",
    },
    {
        "type": "SEVERE_TRAUMA_BLEEDING",
        "pattern": r"(heavy\s*bleed|khoon\s*behta|accident|severe\s*head\s*injury|sar\s*pe\s*chot|खून\s*बह|चोट|रक्तस्राव|రక్తస్రావం)",
        "action": "Trauma Triage: Hemorrhage Control & Wound Evaluation.",
    }
]

# Forbidden Prescription / Diagnostic Keywords to Guard Against AI Overreach
FORBIDDEN_PRESCRIPTION_PATTERNS = [
    r"\b(take|le\s*lijiye|teesukondi)\s+\d+\s*(mg|ml|tablets?|goli)\b",
    r"\b(prescribe|recommended\s*dosage|prescription)\b",
    r"\b(you\s*definitely\s*have|aapko\s*pakka|meeku\s*khandithamga)\s+(cancer|tuberculosis|typhoid|heart\s*attack)\b",
]


class SafetyGuardrailsService:
    """Deterministic clinical safety, emergency red-flag, and anti-hallucination verification engine."""

    def scan_red_flags(self, transcript: str) -> Optional[RedFlagAlert]:
        """Scans input speech transcript for acute medical emergencies deterministically."""
        cleaned_text = transcript.lower()
        for alert_def in RED_FLAG_PATTERNS:
            if re.search(alert_def["pattern"], cleaned_text, re.IGNORECASE):
                return RedFlagAlert(
                    is_emergency=True,
                    flag_type=alert_def["type"],
                    trigger_text=transcript,
                    recommended_action=alert_def["action"]
                )
        return None

    def sanitize_model_output(self, response_text: str, language: str = "hi") -> str:
        """Ensures the LLM never accidentally prescribes medications or claims diagnoses."""
        for pattern in FORBIDDEN_PRESCRIPTION_PATTERNS:
            if re.search(pattern, response_text, re.IGNORECASE):
                # Fallback safe medical phrasing
                if language == "hi":
                    return "मैं आपकी पूरी जानकारी डॉक्टर साहब के लिए नोट कर रहा हूँ। वह कुछ ही देर में आपका परीक्षण करके सही दवा और सलाह देंगे।"
                elif language == "te":
                    return "నేను మీ వివరాలన్నీ డాక్టర్ గారి కోసం నమోదు చేస్తున్నాను. వారు మిమ్మల్ని పరిశీలించి సరైన ఔషధం సూచిస్తారు."
                else:
                    return "I have noted all your details for the physician. The doctor will examine you shortly and prescribe the appropriate care."
        return response_text

    def validate_extraction(self, extraction: ExtractionPayload) -> Tuple[bool, List[str]]:
        """
        Validates extracted clinical payload against logical bounds.
        Returns (is_valid, validation_errors).
        """
        errors = []
        if extraction.duration_days is not None and extraction.duration_days < 0:
            errors.append("Duration days cannot be negative.")
        if extraction.severity_score is not None and not (1 <= extraction.severity_score <= 10):
            errors.append("Severity score must be between 1 and 10.")
        return len(errors) == 0, errors

    def calculate_socrates_completeness(self, socrates: ExtractedSOCRATES) -> float:
        """Calculates what percentage of the standard SOCRATES triage has been captured."""
        fields = [
            socrates.site,
            socrates.onset,
            socrates.character,
            socrates.radiation,
            socrates.time_course or socrates.duration_days,
            socrates.exacerbating_relieving,
            socrates.severity_score,
        ]
        completed = sum(1 for f in fields if f is not None and f != "")
        return round(completed / len(fields), 2)


safety_guardrails = SafetyGuardrailsService()
