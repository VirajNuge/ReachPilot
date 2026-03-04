"use client";

import React, { useEffect, useState } from "react";
import { RawAnalysisData } from "../../../../../lib/types/analysis";

interface PulseScoreProps {
  data: RawAnalysisData;
}

export default function PulseScore({ data }: PulseScoreProps) {
  const profileHealth = data.profile?.profileScore ?? 58;
  const contentFitness = data.csiScore ?? 65;
  const engagementPower = data.contentMetrics?.engagementScore ?? 35;

  const totalScore = Math.round(
    profileHealth * 0.2 + contentFitness * 0.4 + engagementPower * 0.4,
  );

  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 400);
    return () => clearTimeout(timer);
  }, []);

  const getGrade = (s: number) => {
    if (s >= 90) return { label: "S", color: "#B6FF33" }; // lime — top tier
    if (s >= 80) return { label: "A", color: "#0052FF" }; // blue — strong
    if (s >= 65) return { label: "B", color: "#0052FF" }; // blue — good
    if (s >= 50) return { label: "C", color: "#1A1D23" }; // dark — average
    if (s >= 35) return { label: "D", color: "#EF4444" }; // red — weak
    return { label: "F", color: "#EF4444" }; // red — fail
  };

  const { label: gradeLabel, color: gradeColor } = getGrade(totalScore);

  const segments = [
    {
      label: "Profile Health",
      short: "Health",
      value: profileHealth,
      color: "#0052FF",
      bg: "bg-[#0052FF]",
    },
    {
      label: "Content",
      short: "Content",
      value: contentFitness,
      color: "#B6FF33",
      bg: "bg-[#B6FF33]",
    },
    {
      label: "Engagement",
      short: "Engage",
      value: engagementPower,
      color: "#1A1D23",
      bg: "bg-[#1A1D23]",
    },
  ];

  const totalBarWeight = profileHealth + contentFitness + engagementPower || 1;

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.05)] p-6 flex flex-col">
      {/* Top Row: Label + Grade Badge */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
            Pulse Score
          </p>
          <h3 className="text-xl font-black text-[#1A1D23]">Overall Grade</h3>
        </div>

        {/* Grade Badge — matches blue icon badge in reference */}
        <div
          className="flex flex-col items-center justify-center w-12 h-12 rounded-2xl shrink-0"
          style={{
            background: `${gradeColor}18`,
            border: `1.5px solid ${gradeColor}40`,
          }}
        >
          <span
            className="text-xl font-black leading-none"
            style={{ color: gradeColor }}
          >
            {gradeLabel}
          </span>
          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
            Grade
          </span>
        </div>
      </div>

      {/* Big Score Number */}
      <div className="flex items-baseline gap-1.5 mb-5">
        <span className="text-4xl font-black text-[#1A1D23] tracking-tight leading-none">
          {totalScore}
        </span>
        <span className="text-lg text-slate-400 font-medium">/100</span>
      </div>

      {/* Segment percentages above bar — like HR reference */}
      <div className="flex items-end justify-between mb-1.5 px-0.5">
        {segments.map((seg, i) => (
          <span key={i} className="text-xs font-black text-[#1A1D23]">
            {Math.round((seg.value / totalBarWeight) * 100)}%
          </span>
        ))}
      </div>

      {/* Stacked Bar */}
      <div className="flex h-2.5 w-full rounded-full overflow-hidden gap-0.5 mb-5">
        {segments.map((seg, i) => (
          <div
            key={i}
            className="h-full rounded-full transition-all duration-1000 ease-out"
            style={{
              width: animated ? `${(seg.value / totalBarWeight) * 100}%` : "0%",
              backgroundColor: seg.color,
              transitionDelay: `${i * 200}ms`,
            }}
          />
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 pt-4 border-t border-slate-100 flex-wrap">
        {segments.map((seg, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full shrink-0 ${seg.bg}`} />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              {seg.short}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
