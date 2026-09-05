import Link from "next/link";
import {
  Mic,
  Stethoscope,
  FileScan,
  ShieldCheck,
  ArrowRight,
  HeartPulse,
  Activity,
  Building2,
  CheckCircle2,
  FileText,
  Sparkles,
  Zap,
  Globe2,
  Clock3,
  ShieldAlert,
  ChevronRight,
  TrendingUp,
  Layers,
  Award
} from "lucide-react";
import { HospitalMetricsChart } from "@/components/analytics/HospitalMetricsChart";
import { ClinicalArchitectureDiagram } from "@/components/illustrations/ClinicalArchitectureDiagram";
import { LiveTriageSimulator } from "@/components/interactive/LiveTriageSimulator";
import { HeroMedicalRecordDropzone } from "@/components/documents/HeroMedicalRecordDropzone";
import { ClinicalMultimodalVenn } from "@/components/illustrations/ClinicalMultimodalVenn";
import { HospitalEfficiencyFlow } from "@/components/illustrations/HospitalEfficiencyFlow";
import { EmergencyTriageMatrix } from "@/components/illustrations/EmergencyTriageMatrix";
import { SocratesFrameworkExplorer } from "@/components/illustrations/SocratesFrameworkExplorer";
import { HospitalVisualGallery } from "@/components/illustrations/HospitalVisualGallery";
import { Nav } from "@/components/brand/Nav";
import { Footer } from "@/components/brand/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#374151] flex flex-col justify-between selection:bg-[#FDEBD0] selection:text-[#1D2A8F]">
      {/* Top Navigation Bar */}
      <Nav />

      {/* Main Content */}
      <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12 flex-1 space-y-16 sm:space-y-20">
        {/* HERO SECTION */}
        <section className="space-y-8 pt-2">
          <div className="flex flex-col items-center text-center space-y-5 max-w-4xl mx-auto">
            {/* Eyebrow Badge with Marigold Pulse */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1D2A8F]/10 border border-[#1D2A8F]/20 text-[#1D2A8F] text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#FB923C] animate-pulse" />
              <span>Next-Gen Point-of-Entry Clinical Triage &amp; Intake Platform</span>
            </div>

            {/* High-Impact Headline */}
            <h1 className="font-heading font-extrabold text-3xl sm:text-5xl md:text-6xl text-[#374151] tracking-tight leading-[1.12]">
              Spoken Words In Any Dialect. <br className="hidden sm:inline" />
              <span className="text-[#1D2A8F]">
                Verified Clinical Notes In Seconds.
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-sm sm:text-base md:text-lg text-[#374151]/80 max-w-2xl leading-relaxed">
              MediKiosk captures vernacular spoken complaints, extracts physical paper prescriptions via vision OCR, and pre-populates structured SOCRATES summaries — streamlining high-volume hospital OPD queues.
            </p>

            {/* Quick Stats Banner */}
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 pt-2 text-xs font-semibold text-[#374151]">
              <div className="flex items-center gap-2">
                <Clock3 className="w-4 h-4 text-[#FB923C]" />
                <span><strong>2.8 Mins</strong> Avg. Intake Time</span>
              </div>
              <div className="hidden sm:block text-[#FDEBD0]">•</div>
              <div className="flex items-center gap-2">
                <Globe2 className="w-4 h-4 text-[#1D2A8F]" />
                <span><strong>8 Indic</strong> Spoken Languages</span>
              </div>
              <div className="hidden sm:block text-[#FDEBD0]">•</div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span><strong>ABDM &amp; FHIR R4</strong> Certified</span>
              </div>
            </div>
          </div>

          {/* Operational Portals: Patient Voice Station + Prescription Dropzone */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4 max-w-5xl mx-auto items-stretch">
            {/* Left: Patient Voice Intake Kiosk Card */}
            <div className="p-6 sm:p-7 bg-white border border-[#FDEBD0] rounded-[16px] shadow-sm flex flex-col justify-between space-y-6 text-left">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#FDEBD0]/80">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-[8px] bg-[#1D2A8F]/10 text-[#1D2A8F] flex items-center justify-center font-bold">
                      <Mic className="w-4 h-4 text-[#FB923C]" />
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-sm text-[#374151]">
                        Patient Voice Intake Station
                      </h3>
                      <span className="text-[11px] text-[#374151]/70">
                        Touch &amp; Vernacular Voice Kiosk
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Live Operational
                  </span>
                </div>

                <p className="text-xs text-[#374151]/80 leading-relaxed">
                  Patients describe their illness naturally in Hindi, Telugu, Tamil, Bengali, Marathi, or English. Dynamically explores the SOCRATES pain framework and detects emergency red flags in real time.
                </p>

                {/* Key clinical features */}
                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  <div className="p-3 rounded-[10px] bg-[#FDFBF7] border border-[#FDEBD0] text-left">
                    <span className="text-[10px] font-mono text-[#374151]/70 uppercase font-semibold block">Clinical Protocol</span>
                    <span className="text-xs font-bold text-[#1D2A8F] mt-0.5 block">8-Factor SOCRATES HPI</span>
                  </div>
                  <div className="p-3 rounded-[10px] bg-[#FDFBF7] border border-[#FDEBD0] text-left">
                    <span className="text-[10px] font-mono text-[#374151]/70 uppercase font-semibold block">Safety Protocol</span>
                    <span className="text-xs font-bold text-[#C2410C] mt-0.5 block">Emergency Red Flag Alerts</span>
                  </div>
                </div>
              </div>

              {/* Patient-facing Primary Action Button */}
              <Link
                href="/kiosk"
                className="w-full py-3.5 rounded-full bg-[#1D2A8F] hover:bg-[#15206B] text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                <Mic className="w-4 h-4 text-[#FB923C]" />
                <span>Start Patient Consultation Intake</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#FDEBD0]" />
              </Link>
            </div>

            {/* Right: Document & Prescription Dropzone */}
            <HeroMedicalRecordDropzone />
          </div>
        </section>

        {/* SECTION 1: REAL-WORLD CLINICAL DEPLOYMENT GALLERY */}
        <section>
          <HospitalVisualGallery />
        </section>

        {/* SECTION 2: MULTIMODAL CONVERGENCE VENN DIAGRAM */}
        <section>
          <ClinicalMultimodalVenn />
        </section>

        {/* SECTION 3: HOSPITAL OPD EFFICIENCY & JOURNEY COMPARISON */}
        <section>
          <HospitalEfficiencyFlow />
        </section>

        {/* SECTION 4: 8-FACTOR SOCRATES DIAGNOSTIC FRAMEWORK */}
        <section>
          <SocratesFrameworkExplorer />
        </section>

        {/* SECTION 5: MANCHESTER & ESI EMERGENCY TRIAGE MATRIX */}
        <section>
          <EmergencyTriageMatrix />
        </section>

        {/* SECTION 6: CLINICAL WORKFLOW SECTION */}
        <section className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-2 pb-3 border-b border-[#FDEBD0]">
            <div>
              <span className="text-[11px] font-mono font-bold text-[#FB923C] uppercase tracking-wider block">
                Clinical Workflow Architecture
              </span>
              <h2 className="font-heading font-bold text-xl sm:text-2xl text-[#374151]">
                The 4-Stage Hospital OPD Intake Journey
              </h2>
            </div>
            <span className="text-xs text-[#374151]/70 font-medium">
              From patient speech to verified physician consultation note
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Stage 1 */}
            <div className="p-5 rounded-[16px] bg-white border border-[#FDEBD0] shadow-sm flex flex-col justify-between space-y-3 text-left">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#FDFBF7] border border-[#FDEBD0] text-[#374151]/70">
                    STAGE 01
                  </span>
                  <div className="w-7 h-7 rounded-full bg-[#FB923C]/10 text-[#FB923C] flex items-center justify-center">
                    <Mic className="w-3.5 h-3.5" />
                  </div>
                </div>
                <h3 className="font-heading font-bold text-sm text-[#374151]">
                  Vernacular Patient Triage
                </h3>
                <p className="text-xs text-[#374151]/80 leading-relaxed">
                  Patient speaks in their mother tongue at the kiosk. AI structures pain location, duration, and character without medical jargon.
                </p>
              </div>
              <div className="pt-2.5 border-t border-[#FDEBD0]/80 text-[11px] font-mono font-bold text-[#1D2A8F]">
                ✓ Hindi, Telugu, Tamil, EN
              </div>
            </div>

            {/* Stage 2 */}
            <div className="p-5 rounded-[16px] bg-white border border-[#FDEBD0] shadow-sm flex flex-col justify-between space-y-3 text-left">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#FDFBF7] border border-[#FDEBD0] text-[#374151]/70">
                    STAGE 02
                  </span>
                  <div className="w-7 h-7 rounded-full bg-[#1D2A8F]/10 text-[#1D2A8F] flex items-center justify-center">
                    <FileScan className="w-3.5 h-3.5" />
                  </div>
                </div>
                <h3 className="font-heading font-bold text-sm text-[#374151]">
                  Prescription Vision OCR
                </h3>
                <p className="text-xs text-[#374151]/80 leading-relaxed">
                  Paper prescriptions and lab slips are digitized instantly. Drug names, dosages, and abnormal lab flags are parsed.
                </p>
              </div>
              <div className="pt-2.5 border-t border-[#FDEBD0]/80 text-[11px] font-mono font-bold text-[#1D2A8F]">
                ✓ Active Drug Reconciliation
              </div>
            </div>

            {/* Stage 3 */}
            <div className="p-5 rounded-[16px] bg-white border border-[#FDEBD0] shadow-sm flex flex-col justify-between space-y-3 text-left">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#FDFBF7] border border-[#FDEBD0] text-[#374151]/70">
                    STAGE 03
                  </span>
                  <div className="w-7 h-7 rounded-full bg-[#C2410C]/10 text-[#C2410C] flex items-center justify-center">
                    <Stethoscope className="w-3.5 h-3.5" />
                  </div>
                </div>
                <h3 className="font-heading font-bold text-sm text-[#374151]">
                  Doctor OPD Cockpit
                </h3>
                <p className="text-xs text-[#374151]/80 leading-relaxed">
                  Attending physician receives a pre-populated clinical summary in seconds, eliminating manual typing during consultation.
                </p>
              </div>
              <div className="pt-2.5 border-t border-[#FDEBD0]/80 text-[11px] font-mono font-bold text-[#1D2A8F]">
                ✓ 3-Second EMR Briefing
              </div>
            </div>

            {/* Stage 4 */}
            <div className="p-5 rounded-[16px] bg-white border border-[#FDEBD0] shadow-sm flex flex-col justify-between space-y-3 text-left">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#FDFBF7] border border-[#FDEBD0] text-[#374151]/70">
                    STAGE 04
                  </span>
                  <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                </div>
                <h3 className="font-heading font-bold text-sm text-[#374151]">
                  ABHA &amp; FHIR R4 Record
                </h3>
                <p className="text-xs text-[#374151]/80 leading-relaxed">
                  Encounter is structured into standard HL7 FHIR R4 bundles and linked to patient&apos;s ABHA record with explicit DPDP consent.
                </p>
              </div>
              <div className="pt-2.5 border-t border-[#FDEBD0]/80 text-[11px] font-mono font-bold text-[#1D2A8F]">
                ✓ Interoperable Health Grid
              </div>
            </div>
          </div>
        </section>

        {/* 4 CORE MODULES WORKSPACES NAVIGATION */}
        <section className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#FDEBD0]">
            <div>
              <span className="text-[11px] font-mono font-bold text-[#FB923C] uppercase tracking-wider block">
                Platform Workspaces
              </span>
              <h2 className="font-heading font-bold text-lg sm:text-xl text-[#374151]">
                Hospital Operational Modules
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Patient Voice Kiosk */}
            <Link
              href="/kiosk"
              className="p-5 bg-white rounded-[16px] border border-[#FDEBD0] hover:border-[#1D2A8F] transition-all flex flex-col justify-between group shadow-sm cursor-pointer text-left"
            >
              <div className="space-y-3">
                <div className="w-9 h-9 rounded-[8px] bg-[#1D2A8F]/10 text-[#1D2A8F] flex items-center justify-center">
                  <Mic className="w-4 h-4 text-[#FB923C]" />
                </div>
                <h3 className="font-heading font-bold text-sm text-[#374151] group-hover:text-[#1D2A8F] transition-colors">
                  Patient Intake Kiosk
                </h3>
                <p className="text-xs text-[#374151]/80 leading-relaxed">
                  Push-to-talk voice triage station with pain scoring, red flag alerts, and vernacular speech recognition.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[#FDEBD0]/80 flex items-center justify-between text-xs font-bold text-[#1D2A8F]">
                <span>Open Kiosk</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#FB923C] group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* 2. Doctor Workstation */}
            <Link
              href="/doctor"
              className="p-5 bg-white rounded-[16px] border border-[#FDEBD0] hover:border-[#1D2A8F] transition-all flex flex-col justify-between group shadow-sm cursor-pointer text-left"
            >
              <div className="space-y-3">
                <div className="w-9 h-9 rounded-[8px] bg-[#1D2A8F]/10 text-[#1D2A8F] flex items-center justify-center">
                  <Stethoscope className="w-4 h-4 text-[#1D2A8F]" />
                </div>
                <h3 className="font-heading font-bold text-sm text-[#374151] group-hover:text-[#1D2A8F] transition-colors">
                  Doctor Cockpit
                </h3>
                <p className="text-xs text-[#374151]/80 leading-relaxed">
                  Real-time triage queue, pre-consultation HPI, prescription studio, and diagnostic investigation orders.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[#FDEBD0]/80 flex items-center justify-between text-xs font-bold text-[#1D2A8F]">
                <span>Open Cockpit</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#FB923C] group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* 3. Document Intelligence & OCR */}
            <Link
              href="/documents"
              className="p-5 bg-white rounded-[16px] border border-[#FDEBD0] hover:border-[#1D2A8F] transition-all flex flex-col justify-between group shadow-sm cursor-pointer text-left"
            >
              <div className="space-y-3">
                <div className="w-9 h-9 rounded-[8px] bg-[#1D2A8F]/10 text-[#1D2A8F] flex items-center justify-center">
                  <FileScan className="w-4 h-4 text-[#C2410C]" />
                </div>
                <h3 className="font-heading font-bold text-sm text-[#374151] group-hover:text-[#1D2A8F] transition-colors">
                  Document Studio
                </h3>
                <p className="text-xs text-[#374151]/80 leading-relaxed">
                  Prescription handwriting OCR, lab result parsing, drug indications, and longitudinal health timeline.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[#FDEBD0]/80 flex items-center justify-between text-xs font-bold text-[#1D2A8F]">
                <span>Scan Records</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#FB923C] group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* 4. ABHA & ABDM Consent Gateway */}
            <Link
              href="/abha"
              className="p-5 bg-white rounded-[16px] border border-[#FDEBD0] hover:border-[#1D2A8F] transition-all flex flex-col justify-between group shadow-sm cursor-pointer text-left"
            >
              <div className="space-y-3">
                <div className="w-9 h-9 rounded-[8px] bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h3 className="font-heading font-bold text-sm text-[#374151] group-hover:text-[#1D2A8F] transition-colors">
                  ABHA Consent Desk
                </h3>
                <p className="text-xs text-[#374151]/80 leading-relaxed">
                  ABDM OTP verification, QR Scan &amp; Share counter, DPDP Act consent logging, and record linking.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[#FDEBD0]/80 flex items-center justify-between text-xs font-bold text-[#1D2A8F]">
                <span>Manage Consent</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#FB923C] group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>
        </section>

        {/* SECTION 7: LIVE TRIAGE SIMULATOR */}
        <section>
          <LiveTriageSimulator />
        </section>

        {/* SECTION 8: CLINICAL ARCHITECTURE & ANALYTICS */}
        <section className="space-y-8">
          <ClinicalArchitectureDiagram />
          <HospitalMetricsChart />
        </section>

        {/* SECTION 9: CLINICAL SAFETY & COMPLIANCE STANDARDS */}
        <section className="bg-white border border-[#FDEBD0] rounded-[16px] p-6 sm:p-8 shadow-sm text-left">
          <div className="flex items-center justify-between pb-3 border-b border-[#FDEBD0]/80 mb-5">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#1D2A8F]" />
              <h3 className="font-heading font-bold text-sm text-[#374151]">
                Clinical Interoperability &amp; Regulatory Frameworks
              </h3>
            </div>
            <span className="text-[10px] font-bold text-emerald-700 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200">
              Verified Compliance
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-center">
            <div className="p-3.5 rounded-[10px] bg-[#FDFBF7] border border-[#FDEBD0]">
              <span className="text-[9px] font-mono font-bold text-[#374151]/70 uppercase block mb-0.5">Clinical Protocol</span>
              <h4 className="text-xs font-bold text-[#1D2A8F]">SOCRATES</h4>
              <p className="text-[10px] text-[#374151]/70 mt-0.5">8-Factor History</p>
            </div>

            <div className="p-3.5 rounded-[10px] bg-[#FDFBF7] border border-[#FDEBD0]">
              <span className="text-[9px] font-mono font-bold text-[#374151]/70 uppercase block mb-0.5">Data Standard</span>
              <h4 className="text-xs font-bold text-[#1D2A8F]">HL7 FHIR R4</h4>
              <p className="text-[10px] text-[#374151]/70 mt-0.5">Diagnostic Bundles</p>
            </div>

            <div className="p-3.5 rounded-[10px] bg-[#FDFBF7] border border-[#FDEBD0]">
              <span className="text-[9px] font-mono font-bold text-[#374151]/70 uppercase block mb-0.5">Health Grid</span>
              <h4 className="text-xs font-bold text-[#1D2A8F]">NHA ABDM</h4>
              <p className="text-[10px] text-[#374151]/70 mt-0.5">ABHA M1/M2/M3</p>
            </div>

            <div className="p-3.5 rounded-[10px] bg-[#FDFBF7] border border-[#FDEBD0]">
              <span className="text-[9px] font-mono font-bold text-[#374151]/70 uppercase block mb-0.5">Privacy Law</span>
              <h4 className="text-xs font-bold text-[#1D2A8F]">DPDP Act 2023</h4>
              <p className="text-[10px] text-[#374151]/70 mt-0.5">Consent Governance</p>
            </div>

            <div className="p-3.5 rounded-[10px] bg-[#FDFBF7] border border-[#FDEBD0]">
              <span className="text-[9px] font-mono font-bold text-[#374151]/70 uppercase block mb-0.5">Speech Engine</span>
              <h4 className="text-xs font-bold text-[#1D2A8F]">Bhashini AI</h4>
              <p className="text-[10px] text-[#374151]/70 mt-0.5">Indic Dialect ASR</p>
            </div>

            <div className="p-3.5 rounded-[10px] bg-[#FDFBF7] border border-[#FDEBD0]">
              <span className="text-[9px] font-mono font-bold text-[#374151]/70 uppercase block mb-0.5">Terminology</span>
              <h4 className="text-xs font-bold text-[#1D2A8F]">ICD-10 / SNOMED</h4>
              <p className="text-[10px] text-[#374151]/70 mt-0.5">Standard Coding</p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

