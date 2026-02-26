"use client";

import React from "react";
import { motion } from "framer-motion";
import {
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

interface RecentPostDataPoint {
  post: string;
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
  recentPostsTrendData: RecentPostDataPoint[];
  interactionsData: InteractionDataPoint[];
}

const EngagementComparisonTab: React.FC<EngagementComparisonTabProps> = ({
  statsCards,
  recentPostsTrendData,
  interactionsData,
}) => {
  const cardVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        delay: i * 0.1,
        duration: 0.35,
        ease: "easeOut" as const,
      },
    }),
  };

  return (
    <div className="w-[630px] h-[1000px] bg-gray-50 font-sans overflow-y-auto p-6 border border-gray-200 rounded-xl mx-auto">
      <div className="mb-6">
        {/* Stats Cards Grid with Animations */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {statsCards.map((stat, index) => (
            <motion.div
              key={index}
              className="bg-white p-4 rounded-xl shadow-sm border border-gray-100"
              custom={index}
              initial="hidden"
              animate="visible"
              variants={cardVariants}
              whileHover={{
                y: -2,
                boxShadow: "0 8px 25px rgba(0,0,0,0.08)",
                transition: { duration: 0.15 },
              }}
            >
              <h4 className="text-sm font-bold text-gray-900 mb-3">
                {stat.title}
              </h4>
              <div className="flex items-center gap-2 mb-2">
                <motion.span
                  className="px-3 py-1 bg-[#dcfce7] text-[#166534] text-xs font-bold rounded-full"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                >
                  You : {stat.youValue}
                </motion.span>
                <motion.span
                  className="px-3 py-1 bg-[#fee2e2] text-[#991b1b] text-xs font-bold rounded-full"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.25 + index * 0.1 }}
                >
                  Comp : {stat.compValue}
                </motion.span>
              </div>
              <motion.div
                className={`text-xs font-bold px-3 py-1 rounded-full w-max mt-2 ${
                  stat.winner === "You"
                    ? "bg-[#dcfce7] text-[#166534]"
                    : "bg-[#fee2e2] text-[#991b1b]"
                }`}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                  delay: 0.35 + index * 0.1,
                  type: "spring",
                  stiffness: 300,
                }}
              >
                {stat.winner === "You" ? "🏆 You Win" : "Competitor Wins"}
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Chart 1 - Recent Posts Consistency */}
        <motion.div
          className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-gray-900">
              Recent Posts Consistency (Last 12 Posts)
            </h3>
            <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-1 rounded">
              Newest → Oldest
            </span>
          </div>

          <motion.div
            className="h-[250px] w-full text-xs"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <ResponsiveContainer width="100%" height="100%">
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
                  vertical={false}
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
                  domain={[0, "auto"]}
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
          </motion.div>
        </motion.div>

        {/* Chart 2: Average Interactions per Post */}
        <motion.div
          className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
        >
          <h3 className="text-sm font-bold text-gray-900 mb-4">
            Average Interactions per Post
          </h3>
          <motion.div
            className="h-[250px] w-full text-xs"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
          >
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
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default EngagementComparisonTab;
