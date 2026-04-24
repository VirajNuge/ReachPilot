"use client";

import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import type { CorrelationSeries } from "@/lib/analytics/types";
import type { PlatformKey } from "@/lib/analytics/platforms";
import { PLATFORM_LABELS } from "@/lib/analytics/platforms";

interface ComparisonEngineProps {
  series?: CorrelationSeries;
  platform: PlatformKey;
}

export default function ComparisonEngine({ series, platform }: ComparisonEngineProps) {
  if (!series || platform === "all") return null;

  const labelA = series.platformA === "all"
    ? "Global"
    : PLATFORM_LABELS[series.platformA];
  const labelB = series.platformB === "all"
    ? "Global"
    : PLATFORM_LABELS[series.platformB];

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.05)] p-6">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-[#000100]">Platform Correlation</h3>
        <p className="text-sm text-slate-500">
          Compare how {labelA} activity correlates with {labelB} engagement.
        </p>
      </div>
      <div className="h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={series.series} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
            <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{
                borderRadius: "10px",
                border: "none",
                boxShadow: "0 10px 20px rgba(0,0,0,0.08)",
              }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line type="monotone" dataKey="platformA" stroke="#4F46E5" strokeWidth={3} dot={false} name={labelA} />
            <Line type="monotone" dataKey="platformB" stroke="#0EA5E9" strokeWidth={3} dot={false} name={labelB} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
