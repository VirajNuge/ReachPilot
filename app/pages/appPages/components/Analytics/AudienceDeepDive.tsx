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
import type { PlatformKey } from "@/lib/analytics/platforms";
import type { DemographicsSnapshot } from "@/lib/analytics/types";
import { DEMOGRAPHICS_DATA } from "./mockData";

interface AudienceDeepDiveProps {
  platform: PlatformKey;
  data?: DemographicsSnapshot;
}

export default function AudienceDeepDive({ platform, data }: AudienceDeepDiveProps) {
  const resolvedData = data ?? (DEMOGRAPHICS_DATA[platform] || DEMOGRAPHICS_DATA["all"]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
      {/* 1. Job Titles (Bar Chart) */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.05)] flex flex-col">
        <div className="mb-6 flex justify-between items-start">
          <div>
            <h3 className="text-lg font-bold text-[#000100] flex items-center gap-2">
              <Briefcase className="text-[#0052FF]" size={18} />
              Professional Breakdown
            </h3>
            <p className="text-sm text-slate-500">
              Top job titles engaging with your content.
            </p>
          </div>
          <span className="px-2 py-1 bg-[#0052FF]/10 text-[#0052FF] text-[10px] font-bold uppercase tracking-wide rounded-md">
            {resolvedData.seniority}
          </span>
        </div>

        <div className="flex-1 min-h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={resolvedData.jobs}
              margin={{ top: 0, right: 30, left: 0, bottom: 0 }}
            >
              <XAxis type="number" hide />
              <YAxis
                dataKey="name"
                type="category"
                width={120}
                  tick={{ fontSize: 11, fontWeight: 600, fill: "#475569" }}
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
                {resolvedData.jobs.map((entry: any, index: number) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={index === 0 ? "#0052FF" : "#E0E7FF"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Locations (Visual List) */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.05)] flex flex-col">
        <div className="mb-6">
          <h3 className="text-lg font-bold text-[#000100] flex items-center gap-2">
            <Globe className="text-[#0052FF]" size={18} />
            Top Locations
          </h3>
          <p className="text-sm text-slate-500">
            Where your high-value audience is located.
          </p>
        </div>

        <div className="space-y-4">
          {resolvedData.locations.map((loc: any, idx: number) => (
            <div key={idx} className="group">
              <div className="flex justify-between items-center mb-1 text-sm">
                <span className="font-bold text-slate-700 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs text-slate-400 font-mono">
                    {idx + 1}
                  </span>
                  {loc.city}
                </span>
                <span className="font-bold text-[#0052FF]">
                  {loc.percent}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#0052FF] rounded-full transition-all duration-500 group-hover:bg-[#0044DD]"
                  style={{ width: `${loc.percent}%` }}
                ></div>
              </div>
            </div>
          ))}

          {/* AI Insight Footnote */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex gap-3 items-start opacity-75">
            <UserCheck size={16} className="text-green-600 mt-0.5" />
            <p className="text-xs text-slate-500 leading-relaxed">
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
