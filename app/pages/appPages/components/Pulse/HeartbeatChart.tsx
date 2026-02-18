"use client";

import React, { useEffect, useState } from "react";
import { HeartbeatDay } from "../../../../../lib/types/analysis";

interface HeartbeatChartProps {
  data: HeartbeatDay[];
}

export default function HeartbeatChart({ data }: HeartbeatChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm p-6 h-[200px] flex items-center justify-center text-slate-400">
        No Activity Data
      </div>
    );
  }

  // Find max value for normalization
  const maxScore = Math.max(...data.map((d) => d.activityScore), 1);
  const width = 1000;
  const height = 150;
  const padding = 20;

  // Generate path points
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * (width - padding * 2) + padding;
    const y =
      height - (d.activityScore / maxScore) * (height - padding * 2) - padding;
    return `${x},${y}`;
  });

  const pathD = `M ${points.join(" L ")}`;

  // Determine Overall Trend from last day vs first day avg
  const trend = data[data.length - 1].trend;
  const trendColor =
    trend === "Rising"
      ? "#10B981"
      : trend === "Dropping"
        ? "#EF4444"
        : "#F59E0B";

  return (
    <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm p-6 relative overflow-hidden">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">
            Activity Heartbeat
          </h3>
          <div className="flex items-center gap-2">
            <span className="flex h-3 w-3 relative">
              <span
                className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                style={{ backgroundColor: trendColor }}
              ></span>
              <span
                className="relative inline-flex rounded-full h-3 w-3"
                style={{ backgroundColor: trendColor }}
              ></span>
            </span>
            <span className="font-bold text-slate-700">{trend} Activity</span>
          </div>
        </div>
        <div className="text-right">
          <span className="text-2xl font-bold text-slate-800">
            {data.reduce((acc, curr) => acc + curr.postsCount, 0)}
          </span>
          <span className="text-xs text-slate-400 block font-medium uppercase">
            Posts this week
          </span>
        </div>
      </div>

      {/* Chart Container */}
      <div className="relative h-[120px] w-full">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full overflow-visible"
          preserveAspectRatio="none"
        >
          {/* Gradient Definition */}
          <defs>
            <linearGradient id="line-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={trendColor} stopOpacity="0.5" />
              <stop offset="100%" stopColor={trendColor} stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Fill Area */}
          <path
            d={`${pathD} L ${width - padding},${height} L ${padding},${height} Z`}
            fill="url(#line-gradient)"
            opacity="0.2"
          />

          {/* The Line */}
          <path
            d={pathD}
            fill="none"
            stroke={trendColor}
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={mounted ? "animate-draw" : ""}
            style={{
              strokeDasharray: 3000,
              strokeDashoffset: mounted ? 0 : 3000,
              transition: "stroke-dashoffset 2s ease-out",
            }}
          />

          {/* Points */}
          {data.map((d, i) => {
            const x = (i / (data.length - 1)) * (width - padding * 2) + padding;
            const y =
              height -
              (d.activityScore / maxScore) * (height - padding * 2) -
              padding;
            return (
              <g key={i} className="group">
                <circle
                  cx={x}
                  cy={y}
                  r="6"
                  fill="white"
                  stroke={trendColor}
                  strokeWidth="3"
                  className="transition-all duration-300 group-hover:r-8"
                />
                {/* Tooltip */}
                <foreignObject
                  x={x - 40}
                  y={y - 50}
                  width="80"
                  height="40"
                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
                >
                  <div className="bg-slate-800 text-white text-[10px] rounded px-2 py-1 text-center shadow-lg">
                    {d.day}: {d.postsCount} posts
                  </div>
                </foreignObject>
              </g>
            );
          })}
        </svg>
      </div>

      {/* X-Axis Labels */}
      <div className="flex justify-between mt-2 px-2">
        {data.map((d, i) => (
          <span key={i} className="text-xs font-medium text-slate-400">
            {d.day}
          </span>
        ))}
      </div>
    </div>
  );
}
