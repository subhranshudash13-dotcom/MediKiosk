"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Clock } from "lucide-react";

export interface SocratesNode {
  key: string;
  label: string;
  value: string;
  status: "verified" | "captured" | "asking" | "pending";
}

const DEFAULT_SOCRATES: SocratesNode[] = [
  { key: "S", label: "Site", value: "Thorax / Sub-sternal", status: "verified" },
  { key: "O", label: "Onset", value: "3 days ago (gradual)", status: "verified" },
  { key: "C", label: "Character", value: "Constricting pressure", status: "asking" },
  { key: "R", label: "Radiation", value: "Non-radiating", status: "pending" },
  { key: "A", label: "Associated", value: "Diaphoresis & Fever", status: "pending" },
  { key: "T", label: "Timing", value: "Nocturnal spikes", status: "pending" },
  { key: "E", label: "Exacerbating", value: "Worse on exertion", status: "pending" },
  { key: "S", label: "Severity", value: "7 / 10 Pain Index", status: "pending" },
];

export function SocratesHorizontalProgress({ nodes = DEFAULT_SOCRATES }: { nodes?: SocratesNode[] }) {
  return (
    <div className="w-full py-8 px-4 bg-white/70 backdrop-blur-sm rounded-clinical border border-forest/10 shadow-clinical">
      <div className="flex items-center justify-between mb-8 px-2">
        <div>
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-forest/50">
            CLINICAL FRAMEWORK
          </span>
          <h3 className="text-xl font-bold text-forest tracking-tight mt-0.5">
            SOCRATES Structured Progression
          </h3>
        </div>
        <div className="flex items-center gap-4 text-xs font-bold">
          <span className="flex items-center gap-1.5 text-forest">
            <span className="h-2.5 w-2.5 rounded-full bg-forest" /> Verified
          </span>
          <span className="flex items-center gap-1.5 text-warning">
            <span className="h-2.5 w-2.5 rounded-full bg-warning animate-pulse" /> Active Node
          </span>
          <span className="flex items-center gap-1.5 text-ink/30">
            <span className="h-2.5 w-2.5 rounded-full border border-ink/20" /> Pending
          </span>
        </div>
      </div>

      {/* HORIZONTAL TIMELINE SPINES & NODES */}
      <div className="relative flex items-center justify-between px-6 py-4">
        {/* Background Connecting Line */}
        <div className="absolute left-10 right-10 top-1/2 -translate-y-1/2 h-[2px] bg-forest/15 -z-0" />

        {nodes.map((node, i) => {
          const isVerified = node.status === "verified";
          const isCaptured = node.status === "captured";
          const isAsking = node.status === "asking";

          return (
            <div key={i} className="relative z-10 flex flex-col items-center group cursor-pointer">
              {/* Top Letter Label */}
              <span className={`font-mono text-xs font-bold mb-3 transition-colors ${
                isVerified || isCaptured ? "text-forest" : isAsking ? "text-warning font-black" : "text-ink/30"
              }`}>
                {node.key}
              </span>

              {/* Node Node Circle */}
              <motion.div
                whileHover={{ scale: 1.15 }}
                className={`h-9 w-9 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                  isVerified
                    ? "bg-forest border-forest text-ivory shadow-md"
                    : isCaptured
                    ? "bg-mint border-forest text-forest"
                    : isAsking
                    ? "bg-warning/20 border-warning text-warning shadow-sm animate-pulse"
                    : "bg-ivory border-ink/20 text-ink/30"
                }`}
              >
                {isVerified ? (
                  <CheckCircle2 className="h-4 w-4 stroke-[3]" />
                ) : isAsking ? (
                  <Clock className="h-4 w-4 animate-spin" />
                ) : (
                  <span className="text-[11px] font-bold">{i + 1}</span>
                )}
              </motion.div>

              {/* Bottom Clinical Label & Detail */}
              <div className="mt-3 text-center min-w-[70px] max-w-[90px]">
                <p className={`text-[11px] font-bold leading-tight ${
                  isVerified || isCaptured ? "text-forest" : isAsking ? "text-warning" : "text-ink/40"
                }`}>
                  {node.label}
                </p>
                <p className="text-[10px] text-ink/60 truncate font-medium mt-0.5">
                  {node.value}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
