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
    if (val === 0) return { text: "No Discomfort (0/10)", color: "text-[#28A745]" };
    if (val <= 3) return { text: `Mild Discomfort (${val}/10)`, color: "text-[#28A745]" };
    if (val <= 6) return { text: `Moderate Pain (${val}/10)`, color: "text-[#D97706]" };
    if (val <= 8) return { text: `Severe Pain (${val}/10)`, color: "text-[#EA580C]" };
    return { text: `Critical Distress (${val}/10)`, color: "text-[#DC3545]" };
  };

  const status = getStatusText(currentScore);

  return (
    <div className={cn("rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-xs text-left relative overflow-hidden", className)}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3.5">
        <div>
          <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#0056B3]">
            Standard Clinical Pain Rating (Wong-Baker Scale)
          </p>
          <h3 className={cn("font-heading text-lg font-bold mt-0.5", status.color)}>
            {status.text}
          </h3>
        </div>
        <span className="rounded-full bg-[#F8F9FA] border border-[#CBD5E1] px-3 py-1 text-[11px] font-semibold text-[#475569] uppercase tracking-wider">
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
                "flex-1 h-12 rounded-xl text-sm font-bold transition-all flex items-center justify-center cursor-pointer shadow-2xs",
                isFilled
                  ? i <= 3
                    ? "bg-[#28A745] text-white"
                    : i <= 6
                    ? "bg-[#D97706] text-white"
                    : "bg-[#DC3545] text-white"
                  : "bg-[#F8F9FA] border border-[#E2E8F0] text-[#64748B] hover:bg-white hover:text-[#0056B3] hover:border-[#0056B3]",
                isSelected && "ring-2 ring-offset-2 ring-[#0056B3] scale-105"
              )}
            >
              {i}
            </button>
          );
        })}
      </div>

      {/* Scale Qualifiers */}
      <div className="mt-4 grid grid-cols-5 text-center text-xs text-[#475569]">
        {PAIN_LEVELS.map((lvl) => (
          <div key={lvl.val} className="flex flex-col items-center">
            <span className="text-xl">{lvl.emoji}</span>
            <span className="font-bold text-[#1E293B] mt-1">{lvl.label}</span>
            <span className="hidden sm:inline text-[10px] text-[#64748B]">{lvl.desc}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
