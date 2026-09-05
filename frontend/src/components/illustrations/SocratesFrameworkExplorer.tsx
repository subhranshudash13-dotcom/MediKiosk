"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  CheckCircle2,
  HelpCircle,
  Stethoscope,
  Sparkles,
  Languages,
  ArrowRight,
  ShieldCheck
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SocratesDimension {
  letter: string;
  name: string;
  question: string;
  clinicalPurpose: string;
  vernacularExample: {
    hindi: string;
    englishTranslation: string;
    extractedClinicalEntity: string;
    snomedCode: string;
  };
}

const SOCRATES_DIMENSIONS: SocratesDimension[] = [
  {
    letter: "S",
    name: "Site (Location)",
    question: "Where exactly is the pain or discomfort located?",
    clinicalPurpose: "Differentiates organ system etiology (retrosternal vs epigastric vs right hypochondrium).",
    vernacularExample: {
      hindi: "“दर्द छाती के बीचों-बीच भारीपन जैसा लग रहा है।”",
      englishTranslation: "The pain feels like heaviness right in the center of the chest.",
      extractedClinicalEntity: "Anatomical Site: Retrosternal Thoracic",
      snomedCode: "SNOMED-CT: 261179002"
    }
  },
  {
    letter: "O",
    name: "Onset",
    question: "When did the pain start, and was it sudden or gradual?",
    clinicalPurpose: "Sudden thunderclap indicates vascular catastrophe (aortic dissection/subarachnoid hemorrhage); gradual indicates inflammatory.",
    vernacularExample: {
      hindi: "“कल दोपहर से धीरे-धीरे शुरू हुआ था, अब बढ़ता जा रहा है।”",
      englishTranslation: "It started gradually yesterday afternoon, now progressively worsening.",
      extractedClinicalEntity: "Onset: Subacute / Progressive (24 hrs)",
      snomedCode: "SNOMED-CT: 282032007"
    }
  },
  {
    letter: "C",
    name: "Character",
    question: "What does the pain feel like? (Sharp, burning, squeezing, aching)",
    clinicalPurpose: "Crushing/tight = ischemic cardiac; Burning = esophageal/acid peptic; Sharp/pleuritic = pulmonary/pericardial.",
    vernacularExample: {
      hindi: "“ऐसा लग रहा है जैसे कोई छाती पर भारी पत्थर रखकर दबा रहा हो।”",
      englishTranslation: "It feels like someone placed a heavy boulder on my chest and is squeezing.",
      extractedClinicalEntity: "Character: Constricting / Crushing",
      snomedCode: "SNOMED-CT: 247348008"
    }
  },
  {
    letter: "R",
    name: "Radiation",
    question: "Does the pain travel anywhere else?",
    clinicalPurpose: "Left arm/jaw radiation increases likelihood of acute myocardial infarction by 4.2x.",
    vernacularExample: {
      hindi: "“दर्द बाएं कंधे और गर्दन की तरफ ऊपर चढ़ रहा है।”",
      englishTranslation: "The pain is shooting upwards into my left shoulder and neck.",
      extractedClinicalEntity: "Radiation: Left Arm & Mandibular",
      snomedCode: "SNOMED-CT: 247384004"
    }
  },
  {
    letter: "A",
    name: "Associations",
    question: "Are there any other accompanying symptoms?",
    clinicalPurpose: "Diaphoresis, nausea, dyspnea, palpitations indicate autonomic distress or systemic compromise.",
    vernacularExample: {
      hindi: "“पसीना बहुत छूट रहा है और उल्टी जैसा मन हो रहा है।”",
      englishTranslation: "I'm sweating profusely and feeling very nauseated.",
      extractedClinicalEntity: "Associated: Diaphoresis + Nausea",
      snomedCode: "SNOMED-CT: 415690000"
    }
  },
  {
    letter: "T",
    name: "Timing / Duration",
    question: "Is the pain constant, or does it come and go in waves?",
    clinicalPurpose: "Constant > 20 mins suggests acute injury; Colicky suggests hollow viscus obstruction (biliary/renal).",
    vernacularExample: {
      hindi: "“लगातार बना हुआ है, एक पल के लिए भी आराम नहीं मिल रहा।”",
      englishTranslation: "It is constant without a single moment of relief.",
      extractedClinicalEntity: "Pattern: Persistent / Continuous",
      snomedCode: "SNOMED-CT: 255227004"
    }
  },
  {
    letter: "E",
    name: "Exacerbating & Relieving",
    question: "Does anything make it better or worse?",
    clinicalPurpose: "Worse on exertion = Angina; Worse on inspiration = Pleurisy; Better sitting forward = Pericarditis.",
    vernacularExample: {
      hindi: "“चलने-फिरने से दर्द बढ़ता है, बैठने पर थोड़ा संभलता है।”",
      englishTranslation: "Walking worsens the pain; resting makes it slightly tolerable.",
      extractedClinicalEntity: "Exacerbating: Exertion | Relieving: Rest",
      snomedCode: "SNOMED-CT: 271594007"
    }
  },
  {
    letter: "S",
    name: "Severity Score (0-10)",
    question: "On a scale of 0 to 10, how intense is the pain right now?",
    clinicalPurpose: "Standardized Wong-Baker & VAS metric for triage ranking and analgesic requirement.",
    vernacularExample: {
      hindi: "“दर्द बहुत असहनीय है, कम से कम 8 या 9 नंबर का।”",
      englishTranslation: "The pain is unbearable, at least an 8 or 9 out of 10.",
      extractedClinicalEntity: "Severity: 8.5 / 10 (Severe / Acute)",
      snomedCode: "SNOMED-CT: 225908003"
    }
  }
];

export function SocratesFrameworkExplorer() {
  const [selectedIdx, setSelectedIdx] = useState<number>(0);
  const activeDim = SOCRATES_DIMENSIONS[selectedIdx];

  return (
    <div className="rounded-[20px] border border-[#FDEBD0] bg-white p-6 sm:p-8 shadow-sm text-left space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#FDEBD0]/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-[6px] bg-[#1D2A8F]/10 text-[#1D2A8F]">
              <Stethoscope className="h-3.5 w-3.5 text-[#FB923C]" />
            </span>
            <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#1D2A8F]">
              Gold-Standard Clinical History Intake
            </p>
          </div>
          <h3 className="font-heading text-xl sm:text-2xl font-bold text-[#374151] mt-1">
            The 8-Factor SOCRATES Diagnostic Framework
          </h3>
          <p className="text-xs sm:text-sm text-[#374151]/70 mt-1">
            How MediKiosk transforms colloquial spoken Indian phrases into structured clinical dimensions with SNOMED CT terminology.
          </p>
        </div>

        {/* 8-Letter Interactive Strip */}
        <div className="flex flex-wrap gap-1 bg-[#FDFBF7] p-1 rounded-full border border-[#FDEBD0]">
          {SOCRATES_DIMENSIONS.map((dim, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedIdx(idx)}
              className={cn(
                "w-7 h-7 rounded-full text-xs font-black transition-all cursor-pointer flex items-center justify-center",
                selectedIdx === idx
                  ? "bg-[#1D2A8F] text-white shadow-xs"
                  : "text-[#374151]/70 hover:bg-white hover:text-[#1D2A8F]"
              )}
            >
              {dim.letter}
            </button>
          ))}
        </div>
      </div>

      {/* Main Dimension Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left: 8 Dimensions Vertical Tabs (5 cols) */}
        <div className="lg:col-span-5 space-y-2">
          {SOCRATES_DIMENSIONS.map((dim, idx) => {
            const isSelected = selectedIdx === idx;
            return (
              <button
                key={idx}
                onClick={() => setSelectedIdx(idx)}
                className={cn(
                  "w-full text-left p-3 rounded-[12px] border transition-all cursor-pointer flex items-center gap-3",
                  isSelected
                    ? "border-[#1D2A8F] bg-[#1D2A8F]/5 ring-1 ring-[#1D2A8F]"
                    : "border-[#FDEBD0] bg-[#FDFBF7] hover:bg-white"
                )}
              >
                <span
                  className={cn(
                    "w-6 h-6 rounded-full text-xs font-black flex items-center justify-center shrink-0",
                    isSelected ? "bg-[#1D2A8F] text-white" : "bg-white border border-[#FDEBD0] text-[#1D2A8F]"
                  )}
                >
                  {dim.letter}
                </span>
                <div className="truncate">
                  <p className="text-xs font-bold text-[#374151] truncate">{dim.name}</p>
                  <p className="text-[10px] text-[#374151]/60 truncate">{dim.question}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right: Active Dimension Deep Dive Card (7 cols) */}
        <div className="lg:col-span-7">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeDim.letter + activeDim.name}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="rounded-[16px] border border-[#FDEBD0] bg-[#FDFBF7] p-6 space-y-5 h-full flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-[#FDEBD0] pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-full bg-[#1D2A8F] text-white text-xs font-black flex items-center justify-center">
                      {activeDim.letter}
                    </span>
                    <h4 className="font-heading text-base font-bold text-[#374151]">
                      {activeDim.name}
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-[#FB923C]/20 text-[#C2410C] px-2.5 py-0.5 rounded-full">
                    Clinical Standard
                  </span>
                </div>

                <p className="text-xs text-[#374151]/80 leading-relaxed">
                  <strong className="text-[#1D2A8F]">Clinical Rationale:</strong> {activeDim.clinicalPurpose}
                </p>
              </div>

              {/* Conversational Transformation Callout */}
              <div className="rounded-[12px] bg-white border border-[#FDEBD0] p-4 space-y-3 shadow-2xs">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#FB923C] block">
                    Vernacular Spoken Patient Turn:
                  </span>
                  <p className="text-xs font-semibold text-[#374151] italic mt-0.5">
                    {activeDim.vernacularExample.hindi}
                  </p>
                  <p className="text-[11px] text-[#374151]/70 mt-0.5">
                    “{activeDim.vernacularExample.englishTranslation}”
                  </p>
                </div>

                <div className="border-t border-[#FDEBD0]/80 pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-700 block">
                      Synthesized Clinical Entity:
                    </span>
                    <p className="text-xs font-bold text-[#1D2A8F] mt-0.5">
                      {activeDim.vernacularExample.extractedClinicalEntity}
                    </p>
                  </div>
                  <span className="text-[9px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full self-start sm:self-center">
                    {activeDim.vernacularExample.snomedCode}
                  </span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
