"use client";

import React from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import type { PlatformKey } from "@/lib/analytics/platforms";
import type { RadarPoint } from "@/lib/analytics/types";
import { RADAR_DATA } from "./mockData";

interface RadarInsightProps {
  platform: PlatformKey;
  data?: RadarPoint[];
}

export default function RadarInsight({ platform, data }: RadarInsightProps) {
  // Use data for selected platform, or fallback to 'all'
  const resolvedData = data ?? (RADAR_DATA[platform] || RADAR_DATA["all"]);

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.05)] h-[420px] flex flex-col relative overflow-hidden">
      <div className="mb-2 relative z-10">
        <h3 className="text-lg font-bold text-[#000100]">Performance DNA</h3>
        <p className="text-sm text-slate-500">Strategic alignment analysis</p>
      </div>

      <div className="flex-1 relative z-10">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={resolvedData}>
            <PolarGrid stroke="#E5E7EB" />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fill: "#64748B", fontSize: 11, fontWeight: 700 }}
            />
            <PolarRadiusAxis
              angle={30}
              domain={[0, 100]}
              tick={false}
              axisLine={false}
            />
            <Radar
              name={platform}
              dataKey="A"
              stroke="#0052FF"
              strokeWidth={3}
              fill="#0052FF"
              fillOpacity={0.4}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Visual Flair: A subtle blur blob in the background */}
      <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[#0052FF]/10 rounded-full blur-3xl z-0"></div>
    </div>
  );
}
