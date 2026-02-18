"use client";

import React from "react";
import { GrowthTrajectory } from "../../../../../lib/types/analysis";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import { FaArrowUp, FaArrowDown, FaMinus } from "react-icons/fa";

interface GrowthTrendProps {
  data: GrowthTrajectory;
}

export default function GrowthTrend({ data }: GrowthTrendProps) {
  if (!data) return null;

  const getTrendConfig = (dir: string) => {
    if (dir === "Up")
      return {
        color: "#10B981",
        icon: <FaArrowUp />,
        bg: "bg-emerald-100",
        text: "text-emerald-600",
      };
    if (dir === "Down")
      return {
        color: "#EF4444",
        icon: <FaArrowDown />,
        bg: "bg-red-100",
        text: "text-red-600",
      };
    return {
      color: "#F59E0B",
      icon: <FaMinus />,
      bg: "bg-amber-100",
      text: "text-amber-600",
    };
  };

  const config = getTrendConfig(data.direction);

  return (
    <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm p-6 flex flex-col justify-between h-full relative overflow-hidden group">
      {/* Background Decor */}
      <div
        className={`absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-10 pointer-events-none group-hover:scale-150 transition-transform duration-700 ${config.bg.replace("100", "500")}`}
      />

      {/* Header */}
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div>
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">
            Growth Trajectory
          </h3>
          <div className="flex items-center gap-2">
            <span
              className={`p-1.5 rounded-full text-xs ${config.bg} ${config.text}`}
            >
              {config.icon}
            </span>
            <span
              className={`text-2xl font-black tracking-tight ${config.text}`}
            >
              {data.changePercent > 0 ? "+" : ""}
              {data.changePercent}%
            </span>
          </div>
        </div>
      </div>

      {/* Sparkline */}
      <div className="h-[60px] w-full -ml-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data.sparkline}>
            <Line
              type="monotone"
              dataKey="score"
              stroke={config.color}
              strokeWidth={3}
              dot={{ r: 3, fill: config.color, strokeWidth: 0 }}
              activeDot={{ r: 5 }}
              isAnimationActive={true}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Forecast */}
      <div className="mt-2 text-xs font-semibold text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100">
        <span className="text-slate-400 font-bold uppercase text-[10px] block mb-0.5">
          Forecast
        </span>
        {data.forecast}
      </div>
    </div>
  );
}
