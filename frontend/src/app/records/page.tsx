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
      <div className="p-4 sm:p-6 md:p-8 space-y-8 text-left max-w-6xl mx-auto">
        {/* ABHA Patient ID Card */}
        <div className="rounded-[16px] border border-[#FDEBD0] bg-white p-6 md:p-8 shadow-sm flex flex-wrap items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-[#1D2A8F]/10 text-[#1D2A8F] border border-[#1D2A8F]/20 px-3 py-0.5 text-xs font-bold uppercase tracking-wider">
                ABDM National Health ID
              </span>
              <span className="flex items-center gap-1 text-xs font-semibold text-emerald-700">
                <ShieldCheck className="h-3.5 w-3.5" /> Verified Citizen Record
              </span>
            </div>
            <h1 className="font-heading text-2xl md:text-3xl font-bold text-[#374151] mt-2">{PATIENT.name}</h1>
            <p className="text-xs text-[#374151]/70 mt-1 font-medium">
              {PATIENT.age} yrs · {PATIENT.sex} · ABHA Number: <span className="font-mono font-bold text-[#1D2A8F]">{PATIENT.abha}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowUploader((prev) => !prev)}
              className="rounded-full bg-[#1D2A8F] hover:bg-[#15206B] text-white px-5 py-2.5 text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <UploadCloud className="h-3.5 w-3.5 text-[#FB923C]" />
              {showUploader ? "Hide Scanner" : "Attach New Document / Rx"}
            </button>
            <button
              onClick={() => window.print()}
              className="rounded-full border border-[#FDEBD0] bg-[#FDFBF7] hover:bg-white px-5 py-2.5 text-xs font-semibold text-[#374151] transition-all shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <Download className="h-3.5 w-3.5 text-[#374151]/70" /> Export EHR (PDF)
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
                "rounded-full px-4 py-1.5 text-xs font-semibold transition-all shadow-xs cursor-pointer",
                filter === f
                  ? "bg-[#1D2A8F] text-white shadow-xs"
                  : "border border-[#FDEBD0] bg-white text-[#374151]/70 hover:bg-[#FDFBF7] hover:text-[#1D2A8F]"
              )}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Longitudinal History Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {TIMELINE.map((event) => (
            <div
              key={event.id}
              className="rounded-[16px] border border-[#FDEBD0] bg-white p-5 shadow-sm text-left"
            >
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-[#FDFBF7] border border-[#FDEBD0] px-2.5 py-0.5 text-[10px] font-mono font-bold text-[#1D2A8F]">
                  {event.year}
                </span>
                <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
                  ABDM Verified
                </span>
              </div>
              <h3 className="font-heading text-base font-bold text-[#374151] mt-2.5">{event.title}</h3>
              <p className="text-xs text-[#374151]/80 leading-relaxed mt-1">{event.detail}</p>
            </div>
          ))}
        </div>

        {/* Medication Schedule Timeline */}
        <section className="rounded-[16px] border border-[#FDEBD0] bg-white p-6 shadow-sm text-left">
          <p className="text-xs font-bold uppercase tracking-wider text-[#1D2A8F]">
            Pharmacotherapy Adherence
          </p>
          <h2 className="font-heading text-lg font-bold text-[#374151] mt-1">
            Active Prescriptions &amp; Regimen Schedule
          </h2>

          <div className="mt-5 space-y-3">
            {DEMO_MEDICATIONS.map((m, i) => (
              <div key={m.id} className="rounded-[10px] border border-[#FDEBD0] bg-[#FDFBF7] p-3.5">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className="text-[#374151]">{m.value}</span>
                  <span className="text-emerald-700">{i === 0 ? "2021 — Active" : "2024 — Active"}</span>
                </div>
                <div className="mt-2 h-1.5 w-full rounded-full bg-[#FDEBD0] overflow-hidden">
                  <div
                    className="h-full bg-[#1D2A8F] rounded-full"
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
