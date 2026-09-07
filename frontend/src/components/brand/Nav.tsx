"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mic, Stethoscope, ShieldCheck, Activity } from "lucide-react";
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
    <header className="sticky top-0 z-50 px-4 py-3 md:px-8 bg-[#FBF9F5]/95 backdrop-blur-md border-b border-[#E0D7C9] shadow-subtle">
      <div className="mx-auto flex max-w-[1240px] items-center justify-between gap-4">
        {/* Left: Brand Logo */}
        <Logo />

        {/* Center: Navigation Pill Bar */}
        <nav className="hidden lg:flex items-center gap-1 rounded-full border border-[#E0D7C9] bg-white px-2 py-1 shadow-xs">
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
                    ? "bg-[#1B4332] text-white shadow-xs"
                    : "text-[#4E5752] hover:text-[#1B4332] hover:bg-[#F3EFE8]"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right: Doctor Switcher & Kiosk Intake */}
        <div className="flex items-center gap-2.5">
          <Link
            href="/doctor"
            className="hidden sm:flex items-center gap-1.5 rounded-full border border-[#E0D7C9] bg-white hover:bg-[#F3EFE8] text-[#1B4332] font-semibold text-xs px-3.5 py-2 transition-colors shadow-xs"
          >
            <Stethoscope className="h-3.5 w-3.5 text-[#1B4332]" />
            <span>Doctor View</span>
          </Link>
          <Link
            href="/kiosk"
            className="rounded-full bg-[#1B4332] hover:bg-[#081C15] text-white font-semibold text-xs px-4 py-2 shadow-xs flex items-center gap-1.5 transition-all"
          >
            <Mic className="h-3.5 w-3.5 text-[#D8F3DC]" />
            <span>Start Kiosk</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
