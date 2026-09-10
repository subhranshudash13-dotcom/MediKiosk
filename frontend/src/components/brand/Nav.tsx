"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mic, Stethoscope } from "lucide-react";
import { Logo } from "./Logo";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/kiosk", label: "Patient Kiosk" },
  { href: "/doctor", label: "Doctor Cockpit" },
  { href: "/documents", label: "Document Studio" },
  { href: "/abha", label: "ABHA & Consent" },
  { href: "/records", label: "EHR Records" },
  { href: "/system", label: "System Health" },
];

export function Nav() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <header
      className={cn(
        "sticky top-0 z-50 px-4 py-3 md:px-8 backdrop-blur-md transition-colors shadow-sm",
        isHome
          ? "bg-slate-950/85 border-b border-white/10 text-white"
          : "bg-white/95 border-b border-[#DEE2E6] text-[#2C3E50]"
      )}
    >
      <div className="mx-auto flex max-w-[1240px] items-center justify-between gap-4">
        {/* Left: Brand Logo */}
        <Logo variant={isHome ? "light" : "dark"} />

        {/* Center: Navigation Pill Bar (Eka.care inspiration) */}
        <nav
          className={cn(
            "hidden lg:flex items-center gap-1 rounded-full px-2 py-1 shadow-xs border transition-all",
            isHome
              ? "bg-white/10 border-white/15 text-white"
              : "bg-[#F8F9FA] border-[#DEE2E6] text-[#2C3E50]"
          )}
        >
          {NAV_LINKS.map((link) => {
            const active =
              pathname === link.href ||
              (link.href === "/patient" && pathname === "/kiosk");
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all",
                  active
                    ? isHome
                      ? "bg-[#2563EB] text-white shadow-xs"
                      : "bg-[#0056B3] text-white shadow-xs"
                    : isHome
                    ? "text-white/80 hover:text-white hover:bg-white/15"
                    : "text-[#2C3E50] hover:text-[#0056B3] hover:bg-[#CCE5FF]/40"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right: Doctor Switcher & Kiosk Intake Buttons */}
        <div className="flex items-center gap-2.5">
          <Link
            href="/doctor"
            className={cn(
              "hidden sm:flex items-center gap-1.5 rounded-full font-semibold text-xs px-4 py-2 transition-colors shadow-xs border",
              isHome
                ? "bg-white/10 border-white/20 text-white hover:bg-white/20"
                : "bg-white border-[#DEE2E6] text-[#0056B3] hover:bg-[#EBF3FC]"
            )}
          >
            <Stethoscope className={cn("h-3.5 w-3.5", isHome ? "text-[#38BDF8]" : "text-[#0056B3]")} />
            <span>Doctor View</span>
          </Link>
          <Link
            href="/kiosk/intake"
            className="rounded-full bg-[#0056B3] hover:bg-[#004494] text-white font-semibold text-xs px-4.5 py-2 shadow-sm flex items-center gap-1.5 transition-all hover:shadow-blue-500/25"
          >
            <Mic className="h-3.5 w-3.5 text-white" />
            <span>Get Started &rarr;</span>
          </Link>
        </div>
      </div>
    </header>
  );
}


