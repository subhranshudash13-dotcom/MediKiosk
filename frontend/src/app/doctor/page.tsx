"use client";

import Link from "next/link";
import { Stethoscope, AlertTriangle, ArrowLeft, Clock, FileText, CheckCircle2, Pill, Activity } from "lucide-react";

export default function DoctorDashboard() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-8">
      {/* Top Bar */}
      <header className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-sm border border-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Home</span>
          </Link>
          <div className="flex items-center gap-2">
            <Stethoscope className="w-6 h-6 text-emerald-400" />
            <h1 className="font-bold text-lg text-white">MediKiosk • Physician Consultation Workstation</h1>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span className="px-3 py-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 font-medium">
            ● OPD Live Queue (4 Triaged)
          </span>
        </div>
      </header>

      {/* Grid Layout: Left Queue & Right Clinical Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Triage Patient Queue */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" />
            <span>Triaged OPD Queue</span>
          </h2>

          <div className="space-y-3">
            {/* High Priority Red Flag Patient */}
            <div className="p-4 rounded-xl bg-red-950/40 border border-red-800/80 cursor-pointer hover:bg-red-950/60 transition-colors">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-red-300 text-sm">Token #104 • Ramesh Kumar (46M)</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-red-800 text-red-100">
                  RED FLAG
                </span>
              </div>
              <p className="text-xs text-red-200/90 font-medium">Retrosternal Chest Pain radiating to arm (3d)</p>
              <span className="text-[11px] text-slate-400 mt-2 block">Triaged 4 mins ago • ABHA Linked</span>
            </div>

            {/* Standard Queue Patient */}
            <div className="p-4 rounded-xl bg-slate-850/60 border border-slate-800 cursor-pointer hover:bg-slate-800 transition-colors">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-slate-200 text-sm">Token #105 • Sunita Devi (38F)</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800">
                  ROUTINE
                </span>
              </div>
              <p className="text-xs text-slate-400">Intermittent fever with chills x 4 days</p>
              <span className="text-[11px] text-slate-500 mt-2 block">Triaged 9 mins ago • ABHA Linked</span>
            </div>
          </div>
        </div>

        {/* Right: Physician-Ready Clinical Summary & Timeline */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            {/* Header with Red Flag Banner */}
            <div className="p-3 bg-red-900/30 border border-red-700/50 rounded-xl flex items-center gap-3 mb-6">
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
              <div className="text-xs text-red-200">
                <span className="font-bold">Red Flag Alert:</span> Suspected Acute Coronary Syndrome (ACS). Immediate ECG & Troponin recommended.
              </div>
            </div>

            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-white">Ramesh Kumar (46/M)</h3>
                <p className="text-xs text-slate-400">ABHA: 91-4567-8901-2345 • Phone: +91 98765 43210</p>
              </div>
              <span className="text-xs px-3 py-1 rounded-lg bg-blue-950 border border-blue-800 text-blue-300 font-medium">
                FHIR R4 Ready
              </span>
            </div>

            {/* Standard Clinical Summary Sections */}
            <div className="space-y-4 text-xs">
              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="font-bold text-slate-300 block mb-1 text-xs uppercase tracking-wide">Chief Complaint & HPI</span>
                <p className="text-slate-300 leading-relaxed">
                  Patient presents with acute onset retrosternal chest tightness radiating to the left arm and shoulder for 3 days. Aggravated by exertion, associated with mild diaphoresis and shortness of breath. SOCRATES score: 8/10.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                  <span className="font-bold text-slate-300 block mb-1 text-xs uppercase tracking-wide">Prior OCR Medications</span>
                  <p className="text-slate-400">Rx: Atorvastatin 20mg (0-0-1), Clopidogrel 75mg (1-0-0)</p>
                </div>
                <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                  <span className="font-bold text-slate-300 block mb-1 text-xs uppercase tracking-wide">OCR Lab Abnormalities</span>
                  <p className="text-amber-400">Serum Cholesterol: 240 mg/dL (High, ref &lt;200)</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="mt-8 flex items-center justify-between border-t border-slate-800 pt-4">
            <span className="text-xs text-slate-500">Physician verifies before committing to ABDM/HIS</span>
            <div className="flex gap-3">
              <button className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors">
                Edit Summary
              </button>
              <button className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg transition-colors">
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm & Generate FHIR R4 Bundle</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
