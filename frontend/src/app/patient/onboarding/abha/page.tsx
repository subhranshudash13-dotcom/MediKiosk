"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, ArrowRight, Loader2, QrCode, CheckCircle2, AlertCircle } from "lucide-react";
import { AuthBannerGraphic } from "@/components/auth/AuthBannerGraphic";
import { AuthAPI } from "@/lib/auth-api";
import { useAuthStore } from "@/lib/auth-store";

export default function AbhaOnboardingPage() {
  const router = useRouter();
  const { user, refreshUser } = useAuthStore();

  const [abhaId, setAbhaId] = useState("");
  const [stage, setStage] = useState<"input" | "otp" | "success">("input");
  const [txnId, setTxnId] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [verifiedProfile, setVerifiedProfile] = useState<any>(null);

  // Step 1: Start ABHA verification
  const handleStartVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!abhaId.trim()) {
      setErrorMessage("Please enter your 14-digit ABHA number or ABHA address.");
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await AuthAPI.startAbhaVerification(abhaId.trim());
      setTxnId(res.txn_id);
      setStage("otp");
    } catch (err: any) {
      setErrorMessage(err.response?.data?.detail || "ABHA verification request failed. Please check the ID.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Confirm OTP
  const handleConfirmOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim()) {
      setErrorMessage("Please enter the verification code.");
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await AuthAPI.confirmAbhaVerification(txnId, otp.trim());
      setVerifiedProfile(res);
      setStage("success");
      await refreshUser();
    } catch (err: any) {
      setErrorMessage(err.response?.data?.detail || "OTP verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleContinueToDashboard = () => {
    router.push("/patient/dashboard");
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-[#EAEFF4] via-[#F3F6F9] to-[#E5ECEF] text-neutral-800">
      <div className="w-full max-w-[420px] sm:max-w-[440px] bg-white rounded-[32px] sm:rounded-[38px] shadow-[0_20px_50px_rgba(0,0,0,0.08)] border border-neutral-100/80 overflow-hidden flex flex-col transition-all">
        {/* Banner with Organic Curves */}
        <AuthBannerGraphic
          title="Connect Your ABHA"
          subtitle="Ayushman Bharat Digital Health Account"
        />

        <div className="p-6 sm:p-8 flex flex-col space-y-5">
          {/* Reassuring ABDM Info Banner */}
          <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 text-emerald-900 text-xs leading-relaxed flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong>National Health Stack Integration:</strong> Linking your ABHA enables doctors to discover previous lab records with your explicit consent. <strong>This is optional.</strong>
            </div>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-2xl bg-red-50 border border-red-200/80 text-red-600 text-xs font-medium animate-fadeIn">
              {errorMessage}
            </div>
          )}

          {/* STAGE 1: Enter ABHA Number or Address */}
          {stage === "input" && (
            <form onSubmit={handleStartVerification} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5 pl-1">
                  ABHA ID or Address
                </label>
                <input
                  type="text"
                  placeholder="e.g. 91-1234-5678-9012 or user@abdm"
                  value={abhaId}
                  onChange={(e) => setAbhaId(e.target.value)}
                  required
                  className="w-full bg-[#F4F5F6] rounded-2xl px-4 py-3.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-black/10 focus:bg-white transition-all"
                />
              </div>

              {/* Sample demo helper */}
              <button
                type="button"
                onClick={() => setAbhaId("91-9876-5432-1098")}
                className="text-xs text-neutral-500 hover:text-black underline cursor-pointer pl-1"
              >
                Need a sandbox ID? Try: 91-9876-5432-1098
              </button>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-full bg-black hover:bg-neutral-800 active:scale-[0.99] text-white font-semibold text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <span>Send Verification Code</span>
                )}
              </button>
            </form>
          )}

          {/* STAGE 2: Confirm OTP */}
          {stage === "otp" && (
            <form onSubmit={handleConfirmOtp} className="space-y-3.5">
              <div className="p-3 rounded-2xl bg-neutral-50 border border-neutral-200/80 text-xs text-neutral-600 flex items-center justify-between">
                <span>Code sent to registered mobile for <strong>{abhaId}</strong></span>
                <button
                  type="button"
                  onClick={() => setStage("input")}
                  className="text-black font-semibold underline text-xs cursor-pointer"
                >
                  Change
                </button>
              </div>

              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold">
                Sandbox Demo OTP: <strong>123456</strong>
              </div>

              <input
                type="text"
                placeholder="Enter 6-digit OTP code"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                required
                className="w-full bg-[#F4F5F6] rounded-2xl px-4 py-3.5 text-center tracking-widest text-lg font-bold text-neutral-900 placeholder:text-neutral-400 placeholder:tracking-normal placeholder:font-normal placeholder:text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:bg-white transition-all"
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-full bg-black hover:bg-neutral-800 active:scale-[0.99] text-white font-semibold text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <span>Confirm &amp; Link ABHA</span>
                )}
              </button>
            </form>
          )}

          {/* STAGE 3: Success State */}
          {stage === "success" && (
            <div className="space-y-4 py-2 text-center animate-fadeIn">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-neutral-900">ABHA Linked Successfully!</h3>
                <p className="text-xs text-neutral-500 mt-1">
                  {verifiedProfile?.name} • {verifiedProfile?.abha_address}
                </p>
              </div>
              <button
                type="button"
                onClick={handleContinueToDashboard}
                className="w-full py-3.5 rounded-full bg-black hover:bg-neutral-800 text-white font-semibold text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Continue to Patient Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Prominent SKIP FOR NOW Button */}
          {stage !== "success" && (
            <div className="pt-2 border-t border-neutral-100 flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={handleContinueToDashboard}
                className="w-full py-3 rounded-full border border-neutral-200 hover:bg-neutral-50 text-neutral-600 hover:text-black font-semibold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Skip for now &amp; Continue to Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <p className="text-[11px] text-neutral-400 text-center">
                You can always link or unlink your ABHA at any time from settings.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
