"use client";

import React from "react";
import { Globe, Briefcase, UserCheck } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";
import { PlatformKey } from "./types";
import { DEMOGRAPHICS_DATA } from "./mockData";

interface AudienceDeepDiveProps {
  platform: PlatformKey;
}

export default function AudienceDeepDive({ platform }: AudienceDeepDiveProps) {
  const data = DEMOGRAPHICS_DATA[platform] || DEMOGRAPHICS_DATA["all"];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
      {/* 1. Job Titles (Bar Chart) */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col">
        <div className="mb-6 flex justify-between items-start">
          <div>
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Briefcase className="text-indigo-600" size={18} />
              Professional Breakdown
            </h3>
            <p className="text-sm text-gray-500">
              Top job titles engaging with your content.
            </p>
          </div>
          <span className="px-2 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase tracking-wide rounded-md">
            {data.seniority}
          </span>
        </div>

        <div className="flex-1 min-h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={data.jobs}
              margin={{ top: 0, right: 30, left: 0, bottom: 0 }}
            >
              <XAxis type="number" hide />
              <YAxis
                dataKey="name"
                type="category"
                width={120}
                tick={{ fontSize: 11, fontWeight: 600, fill: "#4B5563" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                cursor={{ fill: "transparent" }}
                contentStyle={{
                  borderRadius: "8px",
                  border: "none",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                {data.jobs.map((entry: any, index: number) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={index === 0 ? "#4F46E5" : "#E0E7FF"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Locations (Visual List) */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col">
        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Globe className="text-indigo-600" size={18} />
            Top Locations
          </h3>
          <p className="text-sm text-gray-500">
            Where your high-value audience is located.
          </p>
        </div>

        <div className="space-y-4">
          {data.locations.map((loc: any, idx: number) => (
            <div key={idx} className="group">
              <div className="flex justify-between items-center mb-1 text-sm">
                <span className="font-bold text-gray-700 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs text-gray-400 font-mono">
                    {idx + 1}
                  </span>
                  {loc.city}
                </span>
                <span className="font-bold text-indigo-600">
                  {loc.percent}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full transition-all duration-500 group-hover:bg-indigo-600"
                  style={{ width: `${loc.percent}%` }}
                ></div>
              </div>
            </div>
          ))}

          {/* AI Insight Footnote */}
          <div className="mt-6 pt-4 border-t border-gray-50 flex gap-3 items-start opacity-75">
            <UserCheck size={16} className="text-green-600 mt-0.5" />
            <p className="text-xs text-gray-500 leading-relaxed">
              <strong>Strategy Tip:</strong> 40% of your audience is in New
              York. Consider scheduling posts at 9 AM EST (their commute time)
              to boost engagement by ~15%.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
