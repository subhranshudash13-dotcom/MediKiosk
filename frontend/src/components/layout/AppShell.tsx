"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HeartPulse,
  Mic,
  Stethoscope,
  FileText,
  ShieldCheck,
  ArrowRight,
  Activity,
  Sparkles
} from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Overview", icon: Activity },
  { href: "/kiosk", label: "Patient Kiosk", icon: Mic },
  { href: "/doctor", label: "Doctor Cockpit", icon: Stethoscope },
  { href: "/documents", label: "Document Studio", icon: FileText },
  { href: "/abha", label: "ABHA & Consent", icon: ShieldCheck },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-[#F8F9FA] text-[#2C3E50] selection:bg-[#CCE5FF] selection:text-[#0056B3]">
      {/* =========================================================================
          LEFT SIDEBAR (Deep Hospital Navy #002752)
          ========================================================================= */}
      <aside className="hidden lg:flex w-64 flex-col justify-between bg-[#002752] text-white p-5 shrink-0 min-h-screen sticky top-0 shadow-lg border-r border-[#001D3D]">
        <div className="space-y-8">
          {/* Logo / Brand */}
          <div className="px-2 pt-1">
            <Logo variant="light" href="/" />
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {NAV_ITEMS.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href === "/kiosk" && pathname === "/patient");
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all",
                    isActive
                      ? "bg-[#0056B3] text-white shadow-md"
                      : "text-white/70 hover:bg-white/10 hover:text-white"
                  )}
                >
                  <Icon className={cn("w-4 h-4", isActive ? "text-[#38BDF8]" : "text-white/60")} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom System Telemetry & Start Kiosk Action */}
        <div className="space-y-4 px-1 pb-2">
          <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-white/5 border border-white/10">
            <span className="w-2 h-2 rounded-full bg-[#28A745] animate-pulse" />
            <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-white/80">
              ABDM Grid &bull; Operational
            </p>
          </div>
          
          <Link
            href="/kiosk"
            className="group flex w-full items-center justify-between rounded-full bg-[#0056B3] hover:bg-[#004085] text-white px-4 py-2.5 text-xs font-bold transition-all shadow-md hover:shadow-lg cursor-pointer"
          >
            <span>Start Patient Intake</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-150 group-hover:translate-x-0.5 text-[#38BDF8]" />
          </Link>
        </div>
      </aside>

      {/* =========================================================================
          MAIN CONTENT AREA (Canvas #F8F9FA)
          ========================================================================= */}
      <div className="flex flex-1 flex-col overflow-x-hidden min-w-0">
        {/* Mobile Header */}
        <header className="lg:hidden sticky top-0 z-40 flex h-14 items-center justify-between border-b border-[#DEE2E6] bg-[#002752] text-white px-4">
          <Logo variant="light" href="/" />
          <Link
            href="/kiosk"
            className="flex items-center justify-center rounded-full bg-[#0056B3] px-3.5 py-1.5 text-xs font-bold text-white shadow-xs"
          >
            <span>Start Kiosk</span>
          </Link>
        </header>

        {/* Page Body */}
        <main className="flex-1 min-w-0 bg-[#F8F9FA] p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
