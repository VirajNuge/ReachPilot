"use client";

import React, { useEffect, useState, useRef } from "react";
import { HeartbeatDay } from "../../../../../lib/types/analysis";

interface HeartbeatChartProps {
  data: HeartbeatDay[];
}

interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  label: string;
}

export default function HeartbeatChart({ data }: HeartbeatChartProps) {
  const [mounted, setMounted] = useState(false);
  const [tooltip, setTooltip] = useState<TooltipState>({
    visible: false,
    x: 0,
    y: 0,
    label: "",
  });
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.05)] p-6 h-[200px] flex items-center justify-center text-slate-400">
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
      ? "#0052FF"
      : trend === "Dropping"
        ? "#EF4444"
        : "#1A1D23";

  const handlePointMouseEnter = (
    e: React.MouseEvent<SVGCircleElement>,
    d: HeartbeatDay,
    svgX: number,
    svgY: number,
  ) => {
    const svgEl = svgRef.current;
    if (!svgEl) return;
    const rect = svgEl.getBoundingClientRect();
    // Convert SVG coordinate to % of SVG dimensions for positioning
    const pctX = svgX / width;
    const pctY = svgY / height;
    const pixX = rect.left + pctX * rect.width;
    const pixY = rect.top + pctY * rect.height;
    setTooltip({
      visible: true,
      x: pixX,
      y: pixY,
      label: `${d.day}: ${d.postsCount} post${d.postsCount !== 1 ? "s" : ""}`,
    });
  };

  const handlePointMouseLeave = () => {
    setTooltip((prev) => ({ ...prev, visible: false }));
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.05)] p-6 relative overflow-visible">
      {/* React-portal-style tooltip — rendered in DOM above SVG */}
      {tooltip.visible && (
        <div
          className="fixed z-50 bg-[#1A1D23] text-white text-xs px-2.5 py-1.5 rounded-xl shadow-xl pointer-events-none whitespace-nowrap"
          style={{
            left: tooltip.x,
            top: tooltip.y - 44,
            transform: "translateX(-50%)",
          }}
        >
          {tooltip.label}
          {/* Arrow */}
          <div
            className="absolute left-1/2 -bottom-1.5 -translate-x-1/2 w-0 h-0"
            style={{
              borderLeft: "5px solid transparent",
              borderRight: "5px solid transparent",
              borderTop: "6px solid #1A1D23",
            }}
          />
        </div>
      )}

      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
            Activity Heartbeat
          </h3>
          <div className="flex items-center gap-2">
            <span
              className="rounded-full h-2.5 w-2.5"
              style={{ backgroundColor: trendColor }}
            ></span>
            <span className="text-base font-black text-[#1A1D23]">
              {trend} Activity
            </span>
          </div>
        </div>
        <div className="text-right">
          <span className="text-4xl font-black text-[#1A1D23] tracking-tight">
            {data.reduce((acc, curr) => acc + curr.postsCount, 0)}
          </span>
          <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-widest mt-1">
            Posts this week
          </span>
        </div>
      </div>

      {/* Chart Container */}
      <div className="relative h-[120px] w-full">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full overflow-visible"
          preserveAspectRatio="none"
        >
          {/* Gradient Definition */}
          <defs>
            <linearGradient id="line-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={trendColor} stopOpacity="0.15" />
              <stop offset="100%" stopColor={trendColor} stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Fill Area */}
          <path
            d={`${pathD} L ${width - padding},${height} L ${padding},${height} Z`}
            fill="url(#line-gradient)"
          />

          {/* The Line */}
          <path
            d={pathD}
            fill="none"
            stroke={trendColor}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              strokeDasharray: 3000,
              strokeDashoffset: mounted ? 0 : 3000,
              transition: "stroke-dashoffset 2s ease-out",
            }}
          />

          {/* Points with React-driven tooltips */}
          {data.map((d, i) => {
            const x = (i / (data.length - 1)) * (width - padding * 2) + padding;
            const y =
              height -
              (d.activityScore / maxScore) * (height - padding * 2) -
              padding;
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r="8"
                fill="white"
                stroke={trendColor}
                strokeWidth="3"
                className="cursor-pointer transition-all duration-200 hover:r-10"
                onMouseEnter={(e) => handlePointMouseEnter(e, d, x, y)}
                onMouseLeave={handlePointMouseLeave}
              />
            );
          })}
        </svg>
      </div>

      {/* X-Axis Labels */}
      <div className="flex justify-between mt-2 px-2">
        {data.map((d, i) => (
          <span
            key={i}
            className="text-[10px] font-bold text-slate-400 uppercase tracking-widest"
          >
            {d.day}
          </span>
        ))}
      </div>
    </div>
  );
}
