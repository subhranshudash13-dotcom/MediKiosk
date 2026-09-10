"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Clock,
  Flame,
  ArrowUpRight,
  AlertTriangle,
  Timer,
  Sliders,
  Gauge,
  Sparkles,
  CheckCircle2,
  Volume2
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SocratesDimension {
  letter: string;
  factor: string;
  name: string;
  question: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  lightBg: string;
  borderColor: string;
  clinicalPurpose: string;
  differentialDiagnosis: string;
  vernacularExample: {
    hindi: string;
    englishTranslation: string;
    extractedClinicalEntity: string;
    snomedCode: string;
  };
}

const SOCRATES_DATA: SocratesDimension[] = [
  {
    letter: "S",
    factor: "Site",
    name: "Site (Location)",
    question: "Where exactly is the pain or discomfort located?",
    icon: MapPin,
    color: "#0056B3",
    lightBg: "#EBF3FC",
    borderColor: "#0056B3",
    clinicalPurpose: "Pinpoints anatomical origin to differentiate retrosternal cardiac, epigastric GI, or musculoskeletal etiologies.",
    differentialDiagnosis: "Retrosternal vs Epigastric vs Right Hypochondrium",
    vernacularExample: {
      hindi: "“दर्द छाती के बीचों-बीच भारीपन जैसा लग रहा है।”",
      englishTranslation: "The pain feels like heaviness right in the center of the chest.",
      extractedClinicalEntity: "Anatomical Site: Retrosternal Thoracic",
      snomedCode: "SNOMED-CT: 261179002"
    }
  },
  {
    letter: "O",
    factor: "Onset",
    name: "Onset & Velocity",
    question: "When did the pain start, and was it sudden or gradual?",
    icon: Clock,
    color: "#EA580C",
    lightBg: "#FFF0EB",
    borderColor: "#EA580C",
    clinicalPurpose: "Sudden onset indicates acute vascular rupture or ischemia; gradual onset suggests progressive inflammation.",
    differentialDiagnosis: "Thunderclap Acute vs Subacute Progressive (24h)",
    vernacularExample: {
      hindi: "“कल दोपहर से धीरे-धीरे शुरू हुआ था, अब बढ़ता जा रहा है।”",
      englishTranslation: "It started gradually yesterday afternoon, now progressively worsening.",
      extractedClinicalEntity: "Onset: Subacute / Progressive (24 hrs)",
      snomedCode: "SNOMED-CT: 282032007"
    }
  },
  {
    letter: "C",
    factor: "Character",
    name: "Character & Quality",
    question: "What does the pain feel like? (Crushing, burning, sharp, colicky)",
    icon: Flame,
    color: "#D97706",
    lightBg: "#FEF3C7",
    borderColor: "#D97706",
    clinicalPurpose: "Constricting/crushing = ischemic cardiac; burning = acid reflux/GERD; tearing = aortic dissection.",
    differentialDiagnosis: "Ischemic Constriction vs Neuropathic vs Pleuritic",
    vernacularExample: {
      hindi: "“ऐसा लग रहा है जैसे कोई छाती पर भारी पत्थर रखकर दबा रहा हो।”",
      englishTranslation: "It feels like someone placed a heavy boulder on my chest and is squeezing.",
      extractedClinicalEntity: "Character: Constricting / Crushing (Visceral)",
      snomedCode: "SNOMED-CT: 247348008"
    }
  },
  {
    letter: "R",
    factor: "Radiation",
    name: "Radiation Pathway",
    question: "Does the pain travel or radiate anywhere else?",
    icon: ArrowUpRight,
    color: "#7C3AED",
    lightBg: "#F5F3FF",
    borderColor: "#7C3AED",
    clinicalPurpose: "Radiation to left arm, neck, or mandibular jaw increases acute myocardial infarction likelihood by 4.2x.",
    differentialDiagnosis: "Left Brachial / Mandibular Dermatome Track",
    vernacularExample: {
      hindi: "“दर्द बाएं कंधे और गर्दन की तरफ ऊपर चढ़ रहा है।”",
      englishTranslation: "The pain is shooting upwards into my left shoulder and neck.",
      extractedClinicalEntity: "Radiation: Left Arm & Mandibular Dermatome",
      snomedCode: "SNOMED-CT: 247384004"
    }
  },
  {
    letter: "A",
    factor: "Associated",
    name: "Associated Symptoms",
    question: "Are there any other accompanying symptoms?",
    icon: AlertTriangle,
    color: "#DC3545",
    lightBg: "#FCEBEC",
    borderColor: "#DC3545",
    clinicalPurpose: "Diaphoresis, dyspnea, nausea, or presyncope indicate sympathetic autonomic storm and hemodynamic distress.",
    differentialDiagnosis: "Autonomic Shock & Hemodynamic Compromise",
    vernacularExample: {
      hindi: "“पसीना बहुत छूट रहा है और उल्टी जैसा मन हो रहा है।”",
      englishTranslation: "I'm sweating profusely and feeling very nauseated with shortness of breath.",
      extractedClinicalEntity: "Associated: Diaphoresis + Nausea + Dyspnea",
      snomedCode: "SNOMED-CT: 415690000"
    }
  },
  {
    letter: "T",
    factor: "Timing",
    name: "Timing & Pattern",
    question: "Is the pain constant, or does it come and go in waves?",
    icon: Timer,
    color: "#0891B2",
    lightBg: "#ECFEFF",
    borderColor: "#0891B2",
    clinicalPurpose: "Continuous pain > 20 mins indicates ongoing tissue ischemia; colicky waxes/wanes suggest hollow viscus obstruction.",
    differentialDiagnosis: "Persistent Ischemic Wave vs Biliary/Renal Colic",
    vernacularExample: {
      hindi: "“लगातार बना हुआ है, एक पल के लिए भी आराम नहीं मिल रहा।”",
      englishTranslation: "It is constant without a single moment of relief for over 45 minutes.",
      extractedClinicalEntity: "Pattern: Persistent / Continuous (> 45 min)",
      snomedCode: "SNOMED-CT: 255227004"
    }
  },
  {
    letter: "E",
    factor: "Exacerbating",
    name: "Exacerbating & Relieving",
    question: "Does physical exertion, posture, or breathing change the pain?",
    icon: Sliders,
    color: "#4F46E5",
    lightBg: "#EEF2FF",
    borderColor: "#4F46E5",
    clinicalPurpose: "Worse on exertion = Angina pectoris; Worse on inspiration = Pleurisy; Better leaning forward = Pericarditis.",
    differentialDiagnosis: "Effort-Induced Angina vs Postural Pericarditis",
    vernacularExample: {
      hindi: "“चलने-फिरने से दर्द बढ़ता है, बैठने पर थोड़ा संभलता है।”",
      englishTranslation: "Walking worsens the pain; resting makes it slightly tolerable.",
      extractedClinicalEntity: "Exacerbating: Exertion | Relieving: Rest / Sublingual",
      snomedCode: "SNOMED-CT: 271594007"
    }
  },
  {
    letter: "S",
    factor: "Severity",
    name: "Severity Score (0-10)",
    question: "On a scale of 0 to 10, how intense is the pain right now?",
    icon: Gauge,
    color: "#16A34A",
    lightBg: "#F0FDF4",
    borderColor: "#16A34A",
    clinicalPurpose: "Quantified Wong-Baker & Visual Analog Scale (VAS) for triage stratification and rapid analgesic prioritization.",
    differentialDiagnosis: "VAS Scale 9/10 (Emergency Resuscitation Track)",
    vernacularExample: {
      hindi: "“दर्द बहुत असहनीय है, कम से कम 8 या 9 नंबर का।”",
      englishTranslation: "The pain is unbearable, at least an 8 or 9 out of 10.",
      extractedClinicalEntity: "Severity: 9.0 / 10 (Critical / Severe Acute Pain)",
      snomedCode: "SNOMED-CT: 225908003"
    }
  }
];

export function SocratesFrameworkExplorer() {
  const [activeIdx, setActiveIdx] = useState<number>(0);
  const activeDim = SOCRATES_DATA[activeIdx];
  const ActiveIcon = activeDim.icon;

  return (
    <div className="w-full text-left space-y-6 select-none py-2">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#DEE2E6] pb-4">
        <div>
          <h3 className="font-heading text-xl sm:text-2xl font-bold text-[#2C3E50]">
            The 8-Factor SOCRATES Diagnostic Framework
          </h3>
          <p className="text-xs sm:text-sm text-[#6C7A89] mt-1">
            How MediKiosk transforms colloquial spoken Indian phrases into structured clinical dimensions with SNOMED CT terminology.
          </p>
        </div>

        <div className="flex items-center text-xs font-mono font-bold text-[#6C7A89]">
          <span className="px-3 py-1 rounded-full bg-white border border-[#DEE2E6] text-[#0056B3] shadow-xs">
            Factor {activeIdx + 1} of 8
          </span>
        </div>
      </div>

      {/* Horizontal 8-Pill Acronym Ribbon Bar */}
      <div className="space-y-5">
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
          {SOCRATES_DATA.map((dim, idx) => {
            const isActive = activeIdx === idx;
            const Icon = dim.icon;
            return (
              <button
                key={idx}
                onClick={() => setActiveIdx(idx)}
                className={cn(
                  "p-2.5 rounded-xl border transition-all duration-200 text-left flex flex-col justify-between cursor-pointer group",
                  isActive
                    ? "bg-white border-[#0056B3] ring-2 ring-[#0056B3]/15 shadow-sm"
                    : "bg-white border-[#DEE2E6] hover:border-[#0056B3]/60 hover:bg-[#F8F9FA]"
                )}
              >
                <div className="flex items-center justify-between w-full">
                  <span
                    className={cn(
                      "w-6 h-6 rounded-lg text-xs font-mono font-bold flex items-center justify-center transition-colors",
                      isActive ? "bg-[#0056B3] text-white" : "bg-[#F8F9FA] text-[#2C3E50] group-hover:bg-[#EBF3FC] group-hover:text-[#0056B3]"
                    )}
                  >
                    {dim.letter}
                  </span>
                  <Icon
                    className={cn(
                      "w-3.5 h-3.5 transition-colors",
                      isActive ? "text-[#0056B3]" : "text-[#6C7A89] group-hover:text-[#0056B3]"
                    )}
                  />
                </div>
                <div className="mt-2 truncate">
                  <span className="text-[11px] font-bold text-[#2C3E50] block truncate">
                    {dim.factor}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Interactive Transformation Stage Box */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeDim.letter + activeDim.name}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="p-6 sm:p-7 rounded-2xl bg-white border border-[#DEE2E6] shadow-card space-y-6"
          >
            {/* Factor Title Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#DEE2E6] pb-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: activeDim.lightBg, color: activeDim.color }}
                >
                  <ActiveIcon className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className="text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full"
                      style={{ backgroundColor: activeDim.lightBg, color: activeDim.color }}
                    >
                      Factor {activeIdx + 1} of 8 · SOCRATES
                    </span>
                    <span className="text-xs font-mono text-[#6C7A89] font-semibold">
                      {activeDim.differentialDiagnosis}
                    </span>
                  </div>
                  <h4 className="font-heading text-xl font-bold text-[#2C3E50] mt-0.5">
                    {activeDim.name}
                  </h4>
                </div>
              </div>

              <div className="text-xs text-[#5A6B7C] italic sm:text-right max-w-sm">
                &ldquo;{activeDim.question}&rdquo;
              </div>
            </div>

            {/* Conversational Transformation: Before (Speech) → AI Pipeline → After (Clinical EMR) */}
            <div className="grid grid-cols-1 lg:grid-cols-11 gap-4 items-center">
              
              {/* Left: Patient Vernacular Speech Input (5 cols) */}
              <div className="lg:col-span-5 p-4 rounded-xl bg-[#FFFBF7] border border-[#FDE6D2] space-y-2 text-left">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#EA580C] flex items-center gap-1.5">
                    <Volume2 className="w-3.5 h-3.5 text-[#EA580C]" /> Patient Vernacular Input (Hindi / Dialect)
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#EA580C]/10 text-[#EA580C]">
                    Spoken Audio
                  </span>
                </div>
                <p className="text-sm font-semibold text-[#2C3E50] leading-snug">
                  {activeDim.vernacularExample.hindi}
                </p>
                <p className="text-xs text-[#6C7A89] italic">
                  &ldquo;{activeDim.vernacularExample.englishTranslation}&rdquo;
                </p>
              </div>

              {/* Middle: AI Extraction Flow Arrow (1 col) */}
              <div className="lg:col-span-1 flex flex-col items-center justify-center py-2 lg:py-0">
                <div className="w-8 h-8 rounded-full bg-[#EBF3FC] text-[#0056B3] flex items-center justify-center shadow-xs">
                  <Sparkles className="w-4 h-4 text-[#0056B3] animate-pulse" />
                </div>
                <span className="text-[9px] font-mono font-bold text-[#0056B3] mt-1 hidden lg:block">
                  NLU
                </span>
              </div>

              {/* Right: Synthesized Clinical Entity & SNOMED CT Mapping (5 cols) */}
              <div className="lg:col-span-5 p-4 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0] space-y-2 text-left">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#16A34A] flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" /> Synthesized Clinical EMR Record
                  </span>
                  <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-md bg-white border border-[#BBF7D0] text-[#16A34A]">
                    {activeDim.vernacularExample.snomedCode}
                  </span>
                </div>
                <p className="text-sm font-extrabold text-[#0056B3]">
                  {activeDim.vernacularExample.extractedClinicalEntity}
                </p>
                <p className="text-xs text-[#5A6B7C]">
                  <strong className="text-[#2C3E50]">Clinical Purpose:</strong> {activeDim.clinicalPurpose}
                </p>
              </div>

            </div>

            {/* Step Navigation Controls */}
            <div className="pt-2 flex items-center justify-between border-t border-[#DEE2E6]">
              <button
                onClick={() => setActiveIdx((prev) => (prev > 0 ? prev - 1 : SOCRATES_DATA.length - 1))}
                className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-[#6C7A89] hover:bg-[#F8F9FA] hover:text-[#2C3E50] border border-[#DEE2E6] transition-colors cursor-pointer"
              >
                &larr; Previous Factor
              </button>

              <span className="text-xs font-mono font-bold text-[#6C7A89]">
                {activeIdx + 1} of {SOCRATES_DATA.length} Dimensions
              </span>

              <button
                onClick={() => setActiveIdx((prev) => (prev < SOCRATES_DATA.length - 1 ? prev + 1 : 0))}
                className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-[#0056B3] hover:bg-[#004494] transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                Next Factor &rarr;
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
