"use client";

import React from "react";
import {
  FileText,
  Sparkles,
  Search,
  CheckCircle2,
  AlertTriangle,
  QrCode,
  ShieldCheck,
  ChevronRight,
  FolderOpen
} from "lucide-react";
import { cn } from "@/lib/utils";

const LAB_REPORTS = [
  { name: "RBC", range: "52 - 68 million/mm³", value: "55", status: "Normal", isHigh: false },
  { name: "ALT", range: "<40.0 U/L", value: "80", status: "High", isHigh: true },
  { name: "URIC ACID", range: "3.2 - 6.1 mg/dL", value: "4.70", status: "Normal", isHigh: false },
  { name: "HDL CHOLESTEROL", range: "<13.10 - 17.10 g/dL", value: "8.20", status: "Normal", isHigh: false },
  { name: "VLDL", range: "<13.10 - 17.10 g/dL", value: "8.20", status: "Normal", isHigh: false },
  { name: "Basophils", range: "0.0 - 1.0%", value: "0.10%", status: "Normal", isHigh: false },
  { name: "TRANSFERRIN", range: "171.0 - 302.0 mg/dL", value: "332", status: "High", isHigh: true },
];

export function KioskDataOrganizeShowcase() {
  return (
    <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-[#FDF9F3] border-b border-[#F0E6D8] text-left relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* Left Column: Value Proposition & Feature Cards (7 cols) */}
          <div className="lg:col-span-6 space-y-6">
            {/* Folder badge illustration */}
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#FFEBD8] text-[#E05A32] shadow-xs border border-[#FCD7B8]">
              <FolderOpen className="w-7 h-7" />
            </div>

            {/* Headline */}
            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#1E293B] leading-tight tracking-tight">
              <span className="text-[#E05A32]">Organize</span> all your health data at one place
            </h2>

            {/* 3 Value Pillars */}
            <div className="space-y-3.5 pt-1">
              <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-white border border-[#EBE3D5] shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-[#FFF0EB] text-[#E05A32] flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#1E293B]">
                    Bring all your health records from different places
                  </h4>
                  <p className="text-xs text-[#64748B] mt-0.5 leading-relaxed">
                    Physical clinic slips, hospital discharge summaries, and diagnostic lab reports consolidated under your ABHA profile.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-white border border-[#EBE3D5] shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-[#FFF0EB] text-[#E05A32] flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#1E293B]">
                    Automatically turn them into structured digital files
                  </h4>
                  <p className="text-xs text-[#64748B] mt-0.5 leading-relaxed">
                    OCR extraction instantly isolates active medicines, dosages, clinical intent, and out-of-range lab markers.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-white border border-[#EBE3D5] shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-[#FFF0EB] text-[#E05A32] flex items-center justify-center shrink-0">
                  <Search className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#1E293B]">
                    Easily find using search, filtering, and clinical labels
                  </h4>
                  <p className="text-xs text-[#64748B] mt-0.5 leading-relaxed">
                    Doctors review the longitudinal timeline in seconds before prescribing new therapies.
                  </p>
                </div>
              </div>
            </div>

            {/* Scan QR Code Box */}
            <div className="p-4 rounded-2xl bg-white border border-[#EBE3D5] shadow-xs flex items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-[#1E293B] block">
                  Scan QR to connect
                </span>
                <span className="text-sm font-extrabold text-[#0056B3] block">
                  MediKiosk Patient App
                </span>
                <span className="text-[10px] text-[#64748B] mt-0.5 block">
                  Instant mobile sync with ABHA &amp; OPD Token
                </span>
              </div>
              <div className="p-2 rounded-xl bg-[#F0F7FF] border border-[#0056B3]/20 flex items-center justify-center shrink-0">
                <QrCode className="w-11 h-11 text-[#0056B3]" />
              </div>
            </div>
          </div>

          {/* Right Column: Static Smartphone Screen Mockup (6 cols) */}
          <div className="lg:col-span-6 flex justify-center relative select-none pointer-events-none">
            {/* Floating Smart View Pill Badge */}
            <div className="absolute -top-3 right-4 sm:right-16 z-20 rounded-2xl bg-white border border-[#EBE3D5] shadow-lg p-2.5 flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#FFF0EB] text-[#E05A32] flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
              <div className="text-left">
                <span className="text-[10px] text-[#64748B] block font-medium">Smart View</span>
                <span className="text-xs font-bold text-[#E05A32] block leading-none">Digital File</span>
              </div>
            </div>

            {/* Smartphone Outer Shell - Completely static & non-scrollable */}
            <div className="w-full max-w-[340px] sm:max-w-[370px] rounded-[42px] bg-[#1E293B] p-3 shadow-2xl border-4 border-slate-700 relative">
              
              {/* Phone Inner Screen */}
              <div className="rounded-[32px] bg-white overflow-hidden text-left border border-slate-200">
                
                {/* Status Bar */}
                <div className="bg-white px-5 pt-3 pb-1 flex items-center justify-between text-[11px] font-bold text-slate-700">
                  <span>9:41</span>
                  <div className="w-18 h-3.5 bg-slate-900 rounded-full mx-auto" />
                  <div className="flex items-center gap-1 text-[9px]">
                    <span>5G</span>
                    <span className="w-3.5 h-2 bg-slate-800 rounded-xs inline-block" />
                  </div>
                </div>

                {/* App Top Bar */}
                <div className="px-4 py-2 flex items-center justify-between border-b border-slate-100">
                  <span className="text-xs font-bold text-[#0056B3]">&lt; Back</span>
                  <div className="flex items-center gap-1 px-2.5 py-1 bg-slate-50 rounded-full border border-slate-200 text-[10px] text-slate-500">
                    <Search className="w-3 h-3 text-slate-400" />
                    <span>Search</span>
                  </div>
                </div>

                {/* Smart Report vs Original File Tabs */}
                <div className="px-4 pt-3 pb-2 flex border-b border-slate-100">
                  <div className="flex-1 py-1.5 text-xs font-bold text-center border-b-2 border-[#6366F1] text-[#6366F1]">
                    Smart Report
                  </div>
                  <div className="flex-1 py-1.5 text-xs font-bold text-center border-b-2 border-transparent text-slate-400">
                    Original File
                  </div>
                </div>

                {/* Filter Pills */}
                <div className="px-4 py-2.5 flex items-center gap-2">
                  <div className="px-3 py-1 rounded-full text-[10px] font-bold bg-[#EEF2FF] text-[#6366F1] border border-[#C7D2FE]">
                    All Lab Vitals (12)
                  </div>
                  <div className="px-3 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                    Out of Range (2)
                  </div>
                </div>

                {/* Lab Vitals List - Completely static, no nested scroll container */}
                <div className="divide-y divide-slate-100 px-4 pb-2">
                  {LAB_REPORTS.map((item, idx) => (
                    <div key={idx} className="py-2 flex items-center justify-between">
                      <div>
                        <h5 className="font-bold text-xs text-[#1E293B]">{item.name}</h5>
                        <p className="text-[10px] text-slate-400 mt-0.5">{item.range}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <span
                            className={cn(
                              "text-[9px] font-bold block",
                              item.isHigh ? "text-red-600" : "text-green-700"
                            )}
                          >
                            {item.status}
                          </span>
                          <span className="text-xs font-black text-[#1E293B] block">
                            {item.value}
                          </span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Bottom Home Swipe Indicator */}
                <div className="py-2 bg-white flex justify-center border-t border-slate-100">
                  <div className="w-28 h-1 bg-slate-800 rounded-full" />
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
