"use client";

import React, { useEffect, useState } from "react";
import { GrowthTrajectory } from "../../../../../lib/types/analysis";
import {
  FaArrowUp,
  FaArrowDown,
  FaMinus,
  FaChartLine,
  FaBullseye,
} from "react-icons/fa";

interface GrowthTrendProps {
  data: GrowthTrajectory;
  followers?: number;
}

export default function GrowthTrend({ data, followers = 0 }: GrowthTrendProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!data) return null;

  const isPositive = data.changePercent > 0;
  const isNegative = data.changePercent < 0;

  const width = 300;
  const height = 60;
  const padding = 8;
  const scores = data.sparkline.map((d) => d.score);
  const maxScore = Math.max(...scores, 1);
  const minScore = Math.min(...scores, 0);
  const range = maxScore - minScore || 1;

  const getCoord = (index: number, score: number) => {
    const x =
      (index / Math.max(data.sparkline.length - 1, 1)) * (width - padding * 2) +
      padding;
    const y =
      height - ((score - minScore) / range) * (height - padding * 2) - padding;
    return { x, y };
  };

  const pathD = `M ${data.sparkline
    .map((d, i) => {
      const { x, y } = getCoord(i, d.score);
      return `${x},${y}`;
    })
    .join(" L ")}`;

  const firstCoord = getCoord(0, data.sparkline[0]?.score ?? 0);
  const lastCoord = getCoord(
    data.sparkline.length - 1,
    data.sparkline[data.sparkline.length - 1]?.score ?? 0,
  );

  const formatFollowers = (n: number) => {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
    if (n >= 1000) return (n / 1000).toFixed(1) + "k";
    return n.toLocaleString();
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.05)] p-6 flex flex-col h-full">
      {/* Header Row */}
      <div className="flex justify-between items-start mb-5">
        <div>
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
            Growth Trajectory
          </h3>
          <h2 className="text-xl font-black text-[#1A1D23] tracking-tight">
            Follower Growth
          </h2>
        </div>
        <div className="p-2.5 bg-[#0052FF] text-white rounded-2xl shadow-sm shrink-0">
          <FaChartLine size={15} />
        </div>
      </div>

      {/* Change Badge */}
      <div className="mb-5">
        {isPositive ? (
          <span className="bg-[#F0FFF4] text-[#22C55E] font-bold text-[10px] px-2.5 py-1 rounded-full inline-flex items-center gap-1">
            <FaArrowUp size={8} /> +{data.changePercent}%
          </span>
        ) : isNegative ? (
          <span className="bg-[#FFF0F0] text-[#EF4444] font-bold text-[10px] px-2.5 py-1 rounded-full inline-flex items-center gap-1">
            <FaArrowDown size={8} /> {data.changePercent}%
          </span>
        ) : (
          <span className="bg-slate-100 text-slate-500 font-bold text-[10px] px-2.5 py-1 rounded-full inline-flex items-center gap-1">
            <FaMinus size={8} /> {data.changePercent}%
          </span>
        )}
      </div>

      {/* Sparkline SVG */}
      <div className="w-full h-[60px] relative mb-1">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="gt-spark-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0052FF" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#0052FF" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Fill area */}
          <path
            d={`${pathD} L ${lastCoord.x},${height} L ${firstCoord.x},${height} Z`}
            fill="url(#gt-spark-gradient)"
          />

          {/* Line */}
          <path
            d={pathD}
            fill="none"
            stroke="#0052FF"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              strokeDasharray: 3000,
              strokeDashoffset: mounted ? 0 : 3000,
              transition: "stroke-dashoffset 2s ease-out",
            }}
          />

          {/* Data point circles */}
          {data.sparkline.map((d, i) => {
            const { x, y } = getCoord(i, d.score);
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r={4}
                fill="white"
                stroke="#0052FF"
                strokeWidth={2.5}
              />
            );
          })}
        </svg>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-100">
        <div>
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
            Followers
          </h4>
          <span className="text-2xl font-black text-[#1A1D23]">
            {followers > 0 ? formatFollowers(followers) : "—"}
          </span>
        </div>
        <div>
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
            Avg Growth
          </h4>
          <span className="text-2xl font-black text-[#1A1D23]">
            {data.changePercent > 0 ? "+" : ""}
            {data.changePercent}%
          </span>
        </div>
      </div>

      {/* Forecast Box */}
      <div className="bg-[#F5F6FA] rounded-2xl border border-slate-100 p-4 mt-4">
        <h4 className="text-[10px] font-bold text-[#0052FF] uppercase tracking-widest mb-1 flex items-center gap-1.5">
          <FaBullseye className="text-[#0052FF] shrink-0" size={10} /> Forecast
        </h4>
        <p className="text-sm text-slate-500 font-medium leading-relaxed">
          {data.forecast}
        </p>
      </div>
    </div>
  );
}
