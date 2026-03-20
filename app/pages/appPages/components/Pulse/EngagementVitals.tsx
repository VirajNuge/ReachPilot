"use client";

import React, { useEffect, useState } from "react";
import { EngagementVitals } from "../../../../../lib/types/analysis";
import { FaHeartbeat, FaChartLine, FaComments, FaBolt } from "react-icons/fa";

interface EngagementVitalsProps {
  data: EngagementVitals;
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

/** Reach Efficiency (Discovery Ratio) status: >70 Healthy, 40–70 Warning, <40 Critical */
function reachEfficiencyStatus(score: number): "Healthy" | "Warning" | "Critical" {
  if (score > 70) return "Healthy";
  if (score >= 40) return "Warning";
  return "Critical";
}

/** Conversation Density status: >10% Healthy, 2–10% Warning, <2% Critical */
function conversationDensityStatus(pct: number): "Healthy" | "Warning" | "Critical" {
  if (pct > 10) return "Healthy";
  if (pct >= 2) return "Warning";
  return "Critical";
}

/** Amplification Power status: >2% Healthy, 0.5–2% Warning, <0.5% Critical */
function amplificationPowerStatus(pct: number): "Healthy" | "Warning" | "Critical" {
  if (pct > 2) return "Healthy";
  if (pct >= 0.5) return "Warning";
  return "Critical";
}

export default function EngagementVitalsPanel({ data }: EngagementVitalsProps) {
  if (!data) return null;

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.05)] p-6">
      <div className="flex justify-between items-start mb-6 gap-4">
        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          Engagement Vitals
        </h3>
        <p className="text-[10px] text-slate-400 font-medium italic text-right max-w-[60%] leading-relaxed">
          {data.insight}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Engagement Rate — vs platform benchmark */}
        <VitalCard
          title="Engagement Rate"
          value={`${data.engagementRate ?? 0}%`}
          subValue={`vs ${data.benchmarkRate ?? 0}% avg`}
          status={data.status ?? "Warning"}
          icon={<FaHeartbeat className="text-sm" />}
          delay={0}
          // Progress: scale relative to 2× the benchmark so healthy ER fills the bar nicely
          progress={Math.min(100, ((data.engagementRate ?? 0) / Math.max((data.benchmarkRate ?? 1) * 2, 0.01)) * 100)}
        />

        {/* 2. Reach Efficiency — Discovery Ratio 0–100 */}
        <VitalCard
          title="Reach Efficiency"
          value={`${data.reachEfficiency ?? 0}`}
          subValue="/ 100"
          status={reachEfficiencyStatus(data.reachEfficiency ?? 0)}
          icon={<FaChartLine className="text-sm" />}
          delay={150}
          progress={data.reachEfficiency ?? 0}
        />

        {/* 3. Conversation Density — comments / total engagements % */}
        <VitalCard
          title="Conversation Density"
          value={`${(data.conversationDensity ?? 0).toFixed(1)}%`}
          subValue="of engagements"
          status={conversationDensityStatus(data.conversationDensity ?? 0)}
          icon={<FaComments className="text-sm" />}
          delay={300}
          // Progress: 20% density = full bar (>10% is already Healthy, so 20 gives headroom)
          progress={Math.min(100, ((data.conversationDensity ?? 0) / 20) * 100)}
        />

        {/* 4. Amplification Power — shares+saves / reach % */}
        <VitalCard
          title="Amplification Power"
          value={`${(data.amplificationPower ?? 0).toFixed(2)}%`}
          subValue="of reach shared"
          status={amplificationPowerStatus(data.amplificationPower ?? 0)}
          icon={<FaBolt className="text-sm" />}
          delay={450}
          // Progress: 5% amplification = full bar (>2% is Healthy)
          progress={Math.min(100, ((data.amplificationPower ?? 0) / 5) * 100)}
        />
      </div>
    </div>
  );
}
