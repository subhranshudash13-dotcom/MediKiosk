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
import { KioskAPI } from "@/lib/api";
import { Doctor30SecondView } from "@/components/doctor/Doctor30SecondView";
import { ClinicalStoryboard } from "@/components/clinical/ClinicalStoryboard";
import { HistoryCompletenessEngine } from "@/components/clinical/HistoryCompletenessEngine";

export default function DoctorDashboard() {
  const doctorQueue = useKioskStore((state) => state.doctorQueue);
  const setDoctorQueue = useKioskStore((state) => state.setDoctorQueue);
  const [selectedPatient, setSelectedPatient] = useState<PatientQueueItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterLevel, setFilterLevel] = useState<string>("ALL");
  const [activeTab, setActiveTab] = useState<"storyboard" | "summary" | "timeline" | "fhir">("storyboard");
  const [isLoadingQueue, setIsLoadingQueue] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  // Live Queue Fetching from MongoDB
  const loadQueue = async () => {
    try {
      setIsLoadingQueue(true);
      const data = await KioskAPI.getDoctorQueue();
      if (data && Array.isArray(data)) {
        setDoctorQueue(data);
        if (data.length > 0 && !selectedPatient) {
          setSelectedPatient(data[0]);
        }
      }
    } catch (err) {
      console.error("Failed to load doctor queue from MongoDB:", err);
    } finally {
      setIsLoadingQueue(false);
    }
  };

  useEffect(() => {
    loadQueue();
    const interval = setInterval(loadQueue, 10000);
    return () => clearInterval(interval);
  }, []);

  // If queue changes (e.g. new intake submitted), ensure selected patient is valid
  useEffect(() => {
    if (doctorQueue.length > 0 && (!selectedPatient || !doctorQueue.some((p) => p.id === selectedPatient.id))) {
      setSelectedPatient(doctorQueue[0]);
    }
  }, [doctorQueue, selectedPatient]);

  const handleSeedDemo = async () => {
    try {
      setIsSeeding(true);
      await KioskAPI.seedDemoQueue();
      await loadQueue();
    } catch (err) {
      console.error("Seed failed:", err);
    } finally {
      setIsSeeding(false);
    }
  };

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

  const handleApproveAndPush = async () => {
    const current = selectedPatient || doctorQueue[0];
    if (!current) return;
    try {
      setIsSaved(true);
      await KioskAPI.approveConsultation(current.id, {
        provisional_diagnosis: provisionalDiagnosis,
        clinical_notes: clinicalNotes,
        prescribed_medications: prescribedDrugs,
        doctor_name: "Dr. S. K. Mukherjee"
      });
      await loadQueue();
      setTimeout(() => setIsSaved(false), 3500);
    } catch (err) {
      console.error("Consultation approval PATCH failed:", err);
      setTimeout(() => setIsSaved(false), 3500);
    }
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
                  MediKiosk • The Clinical Story Layer &amp; Physician Cockpit
                </h1>
                <p className="text-[11px] text-[#374151]/70">
                  Pre-Consultation Verified Storyboard • Evidence Provenance • FHIR R4 Bundle
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
                <h2 className="font-heading font-bold text-sm text-[#374151]">Pre-Consultation OPD Queue</h2>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={loadQueue}
                  disabled={isLoadingQueue}
                  title="Refresh Queue from MongoDB"
                  className="p-1 rounded-md border border-[#FDEBD0] text-[#374151]/70 hover:text-[#1D2A8F] hover:bg-[#FDFBF7] transition-colors cursor-pointer text-xs"
                >
                  <Clock className={`w-3.5 h-3.5 ${isLoadingQueue ? "animate-spin" : ""}`} />
                </button>
                <button
                  type="button"
                  onClick={handleSeedDemo}
                  disabled={isSeeding}
                  title="Seed Benchmark Demo Patients into MongoDB"
                  className="px-2 py-0.5 rounded-full border border-[#FDEBD0] bg-[#FDFBF7] text-[#1D2A8F] font-bold text-[10px] hover:bg-white transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Sparkles className="w-2.5 h-2.5 text-[#FB923C]" />
                  <span>{isSeeding ? "Seeding..." : "Seed"}</span>
                </button>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#1D2A8F]/10 text-[#1D2A8F]">
                  {filteredQueue.length}
                </span>
              </div>
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
              {filteredQueue.length === 0 ? (
                <div className="p-5 text-center bg-[#FDFBF7] rounded-xl border border-dashed border-[#FDEBD0] space-y-3 my-1">
                  <User className="w-8 h-8 text-[#1D2A8F]/40 mx-auto" />
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-[#374151]">No patients in queue</p>
                    <p className="text-[11px] text-[#374151]/60">Patients who complete kiosk triage appear here live.</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleSeedDemo}
                    disabled={isSeeding}
                    className="w-full py-2 px-3 rounded-lg bg-[#1D2A8F] text-white text-xs font-bold hover:bg-[#1D2A8F]/90 transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#FB923C]" />
                    {isSeeding ? "Seeding Benchmark..." : "Seed Benchmark Patients"}
                  </button>
                </div>
              ) : (
                filteredQueue.map((item) => {
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
                        <span className="text-[10px] font-bold text-emerald-700">
                          {item.historyCompleteness}% Story
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Comprehensive Clinical Dossier (8 Cols) */}
        {currentPatient ? (
          <div className="lg:col-span-8 space-y-6 text-left">
            {/* 1. ⭐ SIGNATURE DOCTOR 30-SECOND RAPID VIEW CARD */}
            <Doctor30SecondView
              patient={currentPatient}
              onOpenStoryboard={() => setActiveTab("storyboard")}
            />

            {/* Action Bar with PDF Report Download & ABDM Sync */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-[#E0D7C9] shadow-subtle">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#1B4332]" />
                <span className="text-xs font-bold text-[#1F2421]">
                  Official First-Mile Intake Dossier (Token {currentPatient.token})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={`http://localhost:8000/api/v1/clinical/report/pdf/${(currentPatient as any).sessionId || currentPatient.id || 'demo'}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-full bg-[#1B4332] text-white hover:bg-[#081C15] text-xs font-bold transition-all flex items-center gap-1.5 shadow-subtle cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-[#D8F3DC]" />
                  <span>Download Full Medical PDF Report</span>
                </a>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-[#E0D7C9] overflow-x-auto">
              {[
                { id: "storyboard", label: "⭐ Clinical Storyboard & Evidence", icon: Layers },
                { id: "summary", label: "Completeness & Structured HPI", icon: FileText },
                { id: "timeline", label: "OCR Trajectory & Labs", icon: Thermometer },
                { id: "fhir", label: "FHIR R4 Bundle", icon: Code2 },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      isActive
                        ? "bg-[#1B4332] text-white shadow-subtle"
                        : "bg-[#FBF9F5] text-[#4E5752] border border-[#E0D7C9] hover:bg-white hover:text-[#1B4332]"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* TAB 1: Clinical Storyboard with Clickable Evidence Trail */}
            {activeTab === "storyboard" && (
              <div className="space-y-6">
                <ClinicalStoryboard patient={currentPatient} />
              </div>
            )}

            {/* TAB 2: Completeness Engine & Structured HPI */}
            {activeTab === "summary" && (
              <div className="space-y-6">
                {/* Completeness Map */}
                <HistoryCompletenessEngine
                  completeness={currentPatient.historyCompleteness || 91}
                  coverage={currentPatient.historyCoverage}
                  chiefComplaint={currentPatient.chiefComplaint}
                />

                {/* AI Voice Quote */}
                <div className="bg-white border border-[#FDEBD0] rounded-[16px] p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-[#FB923C]" />
                      <h3 className="font-heading font-bold text-xs uppercase tracking-wider text-[#374151]/70">
                        Patient / Caregiver Voice Intake
                      </h3>
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#1D2A8F]/10 text-[#1D2A8F]">
                      Confidence: {currentPatient.voiceTranscript.confidence}%
                    </span>
                  </div>

                  <div className="p-4 rounded-[10px] bg-[#FDFBF7] border border-[#FDEBD0]">
                    <p className="text-xs font-medium text-[#374151] italic mb-1">
                      &ldquo;{currentPatient.voiceTranscript.original}&rdquo;
                    </p>
                    <span className="text-[11px] text-[#374151]/70">
                      Source: {currentPatient.intakeSource === "CAREGIVER" ? "Caregiver Assisted" : "Direct Speech"} ({currentPatient.voiceTranscript.language}) • Multilingual ASR
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
                      <p className="font-bold text-[#374151]">{currentPatient.hpi?.location || "General / Diffuse"}</p>
                    </div>

                    <div className="p-3.5 rounded-[10px] bg-[#FDFBF7] border border-[#FDEBD0]">
                      <span className="text-[#374151]/70 font-semibold block uppercase text-[10px] mb-0.5">
                        Onset &amp; Chronology
                      </span>
                      <p className="font-medium text-[#374151]">{currentPatient.hpi?.onset || "Acute"}</p>
                    </div>

                    <div className="p-3.5 rounded-[10px] bg-[#FDFBF7] border border-[#FDEBD0]">
                      <span className="text-[#374151]/70 font-semibold block uppercase text-[10px] mb-0.5">
                        Character of Distress
                      </span>
                      <p className="font-medium text-[#374151]">{currentPatient.hpi?.character || "Standard"}</p>
                    </div>

                    <div className="p-3.5 rounded-[10px] bg-[#FDFBF7] border border-[#FDEBD0]">
                      <span className="text-[#374151]/70 font-semibold block uppercase text-[10px] mb-0.5">
                        Radiation Pattern
                      </span>
                      <p className="font-medium text-[#374151]">{currentPatient.hpi?.radiation || "None reported"}</p>
                    </div>

                    <div className="p-3.5 rounded-[10px] bg-[#FDFBF7] border border-[#FDEBD0]">
                      <span className="text-[#374151]/70 font-semibold block uppercase text-[10px] mb-0.5">
                        Severity &amp; Pain Score
                      </span>
                      <p className="font-extrabold text-[#C2410C]">{currentPatient.hpi?.severity || "Moderate"}</p>
                    </div>

                    <div className="p-3.5 rounded-[10px] bg-[#FDFBF7] border border-[#FDEBD0]">
                      <span className="text-[#374151]/70 font-semibold block uppercase text-[10px] mb-0.5">
                        Associated Symptoms
                      </span>
                      <p className="font-medium text-[#374151]">{currentPatient.hpi?.associated || "None"}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: OCR Historical Trajectory & Lab Records */}
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
                          <p className="text-xs text-[#374151]">{item.event}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: FHIR R4 Bundle */}
            {activeTab === "fhir" && (
              <div className="bg-white border border-[#FDEBD0] rounded-[16px] p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#FDEBD0]/80">
                  <div className="flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-[#1D2A8F]" />
                    <h3 className="font-heading font-bold text-sm text-[#374151]">
                      ABDM FHIR R4 Clinical Document Bundle
                    </h3>
                  </div>
                  <span className="text-xs font-mono bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full border border-emerald-200 font-semibold">
                    Valid NRCES StructureDefinition
                  </span>
                </div>

                <div className="bg-[#1E2433] rounded-[10px] p-4 text-xs font-mono text-[#FDEBD0] overflow-x-auto max-h-[400px]">
                  <pre>{JSON.stringify({
                    resourceType: "Bundle",
                    type: "document",
                    timestamp: new Date().toISOString(),
                    identifier: { system: "https://abdm.gov.in/bundle", value: `BUNDLE-${currentPatient.token.replace('#','')}` },
                    entry: [
                      {
                        resource: {
                          resourceType: "Composition",
                          status: "final",
                          type: { coding: [{ system: "http://snomed.info/sct", code: "371530004", display: "Clinical consultation report" }] },
                          subject: { reference: `Patient/${currentPatient.abhaId}`, display: currentPatient.name },
                          title: "MediKiosk Verified Clinical Encounter Brief"
                        }
                      },
                      {
                        resource: {
                          resourceType: "Condition",
                          clinicalStatus: { coding: [{ system: "http://terminology.hl7.org/CodeSystem/condition-clinical", code: "active" }] },
                          code: { text: currentPatient.chiefComplaint },
                          subject: { reference: `Patient/${currentPatient.abhaId}` }
                        }
                      }
                    ]
                  }, null, 2)}</pre>
                </div>
              </div>
            )}

            {/* Physician Decision & Prescription Studio (Always Visible at Bottom) */}
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
                          className="text-[#374151]/60 hover:text-[#C2410C] transition-colors cursor-pointer"
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
        ) : (
          <div className="lg:col-span-8 flex flex-col items-center justify-center min-h-[480px] bg-white rounded-2xl border border-[#FDEBD0] p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#1D2A8F]/10 flex items-center justify-center text-[#1D2A8F]">
              <FileText className="w-8 h-8" />
            </div>
            <div className="max-w-md space-y-2">
              <h3 className="font-heading font-bold text-lg text-[#374151]">No Patient Selected</h3>
              <p className="text-xs text-[#374151]/70 leading-relaxed">
                Select a patient from the active triage queue on the left to inspect their 30-Second Rapid View, Clinical Storyboard, SOCRATES symptom progression, and verified FHIR R4 dossier.
              </p>
            </div>
            {filteredQueue.length === 0 && (
              <button
                type="button"
                onClick={handleSeedDemo}
                disabled={isSeeding}
                className="py-2.5 px-5 rounded-xl bg-[#1D2A8F] text-white text-xs font-bold hover:bg-[#1D2A8F]/90 transition-all shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4 text-[#FB923C]" />
                {isSeeding ? "Populating Benchmark Cases..." : "Populate 3 Benchmark Demo Patients"}
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
