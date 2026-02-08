import React from "react";
import {
  FaBullhorn,
  FaRobot,
  FaCommentDots,
  FaLink,
  FaShoppingCart,
  FaFireAlt,
} from "react-icons/fa";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";

// --- Types ---
export type CTAType = "Engagement" | "Bridge" | "Conversion" | "Conversation";

export interface CTAData {
  mix: { type: CTAType; score: number; fullMark: number }[];
  topTrigger: { keyword: string; count: number }; // e.g., "Comment 'GROWTH'"
  urgencyScore: number; // 0-100
  dominantStyle: "Hunter-Killer" | "Reach Hunter" | "Community Builder";
  placementHeatmap: {
    location: "First Line" | "Bottom" | "P.S.";
    count: number;
  }[];
}

// --- Mock Data ---
const MOCK_CTA: CTAData = {
  mix: [
    { type: "Engagement", score: 30, fullMark: 100 }, // Tag a friend
    { type: "Bridge", score: 60, fullMark: 100 }, // Link in bio
    { type: "Conversion", score: 20, fullMark: 100 }, // Buy now
    { type: "Conversation", score: 85, fullMark: 100 }, // DM me
  ],
  topTrigger: { keyword: "SCALE", count: 12 },
  urgencyScore: 75,
  dominantStyle: "Community Builder",
  placementHeatmap: [
    { location: "First Line", count: 2 },
    { location: "Bottom", count: 25 },
    { location: "P.S.", count: 3 },
  ],
};

// --- Component ---
export default function CTACommand() {
  const data = MOCK_CTA;

  // Custom Tick for Radar
  const renderTick = ({ payload, x, y, textAnchor, stroke, radius }: any) => {
    return (
      <g className="recharts-layer recharts-polar-angle-axis-tick">
        <text
          radius={radius}
          stroke={stroke}
          x={x}
          y={y}
          className="text-[10px] font-bold fill-gray-500 uppercase"
          textAnchor={textAnchor}
        >
          {payload.value}
        </text>
      </g>
    );
  };

  return (
    <div className="h-full bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col relative">
      {/* Header */}
      <div className="p-6 pb-2 border-b border-gray-50 flex justify-between items-start">
        <div className="flex gap-3">
          <div className="p-2.5 bg-orange-50 text-orange-600 rounded-xl h-fit">
            <FaBullhorn size={18} />
          </div>
          <div>
            <div className="relative group cursor-help">
              <h3 className="font-bold text-gray-900 text-lg border-b border-dashed border-gray-300 inline-block">
                CTA Command Center
              </h3>
              <div className="absolute left-0 top-full mt-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none">
                Decodes the hidden 'Ask' strategy. It breaks down how often they
                ask for Engagement vs. Sales, and identifies their top
                automation triggers.
                <div className="absolute -top-1 left-4 w-2 h-2 bg-gray-900 rotate-45"></div>
              </div>
            </div>
            <p className="text-sm text-gray-500">How they ask for action</p>
          </div>
        </div>
        <div className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700 border border-gray-200">
          style: {data.dominantStyle}
        </div>
      </div>

      <div className="p-6 pt-4 flex-1 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
        {/* Radar Chart: The Command Mix */}
        <div className="relative h-[200px] w-full -ml-4">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data.mix}>
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis dataKey="type" tick={renderTick} />
              <PolarRadiusAxis
                angle={30}
                domain={[0, 100]}
                tick={false}
                axisLine={false}
              />
              <Radar
                name="CTA Mix"
                dataKey="score"
                stroke="#f97316"
                strokeWidth={2}
                fill="#f97316"
                fillOpacity={0.2}
              />
            </RadarChart>
          </ResponsiveContainer>
          {/* Insight Overlay */}
          <div className="absolute top-0 right-0 w-[140px] text-xs text-gray-500 italic bg-white/80 p-2 rounded backdrop-blur-sm border border-gray-100 shadow-sm">
            "Heavy focus on{" "}
            <strong className="text-orange-600">Conversation</strong>. They want
            to talk, not just sell."
          </div>
        </div>

        {/* Automation Trigger Scan */}
        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
              <FaRobot size={16} />
            </div>
            <div>
              <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                Top Automation
              </div>
              <div className="font-bold text-indigo-900">
                Comment "{data.topTrigger.keyword}"
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-black text-indigo-600">
              {data.topTrigger.count}x
            </div>
            <div className="text-[10px] text-indigo-400 font-bold uppercase">
              Last 30 Posts
            </div>
          </div>
        </div>

        {/* Urgency & Placement Grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* Urgency Meter */}
          <div className="p-3 border border-gray-100 rounded-xl bg-gray-50">
            <div className="flex items-center gap-2 mb-2">
              <FaFireAlt className="text-red-500" />
              <span className="text-xs font-bold text-gray-500 uppercase">
                Urgency
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
              <div
                className="bg-gradient-to-r from-orange-400 to-red-500 h-2 rounded-full"
                style={{ width: `${data.urgencyScore}%` }}
              ></div>
            </div>
            <div className="text-right text-[10px] font-bold text-gray-400">
              {data.urgencyScore}% High Pressure
            </div>
          </div>

          {/* Placement Stat */}
          <div className="p-3 border border-gray-100 rounded-xl bg-gray-50">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">📍</span>
              <span className="text-xs font-bold text-gray-500 uppercase">
                Top Spot
              </span>
            </div>
            <div className="font-bold text-gray-900">Bottom of Caption</div>
            <div className="text-[10px] text-green-600 font-bold">
              Standard Practice
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
