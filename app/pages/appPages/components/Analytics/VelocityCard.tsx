"use client";

import React from "react";
import { TrendingUp, TrendingDown, Minus, Zap } from "lucide-react";
import type { VelocityMetric } from "@/lib/analytics/types";

interface VelocityCardProps {
  data: VelocityMetric;
  icon: React.ReactNode;
}

export default function VelocityCard({ data, icon }: VelocityCardProps) {
  // 1. Determine Velocity Style
  const getVelocityStyle = () => {
    switch (data.velocity) {
      case "high":
        return "bg-green-100 text-green-700 border-green-200";
      case "medium":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "low":
        return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  const getVelocityLabel = () => {
    switch (data.velocity) {
      case "high":
        return "High Velocity";
      case "medium":
        return "Steady Growth";
      case "low":
        return "Low Momentum";
    }
  };

  // 2. Trend Colors
  const trendColor =
    data.trend === "up"
      ? "text-green-600"
      : data.trend === "down"
      ? "text-red-600"
      : "text-gray-500";
  const TrendIcon =
    data.trend === "up"
      ? TrendingUp
      : data.trend === "down"
      ? TrendingDown
      : Minus;

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] transition-all relative overflow-hidden group">
      {/* Top Row: Icon & Velocity Badge */}
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-[#f4f8fb] rounded-2xl text-[#0052FF] group-hover:bg-[#0052FF]/10 transition-colors">
          {icon}
        </div>

        {/* ⭐ THE VELOCITY BADGE */}
        <div
          className={`px-2 py-1 rounded-full text-[10px] font-bold border flex items-center gap-1 ${getVelocityStyle()}`}
        >
          <Zap
            size={10}
            className={data.velocity === "high" ? "fill-current" : ""}
          />
          {getVelocityLabel()}
        </div>
      </div>

      {/* Metric Value */}
      <div className="space-y-1">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">
          {data.label}
        </p>
        <h3 className="text-2xl font-black text-gray-900">{data.value}</h3>
      </div>

      {/* Footer: Trend */}
      <div className="mt-4 flex items-center gap-2 text-xs font-medium">
        <span
          className={`flex items-center gap-1 ${trendColor} bg-opacity-10 px-1.5 py-0.5 rounded`}
        >
          <TrendIcon size={12} />
          {Math.abs(data.change)}%
        </span>
        <span className="text-gray-400">vs last period</span>
      </div>
    </div>
  );
}
