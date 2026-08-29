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
  duration?: string;
}

export interface ExtractedLabResult {
  test_name: string;
  value: string;
  unit?: string;
  reference_range?: string;
  is_abnormal: boolean;
}

export interface MedicalDocument {
  document_id: string;
  patient_id: string;
  document_type: "prescription" | "lab_report" | "discharge_summary" | "imaging";
  document_date?: string;
  raw_ocr_text?: string;
  confidence_score?: number;
  extracted_diagnoses: string[];
  extracted_medications: ExtractedMedication[];
  extracted_labs: ExtractedLabResult[];
  file_path?: string;
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
