"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserPlus, LogIn, Mic, ShieldCheck, ArrowRight, Activity, FileText } from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";
import { Nav } from "@/components/brand/Nav";
import { Footer } from "@/components/brand/Footer";

export default function PatientPortalGateway() {
  const router = useRouter();
  const { isAuthenticated, initialized, initAuth } = useAuthStore();

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  useEffect(() => {
    if (initialized && isAuthenticated) {
      router.push("/patient/dashboard");
    }
  }, [initialized, isAuthenticated, router]);

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-[#1F2421] flex flex-col justify-between selection:bg-[#E8F5EE] selection:text-[#1B4332]">
      <Nav />

      <main className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-12 sm:py-16 flex-1 flex flex-col items-center justify-center text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E8F5EE] border border-[#C6E7D2] text-[#1B4332] text-xs font-semibold shadow-xs">
          <ShieldCheck className="w-4 h-4 text-[#2D6A4F]" />
          <span>Patient Identity &amp; Longitudinal Health Record Portal</span>
        </div>

        <div className="max-w-2xl space-y-3">
          <h1 className="text-3xl sm:text-5xl font-extrabold font-heading text-[#1F2421] tracking-tight leading-tight">
            Manage Your Health Intake, Prescriptions &amp; ABDM Consents
          </h1>
          <p className="text-sm sm:text-base text-[#4E5752] leading-relaxed">
            Create or sign in to your personal MediKiosk identity. Your clinical triage encounters, OCR-scanned paper prescriptions, and national ABHA records stay securely bound to your account.
          </p>
        </div>

        {/* Action Choice Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-3xl pt-4 text-left">
          {/* 1. Login */}
          <Link
            href="/patient/login"
            className="p-6 rounded-[28px] bg-white border border-[#E0D7C9] shadow-subtle hover:border-[#1B4332]/40 hover:shadow-md transition-all flex flex-col justify-between space-y-4 group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-2xl bg-[#E8F5EE] flex items-center justify-center text-[#1B4332]">
              <LogIn className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold font-heading text-neutral-900">Sign In</h3>
              <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                Log in via Mobile OTP, Google, or Password to view records.
              </p>
            </div>
            <span className="text-xs font-bold text-[#1B4332] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              Patient Login &rarr;
            </span>
          </Link>

          {/* 2. Create Account */}
          <Link
            href="/patient/signup"
            className="p-6 rounded-[28px] bg-white border border-[#E0D7C9] shadow-subtle hover:border-[#1B4332]/40 hover:shadow-md transition-all flex flex-col justify-between space-y-4 group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-700">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold font-heading text-neutral-900">Create Account</h3>
              <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                New patient registration with optional national ABHA linking.
              </p>
            </div>
            <span className="text-xs font-bold text-amber-800 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              Sign Up Now &rarr;
            </span>
          </Link>

          {/* 3. Guest Kiosk */}
          <Link
            href="/kiosk"
            className="p-6 rounded-[28px] bg-neutral-50 border border-neutral-200 shadow-xs hover:bg-neutral-100/80 transition-all flex flex-col justify-between space-y-4 group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-2xl bg-neutral-200 flex items-center justify-center text-neutral-700">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold font-heading text-neutral-900">Guest Walk-In</h3>
              <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                Emergency or walk-in triage without creating an account.
              </p>
            </div>
            <span className="text-xs font-bold text-neutral-700 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              Guest Kiosk &rarr;
            </span>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
