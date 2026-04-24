"use client";

import React, { useEffect, useState } from "react";
import { EngagementVitals } from "../../../../../lib/types/analysis";
import { FaHeartbeat, FaChartLine, FaComments, FaBolt } from "react-icons/fa";

interface EngagementVitalsProps {
  data: EngagementVitals;
  platform?: string;
}

interface VitalCardProps {
  title: string;
  value: string;
  subValue?: string;
  status: "Healthy" | "Warning" | "Critical";
  icon: React.ReactNode;
  delay: number;
  /** Progress bar fill 0–100 */
  progress: number;
}

// ─── Platform-specific benchmarks ────────────────────────────────────────────
// Sources: Hootsuite 2024, Socialinsider 2024, RivalIQ 2025 benchmarks
// reachEfficiency  = reach-to-follower ratio (0–100 scale; 100 = perfect reach)
// conversationDensity = comments as % of total engagements
// amplificationPower  = shares/saves as % of reach
// engagementRate      = used only for progress-bar scaling (AI provides the actual status)

interface PlatformVitals {
  reachEfficiency: { healthy: number; warning: number };
  conversationDensity: { healthy: number; warning: number };
  amplificationPower: { healthy: number; warning: number };
  /** Upper bound used to scale the progress bar for each metric */
  progressScale: {
    reachEfficiency: number;
    conversationDensity: number;
    amplificationPower: number;
    engagementRate: number; // 2× benchmark ceiling
  };
  label: string;
}

const PLATFORM_VITALS: Record<string, PlatformVitals> = {
  instagram: {
    reachEfficiency:    { healthy: 20,  warning: 10  },
    conversationDensity:{ healthy: 8,   warning: 3   },
    amplificationPower: { healthy: 2,   warning: 0.5 },
    progressScale:      { reachEfficiency: 40, conversationDensity: 20, amplificationPower: 5,  engagementRate: 6   },
    label: "Instagram",
  },
  tiktok: {
    reachEfficiency:    { healthy: 70,  warning: 30  },
    conversationDensity:{ healthy: 12,  warning: 5   },
    amplificationPower: { healthy: 8,   warning: 2   },
    progressScale:      { reachEfficiency: 100, conversationDensity: 25, amplificationPower: 15, engagementRate: 16  },
    label: "TikTok",
  },
  linkedin: {
    reachEfficiency:    { healthy: 12,  warning: 5   },
    conversationDensity:{ healthy: 18,  warning: 8   },
    amplificationPower: { healthy: 10,  warning: 3   },
    progressScale:      { reachEfficiency: 25, conversationDensity: 35, amplificationPower: 20, engagementRate: 10  },
    label: "LinkedIn",
  },
  x: {
    reachEfficiency:    { healthy: 20,  warning: 8   },
    conversationDensity:{ healthy: 15,  warning: 5   },
    amplificationPower: { healthy: 15,  warning: 5   },
    progressScale:      { reachEfficiency: 40, conversationDensity: 30, amplificationPower: 30, engagementRate: 2   },
    label: "X / Twitter",
  },
  facebook: {
    reachEfficiency:    { healthy: 8,   warning: 2   },
    conversationDensity:{ healthy: 8,   warning: 3   },
    amplificationPower: { healthy: 4,   warning: 1   },
    progressScale:      { reachEfficiency: 15, conversationDensity: 15, amplificationPower: 8,  engagementRate: 1   },
    label: "Facebook",
  },
  youtube: {
    reachEfficiency:    { healthy: 15,  warning: 5   },
    conversationDensity:{ healthy: 8,   warning: 3   },
    amplificationPower: { healthy: 2,   warning: 0.5 },
    progressScale:      { reachEfficiency: 30, conversationDensity: 15, amplificationPower: 5,  engagementRate: 4   },
    label: "YouTube",
  },
  unknown: {
    reachEfficiency:    { healthy: 20,  warning: 8   },
    conversationDensity:{ healthy: 10,  warning: 2   },
    amplificationPower: { healthy: 2,   warning: 0.5 },
    progressScale:      { reachEfficiency: 40, conversationDensity: 20, amplificationPower: 5,  engagementRate: 4   },
    label: "Social",
  },
};

function normalizePlatform(p?: string | null): string {
  if (!p) return "unknown";
  const s = p.toLowerCase();
  if (s.includes("instagram")) return "instagram";
  if (s.includes("tiktok")) return "tiktok";
  if (s.includes("linkedin")) return "linkedin";
  if (s === "x" || s.includes("twitter")) return "x";
  if (s.includes("facebook")) return "facebook";
  if (s.includes("youtube")) return "youtube";
  return "unknown";
}

function getStatus(
  value: number,
  thresholds: { healthy: number; warning: number }
): "Healthy" | "Warning" | "Critical" {
  if (value >= thresholds.healthy) return "Healthy";
  if (value >= thresholds.warning) return "Warning";
  return "Critical";
}

// ─── VitalCard ────────────────────────────────────────────────────────────────

const VitalCard = ({
  title,
  value,
  subValue,
  status,
  icon,
  delay,
  progress,
}: VitalCardProps) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShow(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const borderColors = {
    Healthy: "border-l-[#0052FF]",
    Warning: "border-l-[#F59E0B]",
    Critical: "border-l-[#EF4444]",
  };

  const statusBadgeColors = {
    Healthy: "text-[#0052FF]",
    Warning: "text-[#F59E0B]",
    Critical: "text-[#EF4444]",
  };

  const statusDotColors = {
    Healthy: "bg-[#0052FF]",
    Warning: "bg-[#F59E0B]",
    Critical: "bg-[#EF4444]",
  };

  const barFillColors = {
    Healthy: "bg-[#0052FF]",
    Warning: "bg-[#F59E0B]",
    Critical: "bg-[#EF4444]",
  };

  return (
    <div
      className={`relative p-4 rounded-2xl border border-slate-100 border-l-4 bg-[#F5F6FA] overflow-hidden transition-all duration-500 transform ${
        show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
      } ${borderColors[status]}`}
    >
      {/* Icon (top-left) */}
      <div className="p-2 bg-[#0052FF]/10 text-[#0052FF] rounded-xl mb-3 inline-flex">
        {icon}
      </div>

      {/* Status Badge (top-right absolute) */}
      <div className="absolute top-3 right-3 inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-white border border-slate-100 shadow-sm">
        <span
          className={`w-1.5 h-1.5 rounded-full ${statusDotColors[status]}`}
        />
        <span className={statusBadgeColors[status]}>{status}</span>
      </div>

      {/* Content */}
      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">
        {title}
      </h4>
      <div className="flex items-baseline gap-2 mb-3">
        <span className="text-3xl font-black text-[#1A1D23] tracking-tight">
          {value}
        </span>
        {subValue && (
          <span className="text-[10px] font-medium text-slate-400">
            {subValue}
          </span>
        )}
      </div>

      {/* Mini progress bar */}
      <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${barFillColors[status]} transition-all duration-1000 ease-out`}
          style={{
            width: show ? `${Math.min(100, Math.max(0, progress))}%` : "0%",
          }}
        />
      </div>
    </div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────

export default function EngagementVitalsPanel({
  data,
  platform,
}: EngagementVitalsProps) {
  if (!data) return null;

  const key = normalizePlatform(platform);
  const vitals = PLATFORM_VITALS[key] ?? PLATFORM_VITALS.unknown;

  const reachStatus = getStatus(data.reachEfficiency ?? 0, vitals.reachEfficiency);
  const convStatus  = getStatus(data.conversationDensity ?? 0, vitals.conversationDensity);
  const ampStatus   = getStatus(data.amplificationPower ?? 0, vitals.amplificationPower);

  const erProgress = Math.min(
    100,
    ((data.engagementRate ?? 0) / Math.max(vitals.progressScale.engagementRate, 0.01)) * 100
  );
  const reachProgress = Math.min(
    100,
    ((data.reachEfficiency ?? 0) / vitals.progressScale.reachEfficiency) * 100
  );
  const convProgress = Math.min(
    100,
    ((data.conversationDensity ?? 0) / vitals.progressScale.conversationDensity) * 100
  );
  const ampProgress = Math.min(
    100,
    ((data.amplificationPower ?? 0) / vitals.progressScale.amplificationPower) * 100
  );

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.05)] p-6">
      <div className="flex justify-between items-start mb-6 gap-4">
        <div className="flex items-center gap-2.5">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Engagement Vitals
          </h3>
          {key !== "unknown" && (
            <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
              {vitals.label}
            </span>
          )}
        </div>
        <p className="text-[10px] text-slate-400 font-medium italic text-right max-w-[60%] leading-relaxed">
          {data.insight}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Engagement Rate — AI-provided status, platform-scaled progress */}
        <VitalCard
          title="Engagement Rate"
          value={`${data.engagementRate ?? 0}%`}
          subValue={`vs ${data.benchmarkRate ?? 0}% avg`}
          status={data.status ?? "Warning"}
          icon={<FaHeartbeat className="text-sm" />}
          delay={0}
          progress={erProgress}
        />

        {/* 2. Reach Efficiency — platform-aware thresholds */}
        <VitalCard
          title="Reach Efficiency"
          value={`${data.reachEfficiency ?? 0}`}
          subValue="/ 100"
          status={reachStatus}
          icon={<FaChartLine className="text-sm" />}
          delay={150}
          progress={reachProgress}
        />

        {/* 3. Conversation Density — platform-aware thresholds */}
        <VitalCard
          title="Conversation Density"
          value={`${(data.conversationDensity ?? 0).toFixed(1)}%`}
          subValue="of engagements"
          status={convStatus}
          icon={<FaComments className="text-sm" />}
          delay={300}
          progress={convProgress}
        />

        {/* 4. Amplification Power — platform-aware thresholds */}
        <VitalCard
          title="Amplification Power"
          value={`${(data.amplificationPower ?? 0).toFixed(2)}%`}
          subValue="of reach shared"
          status={ampStatus}
          icon={<FaBolt className="text-sm" />}
          delay={450}
          progress={ampProgress}
        />
      </div>
    </div>
  );
}
