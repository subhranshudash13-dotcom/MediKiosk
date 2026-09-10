"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Mic,
  FileScan,
  ShieldCheck,
  Cpu,
  Activity,
  CheckCircle2,
  Sparkles,
  Zap,
  Globe2,
  ArrowUpRight
} from "lucide-react";
import { cn } from "@/lib/utils";

export function ClinicalMultimodalVenn() {
  return (
    <div className="relative w-full text-left select-none">
      
      {/* Background Cinematic Glow Orbs matching Hero */}
      <div className="absolute top-0 left-1/4 -translate-y-1/2 w-96 h-96 bg-[#0056B3]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 translate-y-1/2 w-96 h-96 bg-[#17A2B8]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#38BDF8_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

      {/* Section Header */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800/80 pb-6 mb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white text-xs font-semibold backdrop-blur-md mb-2.5">
            <Sparkles className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span>AI Convergence Architecture</span>
          </div>
          <h3 className="font-heading text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Why MediKiosk is Uniquely Positioned
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Triple-stream multimodal synthesis across Indic vernacular voice, handwriting vision OCR, and the ABDM health grid.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-400">
          <span className="w-2 h-2 rounded-full bg-[#34D399] animate-pulse" />
          <span>Real-Time Clinical Fusion Active</span>
        </div>
      </div>

      {/* Modern Dark Bento Grid Layout */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        
        {/* Bento Box 1: Core Autonomous Engine (Hero Card - Spans 2 cols on lg) */}
        <div className="lg:col-span-2 p-6 sm:p-7 rounded-2xl bg-gradient-to-br from-blue-900/50 via-slate-900/90 to-slate-950 border border-blue-500/40 text-white shadow-xl flex flex-col justify-between space-y-6 group hover:border-blue-400 hover:shadow-blue-500/10 transition-all duration-300 relative overflow-hidden backdrop-blur-md">
          {/* Subtle Inner Highlight */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="space-y-3 relative z-10">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 backdrop-blur-xs">
                Central Synthesis Nexus
              </span>
              <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Cpu className="w-5 h-5 text-[#38BDF8]" />
              </div>
            </div>

            <div>
              <h4 className="font-heading text-xl sm:text-2xl font-bold text-white tracking-tight">
                Autonomous Clinical Fusion Engine
              </h4>
              <p className="text-xs sm:text-sm text-slate-300 mt-1.5 leading-relaxed max-w-xl">
                Synthesizes patient vernacular voice, handwritten prescriptions, and historical ABHA EMR records into validated consultation summaries in seconds.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-3 gap-4 relative z-10">
            <div>
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Avg Intake Time</span>
              <span className="text-2xl font-extrabold font-heading text-white mt-0.5 block">2.8 min</span>
            </div>
            <div>
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Queue Reduction</span>
              <span className="text-2xl font-extrabold font-heading text-[#38BDF8] mt-0.5 block">68%</span>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Extraction Model</span>
              <span className="text-xs font-bold text-slate-200 mt-1.5 block">Zero-Hallucination SOCRATES</span>
            </div>
          </div>
        </div>

        {/* Bento Box 2: Indic Voice Intelligence */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 text-white shadow-lg flex flex-col justify-between space-y-4 hover:border-cyan-500/60 hover:shadow-cyan-500/10 transition-all duration-300 group backdrop-blur-md">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                Bhashini ASR
              </span>
              <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-[#38BDF8] flex items-center justify-center group-hover:scale-110 transition-transform">
                <Mic className="w-4 h-4" />
              </div>
            </div>

            <div>
              <h4 className="font-heading text-lg font-bold text-white group-hover:text-[#38BDF8] transition-colors">
                Indic Voice Intelligence
              </h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Fine-tuned speech models across 8+ Indian regional languages with hospital ambient noise suppression.
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono text-slate-400 uppercase block">Dialect Accuracy</span>
              <span className="text-xl font-extrabold font-heading text-[#38BDF8]">98.4%</span>
            </div>
            <span className="text-[11px] font-mono font-bold text-slate-400">Hindi, Tamil, Te, Mr, Bn</span>
          </div>
        </div>

        {/* Bento Box 3: Prescription Vision OCR */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 text-white shadow-lg flex flex-col justify-between space-y-4 hover:border-sky-400/60 hover:shadow-sky-500/10 transition-all duration-300 group backdrop-blur-md">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-sky-500/15 text-sky-300 border border-sky-500/30">
                Document AI
              </span>
              <div className="w-8 h-8 rounded-xl bg-sky-500/15 border border-sky-500/30 text-[#38BDF8] flex items-center justify-center group-hover:scale-110 transition-transform">
                <FileScan className="w-4 h-4" />
              </div>
            </div>

            <div>
              <h4 className="font-heading text-lg font-bold text-white group-hover:text-sky-300 transition-colors">
                Prescription Vision OCR
              </h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Optical parsing of handwritten doctor prescriptions, dosages, lab abnormal biomarkers, and pharmacological intent.
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono text-slate-400 uppercase block">Handwriting OCR</span>
              <span className="text-xl font-extrabold font-heading text-[#38BDF8]">96.8%</span>
            </div>
            <span className="text-[11px] font-mono font-bold text-slate-400">Active Drug Sync</span>
          </div>
        </div>

        {/* Bento Box 4: ABDM & Health Stack */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 text-white shadow-lg flex flex-col justify-between space-y-4 hover:border-emerald-500/60 hover:shadow-emerald-500/10 transition-all duration-300 group backdrop-blur-md">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                National Health Stack
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-[#34D399] flex items-center justify-center group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>

            <div>
              <h4 className="font-heading text-lg font-bold text-white group-hover:text-emerald-300 transition-colors">
                ABDM &amp; FHIR R4 Grid
              </h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                14-digit ABHA ID authentication, DPDP Act 2023 consent ledger, and interoperable health record federation.
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono text-slate-400 uppercase block">FHIR R4 / ABHA</span>
              <span className="text-xl font-extrabold font-heading text-[#34D399]">100%</span>
            </div>
            <span className="text-[11px] font-mono font-bold text-slate-400">NHA M1/M2/M3</span>
          </div>
        </div>

        {/* Bento Box 5: Cross-Modal Safety Guardrails */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 text-white shadow-lg flex flex-col justify-between space-y-4 hover:border-indigo-400/60 hover:shadow-indigo-500/10 transition-all duration-300 group backdrop-blur-md">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                Safety Cross-Check
              </span>
              <div className="w-8 h-8 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Activity className="w-4 h-4" />
              </div>
            </div>

            <div>
              <h4 className="font-heading text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">
                Cross-Modal Guardrails
              </h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Reconciles spoken verbal symptoms against physical prescriptions to catch dosage mismatches and red flags.
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono text-slate-400 uppercase block">Discrepancy Capture</span>
              <span className="text-xl font-extrabold font-heading text-indigo-300">99.1%</span>
            </div>
            <span className="text-[11px] font-mono font-bold text-slate-400">Zero Red-Flag Leak</span>
          </div>
        </div>

      </div>
    </div>
  );
}
