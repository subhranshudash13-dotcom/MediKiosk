// MediKiosk Frontend TypeScript Type Definitions

export interface KioskLanguage {
  code: string;
  name: string;
}

export interface KioskSession {
  session_id: string;
  patient_id?: string;
  abha_id?: string;
  language: string;
  mode: "allopathy" | "ayush";
  status: "active" | "intake_completed" | "triaged" | "consulted";
  created_at: string;
  is_emergency: boolean;
  emergency_reason?: string;
}

export interface SOCRATESHistory {
  site?: string;
  onset?: string;
  character?: string;
  radiation?: string;
  associations?: string[];
  time_course?: string;
  exacerbating_relieving?: string;
  severity_score?: number;
}

export interface AyushAssessment {
  prakriti?: string;
  vikriti?: string;
  agni?: string;
  koshtha?: string;
  ahara_vihara?: string;
  nidana?: string;
}

export interface ClinicalSummary {
  patient_id: string;
  encounter_id: string;
  chief_complaint: string;
  hpi: string;
  socrates?: SOCRATESHistory;
  ayush?: AyushAssessment;
  past_medical_history: string[];
  medications_current: string[];
  allergies: string[];
  family_history: string[];
  personal_history: string[];
  review_of_systems: Record<string, any>;
  red_flags: string[];
  abnormal_lab_alerts: string[];
  physician_notes?: string;
  is_confirmed_by_doctor: boolean;
}

export interface ExtractedMedication {
  name: string;
  dosage?: string;
  frequency?: string;
  route?: string;
  duration?: string;
  indication?: string;
  therapeutic_class?: string;
  clinical_purpose?: string; // "What this drug is exactly for in this patient"
  instructions?: string;
  confidence?: number;
}

export interface ExtractedLabResult {
  test_name: string;
  value: string;
  unit?: string;
  reference_range?: string;
  is_abnormal: boolean;
  severity_flag?: "NORMAL" | "BORDERLINE" | "ELEVATED" | "CRITICAL_HIGH" | "CRITICAL_LOW" | string;
  clinical_purpose?: string; // "What clinical condition/organ function this test investigates"
  clinical_significance?: string;
}

export interface ExtractedDiagnosis {
  condition: string;
  icd10_code?: string;
  condition_type?: string;
  notes?: string;
}

export interface ExtractedVital {
  vital_name: string;
  value: string;
  unit?: string;
  is_abnormal?: boolean;
}

export interface MedicalDocument {
  document_id: string;
  patient_id: string;
  patient_name?: string;
  document_type: "prescription" | "lab_report" | "discharge_summary" | "imaging" | "other" | string;
  document_date?: string;
  raw_ocr_text?: string;
  confidence_score?: number;
  document_purpose?: string; // e.g. "Outpatient Follow-Up & Hypertension Management"
  clinical_intent?: string; // "What this document is exactly for clinically"
  physician_action_plan?: string; // Actionable doctor steps & safety alerts
  doctor_name?: string;
  facility_name?: string;
  extracted_diagnoses: (string | ExtractedDiagnosis)[];
  extracted_medications: ExtractedMedication[];
  extracted_labs: ExtractedLabResult[];
  extracted_vitals?: ExtractedVital[];
  file_path?: string;
  is_abdm_linked?: boolean;
  created_at?: string;
}

export interface AbhaKYC {
  abha_id: string;
  abha_address: string;
  name: string;
  gender: string;
  dob?: string;
  mobile?: string;
  auth_status: "pending" | "verified" | "failed";
}

// ─── Longitudinal Patient History Types ──────────────────────────────

export interface HistoryMedication {
  name: string;
  dosage?: string;
  frequency?: string;
  route?: string;
  duration?: string;
  indication?: string;
  therapeutic_class?: string;
  clinical_purpose?: string;
  instructions?: string;
  confidence?: number;
}

export interface HistoryLabResult {
  test_name: string;
  value: string;
  unit?: string;
  reference_range?: string;
  is_abnormal: boolean;
  severity_flag?: "NORMAL" | "BORDERLINE" | "ELEVATED" | "CRITICAL_HIGH" | "CRITICAL_LOW" | string;
  clinical_significance?: string;
}

export interface HistoryDiagnosis {
  condition: string;
  icd10_code?: string;
  condition_type?: string;
  notes?: string;
}

export interface HistoryEncounterRecord {
  record_type: "encounter";
  encounter_id: string;
  patient_id: string;
  patient_name?: string;
  age?: number;
  gender?: string;
  encounter_date: string;
  hospital_name?: string;
  department?: string;
  doctor_name?: string;
  chief_complaint?: string;
  hpi?: string;
  socrates?: Record<string, any>;
  vitals?: Record<string, any>;
  past_history?: string[];
  current_medications?: Array<Record<string, any>>;
  allergies?: string[];
  provisional_diagnosis?: string;
  clinical_notes?: string;
  prescribed_medications?: Array<Record<string, any>>;
  follow_up_recommendation?: string;
  status: string;
  is_abdm_synced: boolean;
  created_at?: string;
}

export interface HistoryDocumentRecord {
  record_type: "document";
  document_id: string;
  patient_id: string;
  document_type: string;
  document_date?: string;
  doctor_name?: string;
  facility_name?: string;
  document_purpose?: string;
  clinical_intent?: string;
  confidence_score?: number;
  extracted_medications: HistoryMedication[];
  extracted_labs: HistoryLabResult[];
  extracted_diagnoses: HistoryDiagnosis[];
  raw_ocr_text?: string;
  is_abdm_linked: boolean;
  created_at?: string;
}

export interface HistoryTimelineEvent {
  event_id: string;
  patient_id: string;
  date: string;
  record_type: "encounter" | "document" | "session" | string;
  title: string;
  summary?: string;
  provider_name?: string;
  facility_name?: string;
  category?: string;
  medications: HistoryMedication[];
  abnormal_labs: HistoryLabResult[];
  diagnoses: string[];
  is_abdm_verified: boolean;
}

export interface PatientHistoryResponse {
  patient_id: string;
  patient_name?: string;
  total_records: number;
  total_encounters: number;
  total_documents: number;
  timeline: HistoryTimelineEvent[];
  encounters: HistoryEncounterRecord[];
  documents: HistoryDocumentRecord[];
  active_medications: HistoryMedication[];
  critical_lab_alerts: string[];
  last_visit_date?: string;
  last_visit_department?: string;
}
