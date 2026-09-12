"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic,
  Play,
  Pause,
  Check,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Activity,
  ShieldAlert,
  Layers,
  Database,
  Volume2,
  Sparkles,
  ArrowDown,
  Info,
  Clock,
  MapPin,
  Flame,
  ArrowUpRight,
  AlertTriangle,
  Timer,
  Sliders,
  Gauge,
  HeartPulse,
  Stethoscope,
  FileCheck2
} from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================================================
// 8-FACTOR SOCRATES CLINICAL DIMENSIONS DATASET
// ============================================================================

interface StructuredRow {
  concept: string;
  plainMeaning: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface SocratesDimension {
  id: string;
  number: string;
  shortLabel: string;
  factorName: string;
  subheading: string;
  question: string;
  audioDuration: string;
  vernacular: {
    hindi: string;
    english: string;
    language: string;
    confidence: string;
  };
  aiExtractedPills: string[];
  clinicalSignal: {
    status: string;
    statusSeverity: "critical" | "high" | "moderate";
    rows: StructuredRow[];
    clinicalInterpretation: string;
  };
  snomed: {
    code: string;
    concept: string;
    status: string;
    confidence: string;
  };
  clinicalRelevance: {
    level: "High" | "Critical" | "Moderate-High";
    scorePercent: number;
    detectedPattern: string;
  };
}

const SOCRATES_DIMENSIONS: SocratesDimension[] = [
  {
    id: "site",
    number: "01",
    shortLabel: "Site",
    factorName: "Site (Location)",
    subheading: "Primary anatomical origin identified",
    question: "Where exactly is the pain or discomfort located?",
    audioDuration: "0:03",
    vernacular: {
      hindi: "“दर्द छाती के बीचों-बीच भारीपन जैसा लग रहा है।”",
      english: "The pain feels like heaviness right in the center of the chest.",
      language: "Hindi",
      confidence: "98%"
    },
    aiExtractedPills: ["Retrosternal", "Thoracic Center", "Midline Depth"],
    clinicalSignal: {
      status: "HIGH CLINICAL RELEVANCE",
      statusSeverity: "high",
      rows: [
        {
          concept: "Retrosternal Location",
          plainMeaning: "Center of anterior chest wall behind the sternum",
          icon: MapPin
        },
        {
          concept: "Thoracic Visceral Origin",
          plainMeaning: "Corresponds to T1–T4 cardiac visceral dermatome distribution",
          icon: Activity
        }
      ],
      clinicalInterpretation: "Retrosternal localization strongly correlates with myocardial ischemia versus esophageal spasm."
    },
    snomed: {
      code: "261179002",
      concept: "Retrosternal chest pain",
      status: "Mapped",
      confidence: "98%"
    },
    clinicalRelevance: {
      level: "High",
      scorePercent: 92,
      detectedPattern: "Central thoracic distribution + visceral depth"
    }
  },
  {
    id: "onset",
    number: "02",
    shortLabel: "Onset",
    factorName: "Onset & Velocity",
    subheading: "Temporal onset trajectory captured",
    question: "When did the pain start, and was it sudden or gradual?",
    audioDuration: "0:04",
    vernacular: {
      hindi: "“कल दोपहर से धीरे-धीरे शुरू हुआ था, अब बढ़ता जा रहा है।”",
      english: "It started gradually yesterday afternoon, now progressively worsening.",
      language: "Hindi",
      confidence: "97%"
    },
    aiExtractedPills: ["Subacute Onset", "Progressive Worsening", "24h Duration"],
    clinicalSignal: {
      status: "HIGH CLINICAL RELEVANCE",
      statusSeverity: "high",
      rows: [
        {
          concept: "Subacute Velocity",
          plainMeaning: "Onset over hours rather than instantaneous thunderclap",
          icon: Clock
        },
        {
          concept: "Crescendo Trajectory",
          plainMeaning: "Escalating intensity indicative of progressive tissue ischemia",
          icon: Layers
        }
      ],
      clinicalInterpretation: "Progressive crescendo pattern over 24 hours rules out aortic dissection while raising suspicion for unstable ischemic angina."
    },
    snomed: {
      code: "282032007",
      concept: "Subacute onset of pain",
      status: "Mapped",
      confidence: "97%"
    },
    clinicalRelevance: {
      level: "High",
      scorePercent: 88,
      detectedPattern: "Progressive escalation over 24-hour interval"
    }
  },
  {
    id: "character",
    number: "03",
    shortLabel: "Character",
    factorName: "Character & Quality",
    subheading: "Qualitative pain morphology parsed",
    question: "What does the pain feel like? (Crushing, burning, sharp, colicky)",
    audioDuration: "0:05",
    vernacular: {
      hindi: "“ऐसा लग रहा है जैसे कोई छाती पर भारी पत्थर रखकर दबा रहा हो।”",
      english: "It feels like someone placed a heavy boulder on my chest and is squeezing.",
      language: "Hindi",
      confidence: "99%"
    },
    aiExtractedPills: ["Constricting", "Crushing Pressure", "Visceral Squeeze"],
    clinicalSignal: {
      status: "CRITICAL CLINICAL SIGNAL",
      statusSeverity: "critical",
      rows: [
        {
          concept: "Crushing Quality",
          plainMeaning: "Oppressive heavy mechanical sensation (Levine's sign equivalent)",
          icon: Flame
        },
        {
          concept: "Visceral Constriction",
          plainMeaning: "Diffuse ischemic pain typical of coronary hypoperfusion",
          icon: HeartPulse
        }
      ],
      clinicalInterpretation: "Classic oppressive constricting sensation strongly suggests ischemic myocardium over pleuritic or musculoskeletal causes."
    },
    snomed: {
      code: "247348008",
      concept: "Crushing chest pain",
      status: "Mapped",
      confidence: "99%"
    },
    clinicalRelevance: {
      level: "Critical",
      scorePercent: 96,
      detectedPattern: "Oppressive constricting pressure + visceral compression"
    }
  },
  {
    id: "radiation",
    number: "04",
    shortLabel: "Radiation",
    factorName: "Radiation Pathway",
    subheading: "Dermatomal pain propagation tracked",
    question: "Does the pain travel or radiate anywhere else?",
    audioDuration: "0:04",
    vernacular: {
      hindi: "“दर्द बाएं कंधे और गर्दन की तरफ ऊपर चढ़ रहा है।”",
      english: "The pain is shooting upwards into my left shoulder and neck.",
      language: "Hindi",
      confidence: "95%"
    },
    aiExtractedPills: ["Left Brachial", "Cervical Radiation", "Mandibular Track"],
    clinicalSignal: {
      status: "HIGH CLINICAL RELEVANCE",
      statusSeverity: "high",
      rows: [
        {
          concept: "Left Shoulder Radiation",
          plainMeaning: "Pain propagation along C5–C6 / T1 dermatomes",
          icon: ArrowUpRight
        },
        {
          concept: "Cervical Extension",
          plainMeaning: "Ascending radiation toward neck and mandibular angle",
          icon: Activity
        }
      ],
      clinicalInterpretation: "Left brachial and cervical radiation increases likelihood of acute coronary syndrome by 4.2-fold."
    },
    snomed: {
      code: "247384004",
      concept: "Pain radiating to left arm",
      status: "Mapped",
      confidence: "95%"
    },
    clinicalRelevance: {
      level: "High",
      scorePercent: 94,
      detectedPattern: "Left arm + cervical propagation"
    }
  },
  {
    id: "associated",
    number: "05",
    shortLabel: "Associated",
    factorName: "Associated Symptoms",
    subheading: "Associated symptoms detected",
    question: "Are there any other accompanying symptoms?",
    audioDuration: "0:04",
    vernacular: {
      hindi: "“पसीना बहुत छूट रहा है और उल्टी जैसा मन हो रहा है।”",
      english: "I'm sweating profusely and feeling very nauseated with shortness of breath.",
      language: "Hindi",
      confidence: "96%"
    },
    aiExtractedPills: ["Diaphoresis", "Nausea", "Dyspnea"],
    clinicalSignal: {
      status: "HIGH CLINICAL RELEVANCE",
      statusSeverity: "high",
      rows: [
        {
          concept: "Diaphoresis",
          plainMeaning: "Excessive sweating from autonomic sympathetic activation",
          icon: Activity
        },
        {
          concept: "Nausea",
          plainMeaning: "Sensation of vomiting from vagal and diaphragmatic stimulation",
          icon: AlertTriangle
        },
        {
          concept: "Dyspnea",
          plainMeaning: "Shortness of breath reflecting elevated left ventricular filling pressure",
          icon: HeartPulse
        }
      ],
      clinicalInterpretation: "Pattern suggests autonomic activation with possible hemodynamic compromise."
    },
    snomed: {
      code: "415690000",
      concept: "Diaphoresis",
      status: "Mapped",
      confidence: "96%"
    },
    clinicalRelevance: {
      level: "High",
      scorePercent: 95,
      detectedPattern: "Autonomic symptoms + nausea + dyspnea"
    }
  },
  {
    id: "timing",
    number: "06",
    shortLabel: "Timing",
    factorName: "Timing & Pattern",
    subheading: "Chronological persistence characterized",
    question: "Is the pain constant, or does it come and go in waves?",
    audioDuration: "0:04",
    vernacular: {
      hindi: "“लगातार बना हुआ है, एक पल के लिए भी आराम नहीं मिल रहा।”",
      english: "It is constant without a single moment of relief for over 45 minutes.",
      language: "Hindi",
      confidence: "98%"
    },
    aiExtractedPills: ["Continuous", "Duration > 45min", "Unremitting"],
    clinicalSignal: {
      status: "HIGH CLINICAL RELEVANCE",
      statusSeverity: "high",
      rows: [
        {
          concept: "Unremitting Pain",
          plainMeaning: "Continuous ischemic discomfort without intermittent pauses",
          icon: Timer
        },
        {
          concept: "Prolonged Duration (>45m)",
          plainMeaning: "Exceeds typical 2–10 min stable angina threshold",
          icon: Clock
        }
      ],
      clinicalInterpretation: "Persistent pain exceeding 20 minutes without spontaneous resolution strongly indicates sustained myocardial ischemia."
    },
    snomed: {
      code: "255227004",
      concept: "Continuous pain",
      status: "Mapped",
      confidence: "98%"
    },
    clinicalRelevance: {
      level: "High",
      scorePercent: 91,
      detectedPattern: "Persistent pain duration > 45 minutes"
    }
  },
  {
    id: "exacerbating",
    number: "07",
    shortLabel: "Exacerbating",
    factorName: "Exacerbating & Relieving",
    subheading: "Trigger & relief modulators evaluated",
    question: "Does physical exertion, posture, or breathing change the pain?",
    audioDuration: "0:04",
    vernacular: {
      hindi: "“चलने-फिरने से दर्द बढ़ता है, बैठने पर थोड़ा संभलता है।”",
      english: "Walking worsens the pain; resting makes it slightly tolerable.",
      language: "Hindi",
      confidence: "97%"
    },
    aiExtractedPills: ["Exertional Trigger", "Rest Relief", "Effort-Related"],
    clinicalSignal: {
      status: "HIGH CLINICAL RELEVANCE",
      statusSeverity: "high",
      rows: [
        {
          concept: "Exertional Exacerbation",
          plainMeaning: "Increased cardiac workload precipitates ischemic pain",
          icon: Sliders
        },
        {
          concept: "Partial Rest Relief",
          plainMeaning: "Pain eases when myocardial oxygen demand decreases",
          icon: CheckCircle2
        }
      ],
      clinicalInterpretation: "Effort-induced exacerbation with partial relief at rest distinguishes ischemic demand mismatch from musculoskeletal wall pain."
    },
    snomed: {
      code: "271594007",
      concept: "Pain worsened by exertion",
      status: "Mapped",
      confidence: "97%"
    },
    clinicalRelevance: {
      level: "High",
      scorePercent: 93,
      detectedPattern: "Exertion precipitation + rest mitigation"
    }
  },
  {
    id: "severity",
    number: "08",
    shortLabel: "Severity",
    factorName: "Severity Score (0-10)",
    subheading: "Numeric VAS intensity quantified",
    question: "On a scale of 0 to 10, how intense is the pain right now?",
    audioDuration: "0:03",
    vernacular: {
      hindi: "“दर्द बहुत असहनीय है, कम से कम 8 या 9 नंबर का।”",
      english: "The pain is unbearable, at least an 8 or 9 out of 10.",
      language: "Hindi",
      confidence: "99%"
    },
    aiExtractedPills: ["VAS 9/10", "Severe Acute Pain", "Emergency Priority"],
    clinicalSignal: {
      status: "CRITICAL CLINICAL SIGNAL",
      statusSeverity: "critical",
      rows: [
        {
          concept: "Severe Pain (VAS 9/10)",
          plainMeaning: "Numeric Rating Scale 9/10 designating severe debilitating distress",
          icon: Gauge
        },
        {
          concept: "Urgent Analgesia Need",
          plainMeaning: "Requires immediate clinical triage and ECG acquisition",
          icon: ShieldAlert
        }
      ],
      clinicalInterpretation: "High VAS score (9/10) with systemic distress mandates emergency department triage priority."
    },
    snomed: {
      code: "225908003",
      concept: "Pain score 9/10",
      status: "Mapped",
      confidence: "99%"
    },
    clinicalRelevance: {
      level: "Critical",
      scorePercent: 98,
      detectedPattern: "Severe pain scale (9/10) + urgent priority"
    }
  }
];

export function SocratesFrameworkExplorer() {
  // Default to 05 Associated (index 4) as requested in requirements
  const [activeIdx, setActiveIdx] = useState<number>(4);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);

  const currentDim = SOCRATES_DIMENSIONS[activeIdx];
  const prevDim = activeIdx > 0 ? SOCRATES_DIMENSIONS[activeIdx - 1] : null;
  const nextDim = activeIdx < SOCRATES_DIMENSIONS.length - 1 ? SOCRATES_DIMENSIONS[activeIdx + 1] : null;

  // Simulate audio playback timing
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlayingAudio) {
      timer = setTimeout(() => {
        setIsPlayingAudio(false);
      }, 4000);
    }
    return () => clearTimeout(timer);
  }, [isPlayingAudio, activeIdx]);

  const handleToggleAudio = () => {
    setIsPlayingAudio((prev) => !prev);
  };

  const handleSelectFactor = (idx: number) => {
    setActiveIdx(idx);
    setIsPlayingAudio(false);
  };

  const handlePrev = () => {
    if (activeIdx > 0) {
      setActiveIdx(activeIdx - 1);
      setIsPlayingAudio(false);
    }
  };

  const handleNext = () => {
    if (activeIdx < SOCRATES_DIMENSIONS.length - 1) {
      setActiveIdx(activeIdx + 1);
      setIsPlayingAudio(false);
    }
  };

  return (
    <div className="w-full text-left space-y-5 select-none">
      {/* ========================================================================= */}
      {/* 1. COMPACT CLINICAL HEADER */}
      {/* ========================================================================= */}
      <div className="space-y-3 pb-2 border-b border-[#DEE2E6]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Left Title Area */}
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-bold tracking-wider text-[#0056B3] uppercase px-2 py-0.5 rounded bg-[#EBF3FC] border border-[#CCE5FF]">
                SOCRATES
              </span>
              <h3 className="font-heading font-extrabold text-lg sm:text-xl text-[#2C3E50]">
                Clinical History Intelligence
              </h3>
            </div>
            <p className="text-xs text-[#5A6B7C] mt-0.5">
              Transforming patient speech into structured clinical dimensions
            </p>
          </div>

          {/* Right Counter Area */}
          <div className="flex items-center gap-3 sm:text-right">
            <div>
              <div className="text-xs font-mono font-bold text-[#0056B3]">
                {currentDim.number} / 08
              </div>
              <div className="text-xs font-bold text-[#2C3E50]">
                {currentDim.factorName}
              </div>
            </div>
          </div>
        </div>

        {/* Thin 8-Segment Progress Indicator */}
        <div className="grid grid-cols-8 gap-1.5 pt-1">
          {SOCRATES_DIMENSIONS.map((dim, i) => {
            const isCompleted = i < activeIdx;
            const isCurrent = i === activeIdx;
            return (
              <div
                key={dim.id}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  isCurrent
                    ? "bg-[#0056B3] shadow-xs"
                    : isCompleted
                    ? "bg-[#0056B3]/40"
                    : "bg-[#E2E8F0]"
                )}
                title={`${dim.number} ${dim.shortLabel}`}
              />
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. COMPACT HORIZONTAL STEPPER NAVIGATION */}
      {/* ========================================================================= */}
      <div className="w-full overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
        <nav
          aria-label="SOCRATES Factors Navigation"
          className="flex items-center gap-2 min-w-max p-1 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl"
        >
          {SOCRATES_DIMENSIONS.map((dim, idx) => {
            const isActive = activeIdx === idx;
            const isCompleted = idx < activeIdx;

            return (
              <button
                key={dim.id}
                type="button"
                onClick={() => handleSelectFactor(idx)}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0056B3]/40",
                  isActive
                    ? "bg-white text-[#2C3E50] shadow-sm border border-[#0056B3]/30 ring-1 ring-[#0056B3]/20"
                    : isCompleted
                    ? "text-[#4A5568] hover:text-[#0056B3] hover:bg-white/60"
                    : "text-[#94A3B8] hover:text-[#4A5568] hover:bg-white/40"
                )}
              >
                {/* Number or Checkmark Circle */}
                <span
                  className={cn(
                    "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold transition-colors shrink-0",
                    isActive
                      ? "bg-[#0056B3] text-white"
                      : isCompleted
                      ? "bg-[#EBF3FC] text-[#0056B3]"
                      : "bg-[#E2E8F0] text-[#64748B]"
                  )}
                >
                  {isCompleted ? <Check className="w-3 h-3 stroke-[2.5]" /> : dim.number}
                </span>

                <span className={cn("tracking-tight", isActive ? "font-bold text-[#2C3E50]" : "font-medium")}>
                  {dim.shortLabel}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* ========================================================================= */}
      {/* 3. MAIN 3-COLUMN CLINICAL INTELLIGENCE WORKSPACE */}
      {/* ========================================================================= */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentDim.id}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="space-y-4"
        >
          {/* Main 3-Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
            
            {/* =================================================================== */}
            {/* COLUMN 1: PATIENT VOICE (4 cols) */}
            {/* =================================================================== */}
            <div className="lg:col-span-4 p-5 rounded-2xl bg-[#FFFDF9] border border-[#F5E6D3] shadow-2xs flex flex-col justify-between space-y-4 text-left relative overflow-hidden">
              {/* Top Accent Line */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-[#F59E0B]/60" />

              <div className="space-y-3.5">
                {/* Panel Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-[#FEF3C7] text-[#D97706] flex items-center justify-center">
                      <Mic className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-[#D97706] block">
                        PATIENT VOICE
                      </span>
                      <span className="text-xs font-bold text-[#2C3E50]">
                        Hindi / Vernacular Input
                      </span>
                    </div>
                  </div>

                  {/* Audio Duration */}
                  <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-md bg-[#FEF3C7]/80 text-[#92400E]">
                    {currentDim.audioDuration}
                  </span>
                </div>

                {/* Question Prompt Label */}
                <div className="p-2.5 rounded-xl bg-white/80 border border-[#F5E6D3] text-xs text-[#5A6B7C]">
                  <span className="text-[10px] font-mono font-bold uppercase text-[#94A3B8] block mb-0.5">
                    Clinical Query
                  </span>
                  &ldquo;{currentDim.question}&rdquo;
                </div>

                {/* Patient Vernacular Quote */}
                <div className="p-3.5 rounded-xl bg-white border border-[#F5E6D3] space-y-2">
                  <span className="text-[10px] font-mono font-bold text-[#D97706] uppercase tracking-wider block">
                    Spoken Audio Transcription
                  </span>
                  <p className="text-sm sm:text-base font-semibold text-[#2C3E50] leading-snug">
                    {currentDim.vernacular.hindi}
                  </p>
                  <p className="text-xs text-[#64748B] italic leading-relaxed pt-1 border-t border-[#F5E6D3]/60">
                    &ldquo;{currentDim.vernacular.english}&rdquo;
                  </p>
                </div>

                {/* Audio Waveform Visualization & Control */}
                <div className="p-3 rounded-xl bg-white/90 border border-[#F5E6D3] flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={handleToggleAudio}
                    aria-label={isPlayingAudio ? "Pause patient audio recording" : "Play patient audio recording"}
                    className="px-3 py-1.5 rounded-lg bg-[#F59E0B] hover:bg-[#D97706] text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 shadow-2xs"
                  >
                    {isPlayingAudio ? (
                      <>
                        <Pause className="w-3.5 h-3.5 fill-white" />
                        <span>Playing...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-white" />
                        <span>Play audio</span>
                      </>
                    )}
                  </button>

                  {/* Simulated Waveform Bars */}
                  <div className="flex items-center gap-1 flex-1 justify-end h-6 px-1">
                    {[24, 60, 40, 85, 55, 95, 70, 45, 90, 65, 30, 75, 50, 80, 40, 60].map((h, i) => (
                      <span
                        key={i}
                        style={{ height: isPlayingAudio ? `${Math.max(20, (h + (i % 3) * 15) % 100)}%` : `${h * 0.4}%` }}
                        className={cn(
                          "w-1 rounded-full transition-all duration-150",
                          isPlayingAudio ? "bg-[#F59E0B] animate-pulse" : "bg-[#FCD34D]"
                        )}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Metadata Row */}
              <div className="pt-2.5 border-t border-[#F5E6D3] flex items-center justify-between text-[11px] text-[#78350F] font-medium">
                <span>Language: <strong className="text-[#2C3E50]">{currentDim.vernacular.language}</strong></span>
                <span>Input: <strong className="text-[#2C3E50]">Voice ASR</strong></span>
                <span>Confidence: <strong className="text-[#16A34A]">{currentDim.vernacular.confidence}</strong></span>
              </div>
            </div>

            {/* =================================================================== */}
            {/* COLUMN 2: AI INTERPRETATION CENTER (3 cols) */}
            {/* =================================================================== */}
            <div className="lg:col-span-3 p-5 rounded-2xl bg-white border border-[#DEE2E6] shadow-2xs flex flex-col justify-between space-y-4 text-left">
              <div className="space-y-4">
                {/* Panel Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-[#EBF3FC] text-[#0056B3] flex items-center justify-center">
                      <Sparkles className="w-3.5 h-3.5 text-[#0056B3]" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-[#0056B3] block">
                        AI INTERPRETATION
                      </span>
                      <span className="text-xs font-bold text-[#2C3E50]">
                        Transformation Pipeline
                      </span>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    0.24s latency
                  </span>
                </div>

                {/* Pipeline Flow Visualization */}
                <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2 text-center">
                  <div className="text-[10px] font-mono font-bold text-[#64748B] uppercase tracking-wider">
                    PATIENT SPEECH
                  </div>
                  <div className="flex items-center justify-center text-[#0056B3]">
                    <ArrowDown className="w-3.5 h-3.5 animate-bounce" />
                  </div>
                  <div className="py-1 px-2.5 rounded-md bg-[#EBF3FC] text-[#0056B3] text-[11px] font-mono font-bold inline-block border border-[#CCE5FF]">
                    Bhashini NLU Parser
                  </div>
                  <div className="flex items-center justify-center text-[#0056B3]">
                    <ArrowDown className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-[10px] font-mono font-bold text-[#16A34A] uppercase tracking-wider">
                    CLINICAL CONCEPTS
                  </div>
                </div>

                {/* AI Extracted Concepts as Interactive Pills */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-mono font-bold text-[#64748B] uppercase">
                    <span>AI EXTRACTED</span>
                    <span className="text-[#0056B3]">Staggered Tokens</span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {currentDim.aiExtractedPills.map((pill, idx) => (
                      <motion.span
                        key={pill}
                        initial={{ opacity: 0, scale: 0.92 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.08, duration: 0.18 }}
                        className="px-2.5 py-1 rounded-md bg-[#EBF3FC] border border-[#CCE5FF] text-[#0056B3] font-mono font-bold text-xs flex items-center gap-1.5 shadow-2xs"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-[#0056B3]" />
                        <span>{pill}</span>
                      </motion.span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Structured Terminology Compact Box */}
              <div className="p-3 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0] space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase text-[#15803D] flex items-center gap-1">
                    <FileCheck2 className="w-3 h-3" />
                    <span>SNOMED CT MAPPING</span>
                  </span>
                  <span className="text-[10px] font-mono font-bold text-emerald-800 bg-white px-1.5 py-0.5 rounded border border-[#BBF7D0]">
                    Verified
                  </span>
                </div>
                <div className="font-mono text-xs font-bold text-[#166534]">
                  Code: {currentDim.snomed.code}
                </div>
                <div className="text-[11px] text-[#2C3E50] font-medium">
                  Concept: <strong>{currentDim.snomed.concept}</strong>
                </div>
              </div>
            </div>

            {/* =================================================================== */}
            {/* COLUMN 3: CLINICAL SIGNAL (5 cols - Most Important Panel) */}
            {/* =================================================================== */}
            <div className="lg:col-span-5 p-5 rounded-2xl bg-white border border-[#DEE2E6] shadow-xs flex flex-col justify-between space-y-4 text-left relative overflow-hidden">
              {/* Top Accent Line */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-[#0056B3]" />

              <div className="space-y-3.5">
                {/* Panel Header & Relevance Badge */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-[#0056B3]">
                        CLINICAL SIGNAL
                      </span>
                    </div>
                    <h4 className="text-sm sm:text-base font-bold text-[#2C3E50]">
                      {currentDim.subheading}
                    </h4>
                  </div>

                  {/* Status Indicator */}
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-bold self-start sm:self-auto border",
                      currentDim.clinicalSignal.statusSeverity === "critical"
                        ? "bg-red-50 text-red-700 border-red-200"
                        : "bg-amber-50 text-amber-800 border-amber-200"
                    )}
                  >
                    <span
                      className={cn(
                        "w-2 h-2 rounded-full",
                        currentDim.clinicalSignal.statusSeverity === "critical"
                          ? "bg-red-500 animate-ping"
                          : "bg-amber-500"
                      )}
                    />
                    <span>{currentDim.clinicalSignal.status}</span>
                  </span>
                </div>

                {/* Structured Clinical Concept Rows */}
                <div className="space-y-2">
                  {currentDim.clinicalSignal.rows.map((row, idx) => {
                    const RowIcon = row.icon;
                    return (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-start gap-3 hover:border-[#0056B3]/40 transition-colors"
                      >
                        <div className="w-7 h-7 rounded-lg bg-[#EBF3FC] text-[#0056B3] flex items-center justify-center shrink-0 mt-0.5">
                          <RowIcon className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-[#2C3E50] flex items-center justify-between">
                            <span>{row.concept}</span>
                            <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                              Mapped
                            </span>
                          </div>
                          <p className="text-[11px] text-[#64748B] mt-0.5 leading-relaxed">
                            {row.plainMeaning}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Clinical Interpretation Box */}
                <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1 text-xs">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase text-[#0056B3]">
                    <Stethoscope className="w-3 h-3 text-[#0056B3]" />
                    <span>CLINICAL INTERPRETATION</span>
                  </div>
                  <p className="text-xs font-medium text-[#2C3E50] leading-relaxed">
                    &ldquo;{currentDim.clinicalSignal.clinicalInterpretation}&rdquo;
                  </p>
                </div>
              </div>

              {/* Bottom Clinical Consideration Footer */}
              <div className="pt-2 border-t border-[#E2E8F0] flex items-center justify-between text-[11px] text-[#64748B]">
                <span className="flex items-center gap-1">
                  <Info className="w-3 h-3 text-[#0056B3]" />
                  <span>Supports clinical consideration</span>
                </span>
                <span className="font-mono text-[#0056B3] font-bold">Doctor-in-the-Loop</span>
              </div>
            </div>

          </div>

          {/* ===================================================================== */}
          {/* 4. HORIZONTAL CLINICAL RELEVANCE & PATTERN SUMMARY INDICATOR */}
          {/* ===================================================================== */}
          <div className="p-3.5 sm:p-4 rounded-xl bg-[#F8FAFC] border border-[#DEE2E6] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase text-[#64748B]">
                  Detected Pattern:
                </span>
                <span className="font-bold text-[#2C3E50]">
                  {currentDim.clinicalRelevance.detectedPattern}
                </span>
              </div>
              <div className="text-[11px] text-[#64748B]">
                Algorithmic extraction flags physiological distress for attending physician verification.
              </div>
            </div>

            {/* Relevance Scale Bar */}
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-[10px] font-mono font-bold uppercase text-[#64748B]">
                Relevance:
              </span>
              <div className="w-28 bg-[#E2E8F0] rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-[#0056B3] h-full rounded-full transition-all duration-500"
                  style={{ width: `${currentDim.clinicalRelevance.scorePercent}%` }}
                />
              </div>
              <span className="text-xs font-bold text-[#0056B3] font-mono">
                {currentDim.clinicalRelevance.level} ({currentDim.clinicalRelevance.scorePercent}%)
              </span>
            </div>
          </div>

          {/* ===================================================================== */}
          {/* 5. COMPACT BOTTOM NAVIGATION CONTROLS */}
          {/* ===================================================================== */}
          <div className="pt-2 flex items-center justify-between border-t border-[#DEE2E6]">
            {/* Previous Button */}
            <button
              type="button"
              disabled={!prevDim}
              onClick={handlePrev}
              className={cn(
                "px-3.5 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0056B3]/40",
                prevDim
                  ? "bg-white text-[#2C3E50] border-[#DEE2E6] hover:bg-[#F8FAFC] hover:border-[#0056B3]/40 shadow-2xs"
                  : "bg-[#F8FAFC] text-[#94A3B8] border-[#E2E8F0] cursor-not-allowed opacity-60"
              )}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{prevDim ? `Previous: ${prevDim.shortLabel}` : "First Dimension"}</span>
            </button>

            {/* Center Step Counter */}
            <span className="text-xs font-mono font-bold text-[#64748B]">
              SOCRATES {currentDim.number} / 08
            </span>

            {/* Next Button */}
            <button
              type="button"
              disabled={!nextDim}
              onClick={handleNext}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0056B3]/40 shadow-xs",
                nextDim
                  ? "bg-[#0056B3] hover:bg-[#004494] text-white"
                  : "bg-[#F8FAFC] text-[#94A3B8] border border-[#E2E8F0] cursor-not-allowed opacity-60"
              )}
            >
              <span>{nextDim ? `Next: ${nextDim.shortLabel}` : "Completed (08/08)"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
