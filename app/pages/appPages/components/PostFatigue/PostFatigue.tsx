"use client";

import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import {
  FaBatteryFull,
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
          text: "text-emerald-500",
          bg: "bg-emerald-50",
          bar: "#10b981",
        };
      case "Warning":
        return { text: "text-amber-500", bg: "bg-amber-50", bar: "#f59e0b" };
      case "Critical":
        return { text: "text-rose-500", bg: "bg-rose-50", bar: "#e11d48" };
      default:
        return { text: "text-gray-500", bg: "bg-gray-50", bar: "#9ca3af" };
    }
  };

  const colors = getStatusColor(safeData.status);

  return (
    <div className="flex flex-col h-full w-full bg-white relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-6 pb-2">
        <div className="flex gap-3 items-center">
          <div className="bg-orange-50 p-2.5 rounded-xl text-orange-600">
            <BsActivity size={18} />
          </div>
          <div>
            <div className="relative group cursor-help">
              <h4 className="font-bold text-lg text-gray-900 leading-tight inline-block">
                Fatigue Predictor
              </h4>
              {/* Tooltip */}
              <div className="absolute left-0 top-full mt-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none">
                <div className="font-bold mb-1 text-orange-300">
                  Why this matters:
                </div>
                Predicts when your audience gets tired of hearing from you.
                Helps optimize posting frequency to avoid burnout.
                <div className="absolute left-4 -top-1 w-2 h-2 bg-gray-900 transform rotate-45"></div>
              </div>
            </div>
            <p className="text-xs text-gray-500 font-medium">
              Audience Saturation
            </p>
          </div>
        </div>
        <div
          className={`flex items-center gap-2 px-3 py-1 rounded-full border ${colors.bg} ${colors.text} border-current/20`}
        >
          {safeData.status === "Critical" || safeData.status === "Warning" ? (
            <FaExclamationTriangle />
          ) : (
            <FaCheckCircle />
          )}
          <span className="text-[10px] uppercase font-bold tracking-wider">
            {safeData.status}
          </span>
        </div>
      </div>

      <div className="flex flex-col flex-1 p-6 gap-4">
        {/* Saturation Gauge / Stats */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 bg-gray-50 rounded-xl p-3 border border-gray-100">
            <span className="text-[10px] text-gray-400 font-bold uppercase block mb-1">
              Optimal Freq
            </span>
            <span className="text-sm font-bold text-gray-800">
              {safeData.optimalFrequency}
            </span>
          </div>
          <div className="flex-1 bg-gray-50 rounded-xl p-3 border border-gray-100">
            <span className="text-[10px] text-gray-400 font-bold uppercase block mb-1">
              Stop At
            </span>
            <span className="text-sm font-bold text-gray-800">
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
                stroke="#f3f4f6"
              />
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: "#9ca3af" }}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "12px",
                  border: "none",
                  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                }}
              />
              <ReferenceLine
                y={1}
                stroke="#9ca3af"
                strokeDasharray="3 3"
                label={{
                  position: "top",
                  value: "Baseline",
                  fontSize: 10,
                  fill: "#9ca3af",
                }}
              />
              <Area
                type="monotone"
                dataKey="impactScore"
                stroke={colors.bar}
                fillOpacity={1}
                fill="url(#colorImpact)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
          <div className="absolute bottom-0 right-0 bg-white/80 px-2 py-1 text-[10px] text-gray-400 font-medium backdrop-blur-sm rounded">
            Engagement Impact
          </div>
        </div>

        {/* Insight */}
        <div className="mt-auto">
          <div className="flex items-start gap-2 text-xs text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100">
            <div className="mt-0.5 text-orange-400">
              <FaBatteryQuarter />
            </div>
            <p className="font-medium leading-relaxed">
              "Posting more than {safeData.saturationPoint} times causes a{" "}
              {Math.round(
                (1 -
                  (safeData.weeklyImpact.find((d) => d.posts > 1)
                    ?.impactScore || 0.6)) *
                  100,
              )}
              % drop in engagement. Stick to the 'Sweet Spot'."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostFatigue;
