"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  HeartPulse,
  Activity,
  ShieldAlert,
  Flame,
  Clock,
  Stethoscope,
  ChevronRight,
  Sparkles,
  CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TriageLevelData {
  level: number;
  label: string;
  category: "IMMEDIATE" | "VERY URGENT" | "URGENT" | "STANDARD" | "NON-URGENT";
  colorBadge: string;
  borderColor: string;
  bgLight: string;
  targetPhysicianTime: string;
  physiologicalCriteria: string[];
  simulatedCase: {
    vernacularQuote: string;
    clinicalTranslation: string;
    vitals: string;
    routedDepartment: string;
  };
}

const TRIAGE_MATRIX_DATA: TriageLevelData[] = [
  {
    level: 1,
    label: "Level 1: Resuscitation (Immediate)",
    category: "IMMEDIATE",
    colorBadge: "bg-[#C2410C] text-white",
    borderColor: "border-[#C2410C]",
    bgLight: "bg-red-50/50",
    targetPhysicianTime: "0 Mins (Immediate Stat)",
    physiologicalCriteria: [
      "Cardiac / Respiratory Arrest or Impending Failure",
      "Severe Stridor / Upper Airway Obstruction",
      "Unresponsive / GCS < 9",
      "Profound Shock (Systolic BP < 80 mmHg, SpO2 < 85%)"
    ],
    simulatedCase: {
      vernacularQuote: "“सांस बिल्कुल नहीं आ रही, छाती फटने जैसी लग रही है और बेहोश हो रहे हैं।”",
      clinicalTranslation: "Severe crushing retrosternal pain with acute diaphoresis & impending syncope.",
      vitals: "BP: 78/50 | HR: 134 bpm | SpO2: 84% | Pain: 10/10",
      routedDepartment: "Red Trauma & Resuscitation Bay (Stat ECG + Defib Ready)"
    }
  },
  {
    level: 2,
    label: "Level 2: Emergent (Very Urgent)",
    category: "VERY URGENT",
    colorBadge: "bg-[#FB923C] text-white",
    borderColor: "border-[#FB923C]",
    bgLight: "bg-orange-50/50",
    targetPhysicianTime: "< 10 Mins",
    physiologicalCriteria: [
      "High risk of rapid clinical deterioration",
      "Acute chest pain suspicious of Acute Coronary Syndrome",
      "Altered mental status / Acute Neurological Deficit",
      "Severe acute pain score >= 8/10"
    ],
    simulatedCase: {
      vernacularQuote: "“छाती में भारीपन है और दर्द बाएं हाथ तक जा रहा है, पसीना भी आ रहा है।”",
      clinicalTranslation: "Typical radiating angina pectoris with vegetative autonomic symptoms.",
      vitals: "BP: 154/98 | HR: 98 bpm | SpO2: 95% | Pain: 8/10",
      routedDepartment: "Emergency Dept · Cardiology Fast-Track #02"
    }
  },
  {
    level: 3,
    label: "Level 3: Urgent (Acute Care)",
    category: "URGENT",
    colorBadge: "bg-amber-500 text-white",
    borderColor: "border-amber-300",
    bgLight: "bg-amber-50/40",
    targetPhysicianTime: "< 30 Mins",
    physiologicalCriteria: [
      "Requires multiple diagnostic resources (Labs + X-ray + IV fluids)",
      "High fever with persistent rigors (Suspected Dengue / Malaria)",
      "Severe abdominal pain with vomiting (Acute Appendicitis / Cholecystitis)",
      "Moderate respiratory distress (SpO2 91-94%)"
    ],
    simulatedCase: {
      vernacularQuote: "“3 दिन से बहुत तेज बुखार है, कंपकंपी छूट रही है और पूरे शरीर में दर्द है।”",
      clinicalTranslation: "High-grade fever with rigors, retro-orbital headache and thrombocytopenic risk.",
      vitals: "BP: 118/74 | HR: 104 bpm | Temp: 103.2°F | SpO2: 96%",
      routedDepartment: "Acute Fever Clinic & Stat CBC / NS1 Panel Room #05"
    }
  },
  {
    level: 4,
    label: "Level 4: Standard (Less Urgent)",
    category: "STANDARD",
    colorBadge: "bg-[#1D2A8F] text-white",
    borderColor: "border-[#1D2A8F]/40",
    bgLight: "bg-[#1D2A8F]/5",
    targetPhysicianTime: "< 60 Mins",
    physiologicalCriteria: [
      "Requires single simple resource (X-ray or simple prescription)",
      "Mild uncomplicated urinary tract symptoms",
      "Minor laceration or localized soft tissue trauma",
      "Stable chronic hypertension / diabetes follow-up"
    ],
    simulatedCase: {
      vernacularQuote: "“पैर फिसल गया था तो घुटने में हल्की सूजन और दर्द है।”",
      clinicalTranslation: "Isolated localized knee contusion without neurovascular compromise.",
      vitals: "BP: 124/80 | HR: 76 bpm | SpO2: 99% | Pain: 4/10",
      routedDepartment: "Orthopedic OPD & Plain Radiography Unit"
    }
  },
  {
    level: 5,
    label: "Level 5: Non-Urgent (Routine)",
    category: "NON-URGENT",
    colorBadge: "bg-emerald-600 text-white",
    borderColor: "border-emerald-300",
    bgLight: "bg-emerald-50/40",
    targetPhysicianTime: "< 120 Mins",
    physiologicalCriteria: [
      "Requires zero emergency resources",
      "Prescription refill / Medication renewal",
      "Suture removal / Routine wound dressing",
      "Minor rash / Chronic stable dermatitis"
    ],
    simulatedCase: {
      vernacularQuote: "“मेरी बीपी और शुगर की दवाइयां खत्म हो गई हैं, नया पर्चा चाहिए।”",
      clinicalTranslation: "Routine chronic medication refill and baseline metabolic check.",
      vitals: "BP: 128/82 | HR: 72 bpm | SpO2: 99% | Pain: 0/10",
      routedDepartment: "General Medicine OPD & Pharmacy Counter"
    }
  }
];

export function EmergencyTriageMatrix() {
  const [selectedLevel, setSelectedLevel] = useState<number>(2);
  const activeData = TRIAGE_MATRIX_DATA.find((d) => d.level === selectedLevel) || TRIAGE_MATRIX_DATA[1];

  return (
    <div className="rounded-[20px] border border-[#FDEBD0] bg-white p-6 sm:p-8 shadow-sm text-left space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#FDEBD0]/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-[6px] bg-[#1D2A8F]/10 text-[#1D2A8F]">
              <HeartPulse className="h-3.5 w-3.5 text-[#FB923C]" />
            </span>
            <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#1D2A8F]">
              Clinical Safety &amp; Risk Stratification
            </p>
          </div>
          <h3 className="font-heading text-xl sm:text-2xl font-bold text-[#374151] mt-1">
            Manchester &amp; ESI Triage Intelligence Matrix
          </h3>
          <p className="text-xs sm:text-sm text-[#374151]/70 mt-1">
            How MediKiosk analyzes real-time vernacular complaints against physiological emergency triggers to prevent triage delays.
          </p>
        </div>

        {/* Level Quick Buttons */}
        <div className="flex flex-wrap gap-1.5">
          {TRIAGE_MATRIX_DATA.map((d) => (
            <button
              key={d.level}
              onClick={() => setSelectedLevel(d.level)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer",
                selectedLevel === d.level
                  ? d.colorBadge + " shadow-xs"
                  : "bg-[#FDFBF7] text-[#374151]/80 hover:bg-[#FDEBD0] hover:text-[#1D2A8F] border border-[#FDEBD0]"
              )}
            >
              L{d.level}: {d.category}
            </button>
          ))}
        </div>
      </div>

      {/* Main Interactive Matrix Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left: 5 Triage Levels Navigation Rails (5 cols) */}
        <div className="lg:col-span-5 space-y-2.5">
          {TRIAGE_MATRIX_DATA.map((d) => {
            const isSelected = d.level === selectedLevel;
            return (
              <button
                key={d.level}
                onClick={() => setSelectedLevel(d.level)}
                className={cn(
                  "w-full text-left p-3.5 rounded-[14px] border transition-all cursor-pointer flex items-center justify-between group",
                  isSelected
                    ? `${d.borderColor} ${d.bgLight} ring-2 ring-offset-1 ring-[#1D2A8F]`
                    : "border-[#FDEBD0] bg-[#FDFBF7] hover:bg-white hover:border-[#1D2A8F]/40"
                )}
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className={cn("text-[9px] font-bold px-2 py-0.5 rounded-full uppercase", d.colorBadge)}>
                      ESI Level {d.level}
                    </span>
                    <span className="text-xs font-bold text-[#374151]">
                      {d.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#374151]/70">
                    Max Physician Response: <strong>{d.targetPhysicianTime}</strong>
                  </p>
                </div>
                <ChevronRight
                  className={cn(
                    "w-4 h-4 text-[#374151]/40 transition-transform group-hover:translate-x-0.5",
                    isSelected && "text-[#1D2A8F] translate-x-0.5"
                  )}
                />
              </button>
            );
          })}
        </div>

        {/* Right: Active Level Deep Clinical Case Simulation (7 cols) */}
        <div className="lg:col-span-7">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeData.level}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className={cn("rounded-[16px] border p-6 space-y-5 h-full flex flex-col justify-between", activeData.borderColor, activeData.bgLight)}
            >
              {/* Level Header */}
              <div className="space-y-2 border-b border-[#FDEBD0] pb-4">
                <div className="flex items-center justify-between">
                  <span className={cn("text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider", activeData.colorBadge)}>
                    {activeData.label}
                  </span>
                  <span className="text-xs font-mono font-bold text-[#374151] flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#FB923C]" />
                    {activeData.targetPhysicianTime}
                  </span>
                </div>
                <p className="text-xs text-[#374151]/80 leading-relaxed pt-1">
                  <strong>Clinical Criteria:</strong>
                </p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-[#374151]">
                  {activeData.physiologicalCriteria.map((c, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#1D2A8F] shrink-0 mt-1.5" />
                      <span className="leading-tight">{c}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Simulated Vernacular Case Card */}
              <div className="rounded-[12px] bg-white border border-[#FDEBD0] p-4 space-y-3 shadow-2xs">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#1D2A8F] block">
                    Simulated Patient Vernacular Spoken Turn:
                  </span>
                  <p className="text-xs font-serif font-semibold text-[#374151] italic mt-0.5">
                    {activeData.simulatedCase.vernacularQuote}
                  </p>
                </div>

                <div className="border-t border-[#FDEBD0]/80 pt-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#FB923C] block">
                    AI Clinical Synthesis &amp; Vitals:
                  </span>
                  <p className="text-xs font-medium text-[#374151] mt-0.5">
                    {activeData.simulatedCase.clinicalTranslation}
                  </p>
                  <p className="text-[11px] font-mono text-[#1D2A8F] font-bold mt-1">
                    {activeData.simulatedCase.vitals}
                  </p>
                </div>

                <div className="rounded-[8px] bg-[#FDFBF7] p-2.5 border border-[#FDEBD0] flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#374151]/70">Automated Dispatch Ward:</span>
                  <span className="text-xs font-bold text-[#1D2A8F]">
                    {activeData.simulatedCase.routedDepartment}
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
