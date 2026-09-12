"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Mic,
  Stethoscope,
  LogIn,
  LogOut,
  Menu,
  X,
  ArrowRight,
} from "lucide-react";
import { Logo } from "./Logo";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/auth-store";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/kiosk", label: "Kiosk" },
  { href: "/patient/history", label: "History" },
  { href: "/doctor", label: "Doctor" },
  { href: "/documents", label: "Documents" },
  { href: "/abha", label: "ABHA" },
  { href: "/records", label: "Records" },
];

export function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, initAuth, logout } = useAuthStore();

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    await logout();
    if (pathname.startsWith("/patient/dashboard") || pathname.startsWith("/kiosk/intake")) {
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
    <header className="sticky top-0 z-50 w-full bg-slate-950/85 md:bg-[#090D16]/90 backdrop-blur-md border-b border-white/10 text-white transition-all shadow-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 gap-4">
        {/* Left: Brand Logo */}
        <div className="flex items-center shrink-0">
          <Logo variant="light" href="/" />
        </div>

        {/* Center: Frosted Capsule Navigation Bar */}
        <nav className="hidden lg:flex items-center gap-1 rounded-full px-2 py-1.5 border border-white/15 bg-white/10 backdrop-blur-md shadow-xs text-white">
          {NAV_LINKS.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname === link.href ||
                  (link.href === "/kiosk" && (pathname.startsWith("/kiosk") || pathname === "/patient")) ||
                  (link.href === "/doctor" && pathname.startsWith("/doctor")) ||
                  (link.href === "/patient/history" && pathname.startsWith("/patient/history")) ||
                  (link.href === "/documents" && pathname.startsWith("/documents")) ||
                  (link.href === "/abha" && pathname.startsWith("/abha")) ||
                  (link.href === "/records" && pathname.startsWith("/records"));

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-xs font-medium transition-all whitespace-nowrap",
                  active
                    ? "bg-[#2563EB] text-white shadow-xs font-semibold"
                    : "text-white/80 hover:text-white hover:bg-white/15"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right: Auth Actions & Pill CTAs */}
        <div className="hidden md:flex items-center gap-2 sm:gap-2.5 shrink-0">
          {isAuthenticated && user ? (
            <>
              {/* User Profile Pill */}
              <Link
                href="/patient/dashboard"
                className="flex items-center gap-2 rounded-full font-medium text-xs px-3.5 py-1.5 border border-emerald-500/40 bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-300 transition-colors shadow-xs"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="truncate max-w-[110px]">{user.full_name || "Profile"}</span>
              </Link>

              {/* Red Outline Logout Pill */}
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-1.5 rounded-full font-medium text-xs px-3.5 py-1.5 border border-red-500/40 bg-red-950/30 hover:bg-red-900/50 text-red-300 transition-all shadow-xs cursor-pointer"
                title="Log out of MediKiosk"
              >
                <LogOut className="h-3.5 w-3.5 text-red-400" />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <Link
              href="/patient/login"
              className="flex items-center gap-1.5 rounded-full font-medium text-xs px-3.5 py-1.5 border border-white/20 bg-white/10 hover:bg-white/20 text-white transition-colors shadow-xs"
            >
              <LogIn className="h-3.5 w-3.5 text-emerald-400" />
              <span>Login</span>
            </Link>
          )}

          {/* Quick Doctor Workstation Link */}
          <Link
            href="/doctor"
            className="flex items-center gap-1.5 rounded-full font-medium text-xs px-3.5 py-1.5 border border-white/20 bg-white/10 hover:bg-white/20 text-white transition-colors shadow-xs"
          >
            <Stethoscope className="h-3.5 w-3.5 text-[#38BDF8]" />
            <span>Doctor</span>
          </Link>

          {/* Start Intake Blue Pill CTA */}
          <Link
            href="/kiosk/intake"
            onClick={handleKioskIntakeClick}
            className="flex items-center gap-1.5 rounded-full font-bold text-xs px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white transition-all shadow-md hover:shadow-blue-500/30 cursor-pointer"
          >
            <Mic className="h-3.5 w-3.5 text-white" />
            <span>Start Intake &rarr;</span>
          </Link>
        </div>

        {/* Mobile Hamburger Toggle Button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="flex lg:hidden p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-white/10 bg-slate-950/95 backdrop-blur-xl px-4 py-4 space-y-3 shadow-xl text-white">
          <div className="space-y-1">
            {NAV_LINKS.map((link) => {
              const active =
                link.href === "/"
                  ? pathname === "/"
                  : pathname === link.href ||
                    (link.href === "/kiosk" && pathname.startsWith("/kiosk"));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "block px-3.5 py-2.5 text-sm rounded-lg font-medium transition-colors",
                    active
                      ? "bg-[#2563EB] text-white font-semibold"
                      : "text-white/80 hover:text-white hover:bg-white/10"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          <div className="pt-3 border-t border-white/10 flex flex-col gap-3">
            {isAuthenticated && user ? (
              <div className="flex items-center justify-between py-1">
                <Link
                  href="/patient/dashboard"
                  className="text-xs font-semibold text-emerald-300 bg-emerald-950/60 border border-emerald-500/40 px-3.5 py-1.5 rounded-full flex items-center gap-2"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{user.full_name || "Dashboard"}</span>
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-xs text-red-400 font-medium px-3 py-1.5 rounded-full bg-red-950/40 border border-red-500/30 flex items-center gap-1.5"
                >
                  <LogOut className="h-3.5 w-3.5 text-red-400" />
                  <span>Log out</span>
                </button>
              </div>
            ) : (
              <Link
                href="/patient/login"
                className="w-full text-center py-2 text-xs font-medium text-white border border-white/20 bg-white/10 rounded-full hover:bg-white/20 flex items-center justify-center gap-1.5"
              >
                <LogIn className="h-3.5 w-3.5 text-emerald-400" />
                <span>Log in</span>
              </Link>
            )}

            <Link
              href="/kiosk/intake"
              onClick={handleKioskIntakeClick}
              className="w-full text-center py-2.5 rounded-full bg-[#2563EB] text-white text-xs font-bold hover:bg-[#1D4ED8] transition-all flex items-center justify-center gap-2 shadow-md"
            >
              <Mic className="w-3.5 h-3.5 text-white" />
              <span>Start Patient Intake</span>
              <ArrowRight className="w-3.5 h-3.5 text-white/80" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
