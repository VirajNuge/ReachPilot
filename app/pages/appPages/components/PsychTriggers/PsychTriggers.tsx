"use client";

import React, { useState } from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { FaBrain, FaExchangeAlt, FaRobot } from "react-icons/fa";
import { BsStars } from "react-icons/bs";
import { motion, AnimatePresence } from "framer-motion";

// --- Types ---
export interface TriggerData {
  trigger: string;
  score: number; // 0-100
  fullMark: number;
}

export interface PsychData {
  radarData: TriggerData[];
  winningTrigger: string;
  insight: string;
}

interface PsychTriggersProps {
  data?: PsychData;
}

// --- Component ---
const PsychTriggers: React.FC<PsychTriggersProps> = ({ data }) => {
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [userCaption, setUserCaption] = useState("");
  const [selectedTrigger, setSelectedTrigger] = useState("Scarcity");
  const [isGenerating, setIsGenerating] = useState(false);

  // Mock Data
  const safeData: PsychData = data || {
    radarData: [
      { trigger: "Authority", score: 80, fullMark: 100 },
      { trigger: "Scarcity", score: 40, fullMark: 100 },
      { trigger: "Social Proof", score: 90, fullMark: 100 },
      { trigger: "Reciprocity", score: 60, fullMark: 100 },
      { trigger: "Liking", score: 70, fullMark: 100 },
      { trigger: "Curiosity", score: 50, fullMark: 100 },
    ],
    winningTrigger: "Social Proof",
    insight:
      "This brand leans heavily into Social Proof. Their engagement spikes by 40% when they use testimonials or user results.",
  };

  const triggersList = [
    "Authority",
    "Scarcity",
    "Social Proof",
    "Reciprocity",
    "Liking",
    "Curiosity",
  ];

  const handleGenerateSwap = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      alert(
        `AI Suggestion for [${selectedTrigger}]:\n\n"${
          selectedTrigger === "Scarcity"
            ? "Only 3 spots left! Grab yours before midnight."
            : "Join 500+ happy customers who transformed their workflow."
        }"`,
      );
    }, 1500);
  };

  return (
    <div className="flex flex-col h-full w-full bg-white relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-6 pb-2">
        <div className="flex gap-3 items-center">
          <div className="bg-pink-50 p-2.5 rounded-xl text-pink-600">
            <FaBrain size={18} />
          </div>
          <div>
            <div className="relative group cursor-help">
              <h4 className="font-bold text-lg text-gray-900 leading-tight inline-block">
                Psychological Triggers
              </h4>
              {/* Tooltip */}
              <div className="absolute left-0 top-full mt-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none">
                <div className="font-bold mb-1 text-pink-300">
                  Why this matters:
                </div>
                Identifies the psychological levers used (e.g., FOMO, Authority)
                to understand *why* people are compelled to engage.
                <div className="absolute left-4 -top-1 w-2 h-2 bg-gray-900 transform rotate-45"></div>
              </div>
            </div>
            <p className="text-xs text-gray-500 font-medium">
              Intent Analysis (The "Why")
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-pink-100/50 rounded-full border border-pink-100 text-pink-700">
          <BsStars />
          <span className="text-[10px] uppercase font-bold tracking-wider">
            {safeData.winningTrigger}
          </span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row flex-1 p-6 gap-6 overflow-hidden">
        {/* Left: Radar Chart */}
        <div className="w-full lg:w-1/2 min-h-[250px] relative">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart
              cx="50%"
              cy="50%"
              outerRadius="70%"
              data={safeData.radarData}
            >
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis
                dataKey="trigger"
                tick={{ fill: "#6b7280", fontSize: 10, fontWeight: 600 }}
              />
              <PolarRadiusAxis
                angle={30}
                domain={[0, 100]}
                tick={false}
                axisLine={false}
              />
              <Radar
                name="Psych Profile"
                dataKey="score"
                stroke="#db2777"
                strokeWidth={2}
                fill="#db2777"
                fillOpacity={0.4}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "12px",
                  border: "none",
                  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                }}
                cursor={false}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Right: Insight & Action */}
        <div className="flex-1 flex flex-col gap-4">
          {/* Insight Box */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
              AI Observation
            </h5>
            <p className="text-sm text-gray-600 font-medium leading-relaxed">
              "{safeData.insight}"
            </p>
          </div>

          <div className="mt-auto">
            <button
              onClick={() => setShowSwapModal(true)}
              className="w-full py-3 bg-pink-600 hover:bg-pink-700 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.98]"
            >
              <FaExchangeAlt />
              Trigger Swap
            </button>
          </div>
        </div>
      </div>

      {/* --- Trigger Swap Modal --- */}
      <AnimatePresence>
        {showSwapModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-20 bg-white/95 backdrop-blur-md flex flex-col p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <FaExchangeAlt className="text-pink-500" /> Trigger Swap
              </h3>
              <button
                onClick={() => setShowSwapModal(false)}
                className="text-xs font-bold text-gray-500 hover:text-gray-900 underline"
              >
                Close
              </button>
            </div>

            <div className="flex flex-col gap-4 flex-1 overflow-y-auto custom-scroll pr-1">
              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1">
                  Your Draft Caption
                </label>
                <textarea
                  value={userCaption}
                  onChange={(e) => setUserCaption(e.target.value)}
                  placeholder="I have a new web development course available now..."
                  className="w-full p-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20 bg-gray-50 resize-none h-24"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1">
                  Target Trigger
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {triggersList.map((t) => (
                    <button
                      key={t}
                      onClick={() => setSelectedTrigger(t)}
                      className={`px-3 py-2 rounded-lg text-xs font-bold border transition-all ${selectedTrigger === t ? "bg-pink-50 border-pink-200 text-pink-700" : "bg-white border-gray-100 text-gray-600 hover:bg-gray-50"}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleGenerateSwap}
                disabled={!userCaption || isGenerating}
                className={`w-full py-3 mt-2 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md ${!userCaption || isGenerating ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-gray-900 hover:bg-black text-white active:scale-[0.98]"}`}
              >
                {isGenerating ? (
                  <BsStars className="animate-spin" />
                ) : (
                  <FaRobot />
                )}
                {isGenerating ? "Rewriting..." : "AI Rewrite"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PsychTriggers;
