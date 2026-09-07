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
  { val: 2, label: "Mild", emoji: "🟢", desc: "Noticeable, minor" },
  { val: 5, label: "Moderate", emoji: "🟡", desc: "Interferes with focus" },
  { val: 8, label: "Severe", emoji: "🟠", desc: "Dominates senses" },
  { val: 10, label: "Critical", emoji: "🔴", desc: "Incapacitating distress" },
];

export function ClinicalPainGauge({
  score = 6,
  onChange,
  className,
  readOnly = false,
}: ClinicalPainGaugeProps) {
  const currentScore = score ?? 0;

  const getStatusText = (val: number) => {
    if (val === 0) return { text: "No Discomfort (0/10)", color: "text-[#2D6A4F]" };
    if (val <= 3) return { text: `Mild Discomfort (${val}/10)`, color: "text-[#2D6A4F]" };
    if (val <= 6) return { text: `Moderate Pain (${val}/10)`, color: "text-[#9C4124]" };
    if (val <= 8) return { text: `Severe Pain (${val}/10)`, color: "text-[#9C4124]" };
    return { text: `Critical Distress (${val}/10)`, color: "text-[#7A3119]" };
  };

  const status = getStatusText(currentScore);

  return (
    <div className={cn("rounded-2xl border border-[#E0D7C9] bg-white p-6 shadow-subtle text-left relative overflow-hidden", className)}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#E0D7C9] pb-3.5">
        <div>
          <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#1B4332]">
            Standard Clinical Pain Rating (Wong-Baker Scale)
          </p>
          <h3 className={cn("font-heading text-lg font-bold mt-0.5", status.color)}>
            {status.text}
          </h3>
        </div>
        <span className="rounded-full bg-[#F3EFE8] border border-[#E0D7C9] px-3 py-1 text-[11px] font-semibold text-[#4E5752] uppercase tracking-wider">
          Touch to Score (0–10)
        </span>
      </div>

      {/* Discrete 0-10 Segments */}
      <div className="mt-5 flex items-center gap-1.5">
        {Array.from({ length: 11 }, (_, i) => {
          const isSelected = i === currentScore;
          const isFilled = i <= currentScore;
          return (
            <button
              key={i}
              disabled={readOnly}
              onClick={() => onChange?.(i)}
              type="button"
              className={cn(
                "flex-1 h-12 rounded-xl text-sm font-bold transition-all flex items-center justify-center shadow-subtle cursor-pointer",
                isFilled
                  ? i <= 3
                    ? "bg-[#2D6A4F] text-white"
                    : i <= 6
                    ? "bg-[#B45309] text-white"
                    : "bg-[#9C4124] text-white"
                  : "bg-[#FBF9F5] border border-[#E0D7C9] text-[#76807A] hover:bg-white hover:text-[#1B4332]",
                isSelected && "ring-2 ring-offset-1 ring-[#1B4332]"
              )}
            >
              {i}
            </button>
          );
        })}
      </div>

      {/* Scale Qualifiers */}
      <div className="mt-4 grid grid-cols-5 text-center text-xs text-[#4E5752]">
        {PAIN_LEVELS.map((lvl) => (
          <div key={lvl.val} className="flex flex-col items-center">
            <span className="text-lg">{lvl.emoji}</span>
            <span className="font-bold text-[#1F2421] mt-1">{lvl.label}</span>
            <span className="hidden sm:inline text-[10px] text-[#606963]">{lvl.desc}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
