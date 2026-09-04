"use client";

import { motion } from "framer-motion";
import { AlertCircle, ShieldCheck, Stethoscope } from "lucide-react";

export interface TriageGaugeProps {
  score?: number; // 0 to 100
  level?: "LOW" | "MODERATE" | "HIGH";
  recommendation?: string;
  reasons?: string[];
}

export function TriageGauge({
  score = 42,
  level = "MODERATE",
  recommendation = "GENERAL PHYSICIAN",
  reasons = [
    "Chest pain reported with sub-sternal onset",
    "Moderate pain severity rating (6/10)",
    "No acute respiratory distress detected",
  ],
}: TriageGaugeProps) {
  // Angle calculation for semi-circular needle (0 to 180 degrees)
  const angle = (score / 100) * 180 - 90;

  return (
    <div className="rounded-clinical border border-forest/10 bg-white p-6 shadow-clinical space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-forest/50">
            CLINICAL DECISION SUPPORT
          </span>
          <h3 className="text-lg font-bold text-forest tracking-tight">Triage Priority Gauge</h3>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-control bg-mint/30 px-3 py-1 text-xs font-bold text-forest">
          <ShieldCheck className="h-3.5 w-3.5" /> AI Validated
        </span>
      </div>

      {/* SEMI-CIRCULAR GAUGE SVG */}
      <div className="relative flex flex-col items-center justify-center pt-2">
        <svg viewBox="0 0 200 110" className="w-56 h-auto">
          {/* Background Arc Track */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="#173B32"
            strokeOpacity="0.1"
            strokeWidth="14"
            strokeLinecap="round"
          />

          {/* Color Gradient Segments: Green (Low), Yellow (Mod), Coral (High) */}
          <path
            d="M 20 100 A 80 80 0 0 1 73 34"
            fill="none"
            stroke="#CDEFE0"
            strokeWidth="14"
            strokeLinecap="round"
          />
          <path
            d="M 73 34 A 80 80 0 0 1 127 34"
            fill="none"
            stroke="#F6C85F"
            strokeWidth="14"
          />
          <path
            d="M 127 34 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="#FF7667"
            strokeWidth="14"
            strokeLinecap="round"
          />

          {/* Animated Needle */}
          <motion.g
            initial={{ rotate: -90 }}
            animate={{ rotate: angle }}
            transition={{ type: "spring", stiffness: 60, damping: 15 }}
            style={{ originX: "100px", originY: "100px" }}
          >
            <line x1="100" y1="100" x2="100" y2="35" stroke="#173B32" strokeWidth="3" strokeLinecap="round" />
            <circle cx="100" cy="100" r="6" fill="#173B32" />
          </motion.g>
        </svg>

        {/* Score & Recommendation Text */}
        <div className="text-center -mt-3">
          <p className="text-3xl font-black text-forest font-sans">{score}</p>
          <p className="text-[11px] font-extrabold uppercase tracking-widest text-warning mt-0.5">
            {level} PRIORITY
          </p>
          <div className="mt-2 inline-flex items-center gap-1.5 rounded-data bg-forest/5 px-3 py-1 text-xs font-bold text-forest">
            <Stethoscope className="h-3.5 w-3.5 text-forest" />
            {recommendation}
          </div>
        </div>
      </div>

      {/* WHY THIS PRIORITY REASONING */}
      <div className="border-t border-forest/10 pt-4 space-y-2">
        <p className="text-[10px] font-bold uppercase tracking-widest text-ink/50">
          WHY THIS PRIORITY?
        </p>
        <ul className="space-y-1.5">
          {reasons.map((reason, idx) => (
            <li key={idx} className="flex items-start gap-2 text-xs font-medium text-ink/80">
              <span className="h-1.5 w-1.5 rounded-full bg-forest mt-1.5 shrink-0" />
              {reason}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
