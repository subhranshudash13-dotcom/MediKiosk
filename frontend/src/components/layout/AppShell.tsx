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
  Activity
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
    <div className="flex min-h-screen bg-[#FBF8F2] text-[#25232A] selection:bg-[#E8D6D4] selection:text-[#4B3158]">
      {/* =========================================================================
          LEFT SIDEBAR (Deep Aubergine #4B3158)
          ========================================================================= */}
      <aside className="hidden lg:flex w-64 flex-col justify-between bg-[#4B3158] text-white p-5 shrink-0 min-h-screen sticky top-0 shadow-subtle border-r border-[#3B2446]">
        <div className="space-y-8">
          {/* Logo / Brand */}
          <div className="px-2 pt-1">
            <Logo variant="light" href="/" />
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
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
                    "flex items-center gap-3 rounded-[8px] px-3.5 py-2.5 text-xs font-medium transition-colors",
                    isActive
                      ? "bg-white/15 text-white font-semibold"
                      : "text-white/70 hover:bg-white/10 hover:text-white"
                  )}
                >
                  <Icon className={cn("w-4 h-4", isActive ? "text-[#E8D6D4]" : "text-white/60")} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom System Telemetry & Start Kiosk Action */}
        <div className="space-y-4 px-1 pb-2">
          <div className="flex items-center gap-2 px-2">
            <div className="relative flex h-2.5 w-2.5 items-center justify-center">
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#74805A]" />
            </div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-white/60">
              ABDM System Active
            </p>
          </div>
          
          <Link
            href="/kiosk"
            className="group flex w-full items-center justify-between rounded-[22px] bg-[#C86B4A] hover:bg-[#B05637] text-white px-4 py-2.5 text-xs font-medium transition-colors shadow-subtle"
          >
            <span>Start Patient Intake</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-150 group-hover:translate-x-0.5" />
          </Link>
        </div>
      </aside>

      {/* =========================================================================
          MAIN CONTENT AREA (Warm Ivory #FBF8F2)
          ========================================================================= */}
      <div className="flex flex-1 flex-col overflow-x-hidden min-w-0">
        {/* Mobile Header */}
        <header className="lg:hidden sticky top-0 z-40 flex h-14 items-center justify-between border-b border-[#E9E2DC] bg-[#4B3158] text-white px-4">
          <Logo variant="light" href="/" />
          <Link
            href="/kiosk"
            className="flex items-center justify-center rounded-[22px] bg-[#C86B4A] px-3 py-1 text-xs font-medium text-white"
          >
            <span>Start Kiosk</span>
          </Link>
        </header>

        {/* Page Content */}
        <main className="flex-1 w-full mx-auto relative bg-[#FBF8F2]">
          {children}
        </main>
      </div>
    </div>
  );
}
