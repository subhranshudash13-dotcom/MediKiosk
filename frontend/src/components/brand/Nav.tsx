"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mic, Stethoscope, User, LogIn } from "lucide-react";
import { Logo } from "./Logo";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/auth-store";
import { useEffect } from "react";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/patient", label: "Patient Portal" },
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
  const { user, isAuthenticated, initAuth } = useAuthStore();

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  return (
    <header
      className="sticky top-0 z-50 px-4 py-3 md:px-8 bg-white/90 backdrop-blur-md border-b border-slate-200/80 text-[#2C3E50] transition-colors shadow-xs"
    >
      <div className="mx-auto flex max-w-[1240px] items-center justify-between gap-4">
        {/* Left: Brand Logo */}
        <Logo variant="dark" />

        {/* Center: Navigation Pill Bar */}
        <nav
          className="hidden lg:flex items-center gap-1 rounded-full px-2 py-1 shadow-xs border bg-[#F1F5F9] border-slate-200/80 text-[#334155] transition-all"
        >
          {NAV_LINKS.map((link) => {
            const active =
              pathname === link.href ||
              (link.href === "/patient" && (pathname.startsWith("/patient") || pathname === "/kiosk")) ||
              (link.href === "/kiosk" && pathname.startsWith("/kiosk"));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all",
                  active
                    ? "bg-[#0056B3] text-white shadow-xs"
                    : "text-[#475569] hover:text-[#0056B3] hover:bg-white"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right: Patient Login/Profile + Doctor Switcher & Kiosk Intake */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {isAuthenticated && user ? (
            <Link
              href="/patient/dashboard"
              className="flex items-center gap-1.5 rounded-full font-semibold text-xs px-3.5 py-2 transition-colors shadow-xs border bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="truncate max-w-[100px] sm:max-w-[120px]">{user.full_name || "My Portal"}</span>
            </Link>
          ) : (
            <Link
              href="/patient/login"
              className="flex items-center gap-1.5 rounded-full font-semibold text-xs px-3.5 py-2 transition-colors shadow-xs border bg-white border-slate-200 text-[#334155] hover:bg-slate-50 hover:text-[#0056B3]"
            >
              <LogIn className="h-3.5 w-3.5 text-[#0056B3]" />
              <span className="hidden xs:inline">Patient</span> Login
            </Link>
          )}

          <Link
            href="/doctor"
            className="hidden sm:flex items-center gap-1.5 rounded-full font-semibold text-xs px-4 py-2 transition-colors shadow-xs border bg-white border-slate-200 text-[#0056B3] hover:bg-blue-50/70"
          >
            <Stethoscope className="h-3.5 w-3.5 text-[#0056B3]" />
            <span>Doctor View</span>
          </Link>
          <Link
            href="/kiosk/intake"
            className="rounded-full bg-[#0056B3] hover:bg-[#004494] text-white font-semibold text-xs px-4.5 py-2 shadow-xs flex items-center gap-1.5 transition-all hover:shadow-blue-500/25"
          >
            <Mic className="h-3.5 w-3.5 text-white" />
            <span>Get Started &rarr;</span>
          </Link>
        </div>
      </div>
    </header>
  );
}


