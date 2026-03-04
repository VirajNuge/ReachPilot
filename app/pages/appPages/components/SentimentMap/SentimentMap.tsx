import React, { useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  YAxis,
} from "recharts";
import {
  FaFire,
  FaQuestionCircle,
  FaSearchDollar,
  FaExclamationTriangle,
  FaRobot,
  FaFilter,
  FaArrowRight,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

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
      color: "#074ed5", // Primary blue
      icon: <FaFire />,
      description: "Social Proof & Loyalty",
    },
    {
      type: "Seekers",
      percentage: 25,
      count: 125,
      keywords: ["price?", "shipping?", "compatible with X?", "how to"],
      color: "#caee55", // Lime highlight
      icon: <FaQuestionCircle />,
      description: "Unmet Demand (High Intent)",
    },
    {
      type: "Skeptics",
      percentage: 20,
      count: 100,
      keywords: ["is this real", "competitor is cheaper", "reviews?"],
      color: "#000100", // Dark text
      icon: <FaSearchDollar />,
      description: "Trust Barriers",
    },
    {
      type: "Critics",
      percentage: 10,
      count: 50,
      keywords: ["broken", "slow shipping", "no response", "bad service"],
      color: "#f4f8fb", // Inset bg (looks light gray)
      icon: <FaExclamationTriangle />,
      description: "Vulnerabilities",
    },
  ],
};

// --- Component ---

export default function SentimentMap({
  data = MOCK_CROWD_DATA,
}: {
  data?: CrowdAnalysisData;
}) {
  const [activeVibe, setActiveVibe] = useState<VibeType | null>(null);
  const [filterMode, setFilterMode] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [contentIdeas, setContentIdeas] = useState<string[]>([]);

  // Find the 'Seeker' data for the "Intent Hotspot"
  const safeVibes = data?.vibes || [];
  const seekers = safeVibes.find((v) => v.type === "Seekers");
  const topSeekerQuestion = seekers?.keywords[0] || "Pricing?";

  const handleGenerateContent = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setContentIdeas([
        "'Yes, it works with Shopify!' (Reel)",
        "'Price Breakdown: Why it's worth it.' (Carousel)",
        "'Installation Guide in 30s' (Short)",
      ]);
      setIsGenerating(false);
    }, 1500);
  };

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
            {/* Tooltip */}
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
          {/* Top Right Icon Badge */}
          <div className="p-2.5 bg-[#074ed5] text-white rounded-2xl shadow-sm shrink-0 flex items-center justify-center">
            <FaFire size={18} />
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-6 flex-1 overflow-y-auto custom-scroll">
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
                      const data = payload[0].payload as VibeData;
                      return (
                        <div className="bg-[#000100] text-white text-xs p-2 rounded-lg shadow-xl">
                          <span className="font-bold">{data.type}</span>:{" "}
                          {data.percentage}%
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Label */}
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
                  borderColor: activeVibe === v.type ? "#074ed5" : "#f1f5f9",
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

        {/* Intent Hotspot & Sparkline */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Intent Hotspot (Seekers focus) */}
          <div className="p-4 bg-[#f4f8fb] border border-slate-100 rounded-2xl relative overflow-hidden group flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-1">
                <span className="text-[10px] font-bold text-[#074ed5] uppercase tracking-wider flex items-center gap-1">
                  <FaQuestionCircle /> Intent Hotspot
                </span>
                <span className="text-[10px] text-[#074ed5] font-mono font-bold">
                  {seekers?.percentage}% Vol
                </span>
              </div>
              <div className="text-slate-500 font-medium text-sm leading-snug mb-3 pr-2">
                "Most Seekers are asking about{" "}
                <span className="font-bold text-[#000100] underline decoration-[#caee55] decoration-2">
                  {topSeekerQuestion}
                </span>
                "
              </div>
            </div>

            {contentIdeas.length > 0 && (
              <div className="mb-3 text-xs text-[#000100] bg-white p-2 rounded-xl border border-slate-200">
                <div className="font-bold text-[#074ed5] mb-1 text-[10px] uppercase">
                  Generated ideas:
                </div>
                <ul className="list-disc pl-4 space-y-1">
                  {contentIdeas.map((idea, idx) => (
                    <li key={idx}>{idea}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Convert Button */}
            <button
              onClick={handleGenerateContent}
              disabled={isGenerating || contentIdeas.length > 0}
              className="w-full py-3 bg-[#074ed5] hover:bg-[#0041CC] text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-[0_4px_14px_0_rgba(7,78,213,0.39)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-auto"
            >
              {isGenerating ? (
                <>
                  <FaRobot className="animate-spin" /> Analyzing...
                </>
              ) : contentIdeas.length > 0 ? (
                <>
                  <FaRobot /> Strategy Generated
                </>
              ) : (
                <>
                  <FaRobot /> Convert Seekers
                </>
              )}
            </button>
          </div>

          {/* Sentiment Sparkline & Skeptic Filter */}
          <div className="flex flex-col gap-3">
            <div className="p-4 bg-[#f4f8fb] border border-slate-100 rounded-2xl flex flex-col justify-between flex-1">
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Vibe Trend (Last 5)
                </span>
                {/* Mini Indicator */}
                <span className="text-[#000100] bg-[#caee55]/30 px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-0.5">
                  <FaArrowRight className="-rotate-45" size={10} /> +12%
                </span>
              </div>
              <div className="h-[50px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.sentimentTrend}>
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="#074ed5"
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

            {/* Better Filter Button Design */}
            <button
              onClick={() => setFilterMode(!filterMode)}
              className={`p-3 rounded-2xl text-xs font-bold transition-all border w-full flex items-center justify-center gap-2 ${
                filterMode
                  ? "bg-[#074ed5]/10 text-[#074ed5] border-[#074ed5]/30"
                  : "bg-white text-slate-500 border-slate-200 hover:bg-[#f4f8fb]"
              }`}
            >
              <FaFilter size={12} />
              {filterMode ? "Disable Skeptic Filter" : "Enable Skeptic Filter"}
            </button>
          </div>
        </div>

        {/* Skeptic Filter Overlay (Conditional) */}
        <AnimatePresence>
          {filterMode && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-[#f4f8fb] rounded-2xl p-4 border border-slate-100 overflow-hidden"
            >
              <div className="flex items-center gap-2 mb-3 text-[#074ed5]">
                <FaFilter size={14} />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Skeptic Content Filter Active
                </span>
              </div>
              <ul className="space-y-2">
                <li className="text-sm bg-white p-3 rounded-xl border border-slate-100 text-slate-500 font-medium italic">
                  "I saw a review saying the battery life is terrible. Is that
                  fixed?"
                </li>
                <li className="text-sm bg-white p-3 rounded-xl border border-slate-100 text-slate-500 font-medium italic">
                  "Seems expensive for just a PDF wrapper..."
                </li>
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
