"use client";

import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import {
  FaBatteryQuarter,
  FaExclamationTriangle,
  FaCheckCircle,
} from "react-icons/fa";
import { BsActivity } from "react-icons/bs";

// --- Types ---
export interface FatigueData {
  status: "Healthy" | "Warning" | "Critical";
  fatigueScore: number; // 0-100
  optimalFrequency: string;
  saturationPoint: number; // Max posts before drop-off
  weeklyImpact: Array<{
    day: string;
    posts: number;
    impactScore: number; // Engagement Multiplier (e.g., 1.2x, 0.8x)
  }>;
}

interface PostFatigueProps {
  data?: FatigueData;
}

// --- Component ---
const PostFatigue: React.FC<PostFatigueProps> = ({ data }) => {
  const safeData: FatigueData = data || {
    status: "Warning",
    fatigueScore: 45,
    optimalFrequency: "3-4 posts/week",
    saturationPoint: 2,
    weeklyImpact: [
      { day: "Mon", posts: 1, impactScore: 1.1 },
      { day: "Tue", posts: 0, impactScore: 1.0 },
      { day: "Wed", posts: 3, impactScore: 0.6 }, // Fatigue hit
      { day: "Thu", posts: 1, impactScore: 0.9 },
      { day: "Fri", posts: 1, impactScore: 1.2 },
      { day: "Sat", posts: 0, impactScore: 1.0 },
      { day: "Sun", posts: 1, impactScore: 1.05 },
    ],
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Healthy":
        return {
          text: "text-[#074ed5]",
          bg: "bg-[#074ed5]/10",
          bar: "#074ed5",
          border: "border-[#074ed5]/20",
        };
      case "Warning":
        return {
          text: "text-[#000100]",
          bg: "bg-[#caee55]/20",
          bar: "#caee55",
          border: "border-[#caee55]/30",
        };
      case "Critical":
        return {
          text: "text-white",
          bg: "bg-[#000100]",
          bar: "#000100",
          border: "border-transparent",
        };
      default:
        return {
          text: "text-slate-500",
          bg: "bg-slate-100",
          bar: "#9ca3af",
          border: "border-slate-200",
        };
    }
  };

  const colors = getStatusColor(safeData.status);

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.05)] p-6 h-full flex flex-col relative overflow-hidden">
      {/* Header Row */}
      <div className="flex justify-between items-start mb-5">
        <div>
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
            Fatigue Predictor
          </h4>
          <h2 className="text-xl font-black text-[#000100] leading-none mb-1">
            Audience Saturation
          </h2>
          <div className="flex items-center gap-2 mt-2">
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${colors.bg} ${colors.text} ${colors.border}`}
            >
              {safeData.status === "Critical" ||
              safeData.status === "Warning" ? (
                <FaExclamationTriangle size={10} className={colors.text} />
              ) : (
                <FaCheckCircle size={10} className={colors.text} />
              )}
              <span className="text-[10px] uppercase font-bold tracking-wider">
                {safeData.status}
              </span>
            </div>
          </div>
        </div>

        {/* Top Right Icon Badge */}
        <div className="p-2.5 bg-[#074ed5] text-white rounded-2xl shadow-sm shrink-0">
          <BsActivity size={18} />
        </div>
      </div>

      <div className="flex flex-col flex-1 gap-6">
        {/* Saturation Gauge / Stats */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 bg-[#f4f8fb] rounded-2xl p-4 border border-slate-100">
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest block mb-1">
              Optimal Freq
            </span>
            <span className="text-sm font-black text-[#000100]">
              {safeData.optimalFrequency}
            </span>
          </div>
          <div className="flex-1 bg-[#f4f8fb] rounded-2xl p-4 border border-slate-100">
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest block mb-1">
              Stop At
            </span>
            <span className="text-sm font-black text-[#000100]">
              {safeData.saturationPoint} posts
            </span>
          </div>
        </div>

        {/* Impact Chart */}
        <div className="flex-1 w-full min-h-[140px] relative">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={safeData.weeklyImpact}>
              <defs>
                <linearGradient id="colorImpact" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={colors.bar} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={colors.bar} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f4f8fb"
              />
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: "#64748b", fontWeight: 500 }}
                dy={10}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#000100",
                  color: "white",
                  borderRadius: "12px",
                  border: "none",
                  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                  fontSize: "12px",
                  fontWeight: "bold",
                  padding: "6px 10px",
                }}
                itemStyle={{ color: "white" }}
              />
              <ReferenceLine
                y={1}
                stroke="#64748b"
                strokeDasharray="3 3"
                label={{
                  position: "top",
                  value: "Baseline",
                  fontSize: 10,
                  fill: "#64748b",
                  fontWeight: 600,
                }}
              />
              <Area
                type="monotone"
                dataKey="impactScore"
                stroke={colors.bar}
                fillOpacity={1}
                fill="url(#colorImpact)"
                strokeWidth={3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Insight Box */}
        <div className="mt-auto">
          <div className="bg-[#f4f8fb] rounded-2xl border border-slate-100 p-4">
            <h4 className="text-[10px] font-bold text-[#074ed5] uppercase tracking-widest mb-1 flex items-center gap-1.5">
              <FaBatteryQuarter className="text-[#074ed5] shrink-0" size={10} />{" "}
              AI Observation
            </h4>
            <p className="text-sm text-slate-500 font-medium leading-relaxed">
              Posting more than {safeData.saturationPoint} times causes a{" "}
              {Math.round(
                (1 -
                  (safeData.weeklyImpact.find((d) => d.posts > 1)
                    ?.impactScore || 0.6)) *
                  100,
              )}
              % drop in engagement. Stick to the 'Sweet Spot'.
            </p>
          </div>

          {/* Action Button */}
          <button className="w-full mt-2 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all bg-[#000100] hover:bg-black text-white">
            Optimize Schedule
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostFatigue;
