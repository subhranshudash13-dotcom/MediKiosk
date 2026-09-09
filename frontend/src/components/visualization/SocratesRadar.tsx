"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  Activity,
  ShieldCheck,
  Sparkles,
  MapPin,
  Clock,
  Flame,
  GitCommit,
  Layers,
  Calendar,
  Sliders,
  ChevronDown,
  ChevronUp,
  Info,
  Edit3,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface SocratesData {
  site?: string | null;
  onset?: string | null;
  character?: string | null;
  radiation?: string | null;
  associations?: string[] | null;
  timing?: string | null;
  exacerbating_relieving?: string | null;
  severity_score?: number | null;
}

interface SocratesRadarProps {
  socrates?: SocratesData | null;
  className?: string;
  onUpdateField?: (key: keyof SocratesData, value: any) => void;
}

interface SocratesAxisDefinition {
  key: keyof SocratesData;
  letter: string;
  name: string;
  clinicalTerm: string;
  subtitle: string;
  clinicalPurpose: string;
  differentialRelevance: string;
  icon: any;
  quickOptions: string[];
}

const SOCRATES_DEFINITIONS: SocratesAxisDefinition[] = [
  {
    key: "site",
    letter: "S",
    name: "Site & Anatomical Focus",
    clinicalTerm: "Topographical Localization",
    subtitle: "Exact bodily origin & depth",
    clinicalPurpose: "Pinpoints the primary anatomical organ system, lateralization (unilateral vs bilateral), and depth (superficial parietal vs deep visceral).",
    differentialRelevance: "Differentiates retrosternal cardiac ischemia from epigastric gastroesophageal reflux, costochondritis, or pleural friction.",
    icon: MapPin,
    quickOptions: [
      "Sub-sternal / Retro-sternal",
      "Left Precordial Chest",
      "Epigastric Upper Abdomen",
      "Right Lower Quadrant (Iliac Fossa)",
      "Lumbar Spine & Flank",
      "Frontal / Temporal Cranium",
      "Cervical / Neck & Shoulder",
      "Generalized / Diffuse"
    ]
  },
  {
    key: "onset",
    letter: "O",
    name: "Onset & Progression Course",
    clinicalTerm: "Acuity & Temporal Evolution",
    subtitle: "Speed of onset & progression",
    clinicalPurpose: "Evaluates whether symptom development was hyper-acute (seconds/minutes), subacute (hours/days), or insidious (weeks/months), plus identifying precipitating triggers.",
    differentialRelevance: "Sudden tearing or crushing pain suggests vascular or ischemic catastrophe (Aortic dissection, STEMI), whereas gradual onset favors progressive inflammation or infection.",
    icon: Clock,
    quickOptions: [
      "Hyper-acute (Under 30 mins)",
      "Acute Onset (2 to 4 hours ago)",
      "2 to 3 Days Duration",
      "Subacute (1 to 2 weeks)",
      "Chronic / Recurring Episodes",
      "Triggered post-physical exertion",
      "Post-traumatic onset"
    ]
  },
  {
    key: "character",
    letter: "C",
    name: "Character & Sensory Quality",
    clinicalTerm: "Nociceptive vs Visceral Quality",
    subtitle: "Qualitative descriptive nature",
    clinicalPurpose: "Captures the qualitative sensation experienced by the patient (crushing, stabbing, burning, throbbing, colicky, ache).",
    differentialRelevance: "Crushing/constricting sensation points toward ischemic myocardium; sharp pleuritic pain aggravated by inspiration indicates serosal inflammation.",
    icon: Flame,
    quickOptions: [
      "Constricting / Heavy Pressure",
      "Sharp / Stabbing / Pleuritic",
      "Burning / Acidic Sensation",
      "Dull Throbbing Ache",
      "Colicky / Cramping Spasms",
      "Tearing / Ripping Pain",
      "Tingling / Neuropathic Pins"
    ]
  },
  {
    key: "radiation",
    letter: "R",
    name: "Radiation & Nerve Pathways",
    clinicalTerm: "Dermatomal & Referred Spread",
    subtitle: "Direction of referred pain",
    clinicalPurpose: "Identifies whether pain travels along known dermatomal sensory roots or autonomic referred pathways.",
    differentialRelevance: "Radiation to left arm, neck, or lower jaw strongly indicates myocardial ischemia; radiation through to interscapular back suggests aortic or pancreatic pathology.",
    icon: GitCommit,
    quickOptions: [
      "Radiates to Left Arm & Shoulder",
      "Extends to Neck & Mandible (Jaw)",
      "Radiates to Mid-Back (Interscapular)",
      "Radiates downward to Groin / Flank",
      "Band-like Circumferential Spread",
      "Localized / No Radiation"
    ]
  },
  {
    key: "associations",
    letter: "A",
    name: "Associated Secondary Signs",
    clinicalTerm: "Systemic Autonomic Correlates",
    subtitle: "Concomitant organ responses",
    clinicalPurpose: "Documents autonomic neurovegetative signs, hemodynamic instability indicators, or accompanying organ dysfunction.",
    differentialRelevance: "Concurrent diaphoresis (cold sweats), dyspnea, and presyncope signal acute cardiopulmonary compromise requiring immediate emergency triage.",
    icon: Layers,
    quickOptions: [
      "Shortness of Breath (Dyspnea)",
      "Profuse Cold Sweats (Diaphoresis)",
      "Palpitations / Tachycardia",
      "Nausea, Vomiting & Belching",
      "Dizziness / Lightheadedness",
      "High Fever with Chills",
      "Cough with Expectoration"
    ]
  },
  {
    key: "timing",
    letter: "T",
    name: "Timing & Daily Rhythm",
    clinicalTerm: "Circadian Pattern & Periodicity",
    subtitle: "Frequency & diurnal variations",
    clinicalPurpose: "Tracks daily pattern, constant vs episodic occurrences, and specific diurnal or post-prandial time peaks.",
    differentialRelevance: "Constant relentless pain suggests continuous organ ischemia or abscess; nocturnal awakening points to peptic ulcer disease or neuropathic etiology.",
    icon: Calendar,
    quickOptions: [
      "Continuous / Constant (No relief)",
      "Intermittent / Episodic Spikes",
      "Nocturnal (Wakes from sleep)",
      "Post-prandial (30m after meals)",
      "Morning Stiffness / Peaks",
      "Waxing & Waning in waves"
    ]
  },
  {
    key: "exacerbating_relieving",
    letter: "E",
    name: "Exacerbating & Relieving Factors",
    clinicalTerm: "Provocative & Palliative Modifiers",
    subtitle: "What worsens or improves symptoms",
    clinicalPurpose: "Identifies specific physical activities, respiratory phases, postures, or medications that modify symptom severity.",
    differentialRelevance: "Pain relieved by leaning forward suggests acute pericarditis; pain worsened by exertion and relieved by sublingual nitrates/rest indicates angina pectoris.",
    icon: Sliders,
    quickOptions: [
      "Worse on Exertion • Relieved by Rest",
      "Worse Lying Flat • Relieved Leaning Forward",
      "Worse with Deep Inspiration / Cough",
      "Relieved by Antacids / Milk",
      "Aggravated by Food Ingestion",
      "Relieved by Heat Application / NSAIDs"
    ]
  },
  {
    key: "severity_score",
    letter: "S",
    name: "Severity & Functional Impact",
    clinicalTerm: "Quantified Numeric Intensity (0–10)",
    subtitle: "Wong-Baker scale & functional limit",
    clinicalPurpose: "Quantifies subjective intensity on a standardized 0–10 scale and gauges functional impairment (inability to ambulate, breathe comfortably, or sleep).",
    differentialRelevance: "Severity >= 7/10 with autonomic signs prioritizes the patient into the Urgent/Emergency red-flag OPD triage tier.",
    icon: Activity,
    quickOptions: [
      "Score 2/10 (Mild Discomfort)",
      "Score 4/10 (Moderate Ache)",
      "Score 6/10 (Distressing / Limits activity)",
      "Score 8/10 (Severe / Unable to sit still)",
      "Score 10/10 (Worst pain imaginable)"
    ]
  }
];

export function SocratesRadar({ socrates, className, onUpdateField }: SocratesRadarProps) {
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [customInputKey, setCustomInputKey] = useState<keyof SocratesData | null>(null);
  const [customInputValue, setCustomInputValue] = useState<string>("");

  const getAxisValue = (key: keyof SocratesData): string | null => {
    if (!socrates) return null;
    const val = socrates[key];
    if (val === null || val === undefined) return null;
    if (Array.isArray(val)) {
      return val.length > 0 ? val.join(", ") : null;
    }
    if (typeof val === "number") {
      return `${val} / 10`;
    }
    return String(val);
  };

  const completedCount = SOCRATES_DEFINITIONS.filter((def) => Boolean(getAxisValue(def.key))).length;
  const percentage = Math.round((completedCount / SOCRATES_DEFINITIONS.length) * 100);

  const handleApplyCustom = (key: keyof SocratesData) => {
    if (customInputValue.trim() && onUpdateField) {
      if (key === "associations") {
        const arr = customInputValue.split(",").map((s) => s.trim()).filter(Boolean);
        onUpdateField(key, arr);
      } else if (key === "severity_score") {
        const num = parseInt(customInputValue.replace(/\D/g, ""), 10);
        onUpdateField(key, isNaN(num) ? 5 : Math.min(10, Math.max(0, num)));
      } else {
        onUpdateField(key, customInputValue.trim());
      }
    }
    setCustomInputKey(null);
    setCustomInputValue("");
  };

  return (
    <div className={cn("rounded-3xl border border-[#E2E8F0] bg-white p-6 sm:p-7 shadow-xs text-left relative overflow-hidden space-y-6", className)}>
      {/* Top Header & Coverage Bar */}
      <div className="flex flex-wrap items-center justify-between border-b border-[#E2E8F0] pb-5 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#EBF5FF] text-[#0056B3]">
              <Sparkles className="h-3.5 w-3.5" />
            </span>
            <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#0056B3]">
              Comprehensive Clinical Diagnostic Assessment
            </p>
          </div>
          <h3 className="font-heading text-lg sm:text-xl font-bold text-[#1E293B] mt-1">
            SOCRATES Pain &amp; Symptom Evaluation Matrix
          </h3>
          <p className="text-xs text-[#64748B] mt-0.5 max-w-xl">
            International 8-axis clinical evaluation synthesized in real-time from patient voice intake. Touch any chip or edit directly to clarify findings.
          </p>
        </div>

        {/* Coverage Progress Indicator */}
        <div className="flex items-center gap-3.5 bg-[#F8F9FA] px-4 py-2.5 rounded-2xl border border-[#E2E8F0]">
          <div>
            <span className="text-[10px] font-mono uppercase font-bold text-[#64748B] block">HPI Axis Coverage</span>
            <span className="text-sm font-extrabold text-[#0056B3]">{percentage}% Structured</span>
          </div>
          <div className="h-3.5 w-28 overflow-hidden rounded-full bg-[#E2E8F0] shadow-inner">
            <motion.div
              className="h-full bg-gradient-to-r from-[#0056B3] to-[#17A2B8] rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      </div>

      {/* 8-Axis Clinical Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {SOCRATES_DEFINITIONS.map((def) => {
          const rawVal = getAxisValue(def.key);
          const isFilled = Boolean(rawVal);
          const Icon = def.icon;
          const isExpanded = expandedCard === def.key;

          return (
            <div
              key={def.key}
              className={cn(
                "rounded-2xl border transition-all text-left flex flex-col justify-between overflow-hidden shadow-xs",
                isFilled
                  ? "border-[#BEE3F8] bg-[#F8FBFF] ring-1 ring-[#0056B3]/10"
                  : "border-[#E2E8F0] bg-white hover:border-[#CBD5E1]"
              )}
            >
              {/* Card Top Section */}
              <div className="p-4 sm:p-5 space-y-3">
                {/* Header Row: Letter Icon, Name, Term, Status Badge */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-xl text-xs font-black font-mono shadow-2xs shrink-0",
                        isFilled ? "bg-[#0056B3] text-white" : "bg-[#E2E8F0] text-[#64748B]"
                      )}
                    >
                      {def.letter}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-heading text-xs sm:text-sm font-bold text-[#1E293B]">
                          {def.name}
                        </h4>
                      </div>
                      <p className="text-[10px] font-mono text-[#0056B3] font-semibold">
                        {def.clinicalTerm}
                      </p>
                    </div>
                  </div>

                  <span
                    className={cn(
                      "text-[10px] font-bold px-2.5 py-1 rounded-full border flex items-center gap-1 shrink-0",
                      isFilled
                        ? "bg-[#EAF7ED] text-[#28A745] border-[#28A745]/30"
                        : "bg-[#F8F9FA] text-[#94A3B8] border-[#E2E8F0]"
                    )}
                  >
                    {isFilled ? (
                      <>
                        <Check className="w-3 h-3 stroke-[3]" />
                        <span>Recorded</span>
                      </>
                    ) : (
                      "Awaiting Intake"
                    )}
                  </span>
                </div>

                {/* Extracted Finding Box */}
                <div className={cn(
                  "rounded-xl p-3 border transition-colors shadow-2xs",
                  isFilled
                    ? "bg-white border-[#BEE3F8]"
                    : "bg-[#F8F9FA] border-[#E2E8F0]"
                )}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono uppercase font-bold text-[#0056B3]">
                      Extracted Clinical Finding:
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setCustomInputKey(def.key);
                        setCustomInputValue(rawVal || "");
                      }}
                      className="text-[10px] font-bold text-[#64748B] hover:text-[#0056B3] flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                  </div>

                  {customInputKey === def.key ? (
                    <div className="flex gap-2 mt-1.5">
                      <input
                        type="text"
                        value={customInputValue}
                        onChange={(e) => setCustomInputValue(e.target.value)}
                        placeholder={`Enter ${def.name.toLowerCase()}...`}
                        className="flex-1 rounded-lg border border-[#0056B3] bg-white px-2.5 py-1 text-xs text-[#1E293B] outline-none font-medium"
                        autoFocus
                        onKeyDown={(e) => e.key === "Enter" && handleApplyCustom(def.key)}
                      />
                      <button
                        type="button"
                        onClick={() => handleApplyCustom(def.key)}
                        className="rounded-lg bg-[#0056B3] text-white px-3 py-1 text-xs font-bold hover:bg-[#004494] cursor-pointer"
                      >
                        Save
                      </button>
                    </div>
                  ) : (
                    <p className={cn(
                      "text-xs font-semibold leading-relaxed",
                      isFilled ? "text-[#1E293B]" : "text-[#94A3B8] italic"
                    )}>
                      {rawVal ? `“${rawVal}”` : "Not explicitly mentioned yet in voice dialogue"}
                    </p>
                  )}
                </div>

                {/* Clinical Explanation & Diagnostic Relevance */}
                <div className="space-y-1 text-[11px] leading-relaxed text-[#475569]">
                  <p className="text-[11px] text-[#334155]">
                    <strong className="text-[#1E293B] font-semibold">Purpose: </strong>
                    {def.clinicalPurpose}
                  </p>
                  
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="pt-1 text-[10px] text-[#64748B] bg-[#EBF5FF]/50 p-2 rounded-lg border border-[#BEE3F8]"
                    >
                      <strong className="text-[#0056B3] font-bold block mb-0.5">Differential Diagnosis Note:</strong>
                      {def.differentialRelevance}
                    </motion.div>
                  )}
                </div>

                {/* Quick Touch Suggestion Chips */}
                <div className="pt-2 border-t border-[#E2E8F0]/70">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block mb-1.5">
                    Touch to Clarify / Select:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {def.quickOptions.slice(0, 4).map((option, optIdx) => {
                      const isOptionActive = rawVal?.toLowerCase().includes(option.toLowerCase());
                      return (
                        <button
                          key={optIdx}
                          type="button"
                          onClick={() => {
                            if (def.key === "associations") {
                              const curr = socrates?.associations || [];
                              const updated = curr.includes(option)
                                ? curr.filter((x) => x !== option)
                                : [...curr, option];
                              onUpdateField?.(def.key, updated);
                            } else if (def.key === "severity_score") {
                              const match = option.match(/Score (\d+)\/10/);
                              const val = match ? parseInt(match[1], 10) : 5;
                              onUpdateField?.(def.key, val);
                            } else {
                              onUpdateField?.(def.key, option);
                            }
                          }}
                          className={cn(
                            "text-[10px] sm:text-[11px] px-2.5 py-1 rounded-lg border transition-all cursor-pointer font-medium",
                            isOptionActive
                              ? "bg-[#0056B3] text-white border-[#0056B3] shadow-xs font-bold"
                              : "bg-white border-[#CBD5E1] text-[#334155] hover:border-[#0056B3] hover:text-[#0056B3] hover:bg-[#EBF5FF]"
                          )}
                        >
                          {isOptionActive ? "✓ " : "+ "}
                          {option}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Card Footer: Expand/Collapse Clinical Differential */}
              <button
                type="button"
                onClick={() => setExpandedCard(isExpanded ? null : def.key)}
                className="w-full bg-[#F8F9FA] hover:bg-[#F1F5F9] border-t border-[#E2E8F0] px-4 py-2 flex items-center justify-between text-[10px] font-bold text-[#64748B] hover:text-[#0056B3] transition-colors cursor-pointer"
              >
                <span>{isExpanded ? "Hide Diagnostic Guidance" : "Show Clinical Differential Guidance"}</span>
                {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>
          );
        })}
      </div>

      {/* Synthesis Summary Banner */}
      <div className="rounded-2xl bg-[#F0F7FF] border border-[#BEE3F8] p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#0056B3] text-white flex items-center justify-center shrink-0 shadow-xs">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h5 className="font-heading font-bold text-[#1E293B]">
              Standardized OPD Handover Storyboard
            </h5>
            <p className="text-[11px] text-[#475569]">
              This 8-axis SOCRATES matrix feeds directly into the physician&apos;s differential diagnosis engine and pre-consultation report.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-[#0056B3] bg-white px-3 py-1.5 rounded-xl border border-[#BEE3F8]">
            {completedCount} / 8 Axes Verified
          </span>
        </div>
      </div>
    </div>
  );
}
