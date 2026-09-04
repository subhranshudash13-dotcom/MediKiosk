"use client";

import { motion } from "framer-motion";
import { DotAccent } from "@/components/illustrations/CareImagery";
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
    if (val === 0) return { text: "No Pain (0/10)", color: "text-olive" };
    if (val <= 3) return { text: `Mild Discomfort (${val}/10)`, color: "text-olive-light" };
    if (val <= 6) return { text: `Moderate Pain (${val}/10)`, color: "text-amber" };
    if (val <= 8) return { text: `Severe Pain (${val}/10)`, color: "text-coral" };
    return { text: `Critical Distress (${val}/10)`, color: "text-coral" };
  };

  const status = getStatusText(currentScore);

  return (
    <div className={cn("card-arch-top relative overflow-hidden", className)}>
      <DotAccent className="absolute top-5 right-5" />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-line/60 pb-3.5">
        <div>
          <p className="label-eyebrow">Wong-Baker Pain Scale</p>
          <h3 className={cn("font-serif text-lg font-bold mt-0.5", status.color)}>
            {status.text}
          </h3>
        </div>
        <span className="rounded-full bg-oat px-3 py-1 text-[10px] font-bold text-ink-muted uppercase tracking-wider">
          Standard Clinical Dial
        </span>
      </div>

      {/* Discrete 0-10 Segments */}
      <div className="mt-5 flex items-center gap-1.5">
        {Array.from({ length: 11 }, (_, i) => (
          <button
            key={i}
            disabled={readOnly}
            onClick={() => onChange?.(i)}
            className={cn(
              "flex-1 h-10 rounded-xl text-xs font-bold transition-all flex items-center justify-center shadow-xs",
              i <= currentScore
                ? i <= 3
                  ? "bg-olive text-white scale-105"
                  : i <= 6
                  ? "bg-amber text-white scale-105"
                  : "bg-coral text-white scale-105"
                : "bg-oat text-ink-muted hover:bg-line"
            )}
          >
            {i}
          </button>
        ))}
      </div>

      {/* Scale Qualifiers */}
      <div className="mt-4 grid grid-cols-5 text-center text-[10px] text-ink-muted">
        {PAIN_LEVELS.map((lvl) => (
          <div key={lvl.val} className="flex flex-col items-center">
            <span className="text-base">{lvl.emoji}</span>
            <span className="font-bold text-ink mt-1">{lvl.label}</span>
            <span className="hidden sm:inline text-[9px] text-ink-muted">{lvl.desc}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
