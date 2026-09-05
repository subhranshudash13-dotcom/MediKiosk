"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Globe, Mic, Stethoscope, ChevronDown, HeartPulse } from "lucide-react";
import { Logo } from "./Logo";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/patient", label: "Patient Kiosk" },
  { href: "/doctor", label: "Doctor Cockpit" },
  { href: "/documents", label: "Document Studio" },
  { href: "/abha", label: "ABHA & Consent" },
  { href: "/records", label: "EHR Records" },
  { href: "/system", label: "System Health" },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 px-4 py-3.5 md:px-8 bg-white/95 backdrop-blur-md border-b border-[#FDEBD0]/80 shadow-xs">
      <div className="mx-auto flex max-w-[1240px] items-center justify-between gap-4">
        {/* Left: Brand Logo */}
        <Logo />

        {/* Center: Navigation Pill Bar */}
        <nav className="hidden lg:flex items-center gap-1 rounded-full border border-[#FDEBD0] bg-[#FDFBF7] px-2 py-1 shadow-xs">
          {NAV_LINKS.map((link) => {
            const active =
              pathname === link.href ||
              (link.href === "/patient" && pathname === "/kiosk");
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-xs font-medium transition-all",
                  active
                    ? "bg-[#1D2A8F] text-white shadow-xs font-semibold"
                    : "text-[#374151]/80 hover:text-[#1D2A8F] hover:bg-white"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right: Language Pill & Start Kiosk Button */}
        <div className="flex items-center gap-2.5">
          <Link
            href="/doctor"
            className="hidden sm:flex items-center gap-1.5 rounded-full border border-[#FDEBD0] bg-white hover:bg-[#FDFBF7] text-[#1D2A8F] font-medium text-xs px-3.5 py-2 transition-colors"
          >
            <Stethoscope className="h-3.5 w-3.5 text-[#1D2A8F]" />
            <span>Doctor View</span>
          </Link>
          <Link
            href="/kiosk"
            className="rounded-full bg-[#1D2A8F] hover:bg-[#15206B] text-white font-medium text-xs px-4 py-2 shadow-xs flex items-center gap-1.5 transition-all"
          >
            <Mic className="h-3.5 w-3.5 text-[#FB923C]" />
            <span>Start Kiosk</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
