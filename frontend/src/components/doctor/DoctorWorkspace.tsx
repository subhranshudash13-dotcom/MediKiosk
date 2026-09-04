"use client";

import { useState } from "react";
import {
  Activity,
  CheckCircle2,
  Clock,
  Printer,
  ChevronRight,
  ShieldAlert,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { ClinicalPulse } from "@/components/visualization/ClinicalPulse";
import {
  QUEUE,
  PATIENT,
  HPI,
  PAST_HISTORY,
} from "@/lib/demo-data";
import { cn } from "@/lib/utils";

// Minimal SVG for Clinical Nodes
const NodeIcon = ({ status }: { status: "verified" | "captured" | "pending" }) => {
  if (status === "verified") return <CheckCircle2 className="h-4 w-4 text-mint" />;
  if (status === "captured") return <span className="h-2 w-2 rounded-full bg-warning mx-1" />;
  return <span className="h-2 w-2 rounded-full border border-ink/30 mx-1" />;
};

export function DoctorWorkspace() {
  const [activePatientId, setActivePatientId] = useState(QUEUE[0].id);

  return (
    <AppShell>
      <div className="w-full bg-background min-h-screen">
        {/* =========================================================================
            TOP TELEMETRY HEADER
            ========================================================================= */}
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-ink/10 bg-background/90 backdrop-blur-md px-8 py-4">
          <div className="flex items-center gap-6">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-ink/40">TOKEN #{PATIENT.token}</p>
              <h1 className="font-sans text-2xl font-bold text-ink leading-none mt-1">{PATIENT.name}</h1>
            </div>
            <div className="h-8 w-[1px] bg-ink/10" />
            <div className="text-sm font-medium text-ink/70">
              {PATIENT.age} yrs · {PATIENT.sex}
            </div>
            <div className="h-8 w-[1px] bg-ink/10" />
            <div>
              <span className="inline-flex items-center gap-2 rounded-control border border-warning/20 bg-warning/10 px-3 py-1 text-xs font-bold text-warning">
                <ShieldAlert className="h-3.5 w-3.5" />
                URGENT CARE
              </span>
            </div>
          </div>

          <div className="flex gap-8">
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-widest text-ink/40">BP</p>
              <p className="font-sans text-lg font-bold text-ink">130/84</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-widest text-coral">PULSE</p>
              <p className="font-sans text-lg font-bold text-coral flex items-center gap-2">
                88 <span className="h-2 w-2 rounded-full bg-coral animate-ping" />
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-widest text-mint">SpO2</p>
              <p className="font-sans text-lg font-bold text-mint">98%</p>
            </div>
          </div>
        </header>

        {/* =========================================================================
            SPLIT SCREEN WORKSPACE
            ========================================================================= */}
        <div className="flex h-[calc(100vh-80px)] overflow-hidden">
          
          {/* LEFT: QUEUE & TIMELINE (Dense & Precise) */}
          <div className="w-80 border-r border-ink/10 bg-ink/5 overflow-y-auto flex flex-col">
            
            <div className="p-6">
              <p className="text-[10px] font-bold uppercase tracking-widest text-ink/40 mb-4">OPD QUEUE</p>
              <div className="space-y-2">
                {QUEUE.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setActivePatientId(p.id)}
                    className={cn(
                      "w-full rounded-data p-3 text-left transition-all border",
                      activePatientId === p.id
                        ? "border-forest bg-white shadow-clinical"
                        : "border-transparent hover:bg-ink/5 text-ink/70"
                    )}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-sm">{p.name}</span>
                      <span className="text-[10px] font-mono text-ink/40">{p.time}</span>
                    </div>
                    <span className="text-xs truncate block">{p.concern}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-auto border-t border-ink/10 p-6 bg-white flex-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-ink/40 mb-6">SESSION TIMELINE</p>
              <div className="space-y-4">
                {[
                  { time: "09:31", desc: "Patient arrived", status: "done" },
                  { time: "09:33", desc: "Language selected: Hindi", status: "done" },
                  { time: "09:35", desc: "Voice intake started", status: "done" },
                  { time: "09:39", desc: "SOCRATES structure 62%", status: "done" },
                  { time: "09:42", desc: "Triage completed", status: "done" },
                  { time: "09:43", desc: "Doctor notified", status: "active" },
                ].map((event, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <span className={cn(
                        "h-2 w-2 rounded-full",
                        event.status === "active" ? "bg-coral" : "bg-mint"
                      )} />
                      {i < 5 && <div className="w-[1px] h-full bg-ink/10 my-1" />}
                    </div>
                    <div className="pb-4">
                      <span className="text-[10px] font-mono text-ink/50">{event.time}</span>
                      <p className={cn(
                        "text-xs font-bold mt-0.5",
                        event.status === "active" ? "text-ink" : "text-ink/60"
                      )}>{event.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: CLINICAL CANVAS (Data dense, no giant cards) */}
          <div className="flex-1 overflow-y-auto bg-ivory p-8">
            <div className="max-w-4xl mx-auto space-y-12">
              
              {/* Top Summary Block */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-ai mb-2">PATIENT / CLINICAL SUMMARY</p>
                <h2 className="font-display text-4xl text-ink leading-tight">
                  Persistent Nocturnal Fever &<br />Sub-sternal Constriction
                </h2>
              </div>

              {/* Grid: SOCRATES Visual Map & HPI */}
              <div className="grid grid-cols-12 gap-12">
                
                {/* SOCRATES MAP */}
                <div className="col-span-5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-ink/40 mb-6 border-b border-ink/10 pb-2">SOCRATES MAP</p>
                  
                  <div className="space-y-4">
                    {[
                      { l: "S", name: "Site", val: "Thorax / Sub-sternal", status: "verified" },
                      { l: "O", name: "Onset", val: "3 days ago", status: "verified" },
                      { l: "C", name: "Character", val: "Constricting pressure", status: "verified" },
                      { l: "R", name: "Radiation", val: "Non-radiating", status: "captured" },
                      { l: "A", name: "Associated", val: "Diaphoresis", status: "verified" },
                      { l: "T", name: "Timing", val: "Nocturnal spikes", status: "verified" },
                      { l: "E", name: "Exacerbating", val: "Worse on exertion", status: "captured" },
                      { l: "S", name: "Severity", val: "7/10", status: "verified" },
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-start gap-4">
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="font-mono text-[10px] font-bold text-ink/30 w-3">{item.l}</span>
                          <NodeIcon status={item.status as any} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-ink">{item.val}</p>
                          <p className="text-[10px] uppercase text-ink/40">{item.name}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* HPI & Past History */}
                <div className="col-span-7 space-y-10">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-ink/40 mb-4 border-b border-ink/10 pb-2">HISTORY OF PRESENT ILLNESS</p>
                    <p className="text-sm text-ink/80 leading-relaxed font-medium">
                      {HPI}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-ink/40 mb-4 border-b border-ink/10 pb-2">PAST MEDICAL HISTORY</p>
                    <ul className="space-y-2">
                      {PAST_HISTORY.map((hist, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-ink/80 font-medium">
                          <span className="mt-1.5 h-1 w-1 rounded-full bg-ink/40 shrink-0" />
                          {hist}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Triage Dial Visualization */}
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-ink/40 mb-4 border-b border-ink/10 pb-2">TRIAGE INDEX</p>
                    <div className="relative h-12 flex items-center">
                      <div className="w-full h-1 bg-gradient-to-r from-mint via-warning to-coral rounded-full" />
                      {/* Marker */}
                      <div className="absolute left-[70%] -translate-x-1/2 flex flex-col items-center -mt-8">
                        <span className="text-[10px] font-bold text-coral mb-1">HIGH (72)</span>
                        <div className="h-4 w-[2px] bg-coral" />
                        <div className="h-3 w-3 rounded-full border-2 border-coral bg-white mt-1" />
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* Consultation Sign-off */}
              <div className="border-t border-ink/10 pt-8 mt-12 flex justify-between items-center">
                <p className="text-xs font-medium text-ink/50">
                  Data structured via AI processing. Please verify clinical findings.
                </p>
                <div className="flex gap-4">
                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-2 rounded-control px-6 py-2.5 text-xs font-bold text-ink hover:bg-ink/5 transition-colors border border-transparent hover:border-ink/10"
                  >
                    <Printer className="h-4 w-4" /> Print Record
                  </button>
                  <button className="flex items-center gap-2 rounded-control bg-forest px-8 py-2.5 text-xs font-bold text-white shadow-clinical-hover hover:bg-ink transition-colors">
                    Finalize Consultation <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </AppShell>
  );
}
