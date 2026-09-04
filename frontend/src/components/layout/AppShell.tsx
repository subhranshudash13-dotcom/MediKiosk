"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Overview" },
  { href: "/patient", label: "Patient" },
  { href: "/doctor", label: "Doctor" },
  { href: "/records", label: "Records" },
  { href: "/system", label: "System" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-background text-foreground selection:bg-mint selection:text-forest">
      {/* =========================================================================
          LEFT SIDEBAR (Living Clinical Navigation)
          ========================================================================= */}
      <aside className="hidden lg:flex w-64 flex-col justify-between border-r border-ink/5 bg-background p-6 shrink-0 min-h-screen sticky top-0">
        <div className="space-y-12">
          {/* Logo / Brand */}
          <div className="px-2 pt-2">
            <h1 className="font-display text-2xl font-bold tracking-tight text-forest">MEDIKIOSK</h1>
            <p className="text-xs font-medium tracking-widest text-ink/50 uppercase mt-1">
              Clinical Care
            </p>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href === "/patient" && pathname === "/kiosk");

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-data px-4 py-3 text-[13px] font-semibold transition-all duration-300",
                    isActive
                      ? "bg-mint/40 text-forest"
                      : "text-ink/60 hover:bg-ink/5 hover:text-ink"
                  )}
                >
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom System Telemetry */}
        <div className="space-y-5 px-2 pb-4">
          <div className="flex items-center gap-2">
            <div className="relative flex h-3 w-3 items-center justify-center">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-coral opacity-40" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-coral" />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-ink/50">
              SYSTEM / OPERATIONAL
            </p>
          </div>
          
          <Link
            href="/patient"
            className="group flex w-full items-center justify-between rounded-control border border-ink/10 bg-background px-4 py-2.5 text-xs font-bold text-forest transition-all duration-150 hover:bg-forest hover:text-white hover:border-forest"
          >
            <span>Start Kiosk</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-150 group-hover:translate-x-1" />
          </Link>
        </div>
      </aside>

      {/* =========================================================================
          MAIN CONTENT AREA
          ========================================================================= */}
      <div className="flex flex-1 flex-col overflow-x-hidden min-w-0">
        {/* Mobile Header */}
        <header className="lg:hidden sticky top-0 z-40 flex h-16 items-center justify-between border-b border-ink/5 bg-background/95 px-6 backdrop-blur-sm">
          <div>
            <h1 className="font-display text-xl font-bold tracking-tight text-forest">MEDIKIOSK</h1>
          </div>
          <Link
            href="/patient"
            className="group flex items-center justify-center rounded-control bg-forest px-4 py-2 text-xs font-bold text-white"
          >
            <span>Start Kiosk</span>
          </Link>
        </header>

        {/* Page Content */}
        <main className="flex-1 w-full mx-auto relative">
          {children}
        </main>
      </div>
    </div>
  );
}
