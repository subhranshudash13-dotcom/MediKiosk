"use client";

import Link from "next/link";
import {
  ArrowLeft,
  HeartPulse,
  Stethoscope,
  Sparkles,
  ShieldCheck,
  Building2,
  Languages
} from "lucide-react";
import { PatientVoiceWaveKiosk } from "@/components/patient/PatientVoiceWaveKiosk";

export default function KioskPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFC] text-[#111111] flex flex-col justify-between selection:bg-[#EEEAFE]">
      {/* Top Header */}
      <header className="bg-white border-b border-[#E7E4DD] px-6 py-4 sticky top-0 z-30 shadow-xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-[#E7E4DD] bg-[#FAFAFC] hover:bg-[#F5F3FF] hover:border-[#7C6EF7] text-[#5F5E5A] hover:text-[#7C6EF7] text-xs font-bold transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </Link>
            <div className="h-5 w-[1px] bg-[#E7E4DD] hidden sm:block" />
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#EEEAFE] text-[#7C6EF7] flex items-center justify-center font-bold shadow-xs">
                <HeartPulse className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-extrabold text-base text-[#111111] leading-tight">
                  Patient Voice Intake Station #04
                </h1>
                <p className="text-xs text-[#5F5E5A] flex items-center gap-1.5">
                  <span className="inline-block w-2 h-2 rounded-full bg-[#12B981] animate-pulse" />
                  Bhashini Indic ASR &bull; SOCRATES Protocol Active
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-xl bg-[#DCFCE7] text-[#12B981]">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>ABHA ID 91-4567-8901-2345 Linked</span>
            </div>
            <Link
              href="/doctor"
              className="px-3.5 py-1.5 rounded-xl bg-[#7C6EF7] hover:bg-[#6758F0] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
            >
              <Stethoscope className="w-3.5 h-3.5" />
              <span>Doctor Workstation</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Kiosk Intake Workspace */}
      <main className="max-w-6xl mx-auto w-full px-6 py-8 flex-1">
        <PatientVoiceWaveKiosk />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-[#E7E4DD] py-4 px-6 text-center text-xs text-[#5F5E5A]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>MediKiosk Patient Point-of-Entry Station &bull; SOCRATES / OPQRST Clinical Protocol</span>
          <span className="text-[#8A8A8A]">Protected by DPDP Act 2023 &bull; Ayushman Bharat Digital Mission (NHA)</span>
        </div>
      </footer>
    </div>
  );
}
