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
import { PlatformKey } from "./types";
import { HISTORY_DATA, PREDICTION_DATA, ANOMALY_DATA } from "./mockData";

interface GrowthChartProps {
  platform: PlatformKey;
}

export default function GrowthChart({ platform }: GrowthChartProps) {
  const [showForecast, setShowForecast] = useState(false);
  const [showAnomalies, setShowAnomalies] = useState(true); // Default ON

  const chartData = showForecast
    ? [...HISTORY_DATA, ...PREDICTION_DATA.slice(1)]
    : HISTORY_DATA;

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
    const anomaly = ANOMALY_DATA.find((a) => a.date === label);

    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-xl shadow-xl border border-gray-100 max-w-[250px] z-50">
          <p className="text-xs font-bold text-gray-400 mb-1">{label}</p>
          <p className="text-sm font-bold text-gray-900 mb-2">
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
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm h-[420px] flex flex-col relative overflow-hidden group">
      {/* Header Controls */}
      <div className="mb-6 flex justify-between items-start z-10 relative">
        <div>
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            Audience Growth
            {showAnomalies && (
              <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] rounded-full uppercase tracking-wider">
                AI Active
              </span>
            )}
          </h3>
          <p className="text-sm text-gray-500">
            {platform === "all"
              ? "Cumulative growth"
              : `Net growth on ${platform}`}
          </p>
        </div>

        <div className="flex gap-2">
          {/* Anomaly Toggle */}
          <button
            onClick={() => setShowAnomalies(!showAnomalies)}
            className={`p-2 rounded-full transition-all border ${
              showAnomalies
                ? "bg-indigo-50 text-indigo-600 border-indigo-200"
                : "text-gray-400 border-gray-200"
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
                ? "bg-indigo-600 text-white border-indigo-600 shadow-md ring-2 ring-indigo-100"
                : "bg-white text-gray-500 border-gray-200 hover:border-indigo-300"
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
                stroke={colors[platform] || "#6366F1"}
                fill={`url(#color-${platform})`}
                strokeWidth={3}
              />
            )}

            {/* ⭐ RENDER ANOMALY MARKERS */}
            {showAnomalies &&
              ANOMALY_DATA.map((anomaly, idx) => (
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
