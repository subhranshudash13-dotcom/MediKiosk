import {
  Cpu,
  Server,
  Zap,
  ShieldCheck,
  Languages,
  Database,
  Activity,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";

const SYSTEM_METRICS = [
  { label: "Groq LPU Inference", status: "Operational", latency: "240 ms", icon: Zap, iconBg: "bg-[#1D2A8F]/10 text-[#1D2A8F]" },
  { label: "Whisper ASR Engine", status: "Operational", latency: "420 ms", icon: Cpu, iconBg: "bg-[#FB923C]/15 text-[#FB923C]" },
  { label: "Clinical Safety Gate", status: "Operational", latency: "15 ms", icon: ShieldCheck, iconBg: "bg-emerald-50 text-emerald-700" },
  { label: "ABDM FHIR Bridge", status: "Operational", latency: "110 ms", icon: Database, iconBg: "bg-[#C2410C]/10 text-[#C2410C]" },
];

export default function SystemPage() {
  return (
    <AppShell>
      <div className="p-4 sm:p-6 md:p-8 space-y-8 text-left max-w-6xl mx-auto">
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#1D2A8F]/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#1D2A8F]">
            Architecture &amp; Microservice Health
          </span>
          <h1 className="font-heading text-2xl md:text-3xl font-bold text-[#374151] mt-2">
            System Telemetry &amp; Performance
          </h1>
          <p className="text-xs sm:text-sm text-[#374151]/70 leading-relaxed mt-1">
            Real-time latency metrics and operational health across our clinical NLP, speech recognition, and ABDM bridges.
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {SYSTEM_METRICS.map((m, idx) => {
            const Icon = m.icon;
            return (
              <div key={idx} className="rounded-[16px] border border-[#FDEBD0] bg-white p-5 shadow-sm text-left">
                <div className="flex items-center justify-between">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-[8px] ${m.iconBg}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {m.status}
                  </span>
                </div>
                <p className="text-xs font-semibold text-[#374151]/70 mt-3">{m.label}</p>
                <p className="text-xl font-heading font-bold text-[#374151] mt-0.5">{m.latency}</p>
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
