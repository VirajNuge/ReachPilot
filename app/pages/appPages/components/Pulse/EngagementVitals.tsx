"use client";

import React, { useEffect, useState } from "react";
import {
  EngagementVitals,
  RawAnalysisData,
} from "../../../../../lib/types/analysis";
import { FaHeartbeat, FaChartLine, FaExchangeAlt } from "react-icons/fa";

interface EngagementVitalsProps {
  data: EngagementVitals;
  contentMetrics: RawAnalysisData["contentMetrics"];
}

interface VitalCardProps {
  title: string;
  value: string;
  subValue?: string;
  status: "Healthy" | "Warning" | "Critical";
  icon: React.ReactNode;
  delay: number;
}

const VitalCard = ({
  title,
  value,
  subValue,
  status,
  icon,
  delay,
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
            width: show
              ? status === "Healthy"
                ? "80%"
                : status === "Warning"
                  ? "50%"
                  : "25%"
              : "0%",
          }}
        />
      </div>
    </div>
  );
};

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

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <VitalCard
          title="Engagement Rate"
          value={`${data.engagementRate}%`}
          subValue={`vs ${data.benchmarkRate}% avg`}
          status={data.status}
          icon={<FaHeartbeat className="text-sm" />}
          delay={0}
        />
        <VitalCard
          title="Reach Efficiency"
          value={data.reachEfficiency.toString()}
          subValue="/ 100"
          status={
            data.reachEfficiency > 75
              ? "Healthy"
              : data.reachEfficiency > 50
                ? "Warning"
                : "Critical"
          }
          icon={<FaChartLine className="text-sm" />}
          delay={150}
        />
        <VitalCard
          title="Interaction Ratio"
          value={data.interactionRatio.toFixed(1)}
          subValue="Likes per Comment"
          status={
            data.interactionRatio < 20 && data.interactionRatio > 5
              ? "Healthy"
              : "Warning"
          }
          icon={<FaExchangeAlt className="text-sm" />}
          delay={300}
        />
      </div>
    </div>
  );
}
