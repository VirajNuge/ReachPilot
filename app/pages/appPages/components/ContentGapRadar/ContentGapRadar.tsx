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
import { BsRadar } from "react-icons/bs";

interface ContentGapRadarProps {
  currentKeywords?: string[];
  missingKeywords?: string[];
}

const ContentGapRadar: React.FC<ContentGapRadarProps> = ({
  currentKeywords = [],
  missingKeywords = [],
}) => {
  const relevantCurrent = currentKeywords.slice(0, 3);
  const relevantMissing = missingKeywords.slice(0, 3);

  const data = [
    ...relevantCurrent.map((k) => ({ subject: k, A: 80, B: 0, fullMark: 100 })),
    ...relevantMissing.map((k) => ({
      subject: k,
      A: 20,
      B: 90,
      fullMark: 100,
    })),
  ];

  return (
    <div className="flex h-full w-[360px] flex-col">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h4 className="text-lg font-bold text-gray-900">Topic Radar</h4>
          <p className="text-xs text-gray-500 font-medium">Coverage Analysis</p>
        </div>
        <div className="bg-cyan-50 p-2 rounded-lg text-cyan-600">
          <BsRadar size={16} />
        </div>
      </div>

      <div className="flex-1 w-full min-h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="65%" data={data}>
            <PolarGrid stroke="#f3f4f6" />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fill: "#9ca3af", fontSize: 10, fontWeight: 600 }}
            />
            <PolarRadiusAxis
              angle={30}
              domain={[0, 100]}
              tick={false}
              axisLine={false}
            />
            <Radar
              name="Your Content"
              dataKey="A"
              stroke="#8b5cf6"
              strokeWidth={3}
              fill="#8b5cf6"
              fillOpacity={0.4}
            />
            <Radar
              name="Market Gap"
              dataKey="B"
              stroke="#06b6d4"
              strokeWidth={2}
              fill="#06b6d4"
              fillOpacity={0.1}
              strokeDasharray={"4 4"}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-center gap-6 pb-2">
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full bg-violet-500" />
          <span className="text-xs font-bold text-gray-600">You</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full border-2 border-dashed border-cyan-500" />
          <span className="text-xs font-bold text-gray-600">Market Gap</span>
        </div>
      </div>
    </div>
  );
};

export default ContentGapRadar;
