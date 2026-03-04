import React, { useState } from "react";
import { CTAData } from "../../../../../lib/types/analysis";
import { FaBullhorn, FaRobot, FaCommentDots, FaFireAlt } from "react-icons/fa";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";

// --- Mock Data ---
const MOCK_CTA: CTAData = {
  mix: [
    { type: "Engagement", score: 30, fullMark: 100 },
    { type: "Bridge", score: 60, fullMark: 100 },
    { type: "Conversion", score: 20, fullMark: 100 },
    { type: "Conversation", score: 85, fullMark: 100 },
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

interface CTACommandProps {
  data?: CTAData;
}

export default function CTACommand({ data: apiData }: CTACommandProps) {
  const [data, setData] = useState<CTAData>(MOCK_CTA);

  React.useEffect(() => {
    if (apiData) {
      // If apiData has the new structure, use it directly.
      // We can check if 'mix' exists to be safe, or just cast if we trust the types.
      if (apiData.mix) {
        setData(apiData);
      } else {
        // Fallback for old data or partial updates (if any)
        // For now, we assume new data structure is enforced by parent
        setData(apiData);
      }
    }
  }, [apiData]);

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
    <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.05)] p-6 h-full flex flex-col relative overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-start mb-5">
        <div>
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
            Blueprint Intel
          </h4>
          <div className="relative group cursor-help inline-block">
            <h2 className="text-xl font-black text-[#000100] leading-none mb-1">
              CTA Command Center
            </h2>
            <div className="absolute left-0 top-full mt-2 w-64 p-3 bg-[#000100] text-white text-xs rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none">
              Decodes the hidden 'Ask' strategy. It breaks down how often they
              ask for Engagement vs. Sales, and identifies their top automation
              triggers.
              <div className="absolute left-4 -top-1 w-2 h-2 bg-[#000100] transform rotate-45"></div>
            </div>
          </div>
          <p className="text-xs font-medium text-slate-500">
            How they ask for action
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-full text-xs font-bold bg-[#f4f8fb] text-[#000100] border border-slate-200">
            {data.dominantStyle}
          </div>
          <div className="p-2.5 bg-[#074ed5] text-white rounded-2xl shadow-sm shrink-0 flex items-center justify-center">
            <FaBullhorn size={18} />
          </div>
        </div>
      </div>

      <div className="flex flex-col h-full overflow-hidden flex-1 relative gap-6">
        {/* Radar Chart: The Command Mix */}
        <div className="relative h-[200px] w-full -ml-4">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data.mix}>
              <PolarGrid stroke="#e2e8f0" />
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
                stroke="#074ed5"
                strokeWidth={2}
                fill="#074ed5"
                fillOpacity={0.15}
              />
            </RadarChart>
          </ResponsiveContainer>
          {/* Insight Overlay */}
          <div className="absolute top-0 right-0 w-[140px] text-xs text-slate-500 italic bg-white/95 p-2 rounded backdrop-blur-sm border border-slate-100 shadow-sm">
            Heavy focus on{" "}
            <strong className="text-[#074ed5] not-italic">Conversation</strong>.
            They want to talk, not just sell.
          </div>
        </div>

        {/* Automation Trigger Scan */}
        <div className="bg-[#f4f8fb] border border-slate-100 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#074ed5]/10 text-[#074ed5] rounded-lg">
              <FaRobot size={16} />
            </div>
            <div>
              <div className="text-xs font-bold text-[#074ed5] uppercase tracking-wider">
                Top Automation
              </div>
              <div className="font-bold text-[#000100]">
                Comment &quot;{data.topTrigger.keyword}&quot;
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-black text-[#074ed5]">
              {data.topTrigger.count}x
            </div>
            <div className="text-[10px] text-[#074ed5] font-bold uppercase">
              Last 30 Posts
            </div>
          </div>
        </div>

        {/* Urgency & Placement Grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* Urgency Meter */}
          <div className="p-3 border border-slate-100 rounded-xl bg-[#f4f8fb]">
            <div className="flex items-center gap-2 mb-2">
              <FaFireAlt className="text-[#074ed5]" />
              <span className="text-xs font-bold text-[#000100] uppercase">
                Urgency
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 mb-1">
              <div
                className="bg-[#074ed5] h-2 rounded-full"
                style={{ width: `${data.urgencyScore}%` }}
              ></div>
            </div>
            <div className="text-right text-[10px] font-bold text-slate-400">
              {data.urgencyScore}% High Pressure
            </div>
          </div>

          {/* Placement Stat */}
          <div className="p-3 border border-slate-100 rounded-xl bg-[#f4f8fb]">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">📍</span>
              <span className="text-xs font-bold text-[#000100] uppercase">
                Top Spot
              </span>
            </div>
            <div className="font-bold text-[#000100]">Bottom of Caption</div>
            <div className="text-[10px] text-[#caee55] font-bold">
              Standard Practice
            </div>
          </div>
        </div>

        {/* Global Insight Box */}
        <div className="mt-auto bg-[#f4f8fb] rounded-2xl border border-slate-100 p-4">
          <h4 className="text-[10px] font-bold text-[#074ed5] uppercase tracking-widest mb-1 flex items-center gap-1.5">
            <FaCommentDots size={10} /> AI Observation
          </h4>
          <p className="text-sm text-slate-500 font-medium leading-relaxed">
            Their strategy relies heavily on initiating DMs via automated
            comment triggers at the end of posts, pushing engagement before
            conversion.
          </p>
        </div>
      </div>
    </div>
  );
}
