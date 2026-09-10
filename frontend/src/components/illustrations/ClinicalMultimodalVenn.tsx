"use client";

import React from "react";
import {
  Mic,
  FileScan,
  ShieldCheck,
  Cpu,
  Activity,
  Sparkles,
  CheckCircle2,
  TrendingUp,
  Layers,
  ArrowRight,
  ShieldAlert
} from "lucide-react";
import { cn } from "@/lib/utils";

export function ClinicalMultimodalVenn() {
  return (
    <div className="relative w-full text-left select-none">
      
      {/* Background Ambient Glow Orbs */}
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

      {/* Enhanced Bento Grid with Realistic Photography on Top & Data on Bottom */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
        
        {/* ========================================================================= */}
        {/* BENTO CARD 1: Core Autonomous Engine (Hero Card - Spans 2 cols on lg) */}
        {/* ========================================================================= */}
        <div className="lg:col-span-2 rounded-2xl bg-slate-900/90 border border-slate-800 text-white shadow-xl flex flex-col justify-between overflow-hidden group hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 backdrop-blur-md">
          
          {/* Top Image Banner with Overlay Badge */}
          <div className="relative w-full h-56 sm:h-64 overflow-hidden bg-slate-950">
            <img
              src="/images/doctor_cockpit_view.jpg"
              alt="Physician utilizing MediKiosk clinical cockpit"
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 opacity-85"
            />
            {/* Cinematic Gradient Vignette */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-black/30" />
            
            {/* Top Floating Badge */}
            <div className="absolute top-3.5 left-3.5 flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-blue-600/90 text-white border border-blue-400/40 backdrop-blur-md shadow-md flex items-center gap-1.5">
                <Cpu className="w-3 h-3 text-[#38BDF8]" />
                Central Synthesis Nexus
              </span>
            </div>

            {/* Live Indicator */}
            <div className="absolute top-3.5 right-3.5 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-950/80 border border-white/10 text-[10px] font-mono text-emerald-400 backdrop-blur-md">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Live Engine</span>
            </div>
          </div>

          {/* Bottom Structured Content & KPIs */}
          <div className="p-6 sm:p-7 space-y-5 flex-1 flex flex-col justify-between">
            <div className="space-y-2">
              <h4 className="font-heading text-xl sm:text-2xl font-bold text-white tracking-tight group-hover:text-blue-300 transition-colors">
                Autonomous Clinical Fusion Engine
              </h4>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
                Synthesizes patient vernacular voice, handwritten prescriptions, and historical ABHA EMR records into validated consultation summaries in seconds.
              </p>
            </div>

            {/* Key Metrics Grid */}
            <div className="pt-4 border-t border-slate-800/90 grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="bg-slate-950/60 p-3 rounded-xl border border-white/5">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Avg Intake Time</span>
                <span className="text-xl sm:text-2xl font-extrabold font-heading text-white mt-0.5 block">2.8 min</span>
                <span className="text-[10px] text-emerald-400 font-medium mt-0.5 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 inline" /> vs 15m manual OPD
                </span>
              </div>
              <div className="bg-slate-950/60 p-3 rounded-xl border border-white/5">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Queue Reduction</span>
                <span className="text-xl sm:text-2xl font-extrabold font-heading text-[#38BDF8] mt-0.5 block">68%</span>
                <span className="text-[10px] text-slate-400 font-medium mt-0.5 block">Peak load optimized</span>
              </div>
              <div className="col-span-2 sm:col-span-1 bg-slate-950/60 p-3 rounded-xl border border-white/5">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Extraction Protocol</span>
                <span className="text-xs font-bold text-slate-200 mt-1.5 block">Zero-Hallucination SOCRATES</span>
                <span className="text-[10px] text-blue-300 font-medium mt-0.5 block">8-Axis Triangulated</span>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* BENTO CARD 2: Indic Voice Intelligence */}
        {/* ========================================================================= */}
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 text-white shadow-lg flex flex-col justify-between overflow-hidden group hover:border-cyan-500/50 hover:shadow-xl hover:shadow-cyan-500/10 transition-all duration-300 backdrop-blur-md">
          
          {/* Top Image Banner */}
          <div className="relative w-full h-48 overflow-hidden bg-slate-950">
            <img
              src="/images/kiosk_patient_experience.jpg"
              alt="Indian patient speaking vernacular language at hospital kiosk"
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 opacity-85"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/35 to-black/30" />
            
            <div className="absolute top-3.5 left-3.5">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-cyan-600/90 text-white border border-cyan-400/40 backdrop-blur-md shadow-md flex items-center gap-1.5">
                <Mic className="w-3 h-3 text-cyan-200" />
                Bhashini IndicASR
              </span>
            </div>
          </div>

          {/* Bottom Content */}
          <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
            <div className="space-y-1.5">
              <h4 className="font-heading text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                Indic Voice Intelligence
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Fine-tuned speech models across 8+ Indian regional languages with hospital ambient noise suppression and dual-engine fallback.
              </p>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase block">Dialect Accuracy</span>
                <span className="text-xl font-extrabold font-heading text-[#38BDF8]">98.4%</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">Languages</span>
                <span className="text-xs font-mono font-bold text-slate-300">Hindi, Ta, Te, Mr, Bn</span>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* BENTO CARD 3: Prescription Vision OCR */}
        {/* ========================================================================= */}
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 text-white shadow-lg flex flex-col justify-between overflow-hidden group hover:border-sky-400/50 hover:shadow-xl hover:shadow-sky-500/10 transition-all duration-300 backdrop-blur-md">
          
          {/* Top Image Banner */}
          <div className="relative w-full h-48 overflow-hidden bg-slate-950">
            <img
              src="/images/prescription_ocr_vision.jpg"
              alt="Prescription optical handwriting analysis"
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 opacity-85"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/35 to-black/30" />
            
            <div className="absolute top-3.5 left-3.5">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-sky-600/90 text-white border border-sky-400/40 backdrop-blur-md shadow-md flex items-center gap-1.5">
                <FileScan className="w-3 h-3 text-sky-200" />
                Vision Document AI
              </span>
            </div>
          </div>

          {/* Bottom Content */}
          <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
            <div className="space-y-1.5">
              <h4 className="font-heading text-lg font-bold text-white group-hover:text-sky-300 transition-colors">
                Prescription Vision OCR
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Optical parsing of handwritten doctor prescriptions, dosages, lab abnormal biomarkers, and pharmacological intent mapping.
              </p>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase block">Handwriting Recall</span>
                <span className="text-xl font-extrabold font-heading text-[#38BDF8]">96.8%</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">Sync Mode</span>
                <span className="text-xs font-mono font-bold text-slate-300">Active Drug Sync</span>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* BENTO CARD 4: ABDM & FHIR R4 Grid */}
        {/* ========================================================================= */}
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 text-white shadow-lg flex flex-col justify-between overflow-hidden group hover:border-emerald-500/50 hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300 backdrop-blur-md">
          
          {/* Top Image Banner */}
          <div className="relative w-full h-48 overflow-hidden bg-slate-950">
            <img
              src="/images/bento_abha_stack.jpg"
              alt="Indian patient ABHA card and biometric verification at hospital desk"
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 opacity-85"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/35 to-black/30" />
            
            <div className="absolute top-3.5 left-3.5">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-600/90 text-white border border-emerald-400/40 backdrop-blur-md shadow-md flex items-center gap-1.5">
                <ShieldCheck className="w-3 h-3 text-emerald-200" />
                National Health Stack
              </span>
            </div>
          </div>

          {/* Bottom Content */}
          <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
            <div className="space-y-1.5">
              <h4 className="font-heading text-lg font-bold text-white group-hover:text-emerald-300 transition-colors">
                ABDM &amp; FHIR R4 Grid
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                14-digit ABHA ID authentication, DPDP Act 2023 consent ledger, and interoperable health record federation into hospital EHR.
              </p>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase block">FHIR R4 / ABHA</span>
                <span className="text-xl font-extrabold font-heading text-[#34D399]">100%</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">Compliance</span>
                <span className="text-xs font-mono font-bold text-slate-300">NHA M1/M2/M3</span>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* BENTO CARD 5: Cross-Modal Safety Guardrails */}
        {/* ========================================================================= */}
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 text-white shadow-lg flex flex-col justify-between overflow-hidden group hover:border-indigo-400/50 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 backdrop-blur-md">
          
          {/* Top Image Banner */}
          <div className="relative w-full h-48 overflow-hidden bg-slate-950">
            <img
              src="/images/bento_clinical_guardrails.jpg"
              alt="Physician monitoring real-time telemetry and red-flag clinical alerts"
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 opacity-85"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/35 to-black/30" />
            
            <div className="absolute top-3.5 left-3.5">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-indigo-600/90 text-white border border-indigo-400/40 backdrop-blur-md shadow-md flex items-center gap-1.5">
                <Activity className="w-3 h-3 text-indigo-200" />
                Safety Cross-Check
              </span>
            </div>
          </div>

          {/* Bottom Content */}
          <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
            <div className="space-y-1.5">
              <h4 className="font-heading text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">
                Cross-Modal Guardrails
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Reconciles spoken verbal symptoms against physical prescriptions to catch dosage mismatches, contraindications, and emergency red flags.
              </p>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase block">Discrepancy Capture</span>
                <span className="text-xl font-extrabold font-heading text-indigo-300">99.1%</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">Safety Recall</span>
                <span className="text-xs font-mono font-bold text-slate-300">100% Emergency Recall</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
