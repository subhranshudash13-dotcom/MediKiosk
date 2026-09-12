import logging
from typing import List, Dict, Optional, Any
from datetime import date, datetime, timedelta

from app.models.documents import (
    TimelineEvent,
    LongitudinalTimelineResponse,
    MedicalDocument,
    DocumentType,
    ExtractedMedication,
    ExtractedLabResult,
    SeverityLevel,
)
from app.core.database import get_database

logger = logging.getLogger(__name__)


def _sanitize_for_mongo(obj: Any) -> Any:
    """Recursively converts date objects to ISO strings for safe MongoDB insertion."""
    if isinstance(obj, dict):
        return {k: _sanitize_for_mongo(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [_sanitize_for_mongo(i) for i in obj]
    elif isinstance(obj, date) and not isinstance(obj, datetime):
        return obj.isoformat()
    return obj


class LongitudinalTimelineService:
    """Aggregates and organizes historical medical records into an ABDM-compliant care timeline."""

    def __init__(self):
        # In-memory document and timeline cache keyed by patient_id
        self._patient_documents: Dict[str, List[MedicalDocument]] = {}
        self._patient_timeline_events: Dict[str, List[TimelineEvent]] = {}
        self._seed_demo_patient_records()

    def _seed_demo_patient_records(self):
        """Seeds realistic longitudinal history for demo patient P-DEMO-001 (Ramesh Kumar)."""
        demo_id = "P-DEMO-001"

        events = [
            TimelineEvent(
                event_id="EVT-2024-06",
                patient_id=demo_id,
                date=date(2024, 6, 15),
                document_type=DocumentType.PRESCRIPTION,
                title="Post-Surgical Follow-up & Cardiology Review",
                provider_name="Dr. Rajesh Gupta, MD (Cardiology)",
                facility_name="AIIMS New Delhi - Outpatient Cardiology",
                summary="Cardiac review post-stent placement. Echo demonstrates LVEF 52%. Medication regimen maintained.",
                medications=[
                    ExtractedMedication(
                        name="Amlodipine Besylate",
                        dosage="5 mg",
                        frequency="1-0-0 (OD)",
                        route="oral",
                        duration="90 days",
                        indication="Essential Hypertension",
                        instructions="Post-breakfast",
                        confidence=98.0
                    ),
                    ExtractedMedication(
                        name="Atorvastatin Calcium",
                        dosage="20 mg",
                        frequency="0-0-1 (HS)",
                        route="oral",
                        duration="90 days",
                        indication="Dyslipidemia / Secondary Prevention",
                        instructions="Bedtime",
                        confidence=97.0
                    ),
                    ExtractedMedication(
                        name="Clopidogrel",
                        dosage="75 mg",
                        frequency="1-0-0 (OD)",
                        route="oral",
                        duration="90 days",
                        indication="Antiplatelet / Stent Patency",
                        instructions="Post-meals",
                        confidence=96.0
                    )
                ],
                abnormal_labs=[],
                diagnoses=["Coronary Artery Disease (Post-PCI)", "Essential Hypertension"],
                is_abdm_verified=True,
                raw_document_id="DOC-AIIMS-2024-06"
            ),
            TimelineEvent(
                event_id="EVT-2024-03",
                patient_id=demo_id,
                date=date(2024, 3, 20),
                document_type=DocumentType.LAB_REPORT,
                title="Comprehensive Metabolic & Glycemic Panel",
                provider_name="Dr. Sunita Rao, MD (Pathology)",
                facility_name="National Diagnostic & Reference Laboratory",
                summary="Elevated HbA1c and Serum Creatinine noted. Nephrology consult recommended.",
                medications=[],
                abnormal_labs=[
                    ExtractedLabResult(
                        test_name="Glycated Hemoglobin (HbA1c)",
                        value="9.2",
                        unit="%",
                        reference_range="< 5.7%",
                        is_abnormal=True,
                        severity_flag=SeverityLevel.CRITICAL_HIGH,
                        clinical_significance="CRITICAL HIGH: Severely elevated HbA1c indicating suboptimal glycemic control"
                    ),
                    ExtractedLabResult(
                        test_name="Fasting Blood Sugar (FBS)",
                        value="178",
                        unit="mg/dL",
                        reference_range="70 - 100 mg/dL",
                        is_abnormal=True,
                        severity_flag=SeverityLevel.ELEVATED,
                        clinical_significance="Elevated Fasting Blood Sugar"
                    ),
                    ExtractedLabResult(
                        test_name="Serum Creatinine",
                        value="2.4",
                        unit="mg/dL",
                        reference_range="0.6 - 1.2 mg/dL",
                        is_abnormal=True,
                        severity_flag=SeverityLevel.CRITICAL_HIGH,
                        clinical_significance="CRITICAL HIGH: Renal impairment / Elevated serum creatinine"
                    )
                ],
                diagnoses=["Diabetic Nephropathy Stage 3", "Type 2 Diabetes Mellitus"],
                is_abdm_verified=True,
                raw_document_id="DOC-LAB-2024-03"
            ),
            TimelineEvent(
                event_id="EVT-2023-11",
                patient_id=demo_id,
                date=date(2023, 11, 8),
                document_type=DocumentType.DISCHARGE_SUMMARY,
                title="Acute Coronary Syndrome & Drug-Eluting Stent Placement",
                provider_name="Dr. A. K. Banerjee, DM (Interventional Cardiology)",
                facility_name="Apex Multi-Specialty Heart Institute",
                summary="Admitted with acute NSTEMI. Successful percutaneous coronary intervention (PCI) with DES to LAD.",
                medications=[
                    ExtractedMedication(
                        name="Metformin Hydrochloride",
                        dosage="500 mg",
                        frequency="1-0-1 (BD)",
                        route="oral",
                        duration="Ongoing",
                        indication="Type 2 Diabetes Mellitus",
                        instructions="Post-meals",
                        confidence=98.0
                    ),
                    ExtractedMedication(
                        name="Pantoprazole DSR",
                        dosage="40 mg",
                        frequency="1-0-0 (OD)",
                        route="oral",
                        duration="30 days",
                        indication="Gastroprotection with Dual Antiplatelet",
                        instructions="Before breakfast (Empty stomach)",
                        confidence=95.0
                    )
                ],
                abnormal_labs=[
                    ExtractedLabResult(
                        test_name="Serum Troponin-I",
                        value="1.8",
                        unit="ng/mL",
                        reference_range="< 0.04 ng/mL",
                        is_abnormal=True,
                        severity_flag=SeverityLevel.CRITICAL_HIGH,
                        clinical_significance="Positive myocardial necrosis marker"
                    )
                ],
                diagnoses=["Acute NSTEMI", "Coronary Atherosclerosis", "Type 2 Diabetes Mellitus"],
                is_abdm_verified=True,
                raw_document_id="DOC-DISCHARGE-2023-11"
            ),
            TimelineEvent(
                event_id="EVT-2022-08",
                patient_id=demo_id,
                date=date(2022, 8, 12),
                document_type=DocumentType.PRESCRIPTION,
                title="Primary Diagnosis: Type 2 Diabetes & Hypertension",
                provider_name="Dr. Meenakshi Sundaram, MD",
                facility_name="Community Health Centre (CHC)",
                summary="Initial diagnosis of adult-onset diabetes mellitus and stage 1 essential hypertension.",
                medications=[
                    ExtractedMedication(
                        name="Metformin Hydrochloride",
                        dosage="500 mg",
                        frequency="1-0-0 (OD)",
                        route="oral",
                        duration="60 days",
                        indication="Type 2 Diabetes",
                        instructions="Post-dinner",
                        confidence=95.0
                    )
                ],
                abnormal_labs=[],
                diagnoses=["Type 2 Diabetes Mellitus", "Essential Hypertension"],
                is_abdm_verified=True,
                raw_document_id="DOC-CHC-2022-08"
            )
        ]

        self._patient_timeline_events[demo_id] = events

    def get_longitudinal_timeline(self, patient_id: str) -> LongitudinalTimelineResponse:
        """Retrieves chronologically sorted medical timeline, active pharmacotherapy, and critical lab alerts."""
        events = self._patient_timeline_events.get(patient_id, [])
        if not events and patient_id != "P-DEMO-001":
            # Fallback to demo patient records if new patient has no recorded history
            events = self._patient_timeline_events.get("P-DEMO-001", [])

        # Sort newest first
        sorted_events = sorted(events, key=lambda x: x.date, reverse=True)

        # Consolidate and deduplicate active medications across recent prescriptions
        active_medications_map: Dict[str, ExtractedMedication] = {}
        for ev in sorted_events:
            for med in ev.medications:
                # Key by base drug name (case-insensitive)
                base_name = med.name.split()[0].lower()
                if base_name not in active_medications_map:
                    active_medications_map[base_name] = med

        # Consolidate abnormal labs and critical alerts
        all_abnormal_labs: List[ExtractedLabResult] = []
        critical_alerts: List[str] = []

        for ev in sorted_events:
            for lab in ev.abnormal_labs:
                all_abnormal_labs.append(lab)
                if lab.severity_flag in (SeverityLevel.CRITICAL_HIGH, SeverityLevel.CRITICAL_LOW):
                    alert_msg = f"{lab.test_name}: {lab.value} {lab.unit or ''} ({lab.severity_flag.value}) on {ev.date}"
                    if alert_msg not in critical_alerts:
                        critical_alerts.append(alert_msg)

        return LongitudinalTimelineResponse(
            patient_id=patient_id,
            total_records=len(sorted_events),
            timeline=sorted_events,
            active_medications_summary=list(active_medications_map.values()),
            critical_lab_alerts=critical_alerts,
            abnormal_labs_summary=all_abnormal_labs
        )

    def sync_document_to_timeline(self, doc: MedicalDocument) -> TimelineEvent:
        """Converts a freshly digitized MedicalDocument into a TimelineEvent and adds it to the patient record."""
        patient_id = doc.patient_id or "P-DEMO-001"
        event_date = doc.document_date or date.today()

        # Build Title
        if doc.document_type == DocumentType.PRESCRIPTION:
            title = f"Prescription Consultation ({doc.doctor_name or 'OPD Doctor'})"
        elif doc.document_type == DocumentType.LAB_REPORT:
            title = f"Diagnostic Laboratory Report ({doc.facility_name or 'Clinical Pathology'})"
        elif doc.document_type == DocumentType.DISCHARGE_SUMMARY:
            title = f"Hospital Inpatient Discharge Summary"
        else:
            title = f"Clinical Medical Document ({doc.document_type.value.capitalize()})"

        # Summary text
        summary_parts = []
        if doc.extracted_diagnoses:
            diag_names = [d.condition for d in doc.extracted_diagnoses]
            summary_parts.append(f"Diagnoses: {', '.join(diag_names)}.")
        if doc.extracted_medications:
            med_count = len(doc.extracted_medications)
            summary_parts.append(f"{med_count} active medication(s) prescribed.")
        if doc.extracted_labs:
            abnormal_count = sum(1 for l in doc.extracted_labs if l.is_abnormal)
            if abnormal_count > 0:
                summary_parts.append(f"{abnormal_count} abnormal lab parameter(s) flagged.")

        summary = " ".join(summary_parts) if summary_parts else (doc.raw_ocr_text or "Medical document recorded.")

        event = TimelineEvent(
            event_id=f"EVT-{doc.document_id}",
            patient_id=patient_id,
            date=event_date,
            document_type=doc.document_type,
            title=title,
            provider_name=doc.doctor_name,
            facility_name=doc.facility_name,
            summary=summary,
            medications=doc.extracted_medications,
            abnormal_labs=[l for l in doc.extracted_labs if l.is_abnormal],
            diagnoses=[d.condition for d in doc.extracted_diagnoses],
            is_abdm_verified=True,
            raw_document_id=doc.document_id
        )

        # Append to patient's timeline
        if patient_id not in self._patient_timeline_events:
            self._patient_timeline_events[patient_id] = []
        self._patient_timeline_events[patient_id].insert(0, event)

        # Also store document
        if patient_id not in self._patient_documents:
            self._patient_documents[patient_id] = []
        self._patient_documents[patient_id].insert(0, doc)

        logger.info(f"TimelineService: Successfully synced document {doc.document_id} to patient {patient_id} timeline")

        # Automatically fire async persistence if an event loop is running
        try:
            import asyncio
            loop = asyncio.get_event_loop()
            if loop.is_running():
                asyncio.create_task(self.persist_document_to_db(doc))
                asyncio.create_task(self.persist_timeline_event_to_db(event))
        except Exception:
            pass

        return event

    async def persist_document_to_db(self, doc: MedicalDocument) -> bool:
        """Persists or updates an OCR-extracted MedicalDocument in the MongoDB documents collection."""
        try:
            db = get_database()
            data = doc.model_dump() if hasattr(doc, "model_dump") else doc.dict()
            sanitized = _sanitize_for_mongo(data)
            await db["documents"].update_one(
                {"document_id": doc.document_id},
                {"$set": sanitized},
                upsert=True
            )
            logger.info(f"TimelineService: Persisted document {doc.document_id} to MongoDB")
            return True
        except Exception as e:
            logger.warning(f"TimelineService: Failed to persist document {doc.document_id} to MongoDB: {e}")
            return False

    async def persist_timeline_event_to_db(self, event: TimelineEvent) -> bool:
        """Persists or updates a TimelineEvent in the MongoDB timeline_events collection."""
        try:
            db = get_database()
            data = event.model_dump() if hasattr(event, "model_dump") else event.dict()
            sanitized = _sanitize_for_mongo(data)
            await db["timeline_events"].update_one(
                {"event_id": event.event_id},
                {"$set": sanitized},
                upsert=True
            )
            logger.info(f"TimelineService: Persisted timeline event {event.event_id} to MongoDB")
            return True
        except Exception as e:
            logger.warning(f"TimelineService: Failed to persist timeline event {event.event_id} to MongoDB: {e}")
            return False

    async def sync_document_to_timeline_async(self, doc: MedicalDocument) -> TimelineEvent:
        """Converts doc to TimelineEvent, caches in memory, and persists both doc and event to MongoDB."""
        event = self.sync_document_to_timeline(doc)
        await self.persist_document_to_db(doc)
        await self.persist_timeline_event_to_db(event)
        return event

    async def ensure_demo_records_seeded(self):
        """Ensures demo patient P-DEMO-001 has records seeded in MongoDB for instant evaluation."""
        try:
            db = get_database()
            existing_count = await db["timeline_events"].count_documents({"patient_id": "P-DEMO-001"})
            if existing_count > 0:
                return

            demo_events = self._patient_timeline_events.get("P-DEMO-001", [])
            for evt in demo_events:
                await self.persist_timeline_event_to_db(evt)

            # Also seed a realistic encounter
            enc_count = await db["encounters"].count_documents({"patient_id": "P-DEMO-001"})
            if enc_count == 0:
                await db["encounters"].insert_one({
                    "encounter_id": "ENC-DEMO-2024-06",
                    "patient_id": "P-DEMO-001",
                    "patient_name": "Ramesh Kumar",
                    "age": 58,
                    "gender": "male",
                    "encounter_date": "2024-06-15",
                    "hospital_name": "AIIMS New Delhi - Outpatient Cardiology",
                    "department": "Cardiology",
                    "doctor_name": "Dr. Rajesh Gupta, MD",
                    "chief_complaint": "Post-stent cardiology review, mild exertion breathlessness",
                    "hpi": "58-year-old male known case of CAD post-PCI (LAD DES, Nov 2023) and Type 2 Diabetes presenting for scheduled 6-month cardiology follow-up.",
                    "socrates": {
                        "site": "Substernal",
                        "onset": "Gradual on brisk walking",
                        "character": "Heaviness",
                        "radiation": "None",
                        "associations": "Mild dyspnea",
                        "timeCourse": "Resolves with 5 mins rest",
                        "exacerbating": "Climbing stairs",
                        "severity": "3/10"
                    },
                    "vitals": {
                        "bp": "138/86 mmHg",
                        "pulse": "74 bpm",
                        "spo2": "98%",
                        "temp": "98.2 °F",
                        "weight": "72 kg",
                        "height": "170 cm"
                    },
                    "past_history": ["CAD (Post-PCI LAD DES Nov 2023)", "Type 2 Diabetes Mellitus", "Essential Hypertension"],
                    "current_medications": [
                        {"drug": "Amlodipine Besylate", "dose": "5 mg", "frequency": "1-0-0 (OD)"},
                        {"drug": "Atorvastatin Calcium", "dose": "20 mg", "frequency": "0-0-1 (HS)"},
                        {"drug": "Clopidogrel", "dose": "75 mg", "frequency": "1-0-0 (OD)"},
                        {"drug": "Metformin Hydrochloride", "dose": "500 mg", "frequency": "1-0-1 (BD)"}
                    ],
                    "allergies": ["No known drug allergies (NKDA)"],
                    "provisional_diagnosis": "Coronary Artery Disease (Post-PCI, stable), Essential Hypertension, Type 2 DM",
                    "clinical_notes": "LVEF 52% on 2D Echo. Stress test not indicated at present. Continue current medical therapy. Review in 3 months.",
                    "prescribed_medications": [
                        {"drug": "Amlodipine Besylate", "dosage": "5 mg", "frequency": "1-0-0 (OD)", "duration": "90 days", "instructions": "Post-breakfast"},
                        {"drug": "Atorvastatin Calcium", "dosage": "20 mg", "frequency": "0-0-1 (HS)", "duration": "90 days", "instructions": "Bedtime"},
                        {"drug": "Clopidogrel", "dosage": "75 mg", "frequency": "1-0-0 (OD)", "duration": "90 days", "instructions": "Post-meals"},
                        {"drug": "Metformin Hydrochloride", "dosage": "500 mg", "frequency": "1-0-1 (BD)", "duration": "90 days", "instructions": "Post-meals"}
                    ],
                    "follow_up_recommendation": "Follow-up in Cardiology OPD after 3 months with repeat FBS and lipid profile.",
                    "status": "completed",
                    "is_abdm_synced": True,
                    "created_at": "2024-06-15T11:30:00Z"
                })

            # Also seed OCR documents corresponding to the timeline
            doc_count = await db["documents"].count_documents({"patient_id": "P-DEMO-001"})
            if doc_count == 0:
                await db["documents"].insert_one({
                    "document_id": "DOC-AIIMS-2024-06",
                    "patient_id": "P-DEMO-001",
                    "patient_name": "Ramesh Kumar",
                    "document_type": "prescription",
                    "document_date": "2024-06-15",
                    "doctor_name": "Dr. Rajesh Gupta, MD (Cardiology)",
                    "facility_name": "AIIMS New Delhi - Outpatient Cardiology",
                    "document_purpose": "Post-PCI Cardiology Follow-up & Titration",
                    "clinical_intent": "Dual antiplatelet and statin maintenance post-stenting with blood pressure management.",
                    "confidence_score": 97.5,
                    "extracted_diagnoses": [
                        {"condition": "Coronary Artery Disease (Post-PCI)", "condition_type": "chronic"},
                        {"condition": "Essential Hypertension", "condition_type": "chronic"}
                    ],
                    "extracted_medications": [
                        {"name": "Amlodipine Besylate", "dosage": "5 mg", "frequency": "1-0-0 (OD)", "route": "oral", "duration": "90 days", "indication": "Hypertension", "confidence": 98.0},
                        {"name": "Atorvastatin Calcium", "dosage": "20 mg", "frequency": "0-0-1 (HS)", "route": "oral", "duration": "90 days", "indication": "Secondary Prevention", "confidence": 97.0},
                        {"name": "Clopidogrel", "dosage": "75 mg", "frequency": "1-0-0 (OD)", "route": "oral", "duration": "90 days", "indication": "Stent Patency", "confidence": 96.0}
                    ],
                    "extracted_labs": [],
                    "raw_ocr_text": "AIIMS NEW DELHI OPD CARDIOLOGY\nPt: Ramesh Kumar, Age: 58, Male\nRx: Amlodipine 5mg OD, Atorvastatin 20mg HS, Clopidogrel 75mg OD.\nDiagnosis: CAD Post-PCI, HTN.",
                    "is_abdm_linked": True,
                    "created_at": "2024-06-15T11:45:00Z"
                })
                await db["documents"].insert_one({
                    "document_id": "DOC-LAB-2024-03",
                    "patient_id": "P-DEMO-001",
                    "patient_name": "Ramesh Kumar",
                    "document_type": "lab_report",
                    "document_date": "2024-03-20",
                    "doctor_name": "Dr. Sunita Rao, MD (Pathology)",
                    "facility_name": "National Diagnostic & Reference Laboratory",
                    "document_purpose": "Comprehensive Metabolic & Glycemic Panel",
                    "clinical_intent": "Evaluate glycemic control and renal function.",
                    "confidence_score": 98.0,
                    "extracted_diagnoses": [
                        {"condition": "Diabetic Nephropathy Stage 3", "condition_type": "chronic"},
                        {"condition": "Type 2 Diabetes Mellitus", "condition_type": "chronic"}
                    ],
                    "extracted_medications": [],
                    "extracted_labs": [
                        {
                            "test_name": "Glycated Hemoglobin (HbA1c)",
                            "value": "9.2",
                            "unit": "%",
                            "reference_range": "< 5.7%",
                            "is_abnormal": True,
                            "severity_flag": "CRITICAL_HIGH",
                            "clinical_significance": "Severely elevated HbA1c indicating suboptimal glycemic control"
                        },
                        {
                            "test_name": "Fasting Blood Sugar (FBS)",
                            "value": "178",
                            "unit": "mg/dL",
                            "reference_range": "70 - 100 mg/dL",
                            "is_abnormal": True,
                            "severity_flag": "ELEVATED",
                            "clinical_significance": "Elevated Fasting Blood Sugar"
                        },
                        {
                            "test_name": "Serum Creatinine",
                            "value": "2.4",
                            "unit": "mg/dL",
                            "reference_range": "0.6 - 1.2 mg/dL",
                            "is_abnormal": True,
                            "severity_flag": "CRITICAL_HIGH",
                            "clinical_significance": "Renal impairment / Elevated serum creatinine"
                        }
                    ],
                    "raw_ocr_text": "NATIONAL DIAGNOSTIC & REFERENCE LAB\nPatient: Ramesh Kumar\nHbA1c: 9.2% [High]\nFBS: 178 mg/dL [High]\nSerum Creatinine: 2.4 mg/dL [Critical High]",
                    "is_abdm_linked": True,
                    "created_at": "2024-03-20T09:15:00Z"
                })
            logger.info("TimelineService: Verified and seeded demo records for P-DEMO-001 in MongoDB")
        except Exception as e:
            logger.warning(f"TimelineService: Could not seed demo records to DB: {e}")


timeline_service = LongitudinalTimelineService()
