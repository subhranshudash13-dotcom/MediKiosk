"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Mic, Stethoscope, UserPlus, LogIn, LogOut, Clock } from "lucide-react";
import { Logo } from "./Logo";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/auth-store";
import { useEffect } from "react";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/kiosk", label: "Patient Kiosk" },
  { href: "/patient/history", label: "History" },
  { href: "/doctor", label: "Doctor Cockpit" },
  { href: "/documents", label: "Document Studio" },
  { href: "/abha", label: "ABHA & Consent" },
  { href: "/records", label: "EHR Records" },
];

export function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const isHome = pathname === "/";
  const { user, isAuthenticated, initAuth, logout } = useAuthStore();

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  const handleLogout = async () => {
    await logout();
    if (pathname.startsWith("/patient/dashboard") || pathname.startsWith("/kiosk")) {
      router.push("/");
    }
  };

  const handleKioskIntakeClick = (e: React.MouseEvent) => {
    if (!isAuthenticated) {
      e.preventDefault();
      router.push("/patient/login?returnUrl=/kiosk/intake");
    }
  };

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

        {/* Center: Navigation Pill Bar */}
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
              (link.href === "/kiosk" && pathname.startsWith("/kiosk"));
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

        {/* Right: Auth CTAs & Kiosk Intake */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {isAuthenticated && user ? (
            <>
              {/* Patient Profile / Dashboard */}
              <Link
                href="/patient/dashboard"
                className={cn(
                  "flex items-center gap-1.5 rounded-full font-semibold text-xs px-3.5 py-2 transition-colors shadow-xs border",
                  isHome
                    ? "bg-emerald-950/60 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/60"
                    : "bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100"
                )}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="truncate max-w-[100px] sm:max-w-[120px]">{user.full_name || "My Portal"}</span>
              </Link>

              {/* Logout Button (replacing Login button) */}
              <button
                type="button"
                onClick={handleLogout}
                className={cn(
                  "flex items-center gap-1.5 rounded-full font-semibold text-xs px-3.5 py-2 transition-all shadow-xs border cursor-pointer",
                  isHome
                    ? "bg-red-950/50 border-red-500/40 text-red-300 hover:bg-red-900/60"
                    : "bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
                )}
                title="Log out of MediKiosk"
              >
                <LogOut className="h-3.5 w-3.5 text-red-500" />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <>
              {/* Patient Login */}
              <Link
                href="/patient/login"
                className={cn(
                  "flex items-center gap-1.5 rounded-full font-semibold text-xs px-3.5 py-2 transition-colors shadow-xs border",
                  isHome
                    ? "bg-white/10 border-white/20 text-white hover:bg-white/20"
                    : "bg-white border-[#DEE2E6] text-[#2C3E50] hover:bg-[#F8F9FA]"
                )}
              >
                <LogIn className={cn("h-3.5 w-3.5", isHome ? "text-emerald-400" : "text-[#0056B3]")} />
                <span>Login</span>
              </Link>

              {/* Sign Up Button */}
              <Link
                href="/patient/signup"
                className={cn(
                  "hidden xs:flex items-center gap-1.5 rounded-full font-semibold text-xs px-3.5 py-2 transition-colors shadow-xs border",
                  isHome
                    ? "bg-[#2563EB]/20 border-[#2563EB]/40 text-blue-200 hover:bg-[#2563EB]/30"
                    : "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                )}
              >
                <UserPlus className="h-3.5 w-3.5 text-blue-500" />
                <span>Sign Up</span>
              </Link>
            </>
          )}

          <Link
            href="/doctor"
            className={cn(
              "hidden md:flex items-center gap-1.5 rounded-full font-semibold text-xs px-3.5 py-2 transition-colors shadow-xs border",
              isHome
                ? "bg-white/10 border-white/20 text-white hover:bg-white/20"
                : "bg-white border-[#DEE2E6] text-[#0056B3] hover:bg-[#EBF3FC]"
            )}
          >
            <Stethoscope className={cn("h-3.5 w-3.5", isHome ? "text-[#38BDF8]" : "text-[#0056B3]")} />
            <span>Doctor</span>
          </Link>

          <Link
            href="/kiosk/intake"
            onClick={handleKioskIntakeClick}
            className="rounded-full bg-[#0056B3] hover:bg-[#004494] text-white font-semibold text-xs px-4 py-2 shadow-sm flex items-center gap-1.5 transition-all hover:shadow-blue-500/25 cursor-pointer"
          >
            <Mic className="h-3.5 w-3.5 text-white" />
            <span>Start Intake &rarr;</span>
          </Link>
        </div>
      </div>
    </header>
  );
}


