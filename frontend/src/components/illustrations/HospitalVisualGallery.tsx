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
    tagColor: "bg-[#0056B3] text-white",
    imageSrc: "/images/kiosk_hero.jpg",
    description:
      "A friendly, approachable touch-and-voice station installed at the hospital OPD reception. Patients speak naturally in Hindi, Telugu, Tamil, Bengali, Marathi, or English without needing digital literacy.",
    clinicalFeature: "SOCRATES Dynamic Triage & Red-Flag Interception in 2.8 mins",
    stats: "8+ Indic Languages · 98.4% Dialect Accuracy"
  },
  {
    id: "doctor",
    title: "Physician Consultation Workstation",
    tag: "Doctor Cockpit · Clinical Intelligence",
    tagColor: "bg-[#17A2B8] text-white",
    imageSrc: "/images/doctor_consult.jpg",
    description:
      "Physicians receive pre-triaged patients with fully structured SOAP notes, past medication timelines, and differential diagnosis alerts before the patient walks through the consultation door.",
    clinicalFeature: "Eliminates 70% of manual typing so physicians focus entirely on clinical care",
    stats: "3.8 Mins Consult Time · Zero Missed Critical Symptoms"
  },
  {
    id: "ocr",
    title: "Multimodal Document & Lab Report Vision OCR",
    tag: "Vision AI · Zero-Loss Digitization",
    tagColor: "bg-[#2C3E50] text-white",
    imageSrc: "/images/document_ocr.jpg",
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
    <div className="rounded-2xl border border-[#DEE2E6] bg-white p-6 sm:p-8 shadow-card text-left space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#DEE2E6] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#EBF3FC] text-[#0056B3]">
              <Sparkles className="h-3.5 w-3.5 text-[#0056B3]" />
            </span>
            <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#0056B3]">
              Real-World Clinical Deployment
            </p>
          </div>
          <h3 className="font-heading text-xl sm:text-2xl font-bold text-[#2C3E50] mt-1">
            Visualizing the MediKiosk Ecosystem
          </h3>
          <p className="text-xs sm:text-sm text-[#6C7A89] mt-1">
            See how the platform transforms hospital lobbies, doctor consultation cabins, and pharmacy counters.
          </p>
        </div>

        {/* Quick Tabs (Eka.care inspiration) */}
        <div className="flex flex-wrap gap-1.5">
          {GALLERY_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveId(item.id)}
              className={cn(
                "px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer",
                activeId === item.id
                  ? "bg-[#0056B3] text-white shadow-xs"
                  : "bg-[#F8F9FA] text-[#2C3E50] hover:bg-[#EBF3FC] hover:text-[#0056B3] border border-[#DEE2E6]"
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
          <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-[#DEE2E6] shadow-sm bg-slate-900 group">
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
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-4 text-white">
              <p className="text-xs font-mono font-bold text-[#17A2B8] uppercase">
                {activeItem.stats}
              </p>
            </div>
          </div>
        </div>

        {/* Right: Narrative Details Card (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="space-y-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#0056B3]">
              Deployment Spotlight
            </span>
            <h4 className="font-heading text-lg sm:text-xl font-bold text-[#2C3E50]">
              {activeItem.title}
            </h4>
            <p className="text-xs sm:text-sm text-[#5A6B7C] leading-relaxed">
              {activeItem.description}
            </p>
          </div>

          <div className="p-4 bg-[#F8F9FA] rounded-xl border border-[#DEE2E6] space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#28A745] shrink-0" />
              <p className="text-xs font-bold text-[#0056B3]">Key Clinical Advantage:</p>
            </div>
            <p className="text-xs text-[#5A6B7C] leading-snug pl-6">
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
                  activeId === item.id ? "w-8 bg-[#0056B3]" : "w-2 bg-[#DEE2E6] hover:bg-[#0056B3]/40"
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

