"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/auth-store";
import { motion } from "framer-motion";
import {
  Mic,
  Play,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Stethoscope,
  Activity,
  FileText,
  Layers,
  ArrowRight,
  Tablet,
  Laptop,
  Smartphone
} from "lucide-react";

export function KioskHeroShowcase() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  const handleStartIntake = (e: React.MouseEvent) => {
    if (!isAuthenticated) {
      e.preventDefault();
      router.push("/patient/login?returnUrl=/kiosk/intake");
    } else {
      router.push("/kiosk/intake");
    }
  };
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#003882] via-[#0056B3] to-[#0070EB] text-white py-14 sm:py-20 px-4 sm:px-6 lg:px-8 border-b border-[#0047AB]">
      {/* Subtle Background Glow Circles */}
      <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white/10 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-24 w-96 h-96 rounded-full bg-[#17A2B8]/20 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Main 2-Column Split Layout: Left Text & Right Device Mockups */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center text-left">
          
          {/* LEFT COLUMN: Text Content & CTAs (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Top Product Pill */}
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 px-4 py-1.5 text-xs font-semibold tracking-wide text-white shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-[#38BDF8]" /> Multilingual Voice Intake &amp; Triage
            </div>

            {/* Main Headline */}
            <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Generative AI Solutions for Patient Kiosks
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-white/90 leading-relaxed font-normal">
              Revolutionize healthcare with our Gen AI solutions — improving patient care, diagnostics, and operational efficiency.
            </p>

            {/* Action CTAs */}
            <div className="pt-2 flex flex-wrap items-center gap-3.5">
              <button
                type="button"
                onClick={handleStartIntake}
                className="rounded-full bg-white hover:bg-[#F0F7FF] text-[#0056B3] font-bold text-xs sm:text-sm px-8 py-3.5 shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
              >
                <Mic className="w-4 h-4 text-[#0056B3]" />
                <span>Start Kiosk Intake</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN: Multi-Device Dashboard Mockup (7 cols) */}
          <div className="lg:col-span-7 relative">
            <div className="rounded-3xl bg-white/10 p-3 sm:p-5 border border-white/20 backdrop-blur-md shadow-2xl relative">
              
              {/* Outer Screen Shell */}
              <div className="relative rounded-2xl bg-[#0F172A] border border-slate-700/80 overflow-hidden shadow-inner min-h-[360px] sm:min-h-[420px] p-3 sm:p-6 flex items-center justify-center">
                
                {/* Device 1: Web App Laptop (Center Background) */}
                <div className="w-full rounded-xl bg-white text-[#1E293B] shadow-2xl border border-slate-200 overflow-hidden text-left relative z-10">
                  {/* Browser bar */}
                  <div className="bg-[#F1F5F9] border-b border-slate-200 px-3 py-2 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                      <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
                    </div>
                    <div className="bg-white px-4 py-0.5 rounded text-[10px] font-mono text-slate-500 border border-slate-200 truncate max-w-[200px]">
                      medikiosk.health/doctor/storyboard
                    </div>
                    <span className="text-[9px] font-bold text-[#0056B3] bg-[#EBF5FF] px-2 py-0.5 rounded flex items-center gap-1">
                      <Laptop className="w-2.5 h-2.5" /> WEB APP
                    </span>
                  </div>

                  {/* Dashboard Inner Content */}
                  <div className="p-3 sm:p-4 grid grid-cols-12 gap-3 text-xs">
                    {/* Left Mini Sidebar inside Mockup */}
                    <div className="col-span-4 border-r border-slate-100 pr-2 space-y-1.5 hidden sm:block">
                      <div className="p-1.5 rounded-lg bg-[#F0F7FF] text-[#0056B3] font-bold text-[10px] flex items-center gap-1.5">
                        <Stethoscope className="w-3.5 h-3.5" />
                        <span>Medical History</span>
                      </div>
                      <div className="p-1.5 rounded-lg text-slate-600 font-medium text-[10px] flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5 text-slate-400" />
                        <span>Vitals &amp; Labs</span>
                      </div>
                      <div className="p-1.5 rounded-lg text-slate-600 font-medium text-[10px] flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-slate-400" />
                        <span>Symptoms &amp; AI</span>
                      </div>
                      <div className="p-1.5 rounded-lg text-slate-600 font-medium text-[10px] flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-slate-400" />
                        <span>Prescriptions</span>
                      </div>
                    </div>

                    {/* Main Patient Briefing Area */}
                    <div className="col-span-12 sm:col-span-8 space-y-2">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                        <div>
                          <h4 className="font-bold text-xs sm:text-sm text-[#1E293B]">Ananya Sharma • 28 F</h4>
                          <p className="text-[9px] text-slate-500">ABHA: 91-4567-8901-2345 • Token: #A-104</p>
                        </div>
                        <span className="rounded-full bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 text-[9px] font-bold">
                          Priority Care
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-1.5">
                        <div className="bg-[#F8F9FA] p-1.5 rounded-lg border border-slate-200">
                          <span className="text-[8px] uppercase font-bold text-slate-400 block">Complaint</span>
                          <p className="text-[10px] font-bold text-[#1E293B] truncate">Sub-sternal Chest Pain</p>
                        </div>
                        <div className="bg-[#F8F9FA] p-1.5 rounded-lg border border-slate-200">
                          <span className="text-[8px] uppercase font-bold text-slate-400 block">Severity</span>
                          <p className="text-[10px] font-bold text-[#0056B3]">6 / 10 (Moderate)</p>
                        </div>
                      </div>

                      <div className="bg-[#F0F7FF] p-2 rounded-lg border border-[#0056B3]/20">
                        <span className="text-[8px] uppercase font-bold text-[#0056B3] block">AI Narrative:</span>
                        <p className="text-[10px] text-[#1E293B] leading-tight">
                          “Chest discomfort radiating to shoulder for 2 days. Prior DOTS TB (2022). OCR confirmed Amlodipine 5mg.”
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Device 2: Mobile Smartphone (Floating Front Center-Left) */}
                <div className="absolute -bottom-4 left-4 sm:left-8 w-44 sm:w-52 rounded-2xl bg-white text-[#1E293B] shadow-2xl border-2 border-slate-800 p-2.5 text-left z-20 hidden md:block transform hover:-translate-y-1 transition-transform">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-1 mb-1.5">
                    <div className="flex items-center gap-1">
                      <Smartphone className="w-3 h-3 text-[#0056B3]" />
                      <span className="text-[8px] font-bold uppercase text-[#0056B3]">IOS &amp; ANDROID</span>
                    </div>
                    <span className="text-[7px] bg-green-100 text-green-800 font-bold px-1.5 py-0.2 rounded">Live Sync</span>
                  </div>
                  <div className="bg-[#F8F9FA] p-1.5 rounded-lg border border-slate-200 mb-1.5">
                    <span className="text-[7px] text-slate-400 uppercase font-bold block">Patient Pre-Intake</span>
                    <p className="text-[9px] font-bold text-[#1E293B]">Ready for Consultation</p>
                    <p className="text-[7px] text-slate-500">Token #A-104 • Room 12</p>
                  </div>
                  <div className="h-1 bg-green-500 rounded-full w-3/4 mb-1" />
                  <span className="text-[7px] text-slate-400 font-medium">ABHA Linked &bull; Voice Verified</span>
                </div>

                {/* Device 3: Tablet / iPad Mockup (Floating Front Right) */}
                <div className="absolute -bottom-3 right-4 sm:right-8 w-48 sm:w-56 rounded-2xl bg-white text-[#1E293B] shadow-2xl border-2 border-slate-800 p-2.5 text-left z-20 hidden lg:block transform hover:-translate-y-1 transition-transform">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-1 mb-1.5">
                    <div className="flex items-center gap-1">
                      <Tablet className="w-3 h-3 text-[#0056B3]" />
                      <span className="text-[8px] font-bold uppercase text-[#0056B3]">IPAD / KIOSK</span>
                    </div>
                    <span className="text-[7px] bg-blue-100 text-[#0056B3] font-bold px-1.5 py-0.2 rounded">Touch</span>
                  </div>
                  <div className="space-y-1 text-[9px]">
                    <div className="flex items-center justify-between bg-[#F8F9FA] p-1 rounded border border-slate-200">
                      <span className="font-semibold text-slate-600">Body Map Zone:</span>
                      <span className="font-bold text-[#0056B3]">Thorax / Chest</span>
                    </div>
                    <div className="flex items-center justify-between bg-[#F8F9FA] p-1 rounded border border-slate-200">
                      <span className="font-semibold text-slate-600">Prescription OCR:</span>
                      <span className="font-bold text-green-700">2 Drugs Extracted</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>



      </div>
    </section>
  );
}
