"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, Phone, Mail, Sparkles, CheckCircle2 } from "lucide-react";
import { AuthCardContainer } from "@/components/auth/AuthCardContainer";
import { AuthAPI } from "@/lib/auth-api";
import { useAuthStore } from "@/lib/auth-store";

export default function PatientSignupPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();

  const [authMode, setAuthMode] = useState<"password" | "otp">("password");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Email + Password state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [preferredLanguage, setPreferredLanguage] = useState("hi");

  // Mobile OTP state
  const [phone, setPhone] = useState("");
  const [otpStage, setOtpStage] = useState<"phone" | "verify">("phone");
  const [challengeId, setChallengeId] = useState("");
  const [otp, setOtp] = useState("");
  const [demoOtpCode, setDemoOtpCode] = useState<string | null>(null);
  const [otpFullName, setOtpFullName] = useState("");

  // Handle Google authentication
  const handleGoogleAuth = async (credential: string) => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await AuthAPI.googleAuth(credential, preferredLanguage);
      setUser(res.user);
      router.push("/patient/onboarding/abha");
    } catch (err: any) {
      setErrorMessage(err.response?.data?.detail || "Google registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle Email + Password registration
  const handlePasswordSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim()) {
      setErrorMessage("Please enter your first name.");
      return;
    }
    if (!email.trim() || !password) {
      setErrorMessage("Please enter a valid email and password.");
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    try {
      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
      const res = await AuthAPI.signup({
        email: email.trim(),
        password,
        full_name: fullName,
        preferred_language: preferredLanguage,
      });
      setUser(res.user);
      router.push("/patient/onboarding/abha");
    } catch (err: any) {
      setErrorMessage(err.response?.data?.detail || "Registration failed. Please check your details.");
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
      const res = await AuthAPI.requestOtp(phone, "signup");
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

  // Handle OTP confirmation
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
        full_name: otpFullName.trim() || undefined,
        preferred_language: preferredLanguage,
      });
      setUser(res.user);
      router.push("/patient/onboarding/abha");
    } catch (err: any) {
      setErrorMessage(err.response?.data?.detail || "Invalid or expired OTP code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCardContainer
      title="Create an account"
      subtitle="Your sovereign MediKiosk health account"
      onGoogleAuth={handleGoogleAuth}
      switchText="Have an account?"
      switchLinkText="Log in here"
      switchLinkHref="/patient/login"
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

      {/* 1. EMAIL & PASSWORD SIGNUP FORM */}
      {authMode === "password" && (
        <form onSubmit={handlePasswordSignup} className="space-y-3.5">
          {/* First & Last Name side-by-side pill inputs matching template */}
          <div className="grid grid-cols-2 gap-2.5">
            <input
              type="text"
              placeholder="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              className="w-full bg-[#F4F5F6] rounded-2xl px-4 py-3.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-black/10 focus:bg-white transition-all"
            />
            <input
              type="text"
              placeholder="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full bg-[#F4F5F6] rounded-2xl px-4 py-3.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-black/10 focus:bg-white transition-all"
            />
          </div>

          {/* Email input */}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full bg-[#F4F5F6] rounded-2xl px-4 py-3.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-black/10 focus:bg-white transition-all"
          />

          {/* Password with Eye Toggle inside pill matching template */}
          <div className="relative flex items-center">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password (min 8 characters)"
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

          {/* Preferred Language Selector */}
          <div className="flex items-center justify-between px-2 pt-0.5 text-xs text-neutral-500">
            <span>Preferred Language:</span>
            <select
              value={preferredLanguage}
              onChange={(e) => setPreferredLanguage(e.target.value)}
              className="bg-transparent font-semibold text-neutral-800 focus:outline-none cursor-pointer"
            >
              <option value="hi">हिन्दी (Hindi)</option>
              <option value="en">English</option>
              <option value="ta">தமிழ் (Tamil)</option>
              <option value="te">తెలుగు (Telugu)</option>
              <option value="bn">বাংলা (Bengali)</option>
              <option value="mr">मराठी (Marathi)</option>
              <option value="gu">ગુજરાતી (Gujarati)</option>
            </select>
          </div>

          {/* Solid Black Pill Button matching template */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-full bg-black hover:bg-neutral-800 active:scale-[0.99] text-white font-semibold text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <span>Create account</span>
            )}
          </button>
        </form>
      )}

      {/* 2. MOBILE OTP SIGNUP FORM */}
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

              <input
                type="text"
                placeholder="Full Name (optional)"
                value={otpFullName}
                onChange={(e) => setOtpFullName(e.target.value)}
                className="w-full bg-[#F4F5F6] rounded-2xl px-4 py-3.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-black/10 focus:bg-white transition-all"
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-full bg-black hover:bg-neutral-800 active:scale-[0.99] text-white font-semibold text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <span>Verify &amp; Create Account</span>
                )}
              </button>
            </form>
          )}
        </div>
      )}
    </AuthCardContainer>
  );
}
