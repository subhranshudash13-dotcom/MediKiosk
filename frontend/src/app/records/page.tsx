"use client";

import { useState } from "react";
import {
  FileText,
  ShieldCheck,
  Download,
  Calendar,
  UploadCloud,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PrescriptionScanner } from "@/components/visualization/PrescriptionScanner";
import { PATIENT, TIMELINE, DEMO_MEDICATIONS } from "@/lib/demo-data";
import { cn } from "@/lib/utils";

const FILTERS = ["All Records", "Prescriptions", "Consultations", "Lab Reports"] as const;

export default function RecordsPage() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All Records");
  const [showUploader, setShowUploader] = useState<boolean>(false);

  return (
    <AppShell>
      <div className="space-y-8 text-left">
        {/* ABHA Patient ID Card */}
        <div className="rounded-3xl border border-slate-100 bg-white p-6 md:p-8 shadow-sm flex flex-wrap items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-[#E8F2FF] text-[#6A5CFF] border border-[#6A5CFF]/30 px-3 py-1 text-xs font-black uppercase tracking-wider">
                ABDM National Health ID
              </span>
              <span className="flex items-center gap-1 text-xs font-bold text-[#00C9A7]">
                <ShieldCheck className="h-3.5 w-3.5" /> Verified Citizen Record
              </span>
            </div>
            <h1 className="font-sans text-3xl md:text-4xl font-extrabold text-[#0D1B2A] mt-2">{PATIENT.name}</h1>
            <p className="text-xs text-[#6B7280] mt-1 font-medium">
              {PATIENT.age} yrs · {PATIENT.sex} · ABHA Number: <span className="font-mono font-bold text-[#0D1B2A]">{PATIENT.abha}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowUploader((prev) => !prev)}
              className="rounded-full bg-purple-flow text-white px-5 py-2.5 text-xs font-bold hover:shadow-purple transition-all shadow-xs flex items-center gap-2"
            >
              <UploadCloud className="h-3.5 w-3.5" />
              {showUploader ? "Hide Scanner" : "Attach New Document / Rx"}
            </button>
            <button
              onClick={() => window.print()}
              className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-[#0D1B2A] hover:bg-slate-50 transition-all shadow-xs flex items-center gap-2"
            >
              <Download className="h-3.5 w-3.5" /> Export EHR (PDF)
            </button>
          </div>
        </div>

        {/* Embedded Document Intelligence & OCR Intake */}
        {showUploader && (
          <div className="transition-all duration-300">
            <PrescriptionScanner patientId="P-DEMO-001" />
          </div>
        )}

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "rounded-full px-5 py-2 text-xs font-bold transition-all shadow-xs",
                filter === f
                  ? "bg-purple-flow text-white shadow-purple"
                  : "border border-slate-200 bg-white text-[#6B7280] hover:bg-slate-50"
              )}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Longitudinal History Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {TIMELINE.map((event) => (
            <div
              key={event.id}
              className="rounded-3xl border border-slate-100 bg-white p-6 shadow-xs text-left"
            >
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-slate-100 px-3 py-0.5 text-[10px] font-mono font-bold text-[#6B7280]">
                  {event.year}
                </span>
                <span className="rounded-full bg-[#E6FAF3] px-2.5 py-0.5 text-[10px] font-bold text-[#00C9A7]">
                  ABDM Verified
                </span>
              </div>
              <h3 className="font-sans text-lg font-bold text-[#0D1B2A] mt-3">{event.title}</h3>
              <p className="text-xs text-[#6B7280] leading-relaxed mt-1">{event.detail}</p>
            </div>
          ))}
        </div>

        {/* Medication Schedule Timeline */}
        <section className="rounded-3xl border border-slate-100 bg-white p-6 md:p-8 shadow-sm text-left">
          <p className="text-xs font-extrabold uppercase tracking-wider text-[#6A5CFF]">
            Pharmacotherapy Adherence
          </p>
          <h2 className="font-sans text-xl font-bold text-[#0D1B2A] mt-1">
            Active Prescriptions & Regimen Schedule
          </h2>

          <div className="mt-6 space-y-4">
            {DEMO_MEDICATIONS.map((m, i) => (
              <div key={m.id} className="rounded-2xl border border-slate-100 bg-[#F8FAFC] p-4">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-[#0D1B2A]">{m.value}</span>
                  <span className="text-[#00C9A7]">{i === 0 ? "2021 — Active" : "2024 — Active"}</span>
                </div>
                <div className="mt-2 h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className="h-full bg-[#6A5CFF] rounded-full"
                    style={{ width: i === 0 ? "85%" : "60%" }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
