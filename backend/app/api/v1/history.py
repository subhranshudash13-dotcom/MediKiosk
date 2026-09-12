"""
Patient History API — Unified longitudinal care history endpoints.
Aggregates encounters, OCR documents, and timeline events into a single
chronologically sorted patient history view.
"""
import logging
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, HTTPException, Query, Depends
from pydantic import BaseModel

from app.core.database import get_database
from app.services.auth.dependencies import get_current_user, get_optional_current_user
from app.models.auth import UserContext

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/history", tags=["Patient History"])


# ─── Response Schemas ────────────────────────────────────────────────

class HistoryMedication(BaseModel):
    name: str
    dosage: Optional[str] = None
    frequency: Optional[str] = None
    route: Optional[str] = "oral"
    duration: Optional[str] = None
    indication: Optional[str] = None
    therapeutic_class: Optional[str] = None
    clinical_purpose: Optional[str] = None
    instructions: Optional[str] = None
    confidence: Optional[float] = None


class HistoryLabResult(BaseModel):
    test_name: str
    value: str
    unit: Optional[str] = None
    reference_range: Optional[str] = None
    is_abnormal: bool = False
    severity_flag: Optional[str] = "NORMAL"
    clinical_significance: Optional[str] = None


class HistoryDiagnosis(BaseModel):
    condition: str
    icd10_code: Optional[str] = None
    condition_type: Optional[str] = "provisional"
    notes: Optional[str] = None


class HistoryEncounterRecord(BaseModel):
    """A single encounter (doctor visit) record."""
    record_type: str = "encounter"
    encounter_id: str
    patient_id: str
    patient_name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    encounter_date: str
    hospital_name: Optional[str] = None
    department: Optional[str] = None
    doctor_name: Optional[str] = None
    chief_complaint: Optional[str] = None
    hpi: Optional[str] = None
    socrates: Optional[Dict[str, Any]] = None
    vitals: Optional[Dict[str, Any]] = None
    past_history: List[str] = []
    current_medications: List[Dict[str, Any]] = []
    allergies: List[str] = []
    provisional_diagnosis: Optional[str] = None
    clinical_notes: Optional[str] = None
    prescribed_medications: List[Dict[str, Any]] = []
    follow_up_recommendation: Optional[str] = None
    status: str = "completed"
    is_abdm_synced: bool = False
    created_at: Optional[str] = None


class HistoryDocumentRecord(BaseModel):
    """A single OCR-processed medical document."""
    record_type: str = "document"
    document_id: str
    patient_id: str
    document_type: str
    document_date: Optional[str] = None
    doctor_name: Optional[str] = None
    facility_name: Optional[str] = None
    document_purpose: Optional[str] = None
    clinical_intent: Optional[str] = None
    confidence_score: Optional[float] = None
    extracted_medications: List[HistoryMedication] = []
    extracted_labs: List[HistoryLabResult] = []
    extracted_diagnoses: List[HistoryDiagnosis] = []
    raw_ocr_text: Optional[str] = None
    is_abdm_linked: bool = False
    created_at: Optional[str] = None


class HistoryTimelineEvent(BaseModel):
    """A single timeline event for chronological display."""
    event_id: str
    patient_id: str
    date: str
    record_type: str  # "encounter" | "document" | "session"
    title: str
    summary: Optional[str] = None
    provider_name: Optional[str] = None
    facility_name: Optional[str] = None
    category: Optional[str] = None  # "prescription" | "lab_report" | "consultation" | "discharge_summary"
    medications: List[HistoryMedication] = []
    abnormal_labs: List[HistoryLabResult] = []
    diagnoses: List[str] = []
    is_abdm_verified: bool = False


class PatientHistoryResponse(BaseModel):
    """Unified patient history response combining all record sources."""
    patient_id: str
    patient_name: Optional[str] = None
    total_records: int = 0
    total_encounters: int = 0
    total_documents: int = 0
    timeline: List[HistoryTimelineEvent] = []
    encounters: List[HistoryEncounterRecord] = []
    documents: List[HistoryDocumentRecord] = []
    active_medications: List[HistoryMedication] = []
    critical_lab_alerts: List[str] = []
    last_visit_date: Optional[str] = None
    last_visit_department: Optional[str] = None


# ─── Internal Aggregation Logic ──────────────────────────────────────

async def _build_patient_history(patient_id: str) -> PatientHistoryResponse:
    """
    Aggregates encounters, documents, timeline_events, and sessions
    from MongoDB into a single unified chronological history response.
    """
    db = get_database()

    # 1. Fetch encounters from db["encounters"]
    enc_cursor = db["encounters"].find({"patient_id": patient_id}).sort("encounter_date", -1)
    raw_encounters = await enc_cursor.to_list(length=50)

    # 2. Fetch OCR documents from db["documents"]
    doc_cursor = db["documents"].find({"patient_id": patient_id}).sort("created_at", -1)
    raw_documents = await doc_cursor.to_list(length=50)

    # 3. Fetch stored timeline events from db["timeline_events"]
    te_cursor = db["timeline_events"].find({"patient_id": patient_id}).sort("date", -1)
    raw_timeline_events = await te_cursor.to_list(length=100)

    # 4. Also check completed sessions as fallback data source
    sess_cursor = db["sessions"].find({
        "patient_id": patient_id,
        "status": {"$in": ["completed", "ready_for_doctor"]}
    }).sort("created_at", -1)
    raw_sessions = await sess_cursor.to_list(length=20)

    # 5. For demo patient P-DEMO-001, seed records if DB is fresh
    if patient_id == "P-DEMO-001" and not raw_encounters and not raw_timeline_events:
        from app.services.documents.timeline_service import timeline_service
        await timeline_service.ensure_demo_records_seeded()
        raw_encounters = await db["encounters"].find({"patient_id": patient_id}).sort("encounter_date", -1).to_list(length=50)
        raw_documents = await db["documents"].find({"patient_id": patient_id}).sort("created_at", -1).to_list(length=50)
        raw_timeline_events = await db["timeline_events"].find({"patient_id": patient_id}).sort("date", -1).to_list(length=100)

    # ── Build encounter records ──
    encounters: List[HistoryEncounterRecord] = []
    patient_name = None
    for enc in raw_encounters:
        if not patient_name:
            patient_name = enc.get("patient_name")
        encounters.append(HistoryEncounterRecord(
            encounter_id=enc.get("encounter_id", ""),
            patient_id=enc.get("patient_id", patient_id),
            patient_name=enc.get("patient_name"),
            age=enc.get("age"),
            gender=enc.get("gender"),
            encounter_date=enc.get("encounter_date", ""),
            hospital_name=enc.get("hospital_name"),
            department=enc.get("department"),
            doctor_name=enc.get("doctor_name"),
            chief_complaint=enc.get("chief_complaint"),
            hpi=enc.get("hpi"),
            socrates=enc.get("socrates"),
            vitals=enc.get("vitals"),
            past_history=enc.get("past_history", []),
            current_medications=enc.get("current_medications", []),
            allergies=enc.get("allergies", []),
            provisional_diagnosis=enc.get("provisional_diagnosis"),
            clinical_notes=enc.get("clinical_notes"),
            prescribed_medications=enc.get("prescribed_medications", []),
            follow_up_recommendation=enc.get("follow_up_recommendation"),
            status=enc.get("status", "completed"),
            is_abdm_synced=enc.get("is_abdm_synced", False),
            created_at=enc.get("created_at"),
        ))

    # ── Build document records ──
    documents: List[HistoryDocumentRecord] = []
    for doc in raw_documents:
        meds = []
        for m in doc.get("extracted_medications", []):
            meds.append(HistoryMedication(
                name=m.get("name", "Unknown"),
                dosage=m.get("dosage"),
                frequency=m.get("frequency"),
                route=m.get("route", "oral"),
                duration=m.get("duration"),
                indication=m.get("indication"),
                therapeutic_class=m.get("therapeutic_class"),
                clinical_purpose=m.get("clinical_purpose"),
                instructions=m.get("instructions"),
                confidence=m.get("confidence"),
            ))
        labs = []
        for l in doc.get("extracted_labs", []):
            labs.append(HistoryLabResult(
                test_name=l.get("test_name", ""),
                value=l.get("value", ""),
                unit=l.get("unit"),
                reference_range=l.get("reference_range"),
                is_abnormal=l.get("is_abnormal", False),
                severity_flag=l.get("severity_flag", "NORMAL"),
                clinical_significance=l.get("clinical_significance"),
            ))
        diags = []
        for d in doc.get("extracted_diagnoses", []):
            diags.append(HistoryDiagnosis(
                condition=d.get("condition", ""),
                icd10_code=d.get("icd10_code"),
                condition_type=d.get("condition_type", "provisional"),
                notes=d.get("notes"),
            ))

        doc_date = doc.get("document_date")
        if doc_date and not isinstance(doc_date, str):
            doc_date = str(doc_date)

        created_at = doc.get("created_at")
        if created_at and not isinstance(created_at, str):
            created_at = str(created_at)

        documents.append(HistoryDocumentRecord(
            document_id=doc.get("document_id", ""),
            patient_id=doc.get("patient_id", patient_id),
            document_type=doc.get("document_type", "other"),
            document_date=doc_date,
            doctor_name=doc.get("doctor_name"),
            facility_name=doc.get("facility_name"),
            document_purpose=doc.get("document_purpose"),
            clinical_intent=doc.get("clinical_intent"),
            confidence_score=doc.get("confidence_score"),
            extracted_medications=meds,
            extracted_labs=labs,
            extracted_diagnoses=diags,
            raw_ocr_text=doc.get("raw_ocr_text"),
            is_abdm_linked=doc.get("is_abdm_linked", False),
            created_at=created_at,
        ))

    # ── Build unified timeline ──
    timeline: List[HistoryTimelineEvent] = []

    # From stored timeline_events
    for te in raw_timeline_events:
        te_meds = []
        for m in te.get("medications", []):
            te_meds.append(HistoryMedication(
                name=m.get("name", "Unknown"),
                dosage=m.get("dosage"),
                frequency=m.get("frequency"),
                route=m.get("route"),
                duration=m.get("duration"),
                indication=m.get("indication"),
                confidence=m.get("confidence"),
            ))
        te_labs = []
        for l in te.get("abnormal_labs", []):
            te_labs.append(HistoryLabResult(
                test_name=l.get("test_name", ""),
                value=l.get("value", ""),
                unit=l.get("unit"),
                reference_range=l.get("reference_range"),
                is_abnormal=l.get("is_abnormal", True),
                severity_flag=l.get("severity_flag", "ELEVATED"),
                clinical_significance=l.get("clinical_significance"),
            ))
        te_date = te.get("date")
        if te_date and not isinstance(te_date, str):
            te_date = str(te_date)
        timeline.append(HistoryTimelineEvent(
            event_id=te.get("event_id", ""),
            patient_id=te.get("patient_id", patient_id),
            date=te_date or "",
            record_type=te.get("record_type", "document"),
            title=te.get("title", "Medical Record"),
            summary=te.get("summary"),
            provider_name=te.get("provider_name"),
            facility_name=te.get("facility_name"),
            category=te.get("document_type") or te.get("category"),
            medications=te_meds,
            abnormal_labs=te_labs,
            diagnoses=te.get("diagnoses", []),
            is_abdm_verified=te.get("is_abdm_verified", False),
        ))

    # From encounters (add to timeline if not already present)
    existing_event_ids = {t.event_id for t in timeline}
    for enc in raw_encounters:
        evt_id = f"ENC-{enc.get('encounter_id', '')}"
        if evt_id in existing_event_ids:
            continue
        timeline.append(HistoryTimelineEvent(
            event_id=evt_id,
            patient_id=enc.get("patient_id", patient_id),
            date=enc.get("encounter_date", ""),
            record_type="encounter",
            title=f"Clinical Encounter — {enc.get('department', 'General Medicine')}",
            summary=f"Chief complaint: {enc.get('chief_complaint', 'Consultation')}. "
                    f"Diagnosis: {enc.get('provisional_diagnosis', 'Evaluation pending')}.",
            provider_name=enc.get("doctor_name"),
            facility_name=enc.get("hospital_name"),
            category="consultation",
            medications=[],
            abnormal_labs=[],
            diagnoses=[enc.get("provisional_diagnosis")] if enc.get("provisional_diagnosis") else [],
            is_abdm_verified=enc.get("is_abdm_synced", False),
        ))

    # From completed sessions (fallback if no encounter was created)
    enc_session_ids = {enc.get("session_id") for enc in raw_encounters if enc.get("session_id")}
    for sess in raw_sessions:
        if sess.get("session_id") in enc_session_ids:
            continue  # Already covered by an encounter
        evt_id = f"SES-{sess.get('session_id', '')}"
        if evt_id in existing_event_ids:
            continue
        sess_date = (sess.get("created_at", "") or "")[:10]
        if not patient_name:
            patient_name = sess.get("name") or sess.get("patient_name")
        timeline.append(HistoryTimelineEvent(
            event_id=evt_id,
            patient_id=sess.get("patient_id", patient_id),
            date=sess_date,
            record_type="session",
            title=f"Kiosk Intake Session (Token {sess.get('token', '#---')})",
            summary=f"Chief complaint: {sess.get('chief_complaint', 'Intake session')}.",
            provider_name=None,
            facility_name="MediKiosk Intake Station",
            category="consultation",
            medications=[],
            abnormal_labs=[],
            diagnoses=[],
            is_abdm_verified=False,
        ))

    # Sort timeline by date descending
    timeline.sort(key=lambda t: t.date or "", reverse=True)

    # ── Consolidate active medications (deduplicated by base drug name) ──
    active_meds_map: Dict[str, HistoryMedication] = {}
    # From encounter prescribed_medications
    for enc in encounters:
        for pm in enc.prescribed_medications:
            base = (pm.get("drug") or pm.get("name", "")).split()[0].lower()
            if base and base not in active_meds_map:
                active_meds_map[base] = HistoryMedication(
                    name=pm.get("drug") or pm.get("name", "Unknown"),
                    dosage=pm.get("dose") or pm.get("dosage"),
                    frequency=pm.get("frequency"),
                    route=pm.get("route", "oral"),
                    duration=pm.get("duration"),
                    indication=pm.get("indication"),
                )
        for cm in enc.current_medications:
            base = (cm.get("drug") or cm.get("name", "")).split()[0].lower()
            if base and base not in active_meds_map:
                active_meds_map[base] = HistoryMedication(
                    name=cm.get("drug") or cm.get("name", "Unknown"),
                    dosage=cm.get("dose") or cm.get("dosage"),
                    frequency=cm.get("frequency"),
                    route=cm.get("route", "oral"),
                )
    # From OCR documents
    for doc in documents:
        for med in doc.extracted_medications:
            base = med.name.split()[0].lower()
            if base and base not in active_meds_map:
                active_meds_map[base] = med

    # ── Critical lab alerts ──
    critical_alerts: List[str] = []
    for doc in documents:
        for lab in doc.extracted_labs:
            if lab.severity_flag in ("CRITICAL_HIGH", "CRITICAL_LOW"):
                alert = f"{lab.test_name}: {lab.value} {lab.unit or ''} ({lab.severity_flag})"
                if alert not in critical_alerts:
                    critical_alerts.append(alert)
    for te in timeline:
        for lab in te.abnormal_labs:
            if lab.severity_flag in ("CRITICAL_HIGH", "CRITICAL_LOW"):
                alert = f"{lab.test_name}: {lab.value} {lab.unit or ''} ({lab.severity_flag})"
                if alert not in critical_alerts:
                    critical_alerts.append(alert)

    # ── Derive last visit info ──
    last_visit_date = None
    last_visit_dept = None
    if encounters:
        last_visit_date = encounters[0].encounter_date
        last_visit_dept = encounters[0].department
    elif timeline:
        last_visit_date = timeline[0].date

    return PatientHistoryResponse(
        patient_id=patient_id,
        patient_name=patient_name,
        total_records=len(timeline),
        total_encounters=len(encounters),
        total_documents=len(documents),
        timeline=timeline,
        encounters=encounters,
        documents=documents,
        active_medications=list(active_meds_map.values()),
        critical_lab_alerts=critical_alerts,
        last_visit_date=last_visit_date,
        last_visit_department=last_visit_dept,
    )


# ─── Public Endpoints ────────────────────────────────────────────────

@router.get("/patient/{patient_id}", response_model=PatientHistoryResponse)
async def get_patient_history(patient_id: str):
    """
    Retrieve unified longitudinal history for any patient_id.
    Aggregates encounters, OCR documents, timeline events, and sessions.
    """
    return await _build_patient_history(patient_id)


@router.get("/patient/{patient_id}/documents")
async def get_patient_documents(patient_id: str):
    """
    Retrieve all OCR-processed medical documents for a patient from MongoDB.
    """
    db = get_database()
    cursor = db["documents"].find({"patient_id": patient_id}).sort("created_at", -1)
    docs = await cursor.to_list(length=100)
    # Sanitize _id for JSON serialization
    for d in docs:
        if "_id" in d:
            d["_id"] = str(d["_id"])
        if "document_date" in d and not isinstance(d.get("document_date"), str):
            d["document_date"] = str(d["document_date"])
        if "created_at" in d and not isinstance(d.get("created_at"), str):
            d["created_at"] = str(d["created_at"])
    return {"patient_id": patient_id, "total": len(docs), "documents": docs}


@router.get("/me", response_model=PatientHistoryResponse)
async def get_my_history(current_user: UserContext = Depends(get_current_user)):
    """
    Retrieve the authenticated user's own health history.
    Resolves user_id → patient_id(s) from sessions and encounters,
    then aggregates all records.
    """
    db = get_database()
    user_id = current_user.user_id

    # Find all patient_ids linked to this user
    patient_ids = set()

    # Check sessions for user_id binding
    sess_cursor = db["sessions"].find({"user_id": user_id})
    sessions = await sess_cursor.to_list(length=50)
    for s in sessions:
        pid = s.get("patient_id")
        if pid:
            patient_ids.add(pid)

    # Check patient_profiles for user_id
    profile = await db["patient_profiles"].find_one({"user_id": user_id})
    if profile:
        # Use profile _id as a potential patient_id lookup key
        profile_id = profile.get("_id")
        if profile_id:
            patient_ids.add(str(profile_id))

    if not patient_ids:
        # Return empty history for new users who haven't done intake yet
        return PatientHistoryResponse(
            patient_id=user_id,
            patient_name=profile.get("full_name") if profile else None,
        )

    # Build history from the first (primary) patient_id
    # In multi-identity scenarios, we merge across all patient_ids
    primary_pid = list(patient_ids)[0]
    history = await _build_patient_history(primary_pid)

    # If multiple patient_ids, merge additional records
    if len(patient_ids) > 1:
        for extra_pid in list(patient_ids)[1:]:
            extra_history = await _build_patient_history(extra_pid)
            history.timeline.extend(extra_history.timeline)
            history.encounters.extend(extra_history.encounters)
            history.documents.extend(extra_history.documents)
            for med in extra_history.active_medications:
                base = med.name.split()[0].lower()
                existing_bases = {m.name.split()[0].lower() for m in history.active_medications}
                if base not in existing_bases:
                    history.active_medications.append(med)
            for alert in extra_history.critical_lab_alerts:
                if alert not in history.critical_lab_alerts:
                    history.critical_lab_alerts.append(alert)
        # Re-sort merged timeline
        history.timeline.sort(key=lambda t: t.date or "", reverse=True)
        history.total_records = len(history.timeline)
        history.total_encounters = len(history.encounters)
        history.total_documents = len(history.documents)

    # Override patient_name from profile if available
    if profile and profile.get("full_name"):
        history.patient_name = profile["full_name"]

    return history
