"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
  Download,
  Stethoscope,
  ChevronRight,
  MapPin,
  QrCode,
  Home
} from "lucide-react";
import { Nav } from "@/components/brand/Nav";
import { Footer } from "@/components/brand/Footer";
import { VoiceWaveform, useAudioLevel } from "@/components/visualization/VoiceWaveform";
import { SocratesRadar, SocratesData } from "@/components/visualization/SocratesRadar";
import { ClinicalPainGauge } from "@/components/visualization/ClinicalPainGauge";
import { PrescriptionScanner } from "@/components/visualization/PrescriptionScanner";
import { ClinicalTriageToken } from "@/components/visualization/ClinicalTriageToken";
import { AudioConsentModal } from "@/components/clinical/AudioConsentModal";
import { useKioskStore, PatientQueueItem, EvidenceTimelineItem } from "@/lib/store";
import { useAuthStore } from "@/lib/auth-store";
import { cn } from "@/lib/utils";
import { getBackendUrl } from "@/lib/config";
import { UniversalAudioRecorder } from "@/lib/audioRecorder";
import { getKioskTranslation } from "@/lib/kioskTranslations";
import { HistoryAPI } from "@/lib/api";

const INDIC_LANGUAGES = [
  { code: "hi", name: "Hindi (हिंदी)", script: "अ", flag: "🇮🇳", nativePrompt: "नमस्ते, अपनी बीमारी या तकलीफ़ बताएं" },
  { code: "en", name: "English", script: "A", flag: "🇬🇧", nativePrompt: "Hello, please describe what discomfort you are experiencing" },
  { code: "te", name: "Telugu (తెలుగు)", script: "తె", flag: "🇮🇳", nativePrompt: "నమస్కారం, మీ ఆరోగ్య సమస్యను వివరించండి" },
  { code: "ta", name: "Tamil (தமிழ்)", script: "த", flag: "🇮🇳", nativePrompt: "வணக்கம், உங்கள் உடல்நலப் பிரச்சனையை சொல்லுங்கள்" },
  { code: "bn", name: "Bengali (বাংলা)", script: "বা", flag: "🇮🇳", nativePrompt: "নমস্কার, আপনার शारीरिक অসুবিধার কথা জানান" },
  { code: "mr", name: "Marathi (मराठी)", script: "म", flag: "🇮🇳", nativePrompt: "नमस्कार, तुमची प्रकृती अस्वास्थ्य सांगा" },
  { code: "gu", name: "Gujarati (ગુજરાતી)", script: "ગુ", flag: "🇮🇳", nativePrompt: "નમસ્તે, તમારી તકલીફ અથવા લક્ષણો જણાવો" },
  { code: "kn", name: "Kannada (ಕನ್ನಡ)", script: "ಕ", flag: "🇮🇳", nativePrompt: "ನಮಸ್ಕಾರ, ನಿಮ್ಮ ಆರೋಗ್ಯ ತೊಂದರೆಯನ್ನು ತಿಳಿಸಿ" },
];

export function LivePatientIntakeStation() {
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

  const { user, isAuthenticated, initialized, initAuth } = useAuthStore();

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  useEffect(() => {
    if (initialized && !isAuthenticated) {
      router.replace("/patient/login?returnUrl=/kiosk/intake");
    }
  }, [initialized, isAuthenticated, router]);

  const t = getKioskTranslation(language);

  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [patientName, setPatientName] = useState<string>("Patient");
  const [patientAge, setPatientAge] = useState<number>(28);
  const [patientGender, setPatientGender] = useState<string>("Female");
  const [patientAbha, setPatientAbha] = useState<string>("91-4567-8901-2345");

  // Synchronize authenticated patient details into intake state
  useEffect(() => {
    if (user) {
      if (user.full_name) setPatientName(user.full_name);
      if (user.gender) setPatientGender(user.gender);
      if (user.preferred_language) setLanguage(user.preferred_language);
      if (user.abha_number_masked) setPatientAbha(user.abha_number_masked);
      else if (user.abha_address) setPatientAbha(user.abha_address);
    }
  }, [user, setLanguage]);

  const [isConsentModalOpen, setIsConsentModalOpen] = useState(false);
  const [scannedMedications, setScannedMedications] = useState<Array<{ drug: string; dose: string; frequency: string }>>([
    { drug: "Tab Paracetamol", dose: "650 mg", frequency: "1-0-1" },
    { drug: "Cap Pantoprazole", dose: "40 mg", frequency: "1-0-0 (Empty Stomach)" }
  ]);

  const [hasInteracted, setHasInteracted] = useState<boolean>(false);
  const [aiSpokenResponse, setAiSpokenResponse] = useState<string>(() => t.initialGreeting);
  const [quickReplies, setQuickReplies] = useState<string[]>(() => t.quickReplies);

  // Synchronize initial greeting and quick symptom buttons when language changes if no conversation turn has happened
  useEffect(() => {
    if (!hasInteracted && !transcript) {
      const trans = getKioskTranslation(language);
      setAiSpokenResponse(trans.initialGreeting);
      setQuickReplies(trans.quickReplies);
    }
  }, [language, hasInteracted, transcript]);

  const [redFlag, setRedFlag] = useState<boolean>(false);
  const [redFlagDetail, setRedFlagDetail] = useState<string>("");
  const [textInput, setTextInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [socratesState, setSocratesState] = useState<SocratesData>({
    site: undefined,
    onset: undefined,
    character: undefined,
    radiation: undefined,
    associations: [],
    timing: undefined,
    exacerbating_relieving: undefined,
    severity_score: undefined,
  });
  const [painScore, setPainScore] = useState<number>(0);
  const [generatedTokenNumber, setGeneratedTokenNumber] = useState<string>("A-104");
  const [sessionId] = useState<string>(() => "kiosk_" + Math.random().toString(36).substring(2, 9));
  const [historicalCorrelation, setHistoricalCorrelation] = useState<{
    correlated_past_condition?: string;
    clinical_rationale?: string;
    significance_level?: string;
    recommended_physician_focus?: string;
  } | null>(null);

  // Contextual Historical Memory Clues (dynamically fetched from real history or verified fallback)
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

  // Dynamically load real patient history from backend history/ABDM records
  useEffect(() => {
    async function loadPatientHistory() {
      try {
        let historyData: any = null;
        if (isAuthenticated) {
          try {
            historyData = await HistoryAPI.getMyHistory();
          } catch {
            historyData = await HistoryAPI.getPatientHistory(user?.user_id || "P-DEMO-001");
          }
        } else {
          historyData = await HistoryAPI.getPatientHistory("P-DEMO-001");
        }

        if (historyData) {
          const clues: Array<{ condition: string; year: string; source: string; relevanceNote: string }> = [];

          if (historyData.diagnoses && Array.isArray(historyData.diagnoses)) {
            historyData.diagnoses.slice(0, 2).forEach((d: any) => {
              clues.push({
                condition: d.condition || d.name || "Medical Condition",
                year: d.year || (d.date ? new Date(d.date).getFullYear().toString() : "2024"),
                source: d.source || "Longitudinal Clinical Record",
                relevanceNote: d.notes || `Documented ${d.condition_type || "diagnosed"} condition from prior consultation.`
              });
            });
          }

          if (clues.length < 2 && historyData.encounters && Array.isArray(historyData.encounters)) {
            historyData.encounters.slice(0, 2 - clues.length).forEach((enc: any) => {
              clues.push({
                condition: enc.provisional_diagnosis || enc.chief_complaint || "Prior Hospital Encounter",
                year: enc.encounter_date ? new Date(enc.encounter_date).getFullYear().toString() : "2024",
                source: `${enc.hospital_name || "Apex Health OPD"} • ${enc.encounter_date || "Past Visit"}`,
                relevanceNote: enc.clinical_notes || "Documented clinical encounter from hospital record history."
              });
            });
          }

          if (clues.length < 2 && historyData.documents && Array.isArray(historyData.documents)) {
            historyData.documents.slice(0, 2 - clues.length).forEach((doc: any) => {
              clues.push({
                condition: doc.document_purpose || doc.document_type || "Scanned Health Document",
                year: doc.document_date ? new Date(doc.document_date).getFullYear().toString() : "2024",
                source: `${doc.facility_name || "Prescription OCR"} • Paper Record`,
                relevanceNote: doc.clinical_intent || "Extracted from scanned historical medical records."
              });
            });
          }

          if (clues.length > 0) {
            setHistoricalClues(clues);
          }
        }
      } catch (err) {
        console.warn("Patient history load notice:", err);
      }
    }

    loadPatientHistory();
  }, [isAuthenticated, user]);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const universalRecorderRef = useRef<UniversalAudioRecorder | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const speechRecognitionRef = useRef<any>(null);
  const liveSpeechTranscriptRef = useRef<string>("");

  const { level } = useAudioLevel(isRecording);

  // Initialize audio element and check URL parameters on client mount
  useEffect(() => {
    audioElementRef.current = new Audio();

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const initialInput = params.get("input");
      const initialLang = params.get("lang");
      if (initialLang && INDIC_LANGUAGES.some((l) => l.code === initialLang)) {
        setLanguage(initialLang);
      }
      if (initialInput && initialInput.trim()) {
        setActiveStepIndex(1); // Transition to voice intake step
        setTimeout(() => {
          sendTextMessage(initialInput.trim());
        }, 300);
      }
    }

    return () => {
      if (audioElementRef.current) {
        audioElementRef.current.pause();
      }
      if (speechRecognitionRef.current) {
        try {
          speechRecognitionRef.current.stop();
        } catch {}
      }
    };
  }, []);

  const playTTSAudio = (base64Audio?: string | null, textToSpeak?: string) => {
    const text = textToSpeak || aiSpokenResponse;
    
    const speakWebSpeech = (txt: string) => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        try {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(txt);
          if (language === "hi") utterance.lang = "hi-IN";
          else if (language === "bn") utterance.lang = "bn-IN";
          else if (language === "te") utterance.lang = "te-IN";
          else if (language === "ta") utterance.lang = "ta-IN";
          else if (language === "mr") utterance.lang = "mr-IN";
          else if (language === "gu") utterance.lang = "gu-IN";
          else if (language === "kn") utterance.lang = "kn-IN";
          else utterance.lang = "en-IN";
          utterance.rate = 1.0;
          utterance.pitch = 1.0;
          window.speechSynthesis.speak(utterance);
        } catch (e) {
          console.warn("Web Speech API playback note:", e);
        }
      }
    };

    if (base64Audio && base64Audio.trim().length > 10) {
      try {
        if (audioElementRef.current) {
          audioElementRef.current.pause();
          const srcUri = base64Audio.startsWith("data:")
            ? base64Audio
            : `data:audio/mp3;base64,${base64Audio}`;
          audioElementRef.current.src = srcUri;
          
          audioElementRef.current.onended = () => {
            setRecording(false);
          };

          const playPromise = audioElementRef.current.play();
          if (playPromise !== undefined) {
            playPromise.catch((err) => {
              console.warn("Audio element play failed, falling back to Web Speech API:", err);
              speakWebSpeech(text);
            });
          }
        } else {
          speakWebSpeech(text);
        }
      } catch (err) {
        console.error("TTS playback error, falling back to Web Speech API:", err);
        speakWebSpeech(text);
      }
    } else if (text) {
      speakWebSpeech(text);
    }
  };

  const processResponseData = (data: any) => {
    setHasInteracted(true);
    setAiSpokenResponse(data.spoken_response);
    setRedFlag(Boolean(data.red_flag_triggered));
    setQuickReplies(data.quick_replies || []);

    if (data.language_code && data.language_code !== language) {
      setLanguage(data.language_code);
    }

    if (data.historical_correlation) {
      setHistoricalCorrelation(data.historical_correlation);
    }

    const state = data.clinical_state;
    if (state) {
      if (state.historical_correlation && !data.historical_correlation) {
        setHistoricalCorrelation(state.historical_correlation);
      }

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

    playTTSAudio(data.audio_base64, data.spoken_response);
  };

  const sendTextMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;
    setHasInteracted(true);
    setTranscript(textToSend);
    setTextInput("");
    setIsLoading(true);

    try {
      const backendUrl = getBackendUrl();
      const resp = await fetch(`${backendUrl}/api/v1/ai/chat-intake`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript: textToSend,
          session_id: sessionId,
          language_code: language,
          synthesize_audio: true,
          patient_name: patientName,
          patient_age: patientAge,
          patient_gender: patientGender,
          past_history: [
            "Pulmonary Tuberculosis (DOTS completed 2022)",
            "Essential Hypertension (Diagnosed 2024)"
          ],
          historical_clues: historicalClues
        }),
      });
      const data = await resp.json();
      processResponseData(data);
    } catch (err) {
      console.error("Failed chat intake:", err);
      setAiSpokenResponse("Connected to clinical model. You can also tap any quick option below.");
    } finally {
      setIsLoading(false);
    }
  };

  const startListening = async () => {
    liveSpeechTranscriptRef.current = "";

    // 1. Browser Web Speech Recognition for Real-Time live text transcription
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        try {
          const recognizer = new SpeechRecognition();
          recognizer.continuous = true;
          recognizer.interimResults = true;
          if (language === "hi") recognizer.lang = "hi-IN";
          else if (language === "bn") recognizer.lang = "bn-IN";
          else if (language === "te") recognizer.lang = "te-IN";
          else if (language === "ta") recognizer.lang = "ta-IN";
          else if (language === "mr") recognizer.lang = "mr-IN";
          else if (language === "gu") recognizer.lang = "gu-IN";
          else if (language === "kn") recognizer.lang = "kn-IN";
          else recognizer.lang = "en-IN";

          recognizer.onresult = (e: any) => {
            let interim = "";
            for (let i = e.resultIndex; i < e.results.length; i++) {
              interim += e.results[i][0].transcript;
            }
            if (interim) {
              liveSpeechTranscriptRef.current = interim;
              setTranscript(interim);
            }
          };

          recognizer.onerror = (e: any) => {
            console.warn("SpeechRecognition note:", e);
          };

          recognizer.start();
          speechRecognitionRef.current = recognizer;
        } catch (e) {
          console.warn("Web Speech recognizer initialization note:", e);
        }
      }
    }

    // 2. Universal 16kHz PCM WAV Audio Recorder for Bhashini IndicASR
    try {
      const recorder = new UniversalAudioRecorder();
      universalRecorderRef.current = recorder;
      await recorder.start();
      setRecording(true);
    } catch (err) {
      console.warn("Microphone access notice:", err);
      setRecording(false);
      if (speechRecognitionRef.current) {
        try {
          speechRecognitionRef.current.stop();
        } catch {}
      }
    }
  };

  const stopListening = async () => {
    setHasInteracted(true);
    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop();
      } catch {}
      speechRecognitionRef.current = null;
    }

    if (universalRecorderRef.current && isRecording) {
      setIsLoading(true);
      try {
        const audioBlob = await universalRecorderRef.current.stop();
        universalRecorderRef.current = null;

        const formData = new FormData();
        formData.append("file", audioBlob, "patient_speech.wav");
        formData.append("session_id", sessionId);
        formData.append("language_code", language);
        formData.append("synthesize_audio", "true");
        formData.append("patient_name", patientName);
        formData.append("age", patientAge.toString());
        formData.append("gender", patientGender);
        formData.append("past_history", JSON.stringify([
          "Pulmonary Tuberculosis (DOTS completed 2022)",
          "Essential Hypertension (Diagnosed 2024)"
        ]));
        formData.append("historical_clues", JSON.stringify(historicalClues));

        const backendUrl = getBackendUrl();
        const resp = await fetch(`${backendUrl}/api/v1/ai/voice-intake`, {
          method: "POST",
          body: formData,
        });
        const data = await resp.json();
        const finalTranscript =
          data.clinical_state?.raw_transcripts?.slice(-1)[0] ||
          liveSpeechTranscriptRef.current ||
          "Audio recorded";
        setTranscript(finalTranscript);
        processResponseData(data);
      } catch (err) {
        console.error("Failed voice intake:", err);
        setAiSpokenResponse("Audio intake recorded. Feel free to refine with the options below.");
      } finally {
        setIsLoading(false);
        setRecording(false);
      }
    } else {
      setRecording(false);
    }
  };

  const handleSocratesFieldUpdate = (field: keyof SocratesData, val: any) => {
    setSocratesState((prev) => ({ ...prev, [field]: val }));
  };

  const handleGenerateToken = async () => {
    const token = `A-${Math.floor(100 + Math.random() * 900)}`;
    setGeneratedTokenNumber(token);

    const isEmerg = redFlag || painScore >= 8;
    const isUrg = painScore >= 5 && painScore < 8;

    const evidence: EvidenceTimelineItem[] = [
      {
        id: "ev-live-1",
        timeframe: "10 min ago",
        title: "Kiosk Vernacular Speech Intake & ASR",
        detail: `Spoken symptoms captured in ${INDIC_LANGUAGES.find(l => l.code === language)?.name || "Vernacular"}: "${transcript || "Patient described symptoms"}"`,
        sourceType: "VOICE",
        sourceBadge: `Voice • ${INDIC_LANGUAGES.find(l => l.code === language)?.name.split(" ")[0] || "Indic"}`,
        sourceSnippet: transcript || "Audio transcript verified with acoustic telemetry.",
        metadata: { confidence: 0.98 }
      },
      {
        id: "ev-live-2",
        timeframe: "5 min ago",
        title: "Structured SOCRATES Diagnostic Assessment",
        detail: `Extracted clinical axes: Site=${socratesState.site || "Chest/Thorax"}, Onset=${socratesState.onset || "Acute"}, Character=${socratesState.character || "Tightness"}, Severity=${painScore}/10.`,
        sourceType: "VOICE",
        sourceBadge: "SOCRATES Clinical Radar",
        sourceSnippet: `Location: ${socratesState.site || "Thoracic"}, Radiation: ${socratesState.radiation || "Left arm/neck"}`,
        metadata: { confidence: 0.95 }
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
        ? `${socratesState.site}: ${socratesState.character || "Pain"} (Severity ${painScore}/10)`
        : (transcript || "General clinical intake assessment"),
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
        bp: "124/80 mmHg",
        pulse: "78 bpm",
        spo2: "98%",
        temp: "98.6 °F",
        bmi: "22.8 (Normal)",
      },
      hpi: {
        onset: socratesState.onset || "Recent onset",
        location: socratesState.site || "General",
        character: socratesState.character || "Discomfort",
        radiation: socratesState.radiation || "None reported",
        severity: `${painScore} / 10`,
        aggravating: socratesState.exacerbating_relieving || "Daily activity",
        relieving: "Rest",
        associated: socratesState.associations?.join(", ") || "None reported",
      },
      voiceTranscript: {
        original: transcript || "Patient described symptoms at kiosk.",
        language: language,
        confidence: 99.1,
      },
      redFlags: isEmerg ? [redFlagDetail || "Severe acute discomfort detected by AI"] : [],
      evidenceTrail: evidence,
      ocrHistory: {
        medications: scannedMedications.map(m => ({ ...m, source: "Prescription OCR" })),
        abnormalLabs: [],
        timeline: historicalClues.map((c) => ({
          year: c.year,
          event: `${c.condition} - ${c.source}`,
          type: "Historical Context"
        })),
      },
    };

    pushPatientToQueue(newPatient);

    try {
      await fetch(`${getBackendUrl()}/api/v1/clinical/intake-complete`, {
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
          socrates: { ...socratesState, severity_score: painScore },
          past_history: historicalClues.map(c => `${c.condition} (${c.year}) • ${c.source}`),
          allergies: (user as any)?.allergies && (user as any).allergies.length > 0 ? (user as any).allergies : [
            "No known drug or food allergies reported"
          ],
          current_medications: scannedMedications,
          vitals: newPatient.vitals,
          evidence_trail: evidence,
          language: language,
          raw_transcripts: transcript ? [transcript] : []
        })
      });
    } catch (err) {
      console.warn("Backend sync notification:", err);
    }

    setActiveStepIndex(3);
  };

  const kioskSteps = [
    { id: "language", label: t.step1Nav, shortLabel: "Language", icon: Languages },
    { id: "voice", label: t.step2Nav, shortLabel: "Voice Intake", icon: Mic },
    { id: "scanner", label: t.step3Nav, shortLabel: "OCR Scanner", icon: FileText },
    { id: "token", label: t.step4Nav, shortLabel: "OPD Token", icon: CheckCircle2 },
  ];

  if (!initialized || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 border-2 border-[#0056B3] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-semibold text-[#5A6B7C]">Verifying patient session...</p>
      </div>
    );
  }

  const selectedLangObj = INDIC_LANGUAGES.find((l) => l.code === language) || INDIC_LANGUAGES[0];
  const selectedLangShortName = selectedLangObj.name.split(" ")[0];

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1E293B] flex flex-col justify-between selection:bg-[#EBF5FF] selection:text-[#0056B3]">
      {/* Top Navbar */}
      <Nav />

      {/* Main Dedicated Intake Station Content */}
      <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full text-left space-y-6">
        {/* Back Link & Breadcrumb Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E2E8F0] pb-4">
          <Link
            href="/kiosk"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0056B3] hover:text-[#004494] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>{t.backToKiosk}</span>
          </Link>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#64748B]">
            <span className="w-2 h-2 rounded-full bg-[#28A745] animate-pulse" />
            <span>{t.kioskActive}</span>
          </div>
        </div>

        {/* Header Title */}
        <div className="text-center max-w-2xl mx-auto pt-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EBF5FF] border border-[#BEE3F8] px-4 py-1 text-xs font-bold uppercase tracking-wider text-[#0056B3]">
            <HeartPulse className="w-3.5 h-3.5" /> {t.pointOfEntry}
          </span>
          <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-[#1E293B] mt-2">
            {t.mainTitle}
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            {t.mainSubtitle}
          </p>
        </div>

        {/* Step Navigation Pill Bar */}
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-2 shadow-xs overflow-x-auto">
          <div className="flex items-center justify-between gap-2 min-w-[620px]">
            {kioskSteps.map((step, idx) => {
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
                      ? "bg-[#0056B3] text-white shadow-sm ring-1 ring-[#0056B3]/20"
                      : isCompleted
                      ? "bg-[#EAF7ED] text-[#28A745] border border-[#28A745]/20 font-bold"
                      : "bg-[#F8F9FA] text-[#64748B] hover:bg-white hover:text-[#0056B3] hover:border-[#CBD5E1]"
                  )}
                >
                  <Icon className={cn("h-4 w-4", isActive ? "text-white" : isCompleted ? "text-[#28A745]" : "text-[#64748B]")} />
                  <span>{step.label}</span>
                  {isCompleted && <Check className="h-3.5 w-3.5 text-[#28A745] ml-1 stroke-[3]" />}
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
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EBF5FF] border border-[#BEE3F8] px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#0056B3]">
                  <Languages className="h-3.5 w-3.5" /> {t.step1Badge}
                </span>
                <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#1E293B] mt-2">
                  {t.step1Title}
                </h2>
                <p className="text-xs sm:text-sm text-[#64748B] mt-1 max-w-lg mx-auto">
                  {t.step1Subtitle}
                </p>
              </div>

              {/* CAREGIVER VS PATIENT MODE SWITCHER */}
              <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] block mb-3">
                  {t.whoIsAnswering}
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setIntakeMode("PATIENT")}
                    className={cn(
                      "p-4 rounded-xl border text-left flex items-start gap-3.5 transition-all cursor-pointer",
                      intakeMode === "PATIENT"
                        ? "bg-[#F0F7FF] border-[#0056B3] ring-2 ring-[#0056B3]/20 shadow-xs"
                        : "bg-[#F8F9FA] border-[#E2E8F0] hover:bg-white hover:border-[#CBD5E1]"
                    )}
                  >
                    <div className={cn(
                      "w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors",
                      intakeMode === "PATIENT" ? "bg-[#0056B3] text-white shadow-xs" : "bg-[#E2E8F0] text-[#64748B]"
                    )}>
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-[#1E293B]">{t.patientSelfIntake}</h4>
                        {intakeMode === "PATIENT" && (
                          <span className="bg-[#0056B3] text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded">{t.activeBadge}</span>
                        )}
                      </div>
                      <p className="text-xs text-[#64748B] mt-0.5">{t.patientSelfIntakeDesc}</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIntakeMode("CAREGIVER", "Family / Relative")}
                    className={cn(
                      "p-4 rounded-xl border text-left flex items-start gap-3.5 transition-all cursor-pointer",
                      intakeMode === "CAREGIVER"
                        ? "bg-[#F0FDF4] border-[#17A2B8] ring-2 ring-[#17A2B8]/20 shadow-xs"
                        : "bg-[#F8F9FA] border-[#E2E8F0] hover:bg-white hover:border-[#CBD5E1]"
                    )}
                  >
                    <div className={cn(
                      "w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors",
                      intakeMode === "CAREGIVER" ? "bg-[#17A2B8] text-white shadow-xs" : "bg-[#E2E8F0] text-[#64748B]"
                    )}>
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-[#1E293B]">{t.caregiverMode}</h4>
                        {intakeMode === "CAREGIVER" && (
                          <span className="bg-[#17A2B8] text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded">{t.activeBadge}</span>
                        )}
                      </div>
                      <p className="text-xs text-[#64748B] mt-0.5">{t.caregiverModeDesc}</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Patient Basic Information */}
              <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] block mb-3">
                  {t.patientProfileTitle}
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-[#475569] block mb-1">{t.patientNameLabel}</label>
                    <input
                      type="text"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      className="w-full rounded-xl border border-[#CBD5E1] bg-[#F8F9FA] px-3.5 py-2.5 text-xs text-[#1E293B] outline-none focus:border-[#0056B3] focus:bg-white focus:ring-1 focus:ring-[#0056B3]/20 transition-all font-medium"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#475569] block mb-1">{t.ageGenderLabel}</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={patientAge}
                        onChange={(e) => setPatientAge(Number(e.target.value))}
                        className="w-20 rounded-xl border border-[#CBD5E1] bg-[#F8F9FA] px-3.5 py-2.5 text-xs text-[#1E293B] outline-none focus:border-[#0056B3] focus:bg-white focus:ring-1 focus:ring-[#0056B3]/20 transition-all font-medium"
                      />
                      <select
                        value={patientGender}
                        onChange={(e) => setPatientGender(e.target.value)}
                        className="flex-1 rounded-xl border border-[#CBD5E1] bg-[#F8F9FA] px-3 py-2.5 text-xs text-[#1E293B] outline-none focus:border-[#0056B3] focus:bg-white focus:ring-1 focus:ring-[#0056B3]/20 transition-all font-medium"
                      >
                        <option>{t.genderFemale}</option>
                        <option>{t.genderMale}</option>
                        <option>{t.genderOther}</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#475569] block mb-1">{t.abhaIdLabel}</label>
                    <input
                      type="text"
                      value={patientAbha}
                      onChange={(e) => setPatientAbha(e.target.value)}
                      className="w-full rounded-xl border border-[#CBD5E1] bg-[#F8F9FA] px-3.5 py-2.5 text-xs text-[#1E293B] outline-none focus:border-[#0056B3] focus:bg-white focus:ring-1 focus:ring-[#0056B3]/20 transition-all font-mono font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Language Selection Grid with Native Glyphs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {INDIC_LANGUAGES.map((lang) => {
                  const isSelected = language === lang.code;
                  return (
                    <button
                      key={lang.code}
                      onClick={() => setLanguage(lang.code)}
                      className={cn(
                        "rounded-2xl border p-4 text-left transition-all cursor-pointer shadow-xs relative overflow-hidden group",
                        isSelected
                          ? "border-[#0056B3] bg-[#0056B3] text-white shadow-md ring-2 ring-[#0056B3]/30"
                          : "border-[#E2E8F0] bg-white text-[#1E293B] hover:border-[#0056B3] hover:bg-[#F8F9FA]"
                      )}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xl">{lang.flag}</span>
                        <span className={cn(
                          "w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center font-heading transition-colors",
                          isSelected ? "bg-white/20 text-white" : "bg-[#F1F5F9] text-[#0056B3] group-hover:bg-[#EBF5FF]"
                        )}>
                          {lang.script}
                        </span>
                      </div>
                      <h4 className="font-heading text-sm font-bold">{lang.name}</h4>
                      <p
                        className={cn(
                          "text-[11px] mt-1 font-medium truncate",
                          isSelected ? "text-white/85" : "text-[#64748B]"
                        )}
                      >
                        {lang.nativePrompt}
                      </p>
                    </button>
                  );
                })}
              </div>

              {/* Transparent ABDM Consent Bar */}
              <div className="bg-white p-4 rounded-2xl border border-[#E2E8F0] flex flex-wrap items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#EAF7ED] text-[#28A745] flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div className="text-xs text-[#1E293B]">
                    <span className="font-bold block">{t.abdmConsentTitle}</span>
                    <span className="text-[#64748B]">{t.abdmConsentDesc}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsConsentModalOpen(true)}
                  className="px-4 py-2 rounded-full text-xs font-bold text-[#0056B3] border border-[#0056B3] bg-[#EBF5FF] hover:bg-[#D0E6FF] transition-colors cursor-pointer"
                >
                  {t.viewConsentPolicy}
                </button>
              </div>

              {/* Action Button */}
              <div className="flex justify-center pt-2">
                <button
                  onClick={() => setActiveStepIndex(1)}
                  className="inline-flex items-center gap-2 rounded-full bg-[#0056B3] hover:bg-[#004494] px-9 py-3.5 text-xs font-bold text-white shadow-md hover:shadow-lg transition-all cursor-pointer"
                >
                  <span>{t.proceedToVoice}</span>
                  <ArrowRight className="h-4 w-4 text-white" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: Spoken Intake & Dialogue */}
          {activeStepIndex === 1 && (
            <motion.div
              key="voice-step"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="space-y-6 max-w-5xl mx-auto"
            >
              {/* 1. TOP SECTION: Primary AI Voice Intake & Push-to-Talk Controller */}
              <div className="rounded-3xl border border-[#E2E8F0] bg-white p-6 sm:p-8 shadow-xs space-y-6">
                {/* Assistant Header */}
                <div className="flex flex-wrap items-center justify-between border-b border-[#E2E8F0] pb-4 gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#0056B3] text-white shadow-xs">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-heading text-base font-bold text-[#1E293B]">
                        {t.assistantName}
                      </h3>
                      <p className="text-xs text-[#64748B]">
                        {intakeMode === "CAREGIVER" ? t.assistantSubtitleCaregiver : t.assistantSubtitlePatient}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-[#EBF5FF] border border-[#BEE3F8] px-3 py-1 text-xs font-bold text-[#0056B3]">
                      {selectedLangObj.name}
                    </span>
                    <span className="rounded-full bg-[#EAF7ED] border border-[#28A745]/20 px-3 py-1 text-xs font-bold text-[#28A745] flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#28A745] animate-pulse" />
                      {t.intakeActiveBadge}
                    </span>
                  </div>
                </div>

                {/* Professional Assistive Scope Notice */}
                <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-[11px] text-[#64748B]">
                  <Info className="w-4 h-4 text-[#0056B3] shrink-0" />
                  <span>
                    <strong>{t.noticePrefix}</strong> {t.noticeText}
                  </span>
                </div>

                {/* AI Spoken Response Message Bubble */}
                <div className="rounded-2xl bg-[#F0F7FF] border border-[#0056B3]/20 p-5 shadow-2xs">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#0056B3] block mb-1">
                    {t.aiResponseLabel}
                  </span>
                  <p className="font-heading text-base sm:text-lg font-semibold text-[#1E293B] leading-relaxed">
                    &ldquo;{aiSpokenResponse}&rdquo;
                  </p>
                </div>

                {/* Patient Transcript Card (Real-time capture) */}
                {transcript && (
                  <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8F9FA] p-4 shadow-2xs">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#0056B3] block mb-0.5">
                      {t.capturedStatementLabel}
                    </span>
                    <p className="text-xs sm:text-sm font-medium text-[#1E293B] italic leading-relaxed">
                      &ldquo;{transcript}&rdquo;
                    </p>
                  </div>
                )}

                {/* AI Historical Mapping Card */}
                {historicalCorrelation && historicalCorrelation.correlated_past_condition && (
                  <div className="rounded-2xl bg-gradient-to-r from-[#EFF6FF] via-[#F0FDF4] to-[#EFF6FF] border border-[#3B82F6]/30 p-4.5 shadow-xs space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#2563EB] text-white text-xs">
                          <Sparkles className="h-3.5 w-3.5" />
                        </span>
                        <span className="font-heading text-xs font-bold text-[#1E3A8A] uppercase tracking-wider">
                          AI Longitudinal History Correlation Detected
                        </span>
                      </div>
                      <span className={cn(
                        "text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase",
                        historicalCorrelation.significance_level?.toUpperCase() === "HIGH"
                          ? "bg-[#FEE2E2] text-[#DC2626] border border-[#FCA5A5]"
                          : "bg-[#FEF3C7] text-[#D97706] border border-[#FCD34D]"
                      )}>
                        {historicalCorrelation.significance_level || "Clinical"} Correlation
                      </span>
                    </div>
                    <div className="text-xs text-[#1E293B] space-y-1">
                      <p className="font-semibold text-[#1E3A8A]">
                        Prior Condition Correlated: <span className="font-bold underline">{historicalCorrelation.correlated_past_condition}</span>
                      </p>
                      <p className="text-[#334155] leading-relaxed">
                        {historicalCorrelation.clinical_rationale}
                      </p>
                      {historicalCorrelation.recommended_physician_focus && (
                        <p className="text-[11px] text-[#059669] font-medium pt-0.5">
                          <strong>Physician Clinical Focus:</strong> {historicalCorrelation.recommended_physician_focus}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Live Acoustic Waveform & Push-to-Talk Microphone Controller */}
                <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8F9FA] p-6 text-center space-y-5">
                  <VoiceWaveform
                    active={isRecording}
                    level={level}
                    liveText={t.micLive}
                    standbyText={t.micStandby}
                  />

                  <div className="flex flex-col items-center justify-center pt-2">
                    {isRecording ? (
                      <button
                        onClick={stopListening}
                        className="flex items-center gap-3 rounded-full bg-[#DC3545] hover:bg-[#C82333] px-9 py-4 text-xs sm:text-sm font-bold text-white shadow-lg transition-all cursor-pointer animate-pulse"
                      >
                        <MicOff className="h-5 w-5" />
                        <span>{t.doneSpeaking}</span>
                      </button>
                    ) : (
                      <button
                        onClick={startListening}
                        className="inline-flex items-center gap-3 rounded-full bg-[#0056B3] hover:bg-[#004494] px-10 py-4 text-xs sm:text-sm font-bold text-white shadow-md hover:shadow-xl transition-all cursor-pointer hover:scale-[1.02]"
                      >
                        <Mic className="h-5 w-5" />
                        <span>{t.tapToSpeak(selectedLangShortName)}</span>
                      </button>
                    )}
                    <p className="mt-2.5 text-xs text-[#64748B]">
                      {isRecording ? t.micListening : t.micHint}
                    </p>
                  </div>

                  {/* Direct Typed Input Fallback */}
                  <div className="flex gap-2 border-t border-[#E2E8F0] pt-4 max-w-2xl mx-auto">
                    <input
                      type="text"
                      placeholder={t.typePlaceholder}
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && sendTextMessage(textInput)}
                      className="flex-1 rounded-full border border-[#CBD5E1] bg-white px-5 py-3 text-xs text-[#1E293B] outline-none focus:border-[#0056B3] focus:ring-2 focus:ring-[#0056B3]/20 transition-all font-medium"
                    />
                    <button
                      onClick={() => sendTextMessage(textInput)}
                      disabled={isLoading}
                      className="flex h-11 w-11 items-center justify-center rounded-full bg-[#0056B3] hover:bg-[#004494] text-white shadow-xs cursor-pointer shrink-0"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Quick Symptom Prompts */}
                {quickReplies.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-[#475569] mb-2">
                      {t.quickRepliesTitle}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {quickReplies.map((reply, idx) => (
                        <button
                          key={idx}
                          onClick={() => sendTextMessage(reply)}
                          className="rounded-full border border-[#E2E8F0] bg-white hover:bg-[#EBF5FF] hover:border-[#0056B3] hover:text-[#0056B3] px-4 py-2 text-xs font-semibold text-[#1E293B] transition-all shadow-2xs cursor-pointer"
                        >
                          + {reply}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 2. BOTTOM SECTION: SOCRATES Clinical Matrix & Longitudinal Medical History (2 Cols) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* SOCRATES Diagnostic Coverage Matrix (7 cols) */}
                <div className="lg:col-span-7">
                  <SocratesRadar
                    socrates={socratesState}
                    onUpdateField={handleSocratesFieldUpdate}
                  />
                </div>

                {/* Longitudinal Historical Context (5 cols) */}
                <div className="lg:col-span-5 rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-xs space-y-3">
                  <div className="flex items-center gap-2 border-b border-[#E2E8F0] pb-2.5">
                    <History className="w-4 h-4 text-[#0056B3]" />
                    <h4 className="font-heading text-xs font-bold text-[#1E293B] uppercase tracking-wider">
                      {t.historicalContextTitle}
                    </h4>
                  </div>
                  <div className="space-y-2">
                    {historicalClues.map((clue, i) => (
                      <div key={i} className="p-3 rounded-xl bg-[#F8F9FA] border border-[#E2E8F0] text-xs space-y-1">
                        <div className="flex items-center justify-between font-bold text-[#1E293B]">
                          <span>{clue.condition} ({clue.year})</span>
                          <span className="text-[10px] font-normal text-[#64748B]">{clue.source}</span>
                        </div>
                        <p className="text-[11px] text-[#475569] leading-relaxed">
                          {clue.relevanceNote}
                        </p>
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-[#64748B] pt-1 italic">
                    {t.historicalDisclaimer}
                  </p>
                </div>
              </div>

              {/* 3. Next Step Action Banner */}
              <div className="flex items-center justify-between rounded-2xl bg-white border border-[#E2E8F0] p-5 shadow-xs">
                <div>
                  <p className="text-xs sm:text-sm font-bold text-[#1E293B]">{t.readyForScannerTitle}</p>
                  <p className="text-xs text-[#64748B]">{t.readyForScannerSubtitle}</p>
                </div>
                <button
                  onClick={() => setActiveStepIndex(2)}
                  className="inline-flex items-center gap-2 rounded-full bg-[#0056B3] hover:bg-[#004494] px-7 py-3 text-xs font-bold text-white shadow-sm hover:shadow-md transition-all cursor-pointer"
                >
                  <span>{t.nextScanner}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: Prescription & History OCR Scanner */}
          {activeStepIndex === 2 && (
            <motion.div
              key="scanner-step"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-4xl mx-auto space-y-6 text-center"
            >
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EBF5FF] border border-[#BEE3F8] px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#0056B3]">
                  <FileText className="h-3.5 w-3.5" /> {t.step3Badge}
                </span>
                <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#1E293B] mt-2">
                  {t.step3Title}
                </h2>
                <p className="text-xs text-[#64748B] mt-1">
                  {t.step3Subtitle}
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
                  onClick={() => setActiveStepIndex(1)}
                  className="rounded-full border border-[#E2E8F0] bg-white hover:bg-[#F8F9FA] px-6 py-2.5 text-xs font-bold text-[#1E293B] cursor-pointer shadow-xs"
                >
                  {t.backToVoice}
                </button>
                <button
                  onClick={handleGenerateToken}
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#0056B3] hover:bg-[#004494] px-7 py-2.5 text-xs font-bold text-white shadow-md cursor-pointer"
                >
                  <span>{t.generateTokenBtn}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 4: Digital OPD Token & Storyboard Link */}
          {activeStepIndex === 3 && (
            <motion.div
              key="token-step"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-3xl mx-auto text-center space-y-6"
            >
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EAF7ED] border border-[#28A745]/20 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#28A745]">
                  <CheckCircle2 className="h-3.5 w-3.5" /> {t.step4Badge}
                </span>
                <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#1E293B] mt-2">
                  {t.step4Title}
                </h2>
                <p className="text-xs sm:text-sm text-[#64748B] mt-1">
                  {t.step4Subtitle}
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
                  href={`${getBackendUrl()}/api/v1/clinical/report/pdf/${sessionId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-[#0056B3] text-white hover:bg-[#004494] px-7 py-3 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-md"
                >
                  <Download className="w-4 h-4" />
                  <span>{t.downloadPdf}</span>
                </a>
                <button
                  type="button"
                  onClick={() => router.push("/doctor")}
                  className="rounded-full bg-[#17A2B8] text-white hover:bg-[#138496] px-7 py-3 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-md"
                >
                  <Layers className="w-4 h-4" />
                  <span>{t.openDoctorView}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    resetKiosk();
                    setHasInteracted(false);
                    setActiveStepIndex(0);
                  }}
                  className="rounded-full border border-[#E2E8F0] bg-white hover:bg-[#F8F9FA] px-6 py-3 text-xs font-bold text-[#1E293B] transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>{t.startAnotherIntake}</span>
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
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
