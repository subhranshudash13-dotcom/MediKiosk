"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  CheckCircle2,
  ChevronLeft,
  ChevronRight
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

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 80 : -80,
    opacity: 0,
    scale: 0.98,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: {
      x: { type: "spring" as const, stiffness: 300, damping: 30 },
      opacity: { duration: 0.35 },
      scale: { duration: 0.35 },
    },
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -80 : 80,
    opacity: 0,
    scale: 0.98,
    transition: {
      x: { type: "spring" as const, stiffness: 300, damping: 30 },
      opacity: { duration: 0.25 },
    },
  }),
};

export function HospitalVisualGallery() {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [direction, setDirection] = useState<number>(1);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  const activeItem = GALLERY_ITEMS[currentIndex];

  const paginate = (newDirection: number) => {
    setDirection(newDirection);
    setCurrentIndex((prevIndex) => {
      let nextIndex = prevIndex + newDirection;
      if (nextIndex < 0) nextIndex = GALLERY_ITEMS.length - 1;
      if (nextIndex >= GALLERY_ITEMS.length) nextIndex = 0;
      return nextIndex;
    });
  };

  const setSlide = (index: number) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  // Continuous auto-play loop switching left-to-right every 4.5 seconds
  useEffect(() => {
    if (isPaused) {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
      return;
    }

    autoPlayRef.current = setInterval(() => {
      paginate(1);
    }, 4500);

    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [currentIndex, isPaused]);

  return (
    <div
      className="relative text-left space-y-6 select-none py-2"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#DEE2E6] pb-4">
        <div>
          <h3 className="font-heading text-xl sm:text-2xl font-bold text-[#2C3E50]">
            Visualizing the MediKiosk Ecosystem
          </h3>
          <p className="text-xs sm:text-sm text-[#6C7A89] mt-1">
            See how the platform transforms hospital lobbies, doctor consultation cabins, and pharmacy counters.
          </p>
        </div>

        {/* Slide Counter */}
        <div className="flex items-center text-xs font-mono font-bold text-[#6C7A89]">
          <span className="px-3 py-1 rounded-full bg-white border border-[#DEE2E6] text-[#0056B3] shadow-xs">
            {currentIndex + 1} / {GALLERY_ITEMS.length}
          </span>
        </div>
      </div>

      {/* Main Showcase Area With Side Navigation Buttons */}
      <div className="relative">
        {/* Left Side Arrow Button */}
        <button
          onClick={() => paginate(-1)}
          className="absolute -left-3 sm:-left-5 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white border border-[#DEE2E6] shadow-md hover:bg-[#EBF3FC] hover:text-[#0056B3] hover:border-[#0056B3] hover:scale-105 active:scale-95 text-[#2C3E50] flex items-center justify-center transition-all z-30 cursor-pointer"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Right Side Arrow Button */}
        <button
          onClick={() => paginate(1)}
          className="absolute -right-3 sm:-right-5 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white border border-[#DEE2E6] shadow-md hover:bg-[#EBF3FC] hover:text-[#0056B3] hover:border-[#0056B3] hover:scale-105 active:scale-95 text-[#2C3E50] flex items-center justify-center transition-all z-30 cursor-pointer"
          aria-label="Next slide"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Main Content Grid (Cardless Clean Layout) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center min-h-[360px] overflow-hidden px-1 sm:px-2">
          {/* Left: High-Res Image (7 cols) */}
          <div className="lg:col-span-7 relative h-[260px] sm:h-[350px] rounded-2xl overflow-hidden border border-[#DEE2E6] shadow-md bg-slate-900">
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.div
                key={activeItem.id}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="absolute inset-0 w-full h-full"
              >
                <img
                  src={activeItem.imageSrc}
                  alt={activeItem.title}
                  className="w-full h-full object-cover"
                />

                {/* Top Overlay Badge */}
                <div className="absolute top-3.5 left-3.5 z-10">
                  <span className={cn("text-[10px] font-mono font-bold uppercase px-3 py-1 rounded-full shadow-sm", activeItem.tagColor)}>
                    {activeItem.tag}
                  </span>
                </div>

                {/* Bottom Gradient Bar */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-4 text-white">
                  <p className="text-xs font-mono font-bold text-[#17A2B8] uppercase tracking-wide">
                    {activeItem.stats}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right: Narrative Details (5 cols - Cardless Clean Typography) */}
          <div className="lg:col-span-5 relative h-full flex flex-col justify-between space-y-5">
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.div
                key={activeItem.id}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="space-y-4"
              >
                <div className="space-y-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#0056B3]">
                    Deployment Spotlight · {activeItem.id.toUpperCase()}
                  </span>
                  <h4 className="font-heading text-xl sm:text-2xl font-bold text-[#2C3E50] leading-tight">
                    {activeItem.title}
                  </h4>
                  <p className="text-sm text-[#5A6B7C] leading-relaxed">
                    {activeItem.description}
                  </p>
                </div>

                {/* Clean Feature Callout (Cardless Accent Bar) */}
                <div className="border-l-3 border-[#0056B3] pl-3.5 py-1 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#0056B3]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#28A745] shrink-0" />
                    Key Clinical Advantage
                  </div>
                  <p className="text-xs text-[#5A6B7C] leading-snug">
                    {activeItem.clinicalFeature}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Carousel Progress Indicator Dots */}
            <div className="pt-2 flex items-center gap-2">
              {GALLERY_ITEMS.map((item, idx) => (
                <button
                  key={item.id}
                  onClick={() => setSlide(idx)}
                  className={cn(
                    "h-2 rounded-full transition-all duration-300 cursor-pointer",
                    currentIndex === idx ? "w-8 bg-[#0056B3]" : "w-2 bg-[#DEE2E6] hover:bg-[#0056B3]/40"
                  )}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
