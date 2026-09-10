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

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Email + Password state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

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

  return (
    <AuthCardContainer
      title="Welcome back"
      subtitle="Sign in to manage your medical history & appointments"
      onGoogleAuth={handleGoogleAuth}
      switchText="Don't have an account?"
      switchLinkText="Create an account"
      switchLinkHref="/patient/signup"
    >
      {/* Error Alert */}
      {errorMessage && (
        <div className="p-3 rounded-2xl bg-red-50 border border-red-200/80 text-red-600 text-xs font-medium animate-fadeIn">
          {errorMessage}
        </div>
      )}

      {/* EMAIL & PASSWORD LOGIN FORM */}
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
