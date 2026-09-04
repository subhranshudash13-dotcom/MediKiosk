"use client";

import Link from "next/link";
import {
  Mic,
  Stethoscope,
  FileScan,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Activity,
  HeartPulse,
  Layers,
  CheckCircle2,
  Lock,
  Building2,
  Clock,
  Users,
  Languages,
  FileCheck2
} from "lucide-react";
import { HospitalMetricsChart } from "@/components/analytics/HospitalMetricsChart";
import { ClinicalArchitectureDiagram } from "@/components/illustrations/ClinicalArchitectureDiagram";
import { LiveTriageSimulator } from "@/components/interactive/LiveTriageSimulator";
import { HeroMedicalRecordDropzone } from "@/components/documents/HeroMedicalRecordDropzone";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#FAFAFC] text-[#111111] flex flex-col justify-between selection:bg-[#EEEAFE]">
      {/* Top Header Bar */}
      <header className="bg-white border-b border-[#E7E4DD] px-6 py-4 sticky top-0 z-30 shadow-xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#7C6EF7] text-white flex items-center justify-center shadow-xs">
              <HeartPulse className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg text-[#111111] tracking-tight">
                  MediKiosk
                </span>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#EEEAFE] text-[#7C6EF7] uppercase tracking-wider">
                  CLINICAL SUITE
                </span>
              </div>
              <p className="text-xs text-[#5F5E5A]">
                Smart Point-of-Entry Clinical Intake &amp; ABDM Gateway
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-xl bg-[#DCFCE7] text-[#12B981]">
              <span className="w-2 h-2 rounded-full bg-[#12B981]" />
              <span>NHA ABDM Sandbox M1/M2/M3</span>
            </div>
            <Link
              href="/doctor"
              className="px-4 py-2 rounded-xl bg-[#7C6EF7] hover:bg-[#6758F0] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
            >
              <Stethoscope className="w-3.5 h-3.5" />
              <span>Doctor Workstation</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto w-full px-6 py-12 flex-1 space-y-16">
        {/* Hero Section */}
        <section className="flex flex-col items-center justify-center text-center space-y-6 pt-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#EEEAFE] border border-[#7C6EF7]/20 text-[#7C6EF7] text-xs font-bold shadow-xs">
            <Sparkles className="w-4 h-4" />
            <span>Smart India Hackathon • High-Throughput Hospital OPD Optimization</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-[#111111] tracking-tight max-w-4xl leading-[1.12]">
            AI Point-of-Entry Triage &amp; <br />
            <span className="text-[#7C6EF7]">Multilingual Hospital Intake</span>
          </h1>

          <p className="text-base sm:text-lg text-[#5F5E5A] max-w-3xl leading-relaxed">
            Eliminating hospital OPD bottlenecks with voice-first Indian language intake, automated prescription OCR intelligence, and seamless ABDM FHIR R4 clinical hydration.
          </p>

          {/* Quick Key Performance Stat Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-3xl pt-2">
            <div className="p-4 rounded-2xl bg-white border border-[#E7E4DD] text-center">
              <span className="text-2xl sm:text-3xl font-extrabold text-[#12B981] block">
                -87.3%
              </span>
              <span className="text-xs font-bold text-[#5F5E5A] mt-1 block">
                OPD Wait Time Reduction
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-[#E7E4DD] text-center">
              <span className="text-2xl sm:text-3xl font-extrabold text-[#7C6EF7] block">
                98.4%
              </span>
              <span className="text-xs font-bold text-[#5F5E5A] mt-1 block">
                SOCRATES HPI Accuracy
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-[#E7E4DD] text-center">
              <span className="text-2xl sm:text-3xl font-extrabold text-[#06B6D4] block">
                5+
              </span>
              <span className="text-xs font-bold text-[#5F5E5A] mt-1 block">
                Indian Languages Voice ASR
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-[#E7E4DD] text-center">
              <span className="text-2xl sm:text-3xl font-extrabold text-[#111111] block">
                100%
              </span>
              <span className="text-xs font-bold text-[#5F5E5A] mt-1 block">
                ABDM &amp; FHIR Compliant
              </span>
            </div>
          </div>

          {/* Primary Action Row: Voice Kiosk Launch & Interactive Dropzone */}
          <div className="flex flex-col lg:flex-row items-center justify-center gap-6 pt-4 w-full max-w-4xl">
            {/* Left Kiosk Card */}
            <div className="flex-1 w-full p-6 bg-white border border-[#E7E4DD] rounded-3xl text-left space-y-4 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[#F2F0EB]">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-[#EEEAFE] text-[#7C6EF7] flex items-center justify-center font-bold">
                      <Mic className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-[#111111]">
                        Patient Voice Intake Station
                      </h3>
                      <span className="text-[10px] text-[#5F5E5A]">
                        Point-of-Entry Multilingual Kiosk
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#DCFCE7] text-[#12B981]">
                    LIVE
                  </span>
                </div>
                <p className="text-xs text-[#5F5E5A] mt-3 leading-relaxed">
                  Natural speech intake in 5+ Indian languages with adaptive SOCRATES clinical questioning and real-time emergency red-flag scoring.
                </p>
              </div>

              <Link
                href="/kiosk"
                className="w-full py-3 rounded-2xl bg-[#7C6EF7] hover:bg-[#6758F0] text-white font-extrabold text-xs flex items-center justify-center gap-2 transition-all shadow-xs"
              >
                <Mic className="w-4 h-4" />
                <span>Launch Patient Voice Kiosk</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Right Interactive Medical Record Dropzone */}
            <HeroMedicalRecordDropzone />
          </div>
        </section>

        {/* 4 Core Module Navigation Grid */}
        <section className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#E7E4DD]">
            <div>
              <span className="text-[10px] font-mono font-extrabold text-[#7C6EF7] uppercase tracking-wider block">
                Module Navigation
              </span>
              <h2 className="text-xl font-extrabold text-[#111111]">
                Core Operational Workspaces
              </h2>
            </div>
            <span className="text-xs text-[#5F5E5A] font-semibold">
              4 Integrated Gateways
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* 1. Patient Voice Kiosk */}
            <Link
              href="/kiosk"
              className="p-6 bg-white rounded-3xl border border-[#E7E4DD] hover:border-[#7C6EF7] transition-all flex flex-col justify-between group shadow-xs cursor-pointer"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#EEEAFE] text-[#7C6EF7] flex items-center justify-center font-bold">
                  <Mic className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-extrabold text-[#111111] mt-5 group-hover:text-[#7C6EF7] transition-colors">
                  Patient Voice Kiosk
                </h3>
                <p className="text-xs text-[#5F5E5A] mt-2 leading-relaxed">
                  Conversational triage in Hindi, Telugu, Tamil, and English. Adaptive SOCRATES questioning, pain scoring &amp; emergency red flags.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#F2F0EB] flex items-center justify-between text-xs font-bold text-[#7C6EF7]">
                <span>Launch Intake Station</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* 2. Doctor Workstation */}
            <Link
              href="/doctor"
              className="p-6 bg-white rounded-3xl border border-[#E7E4DD] hover:border-[#12B981] transition-all flex flex-col justify-between group shadow-xs cursor-pointer"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#DCFCE7] text-[#12B981] flex items-center justify-center font-bold">
                  <Stethoscope className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-extrabold text-[#111111] mt-5 group-hover:text-[#12B981] transition-colors">
                  Doctor Workstation
                </h3>
                <p className="text-xs text-[#5F5E5A] mt-2 leading-relaxed">
                  Real-time OPD triage queue, pre-populated HPI, emergency alerts, digital prescription studio, and HL7 FHIR R4 Bundle export.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#F2F0EB] flex items-center justify-between text-xs font-bold text-[#12B981]">
                <span>Open Workstation</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* 3. Document Intelligence & OCR */}
            <Link
              href="/documents"
              className="p-6 bg-white rounded-3xl border border-[#E7E4DD] hover:border-[#06B6D4] transition-all flex flex-col justify-between group shadow-xs cursor-pointer"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#CFFAFE] text-[#06B6D4] flex items-center justify-center font-bold">
                  <FileScan className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-extrabold text-[#111111] mt-5 group-hover:text-[#06B6D4] transition-colors">
                  Document Intelligence
                </h3>
                <p className="text-xs text-[#5F5E5A] mt-2 leading-relaxed">
                  Direct image/PDF attachment, OCR parsing, clinical purpose explanation, drug dosages (Amlodipine 5mg OD), and longitudinal timeline.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#F2F0EB] flex items-center justify-between text-xs font-bold text-[#06B6D4]">
                <span>Scan Documents</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* 4. ABHA & ABDM Consent Gateway */}
            <Link
              href="/abha"
              className="p-6 bg-white rounded-3xl border border-[#E7E4DD] hover:border-[#7C6EF7] transition-all flex flex-col justify-between group shadow-xs cursor-pointer"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#EEEAFE] text-[#7C6EF7] flex items-center justify-center font-bold">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-extrabold text-[#111111] mt-5 group-hover:text-[#7C6EF7] transition-colors">
                  ABHA &amp; Consent Desk
                </h3>
                <p className="text-xs text-[#5F5E5A] mt-2 leading-relaxed">
                  ABDM M1 OTP verification, Scan &amp; Share Counter QR check-in, DPDP Act consent artifacts, and historic hospital records discovery.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#F2F0EB] flex items-center justify-between text-xs font-bold text-[#7C6EF7]">
                <span>Verify ABHA ID</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>
        </section>

        {/* Section: Interactive Hospital OPD Impact Bar Chart */}
        <section>
          <HospitalMetricsChart />
        </section>

        {/* Section: End-to-End Clinical Architecture Diagram */}
        <section>
          <ClinicalArchitectureDiagram />
        </section>

        {/* Section: Live Triage & SOCRATES Simulation Sandbox */}
        <section>
          <LiveTriageSimulator />
        </section>

        {/* Section: Clinical Standards & DPDP Act 2023 Compliance Bar */}
        <section className="bg-white border border-[#E7E4DD] rounded-3xl p-6 sm:p-8 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-[#F2F0EB] mb-6">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#7C6EF7]" />
              <h3 className="font-extrabold text-sm text-[#111111]">
                Compliance, Interoperability &amp; Clinical Safety Standards
              </h3>
            </div>
            <span className="text-xs font-mono font-bold text-[#12B981] px-2.5 py-0.5 rounded-full bg-[#DCFCE7]">
              AUDITED
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 text-center">
            <div className="p-3.5 rounded-2xl bg-[#FAFAFC] border border-[#E7E4DD]">
              <span className="text-[10px] font-bold text-[#7C6EF7] uppercase block mb-1">Standard 1</span>
              <h4 className="text-xs font-extrabold text-[#111111]">SOCRATES</h4>
              <p className="text-[11px] text-[#5F5E5A] mt-0.5">8-Factor Clinical HPI</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#FAFAFC] border border-[#E7E4DD]">
              <span className="text-[10px] font-bold text-[#7C6EF7] uppercase block mb-1">Standard 2</span>
              <h4 className="text-xs font-extrabold text-[#111111]">HL7 FHIR R4</h4>
              <p className="text-[11px] text-[#5F5E5A] mt-0.5">Interoperable Bundles</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#FAFAFC] border border-[#E7E4DD]">
              <span className="text-[10px] font-bold text-[#7C6EF7] uppercase block mb-1">Standard 3</span>
              <h4 className="text-xs font-extrabold text-[#111111]">NHA ABDM</h4>
              <p className="text-[11px] text-[#5F5E5A] mt-0.5">M1, M2 &amp; M3 Gateways</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#FAFAFC] border border-[#E7E4DD]">
              <span className="text-[10px] font-bold text-[#7C6EF7] uppercase block mb-1">Standard 4</span>
              <h4 className="text-xs font-extrabold text-[#111111]">DPDP Act 2023</h4>
              <p className="text-[11px] text-[#5F5E5A] mt-0.5">Consent Governance</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#FAFAFC] border border-[#E7E4DD]">
              <span className="text-[10px] font-bold text-[#7C6EF7] uppercase block mb-1">Standard 5</span>
              <h4 className="text-xs font-extrabold text-[#111111]">Bhashini AI</h4>
              <p className="text-[11px] text-[#5F5E5A] mt-0.5">Indic Multilingual ASR</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#FAFAFC] border border-[#E7E4DD]">
              <span className="text-[10px] font-bold text-[#7C6EF7] uppercase block mb-1">Standard 6</span>
              <h4 className="text-xs font-extrabold text-[#111111]">ICD-10 / SNOMED</h4>
              <p className="text-[11px] text-[#5F5E5A] mt-0.5">Standardized Coding</p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-[#E7E4DD] py-6 px-6 text-center text-xs text-[#5F5E5A] mt-12">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <HeartPulse className="w-4 h-4 text-[#7C6EF7]" />
            <span className="font-bold text-[#111111]">MediKiosk AI Clinical Intake Platform</span>
            <span className="text-[#8A8A8A]">• Smart India Hackathon</span>
          </div>
          <span className="text-[#8A8A8A]">
            Compliant with DPDP Act 2023 &amp; Ayushman Bharat Digital Mission (NHA)
          </span>
        </div>
      </footer>
    </div>
  );
}
