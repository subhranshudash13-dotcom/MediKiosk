"use client";

import { motion } from "framer-motion";
import { Check, Activity, ShieldCheck } from "lucide-react";
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
}

export function SocratesRadar({ socrates, className }: SocratesRadarProps) {
  const items = [
    { key: "site", label: "S", full: "Site / Location", value: socrates?.site },
    { key: "onset", label: "O", full: "Onset / Duration", value: socrates?.onset },
    { key: "character", label: "C", full: "Character of Pain", value: socrates?.character },
    { key: "radiation", label: "R", full: "Radiation Area", value: socrates?.radiation },
    { key: "associations", label: "A", full: "Associated Symptoms", value: socrates?.associations?.length ? socrates.associations.join(", ") : null },
    { key: "timing", label: "T", full: "Timing / Pattern", value: socrates?.timing },
    { key: "exacerbating", label: "E", full: "Exacerbating Factors", value: socrates?.exacerbating_relieving },
    { key: "severity", label: "S", full: "Severity Score", value: socrates?.severity_score ? `${socrates.severity_score}/10` : null },
  ];

  const completedCount = items.filter((i) => Boolean(i.value)).length;
  const percentage = Math.round((completedCount / items.length) * 100);

  return (
    <div className={cn("rounded-2xl border border-[#E0D7C9] bg-white p-6 shadow-subtle text-left relative overflow-hidden", className)}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#E0D7C9] pb-3.5">
        <div>
          <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#1B4332]">
            Diagnostic Intake Framework
          </p>
          <h3 className="font-heading text-base font-bold text-[#1F2421] mt-0.5">
            SOCRATES Clinical Coverage Matrix
          </h3>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-[#1B4332]">{percentage}% Structured</span>
          <div className="h-2.5 w-20 overflow-hidden rounded-full bg-[#E0D7C9]">
            <motion.div
              className="h-full bg-[#1B4332]"
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      </div>

      {/* 8-Point Grid */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {items.map((item) => {
          const isFilled = Boolean(item.value);
          return (
            <div
              key={item.key}
              className={cn(
                "rounded-xl border p-3 transition-all text-left shadow-subtle",
                isFilled
                  ? "border-[#C6E7D2] bg-[#E8F5EE] text-[#081C15]"
                  : "border-[#E0D7C9] bg-[#FBF9F5] text-[#76807A]"
              )}
            >
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    "flex h-5 w-5 items-center justify-center rounded-md text-[10px] font-bold",
                    isFilled ? "bg-[#1B4332] text-white" : "bg-[#E0D7C9] text-[#1F2421]"
                  )}
                >
                  {item.label}
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider">
                  {isFilled ? "✓ Recorded" : "Pending"}
                </span>
              </div>
              <p className="mt-2 text-xs font-bold truncate text-[#1F2421]">{item.full}</p>
              <p className="text-xs font-medium text-[#4E5752] truncate mt-0.5">
                {item.value || "—"}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
