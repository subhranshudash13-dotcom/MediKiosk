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
  HeartPulse,
  ChevronLeft,
  User,
  Users,
  Lock,
  Layers
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { VoiceWaveform, useAudioLevel } from "@/components/visualization/VoiceWaveform";
import { AnatomyBodyMap, AnatomicalRegion } from "@/components/visualization/AnatomyBodyMap";
import { SocratesRadar, SocratesData } from "@/components/visualization/SocratesRadar";
import { ClinicalPainGauge } from "@/components/visualization/ClinicalPainGauge";
import { PrescriptionScanner } from "@/components/visualization/PrescriptionScanner";
import { ClinicalTriageToken } from "@/components/visualization/ClinicalTriageToken";
import { AudioConsentModal } from "@/components/clinical/AudioConsentModal";
import { useKioskStore, PatientQueueItem, EvidenceTimelineItem } from "@/lib/store";
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
  { id: "language", label: "1. Language & Mode", icon: Languages },
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
    intakeMode,
    caregiverRelation,
    consentGranted,
    consentType,
    setLanguage,
    setRecording,
    setTranscript,
    setIntakeMode,
    setConsent,
    resetKiosk,
    pushPatientToQueue
  } = useKioskStore();

  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [patientName, setPatientName] = useState<string>("Ananya Sharma");
  const [patientAge, setPatientAge] = useState<number>(28);
  const [patientGender, setPatientGender] = useState<string>("Female");
  const [patientAbha, setPatientAbha] = useState<string>("91-4567-8901-2345");
  const [isConsentModalOpen, setIsConsentModalOpen] = useState(false);
  const [scannedMedications, setScannedMedications] = useState<Array<{ drug: string; dose: string; frequency: string }>>([
    { drug: "Tab Paracetamol", dose: "650 mg", frequency: "1-0-1" },
    { drug: "Cap Pantoprazole", dose: "40 mg", frequency: "1-0-0 (Empty Stomach)" }
  ]);

  const [aiSpokenResponse, setAiSpokenResponse] = useState<string>(
    "Good morning. I am your clinical intake assistant. Tell us what brings you here today — where does it hurt, and how long has it been?"
  );
  const [quickReplies, setQuickReplies] = useState<string[]>([
    "Severe chest tightness for 2 days",
    "High fever with chills and headache",
    "Sharp stomach pain after eating",
    "Persistent cough with shortness of breath",
  ]);
  const [redFlag, setRedFlag] = useState<boolean>(false);
  const [redFlagDetail, setRedFlagDetail] = useState<string>("");
  const [textInput, setTextInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [socratesState, setSocratesState] = useState<SocratesData>({
    site: "Thorax / Chest",
    onset: "Gradual over 2 days",
    character: "Constricting pressure",
    radiation: "Radiating to left shoulder",
    associations: ["Nocturnal fever", "Fatigue"],
    timing: "Evening worsening",
    exacerbating_relieving: "Worse on exertion",
    severity_score: 7,
  });
  const [painScore, setPainScore] = useState<number>(7);
  const [generatedTokenNumber, setGeneratedTokenNumber] = useState<string>("A-104");
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
        audioElementRef.current.play().catch(() => {});
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
    }

    if (data.audio_base64) {
      playTTSAudio(data.audio_base64);
    }
  };

  const sendTextMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;
    setTranscript(textToSend);
    setTextInput("");
    setIsLoading(true);

    try {
      const resp = await fetch(`${BACKEND_URL}/api/v1/ai/chat-intake`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript: textToSend,
          session_id: sessionId,
          language_code: language,
          synthesize_audio: true,
        }),
      });
      const data = await resp.json();
      processResponseData(data);
    } catch (err) {
      console.error("Failed chat intake:", err);
      setAiSpokenResponse("Network retry. Please check backend connection.");
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

  const handleGenerateToken = () => {
    const token = `#${Math.floor(100 + Math.random() * 900)}`;
    setGeneratedTokenNumber(token);

    const isEmerg = redFlag || painScore >= 8;
    const isUrg = painScore >= 6;

    // Build rich Evidence Trail for the Clinical Storyboard
    const evidence: EvidenceTimelineItem[] = [
      {
        id: "ev-live-1",
        timeframe: socratesState.onset || "3 Days Ago",
        title: "Initial Symptom Onset (Spoken Intake)",
        detail: `Reported ${socratesState.character || "discomfort"} in ${socratesState.site || "body"} with severity score ${painScore}/10.`,
        sourceType: intakeMode === "CAREGIVER" ? "CAREGIVER" : "VOICE",
        sourceBadge: intakeMode === "CAREGIVER" ? `👵 Caregiver Statement (${caregiverRelation || "Family"})` : `🎙 Patient Voice (${language.toUpperCase()})`,
        sourceSnippet: transcript || "कल रात से छाती में बहुत तेज दर्द और भारीपन है।",
        metadata: { confidence: 0.98, caregiverRelation: intakeMode === "CAREGIVER" ? caregiverRelation : undefined }
      },
      {
        id: "ev-live-2",
        timeframe: "Yesterday",
        title: "Prescription & Medication Intake",
        detail: `Prescription scanned at kiosk containing ${scannedMedications.map(m => `${m.drug} ${m.dose}`).join(", ")}.`,
        sourceType: "DOCUMENT",
        sourceBadge: "📄 Prescription OCR • Kiosk Scanner",
        sourceSnippet: `Rx: ${scannedMedications.map(m => `${m.drug} ${m.dose} (${m.frequency})`).join("; ")}`,
        metadata: { facility: "Local Clinic OPD", date: "Yesterday" }
      },
      {
        id: "ev-live-3",
        timeframe: "Today",
        title: "MediKiosk Triage & Body Map Localization",
        detail: `Pain score ${painScore}/10 recorded. Anatomical region confirmed as ${socratesState.site || "Thorax"}.`,
        sourceType: "ABDM",
        sourceBadge: `🔐 ABDM Consent Token ${token}`,
        sourceSnippet: `ABHA ${patientAbha} verified. Triage Level: ${isEmerg ? "EMERGENCY" : isUrg ? "URGENT" : "ROUTINE"}. Consent: ${consentType}.`,
        metadata: { consentId: `ABDM-CONSENT-${Math.floor(1000 + Math.random() * 9000)}` }
      }
    ];

    const newPatient: PatientQueueItem = {
      id: `pat-${Date.now()}`,
      token: token,
      name: patientName || "Patient",
      age: patientAge || 28,
      gender: patientGender || "Female",
      abhaId: patientAbha || "91-4567-8901-2345",
      triageLevel: isEmerg ? "EMERGENCY" : isUrg ? "URGENT" : "ROUTINE",
      chiefComplaint: socratesState.site
        ? `${socratesState.site}: ${socratesState.character || "Pain"} (Score ${painScore}/10)`
        : "Sub-sternal chest discomfort & shortness of breath",
      triagedTime: "Just now",
      intakeSource: intakeMode,
      caregiverRelation: intakeMode === "CAREGIVER" ? caregiverRelation : undefined,
      consentStatus: consentType === "NONE" ? "PENDING" : consentType,
      historyCompleteness: 94,
      historyCoverage: {
        onset: Boolean(socratesState.onset),
        location: Boolean(socratesState.site),
        character: Boolean(socratesState.character),
        severity: Boolean(socratesState.severity_score || painScore),
        radiation: Boolean(socratesState.radiation),
        aggravating: Boolean(socratesState.exacerbating_relieving),
        relieving: true,
        associated: Boolean(socratesState.associations?.length),
        pastHistory: true,
        medications: true,
      },
      vitals: {
        bp: "128/84 mmHg",
        pulse: "90 bpm",
        spo2: "98%",
        temp: "99.2 °F",
        bmi: "23.1 (Normal)",
      },
      hpi: {
        onset: socratesState.onset || "2 days duration",
        location: socratesState.site || "Thorax / Upper body",
        character: socratesState.character || "Constricting ache",
        radiation: socratesState.radiation || "Radiating to shoulder",
        severity: `${painScore} / 10`,
        aggravating: socratesState.exacerbating_relieving || "Exertion",
        relieving: "Resting",
        associated: socratesState.associations?.join(", ") || "Nocturnal fever",
      },
      voiceTranscript: {
        original: transcript || "छाती में दर्द और भारीपन लग रहा है।",
        language: language,
        confidence: 99.1,
      },
      redFlags: isEmerg ? [redFlagDetail || "Severe acute discomfort detected by AI"] : [],
      evidenceTrail: evidence,
      ocrHistory: {
        medications: scannedMedications.map(m => ({ ...m, source: "Prescription OCR" })),
        abnormalLabs: [],
        timeline: [{ year: "2026", event: "OPD Triage Intake at MediKiosk", type: "OPD Intake" }],
      },
    };

    pushPatientToQueue(newPatient);
    setActiveStepIndex(4);
  };

  return (
    <AppShell>
      <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-6xl mx-auto text-left">
        {/* Step Navigation Pill Bar */}
        <div className="rounded-[16px] border border-[#FDEBD0] bg-white p-2.5 shadow-sm overflow-x-auto">
          <div className="flex items-center justify-between gap-2 min-w-[580px]">
            {KIOSK_STEPS.map((step, idx) => {
              const Icon = step.icon;
              const isActive = activeStepIndex === idx;
              const isCompleted = activeStepIndex > idx;
              return (
                <button
                  key={step.id}
                  onClick={() => setActiveStepIndex(idx)}
                  className={cn(
                    "flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition-all cursor-pointer",
                    isActive
                      ? "bg-[#1D2A8F] text-white shadow-xs"
                      : isCompleted
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      : "bg-[#FDFBF7] text-[#374151]/70 hover:bg-white hover:text-[#1D2A8F]"
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{step.label}</span>
                  {isCompleted && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 ml-1" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Step Content Container */}
        <AnimatePresence mode="wait">
          {/* STEP 1: Language & Caregiver Mode Selection */}
          {activeStepIndex === 0 && (
            <motion.div
              key="lang-step"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-6 max-w-4xl mx-auto"
            >
              <div className="text-center">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#1D2A8F]/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#1D2A8F]">
                  <Languages className="h-3.5 w-3.5" /> Step 1 of 5
                </span>
                <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#374151] mt-2">
                  Select Your Language &amp; Intake Mode
                </h2>
                <p className="text-xs sm:text-sm text-[#374151]/70 mt-1 max-w-lg mx-auto">
                  Speak comfortably in your native tongue or Hinglish. Choose self-intake or assisted caregiver mode.
                </p>
              </div>

              {/* 👴 CAREGIVER VS PATIENT MODE SWITCHER */}
              <div className="bg-white rounded-2xl border border-[#FDEBD0] p-5 shadow-sm">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#374151]/70 block mb-3">
                  Who is Answering the Kiosk Today?
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setIntakeMode("PATIENT")}
                    className={`p-4 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                      intakeMode === "PATIENT"
                        ? "bg-[#1D2A8F]/5 border-[#1D2A8F] shadow-xs ring-1 ring-[#1D2A8F]"
                        : "bg-[#FDFBF7] border-[#FDEBD0] hover:bg-white"
                    }`}
                  >
                    <div className="w-9 h-9 rounded-lg bg-[#1D2A8F] text-white flex items-center justify-center shrink-0">
                      <User className="w-5 h-5 text-[#FB923C]" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-[#374151]">Patient Self-Intake</h4>
                      <p className="text-xs text-[#374151]/70 mt-0.5">I am describing my own symptoms directly.</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIntakeMode("CAREGIVER", "Daughter / Son")}
                    className={`p-4 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                      intakeMode === "CAREGIVER"
                        ? "bg-amber-500/10 border-[#C2410C] shadow-xs ring-1 ring-[#C2410C]"
                        : "bg-[#FDFBF7] border-[#FDEBD0] hover:bg-white"
                    }`}
                  >
                    <div className="w-9 h-9 rounded-lg bg-[#C2410C] text-white flex items-center justify-center shrink-0">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-[#374151]">Elderly / Assisted Caregiver Mode</h4>
                      <p className="text-xs text-[#374151]/70 mt-0.5">I am helping an elderly parent or family member.</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Language Selection Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {INDIC_LANGUAGES.map((lang) => {
                  const isSelected = language === lang.code;
                  return (
                    <button
                      key={lang.code}
                      onClick={() => setLanguage(lang.code)}
                      className={cn(
                        "rounded-[16px] border p-4 text-left transition-all cursor-pointer shadow-xs",
                        isSelected
                          ? "border-[#1D2A8F] bg-[#1D2A8F] text-white shadow-md"
                          : "border-[#FDEBD0] bg-white text-[#374151] hover:border-[#1D2A8F]/40 hover:bg-[#FDFBF7]"
                      )}
                    >
                      <span className="text-2xl block mb-2">{lang.flag}</span>
                      <h4 className="font-heading text-sm font-bold">{lang.name}</h4>
                      <p
                        className={cn(
                          "text-[11px] mt-1 font-medium truncate",
                          isSelected ? "text-white/80" : "text-[#374151]/70"
                        )}
                      >
                        {lang.nativePrompt}
                      </p>
                    </button>
                  );
                })}
              </div>

              {/* Transparent Consent Bar */}
              <div className="bg-white p-4 rounded-xl border border-[#FDEBD0] flex flex-wrap items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <div className="text-xs text-[#374151]">
                    <span className="font-bold block">ABDM Consent &amp; Privacy-by-Design</span>
                    <span className="text-[#374151]/70">Your voice is processed securely for doctor briefing only.</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsConsentModalOpen(true)}
                  className="px-3.5 py-1.5 rounded-full text-xs font-bold text-[#1D2A8F] border border-[#1D2A8F]/30 bg-[#1D2A8F]/5 hover:bg-[#1D2A8F]/10 transition-colors cursor-pointer"
                >
                  View Consent Breakdown
                </button>
              </div>

              <div className="flex justify-center pt-2">
                <button
                  onClick={() => setActiveStepIndex(1)}
                  className="inline-flex items-center gap-2 rounded-full bg-[#1D2A8F] hover:bg-[#15206B] px-8 py-3 text-xs font-bold text-white shadow-xs transition-all cursor-pointer"
                >
                  <span>Proceed to Voice &amp; Body Map</span>
                  <ArrowRight className="h-4 w-4 text-[#FB923C]" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: Voice & Anatomical Body Map (Speak Your Way) */}
          {activeStepIndex === 1 && (
            <motion.div
              key="voice-step"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
            >
              {/* Left Column: Voice Intake Assistant & Push-to-Talk (7 cols) */}
              <div className="lg:col-span-7 space-y-5">
                {/* Voice Intake Card */}
                <div className="rounded-[16px] border border-[#FDEBD0] bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between border-b border-[#FDEBD0] pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-[#1D2A8F] text-white">
                        <Sparkles className="h-4 w-4 text-[#FB923C]" />
                      </div>
                      <div>
                        <h3 className="font-heading text-sm font-bold text-[#374151]">
                          Aarogya Mitra • Clinical Voice Intake
                        </h3>
                        <p className="text-[10px] text-[#374151]/70">
                          {intakeMode === "CAREGIVER" ? "Assisted Caregiver Mode active" : "Multilingual speech-to-text"}
                        </p>
                      </div>
                    </div>
                    <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
                      Live Voice Stream
                    </span>
                  </div>

                  {/* AI Response Bubble */}
                  <div className="mt-4 rounded-[12px] bg-[#FDFBF7] border border-[#FDEBD0] p-4">
                    <p className="font-heading text-base font-semibold text-[#374151] leading-relaxed">
                      &ldquo;{aiSpokenResponse}&rdquo;
                    </p>
                  </div>

                  {/* Patient Transcript Card */}
                  {transcript && (
                    <div className="mt-3 rounded-[10px] border border-[#FDEBD0] bg-white p-3.5">
                      <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#1D2A8F]">
                        Spoken Patient Complaint:
                      </p>
                      <p className="text-xs font-medium text-[#374151] italic mt-0.5">&ldquo;{transcript}&rdquo;</p>
                    </div>
                  )}

                  {/* Quick Reply Suggestions */}
                  {quickReplies.length > 0 && (
                    <div className="mt-4">
                      <p className="text-[11px] font-bold text-[#374151]/70 mb-1.5">
                        Suggested Responses:
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {quickReplies.map((reply, idx) => (
                          <button
                            key={idx}
                            onClick={() => sendTextMessage(reply)}
                            className="rounded-full border border-[#FDEBD0] bg-[#FDFBF7] hover:bg-white hover:border-[#1D2A8F] px-3 py-1.5 text-xs font-medium text-[#374151] transition-all shadow-xs cursor-pointer"
                          >
                            + {reply}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Push-to-Talk Waveform Controller */}
                <div className="rounded-[16px] border border-[#FDEBD0] bg-white p-6 shadow-sm text-center">
                  <VoiceWaveform active={isRecording} level={level} />

                  <div className="mt-6 flex flex-col items-center justify-center">
                    {isRecording ? (
                      <button
                        onClick={stopListening}
                        className="flex items-center gap-2.5 rounded-full bg-[#C2410C] hover:bg-[#9A3412] px-7 py-3 text-xs font-bold text-white shadow-xs transition-all cursor-pointer"
                      >
                        <MicOff className="h-4 w-4 animate-bounce" />
                        Done Speaking (Process Turn)
                      </button>
                    ) : (
                      <button
                        onClick={startListening}
                        className="inline-flex items-center gap-2.5 rounded-full bg-[#1D2A8F] hover:bg-[#15206B] px-7 py-3 text-xs font-bold text-white shadow-xs transition-all cursor-pointer"
                      >
                        <Mic className="h-4 w-4 text-[#FB923C]" />
                        Tap to Speak in Your Language
                      </button>
                    )}
                    <p className="mt-2 text-xs text-[#374151]/70">
                      {isRecording ? "Listening to your voice..." : "Speak naturally in Hindi, Telugu, Tamil, Bengali, Hinglish, English, etc."}
                    </p>
                  </div>

                  {/* Direct Typed Input */}
                  <div className="mt-5 flex gap-2 border-t border-[#FDEBD0]/80 pt-4">
                    <input
                      type="text"
                      placeholder="Or type symptoms here..."
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && sendTextMessage(textInput)}
                      className="flex-1 rounded-full border border-[#FDEBD0] bg-[#FDFBF7] px-4 py-2 text-xs text-[#374151] outline-none focus:border-[#1D2A8F] focus:bg-white transition-all"
                    />
                    <button
                      onClick={() => sendTextMessage(textInput)}
                      disabled={isLoading}
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1D2A8F] hover:bg-[#15206B] text-white shadow-xs cursor-pointer"
                    >
                      <Send className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Next Step Banner */}
                <div className="flex items-center justify-between rounded-[16px] bg-white border border-[#FDEBD0] p-4 shadow-sm">
                  <div>
                    <p className="text-xs font-bold text-[#374151]">Ready to score pain severity?</p>
                    <p className="text-[11px] text-[#374151]/70">Proceed to visual Wong-Baker pain gauge</p>
                  </div>
                  <button
                    onClick={() => setActiveStepIndex(2)}
                    className="inline-flex items-center gap-1.5 rounded-full bg-[#1D2A8F] hover:bg-[#15206B] px-5 py-2.5 text-xs font-bold text-white shadow-xs cursor-pointer"
                  >
                    <span>Next: Pain &amp; Severity</span>
                    <ArrowRight className="h-3.5 w-3.5 text-[#FB923C]" />
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
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FB923C]/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#FB923C]">
                  <Activity className="h-3.5 w-3.5" /> Step 3 of 5
                </span>
                <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#374151] mt-2">
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
                  className="rounded-full border border-[#FDEBD0] bg-[#FDFBF7] hover:bg-white px-5 py-2.5 text-xs font-bold text-[#374151] cursor-pointer shadow-xs"
                >
                  ← Back to Voice
                </button>
                <button
                  onClick={() => setActiveStepIndex(3)}
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#1D2A8F] hover:bg-[#15206B] px-5 py-2.5 text-xs font-bold text-white shadow-xs cursor-pointer"
                >
                  <span>Next: Prescription Scanner</span>
                  <ArrowRight className="h-3.5 w-3.5 text-[#FB923C]" />
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
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#1D2A8F]/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#1D2A8F]">
                  <FileText className="h-3.5 w-3.5 text-[#FB923C]" /> Step 4 of 5
                </span>
                <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#374151] mt-2">
                  Scan Existing Prescriptions &amp; Lab Slips
                </h2>
                <p className="text-xs text-[#374151]/70 mt-1">
                  Scanned documents are attached as verified evidence nodes on your clinical timeline.
                </p>
              </div>

              <PrescriptionScanner
                onScanComplete={(doc: any) => {
                  console.log("Document scanned:", doc);
                  const meds = doc?.extracted_medications || doc?.medications || [];
                  if (meds.length > 0) {
                    setScannedMedications(meds.map((m: any) => ({
                      drug: m.drug_name || m.name || m.drug || "Medication",
                      dose: m.dosage || m.dose || "Standard",
                      frequency: m.frequency || "1-0-1"
                    })));
                  }
                }}
              />

              <div className="flex justify-between items-center pt-4">
                <button
                  onClick={() => setActiveStepIndex(2)}
                  className="rounded-full border border-[#FDEBD0] bg-[#FDFBF7] hover:bg-white px-5 py-2.5 text-xs font-bold text-[#374151] cursor-pointer shadow-xs"
                >
                  ← Back to Pain Scale
                </button>
                <button
                  onClick={handleGenerateToken}
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#1D2A8F] hover:bg-[#15206B] px-6 py-2.5 text-xs font-bold text-white shadow-xs cursor-pointer"
                >
                  <span>Generate Digital OPD Token &amp; Storyboard</span>
                  <ArrowRight className="h-3.5 w-3.5 text-[#FB923C]" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 5: Digital OPD Token & Storyboard Link */}
          {activeStepIndex === 4 && (
            <motion.div
              key="token-step"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-3xl mx-auto text-center space-y-6"
            >
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-emerald-700">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Intake Completed &amp; Pushed to Doctor Storyboard
                </span>
                <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#374151] mt-2">
                  Your Pre-Consultation Storyboard is Ready
                </h2>
                <p className="text-xs sm:text-sm text-[#374151]/70 mt-1">
                  Present this digital token to the OPD consultation officer or enter the Doctor Cockpit to view the source-backed timeline.
                </p>
              </div>

              <ClinicalTriageToken
                tokenNumber={generatedTokenNumber}
                patientName={patientName}
                urgencyLevel={redFlag ? "emergency" : painScore >= 7 ? "urgent" : "routine"}
                chiefComplaint={socratesState.site ? `${socratesState.site}: ${socratesState.character || "Pain"} (Severity ${painScore}/10)` : "Sub-sternal chest discomfort"}
                onProceedToDoctor={() => router.push("/doctor")}
              />

              <div className="pt-2 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={() => router.push("/doctor")}
                  className="rounded-full bg-[#1D2A8F] text-white hover:bg-[#2563EB] px-6 py-2.5 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Layers className="w-3.5 h-3.5 text-[#FB923C]" />
                  <span>Open Doctor Storyboard View</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    resetKiosk();
                    setActiveStepIndex(0);
                  }}
                  className="rounded-full border border-[#FDEBD0] bg-[#FDFBF7] hover:bg-white px-5 py-2.5 text-xs font-bold text-[#374151] transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Start Another Patient Intake</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Audio / Visual Consent Modal */}
        <AudioConsentModal
          isOpen={isConsentModalOpen}
          onClose={() => setIsConsentModalOpen(false)}
          onConfirmConsent={(type) => setConsent(true, type)}
          language={language}
        />
      </div>
    </AppShell>
  );
}
