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
      { trigger: "FOMO", score: 40, fullMark: 100 },
      { trigger: "Social Proof", score: 90, fullMark: 100 },
      { trigger: "Reciprocity", score: 60, fullMark: 100 },
      { trigger: "Urgency", score: 70, fullMark: 100 },
      { trigger: "Curiosity", score: 50, fullMark: 100 },
    ],
    winningTrigger: "Social Proof",
    insight:
      "This brand leans heavily into Social Proof. Their engagement spikes by 40% when they use testimonials or user results.",
  };

  const triggersList = [
    "Authority",
    "FOMO",
    "Social Proof",
    "Reciprocity",
    "Urgency",
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
    <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.05)] p-6 h-full flex flex-col relative overflow-hidden">
      {/* Header Row */}
      <div className="flex justify-between items-start mb-5">
        <div>
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
            Psychological Triggers
          </h4>
          <h2 className="text-xl font-black text-[#000100] leading-none mb-1">
            Intent Analysis
          </h2>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs font-medium text-slate-500">
              Top Lever:
            </span>
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#caee55]/20 rounded-full border border-[#caee55]/30 text-[#000100]">
              <BsStars className="text-[#074ed5]" size={10} />
              <span className="text-[10px] uppercase font-bold tracking-wider">
                {safeData.winningTrigger}
              </span>
            </div>
          </div>
        </div>

        {/* Top Right Icon Badge */}
        <div className="p-2.5 bg-[#074ed5] text-white rounded-2xl shadow-sm shrink-0">
          <FaBrain size={18} />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row flex-1 gap-6 overflow-hidden">
        {/* Left: Radar Chart */}
        <div className="w-full lg:w-1/2 min-h-[250px] relative">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart
              cx="50%"
              cy="50%"
              outerRadius="70%"
              data={safeData.radarData}
            >
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis
                dataKey="trigger"
                tick={{ fill: "#64748b", fontSize: 10, fontWeight: 600 }}
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
                stroke="#074ed5"
                strokeWidth={2}
                fill="#074ed5"
                fillOpacity={0.12}
              />
              <Tooltip
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
                cursor={false}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Right: Insight & Action */}
        <div className="flex-1 flex flex-col gap-5 justify-between">
          {/* Insight Box */}
          <div className="bg-[#f4f8fb] rounded-2xl border border-slate-100 p-4">
            <h4 className="text-[10px] font-bold text-[#074ed5] uppercase tracking-widest mb-1 flex items-center gap-1.5">
              <FaBrain className="text-[#074ed5] shrink-0" size={10} /> AI
              Observation
            </h4>
            <p className="text-sm text-slate-500 font-medium leading-relaxed">
              {safeData.insight}
            </p>
          </div>

          <div className="mt-auto">
            <button
              onClick={() => setShowSwapModal(true)}
              className="w-full py-3 bg-[#074ed5] hover:bg-[#0041CC] text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-[0_4px_14px_0_rgba(0,82,255,0.39)] active:scale-[0.98]"
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
            className="absolute inset-0 z-20 bg-white/95 backdrop-blur-md flex flex-col p-6 rounded-3xl"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-[#000100] flex items-center gap-2">
                <FaExchangeAlt className="text-[#074ed5]" /> Trigger Swap
              </h3>
              <button
                onClick={() => setShowSwapModal(false)}
                className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-[#000100] transition-colors"
              >
                Close
              </button>
            </div>

            <div className="flex flex-col gap-4 flex-1 overflow-y-auto custom-scroll pr-1">
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">
                  Your Draft Caption
                </label>
                <textarea
                  value={userCaption}
                  onChange={(e) => setUserCaption(e.target.value)}
                  placeholder="I have a new web development course available now..."
                  className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#074ed5]/20 bg-[#f4f8fb] resize-none h-24 text-[#000100] font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">
                  Target Trigger
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {triggersList.map((t) => (
                    <button
                      key={t}
                      onClick={() => setSelectedTrigger(t)}
                      className={`px-3 py-2 rounded-lg text-xs font-bold border transition-all ${
                        selectedTrigger === t
                          ? "bg-[#074ed5]/10 border-[#074ed5]/30 text-[#074ed5]"
                          : "bg-white border-slate-100 text-slate-600 hover:bg-[#f4f8fb]"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleGenerateSwap}
                disabled={!userCaption || isGenerating}
                className={`w-full py-3 mt-2 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-sm ${
                  !userCaption || isGenerating
                    ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                    : "bg-[#000100] hover:bg-black text-white active:scale-[0.98]"
                }`}
              >
                {isGenerating ? (
                  <BsStars className="animate-spin text-[#caee55]" />
                ) : (
                  <FaRobot className="text-[#caee55]" />
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
