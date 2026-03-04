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
// Strict approved palette
const COLORS = ["#074ed5", "#caee55", "#000100"];
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
      className="text-xs font-black"
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
    <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.05)] p-6 h-full flex flex-col relative overflow-hidden">
      {/* Header Row */}
      <div className="flex justify-between items-start mb-5">
        <div>
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
            DNA Extraction
          </h4>
          <h2 className="text-xl font-black text-[#000100] leading-none mb-1">
            Content Pillars
          </h2>
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-[#caee55]/20 rounded-full border border-[#caee55]/30 text-[#000100] mt-2 inline-flex w-fit">
            <FaMagic className="text-[#000100]" size={10} />
            <span className="text-[10px] uppercase font-bold tracking-wider">
              Secret Sauce
            </span>
          </div>
        </div>

        {/* Top Right Icon Badge */}
        <div className="p-2.5 bg-[#074ed5]/10 text-[#074ed5] rounded-2xl shadow-sm shrink-0">
          <BsCollectionFill size={18} />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row flex-1 gap-8 overflow-hidden">
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
                innerRadius={65}
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
                    strokeWidth={activePillar?.name === entry.name ? 6 : 0}
                    stroke="#fff"
                  />
                ))}
              </Pie>
              <RechartsTooltip
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
            </PieChart>
          </ResponsiveContainer>
          {/* Center Text */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center mt-1">
              <p className="text-3xl font-black text-[#000100] leading-none">
                {pillars.length}
              </p>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mt-1">
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
                className={`group w-full flex items-center justify-between p-3 rounded-2xl border transition-all ${
                  activePillar?.name === p.name
                    ? "bg-[#074ed5]/10 border-[#074ed5]/20 shadow-sm"
                    : "bg-white border-slate-100 hover:bg-[#f4f8fb]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full shadow-sm"
                    style={{ backgroundColor: p.color }}
                  />
                  <div className="text-left flex flex-col justify-center">
                    <p className="font-bold text-sm text-[#000100] leading-tight mb-0.5">
                      {p.name}
                    </p>
                    <p className="text-[10px] text-slate-500 font-medium leading-tight">
                      {p.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right flex flex-col justify-center">
                    <p className="text-xs font-black text-[#000100] leading-tight mb-0.5">
                      {p.avgEngagement}
                    </p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-tight">
                      Avg. Eng
                    </p>
                  </div>
                  <FaArrowRight
                    className={`text-slate-300 text-xs transition-transform ${
                      activePillar?.name === p.name
                        ? "text-[#074ed5] translate-x-1"
                        : "group-hover:translate-x-1"
                    }`}
                  />
                </div>
              </motion.button>
            ))}
          </div>

          {/* AI Summary Box */}
          <div className="mt-auto bg-[#f4f8fb] rounded-2xl p-4 border border-slate-100 relative overflow-hidden">
            <h4 className="text-[10px] font-bold text-[#074ed5] uppercase tracking-widest mb-1 items-center gap-1.5 flex">
              <BsLightningChargeFill
                className="text-[#074ed5] shrink-0"
                size={10}
              />{" "}
              The Secret Sauce
            </h4>
            <p className="text-sm text-slate-500 font-medium leading-relaxed">
              {aiSummary}
            </p>
          </div>

          {/* Action Button */}
          <button
            onClick={() => {
              if (onGenerateFormula) onGenerateFormula();
              setShowFormulaModal(true);
            }}
            className="w-full mt-2 py-3 bg-[#000100] hover:bg-black text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-[0_4px_14px_0_rgba(26,29,35,0.2)] active:scale-[0.98]"
          >
            <FaMagic className="text-[#caee55]" />
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
            className="absolute inset-0 z-20 bg-[#000100]/95 backdrop-blur-xl p-8 flex flex-col justify-center items-center text-center rounded-3xl"
          >
            <div className="bg-[#074ed5] p-4 rounded-3xl mb-6 shadow-2xl shadow-[#074ed5]/20">
              <FaMagic size={32} className="text-white" />
            </div>
            <h3 className="text-2xl font-black text-white mb-2 tracking-tight">
              Your "DNA" Formula
            </h3>
            <p className="text-slate-200 font-medium text-sm mb-8 max-w-sm">
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
              className="px-8 py-3 bg-[#074ed5] text-white rounded-2xl font-black transition-colors hover:bg-opacity-90 active:scale-[0.98]"
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
            className="absolute inset-0 z-10 bg-white/95 backdrop-blur-xl p-6 flex flex-col rounded-3xl"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded-full shadow-sm"
                  style={{ backgroundColor: activePillar.color }}
                />
                <div>
                  <h3 className="text-xl font-black text-[#000100]">
                    {activePillar.name} Deep Dive
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Best Performing Posts ({activePillar.count} total)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActivePillar(null)}
                className="p-2 hover:bg-[#f4f8fb] rounded-full transition-colors"
              >
                <IoMdClose size={24} className="text-slate-400" />
              </button>
            </div>

            {/* Posts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 overflow-y-auto pb-4 custom-scroll">
              {activePillar.topPosts?.map((post) => (
                <div
                  key={post.id}
                  className="group relative aspect-[4/5] bg-[#f4f8fb] rounded-2xl overflow-hidden border border-slate-100 cursor-pointer hover:shadow-md transition-all"
                >
                  {/* Thumbnail Placeholder */}
                  <div className="absolute inset-0 bg-slate-200 flex items-center justify-center text-slate-400">
                    {post.thumbnail ? (
                      <img
                        src={post.thumbnail}
                        alt="Post"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                        No Image
                      </span>
                    )}
                  </div>

                  {/* Overlay Info */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#000100]/90 via-[#000100]/40 to-transparent opacity-100 flex flex-col justify-end p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold bg-white/20 backdrop-blur-md text-white px-2 py-0.5 rounded-xl border border-white/10">
                        {post.type}
                      </span>
                      <span className="text-xs font-black text-[#caee55] flex items-center gap-1">
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
                <div className="col-span-3 text-center py-10 text-slate-400 font-medium">
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
