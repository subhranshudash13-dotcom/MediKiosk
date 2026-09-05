"use client";

import { useState, useEffect } from "react";
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
import { useKioskStore, PatientQueueItem } from "@/lib/store";

export default function DoctorDashboard() {
  const doctorQueue = useKioskStore((state) => state.doctorQueue);
  const [selectedPatient, setSelectedPatient] = useState<PatientQueueItem>(doctorQueue[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterLevel, setFilterLevel] = useState<string>("ALL");
  const [activeTab, setActiveTab] = useState<"summary" | "timeline" | "fhir">("summary");

  // If queue changes (e.g. new intake submitted), ensure selected patient is valid
  useEffect(() => {
    if (doctorQueue.length > 0 && (!selectedPatient || !doctorQueue.some((p) => p.id === selectedPatient.id))) {
      setSelectedPatient(doctorQueue[0]);
    }
  }, [doctorQueue, selectedPatient]);

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
  const filteredQueue = doctorQueue.filter((p) => {
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

  const currentPatient = selectedPatient || doctorQueue[0];

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#374151] flex flex-col justify-between selection:bg-[#FDEBD0] selection:text-[#1D2A8F]">
      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-[#FDEBD0] px-4 sm:px-6 py-3.5 sticky top-0 z-30 shadow-xs">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#FDEBD0] bg-[#FDFBF7] hover:bg-white text-[#374151]/80 hover:text-[#1D2A8F] text-xs font-semibold transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Exit to Home</span>
            </Link>
            <div className="h-5 w-[1px] bg-[#FDEBD0] hidden sm:block" />
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-[8px] bg-[#1D2A8F] text-white flex items-center justify-center font-bold shadow-xs">
                <Stethoscope className="w-4 h-4 text-[#FB923C]" />
              </div>
              <div className="text-left">
                <h1 className="font-heading font-bold text-sm text-[#374151] leading-tight">
                  MediKiosk • Physician Consultation Cockpit
                </h1>
                <p className="text-[11px] text-[#374151]/70">
                  Pre-Consultation Clinical Briefing &amp; FHIR R4 Electronic Health Record
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 text-xs">
              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                OPD Active (Room 12)
              </span>
              <span className="text-[#374151] font-bold">Dr. S. K. Mukherjee, MD</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Workstation Layout: Left Queue & Right Dossier */}
      <main className="max-w-[1600px] mx-auto w-full px-4 sm:px-6 py-6 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Triage Patient Queue (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white border border-[#FDEBD0] rounded-[16px] p-5 shadow-sm">
            {/* Header & Filter */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#1D2A8F]" />
                <h2 className="font-heading font-bold text-sm text-[#374151]">Triaged OPD Queue</h2>
              </div>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#1D2A8F]/10 text-[#1D2A8F]">
                {filteredQueue.length} Active
              </span>
            </div>

            {/* Search Input */}
            <div className="relative mb-3">
              <Search className="w-3.5 h-3.5 text-[#374151]/60 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search token, name, complaint..."
                className="w-full pl-8 pr-3 py-2 rounded-full bg-[#FDFBF7] border border-[#FDEBD0] text-xs text-[#374151] focus:outline-none focus:border-[#1D2A8F] transition-colors"
              />
            </div>

            {/* Triage Level Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 mb-4 text-[11px]">
              {["ALL", "EMERGENCY", "URGENT", "ROUTINE"].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setFilterLevel(lvl)}
                  className={`px-3 py-1 rounded-full font-bold transition-all whitespace-nowrap cursor-pointer ${
                    filterLevel === lvl
                      ? "bg-[#1D2A8F] text-white shadow-xs"
                      : "bg-[#FDFBF7] text-[#374151]/70 border border-[#FDEBD0] hover:bg-white hover:text-[#1D2A8F]"
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>

            {/* Queue List */}
            <div className="space-y-2.5 max-h-[calc(100vh-320px)] overflow-y-auto pr-1">
              {filteredQueue.map((item) => {
                const isSelected = currentPatient?.id === item.id;
                const isEmergency = item.triageLevel === "EMERGENCY";
                const isUrgent = item.triageLevel === "URGENT";

                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelectPatient(item)}
                    className={`p-3.5 rounded-[12px] border transition-all cursor-pointer text-left relative ${
                      isSelected
                        ? "bg-[#FDFBF7] border-[#1D2A8F] shadow-xs ring-1 ring-[#1D2A8F]"
                        : "bg-white border-[#FDEBD0] hover:border-[#1D2A8F]/40 hover:bg-[#FDFBF7]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs px-2 py-0.5 rounded-full bg-[#FDFBF7] border border-[#FDEBD0] text-[#1D2A8F]">
                          {item.token}
                        </span>
                        <h4 className="font-heading font-bold text-xs text-[#374151]">
                          {item.name} <span className="text-[#374151]/60 font-normal text-[11px]">({item.age}{item.gender.charAt(0)})</span>
                        </h4>
                      </div>

                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          isEmergency
                            ? "bg-red-50 text-[#C2410C] border border-red-200"
                            : isUrgent
                            ? "bg-amber-50 text-amber-800 border border-amber-200"
                            : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        }`}
                      >
                        {item.triageLevel}
                      </span>
                    </div>

                    <p className="text-xs text-[#374151]/80 line-clamp-2 leading-relaxed mb-2">
                      {item.chiefComplaint}
                    </p>

                    <div className="flex items-center justify-between text-[11px] text-[#374151]/70 pt-2 border-t border-[#FDEBD0]/80">
                      <span className="flex items-center gap-1 font-mono">
                        <ShieldCheck className="w-3 h-3 text-[#1D2A8F]" />
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
        {currentPatient && (
          <div className="lg:col-span-8 space-y-6 text-left">
            {/* Patient Banner */}
            <div className="bg-white border border-[#FDEBD0] rounded-[16px] p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#FDEBD0]/80">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#1D2A8F]/10 text-[#1D2A8F]">
                      Token {currentPatient.token}
                    </span>
                    <h2 className="font-heading font-bold text-xl sm:text-2xl text-[#374151]">
                      {currentPatient.name}
                    </h2>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#FDFBF7] border border-[#FDEBD0] text-[#374151]/80 font-semibold">
                      {currentPatient.age} Yrs • {currentPatient.gender}
                    </span>
                  </div>
                  <p className="text-xs text-[#374151]/70 mt-1.5 flex items-center gap-2">
                    <span>ABHA: <strong className="font-mono text-[#374151]">{currentPatient.abhaId}</strong></span>
                    <span>•</span>
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> ABDM Consent Verified
                    </span>
                  </p>
                </div>

                {/* Vitals Summary Pill Container */}
                <div className="flex flex-wrap gap-2 text-xs">
                  <div className="px-3 py-1 rounded-[8px] bg-[#FDFBF7] border border-[#FDEBD0]">
                    <span className="text-[#374151]/70 text-[10px] block uppercase font-semibold">BP</span>
                    <span className="font-mono font-bold text-[#374151]">{currentPatient.vitals.bp}</span>
                  </div>
                  <div className="px-3 py-1 rounded-[8px] bg-[#FDFBF7] border border-[#FDEBD0]">
                    <span className="text-[#374151]/70 text-[10px] block uppercase font-semibold">Pulse</span>
                    <span className="font-mono font-bold text-[#374151]">{currentPatient.vitals.pulse}</span>
                  </div>
                  <div className="px-3 py-1 rounded-[8px] bg-[#FDFBF7] border border-[#FDEBD0]">
                    <span className="text-[#374151]/70 text-[10px] block uppercase font-semibold">SpO2</span>
                    <span className="font-mono font-bold text-emerald-700">{currentPatient.vitals.spo2}</span>
                  </div>
                  <div className="px-3 py-1 rounded-[8px] bg-[#FDFBF7] border border-[#FDEBD0]">
                    <span className="text-[#374151]/70 text-[10px] block uppercase font-semibold">Temp</span>
                    <span className="font-mono font-bold text-[#374151]">{currentPatient.vitals.temp}</span>
                  </div>
                </div>
              </div>

              {/* Red Flag Alert Banner */}
              {currentPatient.redFlags.length > 0 && (
                <div className="mt-4 p-4 rounded-[12px] bg-red-50/70 border border-red-200 flex items-start gap-3 text-xs text-[#374151]">
                  <AlertTriangle className="w-4 h-4 text-[#C2410C] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-[#C2410C] uppercase tracking-wider block mb-1">
                      🚨 Emergency Red Flag Triggered by AI Voice Triage
                    </span>
                    <ul className="list-disc list-inside space-y-0.5 text-[#374151]">
                      {currentPatient.redFlags.map((flag, idx) => (
                        <li key={idx}><strong>{flag}</strong></li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Tab Navigation */}
              <div className="flex items-center gap-2 mt-6 pt-2 border-t border-[#FDEBD0]/80">
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
                      className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                        isActive
                          ? "bg-[#1D2A8F] text-white shadow-xs"
                          : "bg-[#FDFBF7] text-[#374151]/70 border border-[#FDEBD0] hover:bg-white hover:text-[#1D2A8F]"
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
              <div className="space-y-6">
                {/* AI Voice Quote */}
                <div className="bg-white border border-[#FDEBD0] rounded-[16px] p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-[#FB923C]" />
                      <h3 className="font-heading font-bold text-xs uppercase tracking-wider text-[#374151]/70">
                        Patient Voice Intake Recording
                      </h3>
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#1D2A8F]/10 text-[#1D2A8F]">
                      Confidence: {currentPatient.voiceTranscript.confidence}%
                    </span>
                  </div>

                  <div className="p-4 rounded-[10px] bg-[#FDFBF7] border border-[#FDEBD0]">
                    <p className="text-xs font-medium text-[#374151] italic mb-1">
                      "{currentPatient.voiceTranscript.original}"
                    </p>
                    <span className="text-[11px] text-[#374151]/70">
                      Source: Multilingual ASR ({currentPatient.voiceTranscript.language}) • Push-to-talk stream
                    </span>
                  </div>
                </div>

                {/* OPQRST / SOCRATES Structured Clinical History */}
                <div className="bg-white border border-[#FDEBD0] rounded-[16px] p-6 shadow-sm">
                  <h3 className="font-heading font-bold text-sm text-[#374151] mb-4 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-[#1D2A8F]" />
                    History of Present Illness (HPI - SOCRATES Standard)
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3.5 rounded-[10px] bg-[#FDFBF7] border border-[#FDEBD0]">
                      <span className="text-[#374151]/70 font-semibold block uppercase text-[10px] mb-0.5">
                        Site &amp; Location
                      </span>
                      <p className="font-bold text-[#374151]">{currentPatient.hpi.location}</p>
                    </div>

                    <div className="p-3.5 rounded-[10px] bg-[#FDFBF7] border border-[#FDEBD0]">
                      <span className="text-[#374151]/70 font-semibold block uppercase text-[10px] mb-0.5">
                        Onset &amp; Chronology
                      </span>
                      <p className="font-medium text-[#374151]">{currentPatient.hpi.onset}</p>
                    </div>

                    <div className="p-3.5 rounded-[10px] bg-[#FDFBF7] border border-[#FDEBD0]">
                      <span className="text-[#374151]/70 font-semibold block uppercase text-[10px] mb-0.5">
                        Character of Distress
                      </span>
                      <p className="font-medium text-[#374151]">{currentPatient.hpi.character}</p>
                    </div>

                    <div className="p-3.5 rounded-[10px] bg-[#FDFBF7] border border-[#FDEBD0]">
                      <span className="text-[#374151]/70 font-semibold block uppercase text-[10px] mb-0.5">
                        Radiation Pattern
                      </span>
                      <p className="font-medium text-[#374151]">{currentPatient.hpi.radiation}</p>
                    </div>

                    <div className="p-3.5 rounded-[10px] bg-[#FDFBF7] border border-[#FDEBD0]">
                      <span className="text-[#374151]/70 font-semibold block uppercase text-[10px] mb-0.5">
                        Severity &amp; Pain Score
                      </span>
                      <p className="font-extrabold text-[#C2410C]">{currentPatient.hpi.severity}</p>
                    </div>

                    <div className="p-3.5 rounded-[10px] bg-[#FDFBF7] border border-[#FDEBD0]">
                      <span className="text-[#374151]/70 font-semibold block uppercase text-[10px] mb-0.5">
                        Associated Symptoms
                      </span>
                      <p className="font-medium text-[#374151]">{currentPatient.hpi.associated}</p>
                    </div>
                  </div>
                </div>

                {/* Physician Decision & Prescription Studio */}
                <div className="bg-white border border-[#FDEBD0] rounded-[16px] p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-[#FDEBD0]/80">
                    <h3 className="font-heading font-bold text-sm text-[#374151] flex items-center gap-2">
                      <Pill className="w-4 h-4 text-[#1D2A8F]" />
                      Physician Assessment &amp; e-Prescription
                    </h3>
                    <span className="text-xs text-[#374151]/70 font-semibold">ABDM M2/M3 Care Context Commit</span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#374151]/70 mb-1.5">
                      Provisional Clinical Diagnosis
                    </label>
                    <input
                      type="text"
                      value={provisionalDiagnosis}
                      onChange={(e) => setProvisionalDiagnosis(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-[8px] bg-[#FDFBF7] border border-[#FDEBD0] text-xs font-medium text-[#374151] focus:outline-none focus:border-[#1D2A8F] transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#374151]/70 mb-1.5">
                      Consultation Clinical Notes &amp; Orders
                    </label>
                    <textarea
                      rows={2}
                      value={clinicalNotes}
                      onChange={(e) => setClinicalNotes(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-[8px] bg-[#FDFBF7] border border-[#FDEBD0] text-xs text-[#374151] focus:outline-none focus:border-[#1D2A8F] transition-colors"
                    />
                  </div>

                  {/* Prescribed Medications Table */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#374151]/70 mb-2">
                      Medication Orders
                    </label>
                    <div className="space-y-2">
                      {prescribedDrugs.map((drug, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between gap-3 p-3 rounded-[8px] bg-[#FDFBF7] border border-[#FDEBD0] text-xs"
                        >
                          <div className="flex items-center gap-3">
                            <Pill className="w-3.5 h-3.5 text-[#C2410C]" />
                            <span className="font-bold text-[#374151]">{drug.drug}</span>
                            <span className="text-[#374151]/70 font-mono">({drug.dose})</span>
                          </div>
                          <div className="flex items-center gap-4 text-[#374151]/70">
                            <span className="bg-white px-2.5 py-0.5 rounded-full border border-[#FDEBD0] text-[11px] font-mono">
                              {drug.frequency}
                            </span>
                            <span className="text-[11px]">{drug.duration}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveDrug(idx)}
                              className="text-[#374151]/60 hover:text-[#C2410C] transition-colors"
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
                        className="px-3 py-2 rounded-[8px] bg-[#FDFBF7] border border-[#FDEBD0] text-xs focus:outline-none focus:border-[#1D2A8F]"
                      />
                      <input
                        type="text"
                        placeholder="Dose (e.g. 10mg)"
                        value={newDrug.dose}
                        onChange={(e) => setNewDrug({ ...newDrug, dose: e.target.value })}
                        className="px-3 py-2 rounded-[8px] bg-[#FDFBF7] border border-[#FDEBD0] text-xs focus:outline-none focus:border-[#1D2A8F]"
                      />
                      <input
                        type="text"
                        placeholder="Freq (e.g. 1-0-1)"
                        value={newDrug.frequency}
                        onChange={(e) => setNewDrug({ ...newDrug, frequency: e.target.value })}
                        className="px-3 py-2 rounded-[8px] bg-[#FDFBF7] border border-[#FDEBD0] text-xs focus:outline-none focus:border-[#1D2A8F]"
                      />
                      <button
                        type="button"
                        onClick={handleAddDrug}
                        className="px-3 py-2 rounded-[8px] bg-[#1D2A8F]/10 border border-[#1D2A8F]/20 text-[#1D2A8F] hover:bg-[#1D2A8F] hover:text-white font-bold text-xs flex items-center justify-center gap-1 transition-all cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Rx</span>
                      </button>
                    </div>
                  </div>

                  {/* Final Commit Action Button */}
                  <div className="pt-4 border-t border-[#FDEBD0]/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <span className="text-xs text-[#374151]/70">
                      Authorized by: <strong>Dr. S. K. Mukherjee</strong> (Registration #MCI-2011-8849)
                    </span>

                    <button
                      onClick={handleApproveAndPush}
                      className="px-6 py-2.5 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                    >
                      {isSaved ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>FHIR R4 Bundle Approved &amp; Synced!</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Confirm Consultation &amp; Push to ABDM</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: OCR Historical Trajectory & Lab Records */}
            {activeTab === "timeline" && (
              <div className="space-y-6">
                {/* Abnormal Lab Findings from Prior Records */}
                <div className="bg-white border border-[#FDEBD0] rounded-[16px] p-6 shadow-sm">
                  <h3 className="font-heading font-bold text-sm text-[#374151] mb-4 flex items-center gap-2">
                    <Thermometer className="w-4 h-4 text-[#FB923C]" />
                    OCR-Extracted Abnormal Diagnostic Findings
                  </h3>

                  <div className="space-y-2.5">
                    {currentPatient.ocrHistory.abnormalLabs.map((lab, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-[10px] bg-[#FDFBF7] border border-[#FDEBD0] flex items-center justify-between gap-4 text-xs"
                      >
                        <div>
                          <h4 className="font-bold text-[#374151] text-xs">{lab.test}</h4>
                          <span className="text-[#374151]/70 text-[11px]">Reference Range: {lab.refRange}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-mono font-bold text-xs text-[#C2410C] block">
                            {lab.value}
                          </span>
                          <span className="inline-block px-2 py-0.5 rounded-full bg-red-50 text-[#C2410C] border border-red-200 text-[10px] font-bold">
                            {lab.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Longitudinal Medical Trajectory */}
                <div className="bg-white border border-[#FDEBD0] rounded-[16px] p-6 shadow-sm">
                  <h3 className="font-heading font-bold text-sm text-[#374151] mb-6 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#1D2A8F]" />
                    Longitudinal Patient Health Trajectory (2021 – 2026)
                  </h3>

                  <div className="relative pl-6 space-y-4 border-l-2 border-[#1D2A8F]/20">
                    {currentPatient.ocrHistory.timeline.map((item, idx) => (
                      <div key={idx} className="relative group">
                        <div className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-white border-2 border-[#1D2A8F]" />
                        <div className="bg-[#FDFBF7] p-3.5 rounded-[10px] border border-[#FDEBD0] hover:bg-white hover:border-[#1D2A8F] transition-colors">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="font-bold text-[#1D2A8F]">{item.year}</span>
                            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-[#1D2A8F]/10 text-[#1D2A8F]">
                              {item.type}
                            </span>
                          </div>
                          <p className="text-xs text-[#374151] font-medium leading-relaxed">{item.event}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: Interactive FHIR R4 Bundle Inspector */}
            {activeTab === "fhir" && (
              <div className="bg-white border border-[#FDEBD0] rounded-[16px] p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#FDEBD0]/80">
                  <div className="flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-[#1D2A8F]" />
                    <h3 className="font-heading font-bold text-sm text-[#374151]">
                      HL7 FHIR R4 Clinical Encounter Bundle
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Bundle / document
                  </span>
                </div>

                <pre className="p-4 rounded-[10px] bg-[#1E2433] text-[#FDEBD0] text-[11px] font-mono overflow-x-auto max-h-[500px]">
{JSON.stringify(
  {
    resourceType: "Bundle",
    id: `fhir-${currentPatient.id}`,
    type: "document",
    timestamp: new Date().toISOString(),
    entry: [
      {
        resource: {
          resourceType: "Patient",
          id: currentPatient.id,
          identifier: [{ system: "https://healthid.ndhm.gov.in", value: currentPatient.abhaId }],
          name: [{ text: currentPatient.name }],
          gender: currentPatient.gender.toLowerCase(),
          birthDate: `${2026 - currentPatient.age}-01-01`,
        },
      },
      {
        resource: {
          resourceType: "Condition",
          clinicalStatus: { coding: [{ system: "http://terminology.hl7.org/CodeSystem/condition-clinical", code: "active" }] },
          code: { text: currentPatient.chiefComplaint },
          subject: { reference: `Patient/${currentPatient.id}` },
          severity: { text: currentPatient.hpi.severity },
        },
      },
      {
        resource: {
          resourceType: "CarePlan",
          status: "active",
          intent: "order",
          title: provisionalDiagnosis,
          description: clinicalNotes,
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
        )}
      </main>
    </div>
  );
}
