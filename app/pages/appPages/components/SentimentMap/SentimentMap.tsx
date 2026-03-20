import React, { useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import {
  FaFire,
  FaQuestionCircle,
  FaSearchDollar,
  FaExclamationTriangle,
  FaArrowRight,
} from "react-icons/fa";
import { TbAlertTriangle, TbBulb, TbTargetArrow, TbTrendingUp } from "react-icons/tb";
import { motion } from "framer-motion";

// --- Types ---

export type VibeType = "Fanboys" | "Seekers" | "Skeptics" | "Critics";

export interface VibeData {
  type: VibeType;
  percentage: number;
  count: number;
  keywords: string[]; // e.g., "Price?", "Love it"
  color: string;
  icon: React.ReactNode;
  description: string;
  [key: string]: any; // Index signature for Recharts compatibility
}

export interface CrowdAnalysisData {
  totalComments: number;
  vibeScore: number; // 0-10
  vibes: VibeData[];
  sentimentTrend: { post: number; score: number }[]; // For sparkline
}

const MOCK_CROWD_DATA: CrowdAnalysisData = {
  totalComments: 500,
  vibeScore: 8.5,
  sentimentTrend: [
    { post: 1, score: 7.2 },
    { post: 2, score: 6.8 },
    { post: 3, score: 8.5 },
    { post: 4, score: 8.1 },
    { post: 5, score: 9.0 },
  ],
  vibes: [
    {
      type: "Fanboys",
      percentage: 45,
      count: 225,
      keywords: ["amazing", "obsessed", "need this", "fire", "love"],
      color: "#0052FF",
      icon: <FaFire />,
      description: "Social Proof & Loyalty",
    },
    {
      type: "Seekers",
      percentage: 25,
      count: 125,
      keywords: ["price?", "shipping?", "compatible with X?", "how to"],
      color: "#caee55",
      icon: <FaQuestionCircle />,
      description: "Unmet Demand (High Intent)",
    },
    {
      type: "Skeptics",
      percentage: 20,
      count: 100,
      keywords: ["is this real", "competitor is cheaper", "reviews?"],
      color: "#000100",
      icon: <FaSearchDollar />,
      description: "Trust Barriers",
    },
    {
      type: "Critics",
      percentage: 10,
      count: 50,
      keywords: ["broken", "slow shipping", "no response", "bad service"],
      color: "#f4f8fb",
      icon: <FaExclamationTriangle />,
      description: "Vulnerabilities",
    },
  ],
};

/** Returns a strategic implication for a Seeker keyword */
function seekerSignal(keyword: string): string {
  const k = keyword.toLowerCase();
  if (k.includes("price") || k.includes("cost") || k.includes("how much"))
    return "High purchase intent — price transparency post would convert directly.";
  if (k.includes("ship") || k.includes("deliver"))
    return "Logistics anxiety — a delivery FAQ reel removes a key conversion blocker.";
  if (k.includes("compat") || k.includes("work with") || k.includes("support"))
    return "Integration doubt — a compatibility checklist post addresses the hidden objection.";
  if (k.includes("how") || k.includes("tutorial") || k.includes("guide"))
    return "Learning gap — a step-by-step walkthrough would capture this segment.";
  if (k.includes("refund") || k.includes("return") || k.includes("policy"))
    return "Risk aversion — a trust-first post (guarantee highlight) lowers the barrier.";
  return "Unmet information gap — a direct FAQ post for this topic would capture high-intent traffic.";
}

/** Returns a strategic implication for a Skeptic keyword */
function skepticSignal(keyword: string): string {
  const k = keyword.toLowerCase();
  if (k.includes("cheaper") || k.includes("expensive") || k.includes("worth"))
    return "Price-value objection — a value-stack comparison post directly counters this.";
  if (k.includes("real") || k.includes("legit") || k.includes("scam"))
    return "Trust deficit — social proof or behind-the-scenes content builds credibility.";
  if (k.includes("review"))
    return "Proof-seeking behaviour — a compiled testimonials post will address this cluster.";
  return "Doubt signal — addressing this openly in content turns skeptics into advocates.";
}

// --- Component ---

export default function SentimentMap({
  data = MOCK_CROWD_DATA,
}: {
  data?: CrowdAnalysisData;
}) {
  const [activeVibe, setActiveVibe] = useState<VibeType | null>(null);

  const safeVibes = data?.vibes || [];
  const seekers = safeVibes.find((v) => v.type === "Seekers");
  const skeptics = safeVibes.find((v) => v.type === "Skeptics");
  const critics = safeVibes.find((v) => v.type === "Critics");

  // Dominant signal group (highest %)
  const topVibe = [...safeVibes].sort((a, b) => b.percentage - a.percentage)[0];

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.05)] p-6 h-full flex flex-col relative overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-start mb-5">
        <div>
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
            Crowd Intelligence
          </h4>
          <div className="relative group cursor-help inline-block">
            <h2 className="text-xl font-black text-[#000100] leading-none mb-1">
              Sentiment Map
            </h2>
            <div className="absolute left-0 top-full mt-2 w-64 p-3 bg-[#000100] text-white text-xs rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none">
              <div className="font-bold mb-1 text-[#caee55]">
                Why this matters:
              </div>
              Decodes the "Vibe" of the audience. Moving beyond
              positive/negative to understand Intent (Buying vs. Browsing).
              <div className="absolute left-4 -top-1 w-2 h-2 bg-[#000100] transform rotate-45"></div>
            </div>
          </div>
          <p className="text-xs font-medium text-slate-500">
            Audience Vibe Decoder
          </p>
        </div>

        <div className="flex gap-3 items-start">
          <div className="text-right mt-1 mr-2">
            <div className="text-2xl font-bold text-[#000100] leading-none">
              {data.vibeScore}
            </div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Vibe Score
            </div>
          </div>
          <div className="p-2.5 bg-[#074ed5] text-white rounded-2xl shadow-sm shrink-0 flex items-center justify-center">
            <FaFire size={18} />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-5 flex-1 overflow-y-auto custom-scroll">
        {/* Top Section: Donut + Legend */}
        <div className="flex flex-col md:flex-row gap-6 items-center">
          {/* Donut Chart */}
          <div className="relative w-[160px] h-[160px] flex-shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={safeVibes}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="percentage"
                  onMouseEnter={(_, index) =>
                    setActiveVibe(safeVibes[index].type)
                  }
                  onMouseLeave={() => setActiveVibe(null)}
                >
                  {safeVibes.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      stroke="none"
                      style={{
                        filter:
                          activeVibe && activeVibe !== entry.type
                            ? "opacity(0.3)"
                            : "opacity(1)",
                        transition: "filter 0.3s ease",
                        cursor: "pointer",
                      }}
                    />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload as VibeData;
                      return (
                        <div className="bg-[#000100] text-white text-xs p-2 rounded-lg shadow-xl">
                          <span className="font-bold">{d.type}</span>:{" "}
                          {d.percentage}%
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold text-[#000100]">
                {data.totalComments}
              </span>
              <span className="text-[10px] text-slate-400 uppercase font-bold">
                Comments
              </span>
            </div>
          </div>

          {/* Legend / Stats */}
          <div className="grid grid-cols-2 gap-3 w-full">
            {safeVibes.map((v) => (
              <motion.div
                key={v.type}
                className={`p-2 rounded-xl border transition-all ${
                  activeVibe === v.type ? "ring-2 ring-offset-1" : ""
                }`}
                style={{
                  borderColor: activeVibe === v.type ? "#0052FF" : "#f1f5f9",
                  backgroundColor:
                    activeVibe === v.type
                      ? "rgba(7, 78, 213, 0.05)"
                      : "#f4f8fb",
                }}
                onMouseEnter={() => setActiveVibe(v.type)}
                onMouseLeave={() => setActiveVibe(null)}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span
                    style={{
                      color: v.color === "#f4f8fb" ? "#94a3b8" : v.color,
                    }}
                  >
                    {v.icon}
                  </span>
                  <span className="text-xs font-bold text-[#000100]">
                    {v.type}
                  </span>
                </div>
                <div className="flex items-end justify-between">
                  <span className="text-sm font-bold text-[#000100]">
                    {v.percentage}%
                  </span>
                  <span className="text-[10px] text-slate-400">{v.count}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Vibe Trend Sparkline */}
        <div className="p-4 bg-[#f4f8fb] border border-slate-100 rounded-2xl flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Vibe Trend (Last 5 Posts)
            </span>
            <span className="text-[#000100] bg-[#caee55]/30 px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-0.5">
              <FaArrowRight className="-rotate-45" size={10} /> +12%
            </span>
          </div>
          <div className="h-[44px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.sentimentTrend}>
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#0052FF"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={true}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="text-[10px] text-slate-400 text-center mt-2 font-medium">
            Critics are shrinking. Quality content is working.
          </div>
        </div>

        {/* ── Intent Hotspot (expanded) ── */}
        <div className="bg-[#f4f8fb] border border-slate-100 rounded-2xl p-4 flex flex-col gap-4">
          <div className="flex items-center gap-1.5">
            <TbTargetArrow className="text-[#074ed5]" size={13} />
            <h5 className="text-[10px] font-bold text-[#074ed5] uppercase tracking-widest">
              Intent Hotspot
            </h5>
          </div>

          {/* Dominant crowd signal */}
          {topVibe && (
            <div className="bg-white border border-slate-100 rounded-xl px-3 py-2.5 flex items-start gap-2">
              <TbTrendingUp className="text-[#074ed5] shrink-0 mt-0.5" size={13} />
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                  Dominant Signal
                </p>
                <p className="text-xs font-bold text-[#000100]">
                  {topVibe.percentage}% {topVibe.type} —{" "}
                  <span className="font-medium text-slate-500">
                    {topVibe.description}
                  </span>
                </p>
              </div>
            </div>
          )}

          {/* Seekers: high-intent unmet demand */}
          {seekers && seekers.keywords.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <FaQuestionCircle className="text-[#074ed5]" size={10} />
                <span className="text-[10px] font-bold text-[#074ed5] uppercase tracking-wider">
                  Seekers — {seekers.percentage}% · Unmet Demand
                </span>
              </div>
              <div className="flex flex-col gap-2">
                {seekers.keywords.map((kw, i) => (
                  <div
                    key={i}
                    className="bg-white border border-slate-100 rounded-xl px-3 py-2.5"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-[#000100]">
                        &ldquo;{kw}&rdquo;
                      </span>
                      <span className="text-[10px] font-bold text-[#074ed5] bg-[#074ed5]/8 px-2 py-0.5 rounded-full border border-[#074ed5]/15">
                        High Intent
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      {seekerSignal(kw)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skeptics: trust barriers */}
          {skeptics && skeptics.keywords.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <FaSearchDollar className="text-slate-500" size={10} />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Skeptics — {skeptics.percentage}% · Trust Barriers
                </span>
              </div>
              <div className="flex flex-col gap-2">
                {skeptics.keywords.map((kw, i) => (
                  <div
                    key={i}
                    className="bg-white border border-slate-100 rounded-xl px-3 py-2.5"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-[#000100]">
                        &ldquo;{kw}&rdquo;
                      </span>
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                        Doubt
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      {skepticSignal(kw)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Critics: vulnerabilities */}
          {critics && critics.keywords.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <TbAlertTriangle className="text-amber-500" size={12} />
                <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">
                  Critics — {critics.percentage}% · Vulnerabilities
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {critics.keywords.map((kw, i) => (
                  <div
                    key={i}
                    className="bg-amber-50 border border-amber-100 rounded-xl px-3 py-2 flex items-center gap-1.5"
                  >
                    <TbBulb className="text-amber-500 shrink-0" size={11} />
                    <span className="text-[11px] text-amber-800 font-medium">
                      {kw}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                These pain signals are publicly visible. Addressing them in
                content turns brand vulnerabilities into credibility moments.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
