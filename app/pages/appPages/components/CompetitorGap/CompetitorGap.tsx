"use client";

import React, { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { FaBullseye, FaLightbulb, FaRocket, FaGem } from "react-icons/fa";
import { BsGraphUpArrow } from "react-icons/bs";
import { motion, AnimatePresence } from "framer-motion";
import { IoMdClose } from "react-icons/io";

// --- Types ---
export interface GapMetric {
  category: string;
  profileValue: number; // %
  benchmarkValue: number; // %
  gapType: "Opportunity" | "Over-indexed" | "On Par";
}

export interface GapData {
  metrics: GapMetric[];
  topOpportunity: string;
  insight: string;
  recommendations: string[];
}

interface CompetitorGapProps {
  data?: GapData;
}

// --- Component ---
const CompetitorGap: React.FC<CompetitorGapProps> = ({ data }) => {
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Mock Data
  const safeData: GapData = data || {
    metrics: [
      {
        category: "Engagement Rate",
        profileValue: 80,
        benchmarkValue: 40,
        gapType: "Over-indexed",
      },
      {
        category: "Post Frequency",
        profileValue: 5,
        benchmarkValue: 35,
        gapType: "Opportunity",
      },
      {
        category: "Content Quality",
        profileValue: 45,
        benchmarkValue: 50,
        gapType: "On Par",
      },
    ],
    topOpportunity: "Post Frequency",
    insight:
      "This competitor is posting 5x less than the industry average. They have high engagement but low frequency, creating a massive void you can fill.",
    recommendations: [
      "Create a 'State of the Industry' carousel (5 slides).",
      "Summarize their latest viral Reel into a step-by-step PDF/Carousel.",
      "Post a static infographic on Sundays when they are silent.",
    ],
  };

  const handleGeneratePlan = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      // In a real app, this would fetch new AI ideas
    }, 1500);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.05)] p-6 h-full flex flex-col relative overflow-hidden">
      {/* Header Row */}
      <div className="flex justify-between items-start mb-5">
        <div>
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
            Market Arbitrage
          </h4>
          <h2 className="text-xl font-black text-[#000100] leading-none mb-1">
            Competitor Gap Discovery
          </h2>
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#caee55]/20 text-[#000100] border border-[#caee55]/30 rounded-full mt-2 inline-flex w-fit">
            <FaGem className="text-[#074ed5]" size={10} />
            <span className="text-[10px] uppercase font-bold tracking-wider">
              Opportunity: {safeData.topOpportunity}
            </span>
          </div>
        </div>

        {/* Top Right Icon Badge */}
        <div className="p-2.5 bg-[#074ed5] text-white rounded-2xl shadow-sm shrink-0">
          <FaBullseye size={18} />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row flex-1 gap-6">
        {/* Chart Area */}
        <div className="flex-1 min-h-[220px] relative">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={safeData.metrics}
              layout="vertical"
              margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                horizontal={false}
                stroke="#f4f8fb"
              />
              <XAxis type="number" hide />
              <YAxis
                dataKey="category"
                type="category"
                tick={{ fontSize: 10, fontWeight: 600, fill: "#64748b" }}
                width={90}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                cursor={{ fill: "transparent" }}
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
              <Legend
                iconType="circle"
                wrapperStyle={{
                  fontSize: "10px",
                  fontWeight: "bold",
                  color: "#64748b",
                  paddingTop: "10px",
                }}
              />
              <Bar
                dataKey="profileValue"
                name="Competitor"
                fill="#000100" // Dark standard for competitor
                radius={[0, 4, 4, 0]}
                barSize={12}
              />
              <Bar
                dataKey="benchmarkValue"
                name="Industry Avg"
                fill="#074ed5" // Blue standard for average
                radius={[0, 4, 4, 0]}
                barSize={12}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Insight & Action */}
        <div className="w-full lg:w-[40%] flex flex-col justify-between gap-5">
          {/* Strategic Brief Insight Box */}
          <div className="bg-[#f4f8fb] rounded-2xl border border-slate-100 p-4">
            <h4 className="text-[10px] font-bold text-[#074ed5] uppercase tracking-widest mb-1 flex items-center gap-1.5">
              <BsGraphUpArrow className="text-[#074ed5] shrink-0" size={10} />{" "}
              The Attack Plan
            </h4>
            <p className="text-sm text-slate-500 font-medium leading-relaxed">
              {safeData.insight}
            </p>
          </div>

          <div className="mt-auto">
            <button
              onClick={() => {
                setShowPlanModal(true);
                handleGeneratePlan();
              }}
              className="w-full py-3 bg-[#074ed5] hover:bg-[#0041CC] text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-[0_4px_14px_0_rgba(0,82,255,0.39)] active:scale-[0.98]"
            >
              <FaRocket />
              Fill this Gap
            </button>
          </div>
        </div>
      </div>

      {/* --- Action Modal --- */}
      <AnimatePresence>
        {showPlanModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-20 bg-white/95 backdrop-blur-md flex flex-col p-6 rounded-3xl"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-[#caee55] text-[#000100] rounded-2xl">
                  <FaLightbulb size={18} />
                </div>
                <h3 className="text-xl font-black text-[#000100]">
                  Gap Content Opportunities
                </h3>
              </div>
              <button
                onClick={() => setShowPlanModal(false)}
                className="p-2 hover:bg-[#f4f8fb] rounded-full transition-colors"
              >
                <IoMdClose size={24} className="text-slate-400" />
              </button>
            </div>

            {isGenerating ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-4">
                <FaRocket className="text-[#074ed5] text-4xl animate-bounce" />
                <p className="font-bold text-slate-500 uppercase tracking-widest text-xs">
                  Analyzing Market Void...
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3 overflow-y-auto custom-scroll pr-1 pb-4 flex-1">
                {safeData.recommendations.map((idea, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="p-4 bg-[#f4f8fb] border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer group flex items-start gap-4"
                  >
                    <span className="flex-shrink-0 w-8 h-8 bg-[#f4f8fb] rounded-xl flex items-center justify-center text-xs font-black text-slate-400 group-hover:bg-[#074ed5] group-hover:text-white transition-colors">
                      {i + 1}
                    </span>
                    <p className="text-sm font-medium text-[#000100] leading-relaxed pt-1">
                      {idea}
                    </p>
                  </motion.div>
                ))}

                <button className="mt-4 w-full py-4 font-bold uppercase tracking-widest rounded-2xl hover: transition-colors bg-[#000100] hover:bg-black text-white">
                  + Generate More Ideas
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CompetitorGap;
