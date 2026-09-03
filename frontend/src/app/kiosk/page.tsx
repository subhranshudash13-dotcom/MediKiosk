"use client";

import { useState, useEffect } from "react";
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
  Check
} from "lucide-react";

interface SymptomOption {
  id: string;
  name: string;
  hindi: string;
  telugu: string;
  icon: string;
  questions: string[];
}

const COMMON_COMPLAINTS: SymptomOption[] = [
  {
    id: "chest-pain",
    name: "Chest Pain / Discomfort",
    hindi: "छाती में दर्द या भारीपन",
    telugu: "ఛాతీ నొప్పి / అసౌకర్యం",
    icon: "🫀",
    questions: [
      "दर्द कब से हो रहा है और क्या यह बाएँ हाथ या जबड़े तक जाता है?",
      "चलने या सीढ़ियाँ चढ़ने पर क्या दर्द बढ़ता है?",
      "क्या पसीना, घबराहट या साँस लेने में तकलीफ हो रही है?",
    ],
  },
  {
    id: "fever",
    name: "Fever & Chills",
    hindi: "बुखार और कंपकंपी",
    telugu: "జ్వరం మరియు చలి",
    icon: "🌡️",
    questions: [
      "बुखार कितने दिनों से है और क्या कंपकंपी छूटती है?",
      "क्या सिरदर्द, उल्टी या बदन दर्द भी है?",
      "क्या बुखार की कोई दवाई ली है?",
    ],
  },
  {
    id: "abdominal-pain",
    name: "Abdominal / Stomach Pain",
    hindi: "पेट में दर्द या मरोड़",
    telugu: "కడుపు నొప్పి",
    icon: "🩺",
    questions: [
      "दर्द पेट के किस हिस्से में है (ऊपर, नीचे या दाईं तरफ)?",
      "क्या खाना खाने के बाद दर्द बढ़ता है?",
      "क्या उल्टी, दस्त या जलन की शिकायत है?",
    ],
  },
  {
    id: "cough-breathless",
    name: "Cough & Breathlessness",
    hindi: "खांसी और साँस फूलना",
    telugu: "దగ్గు మరియు ఆయాసం",
    icon: "🫁",
    questions: [
      "खांसी सूखी है या बलगम आ रहा है?",
      "क्या रात में या लेटने पर साँस लेने में परेशानी होती है?",
      "क्या सीने में घरघराहट या सीटी की आवाज आती है?",
    ],
  },
  {
    id: "headache",
    name: "Headache & Dizziness",
    hindi: "सिरदर्द और चक्कर आना",
    telugu: "తలనొప్పి మరియు తలతిరగడం",
    icon: "🧠",
    questions: [
      "सिरदर्द कितने समय से है और किस हिस्से में ज्यादा है?",
      "क्या रोशनी या तेज आवाज से परेशानी बढ़ती है?",
      "क्या उल्टी या आँखों के आगे धुंधलापन है?",
    ],
  },
];

const LANGUAGES = [
  { code: "hi", name: "हिन्दी" },
  { code: "en", name: "English" },
  { code: "te", name: "తెలుగు" },
  { code: "ta", name: "தமிழ்" },
  { code: "mr", name: "मराठी" },
  { code: "bn", name: "বাংলা" },
  { code: "gu", name: "ગુજરાતી" },
  { code: "kn", name: "ಕನ್ನಡ" },
];

export default function KioskPage() {
  const [selectedLanguage, setSelectedLanguage] = useState("hi");
  const [selectedMode, setSelectedMode] = useState<"allopathy" | "ayush">("allopathy");
  const [selectedComplaint, setSelectedComplaint] = useState<SymptomOption>(COMMON_COMPLAINTS[0]);
  const [isRecording, setIsRecording] = useState(false);
  const [dialogueStep, setDialogueStep] = useState(0);

  // Transcript & Live Extraction State
  const [transcript, setTranscript] = useState(
    "छाती में भारीपन लग रहा है और दर्द बाएँ हाथ और जबड़े तक जा रहा है। चलने पर साँस फूलती है।"
  );
  const [extractedData, setExtractedData] = useState({
    chiefComplaint: "Retrosternal chest tightness radiating to left arm",
    onset: "3 days ago, exertional",
    severity: "8 / 10 (Severe)",
    associated: "Diaphoresis, exertional dyspnea",
    triageLevel: "EMERGENCY" as "EMERGENCY" | "URGENT" | "ROUTINE",
  });
  const [isComplete, setIsComplete] = useState(false);

  const toggleRecording = () => {
    if (!isRecording) {
      setIsRecording(true);
      setTimeout(() => {
        setIsRecording(false);
        if (dialogueStep < selectedComplaint.questions.length - 1) {
          setDialogueStep((prev) => prev + 1);
        } else {
          setIsComplete(true);
        }
      }, 2500);
    } else {
      setIsRecording(false);
    }
  };

  const handleSelectComplaint = (item: SymptomOption) => {
    setSelectedComplaint(item);
    setDialogueStep(0);
    setIsComplete(false);

    if (item.id === "chest-pain") {
      setTranscript("छाती में भारीपन लग रहा है और दर्द बाएँ हाथ और जबड़े तक जा रहा है। चलने पर साँस फूलती है।");
      setExtractedData({
        chiefComplaint: "Retrosternal chest tightness radiating to left arm",
        onset: "3 days ago, exertional",
        severity: "8 / 10 (Severe)",
        associated: "Diaphoresis, exertional dyspnea",
        triageLevel: "EMERGENCY",
      });
    } else if (item.id === "fever") {
      setTranscript("चार दिनों से बहुत तेज बुखार आ रहा है, कंपकंपी छूटती है और उल्टी जैसा लग रहा है।");
      setExtractedData({
        chiefComplaint: "High grade intermittent fever with rigors",
        onset: "4 days ago",
        severity: "7 / 10 (Moderate to Severe)",
        associated: "Nausea, rigors, generalized myalgia",
        triageLevel: "URGENT",
      });
    } else {
      setTranscript("पेट के ऊपरी हिस्से में जलन और तेज मरोड़ हो रही है, खाना खाने के बाद बढ़ता है।");
      setExtractedData({
        chiefComplaint: "Epigastric abdominal pain with burning sensation",
        onset: "2 days ago, postprandial",
        severity: "6 / 10 (Moderate)",
        associated: "Dyspepsia, mild nausea",
        triageLevel: "ROUTINE",
      });
    }
  };

  const handleResetSession = () => {
    setDialogueStep(0);
    setIsComplete(false);
    setIsRecording(false);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFC] text-[#111111] flex flex-col justify-between selection:bg-[#EEEAFE]">
      {/* Top Header */}
      <header className="bg-white border-b border-[#E7E4DD] px-6 py-4 sticky top-0 z-30 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[#E7E4DD] bg-[#FAFAFC] hover:bg-[#F5F3FF] hover:border-[#7C6EF7] text-[#5F5E5A] hover:text-[#7C6EF7] text-xs font-semibold transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </Link>
            <div className="h-5 w-[1px] bg-[#E7E4DD] hidden sm:block" />
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#EEEAFE] border border-[#7C6EF7]/20 flex items-center justify-center text-[#7C6EF7]">
                <HeartPulse className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h1 className="font-bold text-base text-[#111111] leading-tight">
                  MediKiosk • Patient Intake &amp; Triage Station
                </h1>
                <p className="text-xs text-[#5F5E5A]">
                  AI Multilingual Voice Intake (Part 1 &amp; Part 3 Standard)
                </p>
              </div>
            </div>
          </div>

          {/* Mode Selector */}
          <div className="flex items-center gap-1.5 bg-[#FAFAFC] p-1 rounded-2xl border border-[#E7E4DD]">
            <button
              onClick={() => setSelectedMode("allopathy")}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                selectedMode === "allopathy"
                  ? "bg-[#7C6EF7] text-white shadow-sm"
                  : "text-[#5F5E5A] hover:text-[#111111]"
              }`}
            >
              Allopathy (General OPD)
            </button>
            <button
              onClick={() => setSelectedMode("ayush")}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                selectedMode === "ayush"
                  ? "bg-[#F59E0B] text-white shadow-sm"
                  : "text-[#5F5E5A] hover:text-[#111111]"
              }`}
            >
              AYUSH (Ayurveda Intake)
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto w-full px-6 py-8 flex-1 space-y-6">
        {/* Language Selection Pill Bar */}
        <div className="bg-white border border-[#E7E4DD] p-4 rounded-3xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-[#5F5E5A]">
            <Languages className="w-4 h-4 text-[#7C6EF7]" />
            <span>Select Language / भाषा चुनें:</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setSelectedLanguage(lang.code)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedLanguage === lang.code
                    ? "bg-[#EEEAFE] text-[#7C6EF7] border border-[#7C6EF7]"
                    : "bg-[#FAFAFC] text-[#5F5E5A] border border-[#E7E4DD] hover:border-[#7C6EF7]"
                }`}
              >
                {lang.name}
              </button>
            ))}
          </div>
        </div>

        {/* 5 Common Complaints Selector */}
        <div className="bg-white border border-[#E7E4DD] p-5 rounded-3xl shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-[#5F5E5A] block mb-3">
            Select Your Primary Complaint / अपनी मुख्य तकलीफ चुनें:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {COMMON_COMPLAINTS.map((item) => {
              const isSelected = selectedComplaint.id === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectComplaint(item)}
                  className={`p-3.5 rounded-2xl border text-left transition-all ${
                    isSelected
                      ? "bg-[#F5F3FF] border-[#7C6EF7] shadow-md shadow-[#7C6EF7]/10"
                      : "bg-[#FAFAFC] border-[#E7E4DD] hover:border-[#7C6EF7]/60 hover:bg-white"
                  }`}
                >
                  <span className="text-2xl block mb-1">{item.icon}</span>
                  <h4 className="font-bold text-xs text-[#111111]">{item.name}</h4>
                  <p className="text-[11px] text-[#5F5E5A] mt-0.5">{item.hindi}</p>
                </button>
              );
            })}
          </div>
        </div>

        {!isComplete ? (
          /* Active Voice Intake Studio */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: AI Question & Voice Mic (7 Cols) */}
            <div className="lg:col-span-7 bg-white border border-[#E7E4DD] rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[#F2F0EB] mb-6">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EEEAFE] text-[#7C6EF7] text-xs font-bold">
                    <Sparkles className="w-3.5 h-3.5" />
                    Adaptive Clinical Question Tree (Step {dialogueStep + 1} of {selectedComplaint.questions.length})
                  </span>
                  <span className="text-xs text-[#5F5E5A] font-mono">SOCRATES Protocol</span>
                </div>

                {/* AI Question Prompt */}
                <div className="p-6 rounded-3xl bg-[#FAFAFC] border border-[#E7E4DD] mb-8 text-center">
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#7C6EF7] mb-2">
                    <Volume2 className="w-4 h-4 animate-bounce" />
                    <span>AI Doctor Question / प्रश्न:</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-[#111111] leading-relaxed">
                    "{selectedComplaint.questions[dialogueStep]}"
                  </h3>
                </div>

                {/* Microphone / Push-to-Talk Button */}
                <div className="flex flex-col items-center justify-center gap-4 py-4">
                  <button
                    onClick={toggleRecording}
                    className={`w-28 h-28 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl cursor-pointer ${
                      isRecording
                        ? "bg-[#EF4444] text-white ring-8 ring-[#EF4444]/30 scale-110 animate-pulse"
                        : "bg-[#7C6EF7] hover:bg-[#6758F0] text-white ring-8 ring-[#EEEAFE] hover:scale-105"
                    }`}
                  >
                    {isRecording ? <MicOff className="w-12 h-12" /> : <Mic className="w-12 h-12" />}
                  </button>
                  <div className="text-center">
                    <span className="text-xs font-bold text-[#111111] block">
                      {isRecording ? "Listening... (बोलिए, सुन रहे हैं)" : "Tap to Speak (बोलने के लिए बटन दबाएं)"}
                    </span>
                    <span className="text-[11px] text-[#5F5E5A]">
                      Push-to-Talk • Bhashini / IndicConformer ASR Stream
                    </span>
                  </div>
                </div>
              </div>

              {/* Transcript Preview */}
              <div className="mt-8 pt-4 border-t border-[#F2F0EB]">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#5F5E5A] block mb-1.5">
                  Live ASR Transcript:
                </span>
                <p className="text-xs font-medium text-[#111111] italic bg-[#FAFAFC] p-3.5 rounded-2xl border border-[#E7E4DD]">
                  "{transcript}"
                </p>
              </div>
            </div>

            {/* Right: Live Clinical Entity Extraction (5 Cols) */}
            <div className="lg:col-span-5 bg-white border border-[#E7E4DD] rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#F2F0EB]">
                <h3 className="font-bold text-sm text-[#111111] flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#7C6EF7]" />
                  Real-Time Clinical Extraction
                </h3>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#DCFCE7] text-[#12B981]">
                  AI Active
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-2xl bg-[#FAFAFC] border border-[#E7E4DD]">
                  <span className="text-[#8A8A8A] font-bold block uppercase text-[10px] mb-0.5">
                    Chief Complaint
                  </span>
                  <p className="font-bold text-[#111111]">{extractedData.chiefComplaint}</p>
                </div>

                <div className="p-3 rounded-2xl bg-[#FAFAFC] border border-[#E7E4DD]">
                  <span className="text-[#8A8A8A] font-bold block uppercase text-[10px] mb-0.5">
                    Onset &amp; Chronology
                  </span>
                  <p className="font-semibold text-[#111111]">{extractedData.onset}</p>
                </div>

                <div className="p-3 rounded-2xl bg-[#FAFAFC] border border-[#E7E4DD]">
                  <span className="text-[#8A8A8A] font-bold block uppercase text-[10px] mb-0.5">
                    Pain Severity Score
                  </span>
                  <p className="font-bold text-[#EF4444]">{extractedData.severity}</p>
                </div>

                <div className="p-3 rounded-2xl bg-[#FAFAFC] border border-[#E7E4DD]">
                  <span className="text-[#8A8A8A] font-bold block uppercase text-[10px] mb-0.5">
                    Associated Symptoms
                  </span>
                  <p className="font-semibold text-[#111111]">{extractedData.associated}</p>
                </div>

                {extractedData.triageLevel === "EMERGENCY" && (
                  <div className="p-3 rounded-2xl bg-[#FEE2E2] border border-[#EF4444]/30 text-[#111111]">
                    <span className="font-extrabold text-[#EF4444] block text-[11px] mb-0.5">
                      🚨 Red Flag: Suspected Acute Coronary Syndrome
                    </span>
                    <span className="text-[11px] text-[#5F5E5A]">
                      Immediate ECG and physician priority consultation recommended.
                    </span>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => setIsComplete(true)}
                className="w-full py-3 rounded-2xl bg-[#7C6EF7] hover:bg-[#6758F0] text-white font-bold text-xs transition-all shadow-md shadow-[#7C6EF7]/20 flex items-center justify-center gap-1.5 cursor-pointer mt-4"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Complete Intake &amp; Generate OPD Slip</span>
              </button>
            </div>
          </div>
        ) : (
          /* Intake Completed: Printable OPD Triage Token Slip */
          <div className="max-w-2xl mx-auto bg-white border border-[#E7E4DD] rounded-3xl p-8 shadow-md text-center space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="w-16 h-16 rounded-3xl bg-[#DCFCE7] text-[#12B981] mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#7C6EF7] block mb-1">
                Clinical Intake Complete
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111111]">
                Patient OPD Token #104
              </h2>
              <p className="text-xs text-[#5F5E5A] mt-1">
                Assigned to: <strong>Department of General Medicine / Cardiology OPD (Room 12)</strong>
              </p>
            </div>

            {/* Token Summary Card */}
            <div className="p-5 rounded-2xl bg-[#FAFAFC] border border-[#E7E4DD] text-left text-xs space-y-2">
              <div className="flex justify-between py-1 border-b border-[#F2F0EB]">
                <span className="text-[#5F5E5A]">Triage Priority:</span>
                <span className="font-bold text-[#EF4444]">EMERGENCY (Red Flag Alert)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#F2F0EB]">
                <span className="text-[#5F5E5A]">Chief Complaint:</span>
                <span className="font-bold text-[#111111]">{extractedData.chiefComplaint}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#F2F0EB]">
                <span className="text-[#5F5E5A]">HPI Duration &amp; Severity:</span>
                <span className="font-semibold text-[#111111]">{extractedData.onset} • Score {extractedData.severity}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[#5F5E5A]">ABDM Status:</span>
                <span className="font-bold text-[#12B981]">Linked (91-4567-8901-2345)</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleResetSession}
                className="w-full sm:w-auto px-4 py-2.5 rounded-2xl border border-[#E7E4DD] bg-[#FAFAFC] hover:bg-white text-xs font-bold text-[#5F5E5A] transition-all flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Start New Patient Intake</span>
              </button>

              <Link
                href="/doctor"
                className="w-full sm:w-auto px-6 py-2.5 rounded-2xl bg-[#7C6EF7] hover:bg-[#6758F0] text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-[#7C6EF7]/20"
              >
                <Stethoscope className="w-4 h-4" />
                <span>View on Doctor Dashboard</span>
              </Link>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-[#E7E4DD] py-4 px-6 text-center text-xs text-[#5F5E5A]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>MediKiosk Patient Intake Station • SOCRATES / OPQRST Standard</span>
          <span className="text-[#8A8A8A]">Protected by DPDP Act 2023 • Bhashini Multilingual ASR Engine</span>
        </div>
      </footer>
    </div>
  );
}
