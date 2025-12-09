"use client";

import React from "react";
import { GoDiamond } from "react-icons/go";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// --- Interfaces for Props ---

interface CadenceStat {
  title: string;
  youValue: string;
  compValue: string;
  insight: string; // e.g., "You post 2x less"
  isPositive: boolean;
}

interface DayData {
  day: string;
  You: number;
  Competitor: number;
  fullMark: number;
}

interface TimeData {
  timeBlock: string; // e.g., "Morning (6-12)", "Afternoon (12-6)"
  You: number;
  Competitor: number;
}

interface CadenceComparisonTabProps {
  cadenceStats: CadenceStat[];
  dayDistributionData: DayData[];
  timeDistributionData: TimeData[];
  cadenceInsights: string[];
}

const CadenceComparisonTab: React.FC<CadenceComparisonTabProps> = ({
  cadenceStats,
  dayDistributionData,
  timeDistributionData,
  cadenceInsights,
}) => {
  return (
    <div className="w-[630px] h-[1000px] bg-gray-50 font-sans overflow-y-auto p-6 border border-gray-200 rounded-xl mx-auto">
      {/* 1. Key Metrics Cards */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        {cadenceStats.map((stat, index) => (
          <div
            key={index}
            className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between"
          >
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
              {stat.title}
            </h4>
            <div className="flex justify-between items-end mb-2">
              <div>
                <span className="text-xs text-gray-400 block">You</span>
                <span className="text-lg font-bold text-blue-600 leading-none">
                  {stat.youValue}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs text-gray-400 block">Comp</span>
                <span className="text-lg font-bold text-purple-500 leading-none">
                  {stat.compValue}
                </span>
              </div>
            </div>
            <div
              className={`text-[10px] font-bold px-2 py-1 rounded-md text-center ${
                stat.isPositive
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {stat.insight}
            </div>
          </div>
        ))}
      </div>

      {/* 2. Day of Week Radar (The "Habit" Chart) */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-bold text-gray-900">
            Posting Habits by Day
          </h3>
          <span className="text-[10px] text-gray-400 bg-gray-50 px-2 py-1 rounded">
            Radial View
          </span>
        </div>

        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart
              cx="50%"
              cy="50%"
              outerRadius="75%"
              data={dayDistributionData}
            >
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis
                dataKey="day"
                tick={{ fill: "#4b5563", fontSize: 11, fontWeight: 600 }}
              />
              <PolarRadiusAxis
                angle={30}
                domain={[0, 100]}
                tick={false}
                axisLine={false}
              />
              <Radar
                name="You"
                dataKey="You"
                stroke="#2563eb" // Blue-600
                strokeWidth={2}
                fill="#3b82f6"
                fillOpacity={0.4}
              />
              <Radar
                name="Competitor"
                dataKey="Competitor"
                stroke="#c084fc" // Purple-400
                strokeWidth={2}
                fill="#d8b4fe"
                fillOpacity={0.4}
              />
              <Legend
                wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }}
                iconType="circle"
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "8px",
                  border: "none",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  fontSize: "12px",
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. Time of Day Distribution (Stacked Bar) */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
        <h3 className="text-sm font-bold text-gray-900 mb-4">
          Time of Day Preference
        </h3>
        <div className="h-[200px] w-full text-xs">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={timeDistributionData}
              layout="vertical" // Horizontal bars
              margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
              barCategoryGap={15}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                horizontal={false}
                stroke="#f3f4f6"
              />
              <XAxis type="number" hide />
              <YAxis
                dataKey="timeBlock"
                type="category"
                axisLine={false}
                tickLine={false}
                width={80}
                tick={{ fontSize: 10, fill: "#4b5563", fontWeight: 500 }}
              />
              <Tooltip
                cursor={{ fill: "transparent" }}
                contentStyle={{ borderRadius: "8px", border: "none" }}
              />
              <Legend iconType="circle" wrapperStyle={{ fontSize: "10px" }} />

              {/* Stacked Bars */}
              <Bar
                dataKey="You"
                stackId="a"
                fill="#3b82f6"
                radius={[0, 4, 4, 0]}
                barSize={20}
              />
              <Bar
                dataKey="Competitor"
                stackId="b"
                fill="#fda4af"
                radius={[0, 4, 4, 0]}
                barSize={20}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 4. Strategic Insights */}
      <div className="flex flex-col gap-2">
        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
          Strategic Opportunities
        </h4>
        {cadenceInsights.map((insight, index) => (
          <div
            key={index}
            className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex items-start gap-2"
          >
            <GoDiamond
              className="mt-1 flex-shrink-0 text-indigo-600"
              size={10}
            />
            <p className="text-xs font-medium text-gray-800 leading-relaxed">
              {insight}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CadenceComparisonTab;
