"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Mic,
  MicOff,
  Send,
  RotateCcw,
  Languages,
  Activity,
  FileText,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Volume2,
  Sparkles,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { VoiceWaveform, useAudioLevel } from "@/components/visualization/VoiceWaveform";
import { AnatomyBodyMap, AnatomicalRegion } from "@/components/visualization/AnatomyBodyMap";
import { SocratesRadar, SocratesData } from "@/components/visualization/SocratesRadar";
import { ClinicalPainGauge } from "@/components/visualization/ClinicalPainGauge";
import { PrescriptionScanner } from "@/components/visualization/PrescriptionScanner";
import { ClinicalTriageToken } from "@/components/visualization/ClinicalTriageToken";
import { useKioskStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

const INDIC_LANGUAGES = [
  { code: "hi", name: "Hindi (हिंदी)", flag: "🇮🇳", nativePrompt: "नमस्ते, अपनी समस्या बताएं" },
  { code: "te", name: "Telugu (తెలుగు)", flag: "🇮🇳", nativePrompt: "నమస్కారం, మీ సమస్య చెప్పండి" },
  { code: "en", name: "English", flag: "🇬🇧", nativePrompt: "Hello, tell me how you are feeling" },
  { code: "ta", name: "Tamil (தமிழ்)", flag: "🇮🇳", nativePrompt: "வணக்கம், உங்கள் பிரச்சனையை சொல்லுங்கள்" },
  { code: "bn", name: "Bengali (বাংলা)", flag: "🇮🇳", nativePrompt: "নমস্কার, আপনার সমস্যার কথা বলুন" },
  { code: "mr", name: "Marathi (मराठी)", flag: "🇮🇳", nativePrompt: "नमस्कार, तुमची अडचण सांगा" },
  { code: "kn", name: "Kannada (ಕನ್ನಡ)", flag: "🇮🇳", nativePrompt: "ನಮಸ್ಕಾರ, ನಿಮ್ಮ ಸಮಸ್ಯೆಯನ್ನು ತಿಳಿಸಿ" },
];

const KIOSK_STEPS = [
  { id: "language", label: "1. Language", icon: Languages },
  { id: "voice", label: "2. Voice & Body Map", icon: Mic },
  { id: "pain", label: "3. Pain Score", icon: Activity },
  { id: "scanner", label: "4. Prescription OCR", icon: FileText },
  { id: "token", label: "5. Digital Token", icon: CheckCircle2 },
];

export function KioskExperience() {
  const router = useRouter();
  const {
    language,
    isRecording,
    transcript,
    entities,
    setLanguage,
    setRecording,
    setTranscript,
    addEntities,
    resetKiosk,
  } = useKioskStore();

  const [activeStepIndex, setActiveStepIndex] = useState<number>(1);
  const [aiSpokenResponse, setAiSpokenResponse] = useState<string>(
    "Namaste. I am Aarogya Mitra, your clinical triage assistant. Tell me what brings you in today — where does it hurt, and how long has it been?"
  );
  const [quickReplies, setQuickReplies] = useState<string[]>([
    "Severe headache for 2 days",
    "Chest heaviness and shortness of breath",
    "Sharp stomach pain after meals",
    "High fever with chills",
  ]);
  const [redFlag, setRedFlag] = useState<boolean>(false);
  const [redFlagDetail, setRedFlagDetail] = useState<string>("");
  const [textInput, setTextInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [socratesState, setSocratesState] = useState<SocratesData>({
    site: "Thorax / Chest",
    onset: "Gradual over 3 days",
    character: "Constricting pressure",
    radiation: "Non-radiating",
    associations: ["Nocturnal fever", "Fatigue"],
    timing: "Evening spikes",
    exacerbating_relieving: "Worse on exertion",
    severity_score: 7,
  });
  const [painScore, setPainScore] = useState<number>(7);
  const [sessionId] = useState<string>(() => "kiosk_" + Math.random().toString(36).substring(2, 9));

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  const { level } = useAudioLevel(isRecording);

  useEffect(() => {
    audioElementRef.current = new Audio();
    return () => {
      if (audioElementRef.current) {
        audioElementRef.current.pause();
      }
    };
  }, []);

  const playTTSAudio = (base64Audio?: string | null) => {
    if (!base64Audio) return;
    try {
      if (audioElementRef.current) {
        audioElementRef.current.src = base64Audio;
        audioElementRef.current.play().catch((e) => console.log("Audio note:", e));
      }
    } catch (err) {
      console.error("TTS playback error:", err);
    }
  };

  const processResponseData = (data: any) => {
    setAiSpokenResponse(data.spoken_response);
    setRedFlag(Boolean(data.red_flag_triggered));
    setQuickReplies(data.quick_replies || []);

    if (data.language_code && data.language_code !== language) {
      setLanguage(data.language_code);
    }

    const state = data.clinical_state;
    if (state) {
      if (state.socrates) {
        setSocratesState(state.socrates);
        if (state.socrates.severity_score) {
          setPainScore(state.socrates.severity_score);
        }
      }

      if (state.red_flags && state.red_flags.length > 0) {
        setRedFlag(true);
        setRedFlagDetail(state.red_flags[0].action_required || "Immediate physician alert triggered.");
      }

      const extractedList: any[] = [];
      if (state.chief_complaints && state.chief_complaints.length > 0) {
        extractedList.push({
          id: "e-chief",
          label: "Chief Complaint",
          value: state.chief_complaints.join(", "),
          source: "voice",
        });
      }
      const s = state.socrates;
      if (s) {
        if (s.site) extractedList.push({ id: "e-site", label: "Location", value: s.site, source: "voice" });
        if (s.onset) extractedList.push({ id: "e-onset", label: "Onset", value: s.onset, source: "voice" });
        if (s.character) extractedList.push({ id: "e-char", label: "Character", value: s.character, source: "voice" });
        if (s.radiation) extractedList.push({ id: "e-rad", label: "Radiation", value: s.radiation, source: "voice" });
        if (s.duration_days) extractedList.push({ id: "e-dur", label: "Duration", value: `${s.duration_days} days`, source: "voice" });
        if (s.severity_score) extractedList.push({ id: "e-sev", label: "Severity", value: `${s.severity_score}/10`, source: "voice" });
      }
      addEntities(extractedList);
    }

    playTTSAudio(data.audio_base64);
  };

  const sendTextMessage = async (text: string) => {
    if (!text.trim()) return;
    setIsLoading(true);
    setTranscript(text);
    setTextInput("");

    try {
      const resp = await fetch(`${BACKEND_URL}/api/v1/ai/chat-intake`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          transcript: text,
          language_code: language,
          synthesize_audio: true,
        }),
      });
      const data = await resp.json();
      processResponseData(data);
    } catch (err) {
      console.error("Failed chat intake:", err);
      setAiSpokenResponse("Network connection retry. Please check backend server.");
    } finally {
      setIsLoading(false);
    }
  };

  const startListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
        setIsLoading(true);

        const formData = new FormData();
        formData.append("file", audioBlob, "patient_speech.wav");
        formData.append("session_id", sessionId);
        formData.append("language_code", language);
        formData.append("synthesize_audio", "true");

        try {
          const resp = await fetch(`${BACKEND_URL}/api/v1/ai/voice-intake`, {
            method: "POST",
            body: formData,
          });
          const data = await resp.json();
          setTranscript(data.clinical_state?.raw_transcripts?.slice(-1)[0] || "Audio recorded");
          processResponseData(data);
        } catch (err) {
          console.error("Voice upload error:", err);
          setAiSpokenResponse("Voice processing failed. Please try speaking again or click an option.");
        } finally {
          setIsLoading(false);
        }
      };

      mediaRecorder.start();
      setRecording(true);
    } catch (err) {
      console.warn("Microphone fallback:", err);
      setRecording(false);
    }
  };

  const stopListening = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
    }
    setRecording(false);
  };

  const handleRegionSelect = (region: AnatomicalRegion, symptom?: string) => {
    setSocratesState((prev) => ({ ...prev, site: region }));
    const msg = symptom ? `I have ${symptom} in my ${region}` : `I have severe pain in my ${region}`;
    sendTextMessage(msg);
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Step Navigation Pill Bar */}
        <div className="rounded-3xl border border-slate-100 bg-white p-3 shadow-xs overflow-x-auto">
          <div className="flex items-center justify-between gap-2 min-w-[540px]">
            {KIOSK_STEPS.map((step, idx) => {
              const Icon = step.icon;
              const isActive = activeStepIndex === idx;
              const isCompleted = activeStepIndex > idx;
              return (
                <button
                  key={step.id}
                  onClick={() => setActiveStepIndex(idx)}
                  className={cn(
                    "flex items-center gap-2 rounded-2xl px-4 py-2 text-xs font-bold transition-all",
                    isActive
                      ? "bg-purple-flow text-white shadow-purple"
                      : isCompleted
                      ? "bg-[#E6FAF3] text-[#00C9A7]"
                      : "text-[#6B7280] hover:bg-slate-50"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{step.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Emergency Alert Banner */}
        {redFlag && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border border-[#FF6B9A]/40 bg-[#FF6B9A]/10 p-4 text-left shadow-xs flex items-start gap-3 text-[#FF6B9A]"
          >
            <AlertTriangle className="h-5 w-5 text-[#FF6B9A] shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-[#FF6B9A]">
                Critical Red-Flag Detected (Emergency Protocol Active)
              </p>
              <p className="text-sm font-semibold text-[#0D1B2A] mt-0.5">
                {redFlagDetail || "Acute symptom configuration identified. Triage status upgraded to emergency."}
              </p>
            </div>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {/* STEP 1: Language Selection */}
          {activeStepIndex === 0 && (
            <motion.div
              key="lang-step"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="max-w-3xl mx-auto text-center py-6 space-y-6"
            >
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F3E6FF] px-3.5 py-1 text-xs font-extrabold uppercase tracking-wider text-[#6A5CFF]">
                  <Languages className="h-3.5 w-3.5" /> Step 1 of 5
                </span>
                <h2 className="font-sans text-3xl md:text-4xl font-extrabold text-[#0D1B2A] mt-2">
                  Select Your Preferred Language
                </h2>
                <p className="text-sm text-[#6B7280] mt-1">
                  MediKiosk understands 7+ Indian languages with clinical precision.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {INDIC_LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLanguage(lang.code);
                      setActiveStepIndex(1);
                    }}
                    className={cn(
                      "rounded-3xl border p-5 text-left transition-all hover:scale-[1.02] shadow-xs cursor-pointer",
                      language === lang.code
                        ? "border-[#6A5CFF] bg-[#F3E6FF]/60 ring-2 ring-[#6A5CFF]/30"
                        : "border-slate-100 bg-white hover:border-slate-200"
                    )}
                  >
                    <span className="text-3xl">{lang.flag}</span>
                    <h3 className="font-sans text-base font-bold text-[#0D1B2A] mt-3">{lang.name}</h3>
                    <p className="text-xs text-[#6B7280] mt-0.5">{lang.nativePrompt}</p>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* STEP 2: Main Voice Dialogue & Interactive Body Map */}
          {activeStepIndex === 1 && (
            <motion.div
              key="voice-step"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
            >
              {/* Left Column: Conversational AI Dialogue & Voice Waveform (7 cols) */}
              <div className="lg:col-span-7 space-y-6">
                {/* Spoken AI Dialogue Card */}
                <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm text-left">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-8 w-8 items-center justify-center rounded-2xl bg-purple-flow text-white text-xs font-black">
                        ⚕
                      </span>
                      <div>
                        <p className="text-xs font-extrabold uppercase tracking-wider text-[#6A5CFF]">
                          Aarogya Mitra · Clinical Triage AI
                        </p>
                        <p className="text-[10px] text-[#6B7280]">Zero-hallucination intake assistant</p>
                      </div>
                    </div>
                    <span className="rounded-full bg-[#E6FAF3] px-3 py-1 text-xs font-bold text-[#00C9A7]">
                      Live Voice Stream
                    </span>
                  </div>

                  {/* AI Response Bubble */}
                  <div className="mt-5 rounded-2xl bg-[#F8FAFC] border border-slate-100 p-5">
                    <p className="font-sans text-lg md:text-xl font-bold text-[#0D1B2A] leading-relaxed">
                      “{aiSpokenResponse}”
                    </p>
                  </div>

                  {/* Patient Transcript Card */}
                  {transcript && (
                    <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
                        You Spoke:
                      </p>
                      <p className="text-sm font-semibold text-[#0D1B2A] mt-1">“{transcript}”</p>
                    </div>
                  )}

                  {/* Quick Reply Suggestions */}
                  {quickReplies.length > 0 && (
                    <div className="mt-5">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280] mb-2">
                        Suggested Clinical Responses:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {quickReplies.map((reply, idx) => (
                          <button
                            key={idx}
                            onClick={() => sendTextMessage(reply)}
                            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-[#0D1B2A] hover:border-[#6A5CFF] hover:bg-[#F3E6FF]/50 transition-all shadow-xs"
                          >
                            + {reply}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Push-to-Talk Waveform Controller */}
                <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm text-center">
                  <VoiceWaveform active={isRecording} level={level} />

                  <div className="mt-6 flex flex-col items-center justify-center">
                    {isRecording ? (
                      <button
                        onClick={stopListening}
                        className="flex items-center gap-3 rounded-full bg-[#FF6B9A] px-8 py-4 text-sm font-extrabold text-white shadow-lg transition-transform hover:scale-105"
                      >
                        <MicOff className="h-4 w-4 animate-bounce" />
                        Done Speaking (Process Turn)
                      </button>
                    ) : (
                      <button
                        onClick={startListening}
                        className="inline-flex items-center gap-2.5 rounded-full bg-purple-flow px-8 py-4 text-sm font-extrabold text-white shadow-purple transition-transform hover:scale-105"
                      >
                        <Mic className="h-4 w-4" />
                        Tap to Speak in Your Language
                      </button>
                    )}
                    <p className="mt-2 text-xs text-[#6B7280]">
                      {isRecording ? "Listening to your voice..." : "Speak naturally in Hindi, Telugu, Tamil, English, etc."}
                    </p>
                  </div>

                  {/* Direct Typed Input */}
                  <div className="mt-6 flex gap-2 border-t border-slate-100 pt-4">
                    <input
                      type="text"
                      placeholder="Or describe symptoms here..."
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && sendTextMessage(textInput)}
                      className="flex-1 rounded-full border border-slate-200 bg-slate-50 px-5 py-2.5 text-sm text-[#0D1B2A] outline-none focus:border-[#6A5CFF] focus:bg-white transition-all"
                    />
                    <button
                      onClick={() => sendTextMessage(textInput)}
                      disabled={isLoading}
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-[#6A5CFF] text-white shadow-xs hover:bg-[#5949eb]"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Next Step Banner */}
                <div className="flex items-center justify-between rounded-3xl bg-white border border-slate-100 p-4 shadow-xs">
                  <div>
                    <p className="text-xs font-bold text-[#0D1B2A]">Ready to score pain severity?</p>
                    <p className="text-[11px] text-[#6B7280]">Proceed to visual Wong-Baker pain gauge</p>
                  </div>
                  <button
                    onClick={() => setActiveStepIndex(2)}
                    className="inline-flex items-center gap-1.5 rounded-full bg-purple-flow px-5 py-2.5 text-xs font-bold text-white shadow-purple"
                  >
                    <span>Next: Pain & Severity</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Right Column: Anatomical Body Map & SOCRATES Checklist (5 cols) */}
              <div className="lg:col-span-5 space-y-6">
                <AnatomyBodyMap
                  activeRegion={socratesState.site}
                  onSelectRegion={handleRegionSelect}
                  painScore={painScore}
                />
                <SocratesRadar socrates={socratesState} />
              </div>
            </motion.div>
          )}

          {/* STEP 3: Pain & Clinical Severity Gauges */}
          {activeStepIndex === 2 && (
            <motion.div
              key="pain-step"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-4xl mx-auto space-y-6 text-center"
            >
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FFF7E6] px-3.5 py-1 text-xs font-extrabold uppercase tracking-wider text-[#FFB703]">
                  <Activity className="h-3.5 w-3.5" /> Step 3 of 5
                </span>
                <h2 className="font-sans text-3xl md:text-4xl font-extrabold text-[#0D1B2A] mt-2">
                  Rate Your Symptom Severity
                </h2>
              </div>

              <ClinicalPainGauge
                score={painScore}
                onChange={(val) => {
                  setPainScore(val);
                  setSocratesState((prev) => ({ ...prev, severity_score: val }));
                  sendTextMessage(`My pain severity is ${val} out of 10`);
                }}
              />

              <SocratesRadar socrates={socratesState} />

              <div className="flex justify-between items-center pt-4">
                <button
                  onClick={() => setActiveStepIndex(1)}
                  className="rounded-full border border-slate-200 bg-white px-6 py-3 text-xs font-bold text-[#0D1B2A]"
                >
                  ← Back to Voice
                </button>
                <button
                  onClick={() => setActiveStepIndex(3)}
                  className="inline-flex items-center gap-1.5 rounded-full bg-purple-flow px-6 py-3 text-xs font-bold text-white shadow-purple"
                >
                  <span>Next: Prescription Scanner</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 4: Prescription OCR Scanner */}
          {activeStepIndex === 3 && (
            <motion.div
              key="scanner-step"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-4xl mx-auto space-y-6 text-center"
            >
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E8F2FF] px-3.5 py-1 text-xs font-extrabold uppercase tracking-wider text-[#6A5CFF]">
                  <FileText className="h-3.5 w-3.5" /> Step 4 of 5
                </span>
                <h2 className="font-sans text-3xl md:text-4xl font-extrabold text-[#0D1B2A] mt-2">
                  Scan Existing Prescriptions
                </h2>
              </div>

              <PrescriptionScanner onScanComplete={(meds) => console.log("Meds scanned:", meds)} />

              <div className="flex justify-between items-center pt-4">
                <button
                  onClick={() => setActiveStepIndex(2)}
                  className="rounded-full border border-slate-200 bg-white px-6 py-3 text-xs font-bold text-[#0D1B2A]"
                >
                  ← Back to Pain Scale
                </button>
                <button
                  onClick={() => setActiveStepIndex(4)}
                  className="inline-flex items-center gap-1.5 rounded-full bg-purple-flow px-6 py-3 text-xs font-bold text-white shadow-purple"
                >
                  <span>Generate Digital OPD Token</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 5: Digital OPD Token */}
          {activeStepIndex === 4 && (
            <motion.div
              key="token-step"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-3xl mx-auto text-center space-y-6"
            >
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E6FAF3] px-3.5 py-1 text-xs font-extrabold uppercase tracking-wider text-[#00C9A7]">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Intake Completed
                </span>
                <h2 className="font-sans text-3xl md:text-4xl font-extrabold text-[#0D1B2A] mt-2">
                  Your Pre-Consultation Summary is Ready
                </h2>
                <p className="text-sm text-[#6B7280] mt-1">
                  Present this digital token to the OPD consultation officer.
                </p>
              </div>

              <ClinicalTriageToken
                tokenNumber="A-104"
                urgencyLevel={redFlag ? "emergency" : painScore >= 7 ? "urgent" : "routine"}
                chiefComplaint={socratesState.site ? `${socratesState.site}: ${socratesState.character || "Pain"} (Severity ${painScore}/10)` : "Sub-sternal chest discomfort"}
                onProceedToDoctor={() => router.push("/doctor")}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppShell>
  );
}
