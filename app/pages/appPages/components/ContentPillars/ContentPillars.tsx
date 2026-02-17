"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from "recharts";
import { BsCollectionFill, BsLightningChargeFill } from "react-icons/bs";
import { FaMagic, FaArrowRight } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";

// --- Types ---
export interface PillarPost {
  id: string;
  thumbnail?: string; // URL or placeholder
  type: "Reel" | "Carousel" | "Image" | "Video";
  engagementRate: string;
  captionSnippet: string;
}

export interface PillarData {
  name: string;
  percentage: number;
  count: number;
  avgEngagement: string;
  color: string;
  description: string; // e.g., "Tutorials, How-to"
  topPosts: PillarPost[];
}

interface ContentPillarsProps {
  pillars?: PillarData[];
  aiSummary?: string;
  onGenerateFormula?: () => void;
  strategyFormula?: string; // New: Detailed formula text
}

// --- Colors & Config ---
const COLORS = ["#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#3b82f6"];
const RADIAN = Math.PI / 180;

const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  if (percent < 0.05) return null; // Hide if too small

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      className="text-[10px] font-bold"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const ContentPillars: React.FC<ContentPillarsProps> = ({
  pillars = [],
  aiSummary = "Analyzing strategy...",
  onGenerateFormula,
  strategyFormula,
}) => {
  const [activePillar, setActivePillar] = useState<PillarData | null>(null);
  const [showFormulaModal, setShowFormulaModal] = useState(false);

  // Normalize data for chart if not provided
  const chartData = pillars.map((p, i) => ({
    ...p,
    color: p.color || COLORS[i % COLORS.length],
  }));

  return (
    <div className="flex flex-col h-full w-full bg-white relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-6 pb-2">
        <div className="flex gap-3 items-center">
          <div className="bg-indigo-50 p-2.5 rounded-xl text-indigo-600">
            <BsCollectionFill size={18} />
          </div>
          <div>
            <div className="relative group cursor-help">
              <h4 className="font-bold text-lg text-gray-900 leading-tight inline-block">
                DNA Extraction
              </h4>
              {/* Tooltip */}
              <div className="absolute left-0 top-full mt-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none">
                <div className="font-bold mb-1 text-indigo-300">
                  Why this matters:
                </div>
                Visualizes the core themes of the strategy. A balanced mix
                prevents audience fatigue and builds long-term authority.
                <div className="absolute left-4 -top-1 w-2 h-2 bg-gray-900 transform rotate-45"></div>
              </div>
            </div>
            <p className="text-xs text-gray-500 font-medium">Content Pillars</p>
          </div>
        </div>
        {/* Secret Sauce Label */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-amber-50 to-orange-50 border border-orange-100 rounded-full">
          <FaMagic className="text-orange-400 text-xs" />
          <span className="text-[10px] uppercase font-bold text-orange-600 tracking-wider">
            Secret Sauce
          </span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row flex-1 p-6 gap-8 overflow-hidden">
        {/* Left: The "Strategy Donut" */}
        <div className="relative w-full lg:w-1/3 min-h-[250px] flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={100}
                innerRadius={60}
                fill="#8884d8"
                dataKey="percentage"
                stroke="none"
                onClick={(data) => setActivePillar(data.payload)}
                cursor="pointer"
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    className="hover:opacity-80 transition-opacity duration-300 focus:outline-none"
                    strokeWidth={activePillar?.name === entry.name ? 4 : 0}
                    stroke="#fff"
                  />
                ))}
              </Pie>
              <RechartsTooltip />
            </PieChart>
          </ResponsiveContainer>
          {/* Center Text */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <p className="text-3xl font-black text-gray-800">
                {pillars.length}
              </p>
              <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wide">
                Pillars
              </p>
            </div>
          </div>
        </div>

        {/* Right: List & Summary */}
        <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-1 custom-scroll">
          {/* List of Pillars */}
          <div className="flex flex-col gap-2">
            {chartData.map((p, idx) => (
              <motion.button
                key={idx}
                whileHover={{ scale: 1.01, x: 2 }}
                onClick={() => setActivePillar(p)}
                className={`group w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
                  activePillar?.name === p.name
                    ? "bg-indigo-50/50 border-indigo-200 shadow-sm"
                    : "bg-white border-gray-100 hover:border-gray-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full shadow-sm"
                    style={{ backgroundColor: p.color }}
                  />
                  <div className="text-left">
                    <p className="font-bold text-sm text-gray-800">{p.name}</p>
                    <p className="text-[11px] text-gray-400">{p.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-xs font-bold text-gray-700">
                      {p.avgEngagement}
                    </p>
                    <p className="text-[10px] text-gray-400">Avg. Eng</p>
                  </div>
                  <FaArrowRight
                    className={`text-gray-300 text-xs transition-transform ${
                      activePillar?.name === p.name
                        ? "text-indigo-500 translate-x-1"
                        : "group-hover:translate-x-1"
                    }`}
                  />
                </div>
              </motion.button>
            ))}
          </div>

          {/* AI Summary Box */}
          <div className="mt-auto bg-gray-50 rounded-2xl p-4 border border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-2 opacity-10">
              <FaMagic size={60} />
            </div>
            <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
              <BsLightningChargeFill className="text-yellow-500" />
              The Secret Sauce
            </h5>
            <p className="text-sm text-gray-600 italic leading-relaxed">
              "{aiSummary}"
            </p>
          </div>

          {/* Action Button */}
          <button
            onClick={() => {
              if (onGenerateFormula) onGenerateFormula();
              setShowFormulaModal(true);
            }}
            className="w-full mt-2 py-3 bg-gray-900 hover:bg-black text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl active:scale-[0.98]"
          >
            <FaMagic className="text-indigo-400" />
            Generate My Formula
          </button>
        </div>
      </div>

      {/* --- Formula Modal --- */}
      <AnimatePresence>
        {showFormulaModal && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute inset-0 z-20 bg-gray-900/95 backdrop-blur-xl p-8 flex flex-col justify-center items-center text-center"
          >
            <div className="bg-indigo-600 p-4 rounded-3xl mb-6 shadow-2xl shadow-indigo-500/20">
              <FaMagic size={32} className="text-white" />
            </div>
            <h3 className="text-2xl font-black text-white mb-2">
              Your "DNA" Formula
            </h3>
            <p className="text-indigo-200 text-sm mb-8 max-w-sm">
              We've analyzed your top performing Content Pillars to create your
              optimal growth strategy.
            </p>

            <div className="bg-white/10 border border-white/10 rounded-2xl p-6 mb-8 w-full max-w-md">
              <p className="text-white text-lg font-medium leading-relaxed">
                {strategyFormula ||
                  aiSummary ||
                  "Focus on Educational content to build authority, mixed with 20% Personal stories."}
              </p>
            </div>

            <button
              onClick={() => setShowFormulaModal(false)}
              className="px-8 py-3 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl font-bold transition-colors"
            >
              Got it!
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- Deep Dive Overlay (Modal) --- */}
      <AnimatePresence>
        {activePillar && (
          <motion.div
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="absolute inset-0 z-10 bg-white/95 backdrop-blur-xl p-6 flex flex-col"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded-full shadow-sm"
                  style={{ backgroundColor: activePillar.color }}
                />
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {activePillar.name} Deep Dive
                  </h3>
                  <p className="text-xs text-gray-500 font-medium">
                    Best Performing Posts ({activePillar.count} total)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActivePillar(null)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <IoMdClose size={24} className="text-gray-500" />
              </button>
            </div>

            {/* Posts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 overflow-y-auto pb-4 custom-scroll">
              {activePillar.topPosts?.map((post) => (
                <div
                  key={post.id}
                  className="group relative aspect-[4/5] bg-gray-100 rounded-xl overflow-hidden border border-gray-200 cursor-pointer hover:shadow-md transition-all"
                >
                  {/* Thumbnail Placeholder */}
                  <div className="absolute inset-0 bg-gray-200 flex items-center justify-center text-gray-400">
                    {post.thumbnail ? (
                      <img
                        src={post.thumbnail}
                        alt="Post"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-xs font-medium">No Image</span>
                    )}
                  </div>

                  {/* Overlay Info */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90 flex flex-col justify-end p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold bg-white/20 backdrop-blur-md text-white px-2 py-0.5 rounded-full border border-white/10">
                        {post.type}
                      </span>
                      <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                        <BsLightningChargeFill /> {post.engagementRate}
                      </span>
                    </div>
                    <p className="text-xs text-white/90 line-clamp-2 font-medium leading-relaxed">
                      {post.captionSnippet}
                    </p>
                  </div>
                </div>
              ))}
              {(!activePillar.topPosts ||
                activePillar.topPosts.length === 0) && (
                <div className="col-span-3 text-center py-10 text-gray-400">
                  No posts found for this pillar.
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ContentPillars;
