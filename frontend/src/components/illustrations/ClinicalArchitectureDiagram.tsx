"use client";

import { useState } from "react";
import {
  Mic,
  FileScan,
  ShieldCheck,
  Stethoscope,
  ArrowRight,
  Layers,
  CheckCircle2,
  Database
} from "lucide-react";

interface PipelineStage {
  id: string;
  stepNumber: string;
  title: string;
  category: string;
  icon: typeof Mic;
  iconColor: string;
  badgeBg: string;
  summary: string;
  technicalSpecs: string[];
  outputData: string;
}

const PIPELINE_STAGES: PipelineStage[] = [
  {
    id: "voice",
    stepNumber: "01",
    title: "Vernacular Voice Triage",
    category: "Point of Entry Kiosk",
    icon: Mic,
    iconColor: "text-[#FB923C]",
    badgeBg: "bg-[#FB923C]/10",
    summary: "Patient interacts using natural speech in Hindi, Telugu, Tamil, Bengali, or English. Adaptive questioning explores pain severity, chronology, and associated symptoms.",
    technicalSpecs: [
      "SOCRATES / OPQRST Clinical Protocol",
      "Bhashini & Indic Dialect ASR",
      "Real-Time Red-Flag Alert Detector",
      "Voice Activity Detection (VAD)"
    ],
    outputData: "Structured Chief Complaint + Pain Score (0-10) + Triage Priority (Emergency / Urgent / Routine)"
  },
  {
    id: "ocr",
    stepNumber: "02",
    title: "Document OCR & Intent Extraction",
    category: "Physical Record Intake",
    icon: FileScan,
    iconColor: "text-[#1D2A8F]",
    badgeBg: "bg-[#1D2A8F]/10",
    summary: "Scans past paper prescriptions, lab reports, and discharge summaries. Extracts clinical purpose, drug dosages, frequencies, and abnormal lab flags.",
    technicalSpecs: [
      "PaddleOCR Multilingual Vision Engine",
      "Dosage Pattern Normalizer (e.g. 1-0-1 BD)",
      "Reference Range High/Low Classifier",
      "Prescription Intent & Purpose Parser"
    ],
    outputData: "Active Drug Reconciliation List + Abnormal Lab Badges + Longitudinal EHR Timeline"
  },
  {
    id: "cockpit",
    stepNumber: "03",
    title: "Doctor Consultation Cockpit",
    category: "Physician Workstation",
    icon: Stethoscope,
    iconColor: "text-[#C2410C]",
    badgeBg: "bg-[#C2410C]/10",
    summary: "Physician views pre-populated clinical summary in seconds. Eliminates keyboard typing during consultation, focusing 100% on patient evaluation.",
    technicalSpecs: [
      "3-Second Comprehensive EMR Briefing",
      "One-Click e-Prescription Generator",
      "Stat Diagnostic Order Triggers",
      "Drug Interaction Cross-Reference"
    ],
    outputData: "Approved Provisional Diagnosis + Medication Orders + Treatment Plan"
  },
  {
    id: "fhir",
    stepNumber: "04",
    title: "ABHA & FHIR R4 Bundle Sync",
    category: "National Health Grid",
    icon: ShieldCheck,
    iconColor: "text-emerald-700",
    badgeBg: "bg-emerald-50",
    summary: "Encounter note is converted into standardized HL7 FHIR R4 DiagnosticReport & MedicationRequest bundles, synced to patient's ABHA wallet with DPDP consent.",
    technicalSpecs: [
      "HL7 FHIR R4 Resource Standard",
      "NHA ABDM M1/M2/M3 Compliance",
      "DPDP Act 2023 Consent Artifact",
      "SNOMED CT & ICD-10 Coding"
    ],
    outputData: "Interoperable FHIR R4 JSON Bundle + ABDM Linked Health Record"
  }
];

export function ClinicalArchitectureDiagram() {
  const [activeStageId, setActiveStageId] = useState<string>("voice");
  const activeStage = PIPELINE_STAGES.find((s) => s.id === activeStageId) || PIPELINE_STAGES[0];

  return (
    <div className="bg-white border border-[#FDEBD0] rounded-[16px] p-6 sm:p-8 shadow-sm space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#FDEBD0]/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#1D2A8F]" />
            <span className="text-[11px] font-mono font-bold text-[#1D2A8F] uppercase tracking-wider">
              Technical Architecture
            </span>
          </div>
          <h3 className="font-heading font-bold text-lg text-[#374151]">
            End-to-End Hospital Data Pipeline
          </h3>
        </div>
        <span className="text-xs text-[#374151]/70 font-medium">
          Click any stage to view architectural specifications
        </span>
      </div>

      {/* 4 Pipeline Stage Steppers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {PIPELINE_STAGES.map((stage) => {
          const Icon = stage.icon;
          const isSelected = stage.id === activeStageId;

          return (
            <button
              key={stage.id}
              type="button"
              onClick={() => setActiveStageId(stage.id)}
              className={`p-4 rounded-[12px] border text-left transition-all cursor-pointer relative ${
                isSelected
                  ? "bg-[#FDFBF7] border-[#1D2A8F] shadow-xs ring-1 ring-[#1D2A8F]"
                  : "bg-white border-[#FDEBD0] hover:border-[#1D2A8F]/40 hover:bg-[#FDFBF7]"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-[#FDFBF7] border border-[#FDEBD0] text-[#374151]/70">
                  {stage.stepNumber}
                </span>
                <div className={`w-7 h-7 rounded-full ${stage.badgeBg} ${stage.iconColor} flex items-center justify-center`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
              </div>

              <span className="text-[10px] text-[#374151]/70 uppercase font-mono block mb-0.5">
                {stage.category}
              </span>
              <h4 className="font-heading font-bold text-xs text-[#374151] leading-snug">
                {stage.title}
              </h4>
            </button>
          );
        })}
      </div>

      {/* Active Stage Technical Deep-Dive */}
      <div className="p-6 rounded-[12px] bg-[#FDFBF7] border border-[#FDEBD0] space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#FDEBD0]/80">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-[8px] ${activeStage.badgeBg} ${activeStage.iconColor} flex items-center justify-center font-bold`}>
              <activeStage.icon className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-[#374151]/70 uppercase">
                Stage {activeStage.stepNumber} Deep Dive
              </span>
              <h4 className="font-heading font-bold text-sm text-[#374151]">
                {activeStage.title}
              </h4>
            </div>
          </div>
          <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-white border border-[#FDEBD0] text-[#1D2A8F]">
            {activeStage.category}
          </span>
        </div>

        <p className="text-xs text-[#374151] leading-relaxed">
          {activeStage.summary}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {/* Technical Specs List */}
          <div className="p-4 rounded-[10px] bg-white border border-[#FDEBD0] space-y-2">
            <span className="text-[10px] font-mono font-bold text-[#1D2A8F] uppercase block">
              Core Engineering Protocols
            </span>
            <ul className="space-y-1.5 text-xs text-[#374151]">
              {activeStage.technicalSpecs.map((spec, i) => (
                <li key={i} className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#FB923C] shrink-0" />
                  <span>{spec}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Output Payload */}
          <div className="p-4 rounded-[10px] bg-white border border-[#FDEBD0] space-y-2">
            <span className="text-[10px] font-mono font-bold text-[#C2410C] uppercase block">
              Standardized Output Payload
            </span>
            <p className="text-xs font-mono text-[#374151] bg-[#FDFBF7] p-3 rounded-[6px] border border-[#FDEBD0] leading-relaxed">
              {activeStage.outputData}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
