"use client";

import { useState } from "react";
import {
  Mic,
  FileScan,
  ShieldCheck,
  Stethoscope,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Lock,
  Layers,
  Activity,
  HeartPulse
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
    title: "Multilingual Voice Triage",
    category: "Point of Entry Kiosk",
    icon: Mic,
    iconColor: "text-[#7C6EF7]",
    badgeBg: "bg-[#EEEAFE]",
    summary: "Patient interacts using natural speech in Hindi, Telugu, Tamil, or English. Adaptive questioning explores pain severity, chronology, and associated symptoms.",
    technicalSpecs: [
      "SOCRATES / OPQRST Clinical Protocol",
      "Bhashini & Whisper Multilingual ASR",
      "Real-Time Red-Flag Alert Detector",
      "Voice Activity Detection (VAD)"
    ],
    outputData: "Structured Chief Complaint + Pain Score (0-10) + Triage Priority (Emergency / Urgent / Routine)"
  },
  {
    id: "ocr",
    stepNumber: "02",
    title: "Document OCR & Clinical Intent",
    category: "Physical Record Intake",
    icon: FileScan,
    iconColor: "text-[#06B6D4]",
    badgeBg: "bg-[#CFFAFE]",
    summary: "Scans past paper prescriptions, lab reports, and discharge summaries. Extracts clinical purpose, drug dosages, frequencies, and abnormal lab flags.",
    technicalSpecs: [
      "PaddleOCR Multilingual Engine",
      "Dosage Pattern Normalizer (e.g. 1-0-1 BD)",
      "Reference Range High/Low Classifier",
      "Prescription Intent Parser"
    ],
    outputData: "Standardized Medication List + Historical Lab Panels + Clinical Timeline Event"
  },
  {
    id: "abdm",
    stepNumber: "03",
    title: "ABDM & Consent Gateway",
    category: "Interoperability & Privacy",
    icon: ShieldCheck,
    iconColor: "text-[#7C6EF7]",
    badgeBg: "bg-[#EEEAFE]",
    summary: "Verifies 14-digit ABHA ID via Aadhaar/Mobile OTP or Counter QR. Manages DPDP Act 2023 compliant consent artifacts to discover longitudinal health records.",
    technicalSpecs: [
      "ABDM M1 Sandbox Profile Verification",
      "M2 Scan & Share Token Registration",
      "M3 Care Context & Consent Artifacts",
      "HIP/HIU Health Record Fetch"
    ],
    outputData: "Verified ABHA Profile (ramesh.kumar@abdm) + Linked Hospital Care Contexts"
  },
  {
    id: "doctor",
    stepNumber: "04",
    title: "Doctor Workstation & FHIR R4",
    category: "Physician Clinical Studio",
    icon: Stethoscope,
    iconColor: "text-[#12B981]",
    badgeBg: "bg-[#DCFCE7]",
    summary: "Physician opens the live OPD triage queue. The consultation room is pre-hydrated with structured HPI, drug history, and longitudinal trajectory in HL7 FHIR format.",
    technicalSpecs: [
      "HL7 FHIR R4 Bundle Assembler",
      "Emergency Pre-Consultation Flags",
      "SNOMED CT & ICD-10 Coding Prompts",
      "Digital Prescription Studio"
    ],
    outputData: "FHIR R4 DiagnosticReport / MedicationRequest Bundle + Signed OPD Consultation Slip"
  }
];

export function ClinicalArchitectureDiagram() {
  const [selectedStageId, setSelectedStageId] = useState<string>("voice");

  const activeStage =
    PIPELINE_STAGES.find((s) => s.id === selectedStageId) || PIPELINE_STAGES[0];
  const IconComponent = activeStage.icon;

  return (
    <div className="w-full bg-white border border-[#E7E4DD] rounded-3xl p-6 sm:p-8 shadow-xs">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#F2F0EB]">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EEEAFE] border border-[#7C6EF7]/20 text-[#7C6EF7] text-xs font-bold mb-2">
            <Layers className="w-3.5 h-3.5" />
            <span>End-to-End Clinical Architecture</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-[#111111]">
            How MediKiosk Transforms Hospital Entry
          </h3>
          <p className="text-xs text-[#5F5E5A] mt-1">
            From patient voice arrival at the kiosk to structured FHIR R4 consultation at the doctor's desk.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-xl bg-[#FAFAFC] border border-[#E7E4DD] text-[#5F5E5A] self-start sm:self-center">
          <Activity className="w-3.5 h-3.5 text-[#12B981]" />
          <span>Interactive Architectural Blueprint</span>
        </div>
      </div>

      {/* 4 Pipeline Step Selector Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {PIPELINE_STAGES.map((stage) => {
          const isSelected = stage.id === selectedStageId;
          const StageIcon = stage.icon;

          return (
            <button
              key={stage.id}
              type="button"
              onClick={() => setSelectedStageId(stage.id)}
              className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                isSelected
                  ? "bg-[#FAFAFC] border-[#7C6EF7] shadow-xs"
                  : "bg-white border-[#E7E4DD] hover:border-[#7C6EF7]/40"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-8 h-8 rounded-xl ${stage.badgeBg} ${stage.iconColor} flex items-center justify-center font-extrabold text-xs`}>
                    <StageIcon className="w-4 h-4" />
                  </div>
                  <span className="font-mono text-xs font-extrabold text-[#8A8A8A]">
                    Step {stage.stepNumber}
                  </span>
                </div>
                <h4 className="font-extrabold text-sm text-[#111111]">
                  {stage.title}
                </h4>
                <p className="text-[11px] text-[#5F5E5A] mt-1 line-clamp-2">
                  {stage.summary}
                </p>
              </div>

              <div className="mt-4 pt-2 border-t border-[#F2F0EB] flex items-center justify-between text-[11px]">
                <span className="font-semibold text-[#8A8A8A]">{stage.category}</span>
                <span className={`font-bold ${isSelected ? "text-[#7C6EF7]" : "text-[#5F5E5A]"}`}>
                  {isSelected ? "Active View" : "Inspect →"}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Deep-Dive Stage Detail Blueprint */}
      <div className="mt-8 p-6 sm:p-8 rounded-3xl bg-[#FAFAFC] border border-[#E7E4DD]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left 7 Cols: Architectural Deep Dive */}
          <div className="lg:col-span-7 space-y-5">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-2xl ${activeStage.badgeBg} ${activeStage.iconColor} flex items-center justify-center shadow-xs`}>
                <IconComponent className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-mono font-extrabold text-[#7C6EF7] tracking-wider block">
                  Stage {activeStage.stepNumber} Deep Dive • {activeStage.category}
                </span>
                <h4 className="text-xl font-extrabold text-[#111111]">
                  {activeStage.title}
                </h4>
              </div>
            </div>

            <p className="text-xs text-[#5F5E5A] leading-relaxed">
              {activeStage.summary}
            </p>

            {/* Technical Specification Chips */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#111111] block">
                Engineering Protocols &amp; Subsystems:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {activeStage.technicalSpecs.map((spec, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-white border border-[#E7E4DD] flex items-center gap-2 text-xs font-semibold text-[#111111]"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#12B981] shrink-0" />
                    <span>{spec}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right 5 Cols: Standardized Clinical Output Box */}
          <div className="lg:col-span-5 bg-white border border-[#E7E4DD] rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#F2F0EB]">
              <span className="text-xs font-bold text-[#111111] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#7C6EF7]" />
                Standardized Clinical Payload
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#DCFCE7] text-[#12B981] font-bold">
                VALIDATED
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[#FAFAFC] border border-[#E7E4DD] font-mono text-xs text-[#111111] leading-relaxed">
              <span className="text-[#8A8A8A] text-[10px] block mb-1">
                // Dispatched payload definition:
              </span>
              {activeStage.outputData}
            </div>

            <div className="flex items-center justify-between text-[11px] text-[#5F5E5A] pt-1">
              <span className="flex items-center gap-1">
                <Lock className="w-3 h-3 text-[#12B981]" />
                <span>Encrypted in Transit</span>
              </span>
              <span className="font-semibold text-[#7C6EF7]">
                HL7 FHIR R4 Ready
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
