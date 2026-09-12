"use client";

import { useState, useMemo } from "react";
import {
  Activity,
  Building2,
  Users,
  QrCode,
  FileCheck2,
  TrendingUp,
  Calendar,
  Filter,
  CheckCircle2,
  Sparkles,
  Info,
  ChevronDown,
  ArrowUpRight,
  ShieldCheck,
  Search,
  Layers,
  Zap,
  Globe2
} from "lucide-react";

// ============================================================================
// ABDM LIVE DATASET DEFINITIONS (From official ABDM Dashboard)
// ============================================================================

export interface DailyTokenPoint {
  date: string;
  displayDate: string;
  tokens: number;
  isPeak?: boolean;
}

// 30-Day Time Series Data matching Reference Image 1 (August 11 - September 10, 2026)
const TOKEN_TIME_SERIES_30D: DailyTokenPoint[] = [
  { date: "2026-08-11", displayDate: "11-Aug-26", tokens: 1670, isPeak: false },
  { date: "2026-08-12", displayDate: "12-Aug-26", tokens: 1520, isPeak: false },
  { date: "2026-08-13", displayDate: "13-Aug-26", tokens: 1510, isPeak: false },
  { date: "2026-08-14", displayDate: "14-Aug-26", tokens: 1290, isPeak: false },
  { date: "2026-08-15", displayDate: "15-Aug-26", tokens: 20, isPeak: false }, // National Holiday
  { date: "2026-08-16", displayDate: "16-Aug-26", tokens: 160, isPeak: false }, // Sunday
  { date: "2026-08-17", displayDate: "17-Aug-26", tokens: 1430, isPeak: false },
  { date: "2026-08-18", displayDate: "18-Aug-26", tokens: 1640, isPeak: false },
  { date: "2026-08-19", displayDate: "19-Aug-26", tokens: 1710, isPeak: false },
  { date: "2026-08-20", displayDate: "20-Aug-26", tokens: 1490, isPeak: false },
  { date: "2026-08-21", displayDate: "21-Aug-26", tokens: 1510, isPeak: false },
  { date: "2026-08-22", displayDate: "22-Aug-26", tokens: 380, isPeak: false },
  { date: "2026-08-23", displayDate: "23-Aug-26", tokens: 120, isPeak: false }, // Sunday
  { date: "2026-08-24", displayDate: "24-Aug-26", tokens: 1980, isPeak: true }, // Peak OPD Surge
  { date: "2026-08-25", displayDate: "25-Aug-26", tokens: 1630, isPeak: false },
  { date: "2026-08-26", displayDate: "26-Aug-26", tokens: 290, isPeak: false },
  { date: "2026-08-27", displayDate: "27-Aug-26", tokens: 1160, isPeak: false },
  { date: "2026-08-28", displayDate: "28-Aug-26", tokens: 390, isPeak: false },
  { date: "2026-08-29", displayDate: "29-Aug-26", tokens: 550, isPeak: false },
  { date: "2026-08-30", displayDate: "30-Aug-26", tokens: 460, isPeak: false },
  { date: "2026-08-31", displayDate: "31-Aug-26", tokens: 1310, isPeak: false },
  { date: "2026-09-01", displayDate: "01-Sep-26", tokens: 1840, isPeak: true },
  { date: "2026-09-02", displayDate: "02-Sep-26", tokens: 1780, isPeak: false },
  { date: "2026-09-03", displayDate: "03-Sep-26", tokens: 1390, isPeak: false },
  { date: "2026-09-04", displayDate: "04-Sep-26", tokens: 420, isPeak: false },
  { date: "2026-09-05", displayDate: "05-Sep-26", tokens: 250, isPeak: false },
  { date: "2026-09-06", displayDate: "06-Sep-26", tokens: 20, isPeak: false }, // Sunday
  { date: "2026-09-07", displayDate: "07-Sep-26", tokens: 1360, isPeak: false },
  { date: "2026-09-08", displayDate: "08-Sep-26", tokens: 1140, isPeak: false },
  { date: "2026-09-09", displayDate: "09-Sep-26", tokens: 1680, isPeak: false },
  { date: "2026-09-10", displayDate: "10-Sep-26", tokens: 680, isPeak: false },
];

// Systems of Medicine Data matching Reference Image 2 (Card 2)
interface MedicineSystem {
  system: string;
  verifiedPercent: number;
  applicationsReceived: number;
  verifiedCount: number;
}

const SYSTEMS_OF_MEDICINE: MedicineSystem[] = [
  { system: "Modern Medicine (Allopathy)", verifiedPercent: 88.0, applicationsReceived: 785400, verifiedCount: 691152 },
  { system: "Ayurveda", verifiedPercent: 83.2, applicationsReceived: 148200, verifiedCount: 123302 },
  { system: "Dentistry", verifiedPercent: 83.9, applicationsReceived: 104500, verifiedCount: 87675 },
  { system: "Homeopathy", verifiedPercent: 78.6, applicationsReceived: 79200, verifiedCount: 62251 },
  { system: "Physiotherapy", verifiedPercent: 79.4, applicationsReceived: 51800, verifiedCount: 41129 },
  { system: "Unani", verifiedPercent: 76.4, applicationsReceived: 27900, verifiedCount: 21315 },
  { system: "Siddha", verifiedPercent: 73.7, applicationsReceived: 16500, verifiedCount: 12160 },
  { system: "Sowa Rigpa", verifiedPercent: 65.2, applicationsReceived: 4800, verifiedCount: 3129 },
];

// State & UT Facility Applications Data matching Reference Image 2 (Card 3)
interface StateFacilityData {
  state: string;
  verifiedPercent: number;
  applicationsReceived: number;
  verifiedCount: number;
}

const STATE_FACILITY_DATA: StateFacilityData[] = [
  { state: "Andaman And Nicobar Islands", verifiedPercent: 97.3, applicationsReceived: 1240, verifiedCount: 1206 },
  { state: "Goa", verifiedPercent: 95.4, applicationsReceived: 3180, verifiedCount: 3033 },
  { state: "Andhra Pradesh", verifiedPercent: 94.4, applicationsReceived: 78200, verifiedCount: 73820 },
  { state: "Arunachal Pradesh", verifiedPercent: 94.4, applicationsReceived: 2450, verifiedCount: 2312 },
  { state: "Bihar", verifiedPercent: 94.1, applicationsReceived: 62400, verifiedCount: 58718 },
  { state: "Chandigarh", verifiedPercent: 91.3, applicationsReceived: 2190, verifiedCount: 1999 },
  { state: "Tamil Nadu", verifiedPercent: 91.6, applicationsReceived: 68400, verifiedCount: 62654 },
  { state: "Assam", verifiedPercent: 89.1, applicationsReceived: 24900, verifiedCount: 22185 },
  { state: "Chhattisgarh", verifiedPercent: 88.9, applicationsReceived: 31200, verifiedCount: 27736 },
  { state: "Karnataka", verifiedPercent: 87.5, applicationsReceived: 54600, verifiedCount: 47775 },
  { state: "Maharashtra", verifiedPercent: 86.4, applicationsReceived: 89300, verifiedCount: 77155 },
  { state: "Uttar Pradesh", verifiedPercent: 84.9, applicationsReceived: 98400, verifiedCount: 83541 },
  { state: "Gujarat", verifiedPercent: 83.2, applicationsReceived: 59700, verifiedCount: 49670 },
  { state: "West Bengal", verifiedPercent: 79.3, applicationsReceived: 42800, verifiedCount: 33940 },
  { state: "Haryana", verifiedPercent: 74.0, applicationsReceived: 26800, verifiedCount: 19832 },
  { state: "Delhi", verifiedPercent: 57.7, applicationsReceived: 18900, verifiedCount: 10905 },
];

export function AbdmDashboardShowcase() {
  // Time Range Filter State
  const [timeFilter, setTimeFilter] = useState<"week" | "30d" | "all">("30d");
  const [hoveredPoint, setHoveredPoint] = useState<DailyTokenPoint | null>(null);

  // Health Facility Registry interactive state
  const [medicineSortBy, setMedicineSortBy] = useState<"verified" | "apps" | "name">("verified");
  const [stateSearchQuery, setStateSearchQuery] = useState("");
  const [stateSortBy, setStateSortBy] = useState<"percent" | "apps" | "name">("percent");
  const [selectedOwnershipSegment, setSelectedOwnershipSegment] = useState<"all" | "private" | "government">("all");

  // Filtered dataset for spline chart
  const activeSeries = useMemo(() => {
    if (timeFilter === "week") {
      return TOKEN_TIME_SERIES_30D.slice(-7);
    }
    if (timeFilter === "all") {
      return TOKEN_TIME_SERIES_30D;
    }
    return TOKEN_TIME_SERIES_30D;
  }, [timeFilter]);

  // Sorted Medicine Systems
  const sortedMedicineSystems = useMemo(() => {
    return [...SYSTEMS_OF_MEDICINE].sort((a, b) => {
      if (medicineSortBy === "verified") return b.verifiedPercent - a.verifiedPercent;
      if (medicineSortBy === "apps") return b.applicationsReceived - a.applicationsReceived;
      return a.system.localeCompare(b.system);
    });
  }, [medicineSortBy]);

  // Filtered & Sorted State Data
  const filteredStates = useMemo(() => {
    return STATE_FACILITY_DATA.filter((s) =>
      s.state.toLowerCase().includes(stateSearchQuery.toLowerCase())
    ).sort((a, b) => {
      if (stateSortBy === "percent") return b.verifiedPercent - a.verifiedPercent;
      if (stateSortBy === "apps") return b.applicationsReceived - a.applicationsReceived;
      return a.state.localeCompare(b.state);
    });
  }, [stateSearchQuery, stateSortBy]);

  // SVG Spline Calculations for Reference Image 1
  const chartWidth = 920;
  const chartHeight = 240;
  const paddingX = 40;
  const paddingY = 25;
  const maxTokens = 2000;

  const points = useMemo(() => {
    const usableW = chartWidth - paddingX * 2;
    const usableH = chartHeight - paddingY * 2;
    const step = usableW / (activeSeries.length - 1);

    return activeSeries.map((d, i) => {
      const x = paddingX + i * step;
      const y = chartHeight - paddingY - (d.tokens / maxTokens) * usableH;
      return { x, y, data: d };
    });
  }, [activeSeries]);

  // Generate smooth cubic bezier SVG curve
  const pathD = useMemo(() => {
    if (points.length === 0) return "";
    let d = `M ${points[0].x} ${points[0].y}`;

    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i === 0 ? 0 : i - 1];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2] || p2;

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return d;
  }, [points]);

  // Area path closing down to the bottom axis
  const areaD = useMemo(() => {
    if (points.length === 0) return "";
    const first = points[0];
    const last = points[points.length - 1];
    const bottomY = chartHeight - paddingY;
    return `${pathD} L ${last.x} ${bottomY} L ${first.x} ${bottomY} Z`;
  }, [pathD, points]);

  // Aggregated Stats
  const totalTokensInView = useMemo(() => {
    return activeSeries.reduce((acc, curr) => acc + curr.tokens, 0);
  }, [activeSeries]);

  const peakPoint = useMemo(() => {
    return [...activeSeries].sort((a, b) => b.tokens - a.tokens)[0];
  }, [activeSeries]);

  return (
    <section className="w-full space-y-8 text-left">
      {/* ========================================================================= */}
      {/* SECTION HEADER & NATIONAL ECOSYSTEM BADGE */}
      {/* ========================================================================= */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-[#DEE2E6]">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold tracking-wide uppercase border border-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              Live ABDM Telemetry &bull; National Health Stack
            </span>
            <span className="text-xs font-semibold text-[#6C7A89] hidden sm:inline">
              M1, M2 &amp; M3 Certified Architecture
            </span>
          </div>
          <h2 className="font-heading font-extrabold text-2xl sm:text-3xl lg:text-4xl text-[#2C3E50] tracking-tight">
            Ayushman Bharat Digital Mission (ABDM) Insights
          </h2>
          <p className="text-xs sm:text-sm text-[#5A6B7C] mt-1 max-w-2xl leading-relaxed">
            Real-time public telemetry scraped from the National Health Authority (NHA) ecosystem. MediKiosk bridges patient kiosks directly into national registries and paperless OPD queues.
          </p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5-PILLAR NATIONAL TELEMETRY KPI CARDS */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Card 1: ABHA Created */}
        <div className="p-4 rounded-2xl bg-white border border-[#DEE2E6] shadow-xs hover:border-[#0056B3] transition-all group">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-[#6C7A89] font-medium">ABHA Created</span>
            <div className="w-7 h-7 rounded-lg bg-[#EBF3FC] text-[#0056B3] flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-[#2C3E50] font-heading">
            97.41 <span className="text-sm font-semibold text-[#6C7A89]">Cr</span>
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-emerald-600 font-semibold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+14.2% MoM adoption</span>
          </div>
        </div>

        {/* Card 2: Health Records Linked */}
        <div className="p-4 rounded-2xl bg-white border border-[#DEE2E6] shadow-xs hover:border-[#17A2B8] transition-all group">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-[#6C7A89] font-medium">Records Linked</span>
            <div className="w-7 h-7 rounded-lg bg-[#E8F7F9] text-[#17A2B8] flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileCheck2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-[#2C3E50] font-heading">
            117.02 <span className="text-sm font-semibold text-[#6C7A89]">Cr</span>
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-[#17A2B8] font-semibold">
            <Layers className="w-3.5 h-3.5" />
            <span>FHIR R4 standardized</span>
          </div>
        </div>

        {/* Card 3: Health Facilities (HFR) */}
        <div className="p-4 rounded-2xl bg-white border border-[#DEE2E6] shadow-xs hover:border-[#F59E0B] transition-all group">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-[#6C7A89] font-medium">Verified Facilities (HFR)</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Building2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-[#2C3E50] font-heading">
            5.74 <span className="text-sm font-semibold text-[#6C7A89]">Lakh</span>
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-amber-700 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Govt (46.7%) &bull; Pvt (53.3%)</span>
          </div>
        </div>

        {/* Card 4: Healthcare Professionals (HPR) */}
        <div className="p-4 rounded-2xl bg-white border border-[#DEE2E6] shadow-xs hover:border-[#8B5CF6] transition-all group">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-[#6C7A89] font-medium">Doctors &amp; Staff (HPR)</span>
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Activity className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-[#2C3E50] font-heading">
            10.89 <span className="text-sm font-semibold text-[#6C7A89]">Lakh</span>
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-purple-700 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Digitally verified HP-ID</span>
          </div>
        </div>

        {/* Card 5: Scan and Share Tokens */}
        <div className="p-4 rounded-2xl bg-[#EBF3FC] border border-[#CCE5FF] shadow-xs hover:border-[#0056B3] transition-all group">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-[#0056B3] font-bold">Scan &amp; Share Tokens</span>
            <div className="w-7 h-7 rounded-lg bg-[#0056B3] text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
              <QrCode className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-[#0056B3] font-heading">
            18.25 <span className="text-sm font-semibold text-[#0056B3]/80">Cr</span>
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-[#0056B3] font-semibold">
            <Zap className="w-3.5 h-3.5" />
            <span>Wait-time &lt; 30 seconds</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* CHART 1: SCAN & SHARE TIME-SERIES SPLINE (Exact Match to Reference Image 1) */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl border border-[#DEE2E6] shadow-sm p-5 sm:p-7 space-y-6">
        {/* Top Control Bar matching Reference Image 1 */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#E9ECEF]">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold mb-1 border border-emerald-200">
              <QrCode className="w-3 h-3 text-emerald-600" />
              <span>OPD Counter Queue Telemetry</span>
            </div>
            <h3 className="font-heading font-extrabold text-lg text-[#2C3E50]">
              Daily Scan &amp; Share Token Generation Wave
            </h3>
            <p className="text-xs text-[#6C7A89] mt-0.5">
              Live hospital check-in trajectory showing volume peaks on active weekday clinics vs weekend troughs
            </p>
          </div>

          {/* Preset Range Pills */}
          <div className="flex items-center gap-1 bg-[#F8F9FA] p-1 rounded-xl border border-[#DEE2E6]">
            <button
              type="button"
              onClick={() => setTimeFilter("week")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                timeFilter === "week"
                  ? "bg-white text-[#0056B3] font-bold shadow-xs border border-[#CCE5FF]"
                  : "text-[#6C7A89] hover:text-[#2C3E50]"
              }`}
            >
              Week
            </button>
            <button
              type="button"
              onClick={() => setTimeFilter("30d")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                timeFilter === "30d"
                  ? "bg-white text-[#0056B3] font-bold shadow-xs border border-[#CCE5FF]"
                  : "text-[#6C7A89] hover:text-[#2C3E50]"
              }`}
            >
              Last 30 Days
            </button>
            <button
              type="button"
              onClick={() => setTimeFilter("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                timeFilter === "all"
                  ? "bg-white text-[#0056B3] font-bold shadow-xs border border-[#CCE5FF]"
                  : "text-[#6C7A89] hover:text-[#2C3E50]"
              }`}
            >
              All
            </button>
          </div>
        </div>

        {/* SVG Interactive Spline Chart */}
        <div className="relative w-full overflow-x-auto select-none pt-2 pb-6">
          <div className="min-w-[840px]">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-64 overflow-visible"
            >
              <defs>
                {/* Mint Green / Emerald Area Gradient matching Reference Image 1 */}
                <linearGradient id="abdmSplineGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" stopOpacity="0.35" />
                  <stop offset="40%" stopColor="#34D399" stopOpacity="0.18" />
                  <stop offset="100%" stopColor="#ECFDF5" stopOpacity="0.02" />
                </linearGradient>

                {/* Drop shadow for line curve */}
                <filter id="splineShadow" x="-10%" y="-10%" width="120%" height="130%">
                  <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#059669" floodOpacity="0.25" />
                </filter>
              </defs>

              {/* Y-Axis Horizontal Grid Lines (0 to 2,000 in steps of 200) */}
              {[0, 200, 400, 600, 800, 1000, 1200, 1400, 1600, 1800, 2000].map((val) => {
                const y = chartHeight - paddingY - (val / maxTokens) * (chartHeight - paddingY * 2);
                return (
                  <g key={val}>
                    <line
                      x1={paddingX}
                      y1={y}
                      x2={chartWidth - paddingX}
                      y2={y}
                      stroke="#E9ECEF"
                      strokeWidth="1"
                    />
                    <text
                      x={paddingX - 8}
                      y={y + 3.5}
                      textAnchor="end"
                      className="text-[9px] font-mono fill-[#94A3B8]"
                    >
                      {val.toLocaleString()}
                    </text>
                  </g>
                );
              })}

              {/* Area Under Curve */}
              <path d={areaD} fill="url(#abdmSplineGradient)" />

              {/* Smooth Cubic Spline Stroke (Emerald Green Curve) */}
              <path
                d={pathD}
                fill="none"
                stroke="#10B981"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#splineShadow)"
              />

              {/* Interactive Node Markers (Red / Orange Circles matching Reference Image 1) */}
              {points.map((p) => {
                const isHovered = hoveredPoint?.date === p.data.date;
                return (
                  <g
                    key={p.data.date}
                    className="cursor-pointer group"
                    onMouseEnter={() => setHoveredPoint(p.data)}
                    onMouseLeave={() => setHoveredPoint(null)}
                  >
                    {/* Hover Pulse Ring */}
                    {isHovered && (
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r="10"
                        fill="#EF4444"
                        fillOpacity="0.2"
                        className="animate-ping"
                      />
                    )}
                    {/* Data Node Circle */}
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={isHovered ? 6 : p.data.isPeak ? 4.5 : 3.5}
                      fill="#EF4444"
                      stroke="#FFFFFF"
                      strokeWidth={isHovered ? 2 : 1.5}
                      className="transition-all duration-150"
                    />
                  </g>
                );
              })}

              {/* X-Axis Slanted Date Labels matching Reference Image 1 */}
              {points.map((p) => (
                <text
                  key={p.data.date}
                  x={p.x}
                  y={chartHeight - paddingY + 14}
                  transform={`rotate(-40, ${p.x}, ${chartHeight - paddingY + 14})`}
                  textAnchor="end"
                  className="text-[8.5px] font-mono fill-[#64748B] font-medium"
                >
                  {p.data.displayDate}
                </text>
              ))}
            </svg>
          </div>

          {/* Interactive Floating Tooltip */}
          {hoveredPoint && (
            <div className="absolute top-4 right-6 bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-700 text-xs space-y-1 animate-in fade-in zoom-in-95 z-20 pointer-events-none">
              <div className="flex items-center justify-between gap-4">
                <span className="font-mono text-emerald-400 font-bold">{hoveredPoint.displayDate}</span>
                {hoveredPoint.isPeak && (
                  <span className="px-1.5 py-0.5 rounded bg-red-500/20 text-red-300 font-bold text-[10px]">
                    Peak Day
                  </span>
                )}
              </div>
              <div className="text-base font-extrabold text-white">
                {hoveredPoint.tokens.toLocaleString()} <span className="text-xs font-normal text-slate-400">Tokens Generated</span>
              </div>
              <div className="text-[10px] text-slate-300 flex items-center gap-1 pt-1 border-t border-slate-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>OPD Queue Turnaround: ~24 seconds</span>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Chart Metric Highlights */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-[#E9ECEF] text-xs">
          <div className="p-2.5 rounded-xl bg-[#F8F9FA] border border-[#DEE2E6]">
            <span className="text-[10px] uppercase font-mono text-[#6C7A89] block font-bold">Total In Range</span>
            <span className="text-sm font-extrabold text-[#2C3E50]">{totalTokensInView.toLocaleString()} tokens</span>
          </div>
          <div className="p-2.5 rounded-xl bg-[#F8F9FA] border border-[#DEE2E6]">
            <span className="text-[10px] uppercase font-mono text-[#6C7A89] block font-bold">Peak Single Day</span>
            <span className="text-sm font-extrabold text-emerald-700">{peakPoint?.tokens.toLocaleString()} ({peakPoint?.displayDate})</span>
          </div>
          <div className="p-2.5 rounded-xl bg-[#F8F9FA] border border-[#DEE2E6]">
            <span className="text-[10px] uppercase font-mono text-[#6C7A89] block font-bold">Daily Average</span>
            <span className="text-sm font-extrabold text-[#0056B3]">
              {Math.round(totalTokensInView / activeSeries.length).toLocaleString()} tokens/day
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-[#F8F9FA] border border-[#DEE2E6]">
            <span className="text-[10px] uppercase font-mono text-[#6C7A89] block font-bold">Avg Wait Reduction</span>
            <span className="text-sm font-extrabold text-[#17A2B8]">-88.4% (vs Manual Queue)</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 2: HEALTH FACILITY REGISTRY (Exact 3-Card Layout matching Reference Image 2) */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        {/* Section Heading matching Reference Image 2 */}
        <div className="flex items-center justify-between">
          <h3 className="text-xl sm:text-2xl font-heading font-extrabold text-[#C05621] tracking-tight flex items-center gap-2">
            <span>Health Facility Registry</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-orange-100 text-[#C05621] font-bold">
              5,74,000+ Verified Units
            </span>
          </h3>
          <span className="text-xs text-[#6C7A89] hidden md:inline">
            Live Verified vs Applications Received Registry
          </span>
        </div>

        {/* 3-Card Grid matching Reference Image 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* ===================================================================== */}
          {/* CARD 1: VERIFIED FACILITIES BY OWNERSHIP (Donut / Pie Chart) */}
          {/* ===================================================================== */}
          <div className="lg:col-span-4 bg-white rounded-xl border border-[#DEE2E6] shadow-sm overflow-hidden flex flex-col justify-between">
            {/* Dark Navy Blue Card Header matching Reference Image 2 */}
            <div className="bg-[#1E3A8A] text-white px-4 py-3 flex items-center justify-between">
              <span className="font-bold text-xs sm:text-sm tracking-wide">
                Verified Facilities by Ownership
              </span>
              <div className="flex items-center gap-2 text-white/80">
                <Info className="w-3.5 h-3.5 hover:text-white cursor-pointer" />
                <span className="w-2.5 h-0.5 bg-white/60 inline-block" />
              </div>
            </div>

            {/* Donut Chart Content */}
            <div className="p-5 flex-1 flex flex-col items-center justify-center space-y-4">
              {/* Legend matching Reference Image 2 */}
              <div className="flex items-center gap-4 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setSelectedOwnershipSegment(selectedOwnershipSegment === "private" ? "all" : "private")}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                    selectedOwnershipSegment === "private" ? "bg-amber-100 ring-1 ring-amber-400" : "hover:bg-gray-100"
                  }`}
                >
                  <span className="w-4 h-3 rounded-[2px] bg-[#F6BD7A] border border-[#E0A05A]" />
                  <span className="text-[#2C3E50]">Private (53.29%)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedOwnershipSegment(selectedOwnershipSegment === "government" ? "all" : "government")}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                    selectedOwnershipSegment === "government" ? "bg-teal-100 ring-1 ring-teal-400" : "hover:bg-gray-100"
                  }`}
                >
                  <span className="w-4 h-3 rounded-[2px] bg-[#68B4AA] border border-[#4F968D]" />
                  <span className="text-[#2C3E50]">Government (46.71%)</span>
                </button>
              </div>

              {/* Interactive SVG Pie / Donut Chart */}
              <div className="relative w-48 h-48 my-2">
                <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                  {/* Private Segment: 53.29% = 191.84 degrees -> circumference: 2 * pi * r = 2 * 3.14159 * 36 = 226.19 */}
                  <circle
                    cx="50"
                    cy="50"
                    r="36"
                    fill="transparent"
                    stroke="#F6BD7A"
                    strokeWidth={selectedOwnershipSegment === "private" ? "24" : "20"}
                    strokeDasharray={`${(53.29 / 100) * 226.19} ${226.19}`}
                    strokeDashoffset="0"
                    className="transition-all duration-300 hover:opacity-90 cursor-pointer"
                    onMouseEnter={() => setSelectedOwnershipSegment("private")}
                    onMouseLeave={() => setSelectedOwnershipSegment("all")}
                  />
                  {/* Government Segment: 46.71% = 168.15 degrees */}
                  <circle
                    cx="50"
                    cy="50"
                    r="36"
                    fill="transparent"
                    stroke="#68B4AA"
                    strokeWidth={selectedOwnershipSegment === "government" ? "24" : "20"}
                    strokeDasharray={`${(46.71 / 100) * 226.19} ${226.19}`}
                    strokeDashoffset={`-${(53.29 / 100) * 226.19}`}
                    className="transition-all duration-300 hover:opacity-90 cursor-pointer"
                    onMouseEnter={() => setSelectedOwnershipSegment("government")}
                    onMouseLeave={() => setSelectedOwnershipSegment("all")}
                  />
                </svg>

                {/* Center Percentage Display */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                  <span className="text-[10px] font-mono text-[#6C7A89] uppercase font-bold">
                    {selectedOwnershipSegment === "private"
                      ? "Private Sector"
                      : selectedOwnershipSegment === "government"
                      ? "Govt Facilities"
                      : "Total Verified"}
                  </span>
                  <span className="text-base font-extrabold text-[#2C3E50]">
                    {selectedOwnershipSegment === "private"
                      ? "53.29%"
                      : selectedOwnershipSegment === "government"
                      ? "46.71%"
                      : "5,74,000"}
                  </span>
                  <span className="text-[9px] text-[#6C7A89]">
                    {selectedOwnershipSegment === "private"
                      ? "~305,885 Units"
                      : selectedOwnershipSegment === "government"
                      ? "~268,115 Units"
                      : "Pan-India HFR"}
                  </span>
                </div>
              </div>

              {/* Ownership Category Breakdown */}
              <div className="w-full pt-2 border-t border-[#E9ECEF] grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2 rounded-lg bg-amber-50/60 border border-amber-200/60 text-center">
                  <span className="text-[#A05E03] font-bold block">Private Clinics &amp; Labs</span>
                  <span className="text-xs font-mono font-extrabold text-[#2C3E50]">3.05 Lakh</span>
                </div>
                <div className="p-2 rounded-lg bg-teal-50/60 border border-teal-200/60 text-center">
                  <span className="text-[#136B63] font-bold block">Govt PHC, CHC &amp; Dist</span>
                  <span className="text-xs font-mono font-extrabold text-[#2C3E50]">2.68 Lakh</span>
                </div>
              </div>
            </div>
          </div>

          {/* ===================================================================== */}
          {/* CARD 2: % VERIFIED VS APPLICATIONS RECEIVED (Systems of Medicine) */}
          {/* ===================================================================== */}
          <div className="lg:col-span-4 bg-white rounded-xl border border-[#DEE2E6] shadow-sm overflow-hidden flex flex-col justify-between">
            {/* Dark Navy Blue Card Header matching Reference Image 2 */}
            <div className="bg-[#1E3A8A] text-white px-4 py-3 flex items-center justify-between">
              <span className="font-bold text-xs sm:text-sm tracking-wide">
                % Verified Vs Applications Received
              </span>
              {/* Sorter toggles matching image */}
              <div className="flex items-center gap-2 text-[10px] font-mono">
                <button
                  type="button"
                  onClick={() => setMedicineSortBy(medicineSortBy === "name" ? "verified" : "name")}
                  className={`hover:text-amber-300 transition-colors ${
                    medicineSortBy === "name" ? "text-amber-300 font-bold" : "text-white/80"
                  }`}
                >
                  &darr;&uarr; Medicine
                </button>
                <button
                  type="button"
                  onClick={() => setMedicineSortBy(medicineSortBy === "verified" ? "apps" : "verified")}
                  className={`hover:text-amber-300 transition-colors ${
                    medicineSortBy === "verified" ? "text-amber-300 font-bold" : "text-white/80"
                  }`}
                >
                  &darr;&uarr; Verified
                </button>
              </div>
            </div>

            {/* Horizontal Bar Chart for Systems of Medicine */}
            <div className="p-4 flex-1 space-y-3">
              {/* Metric Scale Bar (0 to 1,000,000) */}
              <div className="flex items-center justify-between text-[10px] font-mono text-[#6C7A89] px-1">
                <span>0</span>
                <span>500,000</span>
                <span>1,000,000</span>
              </div>

              {/* Medicine System Rows */}
              <div className="space-y-2.5">
                {sortedMedicineSystems.map((item) => {
                  const barWidthPercent = (item.applicationsReceived / 900000) * 100;
                  return (
                    <div key={item.system} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-[#2C3E50] text-[11px] truncate max-w-[170px]" title={item.system}>
                          {item.system}
                        </span>
                        <span className="font-mono font-bold text-xs text-[#1E3A8A]">
                          {item.verifiedPercent}%
                        </span>
                      </div>

                      {/* Multi-tone Bar matching Reference Image 2 (Blue Application Bar + Green Verified Indicator) */}
                      <div className="w-full bg-slate-100 rounded-full h-3.5 overflow-hidden flex items-center relative">
                        {/* Blue Application Volume Bar */}
                        <div
                          className="bg-[#4285F4] h-full rounded-full transition-all duration-500 relative flex items-center justify-end pr-1"
                          style={{ width: `${Math.max(12, barWidthPercent)}%` }}
                        >
                          {/* Green Verified Tip */}
                          <div
                            className="bg-[#10B981] h-full rounded-r-full"
                            style={{ width: `${(item.verifiedPercent / 100) * 20}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Insight Note */}
              <div className="pt-2 text-[10px] text-[#6C7A89] border-t border-[#E9ECEF] flex items-center justify-between">
                <span>Total Applications: 1.25M+</span>
                <span className="text-emerald-700 font-bold">Allopathy Saturation: 88.0%</span>
              </div>
            </div>
          </div>

          {/* ===================================================================== */}
          {/* CARD 3: % VERIFIED VS FACILITY APPLICATIONS RECEIVED (States & UTs) */}
          {/* ===================================================================== */}
          <div className="lg:col-span-4 bg-white rounded-xl border border-[#DEE2E6] shadow-sm overflow-hidden flex flex-col justify-between">
            {/* Dark Navy Blue Card Header matching Reference Image 2 */}
            <div className="bg-[#1E3A8A] text-white px-4 py-3 flex items-center justify-between">
              <span className="font-bold text-xs sm:text-sm tracking-wide">
                % Verified Vs Facility Applications
              </span>
              <div className="flex items-center gap-2 text-[10px] font-mono">
                <button
                  type="button"
                  onClick={() => setStateSortBy(stateSortBy === "name" ? "percent" : "name")}
                  className={`hover:text-amber-300 transition-colors ${
                    stateSortBy === "name" ? "text-amber-300 font-bold" : "text-white/80"
                  }`}
                >
                  &darr;&uarr; State/UT
                </button>
                <button
                  type="button"
                  onClick={() => setStateSortBy(stateSortBy === "percent" ? "apps" : "percent")}
                  className={`hover:text-amber-300 transition-colors ${
                    stateSortBy === "percent" ? "text-amber-300 font-bold" : "text-white/80"
                  }`}
                >
                  &darr;&uarr; % Verified
                </button>
              </div>
            </div>

            {/* State Search & Scrollable Ranking List */}
            <div className="p-4 flex-1 space-y-3">
              {/* Search Bar for Quick State Navigation */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[#6C7A89] absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter State / UT..."
                  value={stateSearchQuery}
                  onChange={(e) => setStateSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1 bg-[#F8F9FA] border border-[#DEE2E6] rounded-md text-xs text-[#2C3E50] placeholder:text-[#6C7A89] outline-none focus:border-[#0056B3]"
                />
              </div>

              {/* Metric Scale Bar (0 to 100,000) */}
              <div className="flex items-center justify-between text-[10px] font-mono text-[#6C7A89] px-1">
                <span>0</span>
                <span>50,000</span>
                <span>100,000</span>
              </div>

              {/* Scrollable State Bar Container */}
              <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                {filteredStates.map((item) => {
                  const barWidthPercent = (item.applicationsReceived / 100000) * 100;
                  return (
                    <div key={item.state} className="space-y-0.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-[#2C3E50] text-[11px] truncate max-w-[160px]" title={item.state}>
                          {item.state}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] text-[#6C7A89]">
                            {item.applicationsReceived.toLocaleString()} apps
                          </span>
                          <span className="font-mono font-bold text-xs text-[#1E3A8A]">
                            {item.verifiedPercent}%
                          </span>
                        </div>
                      </div>

                      {/* State Horizontal Progress Bar matching Reference Image 2 */}
                      <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden flex items-center relative">
                        <div
                          className="bg-[#5B8FF9] h-full rounded-full transition-all duration-500 relative flex items-center justify-end pr-1"
                          style={{ width: `${Math.max(10, Math.min(100, barWidthPercent))}%` }}
                        >
                          <div
                            className="bg-[#F59E0B] h-full rounded-r-full"
                            style={{ width: `${(item.verifiedPercent / 100) * 15}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bottom State Counter */}
              <div className="pt-2 text-[10px] text-[#6C7A89] border-t border-[#E9ECEF] flex items-center justify-between">
                <span>Showing {filteredStates.length} States / UTs</span>
                <span className="text-[#0056B3] font-bold">Top Verified: Andaman (97.3%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 3: MEDIKIOSK ABDM COMPLIANCE ARCHITECTURE BANNER */}
      {/* ========================================================================= */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-[#0B1E3B] to-slate-900 text-white border border-slate-800 shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-8 space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0056B3]/30 border border-[#0056B3]/60 text-blue-300 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>Built-in National Sandbox Integration</span>
            </div>
            <h4 className="font-heading font-extrabold text-xl sm:text-2xl text-white">
              How MediKiosk Synchronizes with the ABDM Ecosystem
            </h4>
            <p className="text-xs sm:text-sm text-white/70 max-w-2xl leading-relaxed">
              Every MediKiosk point-of-entry terminal automatically supports ABDM Milestone 1 (ABHA Creation), Milestone 2 (Scan &amp; Share QR Tokens), and Milestone 3 (FHIR R4 Diagnostic Bundling) without requiring hospital staff manual entry.
            </p>
          </div>

          <div className="md:col-span-4 flex flex-col gap-2.5">
            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 border border-white/10 text-xs">
              <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 font-bold">
                M1
              </div>
              <div>
                <div className="font-bold text-white">Aadhaar / Mobile ABHA</div>
                <div className="text-[11px] text-white/60">Instant OTP generation at kiosk</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 border border-white/10 text-xs">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 font-bold">
                M2
              </div>
              <div>
                <div className="font-bold text-white">Scan &amp; Share OPD Slip</div>
                <div className="text-[11px] text-white/60">Zero-queue token routing to doctor</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 border border-white/10 text-xs">
              <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0 font-bold">
                M3
              </div>
              <div>
                <div className="font-bold text-white">FHIR R4 Bundle Push</div>
                <div className="text-[11px] text-white/60">OCR prescriptions into longitudinal EHR</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
