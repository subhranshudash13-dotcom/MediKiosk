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
  ocrHistory: {
    medications: Array<{ drug: string; dose: string; frequency: string }>;
    abnormalLabs: Array<{ test: string; value: string; refRange: string; status: "HIGH" | "LOW" | "CRITICAL" }>;
    timeline: Array<{ year: string; event: string; type: string }>;
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
    ocrHistory: {
      medications: [
        { drug: "Tab Atorvastatin", dose: "20 mg", frequency: "0-0-1 (HS)" },
        { drug: "Tab Telmisartan", dose: "40 mg", frequency: "1-0-0 (OD)" },
        { drug: "Tab Metformin", dose: "500 mg", frequency: "1-0-1 (BD)" },
      ],
      abnormalLabs: [
        { test: "Serum Troponin-I", value: "0.08 ng/mL", refRange: "< 0.04 ng/mL", status: "HIGH" },
        { test: "Total Cholesterol", value: "242 mg/dL", refRange: "< 200 mg/dL", status: "HIGH" },
        { test: "HbA1c", value: "7.4%", refRange: "< 5.7%", status: "HIGH" },
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
      original: "4 दिन से बहुत तेज बुखार और कंपकंपी आ रही है। आँखों के पीछे तेज दर्द है और उल्टी जैसा लग रहा है।",
      language: "Hindi (hi-IN)",
      confidence: 98.4,
    },
    redFlags: [
      "Tachycardia (Pulse 108 bpm) with high-grade pyrexia (102.6 °F)",
      "Suspected Arboviral Infection / Dengue vs Malaria profile",
    ],
    ocrHistory: {
      medications: [
        { drug: "Tab Paracetamol", dose: "650 mg", frequency: "1-1-1 (TDS)" },
        { drug: "Cap Pantoprazole", dose: "40 mg", frequency: "1-0-0 (OD Empty Stomach)" },
      ],
      abnormalLabs: [
        { test: "Platelet Count", value: "92,000 /µL", refRange: "150,000 - 450,000 /µL", status: "LOW" },
        { test: "WBC Count", value: "3,200 /µL", refRange: "4,000 - 11,000 /µL", status: "LOW" },
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
    ocrHistory: {
      medications: [
        { drug: "Tab Glimepiride", dose: "1 mg", frequency: "1-0-0" },
        { drug: "Tab Metformin", dose: "1000 mg", frequency: "1-0-1" },
      ],
      abnormalLabs: [
        { test: "Fasting Blood Sugar", value: "118 mg/dL", refRange: "70 - 100 mg/dL", status: "HIGH" },
        { test: "HbA1c", value: "6.8%", refRange: "< 5.7%", status: "HIGH" },
      ],
      timeline: [
        { year: "2019", event: "T2D Screening & Diagnosis", type: "Diagnosis" },
        { year: "2025", event: "Good glycemic control maintained on dual OHA", type: "Lab Report" },
      ],
    },
  },
];

interface KioskState {
  currentSession: KioskSession | null;
  selectedLanguage: string;
  language: string;
  selectedMode: "allopathy" | "ayush";
  isRecording: boolean;
  transcript: string;
  entities: any[];
  activeStep: number;
  doctorQueue: PatientQueueItem[];
  setSession: (session: KioskSession | null) => void;
  setLanguage: (lang: string) => void;
  setMode: (mode: "allopathy" | "ayush") => void;
  setIsRecording: (recording: boolean) => void;
  setRecording: (recording: boolean) => void;
  setTranscript: (transcript: string) => void;
  addEntities: (entities: any[]) => void;
  setActiveStep: (step: number) => void;
  pushPatientToQueue: (patient: PatientQueueItem) => void;
  resetKiosk: () => void;
}

export const useKioskStore = create<KioskState>((set) => ({
  currentSession: null,
  selectedLanguage: "en",
  language: "en",
  selectedMode: "allopathy",
  isRecording: false,
  transcript: "",
  entities: [],
  activeStep: 1,
  doctorQueue: DEFAULT_DOCTOR_QUEUE,
  setSession: (session) => set({ currentSession: session }),
  setLanguage: (selectedLanguage) => set({ selectedLanguage, language: selectedLanguage }),
  setMode: (selectedMode) => set({ selectedMode }),
  setIsRecording: (isRecording) => set({ isRecording }),
  setRecording: (isRecording) => set({ isRecording }),
  setTranscript: (transcript) => set({ transcript }),
  addEntities: (newEntities) =>
    set((state) => ({ entities: [...state.entities, ...newEntities] })),
  setActiveStep: (activeStep) => set({ activeStep }),
  pushPatientToQueue: (patient) =>
    set((state) => ({
      doctorQueue: [patient, ...state.doctorQueue.filter((p) => p.token !== patient.token)],
    })),
  resetKiosk: () =>
    set({
      currentSession: null,
      selectedLanguage: "en",
      language: "en",
      selectedMode: "allopathy",
      isRecording: false,
      transcript: "",
      entities: [],
      activeStep: 1,
    }),
}));
