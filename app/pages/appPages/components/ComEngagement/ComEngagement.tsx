"use client";

import React from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

interface EngagementStat {
  title: string;
  youValue: string;
  compValue: string;
  winner: "You" | "Competitor";
}

// CHANGED: Renamed to match the new data logic
interface RecentPostDataPoint {
  post: string; // e.g., "P1" (Newest), "P2", etc.
  You: number;
  Competitor: number;
}

interface InteractionDataPoint {
  name: string;
  Likes: number;
  Comments: number;
  Shares: number;
}

interface EngagementComparisonTabProps {
  statsCards: EngagementStat[];
  recentPostsTrendData: RecentPostDataPoint[]; // <--- Updated Prop
  interactionsData: InteractionDataPoint[];
}

const EngagementComparisonTab: React.FC<EngagementComparisonTabProps> = ({
  statsCards,
  recentPostsTrendData,
  interactionsData,
}) => {
  return (
    <div className="w-[630px] h-[1000px] bg-gray-50 font-sans overflow-y-auto p-6 border border-gray-200 rounded-xl mx-auto">
      <div className="mb-6">
        {/* Stats Cards Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {statsCards.map((stat, index) => (
            <div
              key={index}
              className="bg-white p-4 rounded-xl shadow-sm border border-gray-100"
            >
              <h4 className="text-sm font-bold text-gray-900 mb-3">
                {stat.title}
              </h4>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 bg-[#dcfce7] text-[#166534] text-xs font-bold rounded-full">
                  You : {stat.youValue}
                </span>
                <span className="px-3 py-1 bg-[#fee2e2] text-[#991b1b] text-xs font-bold rounded-full">
                  Comp : {stat.compValue}
                </span>
              </div>
              <div
                className={`text-xs font-bold px-3 py-1 rounded-full w-max mt-2 ${
                  stat.winner === "You"
                    ? "bg-[#dcfce7] text-[#166534]"
                    : "bg-[#fee2e2] text-[#991b1b]"
                }`}
              >
                {stat.winner === "You" ? "You Wins" : "Competitor Wins"}
              </div>
            </div>
          ))}
        </div>

        {/* REPLACED: Chart 1 - Recent Posts Consistency */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-gray-900">
              Recent Posts Consistency (Last 12 Posts)
            </h3>
            <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-1 rounded">
              Newest → Oldest
            </span>
          </div>

          <div className="h-[250px] w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              {/* Changed to AreaChart for a slightly different "Trend" look */}
              <AreaChart
                data={recentPostsTrendData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorYou" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorComp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#fda4af" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#fda4af" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false} // Clean horizontal lines only
                  stroke="#e5e7eb"
                />
                <XAxis
                  dataKey="post"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: "#6b7280" }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: "#6b7280" }}
                  domain={[0, "auto"]} // Auto scale based on engagement
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                  labelStyle={{ color: "#6b7280", marginBottom: "5px" }}
                />
                <Legend
                  wrapperStyle={{ paddingTop: "20px" }}
                  iconType="circle"
                />
                <Area
                  type="monotone"
                  dataKey="You"
                  stroke="#6366f1"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorYou)"
                />
                <Area
                  type="monotone"
                  dataKey="Competitor"
                  stroke="#fda4af"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorComp)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Average Interactions per Post (Grouped Bar Chart) */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
          <h3 className="text-sm font-bold text-gray-900 mb-4">
            Average Interactions per Post
          </h3>
          <div className="h-[250px] w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={interactionsData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                barGap={4}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e5e7eb"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fontWeight: 500, fill: "#374151" }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: "#6b7280" }}
                />
                <Tooltip
                  cursor={{ fill: "transparent" }}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Legend
                  wrapperStyle={{ paddingTop: "20px" }}
                  iconType="circle"
                  iconSize={8}
                />
                <Bar
                  dataKey="Likes"
                  fill="#9381ff"
                  radius={[4, 4, 0, 0]}
                  barSize={30}
                />
                <Bar
                  dataKey="Comments"
                  fill="#fca5a5"
                  radius={[4, 4, 0, 0]}
                  barSize={30}
                />
                <Bar
                  dataKey="Shares"
                  fill="#67e8f9"
                  radius={[4, 4, 0, 0]}
                  barSize={30}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EngagementComparisonTab;
