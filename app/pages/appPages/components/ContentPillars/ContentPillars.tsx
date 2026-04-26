"use client";

import React, { useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from "recharts";
import type { PieLabelRenderProps } from "recharts";
import { BsCollectionFill, BsLightningChargeFill } from "react-icons/bs";
import { FaMagic, FaArrowRight, FaChartLine } from "react-icons/fa";
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
  strategyFormula?: string;
}

interface OptimalPillar {
  name: string;
  color: string;
  currentPct: number;
  idealPct: number;
  delta: number;
  engagementScore: number;
}

// --- Colors & Config ---
const COLORS = ["#0052FF", "#caee55", "#000100"];
const RADIAN = Math.PI / 180;

// --- Helpers ---
function parseEngagement(avg: string): number {
  const lower = avg.toLowerCase();
  if (lower === "high") return 8;
  if (lower === "medium") return 5;
  if (lower === "low") return 2;
  const num = parseFloat(avg.replace("%", ""));
  return isNaN(num) ? 3 : num;
}

function computeOptimalMix(pillars: PillarData[]): OptimalPillar[] {
  if (!pillars.length) return [];
  const engScores = pillars.map((p) => parseEngagement(p.avgEngagement));
  const totalEng = engScores.reduce((a, b) => a + b, 0) || 1;
  const rawIdeals = engScores.map((s) => (s / totalEng) * 100);
  // Round to nearest 5
  let rounded = rawIdeals.map((v) => Math.round(v / 5) * 5);
  // Normalize to sum = 100
  const diff = 100 - rounded.reduce((a, b) => a + b, 0);
  const maxIdx = engScores.indexOf(Math.max(...engScores));
  rounded[maxIdx] += diff;
  return pillars.map((p, i) => {
    const currentPct =
      p.percentage > 1 ? p.percentage : Math.round(p.percentage * 100);
    return {
      name: p.name,
      color: p.color,
      currentPct,
      idealPct: rounded[i],
      delta: rounded[i] - currentPct,
      engagementScore: engScores[i],
    };
  });
}

function buildWhyItWorks(optimal: OptimalPillar[]): string {
  if (!optimal.length) return "";
  const sorted = [...optimal].sort(
    (a, b) => b.engagementScore - a.engagementScore
  );
  const top = sorted[0];
  const bottom = sorted[sorted.length - 1];
  if (top.engagementScore === 0 || bottom.engagementScore === 0) return "";
  const ratio = (top.engagementScore / bottom.engagementScore).toFixed(1);
  return `${top.name} drives ${ratio}× more engagement per post than ${bottom.name} — reallocating volume here maximises your ROI without creating more content.`;
}

const renderCustomizedLabel = ({
  cx = 0,
  cy = 0,
  midAngle = 0,
  innerRadius = 0,
  outerRadius = 0,
  percent = 0,
}: PieLabelRenderProps) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  if (percent < 0.05) return null;

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

// --- Formula Portal Modal ---
interface FormulaModalProps {
  pillars: PillarData[];
  onClose: () => void;
}

const FormulaModal: React.FC<FormulaModalProps> = ({ pillars, onClose }) => {
  const optimal = computeOptimalMix(pillars);
  const whyItWorks = buildWhyItWorks(optimal);

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        transition={{ type: "spring", damping: 28, stiffness: 260 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#074ed5]/10 text-[#074ed5] rounded-2xl">
              <FaMagic size={18} />
            </div>
            <div>
              <h3 className="text-lg font-black text-[#000100] leading-tight">
                Your Optimal Content Mix
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Based on your engagement data — flip your strategy
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors shrink-0"
          >
            <IoMdClose size={20} className="text-slate-400" />
          </button>
        </div>

        {/* Column Headers */}
        <div className="px-6 pt-4 pb-2 grid grid-cols-[1fr_80px_80px_72px] gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          <span>Pillar</span>
          <span className="text-center">Current</span>
          <span className="text-center">Ideal</span>
          <span className="text-center">Change</span>
        </div>

        {/* Pillar Rows */}
        <div className="px-6 pb-4 flex flex-col gap-2">
          {optimal.map((item) => (
            <div
              key={item.name}
              className="grid grid-cols-[1fr_80px_80px_72px] gap-2 items-center bg-[#f4f8fb] rounded-2xl px-4 py-3 border border-slate-100"
            >
              {/* Name + dot */}
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm font-bold text-[#000100] truncate">
                  {item.name}
                </span>
              </div>

              {/* Current % */}
              <span className="text-sm font-black text-slate-500 text-center">
                {item.currentPct}%
              </span>

              {/* Ideal % */}
              <span className="text-sm font-black text-[#074ed5] text-center">
                {item.idealPct}%
              </span>

              {/* Delta badge */}
              <div className="flex justify-center">
                <span
                  className={`text-xs font-black px-2 py-0.5 rounded-xl ${
                    item.delta > 0
                      ? "bg-green-100 text-green-700"
                      : item.delta < 0
                      ? "bg-red-100 text-red-600"
                      : "bg-slate-200 text-slate-500"
                  }`}
                >
                  {item.delta > 0 ? `+${item.delta}%` : `${item.delta}%`}
                </span>
              </div>
            </div>
          ))}

          {optimal.length === 0 && (
            <p className="text-slate-400 text-sm text-center py-6">
              Not enough pillar data to compute formula.
            </p>
          )}
        </div>

        {/* Why It Works */}
        {whyItWorks && (
          <div className="mx-6 mb-4 bg-[#074ed5]/5 border border-[#074ed5]/15 rounded-2xl p-4 flex items-start gap-3">
            <FaChartLine
              className="text-[#074ed5] shrink-0 mt-0.5"
              size={14}
            />
            <div>
              <p className="text-[10px] font-bold text-[#074ed5] uppercase tracking-widest mb-1">
                Why it works
              </p>
              <p className="text-sm text-slate-600 font-medium leading-relaxed">
                {whyItWorks}
              </p>
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="px-6 pb-6">
          <button
            onClick={onClose}
            className="w-full py-3 bg-[#000100] hover:bg-black text-white rounded-2xl font-black text-sm transition-all active:scale-[0.98]"
          >
            Got it!
          </button>
        </div>
      </motion.div>
    </div>,
    document.body
  );
};

// --- Main Component ---
const ContentPillars: React.FC<ContentPillarsProps> = ({
  pillars = [],
  aiSummary = "Analyzing strategy...",
  onGenerateFormula,
}) => {
  const [activePillar, setActivePillar] = useState<PillarData | null>(null);
  const [showFormulaModal, setShowFormulaModal] = useState(false);

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
            className="w-full mt-2 py-3 bg-[#000100] hover:bg-black text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            <FaMagic className="text-[#caee55]" />
            Generate My Formula
          </button>
        </div>
      </div>

      {/* --- Formula Portal Modal --- */}
      <AnimatePresence>
        {showFormulaModal && (
          <FormulaModal
            pillars={chartData}
            onClose={() => setShowFormulaModal(false)}
          />
        )}
      </AnimatePresence>

      {/* --- Deep Dive Overlay (stays inside card — slide-up sheet) --- */}
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
              {activePillar.topPosts?.map((post) =>
                post.thumbnail ? (
                  // Image card — full aspect-ratio design
                  <div
                    key={post.id}
                    className="group relative aspect-[4/5] bg-[#f4f8fb] rounded-2xl overflow-hidden border border-slate-100 cursor-pointer hover:shadow-md transition-all"
                  >
                    <img
                      src={post.thumbnail}
                      alt="Post"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#000100]/90 via-[#000100]/40 to-transparent flex flex-col justify-end p-4">
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
                ) : (
                  // Text-only card — no image container
                  <div
                    key={post.id}
                    className="bg-[#f4f8fb] rounded-2xl border border-slate-100 p-4 flex flex-col gap-3 cursor-pointer hover:shadow-md transition-all hover:border-slate-200"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold bg-slate-200 text-slate-600 px-2 py-0.5 rounded-xl">
                        {post.type}
                      </span>
                      <span className="text-xs font-black text-[#074ed5] flex items-center gap-1">
                        <BsLightningChargeFill /> {post.engagementRate}
                      </span>
                    </div>
                    <p className="text-sm text-[#1A1D23] font-medium leading-relaxed">
                      {post.captionSnippet}
                    </p>
                  </div>
                )
              )}
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
