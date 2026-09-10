import { create } from "zustand";
import { KioskSession } from "./types";

export interface ExtractedEntity {
  id: string;
  label: string;
  value: string;
  kind?: string;
  quote?: string;
  confidence?: number;
  [key: string]: any;
}

export interface EvidenceTimelineItem {
  id: string;
  timeframe: string; // e.g. "7 Days Ago", "5 Days Ago", "3 Days Ago", "Yesterday", "Today"
  title: string;
  detail: string;
  sourceType: "VOICE" | "DOCUMENT" | "LAB" | "ABDM" | "CAREGIVER";
  sourceBadge: string; // e.g. "🎙 Patient Voice (Hindi)", "📄 Prescription • 14 Aug", "🧪 Lab Report", "🔐 ABDM #AB-8821"
  sourceSnippet: string; // Verbatim quote or doc excerpt
  metadata?: {
    prescriber?: string;
    facility?: string;
    date?: string;
    labName?: string;
    refRange?: string;
    observedValue?: string;
    confidence?: number;
    consentId?: string;
    caregiverRelation?: string;
  };
}

export interface HistoryCoverageMap {
  onset: boolean;
  location: boolean;
  character: boolean;
  severity: boolean;
  radiation: boolean;
  aggravating: boolean;
  relieving: boolean;
  associated: boolean;
  pastHistory: boolean;
  medications: boolean;
}

export interface PatientQueueItem {
  id: string;
  token: string;
  name: string;
  age: number;
  gender: string;
  abhaId: string;
  triageLevel: "EMERGENCY" | "URGENT" | "ROUTINE" | "AYUSH";
  chiefComplaint: string;
  triagedTime: string;
  intakeSource: "PATIENT" | "CAREGIVER";
  caregiverRelation?: string;
  consentStatus: "GRANTED_ONCE" | "GRANTED_HOSPITAL" | "PENDING";
  historyCompleteness: number; // 0-100%
  historyCoverage: HistoryCoverageMap;
  vitals: {
    bp: string;
    pulse: string;
    spo2: string;
    temp: string;
    bmi: string;
  };
  hpi: {
    onset: string;
    location: string;
    character: string;
    radiation: string;
    severity: string;
    aggravating: string;
    relieving: string;
    associated: string;
  };
  voiceTranscript: {
    original: string;
    language: string;
    confidence: number;
  };
  redFlags: string[];
  evidenceTrail: EvidenceTimelineItem[];
  ocrHistory: {
    medications: Array<{ drug: string; dose: string; frequency: string; source?: string }>;
    abnormalLabs: Array<{ test: string; value: string; refRange: string; status: "HIGH" | "LOW" | "CRITICAL"; source?: string }>;
    timeline: Array<{ year: string; event: string; type: string }>;
  };
  historicalCorrelation?: {
    correlated_past_condition?: string;
    clinical_rationale?: string;
    significance_level?: string;
    recommended_physician_focus?: string;
  };
}

const DEFAULT_DOCTOR_QUEUE: PatientQueueItem[] = [
  {
    id: "pat-104",
    token: "#104",
    name: "Ramesh Kumar",
    age: 46,
    gender: "Male",
    abhaId: "91-4567-8901-2345",
    triageLevel: "EMERGENCY",
    chiefComplaint: "Retrosternal chest tightness radiating to left arm for 3 days",
    triagedTime: "3 mins ago",
    intakeSource: "PATIENT",
    consentStatus: "GRANTED_HOSPITAL",
    historyCompleteness: 94,
    historyCoverage: {
      onset: true,
      location: true,
      character: true,
      severity: true,
      radiation: true,
      aggravating: true,
      relieving: true,
      associated: true,
      pastHistory: true,
      medications: true,
    },
    vitals: {
      bp: "148/92 mmHg",
      pulse: "96 bpm",
      spo2: "96%",
      temp: "98.4 °F",
      bmi: "27.1 (Overweight)",
    },
    hpi: {
      onset: "3 days ago, progressive worsening with exertion",
      location: "Substernal / retrosternal region",
      character: "Crushing pressure / heavy band-like sensation",
      radiation: "Radiating to left shoulder, inner arm, and lower jaw",
      severity: "8 / 10 on numeric rating scale",
      aggravating: "Climbing stairs, brisk walking, emotional stress",
      relieving: "Partial relief on resting for 10-15 mins",
      associated: "Mild diaphoresis, shortness of breath on exertion, lightheadedness",
    },
    voiceTranscript: {
      original: "छाती में बहुत भारीपन लग रहा है और दर्द बाएँ हाथ और जबड़े तक जा रहा है। चलने पर साँस फूलती है।",
      language: "Hindi (hi-IN)",
      confidence: 97.8,
    },
    redFlags: [
      "Suspected Acute Coronary Syndrome (ACS) / Unstable Angina",
      "Radiation to left upper extremity with diaphoresis",
      "Elevated BP (148/92 mmHg) with active chest discomfort",
    ],
    evidenceTrail: [
      {
        id: "ev-1",
        timeframe: "7 Days Ago",
        title: "Initial Exertional Chest Heaviness",
        detail: "Mild substernal discomfort after climbing stairs at work, resolved in 5 minutes.",
        sourceType: "VOICE",
        sourceBadge: "🎙 Patient Statement",
        sourceSnippet: "हफ्ते भर पहले सीढ़ियाँ चढ़ते वक्त हल्का भारीपन शुरू हुआ था जो आराम करने पर ठीक हो गया था।",
        metadata: { confidence: 0.98 }
      },
      {
        id: "ev-2",
        timeframe: "5 Days Ago",
        title: "Self-Medication / Antacid Trial",
        detail: "Patient took OTC Antacid Gel believing it to be gastric acidity with minimal relief.",
        sourceType: "VOICE",
        sourceBadge: "🎙 Patient Statement",
        sourceSnippet: "मैंने सोचा गैस का दर्द है तो एंटासिड लिया लेकिन कोई खास आराम नहीं मिला।",
        metadata: { confidence: 0.96 }
      },
      {
        id: "ev-3",
        timeframe: "3 Days Ago",
        title: "Local Clinic Visit & Anti-Hypertensive Prescription",
        detail: "Prescribed Tab Telmisartan 40mg and Tab Atorvastatin 20mg for elevated BP and Dyslipidemia.",
        sourceType: "DOCUMENT",
        sourceBadge: "📄 Prescription • 14 Aug",
        sourceSnippet: "Rx: Tab Telmisartan 40mg OD, Tab Atorvastatin 20mg HS - Dr. V. K. Sharma (City Clinic)",
        metadata: { prescriber: "Dr. V. K. Sharma", facility: "City Care Clinic", date: "14-Aug-2026" }
      },
      {
        id: "ev-4",
        timeframe: "Yesterday",
        title: "Diagnostic Lipid Profile & Cardiac Enzymes",
        detail: "Elevated Total Cholesterol (242 mg/dL) and Borderline Serum Troponin-I (0.08 ng/mL).",
        sourceType: "LAB",
        sourceBadge: "🧪 Lab Report • 16 Aug",
        sourceSnippet: "Serum Troponin-I: 0.08 ng/mL (Ref: <0.04), Total Cholesterol: 242 mg/dL",
        metadata: { labName: "Dr. Lal PathLabs", observedValue: "0.08 ng/mL", refRange: "< 0.04 ng/mL", date: "16-Aug-2026" }
      },
      {
        id: "ev-5",
        timeframe: "Today",
        title: "Acute Radiation & Shortness of Breath at MediKiosk",
        detail: "Crushing pressure radiating down left arm with diaphoresis; prioritized for STAT ECG & Emergency Triage.",
        sourceType: "ABDM",
        sourceBadge: "🔐 ABDM Consent Record #AB-8821",
        sourceSnippet: "Consented Health Record linked via ABHA: 91-4567-8901-2345. Triage: ESI Level 1.",
        metadata: { consentId: "ABDM-CONSENT-8821-DELHI", facility: "Civil Hospital OPD" }
      }
    ],
    ocrHistory: {
      medications: [
        { drug: "Tab Atorvastatin", dose: "20 mg", frequency: "0-0-1 (HS)", source: "Prescription • 14 Aug" },
        { drug: "Tab Telmisartan", dose: "40 mg", frequency: "1-0-0 (OD)", source: "Prescription • 14 Aug" },
        { drug: "Tab Metformin", dose: "500 mg", frequency: "1-0-1 (BD)", source: "ABDM Longitudinal Record" },
      ],
      abnormalLabs: [
        { test: "Serum Troponin-I", value: "0.08 ng/mL", refRange: "< 0.04 ng/mL", status: "HIGH", source: "Lab Report • 16 Aug" },
        { test: "Total Cholesterol", value: "242 mg/dL", refRange: "< 200 mg/dL", status: "HIGH", source: "Lab Report • 16 Aug" },
        { test: "HbA1c", value: "7.4%", refRange: "< 5.7%", status: "HIGH", source: "ABDM Records" },
      ],
      timeline: [
        { year: "2021", event: "Diagnosed with Primary Hypertension (Max Hospital)", type: "Diagnosis" },
        { year: "2023", event: "Added Metformin for early Impaired Glucose Tolerance", type: "Prescription" },
        { year: "2026", event: "Acute chest heaviness presentation at MediKiosk", type: "OPD Intake" },
      ],
    },
  },
  {
    id: "pat-105",
    token: "#105",
    name: "Sunita Devi",
    age: 34,
    gender: "Female",
    abhaId: "91-8890-1234-5678",
    triageLevel: "URGENT",
    chiefComplaint: "High-grade fever with rigors, retro-orbital headache for 4 days",
    triagedTime: "12 mins ago",
    intakeSource: "CAREGIVER",
    caregiverRelation: "Daughter (Ananya Sharma)",
    consentStatus: "GRANTED_HOSPITAL",
    historyCompleteness: 91,
    historyCoverage: {
      onset: true,
      location: true,
      character: true,
      severity: true,
      radiation: false,
      aggravating: true,
      relieving: true,
      associated: true,
      pastHistory: true,
      medications: true,
    },
    vitals: {
      bp: "110/72 mmHg",
      pulse: "108 bpm",
      spo2: "98%",
      temp: "102.6 °F",
      bmi: "22.4 (Normal)",
    },
    hpi: {
      onset: "4 days ago, abrupt onset with severe chills",
      location: "Generalized body aches + retro-orbital pain",
      character: "Throbbing frontal headache, myalgia, arthralgia",
      radiation: "Non-radiating",
      severity: "7 / 10",
      aggravating: "Eye movement, bright light exposure",
      relieving: "Transient relief with Tab Paracetamol 650mg",
      associated: "Nausea, bitter taste in mouth, extreme fatigue",
    },
    voiceTranscript: {
      original: "मेरी माँ को 4 दिन से बहुत तेज बुखार और कंपकंपी आ रही है। आँखों के पीछे तेज दर्द है और उल्टी जैसा लग रहा है।",
      language: "Hindi (hi-IN)",
      confidence: 98.4,
    },
    redFlags: [
      "Tachycardia (Pulse 108 bpm) with high-grade pyrexia (102.6 °F)",
      "Suspected Arboviral Infection / Dengue vs Malaria profile with Thrombocytopenia",
    ],
    evidenceTrail: [
      {
        id: "ev-s1",
        timeframe: "4 Days Ago",
        title: "Abrupt Onset of High Fever & Rigors",
        detail: "Developed sudden high-grade chills and muscle pains in the evening.",
        sourceType: "CAREGIVER",
        sourceBadge: "👵 Caregiver Statement (Daughter)",
        sourceSnippet: "4 दिन पहले अचानक शाम को बहुत तेज कंपकंपी के साथ बुखार चढ़ा था।",
        metadata: { caregiverRelation: "Daughter" }
      },
      {
        id: "ev-s2",
        timeframe: "2 Days Ago",
        title: "Self-Administered Antipyretic",
        detail: "Tab Paracetamol 650mg given every 6 hours with temporary defervescence.",
        sourceType: "DOCUMENT",
        sourceBadge: "📄 Pharmacy Strip OCR",
        sourceSnippet: "Tab Paracetamol 650mg (Dolo) - Strip scanned at kiosk",
        metadata: { facility: "Home Pharmacy" }
      },
      {
        id: "ev-s3",
        timeframe: "Yesterday",
        title: "Complete Blood Count (CBC) with Thrombocytopenia",
        detail: "Platelet count dropped to 92,000 /µL with leukopenia (WBC 3,200 /µL).",
        sourceType: "LAB",
        sourceBadge: "🧪 Lab Report • SRL Diagnostics",
        sourceSnippet: "Platelets: 92,000 /µL (Ref: 150,000 - 450,000), WBC: 3,200 /µL",
        metadata: { labName: "SRL Diagnostics", observedValue: "92,000 /µL", refRange: "150,000-450,000" }
      },
      {
        id: "ev-s4",
        timeframe: "Today",
        title: "MediKiosk Triage & Fever Clinic Routing",
        detail: "Routed to Acute Fever OPD Room 04 with recommendation for Dengue NS1 & IV fluids.",
        sourceType: "ABDM",
        sourceBadge: "🔐 ABDM Token #105",
        sourceSnippet: "ABHA 91-8890-1234-5678 verified via Aadhaar OTP.",
        metadata: { consentId: "ABDM-CONSENT-9912" }
      }
    ],
    ocrHistory: {
      medications: [
        { drug: "Tab Paracetamol", dose: "650 mg", frequency: "1-1-1 (TDS)", source: "Caregiver Statement" },
        { drug: "Cap Pantoprazole", dose: "40 mg", frequency: "1-0-0 (OD Empty Stomach)", source: "Previous Prescriptions" },
      ],
      abnormalLabs: [
        { test: "Platelet Count", value: "92,000 /µL", refRange: "150,000 - 450,000 /µL", status: "LOW", source: "Lab Report • 15 Aug" },
        { test: "WBC Count", value: "3,200 /µL", refRange: "4,000 - 11,000 /µL", status: "LOW", source: "Lab Report • 15 Aug" },
      ],
      timeline: [
        { year: "2024", event: "Routine Health Checkup - Normal (Apollo Clinic)", type: "Health Check" },
        { year: "2026", event: "Acute febrile episode with thrombocytopenia", type: "OPD Intake" },
      ],
    },
  },
  {
    id: "pat-106",
    token: "#106",
    name: "Mohanlal Soni",
    age: 62,
    gender: "Male",
    abhaId: "91-3321-7788-9900",
    triageLevel: "ROUTINE",
    chiefComplaint: "Routine diabetic review & anti-hypertensive medication refill",
    triagedTime: "24 mins ago",
    intakeSource: "PATIENT",
    consentStatus: "GRANTED_ONCE",
    historyCompleteness: 88,
    historyCoverage: {
      onset: true,
      location: false,
      character: false,
      severity: false,
      radiation: false,
      aggravating: false,
      relieving: false,
      associated: true,
      pastHistory: true,
      medications: true,
    },
    vitals: {
      bp: "132/84 mmHg",
      pulse: "74 bpm",
      spo2: "99%",
      temp: "98.2 °F",
      bmi: "24.8 (Normal)",
    },
    hpi: {
      onset: "Chronic management, follow-up visit",
      location: "N/A",
      character: "No active acute symptoms",
      radiation: "N/A",
      severity: "0 / 10",
      aggravating: "N/A",
      relieving: "N/A",
      associated: "Reports good compliance with diet and oral hypoglycemics",
    },
    voiceTranscript: {
      original: "शुगर की दवाइयाँ खत्म हो गई हैं, रूटीन चेकअप और प्रिस्क्रिप्शन रीफिल के लिए आया हूँ।",
      language: "Hindi (hi-IN)",
      confidence: 99.1,
    },
    redFlags: [],
    evidenceTrail: [
      {
        id: "ev-m1",
        timeframe: "3 Months Ago",
        title: "Quarterly Diabetic Consultation",
        detail: "HbA1c was 6.8% under Tab Metformin 1000mg and Glimepiride 1mg.",
        sourceType: "DOCUMENT",
        sourceBadge: "📄 Prescription • May 2026",
        sourceSnippet: "Rx: Tab Metformin 1000mg BD, Tab Glimepiride 1mg OD - Dr. P. N. Gupta",
        metadata: { prescriber: "Dr. P. N. Gupta", date: "10-May-2026" }
      },
      {
        id: "ev-m2",
        timeframe: "Today",
        title: "Kiosk Check-in for Prescription Refill",
        detail: "No new acute complaints. Vitals stable. Medication compliance confirmed.",
        sourceType: "VOICE",
        sourceBadge: "🎙 Patient Statement",
        sourceSnippet: "दवाइयां नियमित रूप से ले रहा हूँ, कोई नई तकलीफ नहीं है।",
        metadata: { confidence: 0.99 }
      }
    ],
    ocrHistory: {
      medications: [
        { drug: "Tab Glimepiride", dose: "1 mg", frequency: "1-0-0", source: "Prescription • May 2026" },
        { drug: "Tab Metformin", dose: "1000 mg", frequency: "1-0-1", source: "Prescription • May 2026" },
      ],
      abnormalLabs: [
        { test: "Fasting Blood Sugar", value: "118 mg/dL", refRange: "70 - 100 mg/dL", status: "HIGH", source: "Recent Lab • July 2026" },
      ],
      timeline: [
        { year: "2018", event: "Type 2 Diabetes Mellitus diagnosed", type: "Diagnosis" },
        { year: "2026", event: "Quarterly OPD follow-up and refill", type: "OPD Review" },
      ],
    },
  },
];

interface KioskStoreState {
  currentSession: KioskSession | null;
  language: string;
  isRecording: boolean;
  transcript: string;
  entities: ExtractedEntity[];
  doctorQueue: PatientQueueItem[];
  intakeMode: "PATIENT" | "CAREGIVER";
  caregiverRelation: string;
  consentGranted: boolean;
  consentType: "GRANTED_ONCE" | "GRANTED_HOSPITAL" | "NONE";

  setLanguage: (lang: string) => void;
  setRecording: (recording: boolean) => void;
  setTranscript: (text: string) => void;
  addEntities: (newEntities: ExtractedEntity[]) => void;
  setIntakeMode: (mode: "PATIENT" | "CAREGIVER", relation?: string) => void;
  setConsent: (granted: boolean, type?: "GRANTED_ONCE" | "GRANTED_HOSPITAL") => void;
  resetKiosk: () => void;
  setDoctorQueue: (queue: PatientQueueItem[]) => void;
  pushPatientToQueue: (patient: PatientQueueItem) => void;
}

export const useKioskStore = create<KioskStoreState>((set) => ({
  currentSession: null,
  language: "en",
  isRecording: false,
  transcript: "",
  entities: [],
  doctorQueue: [], // Reads live from MongoDB at runtime; empty by default
  intakeMode: "PATIENT",
  caregiverRelation: "",
  consentGranted: true,
  consentType: "GRANTED_HOSPITAL",

  setLanguage: (language) => set({ language }),
  setRecording: (isRecording) => set({ isRecording }),
  setTranscript: (transcript) => set({ transcript }),
  addEntities: (newEntities) =>
    set((state) => ({ entities: [...state.entities, ...newEntities] })),
  setIntakeMode: (intakeMode, caregiverRelation = "") =>
    set({ intakeMode, caregiverRelation }),
  setConsent: (consentGranted, consentType = "GRANTED_HOSPITAL") =>
    set({ consentGranted, consentType }),
  resetKiosk: () =>
    set({
      currentSession: null,
      isRecording: false,
      transcript: "",
      entities: [],
      intakeMode: "PATIENT",
      caregiverRelation: "",
    }),
  setDoctorQueue: (doctorQueue) => set({ doctorQueue }),
  pushPatientToQueue: (newPatient) =>
    set((state) => ({
      doctorQueue: [newPatient, ...state.doctorQueue.filter((p) => p.id !== newPatient.id)],
    })),
}));
