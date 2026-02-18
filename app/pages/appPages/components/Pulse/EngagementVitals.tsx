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

  const statusColors = {
    Healthy: "bg-emerald-50 text-emerald-600 border-emerald-100",
    Warning: "bg-amber-50 text-amber-600 border-amber-100",
    Critical: "bg-red-50 text-red-600 border-red-100",
  };

  const statusDot = {
    Healthy: "bg-emerald-500",
    Warning: "bg-amber-500",
    Critical: "bg-red-500",
  };

  return (
    <div
      className={`relative p-4 rounded-2xl border transition-all duration-500 transform ${
        show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      } ${statusColors[status]}`}
    >
      <div className="flex justify-between items-start mb-2">
        <span
          className={`p-2 rounded-xl bg-white/50 backdrop-blur-sm shadow-sm`}
        >
          {icon}
        </span>
        <span
          className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-white/60`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${statusDot[status]} animate-pulse`}
          />
          {status}
        </span>
      </div>

      <div className="mt-2">
        <h4 className="text-xs font-semibold opacity-70 uppercase tracking-wide">
          {title}
        </h4>
        <div className="flex items-baseline gap-2 mt-0.5">
          <span className="text-2xl font-black tracking-tight">{value}</span>
          {subValue && (
            <span className="text-xs font-medium opacity-60">{subValue}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default function EngagementVitalsPanel({ data }: EngagementVitalsProps) {
  if (!data) return null;

  return (
    <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-slate-800">Engagement Vitals</h3>
        <p className="text-xs font-medium text-slate-400">{data.insight}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <VitalCard
          title="Engagement Rate"
          value={`${data.engagementRate}%`}
          subValue={`vs ${data.benchmarkRate}% avg`}
          status={data.status}
          icon={<FaHeartbeat />}
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
          icon={<FaChartLine />}
          delay={150}
        />
        <div className="md:col-span-2">
          <VitalCard
            title="Interaction Ratio"
            value={data.interactionRatio.toFixed(1)}
            subValue="Likes per Comment"
            status={
              data.interactionRatio < 20 && data.interactionRatio > 5
                ? "Healthy"
                : "Warning"
            }
            icon={<FaExchangeAlt />}
            delay={300}
          />
        </div>
      </div>
    </div>
  );
}
