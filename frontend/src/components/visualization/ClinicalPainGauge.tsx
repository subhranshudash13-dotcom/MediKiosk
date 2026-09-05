"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ClinicalPainGaugeProps {
  score?: number | null;
  onChange?: (val: number) => void;
  className?: string;
  readOnly?: boolean;
}

const PAIN_LEVELS = [
  { val: 0, label: "None", emoji: "🟢", desc: "No discomfort" },
  { val: 2, label: "Mild", emoji: "🟡", desc: "Noticeable, minor" },
  { val: 5, label: "Moderate", emoji: "🟠", desc: "Interferes with focus" },
  { val: 8, label: "Severe", emoji: "🔴", desc: "Dominates senses" },
  { val: 10, label: "Critical", emoji: "🚨", desc: "Incapacitating" },
];

export function ClinicalPainGauge({
  score = 6,
  onChange,
  className,
  readOnly = false,
}: ClinicalPainGaugeProps) {
  const currentScore = score ?? 0;

  const getStatusText = (val: number) => {
    if (val === 0) return { text: "No Discomfort (0/10)", color: "text-emerald-700" };
    if (val <= 3) return { text: `Mild Discomfort (${val}/10)`, color: "text-emerald-600" };
    if (val <= 6) return { text: `Moderate Pain (${val}/10)`, color: "text-[#FB923C]" };
    if (val <= 8) return { text: `Severe Pain (${val}/10)`, color: "text-[#C2410C]" };
    return { text: `Critical Distress (${val}/10)`, color: "text-[#C2410C]" };
  };

  const status = getStatusText(currentScore);

  return (
    <div className={cn("rounded-[16px] border border-[#FDEBD0] bg-white p-6 shadow-sm text-left relative overflow-hidden", className)}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#FDEBD0]/80 pb-3.5">
        <div>
          <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#1D2A8F]">
            Wong-Baker Clinical Pain Rating
          </p>
          <h3 className={cn("font-heading text-lg font-bold mt-0.5", status.color)}>
            {status.text}
          </h3>
        </div>
        <span className="rounded-full bg-[#FDFBF7] border border-[#FDEBD0] px-3 py-1 text-[10px] font-bold text-[#374151]/70 uppercase tracking-wider">
          Standard 0–10 Scale
        </span>
      </div>

      {/* Discrete 0-10 Segments */}
      <div className="mt-5 flex items-center gap-1.5">
        {Array.from({ length: 11 }, (_, i) => (
          <button
            key={i}
            disabled={readOnly}
            onClick={() => onChange?.(i)}
            type="button"
            className={cn(
              "flex-1 h-11 rounded-[8px] text-xs font-bold transition-all flex items-center justify-center shadow-xs cursor-pointer",
              i <= currentScore
                ? i <= 3
                  ? "bg-emerald-600 text-white scale-105"
                  : i <= 6
                  ? "bg-[#FB923C] text-white scale-105"
                  : "bg-[#C2410C] text-white scale-105"
                : "bg-[#FDFBF7] border border-[#FDEBD0] text-[#374151]/60 hover:bg-white hover:text-[#1D2A8F]"
            )}
          >
            {i}
          </button>
        ))}
      </div>

      {/* Scale Qualifiers */}
      <div className="mt-4 grid grid-cols-5 text-center text-[10px] text-[#374151]/70">
        {PAIN_LEVELS.map((lvl) => (
          <div key={lvl.val} className="flex flex-col items-center">
            <span className="text-base">{lvl.emoji}</span>
            <span className="font-bold text-[#374151] mt-1">{lvl.label}</span>
            <span className="hidden sm:inline text-[9px] text-[#374151]/60">{lvl.desc}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
