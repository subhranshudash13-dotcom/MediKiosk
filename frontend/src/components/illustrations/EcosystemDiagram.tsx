"use client";

import { motion } from "framer-motion";
import { Mic, ShieldCheck, FileText, Stethoscope, Database, UserCheck } from "lucide-react";

export function EcosystemDiagram({ className = "" }: { className?: string }) {
  return (
    <div className={`w-full py-12 px-6 bg-white/80 backdrop-blur-sm rounded-clinical border border-forest/10 shadow-clinical ${className}`}>
      <div className="text-center max-w-lg mx-auto mb-10">
        <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-forest/50">
          SYSTEM ARCHITECTURE
        </span>
        <h3 className="text-2xl font-bold text-forest tracking-tight mt-1">
          Integrated Healthcare Ecosystem
        </h3>
        <p className="text-xs text-ink/60 mt-1 font-medium">
          A continuous visual flow connecting patient intake to structured clinical outcome and national health record.
        </p>
      </div>

      <div className="relative max-w-3xl mx-auto flex flex-col items-center">
        {/* Node 1: PATIENT */}
        <div className="z-10 flex items-center gap-3 rounded-control border border-forest/20 bg-ivory px-6 py-3 shadow-sm">
          <UserCheck className="h-4 w-4 text-forest" />
          <span className="text-xs font-bold uppercase tracking-wider text-forest">PATIENT INTAKE</span>
        </div>

        {/* Animated Connector 1 */}
        <div className="h-8 w-[2px] bg-forest/20 relative my-1 overflow-hidden">
          <motion.div
            animate={{ y: [0, 32] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
            className="w-full h-3 bg-forest rounded-full"
          />
        </div>

        {/* Node 2: MEDIKIOSK INTELLIGENCE */}
        <div className="z-10 rounded-clinical border-2 border-forest bg-forest text-ivory px-8 py-4 shadow-md text-center">
          <p className="text-[10px] font-bold uppercase tracking-widest text-mint">CORE KIOSK ENGINE</p>
          <p className="font-display text-lg font-bold">MEDIKIOSK</p>
        </div>

        {/* Animated Split Connector */}
        <div className="w-full max-w-md h-10 relative my-1">
          <svg className="w-full h-full stroke-forest/30 fill-none" strokeWidth="2">
            <path d="M 220 0 L 220 15 L 70 15 L 70 40 M 220 15 L 220 40 M 220 15 L 370 15 L 370 40" />
          </svg>
        </div>

        {/* 3 Parallel Engines: VOICE, TRIAGE, HISTORY */}
        <div className="grid grid-cols-3 gap-4 md:gap-8 w-full max-w-lg mb-2 z-10">
          <div className="rounded-data border border-forest/10 bg-ivory p-3 text-center shadow-xs">
            <Mic className="h-4 w-4 text-violet mx-auto mb-1" />
            <p className="text-[10px] font-bold uppercase text-forest">VOICE AI</p>
            <p className="text-[9px] text-ink/50">Multilingual</p>
          </div>

          <div className="rounded-data border border-forest/10 bg-ivory p-3 text-center shadow-xs">
            <ShieldCheck className="h-4 w-4 text-warning mx-auto mb-1" />
            <p className="text-[10px] font-bold uppercase text-forest">TRIAGE</p>
            <p className="text-[9px] text-ink/50">Risk Index</p>
          </div>

          <div className="rounded-data border border-forest/10 bg-ivory p-3 text-center shadow-xs">
            <FileText className="h-4 w-4 text-mint mx-auto mb-1" />
            <p className="text-[10px] font-bold uppercase text-forest">SOCRATES</p>
            <p className="text-[9px] text-ink/50">Structured</p>
          </div>
        </div>

        {/* Animated Re-Merge Connector */}
        <div className="w-full max-w-md h-10 relative my-1">
          <svg className="w-full h-full stroke-forest/30 fill-none" strokeWidth="2">
            <path d="M 70 0 L 70 25 L 220 25 L 220 40 M 220 25 L 220 40 M 370 0 L 370 25 L 220 25" />
          </svg>
        </div>

        {/* Node 3: DOCTOR WORKSPACE */}
        <div className="z-10 flex items-center gap-3 rounded-control border border-forest/20 bg-ivory px-6 py-3 shadow-sm">
          <Stethoscope className="h-4 w-4 text-coral" />
          <span className="text-xs font-bold uppercase tracking-wider text-forest">DOCTOR WORKSPACE</span>
        </div>

        {/* Animated Connector 3 */}
        <div className="h-8 w-[2px] bg-forest/20 relative my-1 overflow-hidden">
          <motion.div
            animate={{ y: [0, 32] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "linear", delay: 0.5 }}
            className="w-full h-3 bg-coral rounded-full"
          />
        </div>

        {/* Node 4: ABHA HEALTH RECORD */}
        <div className="z-10 flex items-center gap-3 rounded-control border border-forest bg-forest/10 px-6 py-3 shadow-sm">
          <Database className="h-4 w-4 text-forest" />
          <span className="text-xs font-bold uppercase tracking-wider text-forest">ABHA REPOSITORY</span>
        </div>
      </div>
    </div>
  );
}
