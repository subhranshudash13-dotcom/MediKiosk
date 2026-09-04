"use client";

import { motion } from "framer-motion";
import { Check, ShieldCheck } from "lucide-react";
import { DotAccent } from "@/components/illustrations/CareImagery";
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
    { key: "onset", label: "O", full: "Onset / Trigger", value: socrates?.onset },
    { key: "character", label: "C", full: "Character / Quality", value: socrates?.character },
    { key: "radiation", label: "R", full: "Radiation", value: socrates?.radiation },
    { key: "associations", label: "A", full: "Associations", value: socrates?.associations?.length ? socrates.associations.join(", ") : null },
    { key: "timing", label: "T", full: "Timing / Pattern", value: socrates?.timing },
    { key: "exacerbating", label: "E", full: "Exacerbating", value: socrates?.exacerbating_relieving },
    { key: "severity", label: "S", full: "Severity (0-10)", value: socrates?.severity_score ? `${socrates.severity_score}/10` : null },
  ];

  const completedCount = items.filter((i) => Boolean(i.value)).length;
  const percentage = Math.round((completedCount / items.length) * 100);

  return (
    <div className={cn("card-arch-top relative overflow-hidden", className)}>
      <DotAccent className="absolute top-5 right-5" />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-line/60 pb-3.5">
        <div>
          <p className="label-eyebrow">Diagnostic Completeness</p>
          <h3 className="font-serif text-lg font-bold text-ink mt-0.5">
            SOCRATES Clinical Intake Matrix
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-olive">{percentage}% Captured</span>
          <div className="h-2 w-16 overflow-hidden rounded-full bg-oat">
            <motion.div
              className="h-full bg-olive"
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
                "rounded-2xl border p-3 transition-all text-left shadow-xs",
                isFilled
                  ? "border-olive/30 bg-olive-soft/70 text-olive-deep"
                  : "border-line bg-paper text-ink-muted"
              )}
            >
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    "flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-black",
                    isFilled ? "bg-olive text-white" : "bg-oat text-ink-muted"
                  )}
                >
                  {item.label}
                </span>
                <span className="text-[9px] font-bold uppercase tracking-wider">
                  {isFilled ? "✓ Verified" : "Pending"}
                </span>
              </div>
              <p className="mt-2 text-[11px] font-bold truncate text-ink">{item.full}</p>
              <p className="text-xs font-medium text-ink-muted truncate mt-0.5">
                {item.value || "—"}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
