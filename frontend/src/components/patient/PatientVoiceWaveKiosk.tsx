"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Mic,
  MicOff,
  Volume2,
  ArrowLeft,
  HeartPulse,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Languages,
  Activity,
  ShieldCheck,
  Stethoscope,
  ArrowRight,
  Printer,
  RotateCcw,
  Clock,
  User,
  Zap,
  Check,
  ChevronDown
} from "lucide-react";

interface ClinicalExtraction {
  chiefComplaint: string;
  onset: string;
  severity: string;
  associated: string;
  triageLevel: "EMERGENCY" | "URGENT" | "ROUTINE";
  department: string;
  roomNumber: string;
}

const SAMPLE_UTTERANCES = [
  {
    label: "Chest Pain (Emergency)",
    transcript: "I'm having severe pain in my chest since yesterday morning. It feels heavy and radiates down to my left arm.",
    extracted: {
      chiefComplaint: "Retrosternal chest tightness radiating to left arm",
      onset: "Yesterday morning (~24 hours duration)",
      severity: "8 / 10 (Severe)",
      associated: "Diaphoresis (sweating), left arm radiation, exertional dyspnea",
      triageLevel: "EMERGENCY" as const,
      department: "Cardiology OPD / Emergency Room",
      roomNumber: "Room 12 (Stat ECG)"
    }
  },
  {
    label: "Fever & Chills (Urgent)",
    transcript: "Mujhe 3 din se tez bukhar hai aur thand lagkar compani aati hai. Sir dard aur kamzori bohot zyada hai.",
    extracted: {
      chiefComplaint: "High-grade fever with rigors & frontal headache",
      onset: "3 days duration, acute onset",
      severity: "6 / 10 (Moderate)",
      associated: "Rigors, chills, retro-orbital headache, body aches",
      triageLevel: "URGENT" as const,
      department: "General Medicine / Fever Clinic",
      roomNumber: "Room 04"
    }
  },
  {
    label: "Abdominal Pain (Urgent)",
    transcript: "Kal raat se pet ke daayein niche hisse mein tez dard hai aur ulti jaisa lag raha hai.",
    extracted: {
      chiefComplaint: "Right lower quadrant abdominal pain with nausea",
      onset: "Yesterday night (~16 hours duration)",
      severity: "7 / 10 (Moderate-to-Severe)",
      associated: "Nausea, low-grade fever, tenderness at McBurney's point",
      triageLevel: "URGENT" as const,
      department: "General Surgery / Acute OPD",
      roomNumber: "Room 08"
    }
  }
];

const LANGUAGES = [
  { code: "hi", name: "हिन्दी (Hindi)" },
  { code: "en", name: "English" },
  { code: "te", name: "తెలుగు (Telugu)" },
  { code: "ta", name: "தமிழ் (Tamil)" },
  { code: "mr", name: "मराठी (Marathi)" },
  { code: "bn", name: "বাংলা (Bengali)" },
  { code: "gu", name: "ગુજરાતી (Gujarati)" },
  { code: "kn", name: "ಕನ್ನಡ (Kannada)" },
];

export function PatientVoiceWaveKiosk() {
  const [patientName, setPatientName] = useState("Rahul");
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [voiceState, setVoiceState] = useState<"listening" | "speaking" | "processing" | "idle">("listening");
  const [transcript, setTranscript] = useState("I'm having pain in my chest since yesterday.");
  const [activeExtraction, setActiveExtraction] = useState<ClinicalExtraction>(SAMPLE_UTTERANCES[0].extracted);
  const [isComplete, setIsComplete] = useState(false);

  // Animated Waveform Canvas Reference
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let time = 0;
    let animationFrameId: number;

    // Multi-harmonic wave physics configuration
    const waveLayers = Array.from({ length: 6 }).map((_, i) => ({
      baseFreq: 2.5 + i * 1.2,
      amplitude: 0.35 + i * 0.08,
      speed: 0.03 + i * 0.015,
      phase: i * 0.8,
    }));

    function resize() {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * (window.devicePixelRatio || 1);
      canvas.height = rect.height * (window.devicePixelRatio || 1);
    }

    function draw() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Deep, clean solid card background
      ctx.fillStyle = "#111111";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw subtle grid guides
      ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
      ctx.lineWidth = 1;
      const step = 20 * (window.devicePixelRatio || 1);
      for (let x = 0; x < canvas.width; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }

      // Dynamic activity multiplier based on voice state
      let activityMult = 1.0;
      if (voiceState === "listening") activityMult = 1.8;
      else if (voiceState === "speaking") activityMult = 2.2;
      else if (voiceState === "processing") activityMult = 0.8;
      else activityMult = 0.4;

      // Draw multi-harmonic sinusoidal waves
      waveLayers.forEach((wave, idx) => {
        ctx.beginPath();
        const yCenter = canvas.height / 2;
        const width = canvas.width;

        for (let x = 0; x <= width; x += 3) {
          const normX = (x / width) * 2 - 1; // -1 to +1
          // Bell curve windowing so wave tapers smoothly at edges
          const envelope = Math.cos((normX * Math.PI) / 2);

          const sinVal = Math.sin(normX * wave.baseFreq * 3 + time * wave.speed * 20 + wave.phase);
          const cosVal = Math.cos(normX * 4 + time * 1.5);
          const waveHeight =
            sinVal *
            cosVal *
            (canvas.height * 0.32) *
            wave.amplitude *
            envelope *
            activityMult;

          const y = yCenter + waveHeight;
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }

        // Color mapping using MediKiosk brand palette: #7C6EF7 (Brand), #06B6D4 (AI), #12B981 (Success)
        ctx.lineWidth = (2 + idx * 0.6) * (window.devicePixelRatio || 1);
        if (idx % 3 === 0) {
          ctx.strokeStyle = "rgba(124, 110, 247, 0.85)"; // #7C6EF7 Brand Primary
        } else if (idx % 3 === 1) {
          ctx.strokeStyle = "rgba(6, 182, 212, 0.8)"; // #06B6D4 AI Accent
        } else {
          ctx.strokeStyle = "rgba(18, 185, 129, 0.75)"; // #12B981 Success
        }

        ctx.stroke();
      });
    }

    function animate() {
      time += 0.03;
      draw();
      animationFrameId = requestAnimationFrame(animate);
    }

    window.addEventListener("resize", resize);
    resize();
    animate();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [voiceState]);

  const handleSelectSample = (sample: typeof SAMPLE_UTTERANCES[0]) => {
    setVoiceState("processing");
    setTranscript(sample.transcript);
    setActiveExtraction(sample.extracted);
    setTimeout(() => {
      setVoiceState("listening");
    }, 600);
  };

  const handleToggleVoice = () => {
    if (voiceState === "listening") {
      setVoiceState("processing");
      setTimeout(() => {
        setVoiceState("speaking");
      }, 800);
    } else if (voiceState === "speaking") {
      setVoiceState("idle");
    } else {
      setVoiceState("listening");
    }
  };

  const handleReset = () => {
    setIsComplete(false);
    setVoiceState("listening");
    setTranscript("I'm having pain in my chest since yesterday.");
    setActiveExtraction(SAMPLE_UTTERANCES[0].extracted);
  };

  return (
    <div className="w-full space-y-8">
      {!isComplete ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT: The Signature MediKiosk Waveform & Voice Intake Stage (7 Cols) */}
          <div className="lg:col-span-7 bg-white border border-[#E7E4DD] rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            {/* Greeting Header */}
            <div className="text-center space-y-2 pb-4 border-b border-[#F2F0EB]">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EEEAFE] border border-[#7C6EF7]/20 text-[#7C6EF7] text-xs font-extrabold">
                <HeartPulse className="w-3.5 h-3.5" />
                <span>MediKiosk Point-of-Entry Intake Station</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111111] tracking-tight">
                Good morning, {patientName}.
              </h2>
              <p className="text-sm font-semibold text-[#5F5E5A]">
                Tell us what brings you here today.
              </p>
            </div>

            {/* Central Animated Waveform Visualizer Card */}
            <div className="relative rounded-3xl overflow-hidden border border-[#E7E4DD] bg-[#111111] shadow-xs">
              {/* Waveform Canvas */}
              <div className="w-full h-52 sm:h-60 relative">
                <canvas
                  ref={canvasRef}
                  className="w-full h-full block cursor-pointer"
                  onClick={handleToggleVoice}
                  title="Click to toggle voice state"
                />

                {/* Status Overlay Badge */}
                <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#111111]/80 backdrop-blur-md border border-white/10 text-white text-xs font-bold">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      voiceState === "listening"
                        ? "bg-[#12B981] animate-pulse"
                        : voiceState === "speaking"
                        ? "bg-[#7C6EF7] animate-pulse"
                        : "bg-[#F59E0B]"
                    }`}
                  />
                  <span className="capitalize">{voiceState}...</span>
                </div>

                {/* Language Channel Indicator (Top Right) */}
                <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#111111]/80 backdrop-blur-md border border-white/10 text-white text-xs font-mono font-bold">
                  <Languages className="w-3.5 h-3.5 text-[#06B6D4]" />
                  <span>Bhashini Indic AI</span>
                </div>
              </div>

              {/* Bottom Interactive Voice Control Strip */}
              <div className="p-4 bg-[#1A1A1A] border-t border-white/10 flex items-center justify-between gap-4">
                {/* 8-Dot Language Channel Wave Indicator */}
                <div className="flex items-center gap-1.5" title="Active Multilingual Audio Channels">
                  {[...Array(8)].map((_, i) => (
                    <span
                      key={i}
                      className={`w-2 h-2 rounded-full transition-all ${
                        voiceState === "listening" || voiceState === "speaking"
                          ? "bg-[#7C6EF7]"
                          : "bg-white/20"
                      }`}
                      style={{
                        animation:
                          voiceState === "listening" || voiceState === "speaking"
                            ? `pulse 1.2s ease-in-out infinite ${i * 0.15}s`
                            : "none"
                      }}
                    />
                  ))}
                </div>

                {/* Mic Trigger Button */}
                <button
                  type="button"
                  onClick={handleToggleVoice}
                  className="px-5 py-2 rounded-xl bg-[#7C6EF7] hover:bg-[#6758F0] text-white font-extrabold text-xs flex items-center gap-2 transition-all shadow-xs cursor-pointer"
                >
                  <Mic className="w-4 h-4" />
                  <span>{voiceState === "listening" ? "Listening Active" : "Tap to Speak"}</span>
                </button>
              </div>
            </div>

            {/* Live ASR Transcript Bubble */}
            <div className="p-5 rounded-2xl bg-[#FAFAFC] border border-[#E7E4DD] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-extrabold text-[#7C6EF7] uppercase tracking-wider">
                  Live Conversational Transcript:
                </span>
                <span className="text-[10px] font-bold text-[#12B981] bg-[#DCFCE7] px-2 py-0.5 rounded-md">
                  High Confidence (99.1%)
                </span>
              </div>
              <p className="text-sm font-semibold text-[#111111] italic leading-relaxed bg-white p-4 rounded-xl border border-[#E7E4DD]">
                "{transcript}"
              </p>
            </div>

            {/* One-Click Clinical Sample Triggers */}
            <div className="space-y-2 pt-1">
              <span className="text-xs font-bold text-[#5F5E5A] block">
                Or test with sample patient complaints:
              </span>
              <div className="flex flex-wrap gap-2">
                {SAMPLE_UTTERANCES.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectSample(sample)}
                    className="px-3 py-1.5 rounded-xl bg-[#FAFAFC] hover:bg-white text-xs font-bold text-[#111111] border border-[#E7E4DD] hover:border-[#7C6EF7] transition-all cursor-pointer shadow-xs"
                  >
                    {sample.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: Real-Time Structured Clinical Extraction Telemetry (5 Cols) */}
          <div className="lg:col-span-5 bg-white border border-[#E7E4DD] rounded-3xl p-6 sm:p-8 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#F2F0EB]">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#7C6EF7]" />
                <h3 className="font-extrabold text-sm text-[#111111]">
                  Real-Time Clinical Extraction
                </h3>
              </div>
              <span
                className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                  activeExtraction.triageLevel === "EMERGENCY"
                    ? "bg-[#FEE2E2] text-[#EF4444]"
                    : "bg-[#DCFCE7] text-[#12B981]"
                }`}
              >
                {activeExtraction.triageLevel} PRIORITY
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-[#FAFAFC] border border-[#E7E4DD]">
                <span className="text-[#8A8A8A] font-bold block uppercase text-[10px] mb-0.5">
                  Chief Complaint
                </span>
                <p className="font-extrabold text-[#111111]">
                  {activeExtraction.chiefComplaint}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#FAFAFC] border border-[#E7E4DD]">
                <span className="text-[#8A8A8A] font-bold block uppercase text-[10px] mb-0.5">
                  Onset &amp; Chronology
                </span>
                <p className="font-bold text-[#111111]">
                  {activeExtraction.onset}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#FAFAFC] border border-[#E7E4DD]">
                <span className="text-[#8A8A8A] font-bold block uppercase text-[10px] mb-0.5">
                  Pain Severity Score
                </span>
                <p className="font-extrabold text-[#EF4444]">
                  {activeExtraction.severity}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#FAFAFC] border border-[#E7E4DD]">
                <span className="text-[#8A8A8A] font-bold block uppercase text-[10px] mb-0.5">
                  Associated Symptoms
                </span>
                <p className="font-semibold text-[#111111]">
                  {activeExtraction.associated}
                </p>
              </div>

              {activeExtraction.triageLevel === "EMERGENCY" && (
                <div className="p-3.5 rounded-2xl bg-[#FEE2E2] border border-[#EF4444]/30 text-[#111111]">
                  <span className="font-extrabold text-[#EF4444] block text-[11px] mb-0.5">
                    🚨 Emergency Alert: Immediate Triage Protocol
                  </span>
                  <span className="text-[11px] text-[#5F5E5A]">
                    Routing patient directly to Cardiology OPD with Stat ECG order pre-generated.
                  </span>
                </div>
              )}
            </div>

            {/* Complete Intake Action Button */}
            <button
              type="button"
              onClick={() => setIsComplete(true)}
              className="w-full py-3.5 rounded-2xl bg-[#7C6EF7] hover:bg-[#6758F0] text-white font-extrabold text-xs transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer mt-4"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Complete Intake &amp; Generate OPD Token Slip</span>
            </button>
          </div>
        </div>
      ) : (
        /* Printable OPD Triage Token Slip */
        <div className="max-w-2xl mx-auto bg-white border border-[#E7E4DD] rounded-3xl p-8 sm:p-10 shadow-md text-center space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-[#DCFCE7] text-[#12B981] mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#7C6EF7] block mb-1">
              Clinical Intake Completed
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111111]">
              Patient OPD Token #104
            </h2>
            <p className="text-xs text-[#5F5E5A] mt-1">
              Assigned to: <strong>{activeExtraction.department} ({activeExtraction.roomNumber})</strong>
            </p>
          </div>

          {/* Token Summary Card */}
          <div className="p-6 rounded-2xl bg-[#FAFAFC] border border-[#E7E4DD] text-left text-xs space-y-3">
            <div className="flex justify-between py-1.5 border-b border-[#F2F0EB]">
              <span className="text-[#5F5E5A]">Patient Name:</span>
              <span className="font-extrabold text-[#111111]">{patientName} (38Y / Male)</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#F2F0EB]">
              <span className="text-[#5F5E5A]">Triage Priority:</span>
              <span className="font-extrabold text-[#EF4444]">{activeExtraction.triageLevel}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#F2F0EB]">
              <span className="text-[#5F5E5A]">Chief Complaint:</span>
              <span className="font-bold text-[#111111]">{activeExtraction.chiefComplaint}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#F2F0EB]">
              <span className="text-[#5F5E5A]">HPI Duration &amp; Severity:</span>
              <span className="font-semibold text-[#111111]">{activeExtraction.onset} • Score {activeExtraction.severity}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-[#5F5E5A]">ABDM Status:</span>
              <span className="font-extrabold text-[#12B981]">Linked (91-4567-8901-2345)</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleReset}
              className="w-full sm:w-auto px-5 py-2.5 rounded-2xl border border-[#E7E4DD] bg-[#FAFAFC] hover:bg-white text-xs font-bold text-[#5F5E5A] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Start New Intake</span>
            </button>

            <Link
              href="/doctor"
              className="w-full sm:w-auto px-6 py-2.5 rounded-2xl bg-[#7C6EF7] hover:bg-[#6758F0] text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs"
            >
              <Stethoscope className="w-4 h-4" />
              <span>Open in Doctor Workstation</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
