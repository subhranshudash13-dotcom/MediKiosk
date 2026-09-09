"use client";

import { useState } from "react";
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
    organ: "Neurological & Vascular",
    icon: Brain,
    commonSymptoms: ["Throbbing Headache", "Dizziness / Vertigo", "Visual Aura", "Neck Stiffness"],
    riskLevel: "warning",
  },
  throat: {
    name: "Throat & ENT",
    organ: "Upper Respiratory",
    icon: Wind,
    commonSymptoms: ["Difficulty Swallowing", "Severe Sore Throat", "Hoarse Voice", "Tonsillar Pain"],
    riskLevel: "standard",
  },
  chest: {
    name: "Thorax & Chest",
    organ: "Cardiac & Pulmonary",
    icon: Heart,
    commonSymptoms: ["Sub-sternal Heaviness", "Shortness of Breath", "Palpitations", "Left Arm Radiation"],
    riskLevel: "critical",
  },
  epigastric: {
    name: "Epigastric Area",
    organ: "Upper GI / Gastric",
    icon: Activity,
    commonSymptoms: ["Burning Acidity", "Post-meal Pain", "Nausea / Vomiting", "Bloating"],
    riskLevel: "standard",
  },
  abdomen: {
    name: "Abdomen & Pelvis",
    organ: "Lower GI / Renal",
    icon: Activity,
    commonSymptoms: ["Lower Right Pain", "Cramping Spasms", "Flank Pain", "Bloody Stool"],
    riskLevel: "warning",
  },
  spine: {
    name: "Spine & Lumbar",
    organ: "Musculoskeletal",
    icon: Activity,
    commonSymptoms: ["Lower Back Spasm", "Sciatica Radiating Pain", "Stiffness on Waking"],
    riskLevel: "standard",
  },
  arms: {
    name: "Upper Limbs",
    organ: "Joints & Peripheral",
    icon: Activity,
    commonSymptoms: ["Left Arm Numbness", "Shoulder Impingement", "Joint Swelling"],
    riskLevel: "warning",
  },
  legs: {
    name: "Lower Limbs",
    organ: "Joints & Vascular",
    icon: Activity,
    commonSymptoms: ["Calf Tenderness / Swelling", "Knee Arthralgia", "Foot Edema"],
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
    <div className={cn("rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-xs text-left relative overflow-hidden", className)}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3.5">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#EBF5FF] text-[#0056B3]">
              <IconComponent className="h-4 w-4" />
            </span>
            <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#0056B3]">
              Anatomical Pain Localization
            </p>
          </div>
          <h3 className="font-heading text-base font-bold text-[#1E293B] mt-0.5">
            {meta.name} <span className="text-xs font-normal text-[#64748B]">({meta.organ})</span>
          </h3>
        </div>

        <span
          className={cn(
            "rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider",
            meta.riskLevel === "critical"
              ? "bg-[#FEF2F2] text-[#DC3545] border border-[#FECACA]"
              : "bg-[#EBF5FF] text-[#0056B3] border border-[#BEE3F8]"
          )}
        >
          {meta.riskLevel === "critical" ? "Priority Area" : "Active Region"}
        </span>
      </div>

      {/* Body Diagram & Drilldowns */}
      <div className="mt-5 grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
        {/* SVG Human Figure (5 cols) */}
        <div className="md:col-span-5 relative flex flex-col items-center justify-center bg-[#F8F9FA] rounded-xl p-4 border border-[#E2E8F0] min-h-[250px]">
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
                  ? "fill-[#EBF5FF] stroke-[#0056B3] stroke-[2.5]"
                  : "fill-white stroke-[#94A3B8] stroke-[1.5] hover:stroke-[#0056B3] hover:fill-[#F0F7FF]"
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
                selectedZone === "throat" ? "fill-[#EBF5FF] stroke-[#0056B3] stroke-2" : "fill-white stroke-[#94A3B8]"
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
                  ? "fill-[#EBF5FF] stroke-[#0056B3] stroke-[2.5]"
                  : "fill-white stroke-[#94A3B8] stroke-[1.5] hover:stroke-[#0056B3] hover:fill-[#F0F7FF]"
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
                  ? "fill-[#EBF5FF] stroke-[#0056B3] stroke-[2.5]"
                  : "fill-white stroke-[#94A3B8] stroke-[1.5] hover:stroke-[#0056B3] hover:fill-[#F0F7FF]"
              )}
              onClick={() => onSelectRegion?.("abdomen")}
              onMouseEnter={() => setHoveredRegion("abdomen")}
            />
            {/* Arms */}
            <path
              d="M94 84 L56 126 L44 184 M146 84 L184 126 L196 184"
              className={cn(
                "cursor-pointer transition-all",
                selectedZone === "arms" ? "stroke-[#0056B3] stroke-[2.5]" : "stroke-[#94A3B8] stroke-[1.5] hover:stroke-[#0056B3]"
              )}
              onClick={() => onSelectRegion?.("arms")}
              onMouseEnter={() => setHoveredRegion("arms")}
            />
            {/* Legs */}
            <path
              d="M102 206 L96 266 L92 324 M138 206 L144 266 L148 324"
              className={cn(
                "cursor-pointer transition-all",
                selectedZone === "legs" ? "stroke-[#0056B3] stroke-[2.5]" : "stroke-[#94A3B8] stroke-[1.5] hover:stroke-[#0056B3]"
              )}
              onClick={() => onSelectRegion?.("legs")}
              onMouseEnter={() => setHoveredRegion("legs")}
            />
          </svg>
        </div>

        {/* Symptoms Drilldown (7 cols) */}
        <div className="md:col-span-7 space-y-3">
          <p className="text-xs font-mono font-bold uppercase tracking-wider text-[#475569]">
            Select Specific Symptom in {meta.name}:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {meta.commonSymptoms.map((symptom) => (
              <button
                key={symptom}
                type="button"
                onClick={() => onSelectRegion?.(selectedZone, symptom)}
                className="flex items-center gap-2 rounded-xl border border-[#E2E8F0] bg-white p-3 text-left transition-all hover:border-[#0056B3] hover:bg-[#F0F7FF] group shadow-2xs cursor-pointer"
              >
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#F1F5F9] border border-[#CBD5E1] text-[#1E293B] text-xs font-bold group-hover:bg-[#0056B3] group-hover:text-white transition-colors">
                  +
                </span>
                <span className="text-xs font-semibold text-[#1E293B] group-hover:text-[#0056B3]">
                  {symptom}
                </span>
              </button>
            ))}
          </div>

          <div className="rounded-xl border border-[#E2E8F0] bg-[#F8F9FA] p-3.5 mt-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#1E293B]">Associated Pain Severity:</span>
              <span className="font-extrabold text-[#0056B3]">{painScore} / 10</span>
            </div>
            <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-[#E2E8F0]">
              <div
                className="h-full bg-[#0056B3] rounded-full transition-all"
                style={{ width: `${(painScore / 10) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
