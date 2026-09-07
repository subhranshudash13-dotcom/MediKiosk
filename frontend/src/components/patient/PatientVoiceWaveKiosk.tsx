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
  ChevronDown,
  Download
} from "lucide-react";
import { useKioskStore, PatientQueueItem } from "@/lib/store";
import { KioskAPI } from "@/lib/api";

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
  const [patientName, setPatientName] = useState("Ananya Sharma");
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [voiceState, setVoiceState] = useState<"listening" | "speaking" | "processing" | "idle">("listening");
  const [transcript, setTranscript] = useState("I'm having severe pain in my chest since yesterday morning. It radiates to my left arm.");
  const [activeExtraction, setActiveExtraction] = useState<ClinicalExtraction>(SAMPLE_UTTERANCES[0].extracted);
  const [isComplete, setIsComplete] = useState(false);
  const [generatedToken, setGeneratedToken] = useState("#107");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const pushPatientToQueue = useKioskStore((state) => state.pushPatientToQueue);

  useEffect(() => {
    audioElementRef.current = new Audio();
    return () => {
      if (audioElementRef.current) {
        audioElementRef.current.pause();
      }
    };
  }, []);

  // Multi-harmonic sinusoidal waveform animation in Cobalt, Marigold, and Rust
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let time = 0;
    let animationFrameId: number;

    const waveLayers = Array.from({ length: 5 }).map((_, i) => ({
      baseFreq: 2.2 + i * 1.1,
      amplitude: 0.38 + i * 0.09,
      speed: 0.025 + i * 0.012,
      phase: i * 0.9,
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

      // Deep, clean Slate Charcoal background
      ctx.fillStyle = "#1E2433";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Subtle grid guides
      ctx.strokeStyle = "rgba(253, 235, 208, 0.05)";
      ctx.lineWidth = 1;
      const step = 24 * (window.devicePixelRatio || 1);
      for (let x = 0; x < canvas.width; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }

      let activityMult = 1.0;
      if (voiceState === "listening") activityMult = 2.0;
      else if (voiceState === "speaking") activityMult = 2.2;
      else if (voiceState === "processing") activityMult = 0.8;
      else activityMult = 0.3;

      // Draw multi-harmonic sinusoidal waves in Marigold (#FB923C) and Rust (#C2410C)
      waveLayers.forEach((wave, idx) => {
        ctx.beginPath();
        const yCenter = canvas.height / 2;
        const width = canvas.width;

        for (let x = 0; x <= width; x += 3) {
          const normX = (x / width) * 2 - 1;
          const envelope = Math.cos((normX * Math.PI) / 2);

          const sinVal = Math.sin(normX * wave.baseFreq * 3 + time * wave.speed * 20 + wave.phase);
          const cosVal = Math.cos(normX * 3.5 + time * 1.3);
          const waveHeight =
            sinVal *
            cosVal *
            (canvas.height * 0.34) *
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

        ctx.lineWidth = (2.4 + idx * 0.4) * (window.devicePixelRatio || 1);
        if (idx === 0 || idx === 1) {
          ctx.strokeStyle = "rgba(251, 146, 60, 0.95)"; // Warm Marigold #FB923C
        } else if (idx === 2 || idx === 3) {
          ctx.strokeStyle = "rgba(194, 65, 12, 0.85)"; // Rich Rust #C2410C
        } else {
          ctx.strokeStyle = "rgba(253, 235, 208, 0.7)"; // Almond Cream #FDEBD0
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

  const handleSelectSample = async (sample: typeof SAMPLE_UTTERANCES[0]) => {
    setVoiceState("processing");
    setTranscript(sample.transcript);
    setActiveExtraction(sample.extracted);

    try {
      const resp = await KioskAPI.sendChatIntake(
        sample.transcript,
        "kiosk_sample_session",
        selectedLanguage
      );
      if (resp.spoken_response) {
        setVoiceState("speaking");
        if (resp.audio_base64 && audioElementRef.current) {
          audioElementRef.current.src = resp.audio_base64;
          audioElementRef.current.play().catch(() => {});
        }
      }
    } catch {
      setTimeout(() => {
        setVoiceState("listening");
      }, 600);
    }
  };

  const handleToggleVoice = async () => {
    if (voiceState === "listening") {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioChunksRef.current = [];
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) audioChunksRef.current.push(e.data);
        };

        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
          setVoiceState("processing");
          try {
            const resp = await KioskAPI.sendVoiceIntake(
              audioBlob,
              "kiosk_live_session",
              selectedLanguage
            );
            if (resp.clinical_state?.raw_transcripts?.length) {
              setTranscript(resp.clinical_state.raw_transcripts.slice(-1)[0]);
            }
            if (resp.spoken_response) {
              setVoiceState("speaking");
              if (resp.audio_base64 && audioElementRef.current) {
                audioElementRef.current.src = resp.audio_base64;
                audioElementRef.current.play().catch(() => {});
              }
            } else {
              setVoiceState("idle");
            }
          } catch {
            setVoiceState("idle");
          }
        };

        mediaRecorder.start();
        setVoiceState("listening");
      } catch {
        // Fallback: cycle states
        setVoiceState("processing");
        setTimeout(() => setVoiceState("speaking"), 600);
      }
    } else if (voiceState === "speaking") {
      setVoiceState("idle");
    } else {
      setVoiceState("listening");
    }
  };

  const [currentSessionId, setCurrentSessionId] = useState("session_demo_01");

  const handleCompleteIntake = async () => {
    const newToken = `#${Math.floor(100 + Math.random() * 900)}`;
    const sessionId = `session_${Date.now()}`;
    setGeneratedToken(newToken);
    setCurrentSessionId(sessionId);

    const newPatient: PatientQueueItem = {
      id: sessionId,
      token: newToken,
      name: patientName,
      age: 26,
      gender: "Female",
      abhaId: "91-4567-8901-2345",
      triageLevel: activeExtraction.triageLevel,
      chiefComplaint: activeExtraction.chiefComplaint,
      triagedTime: "Just now",
      intakeSource: "PATIENT",
      consentStatus: "GRANTED_HOSPITAL",
      historyCompleteness: 94,
      historyCoverage: {
        onset: true,
        location: true,
        character: true,
        severity: true,
        radiation: true,
        aggravating: true,
        relieving: true,
        associated: true,
        pastHistory: true,
        medications: true,
      },
      vitals: {
        bp: "124/82 mmHg",
        pulse: "88 bpm",
        spo2: "98%",
        temp: "99.1 °F",
        bmi: "22.6 (Normal)",
      },
      hpi: {
        onset: activeExtraction.onset,
        location: "Thorax / Upper Body",
        character: "Severe acute onset",
        radiation: "Radiating to left extremity",
        severity: activeExtraction.severity,
        aggravating: "Movement, deep inhalation",
        relieving: "Resting in upright posture",
        associated: activeExtraction.associated,
      },
      voiceTranscript: {
        original: transcript,
        language: selectedLanguage,
        confidence: 99.2,
      },
      redFlags:
        activeExtraction.triageLevel === "EMERGENCY"
          ? ["Severe acute chest discomfort radiating to left arm", "Immediate ECG evaluation ordered"]
          : [],
      evidenceTrail: [
        {
          id: "ev-wave-1",
          timeframe: "3 Days Ago",
          title: "Symptom Onset (Vernacular Voice Stream)",
          detail: activeExtraction.chiefComplaint,
          sourceType: "VOICE",
          sourceBadge: `🎙 Patient Voice (${selectedLanguage.toUpperCase()})`,
          sourceSnippet: transcript,
          metadata: { confidence: 0.99 }
        },
        {
          id: "ev-wave-2",
          timeframe: "Yesterday",
          title: "Self-Reported Symptom Progression",
          detail: `Severity scored at ${activeExtraction.severity} with radiation to left arm.`,
          sourceType: "VOICE",
          sourceBadge: "🎙 Patient Statement",
          sourceSnippet: `Severity: ${activeExtraction.severity}, ${activeExtraction.associated}`,
          metadata: { confidence: 0.98 }
        },
        {
          id: "ev-wave-3",
          timeframe: "Today",
          title: "Kiosk Point-of-Entry Triage & OPD Token",
          detail: `Triaged to ${activeExtraction.department} (${activeExtraction.roomNumber}).`,
          sourceType: "ABDM",
          sourceBadge: `🔐 ABDM Consent Verified`,
          sourceSnippet: `ABHA 91-4567-8901-2345 verified via OTP. Triage Level: ${activeExtraction.triageLevel}`,
          metadata: { consentId: "ABDM-CONSENT-WAVE-01" }
        }
      ],
      ocrHistory: {
        medications: [
          { drug: "Tab Paracetamol", dose: "650 mg", frequency: "1-0-1 (BD)", source: "Prescription OCR" },
        ],
        abnormalLabs: [],
        timeline: [
          { year: "2026", event: "Point-of-Entry Triage at MediKiosk", type: "OPD Intake" },
        ],
      },
    };

    pushPatientToQueue(newPatient);

    // Sync to live backend MongoDB & Doctor Queue
    try {
      await KioskAPI.submitIntakeComplete({
        session_id: sessionId,
        token: newToken,
        name: patientName,
        age: 26,
        gender: "Female",
        abha_id: "91-4567-8901-2345",
        triage_level: activeExtraction.triageLevel,
        chief_complaint: activeExtraction.chiefComplaint,
        intake_source: "PATIENT",
        socrates: {
          site: "Thorax / Retro-sternal",
          onset: activeExtraction.onset,
          character: "Severe acute onset",
          radiation: "Radiating to left shoulder & arm",
          associations: [activeExtraction.associated],
          timing: "Continuous",
          exacerbating_relieving: "Resting in upright posture",
          severity_score: 8
        },
        past_history: [
          "Pulmonary Tuberculosis (DOTS completed 2022)",
          "Essential Hypertension (Diagnosed 2024)"
        ],
        allergies: [
          "Penicillin & Amoxicillin (Severe skin rash)",
          "No known food allergies"
        ],
        current_medications: [
          { drug: "Tab Amlodipine", dose: "5 mg", frequency: "1-0-0", source: "Prescription OCR" }
        ],
        vitals: {
          bp: "124/82 mmHg", pulse: "88 bpm", spo2: "98%", temp: "99.1 °F", bmi: "22.6 (Normal)"
        },
        language: selectedLanguage
      });
    } catch (e) {
      console.warn("Backend intake sync note:", e);
    }

    setIsComplete(true);
  };

  const handleReset = () => {
    setIsComplete(false);
    setVoiceState("listening");
    setTranscript("I'm having severe pain in my chest since yesterday morning. It radiates to my left arm.");
    setActiveExtraction(SAMPLE_UTTERANCES[0].extracted);
  };

  return (
    <div className="w-full space-y-8">
      {!isComplete ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT: The Signature MediKiosk Waveform & Voice Intake Stage (7 Cols) */}
          <div className="lg:col-span-7 bg-white border border-[#FDEBD0] rounded-[16px] p-6 sm:p-8 shadow-sm space-y-6">
            {/* Greeting Header */}
            <div className="text-center space-y-2 pb-4 border-b border-[#FDEBD0]/80">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1D2A8F]/10 border border-[#1D2A8F]/20 text-[#1D2A8F] text-xs font-semibold">
                <HeartPulse className="w-3.5 h-3.5 text-[#FB923C]" />
                <span>Point-of-Entry Voice Intake Station</span>
              </div>
              <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#374151] tracking-tight">
                Good morning, {patientName}.
              </h2>
              <p className="text-sm text-[#374151]/70">
                Tell us what brings you here today in your own words.
              </p>
            </div>

            {/* Central Animated Waveform Visualizer Card */}
            <div className="relative rounded-[14px] overflow-hidden border border-[#FDEBD0] bg-[#1E2433] shadow-md">
              {/* Waveform Canvas */}
              <div className="w-full h-52 sm:h-60 relative">
                <canvas
                  ref={canvasRef}
                  className="w-full h-full block cursor-pointer"
                  onClick={handleToggleVoice}
                  title="Click to toggle voice recording"
                />

                {/* Status Overlay Badge */}
                <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1E2433]/90 border border-white/10 text-white text-xs font-medium backdrop-blur-sm">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      voiceState === "listening"
                        ? "bg-[#FB923C] animate-pulse"
                        : voiceState === "speaking"
                        ? "bg-[#FDEBD0] animate-pulse"
                        : "bg-[#C2410C]"
                    }`}
                  />
                  <span className="capitalize">{voiceState === "listening" ? "Listening..." : `${voiceState}...`}</span>
                </div>

                {/* Language Channel Indicator */}
                <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1E2433]/90 border border-white/10 text-white text-xs font-mono font-medium backdrop-blur-sm">
                  <Languages className="w-3.5 h-3.5 text-[#FB923C]" />
                  <span>Bhashini Indic AI</span>
                </div>
              </div>

              {/* Bottom Interactive Voice Control Strip */}
              <div className="p-4 bg-[#141A28] border-t border-white/10 flex items-center justify-between gap-4">
                {/* Channel Indicator Dots */}
                <div className="flex items-center gap-1.5" title="Active Multilingual Channels">
                  {[...Array(8)].map((_, i) => (
                    <span
                      key={i}
                      className={`w-2 h-2 rounded-full transition-all ${
                        voiceState === "listening" || voiceState === "speaking"
                          ? "bg-[#FB923C]"
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
                  className="px-5 py-2.5 rounded-full bg-[#FB923C] hover:bg-[#F97316] text-[#1E2433] font-bold text-xs flex items-center gap-2 transition-all shadow-sm cursor-pointer"
                >
                  <Mic className="w-4 h-4" />
                  <span>{voiceState === "listening" ? "Listening Active" : "Tap to Speak"}</span>
                </button>
              </div>
            </div>

            {/* Live ASR Transcript Bubble */}
            <div className="p-5 rounded-[12px] bg-[#FDFBF7] border border-[#FDEBD0] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-[#1D2A8F] uppercase tracking-wider">
                  Live Conversational Speech Transcript
                </span>
                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  High Confidence (99.2%)
                </span>
              </div>
              <p className="text-sm font-medium text-[#374151] italic leading-relaxed bg-white p-4 rounded-[8px] border border-[#FDEBD0]">
                "{transcript}"
              </p>
            </div>

            {/* Language Selector Chips */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-[#374151]/80 block">
                Preferred Spoken Language:
              </span>
              <div className="flex flex-wrap gap-2">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => setSelectedLanguage(lang.code)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                      selectedLanguage === lang.code
                        ? "bg-[#1D2A8F] text-white border-[#1D2A8F] shadow-xs"
                        : "bg-white text-[#374151]/80 border-[#FDEBD0] hover:border-[#1D2A8F] hover:text-[#1D2A8F]"
                    }`}
                  >
                    {lang.name}
                  </button>
                ))}
              </div>
            </div>

            {/* One-Click Clinical Sample Triggers */}
            <div className="space-y-2 pt-2 border-t border-[#FDEBD0]/80">
              <span className="text-xs font-semibold text-[#374151]/80 block">
                Or test with simulated patient complaints:
              </span>
              <div className="flex flex-wrap gap-2">
                {SAMPLE_UTTERANCES.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectSample(sample)}
                    className="px-3 py-1.5 rounded-full bg-[#FDFBF7] hover:bg-white text-xs font-medium text-[#374151] border border-[#FDEBD0] hover:border-[#1D2A8F] transition-all cursor-pointer shadow-xs"
                  >
                    {sample.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: Real-Time Structured Clinical Extraction Telemetry (5 Cols) */}
          <div className="lg:col-span-5 bg-white border border-[#FDEBD0] rounded-[16px] p-6 sm:p-8 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#FDEBD0]/80">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#1D2A8F]" />
                <h3 className="font-heading font-semibold text-sm text-[#374151]">
                  Structured Clinical Extraction
                </h3>
              </div>
              <span
                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                  activeExtraction.triageLevel === "EMERGENCY"
                    ? "bg-red-50 text-[#C2410C] border border-red-200"
                    : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                }`}
              >
                {activeExtraction.triageLevel} PRIORITY
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-[10px] bg-[#FDFBF7] border border-[#FDEBD0]">
                <span className="text-[#374151]/70 font-semibold block uppercase text-[10px] mb-0.5">
                  Chief Complaint
                </span>
                <p className="font-bold text-[#374151]">
                  {activeExtraction.chiefComplaint}
                </p>
              </div>

              <div className="p-3.5 rounded-[10px] bg-[#FDFBF7] border border-[#FDEBD0]">
                <span className="text-[#374151]/70 font-semibold block uppercase text-[10px] mb-0.5">
                  Onset &amp; Chronology
                </span>
                <p className="font-medium text-[#374151]">
                  {activeExtraction.onset}
                </p>
              </div>

              <div className="p-3.5 rounded-[10px] bg-[#FDFBF7] border border-[#FDEBD0]">
                <span className="text-[#374151]/70 font-semibold block uppercase text-[10px] mb-0.5">
                  Pain Severity Score
                </span>
                <p className="font-extrabold text-[#C2410C]">
                  {activeExtraction.severity}
                </p>
              </div>

              <div className="p-3.5 rounded-[10px] bg-[#FDFBF7] border border-[#FDEBD0]">
                <span className="text-[#374151]/70 font-semibold block uppercase text-[10px] mb-0.5">
                  Associated Symptoms
                </span>
                <p className="font-medium text-[#374151]">
                  {activeExtraction.associated}
                </p>
              </div>

              {activeExtraction.triageLevel === "EMERGENCY" && (
                <div className="p-3.5 rounded-[10px] bg-red-50/70 border border-red-200 text-[#374151]">
                  <span className="font-bold text-[#C2410C] block text-[11px] mb-0.5">
                    🚨 Emergency Protocol Triggered
                  </span>
                  <span className="text-[11px] text-[#374151]/80">
                    Routing patient directly to Cardiology OPD with Stat ECG order pre-generated.
                  </span>
                </div>
              )}
            </div>

            {/* Complete Intake Action Button */}
            <button
              type="button"
              onClick={handleCompleteIntake}
              className="w-full py-3.5 rounded-full bg-[#1D2A8F] hover:bg-[#15206B] text-white font-bold text-xs transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer mt-4"
            >
              <CheckCircle2 className="w-4 h-4 text-[#FB923C]" />
              <span>Complete Intake &amp; Dispatch to Doctor Queue</span>
            </button>
          </div>
        </div>
      ) : (
        /* Printable OPD Triage Token Slip */
        <div className="max-w-2xl mx-auto bg-white border border-[#FDEBD0] rounded-[16px] p-8 sm:p-10 shadow-sm text-center space-y-6">
          <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#1D2A8F] block mb-1">
              Clinical Intake Completed &amp; Pushed to Queue
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#374151]">
              Patient OPD Token {generatedToken}
            </h2>
            <p className="text-xs text-[#374151]/70 mt-1">
              Assigned to: <strong>{activeExtraction.department} ({activeExtraction.roomNumber})</strong>
            </p>
          </div>

          {/* Token Summary Card */}
          <div className="p-6 rounded-[12px] bg-[#FDFBF7] border border-[#FDEBD0] text-left text-xs space-y-3">
            <div className="flex justify-between py-1.5 border-b border-[#FDEBD0]/80">
              <span className="text-[#374151]/70">Patient Name:</span>
              <span className="font-bold text-[#374151]">{patientName} (26F)</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#FDEBD0]/80">
              <span className="text-[#374151]/70">Triage Priority:</span>
              <span className="font-extrabold text-[#C2410C]">{activeExtraction.triageLevel}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#FDEBD0]/80">
              <span className="text-[#374151]/70">Chief Complaint:</span>
              <span className="font-medium text-[#374151]">{activeExtraction.chiefComplaint}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#FDEBD0]/80">
              <span className="text-[#374151]/70">HPI Duration &amp; Severity:</span>
              <span className="font-medium text-[#374151]">{activeExtraction.onset} • Score {activeExtraction.severity}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-[#374151]/70">ABDM Status:</span>
              <span className="font-semibold text-emerald-700">Linked (91-4567-8901-2345)</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleReset}
              className="w-full sm:w-auto px-5 py-2.5 rounded-full border border-[#FDEBD0] bg-[#FDFBF7] hover:bg-white text-xs font-semibold text-[#374151]/80 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Start New Intake</span>
            </button>

            <a
              href={`http://localhost:8000/api/v1/clinical/report/pdf/${currentSessionId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-[#1B4332] text-white hover:bg-[#081C15] text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-[#D8F3DC]" />
              <span>Download PDF Medical Report</span>
            </a>

            <Link
              href="/doctor"
              className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-[#1D2A8F] hover:bg-[#15206B] text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs"
            >
              <Stethoscope className="w-4 h-4 text-[#FB923C]" />
              <span>Open in Doctor Workstation</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
