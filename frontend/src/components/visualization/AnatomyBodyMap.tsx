"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, Brain, Activity, Wind } from "lucide-react";
import { cn } from "@/lib/utils";

export type AnatomicalRegion =
  | "head"
  | "throat"
  | "chest"
  | "epigastric"
  | "abdomen"
  | "spine"
  | "arms"
  | "legs";

interface AnatomyBodyMapProps {
  activeRegion?: string | null;
  onSelectRegion?: (region: AnatomicalRegion, symptom?: string) => void;
  className?: string;
  painScore?: number;
}

const REGION_METADATA: Record<
  AnatomicalRegion,
  {
    name: string;
    organ: string;
    icon: any;
    commonSymptoms: string[];
    riskLevel: "critical" | "warning" | "standard";
  }
> = {
  head: {
    name: "Head & Cranial",
    organ: "Brain / Neurological",
    icon: Brain,
    commonSymptoms: ["Throbbing Headache", "Visual Aura", "Dizziness / Vertigo", "Neck Stiffness"],
    riskLevel: "warning",
  },
  throat: {
    name: "Throat & ENT",
    organ: "Pharynx / Larynx",
    icon: Wind,
    commonSymptoms: ["Difficulty Swallowing", "Severe Sore Throat", "Hoarse Voice", "Tonsillar Pain"],
    riskLevel: "standard",
  },
  chest: {
    name: "Thorax & Chest",
    organ: "Heart & Lungs",
    icon: Heart,
    commonSymptoms: ["Sub-sternal Pressure", "Shortness of Breath", "Palpitations", "Left Arm Radiation"],
    riskLevel: "critical",
  },
  epigastric: {
    name: "Epigastric Area",
    organ: "Upper GI / Stomach",
    icon: Activity,
    commonSymptoms: ["Burning Acidity", "Post-meal Pain", "Nausea / Vomiting", "Bloating"],
    riskLevel: "standard",
  },
  abdomen: {
    name: "Abdomen & Pelvis",
    organ: "Lower GI / Renal",
    icon: Activity,
    commonSymptoms: ["Lower Right Colic", "Cramping", "Flank Pain", "Bloody Stool"],
    riskLevel: "warning",
  },
  spine: {
    name: "Spine & Lumbar",
    organ: "Musculoskeletal",
    icon: Activity,
    commonSymptoms: ["Lower Back Spasm", "Sciatica Nerve Pain", "Stiffness on Waking"],
    riskLevel: "standard",
  },
  arms: {
    name: "Upper Limbs",
    organ: "Peripheral Vascular",
    icon: Activity,
    commonSymptoms: ["Left Arm Numbness", "Shoulder Impingement", "Joint Swelling"],
    riskLevel: "warning",
  },
  legs: {
    name: "Lower Limbs",
    organ: "Joints & Vascular",
    icon: Activity,
    commonSymptoms: ["Calf Tenderness / Swelling", "Knee Arthralgia", "Edema / Fluid"],
    riskLevel: "standard",
  },
};

export function AnatomyBodyMap({
  activeRegion,
  onSelectRegion,
  className,
  painScore = 6,
}: AnatomyBodyMapProps) {
  const [hoveredRegion, setHoveredRegion] = useState<AnatomicalRegion | null>(null);

  const getActiveZoneKey = (): AnatomicalRegion => {
    if (!activeRegion) return "chest";
    const lower = activeRegion.toLowerCase();
    if (lower.includes("head") || lower.includes("migraine") || lower.includes("cranial")) return "head";
    if (lower.includes("throat") || lower.includes("cough") || lower.includes("ent")) return "throat";
    if (lower.includes("chest") || lower.includes("heart") || lower.includes("breath")) return "chest";
    if (lower.includes("stomach") || lower.includes("epigastric") || lower.includes("acid")) return "epigastric";
    if (lower.includes("abdomen") || lower.includes("belly") || lower.includes("colic")) return "abdomen";
    if (lower.includes("back") || lower.includes("spine") || lower.includes("lumbar")) return "spine";
    if (lower.includes("arm") || lower.includes("shoulder") || lower.includes("hand")) return "arms";
    if (lower.includes("leg") || lower.includes("knee") || lower.includes("foot")) return "legs";
    return "chest";
  };

  const selectedZone = hoveredRegion || getActiveZoneKey();
  const meta = REGION_METADATA[selectedZone];
  const IconComponent = meta.icon;

  return (
    <div className={cn("rounded-[16px] border border-[#FDEBD0] bg-white p-6 shadow-sm text-left relative overflow-hidden", className)}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#FDEBD0]/80 pb-3.5">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-md bg-[#1D2A8F]/10 text-[#1D2A8F]">
              <IconComponent className="h-3.5 w-3.5" />
            </span>
            <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#1D2A8F]">
              Anatomical Symptom Locator
            </p>
          </div>
          <h3 className="font-heading text-base font-bold text-[#374151] mt-0.5">
            {meta.name} ({meta.organ})
          </h3>
        </div>

        <span
          className={cn(
            "rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
            meta.riskLevel === "critical"
              ? "bg-red-50 text-[#C2410C] border border-red-200"
              : "bg-emerald-50 text-emerald-700 border border-emerald-200"
          )}
        >
          {meta.riskLevel === "critical" ? "High Risk Area" : "Active Region"}
        </span>
      </div>

      {/* Body Diagram & Drilldowns */}
      <div className="mt-5 grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
        {/* SVG Human Figure (5 cols) */}
        <div className="md:col-span-5 relative flex flex-col items-center justify-center bg-[#FDFBF7] rounded-[12px] p-4 border border-[#FDEBD0] min-h-[250px]">
          <svg
            viewBox="0 0 240 340"
            className="h-60 w-auto"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Head */}
            <circle
              cx="120"
              cy="46"
              r="22"
              className={cn(
                "cursor-pointer transition-all duration-200",
                selectedZone === "head"
                  ? "fill-red-100 stroke-[#C2410C] stroke-[2.5]"
                  : "fill-white stroke-[#374151]/40 stroke-[1.5] hover:stroke-[#1D2A8F] hover:fill-[#1D2A8F]/10"
              )}
              onClick={() => onSelectRegion?.("head")}
              onMouseEnter={() => setHoveredRegion("head")}
            />
            {/* Throat */}
            <rect
              x="114"
              y="68"
              width="12"
              height="14"
              className={cn(
                "cursor-pointer transition-all",
                selectedZone === "throat" ? "fill-red-100 stroke-[#C2410C] stroke-2" : "fill-white stroke-[#374151]/40"
              )}
              onClick={() => onSelectRegion?.("throat")}
              onMouseEnter={() => setHoveredRegion("throat")}
            />
            {/* Chest */}
            <path
              d="M94 82 C104 80 136 80 146 82 C154 104 150 134 144 146 C136 148 104 148 96 146 C90 134 86 104 94 82 Z"
              className={cn(
                "cursor-pointer transition-all duration-200",
                selectedZone === "chest"
                  ? "fill-red-100 stroke-[#C2410C] stroke-[2.5]"
                  : "fill-white stroke-[#374151]/40 stroke-[1.5] hover:stroke-[#1D2A8F] hover:fill-[#1D2A8F]/10"
              )}
              onClick={() => onSelectRegion?.("chest")}
              onMouseEnter={() => setHoveredRegion("chest")}
            />
            {/* Abdomen */}
            <path
              d="M96 146 C104 148 136 148 144 146 C148 168 144 196 138 206 C130 208 110 208 102 206 C96 196 92 168 96 146 Z"
              className={cn(
                "cursor-pointer transition-all duration-200",
                selectedZone === "epigastric" || selectedZone === "abdomen"
                  ? "fill-amber-100 stroke-[#FB923C] stroke-[2.5]"
                  : "fill-white stroke-[#374151]/40 stroke-[1.5] hover:stroke-[#1D2A8F] hover:fill-[#1D2A8F]/10"
              )}
              onClick={() => onSelectRegion?.("abdomen")}
              onMouseEnter={() => setHoveredRegion("abdomen")}
            />
            {/* Arms */}
            <path
              d="M94 84 L56 126 L44 184 M146 84 L184 126 L196 184"
              className={cn(
                "cursor-pointer transition-all",
                selectedZone === "arms" ? "stroke-[#C2410C] stroke-[2.5]" : "stroke-[#374151]/40 stroke-[1.5] hover:stroke-[#1D2A8F]"
              )}
              onClick={() => onSelectRegion?.("arms")}
              onMouseEnter={() => setHoveredRegion("arms")}
            />
            {/* Legs */}
            <path
              d="M102 206 L96 266 L92 324 M138 206 L144 266 L148 324"
              className={cn(
                "cursor-pointer transition-all",
                selectedZone === "legs" ? "stroke-[#C2410C] stroke-[2.5]" : "stroke-[#374151]/40 stroke-[1.5] hover:stroke-[#1D2A8F]"
              )}
              onClick={() => onSelectRegion?.("legs")}
              onMouseEnter={() => setHoveredRegion("legs")}
            />
          </svg>
        </div>

        {/* Symptoms Drilldown (7 cols) */}
        <div className="md:col-span-7 space-y-3">
          <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#374151]/70">
            Common Symptoms in {meta.name}:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {meta.commonSymptoms.map((symptom) => (
              <button
                key={symptom}
                type="button"
                onClick={() => onSelectRegion?.(selectedZone, symptom)}
                className="flex items-center gap-2 rounded-[10px] border border-[#FDEBD0] bg-white p-3 text-left transition-all hover:border-[#1D2A8F] hover:bg-[#FDFBF7] group shadow-xs cursor-pointer"
              >
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#FDFBF7] border border-[#FDEBD0] text-[#374151] text-xs font-bold group-hover:bg-[#1D2A8F] group-hover:text-white transition-colors">
                  +
                </span>
                <span className="text-xs font-semibold text-[#374151] group-hover:text-[#1D2A8F]">
                  {symptom}
                </span>
              </button>
            ))}
          </div>

          <div className="rounded-[10px] border border-[#FDEBD0] bg-[#FDFBF7] p-3 mt-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#374151]">Assessed Pain Severity:</span>
              <span className="font-extrabold text-[#C2410C]">{painScore} / 10</span>
            </div>
            <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-[#FDEBD0]">
              <div
                className="h-full bg-[#1D2A8F] rounded-full transition-all"
                style={{ width: `${(painScore / 10) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
