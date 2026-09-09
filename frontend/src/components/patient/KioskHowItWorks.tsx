"use client";

import React from "react";
import Link from "next/link";
import {
  Languages,
  Mic,
  Activity,
  FileText,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  QrCode,
  Clock,
  Check
} from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  {
    step: "1",
    title: "Language & Identity",
    subtitle: "8 Indic Languages & ABHA",
    description: "Choose native tongue and verify digital ABHA ID with 1-touch OTP.",
    icon: Languages,
    accent: "text-sky-400 border-sky-500/30 bg-sky-500/10",
    visual: (
      <div className="space-y-2 text-left">
        <div className="flex gap-1">
          <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-medium text-slate-200 border border-slate-700">हिंदी</span>
          <span className="px-2 py-0.5 rounded bg-blue-600 text-[10px] font-semibold text-white">English</span>
          <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-medium text-slate-200 border border-slate-700">తెలుగు</span>
        </div>
        <div className="p-2 rounded-lg bg-slate-900/90 border border-slate-800 flex items-center justify-between text-[11px]">
          <div>
            <span className="text-[9px] text-emerald-400 font-mono block">ABHA #91-4567-8901</span>
            <span className="text-white font-medium text-[11px]">Ananya Sharma</span>
          </div>
          <span className="text-[9px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">Verified</span>
        </div>
      </div>
    )
  },
  {
    step: "2",
    title: "Spoken Dialogue",
    subtitle: "Conversational AI Speech",
    description: "Speak naturally in vernacular tone; acoustic AI extracts symptoms in real time.",
    icon: Mic,
    accent: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
    visual: (
      <div className="space-y-2 text-left">
        <div className="p-1.5 rounded-lg bg-slate-900/90 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] text-slate-300 font-medium">Recording</span>
          </div>
          <span className="text-[10px] font-mono text-slate-400">00:18</span>
        </div>
        <p className="text-[10px] text-slate-300 italic bg-slate-900/60 p-2 rounded-lg border border-slate-800 leading-snug truncate">
          &ldquo;छाती में भारीपन और हल्का दर्द...&rdquo;
        </p>
      </div>
    )
  },
  {
    step: "3",
    title: "Pain & SOCRATES",
    subtitle: "8-Axis Clinical Rating",
    description: "Standard Wong-Baker 0–10 scale & automated clinical matrix mapping.",
    icon: Activity,
    accent: "text-amber-400 border-amber-500/30 bg-amber-500/10",
    visual: (
      <div className="space-y-2 text-left">
        <div className="flex items-center justify-between p-1.5 rounded-lg bg-slate-900/90 border border-slate-800 text-[10px]">
          <span className="text-slate-400 font-medium">Pain Score:</span>
          <span className="font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
            6 / 10 (Moderate)
          </span>
        </div>
        <div className="grid grid-cols-2 gap-1 text-[9px]">
          <span className="p-1.5 rounded bg-slate-900/80 border border-slate-800 text-slate-300 truncate">
            Site: Precordium
          </span>
          <span className="p-1.5 rounded bg-slate-900/80 border border-slate-800 text-slate-300 truncate">
            Onset: 2 Days
          </span>
        </div>
      </div>
    )
  },
  {
    step: "4",
    title: "Prescription OCR",
    subtitle: "Optical Ingestion",
    description: "Hold physical prescriptions to the scanner; AI extracts active meds in seconds.",
    icon: FileText,
    accent: "text-purple-400 border-purple-500/30 bg-purple-500/10",
    visual: (
      <div className="space-y-1.5 text-left text-[10px]">
        <div className="p-1.5 rounded-lg bg-slate-900/90 border border-slate-800 flex items-center justify-between">
          <span className="text-white font-medium truncate">Paracetamol 650mg</span>
          <span className="text-[9px] text-purple-300 font-mono">1-0-1</span>
        </div>
        <div className="p-1.5 rounded-lg bg-slate-900/90 border border-slate-800 flex items-center justify-between">
          <span className="text-white font-medium truncate">Pantoprazole 40mg</span>
          <span className="text-[9px] text-purple-300 font-mono">1-0-0</span>
        </div>
      </div>
    )
  },
  {
    step: "5",
    title: "Digital OPD Token",
    subtitle: "Zero-Wait Handover",
    description: "Instant token receipt with QR queue tracking and pre-consultation storyboard sync.",
    icon: CheckCircle2,
    accent: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
    visual: (
      <div className="p-2 rounded-lg bg-gradient-to-r from-blue-900/80 to-blue-800/80 border border-blue-700/60 flex items-center justify-between text-left">
        <div>
          <span className="text-[9px] font-mono text-blue-200 block">TOKEN #A-104</span>
          <span className="text-[11px] font-bold text-white block">Room 302</span>
          <span className="text-[9px] text-blue-200 flex items-center gap-1 mt-0.5">
            <Clock className="w-2.5 h-2.5" /> ~4 min wait
          </span>
        </div>
        <div className="w-8 h-8 rounded bg-white/10 p-0.5 flex items-center justify-center">
          <QrCode className="w-6 h-6 text-white" />
        </div>
      </div>
    )
  },
];

export function KioskHowItWorks() {
  return (
    <section className="py-10 sm:py-12 px-4 sm:px-6 lg:px-8 bg-[#0B1120] text-white border-b border-slate-800/80 text-left relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        
        {/* Compact Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-4 border-b border-slate-800/80 gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-400 font-mono">
                Patient Workflow
              </span>
            </div>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-white mt-1 tracking-tight">
              How the Patient Kiosk Works
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md leading-relaxed">
            From arrival to doctor consultation in 5 guided, automated intake steps.
          </p>
        </div>

        {/* 5-Step Compact Single-Fold Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {STEPS.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.step}
                className="rounded-2xl bg-[#111928] border border-slate-800/90 p-4 flex flex-col justify-between hover:border-slate-700 transition-all text-left shadow-xs"
              >
                {/* Step Number & Title */}
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-xs font-bold text-slate-400 font-mono">
                      Step 0{s.step}
                    </span>
                    <div className={cn("p-1.5 rounded-lg border", s.accent)}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  <h3 className="font-heading text-sm font-bold text-white leading-snug">
                    {s.title}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-1 leading-normal line-clamp-2">
                    {s.description}
                  </p>
                </div>

                {/* Embedded Mini UI Mockup */}
                <div className="mt-4 pt-3 border-t border-slate-800/80">
                  {s.visual}
                </div>
              </div>
            );
          })}
        </div>

        {/* Subtle Bottom Action Bar */}
        <div className="mt-6 pt-4 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>ABDM Integrated • Average intake completed in under 3 minutes</span>
          </div>

          <Link
            href="/kiosk/intake"
            className="inline-flex items-center gap-1.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 text-xs font-semibold transition-all"
          >
            <span>Start Live Intake</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>
    </section>
  );
}
