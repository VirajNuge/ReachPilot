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
import { PlatformKey } from "./types";
import { RADAR_DATA } from "./mockData";

interface RadarInsightProps {
  platform: PlatformKey;
}

export default function RadarInsight({ platform }: RadarInsightProps) {
  // Use data for selected platform, or fallback to 'all'
  const data = RADAR_DATA[platform] || RADAR_DATA["all"];

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm h-[420px] flex flex-col relative overflow-hidden">
      <div className="mb-2 relative z-10">
        <h3 className="text-lg font-bold text-gray-900">Performance DNA</h3>
        <p className="text-sm text-gray-500">Strategic alignment analysis</p>
      </div>

      <div className="flex-1 relative z-10">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
            <PolarGrid stroke="#E5E7EB" />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fill: "#6B7280", fontSize: 11, fontWeight: 700 }}
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
              stroke="#4F46E5"
              strokeWidth={3}
              fill="#6366F1"
              fillOpacity={0.4}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Visual Flair: A subtle blur blob in the background */}
      <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-indigo-50 rounded-full blur-3xl z-0"></div>
    </div>
  );
}
