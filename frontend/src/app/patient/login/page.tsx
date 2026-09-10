"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2, Phone, Mail, Sparkles } from "lucide-react";
import { AuthCardContainer } from "@/components/auth/AuthCardContainer";
import { AuthAPI } from "@/lib/auth-api";
import { useAuthStore } from "@/lib/auth-store";

function PatientLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("returnUrl") || "/patient/dashboard";
  const { setUser } = useAuthStore();

  const [authMode, setAuthMode] = useState<"password" | "otp">("password");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Email + Password state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Mobile OTP state
  const [phone, setPhone] = useState("");
  const [otpStage, setOtpStage] = useState<"phone" | "verify">("phone");
  const [challengeId, setChallengeId] = useState("");
  const [otp, setOtp] = useState("");
  const [demoOtpCode, setDemoOtpCode] = useState<string | null>(null);

  // Handle Google authentication
  const handleGoogleAuth = async (credential: string) => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await AuthAPI.googleAuth(credential);
      setUser(res.user);
      router.push(returnUrl);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.detail || "Google login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle Email + Password login
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setErrorMessage("Please enter your email and password.");
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await AuthAPI.login({
        email: email.trim(),
        password,
      });
      setUser(res.user);
      router.push(returnUrl);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.detail || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  // Handle Mobile OTP request
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim() || phone.replace(/\D/g, "").length < 10) {
      setErrorMessage("Please enter a valid 10-digit mobile number.");
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await AuthAPI.requestOtp(phone, "login");
      setChallengeId(res.challenge_id);
      if (res.demo_otp) {
        setDemoOtpCode(res.demo_otp);
      }
      setOtpStage("verify");
    } catch (err: any) {
      setErrorMessage(err.response?.data?.detail || "Could not send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP verification
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim()) {
      setErrorMessage("Please enter the 6-digit verification code.");
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await AuthAPI.verifyOtp({
        challenge_id: challengeId,
        otp: otp.trim(),
      });
      setUser(res.user);
      router.push(returnUrl);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.detail || "Invalid or expired OTP code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCardContainer
      title="Welcome back"
      subtitle="Sign in to manage your medical history & appointments"
      onGoogleAuth={handleGoogleAuth}
      switchText="Don't have an account?"
      switchLinkText="Create an account"
      switchLinkHref="/patient/signup"
    >
      {/* Auth Mode Toggle Pill Tabs */}
      <div className="flex rounded-full bg-[#EAEBED] p-1 text-xs font-semibold">
        <button
          type="button"
          onClick={() => {
            setAuthMode("password");
            setErrorMessage(null);
          }}
          className={`flex-1 py-2 rounded-full transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            authMode === "password"
              ? "bg-white text-neutral-900 shadow-xs"
              : "text-neutral-500 hover:text-neutral-800"
          }`}
        >
          <Mail className="w-3.5 h-3.5" />
          <span>Email &amp; Password</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setAuthMode("otp");
            setErrorMessage(null);
          }}
          className={`flex-1 py-2 rounded-full transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            authMode === "otp"
              ? "bg-white text-neutral-900 shadow-xs"
              : "text-neutral-500 hover:text-neutral-800"
          }`}
        >
          <Phone className="w-3.5 h-3.5" />
          <span>Mobile OTP (India)</span>
        </button>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="p-3 rounded-2xl bg-red-50 border border-red-200/80 text-red-600 text-xs font-medium animate-fadeIn">
          {errorMessage}
        </div>
      )}

      {/* 1. EMAIL & PASSWORD LOGIN FORM */}
      {authMode === "password" && (
        <form onSubmit={handlePasswordLogin} className="space-y-3.5">
          {/* Email input */}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full bg-[#F4F5F6] rounded-2xl px-4 py-3.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-black/10 focus:bg-white transition-all"
          />

          {/* Password with Eye Toggle */}
          <div className="relative flex items-center">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-[#F4F5F6] rounded-2xl pl-4 pr-12 py-3.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-black/10 focus:bg-white transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
              className="absolute right-3.5 text-neutral-400 hover:text-neutral-700 p-1 cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Solid Black Pill Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-full bg-black hover:bg-neutral-800 active:scale-[0.99] text-white font-semibold text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <span>Log in</span>
            )}
          </button>
        </form>
      )}

      {/* 2. MOBILE OTP LOGIN FORM */}
      {authMode === "otp" && (
        <div className="space-y-3.5">
          {otpStage === "phone" ? (
            <form onSubmit={handleRequestOtp} className="space-y-3.5">
              <div className="flex items-center bg-[#F4F5F6] rounded-2xl px-4 py-3.5 focus-within:ring-2 focus-within:ring-black/10 focus-within:bg-white transition-all">
                <span className="text-sm font-bold text-neutral-500 mr-2 select-none">
                  🇮🇳 +91
                </span>
                <input
                  type="tel"
                  placeholder="10-digit mobile number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  maxLength={10}
                  required
                  className="w-full bg-transparent text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-full bg-black hover:bg-neutral-800 active:scale-[0.99] text-white font-semibold text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <span>Send OTP</span>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-3.5">
              <div className="p-3 rounded-2xl bg-neutral-50 border border-neutral-200/80 text-xs text-neutral-600 flex items-center justify-between">
                <span>Code sent to: <strong>+91 {phone}</strong></span>
                <button
                  type="button"
                  onClick={() => setOtpStage("phone")}
                  className="text-black font-semibold underline text-xs cursor-pointer"
                >
                  Change
                </button>
              </div>

              {demoOtpCode && (
                <button
                  type="button"
                  onClick={() => setOtp(demoOtpCode)}
                  className="w-full text-left p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold flex items-center gap-2 cursor-pointer hover:bg-amber-100/70 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Sandbox Code: <strong>{demoOtpCode}</strong> (Click to prefill)</span>
                </button>
              )}

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
                  <span>Verify &amp; Log in</span>
                )}
              </button>
            </form>
          )}
        </div>
      )}
    </AuthCardContainer>
  );
}

export default function PatientLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FBF9F5] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
        </div>
      }
    >
      <PatientLoginForm />
    </Suspense>
  );
}
