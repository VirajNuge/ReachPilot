"use client";

import React, { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceDot,
  Label,
} from "recharts";
import { Sparkles, AlertCircle } from "lucide-react";
import type { PlatformKey } from "@/lib/analytics/platforms";
import type { AnomalyPoint, HistoryPoint, PredictionPoint } from "@/lib/analytics/types";
import { HISTORY_DATA, PREDICTION_DATA, ANOMALY_DATA } from "./mockData";

interface GrowthChartProps {
  platform: PlatformKey;
  history?: HistoryPoint[];
  prediction?: PredictionPoint[];
  anomalies?: AnomalyPoint[];
}

export default function GrowthChart({ platform, history, prediction, anomalies }: GrowthChartProps) {
  const [showForecast, setShowForecast] = useState(false);
  const [showAnomalies, setShowAnomalies] = useState(true); // Default ON

  const baseHistory = history ?? HISTORY_DATA;
  const basePrediction = prediction ?? PREDICTION_DATA;
  const baseAnomalies = anomalies ?? ANOMALY_DATA;

  const chartData = showForecast
    ? [...baseHistory, ...basePrediction.slice(1)]
    : baseHistory;

  const colors: Record<string, string> = {
    linkedin: "#0077B5",
    twitter: "#000000",
    instagram: "#E1306C",
    facebook: "#1877F2",
    threads: "#333333",
    pinterest: "#E60023",
  };

  // Custom Tooltip for Anomalies
  const CustomTooltip = ({ active, payload, label }: any) => {
    // Check if this date has an anomaly
    const anomaly = baseAnomalies.find((a) => a.date === label);

    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-2xl shadow-xl border border-slate-100 max-w-[250px] z-50">
          <p className="text-xs font-bold text-slate-400 mb-1">{label}</p>
          <p className="text-sm font-bold text-slate-900 mb-2">
            {payload[0].value} Followers
          </p>

          {/* ⭐ AI DIAGNOSIS */}
          {showAnomalies && anomaly && (
            <div
              className={`text-xs p-2 rounded-lg border ${
                anomaly.type === "spike"
                  ? "bg-green-50 border-green-100 text-green-800"
                  : "bg-red-50 border-red-100 text-red-800"
              }`}
            >
              <div className="flex items-center gap-1 font-bold mb-1">
                <span>{anomaly.icon}</span>
                {anomaly.type === "spike" ? "Viral Spike" : "Anomaly Detected"}
              </div>
              <p className="leading-relaxed opacity-90">{anomaly.reason}</p>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.05)] h-[420px] flex flex-col relative overflow-hidden group">
      {/* Header Controls */}
      <div className="mb-6 flex justify-between items-start z-10 relative">
        <div>
          <h3 className="text-lg font-bold text-[#000100] flex items-center gap-2">
            Audience Growth
            {showAnomalies && (
              <span className="px-2 py-0.5 bg-[#0052FF]/10 text-[#0052FF] text-[10px] rounded-full uppercase tracking-wider">
                AI Active
              </span>
            )}
          </h3>
          <p className="text-sm text-slate-500">
            {platform === "all"
              ? "Cumulative growth"
              : `Net growth on ${platform}`}
          </p>
        </div>

        <div className="flex gap-2">
          {/* Anomaly Toggle */}
          <button
            onClick={() => setShowAnomalies(!showAnomalies)}
            className={`p-2.5 rounded-full transition-all border ${
              showAnomalies
                ? "bg-[#0052FF]/10 text-[#0052FF] border-[#0052FF]/20"
                : "text-slate-400 border-slate-200"
            }`}
            title="Toggle AI Anomaly Detection"
          >
            <AlertCircle size={16} />
          </button>

          {/* Forecast Toggle */}
          <button
            onClick={() => setShowForecast(!showForecast)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
              showForecast
                ? "bg-[#0052FF] text-white border-[#0052FF] shadow-md ring-2 ring-[#0052FF]/10"
                : "bg-white text-slate-500 border-slate-200 hover:border-[#0052FF]/30"
            }`}
          >
            <Sparkles
              size={12}
              className={showForecast ? "animate-pulse" : ""}
            />
            {showForecast ? "AI Forecast" : "Forecast"}
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 relative z-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              {Object.entries(colors).map(([key, color]) => (
                <linearGradient
                  key={key}
                  id={`color-${key}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor={color} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#E5E7EB"
            />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#9CA3AF" }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#9CA3AF" }}
            />

            <Tooltip content={<CustomTooltip />} />

            {/* Render Areas */}
            {platform === "all" ? (
              Object.keys(colors).map((key) => (
                <Area
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stackId="1"
                  stroke={colors[key]}
                  fill={`url(#color-${key})`}
                />
              ))
            ) : (
              <Area
                type="monotone"
                dataKey={platform}
                stroke={colors[platform] || "#0052FF"}
                fill={`url(#color-${platform})`}
                strokeWidth={3}
              />
            )}

            {/* ⭐ RENDER ANOMALY MARKERS */}
            {showAnomalies &&
              baseAnomalies.map((anomaly, idx) => (
                <ReferenceDot
                  key={idx}
                  x={anomaly.date}
                  y={anomaly.value} // You might need to sum values if platform='all' to place dot correctly, for simplicity we assume visual placement matches mock
                  r={6}
                  fill={anomaly.type === "spike" ? "#10B981" : "#EF4444"}
                  stroke="white"
                  strokeWidth={2}
                  ifOverflow="extendDomain"
                >
                  <Label
                    value={anomaly.icon}
                    position="top"
                    offset={10}
                    style={{ fontSize: "16px" }}
                  />
                </ReferenceDot>
              ))}

            {showForecast && (
              <ReferenceLine
                x="Nov 30"
                stroke="#6366F1"
                strokeDasharray="3 3"
                label={{
                  position: "top",
                  value: "Today",
                  fill: "#6366F1",
                  fontSize: 10,
                  fontWeight: 700,
                }}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
