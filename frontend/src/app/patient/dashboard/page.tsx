"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  User,
  ShieldCheck,
  ShieldAlert,
  Mic,
  FileText,
  Clock,
  LogOut,
  Edit2,
  Check,
  X,
  Lock,
  ExternalLink,
  Loader2,
  Activity,
  PlusCircle,
} from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";
import { AuthAPI, ConsentRecord } from "@/lib/auth-api";
import { Nav } from "@/components/brand/Nav";
import { Footer } from "@/components/brand/Footer";

export default function PatientDashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, initialized, initAuth, logout, refreshUser } = useAuthStore();

  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [loadingConsents, setLoadingConsents] = useState(false);
  const [unlinkingAbha, setUnlinkingAbha] = useState(false);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  // Edit profile state
  const [editingProfile, setEditingProfile] = useState(false);
  const [editName, setEditName] = useState("");
  const [editLanguage, setEditLanguage] = useState("hi");
  const [savingProfile, setSavingProfile] = useState(false);

  // Consent request modal
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [requestingConsent, setRequestingConsent] = useState(false);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  useEffect(() => {
    if (initialized && !isLoading && !isAuthenticated) {
      router.push("/patient/login?returnUrl=/patient/dashboard");
    }
  }, [initialized, isLoading, isAuthenticated, router]);

  // Load consents when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadConsents();
    }
  }, [isAuthenticated]);

  const loadConsents = async () => {
    setLoadingConsents(true);
    try {
      const data = await AuthAPI.listConsents();
      setConsents(data);
    } catch (err) {
      console.warn("Could not load consents:", err);
    } finally {
      setLoadingConsents(false);
    }
  };

  const handleUnlinkAbha = async () => {
    if (!confirm("Are you sure you want to unlink your ABHA identity from this MediKiosk account?")) {
      return;
    }
    setUnlinkingAbha(true);
    try {
      await AuthAPI.unlinkAbha();
      await refreshUser();
    } catch (err) {
      alert("Could not unlink ABHA. Please try again.");
    } finally {
      setUnlinkingAbha(false);
    }
  };

  const handleRevokeConsent = async (consentId: string) => {
    if (!confirm("Revoke this ABDM healthcare data sharing consent?")) return;
    setRevokingId(consentId);
    try {
      await AuthAPI.revokeConsent(consentId);
      await loadConsents();
    } catch {
      alert("Could not revoke consent.");
    } finally {
      setRevokingId(null);
    }
  };

  const handleCreateConsent = async () => {
    setRequestingConsent(true);
    try {
      await AuthAPI.createConsent("CAREGIV", ["Prescription", "DiagnosticReport", "OPConsultation"]);
      await loadConsents();
      setShowConsentModal(false);
    } catch (err: any) {
      alert(err.response?.data?.detail || "Could not create consent request.");
    } finally {
      setRequestingConsent(false);
    }
  };

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      await AuthAPI.updateProfile({
        full_name: editName.trim() || user?.full_name,
        preferred_language: editLanguage,
      });
      await refreshUser();
      setEditingProfile(false);
    } catch {
      alert("Failed to update profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push("/patient/login");
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FBF9F5]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#1B4332]" />
          <p className="text-xs font-semibold text-neutral-500">Loading your health portal...</p>
        </div>
      </div>
    );
  }

  const isAbhaLinked = user.abha_status === "VERIFIED";

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-[#1F2421] flex flex-col justify-between">
      <Nav />

      <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-8 flex-1 space-y-8">
        {/* Top Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-[28px] bg-white border border-[#E0D7C9] shadow-subtle">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#E8F5EE] border border-[#C6E7D2] flex items-center justify-center text-[#1B4332] font-bold text-xl select-none">
              {user.full_name?.charAt(0) || "P"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold font-heading text-[#1F2421]">
                  {user.full_name}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-[#E8F5EE] border border-[#C6E7D2] text-[#1B4332] text-[11px] font-bold">
                  Verified Patient
                </span>
              </div>
              <p className="text-xs text-[#4E5752] mt-0.5">
                ID: <span className="font-mono text-neutral-700">{user.user_id.slice(0, 16)}...</span> • Registered {new Date(user.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/kiosk"
              className="px-5 py-2.5 rounded-full bg-[#1B4332] hover:bg-[#081C15] text-white font-semibold text-xs transition-all shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <Mic className="w-4 h-4 text-[#D8F3DC]" />
              <span>Start Intake Station</span>
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="p-2.5 rounded-full border border-neutral-200 hover:bg-neutral-100 text-neutral-600 hover:text-red-600 transition-colors cursor-pointer"
              title="Log out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column: Profile & ABHA Identity (1 col) */}
          <div className="space-y-6">
            {/* ABHA Healthcare Link Card */}
            <div className="p-6 rounded-[28px] bg-white border border-[#E0D7C9] shadow-subtle flex flex-col justify-between space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                  Healthcare Identity
                </span>
                {isAbhaLinked ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    ABHA Linked
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                    Not Linked
                  </span>
                )}
              </div>

              {isAbhaLinked ? (
                <div className="space-y-2 p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200/70">
                  <div className="text-xs text-neutral-500">Masked ABHA Number</div>
                  <div className="text-sm font-mono font-bold text-neutral-900">
                    {user.abha_number_masked || "91-XXXX-XXXX-XXXX"}
                  </div>
                  {user.abha_address && (
                    <div className="text-xs text-neutral-600 font-medium pt-1">
                      Address: <span className="text-black font-semibold">{user.abha_address}</span>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={handleUnlinkAbha}
                    disabled={unlinkingAbha}
                    className="mt-2 text-xs text-red-600 hover:text-red-800 font-semibold underline cursor-pointer disabled:opacity-50"
                  >
                    {unlinkingAbha ? "Unlinking..." : "Unlink ABHA"}
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-neutral-600 leading-relaxed">
                    Connect your Ayushman Bharat Health Account to securely discover and share previous medical history with attending clinicians.
                  </p>
                  <Link
                    href="/patient/onboarding/abha"
                    className="w-full py-2.5 rounded-full border border-neutral-300 hover:bg-neutral-50 text-neutral-900 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                  >
                    <span>Connect National ABHA</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
            </div>

            {/* Profile Demographics Card */}
            <div className="p-6 rounded-[28px] bg-white border border-[#E0D7C9] shadow-subtle space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                  Demographic Profile
                </span>
                {!editingProfile && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditName(user.full_name);
                      setEditLanguage(user.preferred_language || "hi");
                      setEditingProfile(true);
                    }}
                    className="text-xs text-[#1B4332] font-semibold flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Edit</span>
                  </button>
                )}
              </div>

              {editingProfile ? (
                <div className="space-y-3 pt-1">
                  <div>
                    <label className="text-[11px] font-semibold text-neutral-500">Full Name</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full bg-[#F4F5F6] rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-black/10"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-neutral-500">Preferred Language</label>
                    <select
                      value={editLanguage}
                      onChange={(e) => setEditLanguage(e.target.value)}
                      className="w-full bg-[#F4F5F6] rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none cursor-pointer"
                    >
                      <option value="hi">हिन्दी (Hindi)</option>
                      <option value="en">English</option>
                      <option value="ta">தமிழ் (Tamil)</option>
                      <option value="te">తెలుగు (Telugu)</option>
                      <option value="bn">বাংলা (Bengali)</option>
                      <option value="mr">मराठी (Marathi)</option>
                    </select>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleSaveProfile}
                      disabled={savingProfile}
                      className="flex-1 py-2 rounded-full bg-black text-white text-xs font-semibold hover:bg-neutral-800 disabled:opacity-50"
                    >
                      {savingProfile ? "Saving..." : "Save"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingProfile(false)}
                      className="px-4 py-2 rounded-full border border-neutral-300 text-xs font-semibold hover:bg-neutral-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between py-1.5 border-b border-neutral-100">
                    <span className="text-neutral-500">Language</span>
                    <span className="font-semibold text-neutral-800 uppercase">{user.preferred_language || "hi"}</span>
                  </div>
                  {user.email && (
                    <div className="flex justify-between py-1.5 border-b border-neutral-100">
                      <span className="text-neutral-500">Email</span>
                      <span className="font-semibold text-neutral-800">{user.email}</span>
                    </div>
                  )}
                  {user.mobile && (
                    <div className="flex justify-between py-1.5 border-b border-neutral-100">
                      <span className="text-neutral-500">Mobile</span>
                      <span className="font-semibold text-neutral-800">{user.mobile}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-1.5">
                    <span className="text-neutral-500">Connected Identities</span>
                    <span className="font-semibold text-neutral-800 capitalize">
                      {user.identities.join(", ") || "Password"}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Actions & Consent Hub (2 cols) */}
          <div className="md:col-span-2 space-y-6">
            {/* Action Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Link
                href="/patient/history"
                className="p-6 rounded-[28px] bg-gradient-to-br from-[#0B2545] to-[#134074] text-white shadow-subtle hover:shadow-md transition-all flex flex-col justify-between space-y-4 group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-blue-200">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold font-heading">Health History</h3>
                  <p className="text-xs text-white/80 mt-1 leading-relaxed">
                    Unified timeline of prior clinical visits, OCR prescriptions, lab trends, and active meds.
                  </p>
                </div>
                <span className="text-xs font-bold text-blue-200 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  View Records &rarr;
                </span>
              </Link>

              <Link
                href="/kiosk"
                className="p-6 rounded-[28px] bg-gradient-to-br from-[#1B4332] to-[#2D6A4F] text-white shadow-subtle hover:shadow-md transition-all flex flex-col justify-between space-y-4 group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-[#D8F3DC]">
                  <Mic className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold font-heading">Kiosk Triage</h3>
                  <p className="text-xs text-white/80 mt-1 leading-relaxed">
                    Begin vernacular clinical voice intake. Encounter automatically links to your profile.
                  </p>
                </div>
                <span className="text-xs font-bold text-[#D8F3DC] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Launch Station &rarr;
                </span>
              </Link>

              <Link
                href="/documents"
                className="p-6 rounded-[28px] bg-white border border-[#E0D7C9] shadow-subtle hover:border-[#1B4332]/40 transition-all flex flex-col justify-between space-y-4 group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-2xl bg-[#E8F5EE] flex items-center justify-center text-[#1B4332]">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold font-heading text-neutral-900">Document Studio</h3>
                  <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                    Upload physical prescription scans or lab reports. Extract OCR medications &amp; vitals.
                  </p>
                </div>
                <span className="text-xs font-bold text-[#1B4332] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Upload Scans &rarr;
                </span>
              </Link>
            </div>

            {/* ABDM Consent Hub */}
            <div className="p-6 sm:p-8 rounded-[28px] bg-white border border-[#E0D7C9] shadow-subtle space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold font-heading text-neutral-900 flex items-center gap-2">
                    <span>ABDM Care Consents</span>
                    <span className="px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600 text-[11px] font-bold">
                      {consents.length}
                    </span>
                  </h3>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Permission grants for historic health record exchanges with participating hospitals.
                  </p>
                </div>

                {isAbhaLinked && (
                  <button
                    type="button"
                    onClick={() => setShowConsentModal(true)}
                    className="px-3.5 py-1.5 rounded-full bg-[#1B4332] text-white text-xs font-semibold hover:bg-[#081C15] transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>New Consent</span>
                  </button>
                )}
              </div>

              {loadingConsents ? (
                <div className="py-8 flex justify-center text-neutral-400">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              ) : consents.length === 0 ? (
                <div className="py-8 px-4 text-center rounded-2xl bg-neutral-50 border border-neutral-100 text-neutral-500 text-xs">
                  {isAbhaLinked ? (
                    <>No active consent requests yet. You can create one above to permit historic record exchange.</>
                  ) : (
                    <>Link your ABHA identity above to request and manage ABDM health records consent.</>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {consents.map((c) => {
                    const isRevoked = c.status === "REVOKED";
                    return (
                      <div
                        key={c.id}
                        className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-neutral-900">{c.abdm_consent_id}</span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                isRevoked
                                  ? "bg-neutral-200 text-neutral-700"
                                  : "bg-emerald-100 text-emerald-800"
                              }`}
                            >
                              {c.status}
                            </span>
                          </div>
                          <p className="text-neutral-500 text-[11px]">
                            Purpose: <strong className="text-neutral-700">{c.purpose}</strong> • Types:{" "}
                            {c.hi_types.join(", ")}
                          </p>
                        </div>

                        {!isRevoked && (
                          <button
                            type="button"
                            onClick={() => handleRevokeConsent(c.id)}
                            disabled={revokingId === c.id}
                            className="text-xs text-red-600 hover:text-red-800 font-semibold underline self-start sm:self-auto cursor-pointer disabled:opacity-50"
                          >
                            {revokingId === c.id ? "Revoking..." : "Revoke Consent"}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* New Consent Modal */}
        {showConsentModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <div className="w-full max-w-md bg-white rounded-[28px] p-6 space-y-4 shadow-xl border border-neutral-100 animate-fadeIn">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-neutral-900 font-heading">
                  Request New ABDM Consent
                </h3>
                <button
                  type="button"
                  onClick={() => setShowConsentModal(false)}
                  className="p-1 rounded-full text-neutral-400 hover:text-black cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Grant permission for MediKiosk to discover and fetch your previous prescriptions, op-consultations, and lab reports from linked Health Information Providers (HIPs).
              </p>
              <div className="p-3 rounded-xl bg-neutral-50 text-xs space-y-1 text-neutral-700">
                <div><strong>Purpose:</strong> CAREGIV (Care Delivery &amp; Clinical Triage)</div>
                <div><strong>Records:</strong> Prescription, DiagnosticReport, OPConsultation</div>
                <div><strong>Linked ABHA:</strong> {user.abha_address || user.abha_number_masked}</div>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleCreateConsent}
                  disabled={requestingConsent}
                  className="flex-1 py-2.5 rounded-full bg-[#1B4332] text-white text-xs font-semibold hover:bg-[#081C15] transition-colors cursor-pointer disabled:opacity-50"
                >
                  {requestingConsent ? "Requesting..." : "Confirm & Send Request"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowConsentModal(false)}
                  className="px-4 py-2.5 rounded-full border border-neutral-300 text-xs font-semibold hover:bg-neutral-50 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
