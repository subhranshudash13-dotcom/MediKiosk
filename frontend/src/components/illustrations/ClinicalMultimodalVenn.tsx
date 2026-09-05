"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic,
  FileScan,
  ShieldCheck,
  Sparkles,
  Zap,
  Activity,
  Layers,
  CheckCircle2,
  Lock,
  Stethoscope,
  Info,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

interface VennSector {
  id: "indic" | "ocr" | "abdm" | "voice_ocr" | "ocr_abdm" | "voice_abdm" | "core";
  title: string;
  badge: string;
  badgeColor: string;
  description: string;
  features: string[];
  metric: string;
  metricLabel: string;
  clinicalImpact: string;
}

const VENN_SECTORS: Record<string, VennSector> = {
  core: {
    id: "core",
    title: "MediKiosk Autonomous Clinical Engine",
    badge: "Epicenter · Multimodal Convergence",
    badgeColor: "bg-[#1D2A8F] text-white",
    description:
      "The unified convergence point where vernacular speech, physical paper records, and national digital health infrastructure fuse into verified, structured physician consultation notes.",
    features: [
      "Zero-Hallucination Triaging with cross-modal validation",
      "Dynamic SOCRATES & OPQRST conversational extraction",
      "Automated FHIR R4 Bundle generation with SNOMED CT codes",
      "Sub-3 second end-to-end token generation & queue push"
    ],
    metric: "2.8 min",
    metricLabel: "Avg Complete Patient Intake",
    clinicalImpact: "Reduces OPD queue backlog by 68% and relieves doctors from manual documentation."
  },
  indic: {
    id: "indic",
    title: "Indic Voice Intelligence (Bhashini)",
    badge: "Domain 1 · Vernacular NLP",
    badgeColor: "bg-[#FB923C]/20 text-[#C2410C]",
    description:
      "State-of-the-art acoustic models fine-tuned on 8+ Indian regional languages and dialectal medical terminology with background hospital noise cancellation.",
    features: [
      "Hindi, Telugu, Tamil, Bengali, Marathi, Kannada, English",
      "Colloquial symptom translation to clinical terminology",
      "Real-time acoustic emotion & acute distress detection",
      "Continuous push-to-talk with live visual feedback"
    ],
    metric: "98.4%",
    metricLabel: "Indic Medical Term Accuracy",
    clinicalImpact: "Empowers non-English literate and elderly rural patients to triage with dignity."
  },
  ocr: {
    id: "ocr",
    title: "Multimodal Document & Vision OCR",
    badge: "Domain 2 · Document AI",
    badgeColor: "bg-[#1D2A8F]/10 text-[#1D2A8F]",
    description:
      "Deep optical character recognition and clinical layout analysis specifically trained on messy doctor handwriting, regional pharmacy printouts, and lab panels.",
    features: [
      "Physical paper prescription digitization in seconds",
      "Drug dosage, frequency, and duration entity parsing",
      "Abnormal biomarker highlighting (HbA1c, Creatinine, ECG)",
      "Pharmacological purpose decoding ('What is this drug for?')"
    ],
    metric: "96.8%",
    metricLabel: "Handwriting Extraction Rate",
    clinicalImpact: "Prevents adverse drug-drug interactions by digitizing legacy physical records."
  },
  abdm: {
    id: "abdm",
    title: "ABDM & National Digital Health Stack",
    badge: "Domain 3 · Gov. Standard",
    badgeColor: "bg-emerald-100 text-emerald-800",
    description:
      "Native compliance with the Ayushman Bharat Digital Mission (NHA), DPDP Act 2023, and FHIR R4 standard for seamless health record interoperability.",
    features: [
      "ABHA ID 14-digit biometric & OTP validation",
      "Milestone M1, M2, M3 certified health repository",
      "Explicit, auditable patient consent management",
      "Interoperable longitudinal EHR record federation"
    ],
    metric: "100%",
    metricLabel: "ABDM / FHIR Compliance",
    clinicalImpact: "Guarantees nationwide portability of patient OPD consultations across any hospital."
  },
  voice_ocr: {
    id: "voice_ocr",
    title: "Voice + Document Cross-Validation",
    badge: "Intersection A+B · Safety Guardrails",
    badgeColor: "bg-purple-100 text-purple-800",
    description:
      "Cross-references what the patient reports verbally against their physical prescriptions to detect omitted medications or conflicting statements.",
    features: [
      "Verbal symptom verification against prescribed drugs",
      "Active medication compliance check",
      "Allergy alert cross-referencing",
      "Red-flag discrepancy detection"
    ],
    metric: "99.1%",
    metricLabel: "Safety Discrepancy Capture",
    clinicalImpact: "Catches critical dosage mismatches before the patient enters the consultation cabin."
  },
  ocr_abdm: {
    id: "ocr_abdm",
    title: "Automated PHR & Cloud Ingestion",
    badge: "Intersection B+C · Interoperability",
    badgeColor: "bg-blue-100 text-blue-800",
    description:
      "Transforms unstructured physical paper scans into standardized FHIR R4 resources deposited directly into the patient's Ayushman Bharat Health Locker.",
    features: [
      "Physical paper to digital FHIR Bundle transform",
      "SNOMED CT & ICD-10 diagnostic tagging",
      "Automatic timeline chronology reconstruction",
      "Encrypted cloud sync with consent ledger"
    ],
    metric: "< 1.2s",
    metricLabel: "FHIR Bundle Generation",
    clinicalImpact: "Eliminates lost paper files and builds a lifelong digital health history."
  },
  voice_abdm: {
    id: "voice_abdm",
    title: "Consent-Governed Dynamic Intake",
    badge: "Intersection A+C · Security & Privacy",
    badgeColor: "bg-amber-100 text-amber-800",
    description:
      "Governs voice recordings under DPDP Act 2023 with ephemeral in-memory processing, zero permanent audio storage without patient consent.",
    features: [
      "Ephemeral audio processing pipeline",
      "Encrypted voice tokens with auto-purging",
      "Voice-guided ABHA OTP authentication",
      "Strict data localization & privacy boundaries"
    ],
    metric: "DPDP 2023",
    metricLabel: "Privacy Act Compliant",
    clinicalImpact: "Builds unshakeable patient trust with secure, privacy-first biometric intake."
  }
};

export function ClinicalMultimodalVenn() {
  const [activeSectorId, setActiveSectorId] = useState<string>("core");
  const activeSector = VENN_SECTORS[activeSectorId] || VENN_SECTORS.core;

  return (
    <div className="rounded-[20px] border border-[#FDEBD0] bg-white p-6 sm:p-8 shadow-sm text-left">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#FDEBD0]/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-[6px] bg-[#1D2A8F]/10 text-[#1D2A8F]">
              <Layers className="h-3.5 w-3.5 text-[#FB923C]" />
            </span>
            <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#1D2A8F]">
              Interactive Multimodal Architecture
            </p>
          </div>
          <h3 className="font-heading text-xl sm:text-2xl font-bold text-[#374151] mt-1">
            Why MediKiosk is Uniquely Positioned
          </h3>
          <p className="text-xs sm:text-sm text-[#374151]/70 mt-1">
            Explore how Indic Voice AI, Optical Vision OCR, and the ABDM National Health Stack converge at the clinical core.
          </p>
        </div>

        {/* Quick Sector Selector Buttons */}
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setActiveSectorId("core")}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer",
              activeSectorId === "core"
                ? "bg-[#1D2A8F] text-white shadow-xs"
                : "bg-[#FDFBF7] text-[#374151]/80 hover:bg-[#FDEBD0] hover:text-[#1D2A8F] border border-[#FDEBD0]"
            )}
          >
            ★ Core Convergence
          </button>
          <button
            onClick={() => setActiveSectorId("indic")}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer",
              activeSectorId === "indic"
                ? "bg-[#FB923C] text-white shadow-xs"
                : "bg-[#FDFBF7] text-[#374151]/80 hover:bg-[#FDEBD0] hover:text-[#1D2A8F] border border-[#FDEBD0]"
            )}
          >
            Indic Voice
          </button>
          <button
            onClick={() => setActiveSectorId("ocr")}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer",
              activeSectorId === "ocr"
                ? "bg-[#1D2A8F] text-white shadow-xs"
                : "bg-[#FDFBF7] text-[#374151]/80 hover:bg-[#FDEBD0] hover:text-[#1D2A8F] border border-[#FDEBD0]"
            )}
          >
            Vision OCR
          </button>
          <button
            onClick={() => setActiveSectorId("abdm")}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer",
              activeSectorId === "abdm"
                ? "bg-emerald-600 text-white shadow-xs"
                : "bg-[#FDFBF7] text-[#374151]/80 hover:bg-[#FDEBD0] hover:text-[#1D2A8F] border border-[#FDEBD0]"
            )}
          >
            ABDM Stack
          </button>
        </div>
      </div>

      {/* Main Two-Column Diagram + Detail Inspector */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Interactive SVG Venn Diagram (6 cols) */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center relative">
          <div className="w-full max-w-[420px] aspect-square relative">
            <svg viewBox="0 0 400 400" className="w-full h-full drop-shadow-sm select-none">
              <defs>
                <radialGradient id="gradIndic" cx="35%" cy="35%" r="65%">
                  <stop offset="0%" stopColor="#FB923C" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#EA580C" stopOpacity="0.15" />
                </radialGradient>
                <radialGradient id="gradOcr" cx="65%" cy="35%" r="65%">
                  <stop offset="0%" stopColor="#1D2A8F" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#141E66" stopOpacity="0.15" />
                </radialGradient>
                <radialGradient id="gradAbdm" cx="50%" cy="75%" r="65%">
                  <stop offset="0%" stopColor="#10B981" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#047857" stopOpacity="0.15" />
                </radialGradient>
                <radialGradient id="gradCore" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#1D2A8F" stopOpacity="0.95" />
                  <stop offset="100%" stopColor="#141E66" stopOpacity="1" />
                </radialGradient>
              </defs>

              {/* Circle 1: Indic Voice (Top Left) */}
              <g
                className="cursor-pointer transition-all duration-200"
                onClick={() => setActiveSectorId("indic")}
              >
                <circle
                  cx="155"
                  cy="165"
                  r="115"
                  fill="url(#gradIndic)"
                  stroke="#FB923C"
                  strokeWidth={activeSectorId === "indic" ? "3.5" : "2"}
                  strokeDasharray={activeSectorId === "indic" ? "none" : "4 2"}
                  className="transition-all"
                />
                <text x="95" y="115" fontSize="13" fontWeight="800" fill="#C2410C" textAnchor="middle">
                  Indic Voice AI
                </text>
                <text x="95" y="132" fontSize="9.5" fontWeight="600" fill="#756F73" textAnchor="middle">
                  Bhashini / ASR
                </text>
              </g>

              {/* Circle 2: Document OCR (Top Right) */}
              <g
                className="cursor-pointer transition-all duration-200"
                onClick={() => setActiveSectorId("ocr")}
              >
                <circle
                  cx="245"
                  cy="165"
                  r="115"
                  fill="url(#gradOcr)"
                  stroke="#1D2A8F"
                  strokeWidth={activeSectorId === "ocr" ? "3.5" : "2"}
                  strokeDasharray={activeSectorId === "ocr" ? "none" : "4 2"}
                  className="transition-all"
                />
                <text x="305" y="115" fontSize="13" fontWeight="800" fill="#1D2A8F" textAnchor="middle">
                  Document Vision
                </text>
                <text x="305" y="132" fontSize="9.5" fontWeight="600" fill="#756F73" textAnchor="middle">
                  Prescription OCR
                </text>
              </g>

              {/* Circle 3: ABDM National Stack (Bottom Center) */}
              <g
                className="cursor-pointer transition-all duration-200"
                onClick={() => setActiveSectorId("abdm")}
              >
                <circle
                  cx="200"
                  cy="245"
                  r="115"
                  fill="url(#gradAbdm)"
                  stroke="#10B981"
                  strokeWidth={activeSectorId === "abdm" ? "3.5" : "2"}
                  strokeDasharray={activeSectorId === "abdm" ? "none" : "4 2"}
                  className="transition-all"
                />
                <text x="200" y="325" fontSize="13" fontWeight="800" fill="#047857" textAnchor="middle">
                  ABDM &amp; FHIR R4
                </text>
                <text x="200" y="342" fontSize="9.5" fontWeight="600" fill="#756F73" textAnchor="middle">
                  Consent / ABHA ID
                </text>
              </g>

              {/* Intersection 1: Voice + OCR (Top Center) */}
              <g
                className="cursor-pointer"
                onClick={() => setActiveSectorId("voice_ocr")}
              >
                <circle
                  cx="200"
                  cy="150"
                  r="26"
                  fill={activeSectorId === "voice_ocr" ? "#7E22CE" : "#A855F7"}
                  fillOpacity="0.4"
                  stroke="#7E22CE"
                  strokeWidth="1.5"
                />
                <text x="200" y="153" fontSize="8" fontWeight="800" fill="#581C87" textAnchor="middle">
                  Safety Cross
                </text>
              </g>

              {/* Intersection 2: OCR + ABDM (Right) */}
              <g
                className="cursor-pointer"
                onClick={() => setActiveSectorId("ocr_abdm")}
              >
                <circle
                  cx="235"
                  cy="215"
                  r="24"
                  fill={activeSectorId === "ocr_abdm" ? "#1D4ED8" : "#3B82F6"}
                  fillOpacity="0.4"
                  stroke="#1D4ED8"
                  strokeWidth="1.5"
                />
                <text x="235" y="218" fontSize="8" fontWeight="800" fill="#1E3A8A" textAnchor="middle">
                  FHIR Sync
                </text>
              </g>

              {/* Intersection 3: Voice + ABDM (Left) */}
              <g
                className="cursor-pointer"
                onClick={() => setActiveSectorId("voice_abdm")}
              >
                <circle
                  cx="165"
                  cy="215"
                  r="24"
                  fill={activeSectorId === "voice_abdm" ? "#D97706" : "#F59E0B"}
                  fillOpacity="0.4"
                  stroke="#D97706"
                  strokeWidth="1.5"
                />
                <text x="165" y="218" fontSize="8" fontWeight="800" fill="#78350F" textAnchor="middle">
                  DPDP Consent
                </text>
              </g>

              {/* Central Epicenter Core */}
              <g
                className="cursor-pointer transition-transform hover:scale-105"
                onClick={() => setActiveSectorId("core")}
              >
                <circle
                  cx="200"
                  cy="195"
                  r="34"
                  fill="url(#gradCore)"
                  stroke="#FDEBD0"
                  strokeWidth="2.5"
                  filter="drop-shadow(0 4px 6px rgba(29,42,143,0.3))"
                />
                <text x="200" y="192" fontSize="9.5" fontWeight="900" fill="#FFFFFF" textAnchor="middle">
                  MediKiosk
                </text>
                <text x="200" y="204" fontSize="7.5" fontWeight="700" fill="#FB923C" textAnchor="middle">
                  CORE
                </text>
              </g>
            </svg>
          </div>
          <p className="text-[11px] text-[#374151]/60 mt-2 text-center font-medium">
            💡 Click any sector or intersection above to view deep clinical architecture &amp; metrics.
          </p>
        </div>

        {/* Right Column: Dynamic Deep Telemetry Inspector (6 cols) */}
        <div className="lg:col-span-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSector.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="rounded-[16px] border border-[#FDEBD0] bg-[#FDFBF7] p-6 space-y-4"
            >
              {/* Badge & Title */}
              <div className="space-y-1.5 border-b border-[#FDEBD0] pb-3">
                <span className={cn("inline-block text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full", activeSector.badgeColor)}>
                  {activeSector.badge}
                </span>
                <h4 className="font-heading text-lg font-bold text-[#374151]">
                  {activeSector.title}
                </h4>
                <p className="text-xs text-[#374151]/80 leading-relaxed">
                  {activeSector.description}
                </p>
              </div>

              {/* Core Features List */}
              <div className="space-y-2">
                <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#1D2A8F]">
                  Architectural Capabilities:
                </p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#374151]">
                  {activeSector.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="leading-tight">{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Metric Callout Card */}
              <div className="rounded-[12px] bg-white border border-[#FDEBD0] p-4 flex items-center justify-between shadow-2xs">
                <div>
                  <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#374151]/60">
                    {activeSector.metricLabel}
                  </p>
                  <p className="text-xl sm:text-2xl font-black text-[#1D2A8F] mt-0.5">
                    {activeSector.metric}
                  </p>
                </div>
                <div className="max-w-[180px] text-right">
                  <span className="text-[10px] font-bold text-[#C2410C] block">Clinical Impact:</span>
                  <p className="text-[11px] text-[#374151]/80 leading-snug">
                    {activeSector.clinicalImpact}
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
