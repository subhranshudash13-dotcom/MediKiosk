"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Stethoscope,
  AlertTriangle,
  ArrowLeft,
  Clock,
  FileText,
  CheckCircle2,
  Pill,
  Activity,
  Heart,
  ShieldCheck,
  Search,
  Filter,
  User,
  Sparkles,
  ChevronRight,
  Plus,
  Trash2,
  Send,
  Eye,
  Download,
  Share2,
  Calendar,
  Layers,
  Thermometer,
  Zap,
  Check,
  Code2,
  Info
} from "lucide-react";

interface PatientQueueItem {
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

const mockQueue: PatientQueueItem[] = [
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
        { test: "Serum Total Cholesterol", value: "242 mg/dL", refRange: "< 200 mg/dL", status: "HIGH" },
        { test: "LDL Cholesterol", value: "158 mg/dL", refRange: "< 100 mg/dL", status: "HIGH" },
        { test: "HbA1c", value: "7.4%", refRange: "< 5.7%", status: "HIGH" },
      ],
      timeline: [
        { year: "2021", event: "Diagnosed with Type 2 Diabetes Mellitus (AIIMS New Delhi)", type: "Diagnosis" },
        { year: "2023", event: "Initiated on Telmisartan for Stage 1 Essential Hypertension", type: "Medication" },
        { year: "2024", event: "Elevated Lipid Profile on Routine Health Check", type: "Lab Report" },
        { year: "2026", event: "Current Presentation: Acute Exertional Retrosternal Chest Discomfort", type: "Current" },
      ],
    },
  },
  {
    id: "pat-105",
    token: "#105",
    name: "Sunita Devi",
    age: 38,
    gender: "Female",
    abhaId: "91-7712-4091-8821",
    triageLevel: "URGENT",
    chiefComplaint: "High-grade intermittent fever with chills and vomiting x 4 days",
    triagedTime: "8 mins ago",
    vitals: {
      bp: "112/74 mmHg",
      pulse: "104 bpm (Tachycardia)",
      spo2: "98%",
      temp: "102.6 °F (High Grade)",
      bmi: "22.4 (Normal)",
    },
    hpi: {
      onset: "4 days ago, step-ladder temperature rise",
      location: "Generalized body aches with retro-orbital headache",
      character: "Spiking fevers accompanied by severe shivering",
      radiation: "N/A",
      severity: "7 / 10",
      aggravating: "Evening hours",
      relieving: "Temporary defervescence after Paracetamol",
      associated: "3 episodes of non-bilious vomiting, mild epigastric pain, marked fatigue",
    },
    voiceTranscript: {
      original: "चार दिनों से बहुत तेज बुखार आ रहा है, कंपकंपी छूटती है और उल्टी जैसा लग रहा है।",
      language: "Hindi (hi-IN)",
      confidence: 96.2,
    },
    redFlags: [
      "Sustained high fever (>102°F) with tachycardia (104 bpm)",
      "Persistent nausea with risk of dehydration",
    ],
    ocrHistory: {
      medications: [
        { drug: "Tab Paracetamol", dose: "650 mg", frequency: "SOS" },
        { drug: "Cap Omeprazole", dose: "20 mg", frequency: "1-0-0" },
      ],
      abnormalLabs: [
        { test: "Platelet Count", value: "118,000 /µL", refRange: "150,000 - 450,000", status: "LOW" },
        { test: "Total Leucocyte Count", value: "3,800 /µL", refRange: "4,000 - 11,000", status: "LOW" },
      ],
      timeline: [
        { year: "2022", event: "Treated for uncomplicated Dengue fever (Max Saket)", type: "Encounter" },
        { year: "2026", event: "Presenting with acute febrile illness and thrombocytopenia", type: "Current" },
      ],
    },
  },
  {
    id: "pat-106",
    token: "#106",
    name: "Rajesh Verma",
    age: 52,
    gender: "Male",
    abhaId: "91-1192-3847-5501",
    triageLevel: "ROUTINE",
    chiefComplaint: "Routine OPD follow-up for T2D & medication refill",
    triagedTime: "14 mins ago",
    vitals: {
      bp: "128/82 mmHg",
      pulse: "76 bpm",
      spo2: "99%",
      temp: "98.2 °F",
      bmi: "25.2 (Normal)",
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

export default function DoctorDashboard() {
  const [selectedPatient, setSelectedPatient] = useState<PatientQueueItem>(mockQueue[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterLevel, setFilterLevel] = useState<string>("ALL");
  const [activeTab, setActiveTab] = useState<"summary" | "timeline" | "fhir">("summary");

  // Physician Prescription State
  const [provisionalDiagnosis, setProvisionalDiagnosis] = useState(
    "Acute Coronary Syndrome (ACS) / Rule out NSTEMI"
  );
  const [clinicalNotes, setClinicalNotes] = useState(
    "12-Lead ECG ordered immediately. Start loading dose of Aspirin 300mg + Clopidogrel 300mg pending ECG. Stat Trop-I and bedside Echocardiography."
  );
  const [prescribedDrugs, setPrescribedDrugs] = useState([
    { drug: "Tab Aspirin (Dispersible)", dose: "300 mg", frequency: "STAT", duration: "1 dose" },
    { drug: "Tab Clopidogrel", dose: "300 mg", frequency: "STAT", duration: "1 dose" },
    { drug: "Tab Sorbitrate (Sublingual)", dose: "5 mg", frequency: "SOS for chest pain", duration: "3 days" },
  ]);
  const [newDrug, setNewDrug] = useState({ drug: "", dose: "", frequency: "1-0-1", duration: "5 days" });
  const [isSaved, setIsSaved] = useState(false);

  // Filter patients
  const filteredQueue = mockQueue.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.token.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.chiefComplaint.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterLevel === "ALL" || p.triageLevel === filterLevel;
    return matchesSearch && matchesFilter;
  });

  const handleAddDrug = () => {
    if (!newDrug.drug) return;
    setPrescribedDrugs([...prescribedDrugs, newDrug]);
    setNewDrug({ drug: "", dose: "", frequency: "1-0-1", duration: "5 days" });
  };

  const handleRemoveDrug = (index: number) => {
    setPrescribedDrugs(prescribedDrugs.filter((_, i) => i !== index));
  };

  const handleSelectPatient = (p: PatientQueueItem) => {
    setSelectedPatient(p);
    setIsSaved(false);
    if (p.triageLevel === "EMERGENCY") {
      setProvisionalDiagnosis("Acute Coronary Syndrome (ACS) / Rule out NSTEMI");
      setClinicalNotes("Stat 12-Lead ECG + Cardiac Enzymes. Immediate cardiology bedside consult.");
    } else if (p.triageLevel === "URGENT") {
      setProvisionalDiagnosis("Acute Febrile Illness / Suspected Dengue Fever with Thrombocytopenia");
      setClinicalNotes("NS1 Antigen + Dengue IgM/IgG. Adequate oral rehydration and repeat CBC in 12h.");
    } else {
      setProvisionalDiagnosis("Type 2 Diabetes Mellitus - Moderate Glycemic Control");
      setClinicalNotes("Continue current anti-diabetic regimen. Annual diabetic retinopathy check recommended.");
    }
  };

  const handleApproveAndPush = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 4000);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFC] text-[#111111] flex flex-col justify-between selection:bg-[#EEEAFE]">
      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-[#E7E4DD] px-6 py-3.5 sticky top-0 z-30 shadow-sm">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[#E7E4DD] bg-[#FAFAFC] hover:bg-[#F5F3FF] hover:border-[#7C6EF7] text-[#5F5E5A] hover:text-[#7C6EF7] text-xs font-semibold transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Exit Workstation</span>
            </Link>
            <div className="h-5 w-[1px] bg-[#E7E4DD] hidden sm:block" />
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#EEEAFE] border border-[#7C6EF7]/20 flex items-center justify-center text-[#7C6EF7]">
                <Stethoscope className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-bold text-base text-[#111111] leading-tight">
                  MediKiosk • Physician Consultation Workstation
                </h1>
                <p className="text-xs text-[#5F5E5A]">
                  AI-Assisted Pre-Consultation Summary & FHIR R4 Electronic Health Record
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 text-xs">
              <span className="px-3 py-1 rounded-full bg-[#DCFCE7] text-[#12B981] font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#12B981] animate-pulse" />
                OPD Active (Room 12)
              </span>
              <span className="text-[#5F5E5A] font-medium">Dr. S. K. Mukherjee, MD</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Workstation Layout: Left Queue & Right Dossier */}
      <main className="max-w-[1600px] mx-auto w-full px-4 sm:px-6 py-6 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Triage Patient Queue (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white border border-[#E7E4DD] rounded-3xl p-5 shadow-sm">
            {/* Header & Filter */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#7C6EF7]" />
                <h2 className="text-sm font-bold text-[#111111]">Triaged OPD Queue</h2>
              </div>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#EEEAFE] text-[#7C6EF7]">
                {filteredQueue.length} Patients
              </span>
            </div>

            {/* Search Input */}
            <div className="relative mb-3">
              <Search className="w-4 h-4 text-[#8A8A8A] absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search token, name, complaint..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#FAFAFC] border border-[#E7E4DD] text-xs text-[#111111] focus:outline-none focus:border-[#7C6EF7] focus:ring-2 focus:ring-[#EEEAFE] transition-all"
              />
            </div>

            {/* Triage Level Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 mb-4 text-[11px]">
              {["ALL", "EMERGENCY", "URGENT", "ROUTINE"].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setFilterLevel(lvl)}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all whitespace-nowrap ${
                    filterLevel === lvl
                      ? "bg-[#7C6EF7] text-white shadow-sm"
                      : "bg-[#FAFAFC] text-[#5F5E5A] border border-[#E7E4DD] hover:bg-[#F5F3FF]"
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>

            {/* Queue List */}
            <div className="space-y-3 max-h-[calc(100vh-320px)] overflow-y-auto pr-1">
              {filteredQueue.map((item) => {
                const isSelected = selectedPatient.id === item.id;
                const isEmergency = item.triageLevel === "EMERGENCY";
                const isUrgent = item.triageLevel === "URGENT";

                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelectPatient(item)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer text-left relative ${
                      isSelected
                        ? "bg-[#F5F3FF] border-[#7C6EF7] shadow-md ring-2 ring-[#7C6EF7]/20"
                        : "bg-white border-[#E7E4DD] hover:border-[#7C6EF7]/50 hover:bg-[#FAFAFC]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs px-2 py-0.5 rounded-md bg-[#FAFAFC] border border-[#E7E4DD] text-[#111111]">
                          {item.token}
                        </span>
                        <h4 className="font-bold text-sm text-[#111111]">
                          {item.name} <span className="text-[#5F5E5A] font-normal text-xs">({item.age}{item.gender.charAt(0)})</span>
                        </h4>
                      </div>

                      <span
                        className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                          isEmergency
                            ? "bg-[#FEE2E2] text-[#EF4444] border border-[#EF4444]/30 animate-pulse"
                            : isUrgent
                            ? "bg-[#FEF3C7] text-[#F59E0B] border border-[#F59E0B]/30"
                            : "bg-[#DCFCE7] text-[#12B981] border border-[#12B981]/30"
                        }`}
                      >
                        {item.triageLevel}
                      </span>
                    </div>

                    <p className="text-xs text-[#5F5E5A] line-clamp-2 leading-relaxed mb-2">
                      {item.chiefComplaint}
                    </p>

                    <div className="flex items-center justify-between text-[11px] text-[#8A8A8A] pt-2 border-t border-[#F2F0EB]">
                      <span className="flex items-center gap-1 font-mono">
                        <ShieldCheck className="w-3 h-3 text-[#7C6EF7]" />
                        {item.abhaId}
                      </span>
                      <span>{item.triagedTime}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Comprehensive Clinical Dossier (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Patient Banner */}
          <div className="bg-white border border-[#E7E4DD] rounded-3xl p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#F2F0EB]">
              <div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-[#EEEAFE] text-[#7C6EF7]">
                    Token {selectedPatient.token}
                  </span>
                  <h2 className="text-2xl font-extrabold text-[#111111]">
                    {selectedPatient.name}
                  </h2>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#FAFAFC] border border-[#E7E4DD] text-[#5F5E5A] font-semibold">
                    {selectedPatient.age} Yrs • {selectedPatient.gender}
                  </span>
                </div>
                <p className="text-xs text-[#5F5E5A] mt-1.5 flex items-center gap-2">
                  <span>ABHA: <strong className="font-mono text-[#111111]">{selectedPatient.abhaId}</strong></span>
                  <span>•</span>
                  <span className="text-[#12B981] font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> ABDM Consent Verified
                  </span>
                </p>
              </div>

              {/* Vitals Summary Pill Container */}
              <div className="flex flex-wrap gap-2 text-xs">
                <div className="px-3 py-1.5 rounded-xl bg-[#FAFAFC] border border-[#E7E4DD]">
                  <span className="text-[#8A8A8A] text-[10px] block uppercase font-bold">BP</span>
                  <span className="font-mono font-bold text-[#111111]">{selectedPatient.vitals.bp}</span>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-[#FAFAFC] border border-[#E7E4DD]">
                  <span className="text-[#8A8A8A] text-[10px] block uppercase font-bold">Pulse</span>
                  <span className="font-mono font-bold text-[#111111]">{selectedPatient.vitals.pulse}</span>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-[#FAFAFC] border border-[#E7E4DD]">
                  <span className="text-[#8A8A8A] text-[10px] block uppercase font-bold">SpO2</span>
                  <span className="font-mono font-bold text-[#12B981]">{selectedPatient.vitals.spo2}</span>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-[#FAFAFC] border border-[#E7E4DD]">
                  <span className="text-[#8A8A8A] text-[10px] block uppercase font-bold">Temp</span>
                  <span className="font-mono font-bold text-[#111111]">{selectedPatient.vitals.temp}</span>
                </div>
              </div>
            </div>

            {/* Red Flag Alert Banner (If Applicable) */}
            {selectedPatient.redFlags.length > 0 && (
              <div className="mt-4 p-4 rounded-2xl bg-[#FEE2E2] border border-[#EF4444]/40 flex items-start gap-3 text-xs text-[#111111]">
                <AlertTriangle className="w-5 h-5 text-[#EF4444] shrink-0 mt-0.5 animate-bounce" />
                <div>
                  <span className="font-extrabold text-[#EF4444] uppercase tracking-wider block mb-1">
                    🚨 Emergency Red Flag Triggered by AI Voice Triage
                  </span>
                  <ul className="list-disc list-inside space-y-0.5 text-[#111111]/90">
                    {selectedPatient.redFlags.map((flag, idx) => (
                      <li key={idx}><strong>{flag}</strong></li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Tab Navigation */}
            <div className="flex items-center gap-2 mt-6 pt-2 border-t border-[#F2F0EB]">
              {[
                { id: "summary", label: "Structured HPI & History", icon: FileText },
                { id: "timeline", label: "OCR Trajectory & Labs", icon: Layers },
                { id: "fhir", label: "FHIR R4 Bundle", icon: Code2 },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? "bg-[#7C6EF7] text-white shadow-md shadow-[#7C6EF7]/20"
                        : "bg-[#FAFAFC] text-[#5F5E5A] border border-[#E7E4DD] hover:bg-[#F5F3FF] hover:text-[#7C6EF7]"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* TAB 1: Structured HPI & Clinical Summary */}
          {activeTab === "summary" && (
            <div className="space-y-6 animate-in fade-in">
              {/* AI Voice Quote */}
              <div className="bg-white border border-[#E7E4DD] rounded-3xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#06B6D4]" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#5F5E5A]">
                      Patient Voice Intake Recording
                    </h3>
                  </div>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#CFFAFE] text-[#06B6D4]">
                    AI Confidence: {selectedPatient.voiceTranscript.confidence}%
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-[#FAFAFC] border border-[#E7E4DD]">
                  <p className="text-sm font-medium text-[#111111] italic mb-1">
                    "{selectedPatient.voiceTranscript.original}"
                  </p>
                  <span className="text-[11px] text-[#8A8A8A]">
                    Source: Multilingual ASR ({selectedPatient.voiceTranscript.language}) • Push-to-talk stream
                  </span>
                </div>
              </div>

              {/* OPQRST / SOCRATES Structured Clinical History */}
              <div className="bg-white border border-[#E7E4DD] rounded-3xl p-6 shadow-sm">
                <h3 className="text-sm font-bold text-[#111111] mb-4 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#7C6EF7]" />
                  History of Present Illness (HPI - SOCRATES Standard)
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 rounded-2xl bg-[#FAFAFC] border border-[#E7E4DD]">
                    <span className="text-[#8A8A8A] font-bold block uppercase text-[10px] mb-1">
                      Site & Location
                    </span>
                    <p className="font-semibold text-[#111111]">{selectedPatient.hpi.location}</p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#FAFAFC] border border-[#E7E4DD]">
                    <span className="text-[#8A8A8A] font-bold block uppercase text-[10px] mb-1">
                      Onset & Chronology
                    </span>
                    <p className="font-semibold text-[#111111]">{selectedPatient.hpi.onset}</p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#FAFAFC] border border-[#E7E4DD]">
                    <span className="text-[#8A8A8A] font-bold block uppercase text-[10px] mb-1">
                      Character of Pain / Distress
                    </span>
                    <p className="font-semibold text-[#111111]">{selectedPatient.hpi.character}</p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#FAFAFC] border border-[#E7E4DD]">
                    <span className="text-[#8A8A8A] font-bold block uppercase text-[10px] mb-1">
                      Radiation Pattern
                    </span>
                    <p className="font-semibold text-[#111111]">{selectedPatient.hpi.radiation}</p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#FAFAFC] border border-[#E7E4DD]">
                    <span className="text-[#8A8A8A] font-bold block uppercase text-[10px] mb-1">
                      Severity & Pain Score
                    </span>
                    <p className="font-bold text-[#EF4444]">{selectedPatient.hpi.severity}</p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#FAFAFC] border border-[#E7E4DD]">
                    <span className="text-[#8A8A8A] font-bold block uppercase text-[10px] mb-1">
                      Associated Symptoms
                    </span>
                    <p className="font-semibold text-[#111111]">{selectedPatient.hpi.associated}</p>
                  </div>
                </div>
              </div>

              {/* Physician Decision & Prescription Studio */}
              <div className="bg-white border border-[#E7E4DD] rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#F2F0EB]">
                  <h3 className="text-sm font-bold text-[#111111] flex items-center gap-2">
                    <Pill className="w-4 h-4 text-[#7C6EF7]" />
                    Physician Assessment & e-Prescription
                  </h3>
                  <span className="text-xs text-[#8A8A8A]">ABDM M2/M3 Care Context Commit</span>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#5F5E5A] mb-1.5">
                    Provisional Clinical Diagnosis
                  </label>
                  <input
                    type="text"
                    value={provisionalDiagnosis}
                    onChange={(e) => setProvisionalDiagnosis(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-[#FAFAFC] border border-[#E7E4DD] text-xs font-bold text-[#111111] focus:outline-none focus:border-[#7C6EF7] focus:ring-4 focus:ring-[#EEEAFE] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#5F5E5A] mb-1.5">
                    Consultation Clinical Notes & Orders
                  </label>
                  <textarea
                    rows={2}
                    value={clinicalNotes}
                    onChange={(e) => setClinicalNotes(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-[#FAFAFC] border border-[#E7E4DD] text-xs text-[#111111] focus:outline-none focus:border-[#7C6EF7] focus:ring-4 focus:ring-[#EEEAFE] transition-all"
                  />
                </div>

                {/* Prescribed Medications Table */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#5F5E5A] mb-2">
                    Medication Orders
                  </label>
                  <div className="space-y-2">
                    {prescribedDrugs.map((drug, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between gap-3 p-3 rounded-xl bg-[#FAFAFC] border border-[#E7E4DD] text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <Pill className="w-4 h-4 text-[#7C6EF7]" />
                          <span className="font-bold text-[#111111]">{drug.drug}</span>
                          <span className="text-[#5F5E5A] font-mono">({drug.dose})</span>
                        </div>
                        <div className="flex items-center gap-4 text-[#5F5E5A]">
                          <span className="bg-white px-2 py-0.5 rounded border border-[#E7E4DD] text-[11px] font-semibold">
                            {drug.frequency}
                          </span>
                          <span className="text-[11px]">{drug.duration}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveDrug(idx)}
                            className="text-[#8A8A8A] hover:text-[#EF4444] transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add New Drug Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 mt-3">
                    <input
                      type="text"
                      placeholder="Medication name..."
                      value={newDrug.drug}
                      onChange={(e) => setNewDrug({ ...newDrug, drug: e.target.value })}
                      className="px-3 py-2 rounded-xl bg-[#FAFAFC] border border-[#E7E4DD] text-xs focus:outline-none focus:border-[#7C6EF7]"
                    />
                    <input
                      type="text"
                      placeholder="Dose (e.g. 10mg)"
                      value={newDrug.dose}
                      onChange={(e) => setNewDrug({ ...newDrug, dose: e.target.value })}
                      className="px-3 py-2 rounded-xl bg-[#FAFAFC] border border-[#E7E4DD] text-xs focus:outline-none focus:border-[#7C6EF7]"
                    />
                    <input
                      type="text"
                      placeholder="Freq (e.g. 1-0-1)"
                      value={newDrug.frequency}
                      onChange={(e) => setNewDrug({ ...newDrug, frequency: e.target.value })}
                      className="px-3 py-2 rounded-xl bg-[#FAFAFC] border border-[#E7E4DD] text-xs focus:outline-none focus:border-[#7C6EF7]"
                    />
                    <button
                      type="button"
                      onClick={handleAddDrug}
                      className="px-3 py-2 rounded-xl bg-[#EEEAFE] border border-[#7C6EF7] text-[#7C6EF7] hover:bg-[#7C6EF7] hover:text-white font-bold text-xs flex items-center justify-center gap-1 transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Rx</span>
                    </button>
                  </div>
                </div>

                {/* Final Commit Action Button */}
                <div className="pt-4 border-t border-[#F2F0EB] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <span className="text-xs text-[#5F5E5A]">
                    Authorized by: <strong>Dr. S. K. Mukherjee</strong> (Registration #MCI-2011-8849)
                  </span>

                  <button
                    onClick={handleApproveAndPush}
                    className="px-6 py-3 rounded-2xl bg-[#12B981] hover:bg-[#10A774] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#12B981]/20 transition-all cursor-pointer"
                  >
                    {isSaved ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>FHIR R4 Bundle Approved & Synced!</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Confirm Consultation & Push to ABDM</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: OCR Historical Trajectory & Lab Records */}
          {activeTab === "timeline" && (
            <div className="space-y-6 animate-in fade-in">
              {/* Abnormal Lab Findings from Prior Records */}
              <div className="bg-white border border-[#E7E4DD] rounded-3xl p-6 shadow-sm">
                <h3 className="text-sm font-bold text-[#111111] mb-4 flex items-center gap-2">
                  <Thermometer className="w-4 h-4 text-[#F59E0B]" />
                  OCR-Extracted Abnormal Diagnostic Findings
                </h3>

                <div className="space-y-3">
                  {selectedPatient.ocrHistory.abnormalLabs.map((lab, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-[#FAFAFC] border border-[#E7E4DD] flex items-center justify-between gap-4 text-xs"
                    >
                      <div>
                        <h4 className="font-bold text-[#111111] text-sm">{lab.test}</h4>
                        <span className="text-[#5F5E5A]">Reference Range: {lab.refRange}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-extrabold text-sm text-[#EF4444] block">
                          {lab.value}
                        </span>
                        <span className="inline-block px-2 py-0.5 rounded-full bg-[#FEE2E2] text-[#EF4444] text-[10px] font-extrabold">
                          {lab.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Longitudinal Medical Trajectory */}
              <div className="bg-white border border-[#E7E4DD] rounded-3xl p-6 shadow-sm">
                <h3 className="text-sm font-bold text-[#111111] mb-6 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#7C6EF7]" />
                  Longitudinal Patient Health Trajectory (2021 – 2026)
                </h3>

                <div className="relative pl-6 space-y-6 border-l-2 border-[#EEEAFE]">
                  {selectedPatient.ocrHistory.timeline.map((item, idx) => (
                    <div key={idx} className="relative group">
                      <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-white border-2 border-[#7C6EF7] group-hover:scale-125 transition-transform" />
                      <div className="bg-[#FAFAFC] p-4 rounded-2xl border border-[#E7E4DD] hover:bg-white hover:border-[#7C6EF7] transition-all">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-bold text-[#7C6EF7]">{item.year}</span>
                          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-[#EEEAFE] text-[#7C6EF7]">
                            {item.type}
                          </span>
                        </div>
                        <p className="text-xs text-[#111111] font-medium leading-relaxed">{item.event}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Interactive FHIR R4 Bundle Inspector */}
          {activeTab === "fhir" && (
            <div className="bg-white border border-[#E7E4DD] rounded-3xl p-6 shadow-sm animate-in fade-in">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#F2F0EB]">
                <div>
                  <h3 className="text-sm font-bold text-[#111111] flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-[#7C6EF7]" />
                    Standard FHIR R4 Consultation Bundle
                  </h3>
                  <p className="text-xs text-[#5F5E5A]">
                    Interoperable schema ready for ABDM Health Information Exchange (HIE)
                  </p>
                </div>
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-[#DCFCE7] text-[#12B981]">
                  FHIR R4 Validated
                </span>
              </div>

              <pre className="p-4 rounded-2xl bg-[#111111] text-[#EEEAFE] font-mono text-xs overflow-x-auto leading-relaxed max-h-[500px]">
                {JSON.stringify(
                  {
                    resourceType: "Bundle",
                    id: `BUNDLE-${selectedPatient.id}`,
                    type: "document",
                    timestamp: new Date().toISOString(),
                    entry: [
                      {
                        fullUrl: `urn:uuid:patient-${selectedPatient.id}`,
                        resource: {
                          resourceType: "Patient",
                          id: selectedPatient.id,
                          identifier: [
                            {
                              system: "https://healthid.ndhm.gov.in",
                              value: selectedPatient.abhaId,
                            },
                          ],
                          name: [{ text: selectedPatient.name }],
                          gender: selectedPatient.gender.toLowerCase(),
                        },
                      },
                      {
                        fullUrl: `urn:uuid:condition-${selectedPatient.id}`,
                        resource: {
                          resourceType: "Condition",
                          code: {
                            text: provisionalDiagnosis,
                          },
                          severity: {
                            text: selectedPatient.triageLevel,
                          },
                          subject: {
                            reference: `Patient/${selectedPatient.id}`,
                          },
                        },
                      },
                      {
                        fullUrl: `urn:uuid:medication-request-${selectedPatient.id}`,
                        resource: {
                          resourceType: "MedicationRequest",
                          status: "active",
                          intent: "order",
                          medications: prescribedDrugs,
                          note: [{ text: clinicalNotes }],
                        },
                      },
                    ],
                  },
                  null,
                  2
                )}
              </pre>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-[#E7E4DD] py-3.5 px-6 mt-8 text-center text-xs text-[#5F5E5A]">
        <div className="max-w-[1600px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>MediKiosk Clinical Intelligence Engine • Doctor Workstation v2.0</span>
          <span className="text-[#8A8A8A]">SOCRATES/OPQRST Compliant • NHA Sandbox Linked</span>
        </div>
      </footer>
    </div>
  );
}
