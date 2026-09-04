"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Globe, Mic, Stethoscope, ChevronDown, Facebook, Twitter } from "lucide-react";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/patient", label: "Patient Kiosk" },
  { href: "/doctor", label: "Doctor Workspace" },
  { href: "/records", label: "ABHA Records" },
  { href: "/system", label: "System Health" },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 px-4 py-4 md:px-8 bg-[#FBF8F2]/95 backdrop-blur-md border-b border-[#EAE2D5]">
      <div className="mx-auto flex max-w-[1240px] items-center justify-between gap-4">
        {/* Left: Brand Oval Emblem from Reference */}
        <Logo />

        {/* Center: Floating Olive/Cream Navigation Pill Bar */}
        <nav className="hidden lg:flex items-center gap-1 rounded-full border border-[#EAE2D5] bg-[#FFFFFF] px-3 py-1.5 shadow-[0_2px_12px_rgba(30,40,22,0.04)]">
          {NAV_LINKS.map((link) => {
            const active =
              pathname === link.href ||
              (link.href === "/patient" && pathname === "/kiosk");
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-full px-4 py-1.5 text-xs font-semibold transition-all",
                  active
                    ? "bg-[#455A2F] text-white shadow-xs font-bold"
                    : "text-[#5E6E54] hover:text-[#1E2816] hover:bg-[#F3ECE2]"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right: Language Dropdown Pill & Start Kiosk Button (Matching Reference) */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-[#EAE2D5] bg-[#FFFFFF] px-3.5 py-1.5 text-xs font-bold text-[#1E2816] shadow-xs">
            <Globe className="h-3.5 w-3.5 text-[#455A2F]" />
            <span>Select Language</span>
            <ChevronDown className="h-3 w-3 text-[#5E6E54]" />
          </div>

          <Button
            href="/patient"
            className="rounded-full bg-[#455A2F] hover:bg-[#344722] text-white font-bold text-xs px-5 py-2 shadow-xs"
          >
            <Mic className="mr-1.5 h-3.5 w-3.5" /> Start Kiosk
          </Button>
        </div>
      </div>
    </header>
  );
}
