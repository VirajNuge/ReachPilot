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
      color: "#8b5cf6", // Violet-500
      icon: <FaFire />,
      description: "Social Proof & Loyalty",
    },
    {
      type: "Seekers",
      percentage: 25,
      count: 125,
      keywords: ["price?", "shipping?", "compatible with X?", "how to"],
      color: "#3b82f6", // Blue-500
      icon: <FaQuestionCircle />,
      description: "Unmet Demand (High Intent)",
    },
    {
      type: "Skeptics",
      percentage: 20,
      count: 100,
      keywords: ["is this real", "competitor is cheaper", "reviews?"],
      color: "#f59e0b", // Amber-500
      icon: <FaSearchDollar />,
      description: "Trust Barriers",
    },
    {
      type: "Critics",
      percentage: 10,
      count: 50,
      keywords: ["broken", "slow shipping", "no response", "bad service"],
      color: "#ef4444", // Red-500
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

  // Find the 'Seeker' data for the "Intent Hotspot"
  const safeVibes = data?.vibes || [];
  const seekers = safeVibes.find((v) => v.type === "Seekers");
  const topSeekerQuestion = seekers?.keywords[0] || "Pricing?";

  const handleGenerateContent = () => {
    setIsGenerating(true);
    setTimeout(() => {
      alert(
        "🚀 Content Ideas Generated:\n1. 'Yes, it works with Shopify!' (Reel)\n2. 'Price Breakdown: Why it's worth it.' (Carousel)\n3. 'Installation Guide in 30s' (Short)",
      );
      setIsGenerating(false);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-full w-full bg-white relative">
      {/* Header */}
      <div className="flex items-center justify-between p-6 pb-2">
        <div className="flex gap-3 items-center">
          <div className="bg-pink-50 p-2.5 rounded-xl text-pink-600">
            <FaFire size={18} />
          </div>
          <div>
            <div className="relative group cursor-help">
              <h4 className="font-bold text-lg text-gray-900 leading-tight inline-block">
                Sentiment Map
              </h4>
              {/* Tooltip */}
              <div className="absolute left-0 top-full mt-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none">
                <div className="font-bold mb-1 text-pink-300">
                  Why this matters:
                </div>
                Decodes the "Vibe" of the audience. Moving beyond
                positive/negative to understand Intent (Buying vs. Browsing).
                <div className="absolute left-4 -top-1 w-2 h-2 bg-gray-900 transform rotate-45"></div>
              </div>
            </div>
            <p className="text-xs text-gray-500 font-medium">
              Audience Vibe Decoder
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterMode(!filterMode)}
            className={`p-2 rounded-lg transition-colors border ${
              filterMode
                ? "bg-amber-50 text-amber-600 border-amber-200"
                : "bg-gray-50 text-gray-400 border-transparent hover:bg-gray-100"
            }`}
            title="Skeptic Filter: See only objections"
          >
            <FaFilter size={14} />
          </button>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900 leading-none">
              {data.vibeScore}
            </div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Vibe Score
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 pt-2 flex flex-col gap-6 h-full overflow-y-auto custom-scrollbar">
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
                        <div className="bg-gray-900 text-white text-xs p-2 rounded-lg shadow-xl">
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
              <span className="text-2xl font-bold text-gray-900">
                {data.totalComments}
              </span>
              <span className="text-[10px] text-gray-400 uppercase font-bold">
                Comments
              </span>
            </div>
          </div>

          {/* Legend / Stats */}
          <div className="grid grid-cols-2 gap-3 w-full">
            {safeVibes.map((v) => (
              <motion.div
                key={v.type}
                className={`p-2 rounded-xl border border-gray-100 bg-gray-50/50 cursor-pointer transition-all ${
                  activeVibe === v.type ? "ring-2 ring-offset-1" : ""
                }`}
                style={{
                  borderColor: activeVibe === v.type ? v.color : "transparent",
                  backgroundColor: activeVibe === v.type ? `${v.color}10` : "",
                }}
                onMouseEnter={() => setActiveVibe(v.type)}
                onMouseLeave={() => setActiveVibe(null)}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span style={{ color: v.color }}>{v.icon}</span>
                  <span className="text-xs font-bold text-gray-700">
                    {v.type}
                  </span>
                </div>
                <div className="flex items-end justify-between">
                  <span className="text-sm font-bold text-gray-900">
                    {v.percentage}%
                  </span>
                  <span className="text-[10px] text-gray-400">{v.count}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Intent Hotspot & Sparkline */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Intent Hotspot (Seekers focus) */}
          <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl relative overflow-hidden group">
            <div className="flex justify-between items-start mb-1">
              <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1">
                <FaQuestionCircle /> Intent Hotspot
              </span>
              <span className="text-[10px] text-blue-300 font-mono">
                {seekers?.percentage}% Vol
              </span>
            </div>
            <div className="text-blue-900 font-medium text-sm leading-snug mb-3 pr-2">
              "Most Seekers are asking about{" "}
              <span className="font-bold underline decoration-blue-300 decoration-2">
                {topSeekerQuestion}
              </span>
              "
            </div>

            {/* Convert Button */}
            <button
              onClick={handleGenerateContent}
              disabled={isGenerating}
              className="w-full py-1.5 px-3 bg-blue-500 hover:bg-blue-600 active:scale-95 text-white text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 shadow-sm shadow-blue-200"
            >
              {isGenerating ? (
                <>
                  <FaRobot className="animate-spin" /> Analyzing...
                </>
              ) : (
                <>
                  <FaRobot /> Convert Seekers
                </>
              )}
            </button>
          </div>

          {/* Sentiment Sparkline */}
          <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl flex flex-col justify-between">
            <div className="flex justify-between items-start mb-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Vibe Trend (Last 5)
              </span>
              {/* Mini Indicator */}
              <span className="text-green-500 text-xs font-bold flex items-center gap-0.5">
                <FaArrowRight className="-rotate-45" size={10} /> +12%
              </span>
            </div>
            <div className="h-[40px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.sentimentTrend}>
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={true}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="text-[10px] text-gray-400 text-center mt-1">
              Critics are shrinking 📉
            </div>
          </div>
        </div>

        {/* Skeptic Filter Overlay (Conditional) */}
        <AnimatePresence>
          {filterMode && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-amber-50 rounded-xl p-3 border border-amber-100 overflow-hidden"
            >
              <div className="flex items-center gap-2 mb-2 text-amber-700">
                <FaFilter size={12} />
                <span className="text-xs font-bold">
                  Skeptic Content Filter Active
                </span>
              </div>
              <ul className="space-y-2">
                <li className="text-xs bg-white p-2 rounded border border-amber-100 text-gray-600 italic">
                  "I saw a review saying the battery life is terrible. Is that
                  fixed?"
                </li>
                <li className="text-xs bg-white p-2 rounded border border-amber-100 text-gray-600 italic">
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
