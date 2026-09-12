import logging
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from app.models.clinical import (
    ClinicalSummary,
    SOCRATESHistory,
    AyushAssessment,
    CompletenessScorecard,
    CareRoutingRecommendation,
    DoctorProfile,
    EvidenceLink
)
from app.core.database import get_database

logger = logging.getLogger(__name__)


# Standard Hospital Department Directory
HOSPITAL_DEPARTMENTS_CONFIG = [
    {
        "department_id": "DEPT-CARDIO",
        "department_name": "Cardiology",
        "keywords": ["chest pain", "heart", "palpitation", "left arm", "angina", "shortness of breath", "bp", "hypertension", "sweating"],
        "description": "Comprehensive cardiac care, ECG, echocardiography, and acute coronary syndrome management.",
        "floor": "Ground Floor, Emergency & Cardio Block",
        "doctors": [
            DoctorProfile(
                doctor_id="DOC-CARDIO-01",
                name="Dr. Anil Deshmukh",
                specialization="Senior Interventional Cardiologist",
                qualification="MD, DM (Cardiology), FACC",
                registration_number="MCI-2009-4412",
                opd_schedule="09:00 AM - 01:00 PM (Mon-Sat)",
                room_number="Room 104 (Cardiology OPD)",
                is_available=True
            ),
            DoctorProfile(
                doctor_id="DOC-CARDIO-02",
                name="Dr. Priya Menon",
                specialization="Consultant Cardiologist",
                qualification="MD (Med), DNB (Cardio)",
                registration_number="MCI-2015-8831",
                opd_schedule="02:00 PM - 05:00 PM (Mon-Fri)",
                room_number="Room 105 (Cardiology OPD)",
                is_available=True
            )
        ]
    },
    {
        "department_id": "DEPT-NEURO",
        "department_name": "Neurology",
        "keywords": ["headache", "dizziness", "vertigo", "seizure", "numbness", "migraine", "chakkar", "tingling", "paralysis", "slurred speech"],
        "description": "Specialized diagnosis and treatment of brain, spinal cord, nerve, and headache disorders.",
        "floor": "2nd Floor, Neuro-Sciences Wing",
        "doctors": [
            DoctorProfile(
                doctor_id="DOC-NEURO-01",
                name="Dr. Rajiv Sharma",
                specialization="Chief Neurologist",
                qualification="MD, DM (Neurology)",
                registration_number="MCI-2006-1928",
                opd_schedule="10:00 AM - 02:00 PM (Mon-Sat)",
                room_number="Room 201 (Neuro OPD)",
                is_available=True
            ),
            DoctorProfile(
                doctor_id="DOC-NEURO-02",
                name="Dr. Shweta Mehta",
                specialization="Consultant Neurologist",
                qualification="MD (Med), DNB (Neurology)",
                registration_number="MCI-2017-6621",
                opd_schedule="02:00 PM - 05:00 PM (Mon-Thu)",
                room_number="Room 202 (Neuro OPD)",
                is_available=True
            )
        ]
    },
    {
        "department_id": "DEPT-PULMO",
        "department_name": "Pulmonology & Respiratory Medicine",
        "keywords": ["cough", "breathlessness", "asthma", "tb", "tuberculosis", "wheezing", "phlegm", "khasi", "saas"],
        "description": "Diagnosis and therapy for asthma, COPD, pulmonary infections, and post-TB follow-ups.",
        "floor": "1st Floor, Chest Clinic",
        "doctors": [
            DoctorProfile(
                doctor_id="DOC-PULMO-01",
                name="Dr. Vikram Sen",
                specialization="Pulmonologist & Chest Specialist",
                qualification="MD (Pulmonary Medicine), FCCP",
                registration_number="MCI-2011-3094",
                opd_schedule="09:00 AM - 01:00 PM (Mon-Sat)",
                room_number="Room 112 (Chest OPD)",
                is_available=True
            )
        ]
    },
    {
        "department_id": "DEPT-GENMED",
        "department_name": "General Medicine",
        "keywords": ["fever", "bukhar", "weakness", "body ache", "fatigue", "vomiting", "dengue", "malaria", "typhoid", "infection", "cold", "flu", "sugar", "diabetes", "refill"],
        "description": "Primary adult medical care, infectious diseases, metabolic management, and chronic illness reviews.",
        "floor": "Ground Floor, Central OPD",
        "doctors": [
            DoctorProfile(
                doctor_id="DOC-GENMED-01",
                name="Dr. S. K. Mukherjee",
                specialization="Senior Consultant Physician",
                qualification="MBBS, MD (Internal Medicine)",
                registration_number="MCI-2011-8849",
                opd_schedule="08:30 AM - 02:00 PM (Daily)",
                room_number="Room 101 (General OPD)",
                is_available=True
            ),
            DoctorProfile(
                doctor_id="DOC-GENMED-02",
                name="Dr. Ananya Roy",
                specialization="Consultant Physician",
                qualification="MBBS, DNB (Family Medicine)",
                registration_number="MCI-2019-1120",
                opd_schedule="01:00 PM - 06:00 PM (Daily)",
                room_number="Room 103 (General OPD)",
                is_available=True
            )
        ]
    },
    {
        "department_id": "DEPT-AYUSH",
        "department_name": "AYUSH & Integrative Medicine",
        "keywords": ["ayurveda", "vata", "pitta", "kapha", "ayush", "herbal", "chronic arthritis", "lifestyle", "panchakarma", "digestion", "indigestion", "agni"],
        "description": "Holistic AYUSH consultations, Ayurvedic Dosha (Prakriti/Vikriti) assessment, and lifestyle therapies.",
        "floor": "3rd Floor, AYUSH Holistic Care Wing",
        "doctors": [
            DoctorProfile(
                doctor_id="DOC-AYUSH-01",
                name="Vaidya Rajeshwar Shastri",
                specialization="Senior Ayurvedic Physician",
                qualification="BAMS, MD (Ayurveda - Kayachikitsa)",
                registration_number="CCIM-2008-5521",
                opd_schedule="09:30 AM - 02:30 PM (Mon-Sat)",
                room_number="Room 301 (Ayurveda OPD)",
                is_available=True
            )
        ]
    }
]


class ClinicalEngineService:
    """
    Clinical reasoning engine providing:
    - SOCRATES history parsing
    - Real-time Red-flag safety escalation
    - Clinical Completeness scoring (0-100%)
    - Care Routing & Department recommendation
    - Evidence-linked clinical summary synthesis
    - Longitudinal history comparison
    """

    RED_FLAG_KEYWORDS = [
        "chest pain", "shortness of breath", "loss of consciousness", "loss of vision",
        "paralysis", "slurred speech", "severe bleeding", "acute breathlessness", "stroke", "anaphylaxis",
        "crushing pain", "radiating pain", "unresponsive", "cyanosis", "severe rigors"
    ]

    def detect_red_flags(self, chief_complaint: str, transcript: str = "") -> List[Dict[str, Any]]:
        """Detect emergency red flags for immediate clinical triage escalation."""
        flags = []
        text_lower = f"{chief_complaint} {transcript}".lower()
        for keyword in self.RED_FLAG_KEYWORDS:
            if keyword in text_lower:
                action = "Priority Emergency Clinical Assessment Required. Route to OPD Triage Staff immediately."
                if "chest" in keyword or "breath" in keyword:
                    action = "Stat ECG, Vitals, and Emergency Cardiology/Triage review required."
                elif "paralysis" in keyword or "speech" in keyword or "stroke" in keyword:
                    action = "Immediate Stroke protocol review & urgent neuro-imaging."
                
                flags.append({
                    "is_emergency": True,
                    "flag_type": "EMERGENCY_ALERT",
                    "trigger_keyword": keyword,
                    "trigger_text": f"Detected clinical concern: '{keyword}'",
                    "recommended_action": action
                })
        return flags

    def calculate_completeness(self, session_doc: Dict[str, Any]) -> CompletenessScorecard:
        """
        Evaluate clinical intake completeness across standard medical history dimensions:
        Chief complaint, Onset, Duration, Location, Character, Severity, Associations, Past history, Medications, Allergies, Family history.
        """
        socrates = session_doc.get("socrates", {})
        chief = session_doc.get("chief_complaint") or session_doc.get("chief_complaints")
        past_hist = session_doc.get("past_history", [])
        meds = session_doc.get("current_medications", [])
        allergies = session_doc.get("allergies", [])
        
        dimensions = {
            "chief_complaint": bool(chief and chief != "Intake session initiated"),
            "onset": bool(socrates.get("onset") or socrates.get("duration_days")),
            "duration": bool(socrates.get("duration_days") or socrates.get("time_course")),
            "location": bool(socrates.get("site")),
            "character": bool(socrates.get("character")),
            "severity": bool(socrates.get("severity_score") is not None),
            "associated_symptoms": bool(socrates.get("associations") or session_doc.get("associated_symptoms")),
            "medication_history": bool(meds),
            "allergy_history": bool(allergies),
            "family_history": bool(session_doc.get("family_history"))
        }

        covered_count = sum(1 for v in dimensions.values() if v)
        total_count = len(dimensions)
        score_pct = int((covered_count / total_count) * 100)

        missing = [k for k, v in dimensions.items() if not v]
        
        # Determine adaptive clarifying prompt
        followup = None
        if not dimensions["severity"]:
            followup = "On a scale of 1 to 10, how severe is your discomfort right now?"
        elif not dimensions["character"]:
            followup = "Could you describe what the sensation feels like (e.g., sharp, dull ache, burning, squeezing, throbbing)?"
        elif not dimensions["allergy_history"]:
            followup = "Do you have any known allergies to medicines, foods, or dust?"
        elif not dimensions["medication_history"]:
            followup = "Are you currently taking any regular daily medications or Ayurvedic remedies?"
        elif not dimensions["onset"]:
            followup = "When did this problem first start, and did it happen suddenly or gradually?"

        return CompletenessScorecard(
            score_percentage=score_pct,
            covered_dimensions=dimensions,
            missing_critical_dimensions=missing,
            adaptive_followup_prompt=followup
        )

    def recommend_care_routing(self, chief_complaint: str, transcript: str = "", mode: str = "allopathy") -> CareRoutingRecommendation:
        """
        Suggests appropriate hospital department, available doctors, and OPD rooms.
        Not a diagnosis — purely operational care routing based on complaint categorization.
        """
        combined_text = f"{chief_complaint} {transcript}".lower()
        
        # Check emergency triggers first
        is_cardio_emergency = any(k in combined_text for k in ["chest pain", "angina", "left arm pain", "heart attack", "crushing pain"])
        
        # If AYUSH mode selected by patient
        if mode.lower() == "ayush" or "ayurved" in combined_text:
            ayush_dept = next((d for d in HOSPITAL_DEPARTMENTS_CONFIG if d["department_id"] == "DEPT-AYUSH"), None)
            if ayush_dept:
                return CareRoutingRecommendation(
                    suggested_department=ayush_dept["department_name"],
                    department_id=ayush_dept["department_id"],
                    clinical_rationale="Patient requested AYUSH holistic assessment and lifestyle / herbal care.",
                    urgency_level="ROUTINE",
                    recommended_action="Proceed to AYUSH OPD for Prakriti, Agni, and Ayurvedic consultation.",
                    available_doctors=ayush_dept["doctors"],
                    is_emergency_diversion=False
                )

        # Match against department keywords
        best_match = None
        highest_score = 0
        for dept in HOSPITAL_DEPARTMENTS_CONFIG:
            score = sum(1 for kw in dept["keywords"] if kw in combined_text)
            if score > highest_score:
                highest_score = score
                best_match = dept

        # Default to General Medicine if no specific match
        if not best_match or highest_score == 0:
            best_match = next((d for d in HOSPITAL_DEPARTMENTS_CONFIG if d["department_id"] == "DEPT-GENMED"), HOSPITAL_DEPARTMENTS_CONFIG[3])

        urgency = "ROUTINE"
        is_emerg = False
        rationale = f"Complaint presentation correlates with {best_match['department_name']} outpatient specialty."

        if is_cardio_emergency:
            urgency = "EMERGENCY"
            is_emerg = True
            rationale = "Acute thoracic/cardiovascular presentation requires immediate priority clinical assessment."
        elif any(k in combined_text for k in ["fever", "dengue", "102", "chills", "dizziness"]):
            urgency = "URGENT"

        return CareRoutingRecommendation(
            suggested_department=best_match["department_name"],
            department_id=best_match["department_id"],
            clinical_rationale=rationale,
            urgency_level=urgency,
            recommended_action=f"Report to {best_match['floor']}. Queue token registered with attending clinician.",
            available_doctors=best_match["doctors"],
            is_emergency_diversion=is_emerg
        )

    async def get_longitudinal_patient_context(self, patient_id: str) -> Dict[str, Any]:
        """
        Retrieves prior encounter history from MongoDB for longitudinal continuity.
        Synthesizes comparative clinical context for returning patient visits.
        """
        db = get_database()
        cursor = db["encounters"].find({"patient_id": patient_id}).sort("encounter_date", -1)
        prior_encounters = await cursor.to_list(length=10)
        
        if not prior_encounters:
            # Check sessions as fallback
            cursor2 = db["sessions"].find({"patient_id": patient_id, "status": "completed"}).sort("created_at", -1)
            prior_encounters = await cursor2.to_list(length=10)

        if not prior_encounters:
            return {
                "has_previous_encounters": False,
                "total_encounters": 0,
                "encounters": [],
                "longitudinal_narrative": "First-time patient intake at this hospital facility."
            }

        latest = prior_encounters[0]
        date_str = latest.get("encounter_date") or latest.get("created_at", "")[:10]
        prev_chief = latest.get("chief_complaint", "General consultation")
        prev_dept = latest.get("department", "General Medicine")
        prev_diag = latest.get("provisional_diagnosis", "Clinical evaluation completed")

        comparison_prompt = f"Previous relevant encounter found: {prev_dept} ({date_str}) for '{prev_chief}'. Diagnosis: {prev_diag}."
        
        return {
            "has_previous_encounters": True,
            "total_encounters": len(prior_encounters),
            "latest_encounter_date": date_str,
            "latest_department": prev_dept,
            "latest_diagnosis": prev_diag,
            "comparison_prompt": comparison_prompt,
            "patient_question": "Has this condition changed since your last visit?",
            "encounters": prior_encounters
        }

    async def generate_clinical_summary(self, session_data: Dict[str, Any]) -> ClinicalSummary:
        """
        Synthesizes patient voice/touch interview into standard physician format
        with full Evidence Linkage, Completeness Scorecard, and Care Routing.
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

            # Build Evidence Links
            evidence_links = []
            for ev in session_doc.get("evidence_timeline", []):
                if isinstance(ev, dict):
                    evidence_links.append(EvidenceLink(
                        id=ev.get("id", "ev-1"),
                        timeframe=ev.get("timeframe", "Today"),
                        title=ev.get("title", "Clinical Finding"),
                        detail=ev.get("detail") or ev.get("narrative"),
                        source_type=ev.get("sourceType", "VOICE"),
                        source_badge=ev.get("sourceBadge"),
                        source_snippet=ev.get("sourceSnippet"),
                        timestamp=ev.get("timestamp"),
                        verified=ev.get("verified", True),
                        metadata=ev.get("metadata")
                    ))

            # Completeness scorecard
            completeness = self.calculate_completeness(session_doc)
            
            # Care routing
            routing = self.recommend_care_routing(chief, mode=session_doc.get("mode", "allopathy"))

            # Format string lists cleanly
            raw_meds = session_doc.get("current_medications") or session_doc.get("medications_current") or session_doc.get("medications") or []
            formatted_meds = []
            for m in raw_meds:
                if isinstance(m, str):
                    formatted_meds.append(m)
                elif isinstance(m, dict):
                    drug_name = m.get("drug") or m.get("name") or "Medication"
                    dosage = m.get("dose") or m.get("dosage") or ""
                    freq = m.get("frequency") or ""
                    formatted_meds.append(f"{drug_name} {dosage} {freq}".strip())

            return ClinicalSummary(
                patient_id=session_doc.get("patient_id", f"P-{session_id[:6]}"),
                encounter_id=session_id,
                chief_complaint=chief,
                hpi=hpi_text,
                socrates=socrates_obj,
                ayush=ayush_obj,
                past_medical_history=[str(p) for p in session_doc.get("past_history", [])],
                medications_current=formatted_meds,
                allergies=[str(a) for a in session_doc.get("allergies", [])],
                family_history=[str(f) for f in session_doc.get("family_history", [])],
                personal_history=[str(p) for p in session_doc.get("personal_history", [])],
                review_of_systems=session_doc.get("review_of_systems", {}),
                red_flags=red_flag_strings,
                abnormal_lab_alerts=session_doc.get("abnormal_lab_alerts", []),
                evidence_links=evidence_links,
                completeness=completeness,
                routing=routing,
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
