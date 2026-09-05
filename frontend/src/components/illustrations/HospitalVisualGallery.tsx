"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Stethoscope,
  Mic,
  FileScan,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Maximize2
} from "lucide-react";
import { cn } from "@/lib/utils";

interface GalleryItem {
  id: string;
  title: string;
  tag: string;
  tagColor: string;
  imageSrc: string;
  description: string;
  clinicalFeature: string;
  stats: string;
}

const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: "kiosk",
    title: "Point-of-Entry Vernacular Voice Kiosk",
    tag: "Patient Experience · Station #04",
    tagColor: "bg-[#1D2A8F] text-white",
    imageSrc: "/images/kiosk_patient_experience.jpg",
    description:
      "A friendly, approachable touch-and-voice station installed at the hospital OPD reception. Patients speak naturally in Hindi, Telugu, Tamil, Bengali, or Marathi without needing digital literacy.",
    clinicalFeature: "SOCRATES Dynamic Triage & Red-Flag Interception in 2.8 mins",
    stats: "8+ Indic Languages · 98.4% Dialect Accuracy"
  },
  {
    id: "doctor",
    title: "Physician Consultation Workstation",
    tag: "Doctor Cockpit · Clinical Intelligence",
    tagColor: "bg-emerald-700 text-white",
    imageSrc: "/images/doctor_cockpit_view.jpg",
    description:
      "Physicians receive pre-triaged patients with fully structured SOAP notes, past medication timelines, and differential diagnosis alerts before the patient walks through the consultation door.",
    clinicalFeature: "Eliminates 70% of manual typing so physicians focus on clinical care",
    stats: "3.8 Mins Consult Time · Zero Missed Critical Symptoms"
  },
  {
    id: "ocr",
    title: "Multimodal Document & Lab Report Vision OCR",
    tag: "Vision AI · Zero-Loss Digitization",
    tagColor: "bg-[#C2410C] text-white",
    imageSrc: "/images/prescription_ocr_vision.jpg",
    description:
      "High-speed optical recognition decodes messy handwritten doctor scripts, dosage frequencies, and abnormal lab biomarkers (HbA1c, Creatinine, Electrolytes) with clinical intent decoding.",
    clinicalFeature: "Automatically classifies 'What this drug is for' and syncs to ABDM",
    stats: "Sub-second Extraction · Pharmacological Purpose Mapping"
  }
];

export function HospitalVisualGallery() {
  const [activeId, setActiveId] = useState<string>("kiosk");
  const activeItem = GALLERY_ITEMS.find((g) => g.id === activeId) || GALLERY_ITEMS[0];

  return (
    <div className="rounded-[20px] border border-[#FDEBD0] bg-white p-6 sm:p-8 shadow-sm text-left space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#FDEBD0]/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-[6px] bg-[#1D2A8F]/10 text-[#1D2A8F]">
              <Sparkles className="h-3.5 w-3.5 text-[#FB923C]" />
            </span>
            <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#1D2A8F]">
              Real-World Clinical Deployment
            </p>
          </div>
          <h3 className="font-heading text-xl sm:text-2xl font-bold text-[#374151] mt-1">
            Visualizing the MediKiosk Ecosystem
          </h3>
          <p className="text-xs sm:text-sm text-[#374151]/70 mt-1">
            See how the platform transforms hospital lobbies, doctor consultation cabins, and pharmacy counters.
          </p>
        </div>

        {/* Quick Tabs */}
        <div className="flex flex-wrap gap-1.5">
          {GALLERY_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveId(item.id)}
              className={cn(
                "px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer",
                activeId === item.id
                  ? "bg-[#1D2A8F] text-white shadow-xs"
                  : "bg-[#FDFBF7] text-[#374151]/80 hover:bg-[#FDEBD0] hover:text-[#1D2A8F] border border-[#FDEBD0]"
              )}
            >
              {item.title.split(" ")[0]} {item.title.split(" ")[1]}
            </button>
          ))}
        </div>
      </div>

      {/* Main Image Display + Storytelling Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left: High-Res Image with Glow Card (7 cols) */}
        <div className="lg:col-span-7">
          <div className="relative aspect-video w-full rounded-[16px] overflow-hidden border border-[#FDEBD0] shadow-sm bg-slate-900 group">
            <img
              src={activeItem.imageSrc}
              alt={activeItem.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            />
            {/* Top Overlay Badge */}
            <div className="absolute top-3 left-3 z-10">
              <span className={cn("text-[10px] font-mono font-bold uppercase px-3 py-1 rounded-full shadow-sm", activeItem.tagColor)}>
                {activeItem.tag}
              </span>
            </div>

            {/* Bottom Gradient Bar */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 text-white">
              <p className="text-xs font-mono font-bold text-[#FB923C] uppercase">
                {activeItem.stats}
              </p>
            </div>
          </div>
        </div>

        {/* Right: Narrative Details Card (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="space-y-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#1D2A8F]">
              Deployment Spotlight
            </span>
            <h4 className="font-heading text-lg sm:text-xl font-bold text-[#374151]">
              {activeItem.title}
            </h4>
            <p className="text-xs sm:text-sm text-[#374151]/80 leading-relaxed">
              {activeItem.description}
            </p>
          </div>

          <div className="p-4 bg-[#FDFBF7] rounded-[14px] border border-[#FDEBD0] space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <p className="text-xs font-bold text-[#1D2A8F]">Key Clinical Advantage:</p>
            </div>
            <p className="text-xs text-[#374151]/80 leading-snug pl-6">
              {activeItem.clinicalFeature}
            </p>
          </div>

          {/* Quick Interactive Nav Pill */}
          <div className="pt-2 flex items-center gap-2">
            {GALLERY_ITEMS.map((item, idx) => (
              <button
                key={item.id}
                onClick={() => setActiveId(item.id)}
                className={cn(
                  "h-2 rounded-full transition-all cursor-pointer",
                  activeId === item.id ? "w-8 bg-[#1D2A8F]" : "w-2 bg-[#FDEBD0] hover:bg-[#1D2A8F]/40"
                )}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
