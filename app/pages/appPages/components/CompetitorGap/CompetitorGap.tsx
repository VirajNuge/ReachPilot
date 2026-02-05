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

// --- Types ---
export interface GapMetric {
  category: string;
  profileValue: number; // %
  benchmarkValue: number; // %
  gapType: "Opportunity" | "Satigfied" | "Over-indexed";
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
        category: "Reels",
        profileValue: 80,
        benchmarkValue: 40,
        gapType: "Over-indexed",
      },
      {
        category: "Carousels",
        profileValue: 5,
        benchmarkValue: 35,
        gapType: "Opportunity",
      },
      {
        category: "Static",
        profileValue: 15,
        benchmarkValue: 25,
        gapType: "Opportunity",
      },
    ],
    topOpportunity: "Carousels",
    insight:
      "They are obsessed with Viral Reels (80%), ignoring high-value Carousels. Industry avg is 35%. You can capture the 'Save & Share' audience they are missing.",
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
    <div className="flex flex-col h-full w-full bg-white relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-6 pb-4">
        <div className="flex gap-3 items-center">
          <div className="bg-teal-50 p-2.5 rounded-xl text-teal-600">
            <FaBullseye size={18} />
          </div>
          <div>
            <div className="relative group cursor-help">
              <h4 className="font-bold text-lg text-gray-900 leading-tight inline-block">
                Content Gap Discovery
              </h4>
              {/* Tooltip */}
              <div className="absolute left-0 top-full mt-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none">
                <div className="font-bold mb-1 text-teal-300">
                  Why this matters:
                </div>
                Highlights content formats your competitors are missing (e.g.,
                Carousels). These are your opportunities to steal market share.
                <div className="absolute left-4 -top-1 w-2 h-2 bg-gray-900 transform rotate-45"></div>
              </div>
            </div>
            <p className="text-xs text-gray-500 font-medium">
              Market Arbitrage & Benchmarking
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-full">
          <FaGem />
          <span className="text-[10px] uppercase font-bold tracking-wider">
            Gold Mine: {safeData.topOpportunity}
          </span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row flex-1 p-6 pt-0 gap-6">
        {/* Chart Area */}
        <div className="flex-1 min-h-[200px] relative">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={safeData.metrics}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                horizontal={false}
                stroke="#f3f4f6"
              />
              <XAxis type="number" hide />
              <YAxis
                dataKey="category"
                type="category"
                tick={{ fontSize: 11, fontWeight: 600, fill: "#4b5563" }}
                width={80}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                cursor={{ fill: "transparent" }}
                contentStyle={{
                  borderRadius: "12px",
                  border: "none",
                  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                }}
              />
              <Legend
                iconType="circle"
                wrapperStyle={{ fontSize: "10px", paddingTop: "10px" }}
              />
              <Bar
                dataKey="profileValue"
                name="Competitor"
                fill="#9ca3af"
                radius={[0, 4, 4, 0]}
                barSize={12}
              />
              <Bar
                dataKey="benchmarkValue"
                name="Industry Avg"
                fill="#14b8a6"
                radius={[0, 4, 4, 0]}
                barSize={12}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Insight & Action */}
        <div className="w-full lg:w-[40%] flex flex-col gap-4">
          {/* Strategic Brief */}
          <div className="bg-teal-50/50 rounded-xl p-4 border border-teal-100/50">
            <div className="flex items-center gap-2 mb-2">
              <BsGraphUpArrow className="text-teal-600 text-xs" />
              <h5 className="text-[10px] font-bold text-teal-800 uppercase tracking-wider">
                The Attack Plan
              </h5>
            </div>
            <p className="text-sm text-gray-700 font-medium leading-relaxed">
              "{safeData.insight}"
            </p>
          </div>

          <div className="mt-auto">
            <button
              onClick={() => {
                setShowPlanModal(true);
                handleGeneratePlan();
              }}
              className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.98]"
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
            className="absolute inset-0 z-20 bg-white/95 backdrop-blur-md flex flex-col p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="bg-teal-100 p-2 rounded-lg text-teal-700">
                  <FaLightbulb />
                </div>
                <h3 className="text-lg font-bold text-gray-900">
                  Gap Content Opportunities
                </h3>
              </div>
              <button
                onClick={() => setShowPlanModal(false)}
                className="text-xs font-bold text-gray-500 hover:text-gray-900 underline"
              >
                Close
              </button>
            </div>

            {isGenerating ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-3">
                <FaRocket className="text-teal-500 text-3xl animate-bounce" />
                <p className="font-bold text-gray-600">
                  Analyzing Market Void...
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3 overflow-y-auto custom-scroll pr-1 pb-4">
                {safeData.recommendations.map((idea, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="p-4 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
                  >
                    <div className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-bold text-gray-500 group-hover:bg-teal-500 group-hover:text-white transition-colors">
                        {i + 1}
                      </span>
                      <p className="text-sm font-medium text-gray-800 leading-snug">
                        {idea}
                      </p>
                    </div>
                  </motion.div>
                ))}

                <button className="mt-4 w-full py-2.5 border-2 border-dashed border-gray-200 text-gray-400 font-bold text-xs rounded-xl hover:bg-gray-50 transition-colors">
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
