"use client";

import React, { useEffect, useState } from "react";
import { RawAnalysisData } from "../../../../../lib/types/analysis";

interface PulseScoreProps {
  data: RawAnalysisData;
}

interface BreakdownBar {
  label: string;
  value: number; // 0-100
  color: string;
}

export default function PulseScore({ data }: PulseScoreProps) {
  // 1. Calculate weighted score (0-100)
  const profileHealth = data.profile?.profileScore || 50;
  const contentFitness = data.csiScore || 50;
  const engagementPower = data.contentMetrics?.engagementScore || 50;

  // Weights: Profile 20%, Fitness 40%, Engagement 40%
  const totalScore = Math.round(
    profileHealth * 0.2 + contentFitness * 0.4 + engagementPower * 0.4,
  );

  // 2. Determine Grade
  const getGrade = (s: number) => {
    if (s >= 95) return { grade: "S", color: "#F59E0B" }; // Gold
    if (s >= 85) return { grade: "A", color: "#10B981" }; // Green
    if (s >= 70) return { grade: "B", color: "#06B6D4" }; // Cyan
    if (s >= 55) return { grade: "C", color: "#EAB308" }; // Yellow
    if (s >= 40) return { grade: "D", color: "#F97316" }; // Orange
    return { grade: "F", color: "#EF4444" }; // Red
  };

  const { grade, color } = getGrade(totalScore);

  // 3. Breakdown Bars
  const breakdown: BreakdownBar[] = [
    { label: "Profile Health", value: profileHealth, color: "#8B5CF6" }, // Violet
    { label: "Content Fitness", value: contentFitness, color: "#EC4899" }, // Pink
    { label: "Engagement Power", value: engagementPower, color: "#10B981" }, // Emerald
  ];

  // Animation State
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedScore(totalScore), 300);
    return () => clearTimeout(timer);
  }, [totalScore]);

  // SVG Calculation
  const radius = 80;
  const stroke = 12;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset =
    circumference - (animatedScore / 100) * circumference;

  return (
    <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm p-6 relative overflow-hidden group hover:shadow-md transition-all duration-300">
      {/* Background Glow */}
      <div
        className="absolute top-0 right-0 w-[200px] h-[200px] bg-gradient-to-br from-transparent to-slate-50 rounded-full blur-3xl opacity-50 pointer-events-none"
        style={{
          background: `radial-gradient(circle at center, ${color}15, transparent 70%)`,
        }}
      />

      <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
        {/* Radial Gauge */}
        <div className="relative w-[180px] h-[180px] flex items-center justify-center shrink-0">
          <svg
            height={radius * 2}
            width={radius * 2}
            className="transform -rotate-90"
          >
            {/* Track */}
            <circle
              stroke="#F1F5F9"
              strokeWidth={stroke}
              fill="transparent"
              r={normalizedRadius}
              cx={radius}
              cy={radius}
            />
            {/* Progress */}
            <circle
              stroke={color}
              strokeWidth={stroke}
              strokeDasharray={circumference + " " + circumference}
              style={{
                strokeDashoffset,
                transition: "stroke-dashoffset 1.5s ease-out",
              }}
              strokeLinecap="round"
              fill="transparent"
              r={normalizedRadius}
              cx={radius}
              cy={radius}
            />
          </svg>

          {/* Center Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span
              className="text-5xl font-black tracking-tighter"
              style={{ color }}
            >
              {grade}
            </span>
            <span className="text-sm font-medium text-slate-400 mt-1 uppercase tracking-wider">
              Grade
            </span>
          </div>

          {/* Pulse Effect Ping */}
          <div
            className="absolute inset-0 rounded-full animate-ping opacity-10 pointer-events-none"
            style={{ backgroundColor: color }}
          />
        </div>

        {/* Breakdown Panel */}
        <div className="flex-1 w-full flex flex-col gap-4">
          <div className="flex items-baseline justify-between mb-1">
            <h2 className="text-xl font-bold text-slate-800">Pulse Score</h2>
            <span className="text-3xl font-bold text-slate-900">
              {animatedScore}
              <span className="text-lg text-slate-400 font-normal">/100</span>
            </span>
          </div>

          <div className="space-y-4">
            {breakdown.map((item, i) => (
              <div key={i} className="flex flex-col gap-1">
                <div className="flex justify-between text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  <span>{item.label}</span>
                  <span>{item.value}%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000 ease-out"
                    style={{
                      width: `${animatedScore > 0 ? item.value : 0}%`,
                      backgroundColor: item.color,
                      transitionDelay: `${i * 150}ms`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
