"use client";

import React from "react";
import { TrendingUp, TrendingDown, Minus, ArrowUpRight } from "lucide-react";

interface KPICardProps {
  label: string;
  value: string;
  change: number;
  trend: "up" | "down" | "neutral";
  icon?: React.ReactNode;
  highlight?: string; // Optional "Top Driver" text
}

export default function KPICard({
  label,
  value,
  change,
  trend,
  icon,
  highlight,
}: KPICardProps) {
  const getTrendColor = () => {
    if (trend === "up") return "text-green-600 bg-green-50";
    if (trend === "down") return "text-red-600 bg-red-50";
    return "text-gray-600 bg-gray-50";
  };

  const getTrendIcon = () => {
    if (trend === "up") return <TrendingUp size={16} />;
    if (trend === "down") return <TrendingDown size={16} />;
    return <Minus size={16} />;
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between relative overflow-hidden group hover:border-indigo-200 transition-all">
      {/* Optional Highlight Badge (e.g. for All Platforms view) */}
      {highlight && (
        <div className="absolute top-0 right-0 bg-indigo-50 px-3 py-1 rounded-bl-xl text-[10px] font-bold text-indigo-600 uppercase tracking-wider">
          Driven by {highlight}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-bold text-gray-500">{label}</span>
        {icon && (
          <div className="text-gray-400 group-hover:text-indigo-500 transition-colors">
            {icon}
          </div>
        )}
      </div>

      {/* Main Value */}
      <div className="flex items-end gap-3">
        <h3 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          {value}
        </h3>

        {/* Trend Pill */}
        <div
          className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold mb-1 ${getTrendColor()}`}
        >
          {getTrendIcon()}
          <span>{Math.abs(change)}%</span>
        </div>
      </div>

      {/* Footer Text */}
      <p className="text-xs text-gray-400 mt-2 font-medium">vs. last 30 days</p>
    </div>
  );
}
