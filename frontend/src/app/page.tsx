import Link from "next/link";
import { Activity, Stethoscope, UserCheck, Sparkles, ShieldCheck, Languages } from "lucide-react";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 md:p-12 max-w-6xl mx-auto">
      {/* Header Badge */}
      <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-sm font-medium mb-6 animate-pulse">
        <Sparkles className="w-4 h-4 text-blue-600" />
        <span>Smart India Hackathon • Digital Indian Healthcare MVP</span>
      </div>

      {/* Main Title */}
      <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight text-center max-w-3xl">
        Welcome to <span className="text-blue-600">MediKiosk</span>
      </h1>
      <p className="mt-4 text-lg md:text-xl text-slate-600 text-center max-w-2xl">
        AI-Powered Multilingual Clinical Intake, Document Intelligence, and ABDM-Enabled Point-of-Entry Health Platform.
      </p>

      {/* Portal Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 w-full">
        {/* Patient Kiosk Mode */}
        <Link
          href="/kiosk"
          className="group relative p-8 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-500 transition-all duration-300 flex flex-col justify-between"
        >
          <div>
            <div className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
              <Activity className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mt-6 group-hover:text-blue-600 transition-colors">
              Patient Kiosk
            </h2>
            <p className="text-slate-600 mt-2 text-sm leading-relaxed">
              Touch & Voice-first multimodal triage in 22 Indian languages. Adaptive SOCRATES questioning & AYUSH intake.
            </p>
          </div>
          <div className="mt-6 flex items-center gap-2 text-blue-600 font-semibold text-sm">
            <span>Launch Kiosk Mode</span>
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </div>
        </Link>

        {/* Doctor Consultation Dashboard */}
        <Link
          href="/doctor"
          className="group relative p-8 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-emerald-500 transition-all duration-300 flex flex-col justify-between"
        >
          <div>
            <div className="w-14 h-14 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
              <Stethoscope className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mt-6 group-hover:text-emerald-600 transition-colors">
              Doctor Dashboard
            </h2>
            <p className="text-slate-600 mt-2 text-sm leading-relaxed">
              Instant physician summary, prioritized triage queue, emergency red-flags, and digitized document timeline.
            </p>
          </div>
          <div className="mt-6 flex items-center gap-2 text-emerald-600 font-semibold text-sm">
            <span>Open Clinician View</span>
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </div>
        </Link>

        {/* ABHA & Consent Management */}
        <Link
          href="/abha"
          className="group relative p-8 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-indigo-500 transition-all duration-300 flex flex-col justify-between"
        >
          <div>
            <div className="w-14 h-14 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mt-6 group-hover:text-indigo-600 transition-colors">
              ABHA & Consent Desk
            </h2>
            <p className="text-slate-600 mt-2 text-sm leading-relaxed">
              ABDM sandbox integration, instant ABHA linking, DPDP Act 2023 audio-guided consent, and FHIR R4 bundle exports.
            </p>
          </div>
          <div className="mt-6 flex items-center gap-2 text-indigo-600 font-semibold text-sm">
            <span>Manage ABHA & Consent</span>
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </div>
        </Link>
      </div>

      {/* Feature Highlights Footer */}
      <div className="mt-16 flex flex-wrap items-center justify-center gap-8 text-xs font-medium text-slate-500 uppercase tracking-wider">
        <span className="flex items-center gap-1.5"><Languages className="w-4 h-4 text-slate-400" /> 22 Indian Languages</span>
        <span className="flex items-center gap-1.5"><Activity className="w-4 h-4 text-slate-400" /> FHIR R4 Compliant</span>
        <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-slate-400" /> ABDM M1/M2/M3 Ready</span>
        <span className="flex items-center gap-1.5"><UserCheck className="w-4 h-4 text-slate-400" /> Allopathy & AYUSH Modes</span>
      </div>
    </main>
  );
}
