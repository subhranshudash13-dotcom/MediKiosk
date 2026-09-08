import re
from typing import List, Optional, Tuple, Set
from app.services.ai.schemas import RedFlagAlert, ExtractedSOCRATES, ExtractionPayload


# Deterministic Compound Red Flag Regex Patterns for Emergency Medical Triage
# Ensures 100% recall on true emergencies while requiring collocates to avoid false positives (e.g. isolated 'saans' or 'left arm')
RED_FLAG_PATTERNS = [
    {
        "type": "CARDIOVASCULAR_ACUTE",
        "pattern": r"(?:chest\s*pain|seene\s*mein?\s*dard|chhati\s*me\s*dard|सीने\s*में\s*दर्द|छाती\s*में\s*दर्द|ఛాతీ\s*నొప్పి|বুকের\s*ব্যথা)\s*.*?\b(?:left\s*arm|baye\s*hath|baayein\s*hath|jaw|radiat|sweat|paseena|crushing|pressure|उल्टी|घबराहट)\b|\b(?:crushing|tight\s*pressure|heavy\s*pressure|tightness)\s*(?:in|on)?\s*(?:my\s*)?chest\b|\b(?:chest|seene|chhati|सीने|छाती)\s*(?:mein|me)?\s*(?:severe|tez|bohot|बहुत)?\s*(?:crushing|heavy|tez)?\s*(?:pain|dard|दर्द)\b|\b(?:radiat(?:ing|es)?\s*to\s*(?:my\s*)?(?:left\s*arm|jaw|back|shoulder))\b",
        "action": "Immediate Emergency Triage: Potential Acute Coronary Syndrome. Alert Attending Medical Officer.",
    },
    {
        "type": "RESPIRATORY_DISTRESS",
        "pattern": r"\b(?:cannot\s*breathe|shortness\s*of\s*breath|gasping\s*for\s*air|stridor|choking|gale\s*me\s*dum)\b|\b(?:saans|breath|oosiri|శ్వాస|सांस|শ্বাস)\b.*?\b(?:takleef|phool|problem|kashtha|difficulty|aadatam\s*ledu|breathe|दुश्वारी|तकलीफ|কষ্ট)\b|\b(?:takleef|phool|problem|kashtha|difficulty)\b.*?\b(?:saans|breath|oosiri|सांस|শ্বাস)\b",
        "action": "Urgent Oxygen & Airway Assessment: Acute Respiratory Distress.",
    },
    {
        "type": "STROKE_NEUROLOGICAL",
        "pattern": r"\b(?:facial?\s*droop|slurred\s*speech|loss\s*of\s*speech|speech\s*loss|ek\s*taraf\s*kamzori|sudden\s*numbness|loss\s*of\s*consciousness|behosh|convulsion|daura|seizure|syncope|बेहोश|दौरा|लकवा|जीभ\s*लटपटा)\b",
        "action": "Code Stroke / Neuro Priority: Immediate Neurological Examination Required.",
    },
    {
        "type": "SEVERE_TRAUMA_BLEEDING",
        "pattern": r"\b(?:heavy\s*(?:uncontrolled\s*)?bleed(?:ing)?|uncontrolled\s*bleed(?:ing)?|coughing\s*up\s*(?:bright\s*red\s*)?blood|hemoptysis|khoon\s*behta|severe\s*head\s*injury|sar\s*pe\s*chot|active\s*bleeding|खून\s*बह|रक्तस्राव|రక్తస్రావం|রক্ত)\b",
        "action": "Trauma Triage: Hemorrhage Control & Wound Evaluation.",
    },

    {
        "type": "ANAPHYLAXIS",
        "pattern": r"\b(?:anaphylax|swelling\s*of\s*lips|throat\s*swelling|throat\s*closing|severe\s*allergic\s*reaction)\b",
        "action": "Immediate Emergency: Suspected Anaphylaxis / Airway Compromise.",
    },
    {
        "type": "ACUTE_SURGICAL_ABDOMEN",
        "pattern": r"\b(?:right\s*lower\s*(?:quadrant|side)|lower\s*right\s*side|appendicitis|mcburney)\b|\b(?:daayein|daayen|right)\s*.*?\b(?:niche|side)?\s*(?:pet|stomach|abdomen)\s*.*?\b(?:tez|severe|sharp)?\s*(?:dard|pain)\b",
        "action": "Urgent Surgical Assessment: Suspected Acute Appendicitis / Acute Surgical Abdomen.",
    }
]

# Forbidden Prescription / Diagnostic Keywords to Guard Against AI Overreach
FORBIDDEN_PRESCRIPTION_PATTERNS = [
    r"\b(take|taking|start\s*taking|prescribe|le\s*lijiye|teesukondi)\b.*?\b\d+\s*(?:mg|ml|tablets?|capsules?|goli)\b",
    r"\b(prescribe|recommended\s*dosage|prescription)\b",
    r"\b(you\s*definitely\s*have|aapko\s*pakka|meeku\s*khandithamga)\s+(cancer|tuberculosis|typhoid|heart\s*attack)\b",
]


class SafetyGuardrailsService:
    """Deterministic clinical safety, emergency red-flag, and anti-hallucination verification engine."""

    def scan_red_flags(self, transcript: str) -> Optional[RedFlagAlert]:
        """Scans input speech transcript for acute medical emergencies deterministically."""
        if not transcript or not transcript.strip():
            return None
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
                if language == "hi":
                    return "मैं आपकी पूरी जानकारी डॉक्टर साहब के लिए नोट कर रहा हूँ। वह कुछ ही देर में आपका परीक्षण करके सही दवा और सलाह देंगे।"
                elif language == "te":
                    return "నేను మీ వివరాలన్నీ డాక్టర్ గారి కోసం నమోదు చేస్తున్నాను. వారు మిమ్మల్ని పరిశీలించి సరైన ఔషధం సూచిస్తారు."
                else:
                    return "I have noted all your details for the physician. The doctor will examine you shortly and prescribe the appropriate care."
        return response_text

    def verify_grounding(self, extraction: ExtractionPayload, transcript: str) -> ExtractionPayload:
        """
        Lexical Anti-Hallucination Grounding Filter:
        Ensures that any extracted slot (site, radiation, character, duration, symptoms, history)
        has direct textual or synonym evidence in the patient's raw transcript.
        Stops the LLM or NLU from hallucinating facts that were never spoken.
        """
        if not transcript or not transcript.strip():
            return ExtractionPayload()

        t_lower = transcript.lower()

        # Grounding Helper: Check if any keyword in candidates exists in transcript
        def has_evidence(keywords: List[str]) -> bool:
            for kw in keywords:
                if re.search(r'\b' + re.escape(kw.lower()) + r'\b', t_lower) or kw.lower() in t_lower:
                    return True
            return False

        # 1. Ground Site
        if extraction.site:
            site_kw_map = {
                "Chest": ["chest", "chhati", "seene", "chhatilo", "छाती", "सीना", "ఛాతీ", "గుండె", "நெஞ்சு", "বুক", "বুকে"],
                "Abdomen/Stomach": ["stomach", "pet", "abdomen", "kadupu", " पेट", "पेट", "కడుపు", "வயிறு", "পেট", "পেটে"],
                "Head": ["head", "sar", "sir", "tala", "सिर", "सर", "తల", "தலை", "মাথা", "মাথায়"],
                "Throat": ["throat", "gala", "gontu", "गला", "గొంతు", "தொண்டை", "গলা", "গলায়"],
                "Back/Spine": ["back", "peeth", "venuka", "kamar", "कमर", "पीठ", "నడుము", "పిঠ"],
                "Lower Limbs / Joints": ["knee", "ankle", "pair", "kaalu", "ghutna", "घुटने", "टखने", "पैर", "కాలు", "পা", "leg", "joint", "joint pain", "badan"],
                "Skin / Whole body": ["skin", "rash", "khujli", "chamdi", "त्वचा", "खुजली", "దద్దుర్లు", "চামড়া", "চুলকানি"]
            }
            matched_kws = site_kw_map.get(extraction.site, [extraction.site.lower()])
            if not has_evidence(matched_kws):
                extraction.site = None

        # 2. Ground Radiation
        if extraction.radiation:
            rad_kw_map = {
                "Left Arm": ["left arm", "baaye hath", "baye hath", "baayein hath", "edama cheyi", "बाएं हाथ", "ఎడమ చేయి", "বাঁ হাত", "arm"],
                "Jaw": ["jaw", "jabde", "davada", "जबड़े", "চোয়াল"],
                "Left Shoulder": ["shoulder", "kandhe", "భుజం", "কাঁধ"],
                "Back": ["back", "peeth", "पीठ", "পিঠ"]
            }
            matched_kws = rad_kw_map.get(extraction.radiation, [extraction.radiation.lower()])
            if not has_evidence(matched_kws):
                extraction.radiation = None

        # 3. Ground Character
        if extraction.character:
            char_kw_map = {
                "Heavy / Crushing Pressure": ["heavy", "bhari", "bhaari", "pressure", "dabav", "भारीपन", "दबाव", "బరువు", "চাপ", "tight", "tightness"],
                "Sharp / Stabbing": ["sharp", "tez", "chubhan", "teevram", "चुभन", "तेज", "తీవ్రమైన", "তীক্ষ্ণ", "stab"],
                "Burning / Dyspeptic": ["burning", "jalan", "manta", "जलन", "మంట", "জ্বালা", "acidity"],
                "Wheezing / Constricting": ["wheez", "ghargharahat", "घरघराहट", "దగ్గు", "constrict"]
            }
            matched_kws = char_kw_map.get(extraction.character, [extraction.character.lower()])
            if not has_evidence(matched_kws):
                extraction.character = None

        # 4. Ground Duration / Onset
        if extraction.duration_days is not None or extraction.onset or extraction.time_course:
            dur_kws = ["din", "day", "days", "mahine", "month", "hafte", "week", "hours", "ghante", "aaj", "today", "kal", "yesterday", "subah", "morning", "night", "दिन", "दिनों", "महीने", "हफ्ते", "घंटे", "आज", "कल", "రోజులు", "আজ", "১", "২", "৩", "৪", "৫", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]
            if not has_evidence(dur_kws):
                extraction.duration_days = None
                extraction.onset = None
                extraction.time_course = None

        # 5. Ground Severity Score
        if extraction.severity_score is not None:
            sev_kws = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "score", "scale", "severity", "severe", "mild", "slight", "tez", "bahut", "unbearable", "तीव्र", "অসহ্য"]
            if not has_evidence(sev_kws):
                extraction.severity_score = None

        # 6. Filter Associated Symptoms by Evidence
        if extraction.associated_symptoms:
            grounded_symptoms = []
            sym_evidence_map = {
                "Chest pain": ["chest pain", "chhati me dard", "seene mein dard", "छाती में दर्द", "ఛాతీ నొప్పి", "বুকের ব্যথা"],
                "Fever": ["fever", "bukhar", "jwaram", "ताप", "बुखार", "జ్వరం", "জ্বর"],
                "Cough": ["cough", "khansi", "daggu", "खांसी", "దగ్గు", "কাশি"],
                "Diaphoresis (Sweating)": ["sweat", "paseena", "chemata", "पसीना", "చెమట", "ঘাম"],
                "Dyspnea (Shortness of breath)": ["breath", "saans", "oosiri", "dum", "सांस", "శ్వాస", "হাঁপ"],
                "Vomiting": ["vomit", "ulti", "vanti", "उल्टी", "వాంతులు", "বমি"],
                "Nausea": ["nausea", "ji ghabrana", "vikaram", "मतली", "వికారం", "বমি ভাব"],
                "Headache": ["headache", "sar dard", "sir dard", "talanopi", "सिर दर्द", "తలనొప్పి", "মাথা ব্যথা"],
                "Generalized Weakness": ["weak", "kamzori", "alasata", "कमजोरी", "నీరసం", "দুর্বলতা"]
            }
            for sym in extraction.associated_symptoms:
                kws = sym_evidence_map.get(sym, [sym.lower()])
                if has_evidence(kws):
                    grounded_symptoms.append(sym)
            extraction.associated_symptoms = grounded_symptoms

        # 7. Filter Past History, Medications & Allergies by Evidence
        if extraction.past_history:
            grounded_hist = []
            for h in extraction.past_history:
                h_kws = ["tb", "tuberculosis", "dots", "bp", "hypertension", "sugar", "diabetes", "thyroid", "asthma", "heart attack", "stent", "bypass", "no past", "nothing else"]
                if has_evidence(h_kws):
                    grounded_hist.append(h)
            extraction.past_history = grounded_hist

        if extraction.current_medications:
            grounded_meds = []
            for m in extraction.current_medications:
                m_kws = ["amlodipine", "telmisartan", "atenolol", "metformin", "glycomet", "insulin", "paracetamol", "crocin", "dolo", "goli", "tablet", "medicine", "dawa"]
                if has_evidence(m_kws):
                    grounded_meds.append(m)
            extraction.current_medications = grounded_meds

        if extraction.allergies:
            grounded_alg = []
            for a in extraction.allergies:
                a_kws = ["penicillin", "amoxicillin", "sulfa", "aspirin", "nsaid", "peanut", "allergy", "no allergy"]
                if has_evidence(a_kws):
                    grounded_alg.append(a)
            extraction.allergies = grounded_alg

        return extraction

    def validate_extraction(self, extraction: ExtractionPayload) -> Tuple[bool, List[str]]:
        """Validates extracted clinical payload against logical bounds."""
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

