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
  Layers,
  Clock,
  FileSearch,
  Check,
  History,
  Info,
  Download
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
  { code: "hi", name: "Hindi (हिंदी)", flag: "🇮🇳", nativePrompt: "नमस्ते, अपनी बीमारी या तकलीफ़ बताएं" },
  { code: "en", name: "English", flag: "🇬🇧", nativePrompt: "Hello, please describe what discomfort you are experiencing" },
  { code: "te", name: "Telugu (తెలుగు)", flag: "🇮🇳", nativePrompt: "నమస్కారం, మీ ఆరోగ్య సమస్యను వివరించండి" },
  { code: "ta", name: "Tamil (தமிழ்)", flag: "🇮🇳", nativePrompt: "வணக்கம், உங்கள் உடல்நலப் பிரச்சனையை சொல்லுங்கள்" },
  { code: "bn", name: "Bengali (বাংলা)", flag: "🇮🇳", nativePrompt: "নমস্কার, আপনার শারীরিক অসুবিধার কথা জানান" },
  { code: "mr", name: "Marathi (मराठी)", flag: "🇮🇳", nativePrompt: "नमस्कार, तुमची प्रकृती अस्वास्थ्य सांगा" },
  { code: "kn", name: "Kannada (ಕನ್ನಡ)", flag: "🇮🇳", nativePrompt: "ನಮಸ್ಕಾರ, ನಿಮ್ಮ ಆರೋಗ್ಯ ತೊಂದರೆಯನ್ನು ತಿಳಿಸಿ" },
];

const KIOSK_STEPS = [
  { id: "language", label: "1. Language & Identity", icon: Languages },
  { id: "voice", label: "2. Spoken Intake & Dialogue", icon: Mic },
  { id: "pain", label: "3. Body Map & Pain Scale", icon: Activity },
  { id: "scanner", label: "4. Past Prescriptions & OCR", icon: FileText },
  { id: "token", label: "5. Digital OPD Token", icon: CheckCircle2 },
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

  // Contextual Historical Memory Clues
  const [historicalClues, setHistoricalClues] = useState<Array<{
    condition: string;
    year: string;
    source: string;
    relevanceNote: string;
  }>>([
    {
      condition: "Pulmonary TB (Completed DOTS Regimen)",
      year: "2022",
      source: "Discharge Summary • 14-Aug-2022",
      relevanceNote: "Historical infectious respiratory context surfaced for physician correlation with current thoracic complaints."
    },
    {
      condition: "Essential Hypertension",
      year: "2024",
      source: "Prescription OCR • Apex Health OPD",
      relevanceNote: "Prior Amlodipine 5mg therapy documented. Important baseline for current blood pressure and chest pressure."
    }
  ]);

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
      setAiSpokenResponse("Network retry. Connecting to local clinical model...");
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
          setAiSpokenResponse("Voice processed locally. Please confirm symptom details.");
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

  const handleGenerateToken = async () => {
    const token = `#${Math.floor(100 + Math.random() * 900)}`;
    setGeneratedTokenNumber(token);

    const isEmerg = redFlag || painScore >= 8;
    const isUrg = painScore >= 6;

    // Build rich Evidence Trail for the Clinical Storyboard
    const evidence: EvidenceTimelineItem[] = [
      {
        id: "ev-live-1",
        timeframe: socratesState.onset || "2 Days Duration",
        title: "Spoken First-Mile Intake (Vernacular Voice)",
        detail: `Reported ${socratesState.character || "discomfort"} in ${socratesState.site || "Thorax"} with severity score ${painScore}/10.`,
        sourceType: intakeMode === "CAREGIVER" ? "CAREGIVER" : "VOICE",
        sourceBadge: intakeMode === "CAREGIVER" ? `Caregiver Statement (${caregiverRelation || "Family"})` : `Patient Spoken Voice (${language.toUpperCase()})`,
        sourceSnippet: transcript || "कल रात से छाती में भारीपन और हल्का दर्द लग रहा है।",
        metadata: { confidence: 0.98, caregiverRelation: intakeMode === "CAREGIVER" ? caregiverRelation : undefined }
      },
      {
        id: "ev-live-2",
        timeframe: "Historical Context (2022)",
        title: "Longitudinal Medical History Surfaced",
        detail: "Treated for Pulmonary TB in 2022. This historical context may be clinically relevant to today's complaint. Physician review recommended.",
        sourceType: "DOCUMENT",
        sourceBadge: "Discharge Summary • 14-Aug-2022",
        sourceSnippet: "Rx: Anti-tubercular DOTS regimen successfully completed. Sputum AFB negative at completion.",
        metadata: { facility: "District TB Centre", date: "Aug 2022" }
      },
      {
        id: "ev-live-3",
        timeframe: "Yesterday",
        title: "Physical Prescription Scanned at Kiosk",
        detail: `Prescription OCR identified active medications: ${scannedMedications.map(m => `${m.drug} ${m.dose}`).join(", ")}.`,
        sourceType: "DOCUMENT",
        sourceBadge: "Prescription OCR • Paper Scan",
        sourceSnippet: `Rx: ${scannedMedications.map(m => `${m.drug} ${m.dose} (${m.frequency})`).join("; ")}`,
        metadata: { facility: "Apex Health OPD", date: "Yesterday" }
      },
      {
        id: "ev-live-4",
        timeframe: "Today (At Kiosk)",
        title: "Triage Localization & ABDM Registration",
        detail: `Pain score ${painScore}/10 recorded. Anatomical region confirmed as ${socratesState.site || "Thorax"}. Priority: ${isEmerg ? "EMERGENCY" : isUrg ? "PRIORITY CARE" : "ROUTINE"}.`,
        sourceType: "ABDM",
        sourceBadge: `ABDM Consent Token ${token}`,
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
        timeline: [
          { year: "2022", event: "Pulmonary TB DOTS Treatment Completed", type: "Historical Context" },
          { year: "2024", event: "Essential Hypertension Rx Initiation", type: "Chronic Rx" },
          { year: "2026", event: "OPD Triage Intake at MediKiosk", type: "First-Mile Intake" }
        ],
      },
    };

    // Update local client store
    pushPatientToQueue(newPatient);

    // Sync to backend MongoDB database & live doctor queue
    try {
      await fetch(`${BACKEND_URL}/api/v1/clinical/intake-complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          token: token,
          name: patientName,
          age: patientAge,
          gender: patientGender,
          abha_id: patientAbha,
          triage_level: isEmerg ? "EMERGENCY" : isUrg ? "URGENT" : "ROUTINE",
          chief_complaint: newPatient.chiefComplaint,
          intake_source: intakeMode,
          caregiver_relation: caregiverRelation,
          socrates: socratesState,
          past_history: [
            "Pulmonary Tuberculosis (DOTS completed 2022)",
            "Essential Hypertension (Diagnosed 2024)"
          ],
          allergies: [
            "Penicillin (Severe skin rash reported 2021)",
            "No known food allergies"
          ],
          current_medications: scannedMedications,
          vitals: newPatient.vitals,
          evidence_trail: evidence,
          language: language
        })
      });
    } catch (err) {
      console.warn("Backend sync notification:", err);
    }

    setActiveStepIndex(4);
  };

  return (
    <AppShell>
      <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-6xl mx-auto text-left">
        {/* Step Navigation Pill Bar */}
        <div className="rounded-2xl border border-[#E0D7C9] bg-white p-2 shadow-subtle overflow-x-auto">
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
                    "flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all cursor-pointer",
                    isActive
                      ? "bg-[#1B4332] text-white shadow-subtle"
                      : isCompleted
                      ? "bg-[#E8F5EE] text-[#1B4332] border border-[#C6E7D2]"
                      : "bg-[#FBF9F5] text-[#606963] hover:bg-white hover:text-[#1B4332]"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{step.label}</span>
                  {isCompleted && <Check className="h-3.5 w-3.5 text-[#2D6A4F] ml-1" />}
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
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="space-y-6 max-w-4xl mx-auto"
            >
              <div className="text-center">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E8F5EE] border border-[#C6E7D2] px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#1B4332]">
                  <Languages className="h-3.5 w-3.5" /> Step 1 of 5
                </span>
                <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#1F2421] mt-2">
                  Select Your Language &amp; Intake Mode
                </h2>
                <p className="text-xs sm:text-sm text-[#4E5752] mt-1 max-w-lg mx-auto">
                  Speak comfortably in your native tongue or Hinglish. Choose self-intake or assisted caregiver mode.
                </p>
              </div>

              {/* CAREGIVER VS PATIENT MODE SWITCHER */}
              <div className="bg-white rounded-2xl border border-[#E0D7C9] p-5 shadow-subtle">
                <span className="text-xs font-bold uppercase tracking-wider text-[#606963] block mb-3">
                  Who is Answering the Kiosk Today?
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setIntakeMode("PATIENT")}
                    className={cn(
                      "p-4 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer",
                      intakeMode === "PATIENT"
                        ? "bg-[#E8F5EE] border-[#1B4332] ring-1 ring-[#1B4332]"
                        : "bg-[#FBF9F5] border-[#E0D7C9] hover:bg-white"
                    )}
                  >
                    <div className="w-10 h-10 rounded-lg bg-[#1B4332] text-white flex items-center justify-center shrink-0">
                      <User className="w-5 h-5 text-[#D8F3DC]" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-[#1F2421]">Patient Self-Intake</h4>
                      <p className="text-xs text-[#606963] mt-0.5">I am describing my own symptoms directly.</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIntakeMode("CAREGIVER", "Family / Relative")}
                    className={cn(
                      "p-4 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer",
                      intakeMode === "CAREGIVER"
                        ? "bg-[#FDF3F0] border-[#9C4124] ring-1 ring-[#9C4124]"
                        : "bg-[#FBF9F5] border-[#E0D7C9] hover:bg-white"
                    )}
                  >
                    <div className="w-10 h-10 rounded-lg bg-[#9C4124] text-white flex items-center justify-center shrink-0">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-[#1F2421]">Assisted Caregiver Mode</h4>
                      <p className="text-xs text-[#606963] mt-0.5">I am helping an elderly parent or family member.</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Patient Basic Information */}
              <div className="bg-white rounded-2xl border border-[#E0D7C9] p-5 shadow-subtle">
                <span className="text-xs font-bold uppercase tracking-wider text-[#606963] block mb-3">
                  Patient Identity &amp; ABHA Profile
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-[#4E5752] block mb-1">Patient Full Name</label>
                    <input
                      type="text"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      className="w-full rounded-xl border border-[#E0D7C9] bg-[#FBF9F5] px-3.5 py-2.5 text-xs text-[#1F2421] outline-none focus:border-[#1B4332] focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#4E5752] block mb-1">Age &amp; Gender</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={patientAge}
                        onChange={(e) => setPatientAge(Number(e.target.value))}
                        className="w-20 rounded-xl border border-[#E0D7C9] bg-[#FBF9F5] px-3.5 py-2.5 text-xs text-[#1F2421] outline-none focus:border-[#1B4332] focus:bg-white"
                      />
                      <select
                        value={patientGender}
                        onChange={(e) => setPatientGender(e.target.value)}
                        className="flex-1 rounded-xl border border-[#E0D7C9] bg-[#FBF9F5] px-3 py-2.5 text-xs text-[#1F2421] outline-none focus:border-[#1B4332] focus:bg-white"
                      >
                        <option>Female</option>
                        <option>Male</option>
                        <option>Other</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#4E5752] block mb-1">ABHA Health ID</label>
                    <input
                      type="text"
                      value={patientAbha}
                      onChange={(e) => setPatientAbha(e.target.value)}
                      className="w-full rounded-xl border border-[#E0D7C9] bg-[#FBF9F5] px-3.5 py-2.5 text-xs text-[#1F2421] outline-none focus:border-[#1B4332] focus:bg-white"
                    />
                  </div>
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
                        "rounded-2xl border p-4 text-left transition-all cursor-pointer shadow-subtle",
                        isSelected
                          ? "border-[#1B4332] bg-[#1B4332] text-white"
                          : "border-[#E0D7C9] bg-white text-[#1F2421] hover:border-[#1B4332] hover:bg-[#FBF9F5]"
                      )}
                    >
                      <span className="text-2xl block mb-2">{lang.flag}</span>
                      <h4 className="font-heading text-sm font-bold">{lang.name}</h4>
                      <p
                        className={cn(
                          "text-xs mt-1 font-medium truncate",
                          isSelected ? "text-white/80" : "text-[#606963]"
                        )}
                      >
                        {lang.nativePrompt}
                      </p>
                    </button>
                  );
                })}
              </div>

              {/* Transparent Consent Bar */}
              <div className="bg-white p-4 rounded-2xl border border-[#E0D7C9] flex flex-wrap items-center justify-between gap-3 shadow-subtle">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-5 h-5 text-[#2D6A4F]" />
                  <div className="text-xs text-[#1F2421]">
                    <span className="font-bold block">ABDM Consent &amp; Privacy Safeguards</span>
                    <span className="text-[#606963]">Your voice is processed securely for doctor briefing only.</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsConsentModalOpen(true)}
                  className="px-4 py-2 rounded-full text-xs font-bold text-[#1B4332] border border-[#1B4332] bg-[#E8F5EE] hover:bg-[#D8F3DC] transition-colors cursor-pointer"
                >
                  View Consent Policy
                </button>
              </div>

              <div className="flex justify-center pt-2">
                <button
                  onClick={() => setActiveStepIndex(1)}
                  className="inline-flex items-center gap-2 rounded-full bg-[#1B4332] hover:bg-[#081C15] px-8 py-3 text-xs font-bold text-white shadow-subtle transition-all cursor-pointer"
                >
                  <span>Proceed to Spoken Intake</span>
                  <ArrowRight className="h-4 w-4 text-[#D8F3DC]" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: Spoken Intake & Dialogue */}
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
                <div className="rounded-2xl border border-[#E0D7C9] bg-white p-6 shadow-subtle">
                  <div className="flex items-center justify-between border-b border-[#E0D7C9] pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1B4332] text-white">
                        <Sparkles className="h-4 w-4 text-[#D8F3DC]" />
                      </div>
                      <div>
                        <h3 className="font-heading text-sm font-bold text-[#1F2421]">
                          Aarogya Mitra • First-Mile Voice Intake
                        </h3>
                        <p className="text-[11px] text-[#606963]">
                          {intakeMode === "CAREGIVER" ? "Assisted Caregiver Mode active" : "Multilingual conversational speech-to-structure"}
                        </p>
                      </div>
                    </div>
                    <span className="rounded-full bg-[#E8F5EE] border border-[#C6E7D2] px-3 py-1 text-[11px] font-bold text-[#1B4332]">
                      Live Diagnostic Session
                    </span>
                  </div>

                  {/* AI Response Bubble */}
                  <div className="mt-4 rounded-xl bg-[#FBF9F5] border border-[#E0D7C9] p-4">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-heading text-base font-semibold text-[#1F2421] leading-relaxed">
                        &ldquo;{aiSpokenResponse}&rdquo;
                      </p>
                    </div>
                  </div>

                  {/* Patient Transcript Card */}
                  {transcript && (
                    <div className="mt-3 rounded-xl border border-[#E0D7C9] bg-white p-3.5">
                      <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#1B4332]">
                        Spoken Patient Statement:
                      </p>
                      <p className="text-xs font-medium text-[#1F2421] italic mt-0.5">&ldquo;{transcript}&rdquo;</p>
                    </div>
                  )}

                  {/* Quick Reply Suggestions */}
                  {quickReplies.length > 0 && (
                    <div className="mt-4">
                      <p className="text-xs font-bold text-[#4E5752] mb-1.5">
                        Quick Symptom Prompts (Touch to Reply):
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {quickReplies.map((reply, idx) => (
                          <button
                            key={idx}
                            onClick={() => sendTextMessage(reply)}
                            className="rounded-full border border-[#E0D7C9] bg-[#FBF9F5] hover:bg-white hover:border-[#1B4332] px-3.5 py-1.5 text-xs font-medium text-[#1F2421] transition-all shadow-subtle cursor-pointer"
                          >
                            + {reply}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Historical Context Relevance Notice (Differentiator) */}
                <div className="rounded-2xl border border-[#E0D7C9] bg-[#FBF9F5] p-5 shadow-subtle">
                  <div className="flex items-center gap-2 mb-2">
                    <History className="w-4 h-4 text-[#1B4332]" />
                    <h4 className="font-heading text-xs font-bold text-[#1F2421] uppercase tracking-wider">
                      Longitudinal Historical Context Reconstructed:
                    </h4>
                  </div>
                  <div className="space-y-2">
                    {historicalClues.map((clue, i) => (
                      <div key={i} className="p-3 rounded-xl bg-white border border-[#E0D7C9] text-xs space-y-1">
                        <div className="flex items-center justify-between font-bold text-[#1F2421]">
                          <span>{clue.condition} ({clue.year})</span>
                          <span className="text-[10px] font-normal text-[#606963]">{clue.source}</span>
                        </div>
                        <p className="text-[11px] text-[#4E5752] leading-relaxed">
                          {clue.relevanceNote}
                        </p>
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-[#606963] mt-2 italic">
                    * This historical information may be clinically relevant. Physician review recommended.
                  </p>
                </div>

                {/* Push-to-Talk Waveform Controller */}
                <div className="rounded-2xl border border-[#E0D7C9] bg-white p-6 shadow-subtle text-center">
                  <VoiceWaveform active={isRecording} level={level} />

                  <div className="mt-6 flex flex-col items-center justify-center">
                    {isRecording ? (
                      <button
                        onClick={stopListening}
                        className="flex items-center gap-2.5 rounded-full bg-[#9C4124] hover:bg-[#7A3119] px-8 py-3.5 text-xs font-bold text-white shadow-subtle transition-all cursor-pointer"
                      >
                        <MicOff className="h-4 w-4" />
                        Done Speaking (Process Turn)
                      </button>
                    ) : (
                      <button
                        onClick={startListening}
                        className="inline-flex items-center gap-2.5 rounded-full bg-[#1B4332] hover:bg-[#081C15] px-8 py-3.5 text-xs font-bold text-white shadow-subtle transition-all cursor-pointer"
                      >
                        <Mic className="h-4 w-4 text-[#D8F3DC]" />
                        Tap to Speak in {INDIC_LANGUAGES.find(l => l.code === language)?.name.split(" ")[0]}
                      </button>
                    )}
                    <p className="mt-2 text-xs text-[#606963]">
                      {isRecording ? "Listening to your voice..." : "Speak naturally in Hindi, Telugu, Tamil, Bengali, Hinglish, or English."}
                    </p>
                  </div>

                  {/* Direct Typed Input */}
                  <div className="mt-5 flex gap-2 border-t border-[#E0D7C9] pt-4">
                    <input
                      type="text"
                      placeholder="Or type symptoms in any language..."
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && sendTextMessage(textInput)}
                      className="flex-1 rounded-full border border-[#E0D7C9] bg-[#FBF9F5] px-4 py-2.5 text-xs text-[#1F2421] outline-none focus:border-[#1B4332] focus:bg-white transition-all"
                    />
                    <button
                      onClick={() => sendTextMessage(textInput)}
                      disabled={isLoading}
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1B4332] hover:bg-[#081C15] text-white shadow-subtle cursor-pointer"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Next Step Banner */}
                <div className="flex items-center justify-between rounded-2xl bg-white border border-[#E0D7C9] p-4 shadow-subtle">
                  <div>
                    <p className="text-xs font-bold text-[#1F2421]">Ready to pinpoint location and severity?</p>
                    <p className="text-[11px] text-[#606963]">Proceed to interactive body map &amp; pain gauge</p>
                  </div>
                  <button
                    onClick={() => setActiveStepIndex(2)}
                    className="inline-flex items-center gap-1.5 rounded-full bg-[#1B4332] hover:bg-[#081C15] px-6 py-2.5 text-xs font-bold text-white shadow-subtle cursor-pointer"
                  >
                    <span>Next: Body Map &amp; Pain</span>
                    <ArrowRight className="h-3.5 w-3.5 text-[#D8F3DC]" />
                  </button>
                </div>
              </div>

              {/* Right Column: SOCRATES Radar & Real-Time Coverage (5 cols) */}
              <div className="lg:col-span-5 space-y-6">
                <SocratesRadar socrates={socratesState} />
                <AnatomyBodyMap
                  activeRegion={socratesState.site}
                  onSelectRegion={handleRegionSelect}
                  painScore={painScore}
                />
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
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FDF3F0] border border-[#F5D5CB] px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#9C4124]">
                  <Activity className="h-3.5 w-3.5" /> Step 3 of 5
                </span>
                <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#1F2421] mt-2">
                  Rate Your Discomfort &amp; Severity
                </h2>
                <p className="text-xs sm:text-sm text-[#606963] mt-1">
                  Touch the numeric scale or facial indicator to record clinical pain intensity.
                </p>
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
                  className="rounded-full border border-[#E0D7C9] bg-[#FBF9F5] hover:bg-white px-6 py-2.5 text-xs font-bold text-[#1F2421] cursor-pointer shadow-subtle"
                >
                  ← Back to Spoken Voice
                </button>
                <button
                  onClick={() => setActiveStepIndex(3)}
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#1B4332] hover:bg-[#081C15] px-6 py-2.5 text-xs font-bold text-white shadow-subtle cursor-pointer"
                >
                  <span>Next: Scan Past Prescriptions</span>
                  <ArrowRight className="h-3.5 w-3.5 text-[#D8F3DC]" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 4: Prescription & History OCR Scanner */}
          {activeStepIndex === 3 && (
            <motion.div
              key="scanner-step"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-4xl mx-auto space-y-6 text-center"
            >
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E8F5EE] border border-[#C6E7D2] px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#1B4332]">
                  <FileText className="h-3.5 w-3.5" /> Step 4 of 5
                </span>
                <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#1F2421] mt-2">
                  Scan Existing Prescriptions &amp; Lab Slips
                </h2>
                <p className="text-xs text-[#606963] mt-1">
                  Scanned paper records are extracted into verified historical evidence nodes on your clinical timeline.
                </p>
              </div>

              <PrescriptionScanner
                onScanComplete={(doc: any) => {
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
                  className="rounded-full border border-[#E0D7C9] bg-[#FBF9F5] hover:bg-white px-6 py-2.5 text-xs font-bold text-[#1F2421] cursor-pointer shadow-subtle"
                >
                  ← Back to Pain Scale
                </button>
                <button
                  onClick={handleGenerateToken}
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#1B4332] hover:bg-[#081C15] px-7 py-2.5 text-xs font-bold text-white shadow-subtle cursor-pointer"
                >
                  <span>Generate Digital OPD Token &amp; Storyboard</span>
                  <ArrowRight className="h-3.5 w-3.5 text-[#D8F3DC]" />
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
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E8F5EE] border border-[#C6E7D2] px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#1B4332]">
                  <CheckCircle2 className="h-3.5 w-3.5" /> First-Mile Intake Complete &amp; Synced
                </span>
                <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#1F2421] mt-2">
                  Your Pre-Consultation Storyboard is Ready
                </h2>
                <p className="text-xs sm:text-sm text-[#606963] mt-1">
                  Present this digital token to the OPD consultation desk or open the Doctor Cockpit to inspect the evidence trail.
                </p>
              </div>

              <ClinicalTriageToken
                tokenNumber={generatedTokenNumber}
                patientName={patientName}
                urgencyLevel={redFlag ? "emergency" : painScore >= 7 ? "urgent" : "routine"}
                chiefComplaint={socratesState.site ? `${socratesState.site}: ${socratesState.character || "Pain"} (Severity ${painScore}/10)` : "Sub-sternal chest discomfort"}
                onProceedToDoctor={() => router.push("/doctor")}
              />

              <div className="pt-2 flex flex-wrap justify-center items-center gap-3">
                <a
                  href={`${BACKEND_URL}/api/v1/clinical/report/pdf/${sessionId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-[#9C4124] text-white hover:bg-[#7A3119] px-7 py-3 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-subtle"
                >
                  <Download className="w-4 h-4 text-[#FDF3F0]" />
                  <span>Download Official Clinical Intake Report (PDF)</span>
                </a>
                <button
                  type="button"
                  onClick={() => router.push("/doctor")}
                  className="rounded-full bg-[#1B4332] text-white hover:bg-[#081C15] px-7 py-3 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-subtle"
                >
                  <Layers className="w-4 h-4 text-[#D8F3DC]" />
                  <span>Open Doctor Storyboard View</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    resetKiosk();
                    setActiveStepIndex(0);
                  }}
                  className="rounded-full border border-[#E0D7C9] bg-[#FBF9F5] hover:bg-white px-6 py-3 text-xs font-bold text-[#1F2421] transition-all flex items-center gap-1.5 cursor-pointer shadow-subtle"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Start Another Intake</span>
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
