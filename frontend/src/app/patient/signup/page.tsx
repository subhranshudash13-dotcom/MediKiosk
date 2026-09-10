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

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Email + Password state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [preferredLanguage, setPreferredLanguage] = useState("hi");

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

  return (
    <AuthCardContainer
      title="Create an account"
      subtitle="Your sovereign MediKiosk health account"
      onGoogleAuth={handleGoogleAuth}
      switchText="Have an account?"
      switchLinkText="Log in here"
      switchLinkHref="/patient/login"
    >
      {/* Error Alert */}
      {errorMessage && (
        <div className="p-3 rounded-2xl bg-red-50 border border-red-200/80 text-red-600 text-xs font-medium animate-fadeIn">
          {errorMessage}
        </div>
      )}

      {/* EMAIL & PASSWORD SIGNUP FORM */}
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
    </AuthCardContainer>
  );
}
