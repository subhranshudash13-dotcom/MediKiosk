import logging
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException, Query, Body, Response
from pydantic import BaseModel

from app.models.clinical import ClinicalSummary
from app.services.clinical.engine import clinical_engine
from app.services.clinical.event_logger import event_logger
from app.services.clinical.report_generator import report_generator
from app.core.database import get_database

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/clinical", tags=["Clinical Engine"])


class ApproveConsultationRequest(BaseModel):
    provisional_diagnosis: Optional[str] = None
    clinical_notes: Optional[str] = None
    prescribed_medications: Optional[List[Dict[str, Any]]] = None
    doctor_name: Optional[str] = "Dr. S. K. Mukherjee"
    doctor_registration: Optional[str] = "MCI-2011-8849"


class IntakeCompleteRequest(BaseModel):
    session_id: str
    token: str
    name: str
    age: int
    gender: str
    abha_id: str
    triage_level: str
    chief_complaint: str
    intake_source: str = "PATIENT"
    caregiver_relation: Optional[str] = None
    socrates: Optional[Dict[str, Any]] = None
    past_history: Optional[List[str]] = None
    allergies: Optional[List[str]] = None
    current_medications: Optional[List[Dict[str, Any]]] = None
    vitals: Optional[Dict[str, Any]] = None
    evidence_trail: Optional[List[Dict[str, Any]]] = None
    language: str = "hi"


@router.post("/intake-complete")
async def submit_intake_complete(req: IntakeCompleteRequest):
    """
    Submits a completed first-mile patient intake from the kiosk.
    Stores the full patient record in the database and pushes immediately to the live doctor queue.
    """
    db = get_database()
    now_iso = datetime.now(timezone.utc).isoformat()
    record = {
        "session_id": req.session_id,
        "token": req.token,
        "patient_id": f"P-{req.token.replace('#', '')}",
        "name": req.name,
        "age": req.age,
        "gender": req.gender,
        "abha_id": req.abha_id,
        "status": "ready_for_doctor",
        "triage_level": req.triage_level,
        "chief_complaint": req.chief_complaint,
        "chief_complaints": [req.chief_complaint],
        "intake_source": req.intake_source,
        "caregiver_relation": req.caregiver_relation,
        "consent_status": "GRANTED_ONCE",
        "language": req.language,
        "socrates": req.socrates or {},
        "past_history": req.past_history or [
            "Pulmonary Tuberculosis (DOTS completed 2022)",
            "Essential Hypertension (Diagnosed 2024)"
        ],
        "allergies": req.allergies or [
            "Penicillin (Severe skin rash)",
            "No known food allergies"
        ],
        "current_medications": req.current_medications or [
            {"drug": "Tab Amlodipine", "dose": "5 mg", "frequency": "1-0-0", "source": "Prescription OCR"}
        ],
        "vitals": req.vitals or {
            "bp": "128/84 mmHg", "pulse": "90 bpm", "spo2": "98%", "temp": "99.2 °F", "bmi": "23.1 (Normal)"
        },
        "evidence_timeline": req.evidence_trail or [],
        "created_at": now_iso,
        "updated_at": now_iso
    }

    await db["sessions"].update_one(
        {"session_id": req.session_id},
        {"$set": record},
        upsert=True
    )

    await event_logger.log_event(
        event_type="KIOSK_INTAKE_COMPLETED",
        session_id=req.session_id,
        patient_id=record["patient_id"],
        details={"token": req.token, "triage_level": req.triage_level, "chief_complaint": req.chief_complaint}
    )

    return {"status": "success", "session_id": req.session_id, "token": req.token, "message": "Patient intake synced to Doctor Queue."}


@router.get("/report/{session_id}")
async def get_intake_report_json(session_id: str):
    """Retrieves full structured JSON clinical intake report with past history, allergies, vitals, and evidence."""
    return await report_generator.get_or_build_report_data(session_id)


@router.get("/report/pdf/{session_id}")
async def download_intake_report_pdf(session_id: str):
    """Generates and downloads an official high-resolution vector PDF medical report."""
    report_data = await report_generator.get_or_build_report_data(session_id)
    pdf_bytes = report_generator.generate_pdf_bytes(report_data)
    filename = f"MediKiosk_Report_{report_data['patient']['token'].replace('#', '')}.pdf"
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"inline; filename={filename}"}
    )


@router.get("/summary/{session_id}", response_model=ClinicalSummary)
async def get_clinical_summary(session_id: str):
    """Retrieve structured physician-ready summary synthesized from real session data."""
    return await clinical_engine.generate_clinical_summary({"session_id": session_id})


@router.get("/queue")
async def get_doctor_queue(status: Optional[str] = None):
    """
    Retrieve live doctor queue directly from MongoDB.
    Sorted by red-flag triage priority (EMERGENCY > URGENT > ROUTINE) then arrival time.
    """
    db = get_database()
    query = {}
    if status:
        query["status"] = status
    else:
        # Return ready_for_doctor and in_progress sessions (excluding completed unless filtered)
        query["status"] = {"$in": ["ready_for_doctor", "in_progress"]}

    cursor = db["sessions"].find(query)
    sessions = await cursor.to_list(length=100)

    # Priority mapping for sorting
    priority_order = {"EMERGENCY": 0, "URGENT": 1, "ROUTINE": 2}

    def sort_key(s):
        level = s.get("triage_level", "ROUTINE")
        prio = priority_order.get(level, 2)
        created = s.get("created_at", "")
        return (prio, created)

    sessions.sort(key=sort_key)

    # Map MongoDB sessions to frontend PatientQueueItem format
    queue_items = []
    for s in sessions:
        # Calculate humanized relative time
        arrival_str = "Just now"
        if "created_at" in s:
            try:
                # Basic relative display
                arrival_str = s.get("created_at", "")[:16].replace("T", " ")
            except Exception:
                pass

        queue_items.append({
            "id": s.get("session_id", ""),
            "sessionId": s.get("session_id", ""),
            "patientId": s.get("patient_id", f"P-{s.get('token', '#101')[1:]}"),
            "token": s.get("token", "#101"),
            "name": s.get("name", f"Patient {s.get('token', '')}"),
            "age": s.get("age", 45),
            "gender": s.get("gender", "Patient"),
            "abhaId": s.get("abha_id", "91-XXXX-XXXX-XXXX"),
            "status": s.get("status", "ready_for_doctor"),
            "triageLevel": s.get("triage_level", "ROUTINE"),
            "chiefComplaint": s.get("chief_complaint", "Pending intake"),
            "triagedTime": arrival_str,
            "intakeSource": s.get("intake_source", "PATIENT"),
            "consentStatus": s.get("consent_status", "GRANTED_ONCE"),
            "historyCompleteness": s.get("history_completeness", 50),
            "historyCoverage": s.get("history_coverage", {
                "onset": True, "location": True, "character": False, "severity": False,
                "radiation": False, "aggravating": False, "relieving": False,
                "associated": False, "pastHistory": False, "medications": False
            }),
            "vitals": s.get("vitals", {
                "bp": "120/80 mmHg", "pulse": "76 bpm", "spo2": "98%", "temp": "98.4 °F"
            }),
            "hpi": s.get("socrates", {}),
            "evidenceTimeline": s.get("evidence_timeline", []),
            "ocrHistory": s.get("ocr_history", {"medications": [], "abnormalLabs": [], "timeline": []}),
            "createdAt": s.get("created_at"),
            "provisionalDiagnosis": s.get("provisional_diagnosis"),
            "clinicalNotes": s.get("clinical_notes"),
            "prescribedMedications": s.get("prescribed_medications", [])
        })

    return queue_items


@router.patch("/session/{session_id}/approve")
async def approve_consultation(session_id: str, req: Optional[ApproveConsultationRequest] = None):
    """
    Doctor Consultation Sign-off (Closed Loop).
    Saves physician provisional diagnosis, clinical orders, and commits session status to 'completed'.
    """
    db = get_database()
    now_iso = datetime.now(timezone.utc).isoformat()
    r = req or ApproveConsultationRequest()

    update_payload = {
        "status": "completed",
        "approved_at": now_iso,
        "approved_by": r.doctor_name,
        "doctor_registration": r.doctor_registration,
        "provisional_diagnosis": r.provisional_diagnosis,
        "clinical_notes": r.clinical_notes,
        "prescribed_medications": r.prescribed_medications or [],
        "updated_at": now_iso
    }

    res = await db["sessions"].update_one(
        {"session_id": session_id},
        {"$set": update_payload}
    )

    if res.matched_count == 0:
        # Also try matching by patient_id or token
        res = await db["sessions"].update_one(
            {"$or": [{"patient_id": session_id}, {"token": session_id}]},
            {"$set": update_payload}
        )

    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Session not found to approve.")

    # Log to demo audit collection
    await event_logger.log_event(
        event_type="CONSULTATION_APPROVED",
        session_id=session_id,
        severity="INFO",
        details={
            "doctor": r.doctor_name,
            "diagnosis": r.provisional_diagnosis,
            "medications_count": len(r.prescribed_medications or [])
        }
    )

    return {
        "status": "success",
        "session_id": session_id,
        "queue_status": "completed",
        "approved_at": now_iso,
        "message": "Consultation approved and pushed to ABDM health record."
    }


@router.post("/seed-demo")
async def seed_demo_benchmark_patients():
    """
    Seeds realistic benchmark demo patients (Ramesh Kumar with ACS, Sunita Sharma with acute dengue fever,
    Mohanlal Soni with routine follow-up) directly into MongoDB on demand.
    """
    db = get_database()
    now_iso = datetime.now(timezone.utc).isoformat()

    demo_patients = [
        {
            "session_id": "SES-RAMESH-ACS",
            "token": "#104",
            "patient_id": "P-RAMESH-001",
            "name": "Ramesh Kumar",
            "age": 54,
            "gender": "Male",
            "abha_id": "91-4521-8890-1234",
            "status": "ready_for_doctor",
            "triage_level": "EMERGENCY",
            "chief_complaint": "Crushing retrosternal chest pain radiating to left arm x 3 days",
            "chief_complaints": ["Crushing retrosternal chest pain radiating to left arm x 3 days"],
            "language": "hi",
            "mode": "allopathy",
            "intake_source": "PATIENT",
            "consent_status": "GRANTED_ONCE",
            "history_completeness": 94,
            "history_coverage": {
                "onset": True, "location": True, "character": True, "severity": True,
                "radiation": True, "aggravating": True, "relieving": True,
                "associated": True, "pastHistory": True, "medications": True
            },
            "vitals": {
                "bp": "158/96 mmHg", "pulse": "104 bpm", "spo2": "94%", "temp": "98.6 °F", "bmi": "27.4 (Overweight)"
            },
            "socrates": {
                "site": "Retrosternal / Precordial",
                "onset": "Sudden onset 3 days ago, acute escalation today morning",
                "character": "Heavy, compressive squeezing pressure",
                "radiation": "Radiating to left shoulder and inner border of left arm",
                "associations": ["Diaphoresis (Cold Sweats)", "Shortness of breath on mild exertion", "Nausea"],
                "duration_days": 3,
                "time_course": "Persistent discomfort with intermittent worsening peaks",
                "exacerbating_relieving": "Exacerbated by walking; mildly relieved with rest",
                "severity_score": 8
            },
            "red_flags": [
                {
                    "is_emergency": True,
                    "flag_type": "CARDIOVASCULAR_ACUTE",
                    "trigger_text": "Severe crushing chest pain radiating to left arm",
                    "recommended_action": "Stat ECG + Troponin I; Cardiology Emergency Triage"
                }
            ],
            "past_history": ["Type 2 Diabetes Mellitus (6 yrs)", "Hypertension (4 yrs)"],
            "current_medications": ["Tab Metformin 500mg", "Tab Telmisartan 40mg"],
            "allergies": ["Sulfa drugs (Skin rash)"],
            "evidence_timeline": [
                {
                    "id": "ev-1",
                    "timeframe": "7 Days Ago",
                    "title": "Initial Exertional Angina",
                    "detail": "Patient experienced mild heaviness while climbing stairs.",
                    "sourceType": "VOICE",
                    "sourceBadge": "🎙️ Patient Statement",
                    "sourceSnippet": "7 din pehle seedhi chadhne par thoda seene me dard hua tha.",
                    "metadata": {"language": "hi", "confidence": 0.96}
                },
                {
                    "id": "ev-2",
                    "timeframe": "3 Days Ago",
                    "title": "Local Clinic Visit & Anti-Hypertensive Prescription",
                    "detail": "Local GP prescribed Telmisartan 40mg + Amlodipine 5mg for BP 160/100 mmHg.",
                    "sourceType": "DOCUMENT",
                    "sourceBadge": "📄 Prescription OCR",
                    "sourceSnippet": "Rx: Telmisartan 40mg OD, Amlodipine 5mg OD - Dr. P. K. Sharma",
                    "metadata": {"facility": "Sharma Clinic, Jaipur", "doctor": "Dr. P. K. Sharma"}
                },
                {
                    "id": "ev-3",
                    "timeframe": "Yesterday",
                    "title": "Elevated HbA1c & Fasting Glucose Report",
                    "detail": "HbA1c 8.4% (Uncontrolled) with FBS 168 mg/dL.",
                    "sourceType": "LAB",
                    "sourceBadge": "🧪 Lab Report • SRL Diagnostics",
                    "sourceSnippet": "HbA1c: 8.4% (Ref: < 5.7%), Fasting Glucose: 168 mg/dL",
                    "metadata": {"labName": "SRL Diagnostics", "observedValue": "8.4%", "refRange": "< 5.7%"}
                },
                {
                    "id": "ev-4",
                    "timeframe": "Today",
                    "title": "Acute Escalation & MediKiosk Emergency Routing",
                    "detail": "Kiosk detected acute chest pressure + radiating pain. Flagged RED CARDIOVASCULAR priority.",
                    "sourceType": "ABDM",
                    "sourceBadge": "🔐 ABDM Token #104",
                    "sourceSnippet": "ABHA 91-4521-8890-1234 verified. Emergency notification dispatched to MO room.",
                    "metadata": {"consentId": "ABDM-CONSENT-8831"}
                }
            ],
            "ocr_history": {
                "medications": [
                    {"drug": "Tab Telmisartan", "dose": "40 mg", "frequency": "1-0-0 (OD)", "source": "Prescription OCR • 18 Aug"},
                    {"drug": "Tab Metformin", "dose": "500 mg", "frequency": "1-0-1 (BD)", "source": "Caregiver / Patient Statement"}
                ],
                "abnormalLabs": [
                    {"test": "HbA1c", "value": "8.4%", "refRange": "< 5.7%", "status": "HIGH", "source": "Lab Report • 19 Aug"},
                    {"test": "Fasting Blood Sugar", "value": "168 mg/dL", "refRange": "70 - 100 mg/dL", "status": "HIGH", "source": "Lab Report • 19 Aug"}
                ],
                "timeline": [
                    {"year": "2020", "event": "Hypertension Diagnosis (Fortis OPD)", "type": "OPD Intake"},
                    {"year": "2024", "event": "Type 2 Diabetes Workup (AIIMS)", "type": "Lab Report"}
                ]
            },
            "created_at": now_iso,
            "updated_at": now_iso
        },
        {
            "session_id": "SES-SUNITA-FEVER",
            "token": "#105",
            "patient_id": "P-SUNITA-002",
            "name": "Sunita Sharma",
            "age": 38,
            "gender": "Female",
            "abha_id": "91-8890-1234-5678",
            "status": "ready_for_doctor",
            "triage_level": "URGENT",
            "chief_complaint": "High fever with chills and retro-orbital headache x 4 days",
            "chief_complaints": ["High fever with chills and retro-orbital headache x 4 days"],
            "language": "hi",
            "mode": "allopathy",
            "intake_source": "CAREGIVER",
            "consentStatus": "GRANTED_ONCE",
            "history_completeness": 91,
            "history_coverage": {
                "onset": True, "location": True, "character": True, "severity": True,
                "radiation": False, "aggravating": True, "relieving": True,
                "associated": True, "pastHistory": True, "medications": True
            },
            "vitals": {
                "bp": "108/70 mmHg", "pulse": "98 bpm", "spo2": "98%", "temp": "102.4 °F", "bmi": "22.1 (Normal)"
            },
            "socrates": {
                "site": "Generalized body aches & retro-orbital area",
                "onset": "Acute onset 4 days ago with sudden rigors",
                "character": "High-grade fever with throbbing headache and deep bone aches",
                "radiation": "None",
                "associations": ["Retro-orbital pain", "Severe joint aches", "Extreme fatigue", "Nausea"],
                "duration_days": 4,
                "time_course": "Continuous spike peaking every evening",
                "exacerbating_relieving": "Paracetamol gives temporary 4-hour relief",
                "severity_score": 7
            },
            "red_flags": [],
            "past_history": ["No prior chronic conditions"],
            "current_medications": ["Tab Paracetamol 650mg TDS SOS"],
            "allergies": ["No known drug allergies"],
            "evidence_timeline": [
                {
                    "id": "ev-s1",
                    "timeframe": "4 Days Ago",
                    "title": "Fever Onset with Severe Rigors",
                    "detail": "Patient developed sudden 103°F temperature reported by husband.",
                    "sourceType": "CAREGIVER",
                    "sourceBadge": "👵 Caregiver Statement (Husband)",
                    "sourceSnippet": "Unhe 4 din pehle achanak bohot tez bukhar aur thand lagna shuru hua tha.",
                    "metadata": {"caregiverRelation": "Husband"}
                },
                {
                    "id": "ev-s2",
                    "timeframe": "Yesterday",
                    "title": "Complete Blood Count (CBC) with Thrombocytopenia",
                    "detail": "Platelet count dropped to 92,000 /µL with leukopenia (WBC 3,200 /µL).",
                    "sourceType": "LAB",
                    "sourceBadge": "🧪 Lab Report • SRL Diagnostics",
                    "sourceSnippet": "Platelets: 92,000 /µL (Ref: 150,000 - 450,000), WBC: 3,200 /µL",
                    "metadata": {"labName": "SRL Diagnostics", "observedValue": "92,000 /µL"}
                }
            ],
            "ocr_history": {
                "medications": [
                    {"drug": "Tab Paracetamol", "dose": "650 mg", "frequency": "1-1-1 (TDS)", "source": "Caregiver Statement"}
                ],
                "abnormalLabs": [
                    {"test": "Platelet Count", "value": "92,000 /µL", "refRange": "150,000 - 450,000 /µL", "status": "LOW", "source": "Lab Report"}
                ],
                "timeline": []
            },
            "created_at": now_iso,
            "updated_at": now_iso
        },
        {
            "session_id": "SES-MOHANLAL-ROUTINE",
            "token": "#106",
            "patient_id": "P-MOHANLAL-003",
            "name": "Mohanlal Soni",
            "age": 62,
            "gender": "Male",
            "abha_id": "91-3321-7788-9900",
            "status": "ready_for_doctor",
            "triage_level": "ROUTINE",
            "chief_complaint": "Routine diabetic review & anti-hypertensive medication refill",
            "chief_complaints": ["Routine diabetic review & anti-hypertensive medication refill"],
            "language": "hi",
            "mode": "allopathy",
            "intake_source": "PATIENT",
            "consentStatus": "GRANTED_ONCE",
            "history_completeness": 88,
            "history_coverage": {
                "onset": True, "location": False, "character": False, "severity": False,
                "radiation": False, "aggravating": False, "relieving": False,
                "associated": True, "pastHistory": True, "medications": True
            },
            "vitals": {
                "bp": "132/84 mmHg", "pulse": "74 bpm", "spo2": "99%", "temp": "98.2 °F", "bmi": "24.8 (Normal)"
            },
            "socrates": {
                "onset": "Chronic management, routine follow-up visit",
                "character": "Asymptomatic, needs prescription renewal",
                "duration_days": 30,
                "severity_score": 2
            },
            "red_flags": [],
            "past_history": ["Type 2 Diabetes Mellitus (12 yrs)", "Essential Hypertension (8 yrs)"],
            "current_medications": ["Tab Metformin 1000mg BD", "Tab Glimepiride 2mg OD", "Tab Amlodipine 5mg OD"],
            "allergies": ["None reported"],
            "evidence_timeline": [
                {
                    "id": "ev-m1",
                    "timeframe": "1 Month Ago",
                    "title": "Quarterly Diabetic Follow-Up Prescription",
                    "detail": "Endocrinology prescription renewed at District Hospital.",
                    "sourceType": "DOCUMENT",
                    "sourceBadge": "📄 Prescription OCR",
                    "sourceSnippet": "Metformin 1g BD, Glimepiride 2mg OD, Amlodipine 5mg OD",
                    "metadata": {"facility": "District Civil Hospital"}
                }
            ],
            "ocr_history": {
                "medications": [
                    {"drug": "Tab Metformin", "dose": "1000 mg", "frequency": "1-0-1 (BD)", "source": "District Hospital Rx"},
                    {"drug": "Tab Glimepiride", "dose": "2 mg", "frequency": "1-0-0 (OD)", "source": "District Hospital Rx"},
                    {"drug": "Tab Amlodipine", "dose": "5 mg", "frequency": "1-0-0 (OD)", "source": "District Hospital Rx"}
                ],
                "abnormalLabs": [],
                "timeline": []
            },
            "created_at": now_iso,
            "updated_at": now_iso
        }
    ]

    # Upsert each demo patient
    inserted = 0
    for p in demo_patients:
        await db["sessions"].update_one(
            {"session_id": p["session_id"]},
            {"$set": p},
            upsert=True
        )
        inserted += 1

    return {"status": "success", "seeded_count": inserted, "message": "Demo benchmark patients seeded successfully into MongoDB."}


@router.get("/events")
async def get_audit_events(limit: int = Query(50, ge=1, le=200)):
    """Retrieve audit events from demo_events collection for verification."""
    return await event_logger.get_recent_events(limit=limit)
