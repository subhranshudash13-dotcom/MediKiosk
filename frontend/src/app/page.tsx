import Link from "next/link";
import {
  Activity,
  Stethoscope,
  UserCheck,
  Sparkles,
  ShieldCheck,
  Languages,
  FileText,
  ArrowRight,
  Mic,
  Zap,
  Building2,
  CheckCircle2,
  Lock,
  HeartPulse,
  BrainCircuit,
  Layers,
  FileScan
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#FAFAFC] text-[#111111] flex flex-col justify-between selection:bg-[#EEEAFE]">
      {/* Top Header Bar */}
      <header className="bg-white border-b border-[#E7E4DD] px-6 py-4 sticky top-0 z-30 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#7C6EF7] text-white flex items-center justify-center shadow-md shadow-[#7C6EF7]/20">
              <HeartPulse className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg text-[#111111] tracking-tight">
                  MediKiosk
                </span>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#EEEAFE] text-[#7C6EF7] uppercase tracking-wider">
                  AI v2.0
                </span>
              </div>
              <p className="text-xs text-[#5F5E5A]">
                Smart Point-of-Entry Clinical Intake & ABDM Gateway
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-xl bg-[#DCFCE7] text-[#12B981]">
              <span className="w-2 h-2 rounded-full bg-[#12B981] animate-pulse" />
              NHA ABDM Sandbox Ready
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto w-full px-6 py-12 flex-1 flex flex-col items-center justify-center">
        {/* Top SIH Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#EEEAFE] border border-[#7C6EF7]/20 text-[#7C6EF7] text-xs font-bold mb-6 shadow-sm">
          <Sparkles className="w-4 h-4" />
          <span>Smart India Hackathon • Digital Indian Healthcare Innovation</span>
        </div>

        {/* Main Title & Subtitle */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-[#111111] tracking-tight text-center max-w-4xl leading-[1.15]">
          AI-Powered Clinical Intake &amp; <br className="hidden sm:block" />
          <span className="text-[#7C6EF7]">Multilingual Triage Kiosk</span>
        </h1>

        <p className="mt-4 text-base sm:text-lg text-[#5F5E5A] text-center max-w-2xl leading-relaxed">
          Bridging hospital OPD queues with voice-first Indian language triage, instant prescription OCR intelligence, and seamless ABDM FHIR R4 interoperability.
        </p>

        {/* 4 Core Module Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12 w-full">
          {/* 1. Patient Voice Kiosk */}
          <Link
            href="/kiosk"
            className="group p-6 bg-white rounded-3xl border border-[#E7E4DD] hover:border-[#7C6EF7] shadow-sm hover:shadow-xl hover:shadow-[#7C6EF7]/10 transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#EEEAFE] text-[#7C6EF7] flex items-center justify-center group-hover:scale-110 transition-transform">
                <Mic className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-[#111111] mt-5 group-hover:text-[#7C6EF7] transition-colors">
                Patient Voice Kiosk
              </h2>
              <p className="text-xs text-[#5F5E5A] mt-2 leading-relaxed">
                Multilingual voice triage in Hindi, Telugu, Tamil, and English. Adaptive SOCRATES questioning & AYUSH mode.
              </p>
            </div>
            <div className="mt-6 flex items-center gap-1.5 text-xs font-bold text-[#7C6EF7]">
              <span>Launch Kiosk</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* 2. Doctor Workstation */}
          <Link
            href="/doctor"
            className="group p-6 bg-white rounded-3xl border border-[#E7E4DD] hover:border-[#12B981] shadow-sm hover:shadow-xl hover:shadow-[#12B981]/10 transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#DCFCE7] text-[#12B981] flex items-center justify-center group-hover:scale-110 transition-transform">
                <Stethoscope className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-[#111111] mt-5 group-hover:text-[#12B981] transition-colors">
                Doctor Workstation
              </h2>
              <p className="text-xs text-[#5F5E5A] mt-2 leading-relaxed">
                Live OPD triage queue, emergency red-flag alerts, structured HPI, e-prescription studio, and FHIR bundles.
              </p>
            </div>
            <div className="mt-6 flex items-center gap-1.5 text-xs font-bold text-[#12B981]">
              <span>Open Workstation</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* 3. Document Intelligence & OCR */}
          <Link
            href="/documents"
            className="group p-6 bg-white rounded-3xl border border-[#E7E4DD] hover:border-[#06B6D4] shadow-sm hover:shadow-xl hover:shadow-[#06B6D4]/10 transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#CFFAFE] text-[#06B6D4] flex items-center justify-center group-hover:scale-110 transition-transform">
                <FileScan className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-[#111111] mt-5 group-hover:text-[#06B6D4] transition-colors">
                Document Intelligence
              </h2>
              <p className="text-xs text-[#5F5E5A] mt-2 leading-relaxed">
                Prescription OCR, automated medication parsing (Amlodipine 5mg OD), lab test extraction, and longitudinal timeline.
              </p>
            </div>
            <div className="mt-6 flex items-center gap-1.5 text-xs font-bold text-[#06B6D4]">
              <span>Upload Records</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* 4. ABHA & ABDM Consent Gateway */}
          <Link
            href="/abha"
            className="group p-6 bg-white rounded-3xl border border-[#E7E4DD] hover:border-[#7C6EF7] shadow-sm hover:shadow-xl hover:shadow-[#7C6EF7]/10 transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#EEEAFE] text-[#7C6EF7] flex items-center justify-center group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-[#111111] mt-5 group-hover:text-[#7C6EF7] transition-colors">
                ABHA &amp; Consent Desk
              </h2>
              <p className="text-xs text-[#5F5E5A] mt-2 leading-relaxed">
                ABDM M1/M2/M3 Sandbox, Counter QR check-in, OTP verification, DPDP Act consent, and historic FHIR linkage.
              </p>
            </div>
            <div className="mt-6 flex items-center gap-1.5 text-xs font-bold text-[#7C6EF7]">
              <span>Manage ABHA</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>

        {/* System Architecture Highlights Banner */}
        <div className="mt-14 w-full bg-white border border-[#E7E4DD] rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-[#F2F0EB] mb-6">
            <div className="flex items-center gap-2.5">
              <BrainCircuit className="w-5 h-5 text-[#7C6EF7]" />
              <h3 className="font-bold text-sm text-[#111111]">
                MediKiosk Integrated Clinical Pipeline
              </h3>
            </div>
            <span className="text-xs text-[#5F5E5A] font-mono">
              6-Part Engineering Standard
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 text-center">
            <div className="p-3 rounded-2xl bg-[#FAFAFC] border border-[#E7E4DD]">
              <span className="text-[10px] font-bold text-[#7C6EF7] uppercase block mb-1">Part 1</span>
              <h4 className="text-xs font-bold text-[#111111]">Clinical HPI</h4>
              <p className="text-[11px] text-[#5F5E5A] mt-0.5">SOCRATES &amp; Triage</p>
            </div>

            <div className="p-3 rounded-2xl bg-[#FAFAFC] border border-[#E7E4DD]">
              <span className="text-[10px] font-bold text-[#7C6EF7] uppercase block mb-1">Part 2</span>
              <h4 className="text-xs font-bold text-[#111111]">ABDM &amp; FHIR</h4>
              <p className="text-[11px] text-[#5F5E5A] mt-0.5">M1/M2/M3 Gateways</p>
            </div>

            <div className="p-3 rounded-2xl bg-[#FAFAFC] border border-[#E7E4DD]">
              <span className="text-[10px] font-bold text-[#7C6EF7] uppercase block mb-1">Part 3</span>
              <h4 className="text-xs font-bold text-[#111111]">Voice Agent</h4>
              <p className="text-[11px] text-[#5F5E5A] mt-0.5">ASR + LLM Guardrails</p>
            </div>

            <div className="p-3 rounded-2xl bg-[#FAFAFC] border border-[#E7E4DD]">
              <span className="text-[10px] font-bold text-[#7C6EF7] uppercase block mb-1">Part 4</span>
              <h4 className="text-xs font-bold text-[#111111]">Document AI</h4>
              <p className="text-[11px] text-[#5F5E5A] mt-0.5">OCR Rx &amp; Timeline</p>
            </div>

            <div className="p-3 rounded-2xl bg-[#FAFAFC] border border-[#E7E4DD]">
              <span className="text-[10px] font-bold text-[#7C6EF7] uppercase block mb-1">Part 5</span>
              <h4 className="text-xs font-bold text-[#111111]">Architecture</h4>
              <p className="text-[11px] text-[#5F5E5A] mt-0.5">FastAPI + Next.js</p>
            </div>

            <div className="p-3 rounded-2xl bg-[#FAFAFC] border border-[#E7E4DD]">
              <span className="text-[10px] font-bold text-[#7C6EF7] uppercase block mb-1">Part 6</span>
              <h4 className="text-xs font-bold text-[#111111]">Privacy / DPDP</h4>
              <p className="text-[11px] text-[#5F5E5A] mt-0.5">End-to-End Encrypted</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-[#E7E4DD] py-4 px-6 text-center text-xs text-[#5F5E5A]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>MediKiosk AI Clinical Intake Platform • Smart India Hackathon</span>
          <span className="text-[#8A8A8A]">Compliant with DPDP Act 2023 &amp; Ayushman Bharat Digital Mission</span>
        </div>
      </footer>
    </div>
  );
}
