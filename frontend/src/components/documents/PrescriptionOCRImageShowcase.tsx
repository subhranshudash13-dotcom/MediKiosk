"use client";

import React from "react";
import Link from "next/link";
import { FileScan, ArrowRight, Sparkles, CheckCircle2, Pill } from "lucide-react";

export function PrescriptionOCRImageShowcase() {
  return (
    <div className="w-full h-full bg-[#FCFDFD] border border-[#DEE2E6] rounded-3xl p-6 sm:p-7 shadow-card flex flex-col justify-between space-y-5 text-left relative overflow-hidden group">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#E9ECEF]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#E8F7F9] text-[#17A2B8] flex items-center justify-center font-bold">
            <FileScan className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-xs sm:text-sm text-[#2C3E50]">
              OPD Prescription Scanner
            </h3>
            <span className="text-[11px] text-[#6C7A89] font-medium">
              Physical Paper-to-FHIR Pipeline
            </span>
          </div>
        </div>
        <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-[#EAF7ED] text-[#155724] border border-[#D4EDDA] flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[#28A745] animate-pulse" />
          <span>Scanner Ready</span>
        </span>
      </div>

      {/* Realistic Hospital Kiosk OCR Scan Image with Overlay Badges */}
      <div className="relative w-full rounded-2xl overflow-hidden border border-[#DEE2E6] shadow-xs bg-slate-900 aspect-[4/3]">
        <img
          src="/images/kiosk_prescription_ocr.jpg"
          alt="Patient scanning physical prescription at MediKiosk smart terminal"
          className="w-full h-full object-cover object-center group-hover:scale-[1.02] transition-transform duration-500"
        />

        {/* Cinematic Gradient Vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

        {/* Live HUD Optical Tag Overlay */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          <div className="px-2.5 py-1 rounded-lg bg-black/65 backdrop-blur-md border border-white/20 text-white text-[10px] font-mono flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-[#38BDF8]" />
            <span>Optical Beam Active &bull; 300 DPI</span>
          </div>
          <div className="px-2 py-1 rounded-lg bg-emerald-500/90 text-white text-[10px] font-mono font-bold backdrop-blur-md">
            Digital OCR
          </div>
        </div>

        {/* Bottom Extracted Entity Chip Overlays */}
        <div className="absolute bottom-3 left-3 right-3 space-y-1.5 pointer-events-none">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="px-2.5 py-1 rounded-md bg-white/90 backdrop-blur-md text-[#0056B3] text-[11px] font-bold border border-white/40 flex items-center gap-1">
              <Pill className="w-3 h-3 text-[#0056B3]" />
              <span>Tab Paracetamol 500mg (1-0-1)</span>
            </span>
            <span className="px-2.5 py-1 rounded-md bg-white/90 backdrop-blur-md text-[#17A2B8] text-[11px] font-bold border border-white/40 flex items-center gap-1">
              <Pill className="w-3 h-3 text-[#17A2B8]" />
              <span>Cap Amoxicillin 250mg (1-1-1)</span>
            </span>
          </div>
        </div>
      </div>

      {/* Direct Interactive Link */}
      <Link
        href="/documents"
        className="w-full py-3.5 rounded-full bg-[#17A2B8] hover:bg-[#138496] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg hover:scale-[1.02] cursor-pointer"
      >
        <FileScan className="w-4 h-4 text-white" />
        <span>Open Clinical Document Studio</span>
        <ArrowRight className="w-4 h-4 text-white" />
      </Link>
    </div>
  );
}
