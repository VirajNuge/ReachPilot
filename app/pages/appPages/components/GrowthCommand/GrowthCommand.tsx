import React, { useState } from "react";
import {
  FaRocket,
  FaCalendarAlt,
  FaBullseye,
  FaUserFriends,
  FaMoneyBillWave,
  FaCheckCircle,
  FaArrowRight,
  FaMagic,
  FaChartLine,
} from "react-icons/fa";
import { motion } from "framer-motion";
import PriorityHeatmap from "../../components/PriorityHeatmap/PriorityHeatmap";
import ContentDisruptor from "../../components/ContentDisruptor/ContentDisruptor";
import FunnelOptimizer from "../../components/FunnelOptimizer/FunnelOptimizer";
import CrowdHijacker from "../../components/CrowdHijacker/CrowdHijacker";

// --- Types ---
export type TaskCategory = "Quick Win" | "Big Bet" | "Filler" | "Money Pit";
export type ImpactLevel = "High" | "Low";
export type EffortLevel = "High" | "Low";

export interface GrowthTask {
  id: string;
  title: string;
  category: TaskCategory;
  impact: ImpactLevel;
  effort: EffortLevel;
  type: "Funnel" | "Content" | "Crowd";
}

// --- Mock Data ---
const MOCK_TASKS: GrowthTask[] = [
  {
    id: "1",
    title: "Change bio link to direct Lead Magnet",
    category: "Quick Win",
    impact: "High",
    effort: "Low",
    type: "Funnel",
  },
  {
    id: "2",
    title: "Launch 10-part video series on 'React Patterns'",
    category: "Big Bet",
    impact: "High",
    effort: "High",
    type: "Content",
  },
  {
    id: "3",
    title: "Reply to 'Skeptics' with Case Study",
    category: "Quick Win",
    impact: "High",
    effort: "Low",
    type: "Crowd",
  },
  {
    id: "4",
    title: "Update emoji style in captions",
    category: "Filler",
    impact: "Low",
    effort: "Low",
    type: "Content",
  },
];

const MOCK_SCHEDULE = [
  {
    day: "Mon",
    type: "Authority",
    topic: "Why X is broken",
    hook: "Stop doing...",
  },
  {
    day: "Tue",
    type: "Hand-Raiser",
    topic: "Free Resource",
    hook: "Comment 'SCALE'...",
  },
  {
    day: "Wed",
    type: "Social Proof",
    topic: "Client Win",
    hook: "How we generated...",
  },
  { day: "Thu", type: "Education", topic: "Tutorial", hook: "3 Steps to..." },
  { day: "Fri", type: "Personal", topic: "Behind Scenes", hook: "My setup..." },
];

// --- Component ---
// ... imports ...
import { GrowthSimulationResult } from "../../../../../lib/types/analysis";

// ... Types & Mock Data ...

// --- Component ---
export default function GrowthCommand() {
  const [simulationValue, setSimulationValue] = useState(20);
  const [activeTab, setActiveTab] = useState<"All" | "Funnel" | "Crowd">("All");

  // State for Simulation Result
  const [simulationResult, setSimulationResult] =
    useState<GrowthSimulationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSimulate = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/simulate-growth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: {
            authority: simulationValue,
            frequency: 50, // Default or add another slider
          },
        }),
      });
      const result = await response.json();
      setSimulationResult(result);
    } catch (error) {
      console.error("Simulation failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryColor = (cat: TaskCategory) => {
    // ... existing switch ...
    switch (cat) {
      case "Quick Win":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "Big Bet":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "Filler":
        return "bg-gray-100 text-gray-600 border-gray-200";
      case "Money Pit":
        return "bg-red-100 text-red-700 border-red-200";
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Top Row: Priority Matrix & Trajectory Simulator */}
      <div className="grid grid-cols-12 gap-6">
        {/* 1. Priority Heatmap (The Command Center) */}
        <div className="col-span-12 lg:col-span-7 h-full">
          <PriorityHeatmap />
        </div>

        {/* 2. Growth Trajectory (Simulator) */}
        <div className="col-span-12 lg:col-span-5 h-full bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 pb-2 border-b border-gray-50">
            <div className="flex gap-3 items-center">
              <span className="text-xl">📈</span>
              <h3 className="font-bold text-gray-900 text-lg">
                Trajectory Predictor
              </h3>
            </div>
          </div>
          <div className="p-6 flex-1 flex flex-col justify-between">
            <div className="mb-6">
              <div className="flex justify-between text-sm font-bold text-gray-600 mb-2">
                <span>Input: Authority Content</span>
                <span className="text-indigo-600">+{simulationValue}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={simulationValue}
                onChange={(e) => setSimulationValue(Number(e.target.value))}
                className="w-full h-2 bg-indigo-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>

            <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl mb-4 text-center">
              <div className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-1">
                Predicted Outcome (30 Days)
              </div>
              <div className="text-3xl font-black text-indigo-700">
                {isLoading ? (
                  <span className="animate-pulse">...</span>
                ) : simulationResult ? (
                  <>+{simulationResult.outcome.engagement}%</>
                ) : (
                  <>+{Math.floor(simulationValue * 1.5)}%</>
                )}
                <span className="text-lg text-indigo-400 ml-1">Engagement</span>
              </div>
              <div className="text-xs text-indigo-500 mt-1">
                {simulationResult
                  ? "Based on simulation"
                  : "matches Competitor X's 'Seeker' rate"}
              </div>
            </div>

            <button
              onClick={handleSimulate}
              disabled={isLoading}
              className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isLoading ? (
                <FaChartLine className="animate-spin" />
              ) : (
                <FaMagic />
              )}
              {isLoading ? "Simulating..." : "Apply Strategy"}
            </button>
          </div>
        </div>
      </div>

      {/* Middle Row: Content Disruptor (Weekly Plan) */}
      <div className="col-span-12 h-full">
        <ContentDisruptor />
      </div>

      {/* Bottom Row: Funnel Optimizer & Crowd Hijacker */}
      <div className="grid grid-cols-12 gap-6 h-[400px]">
        {/* Funnel Optimizer */}
        <div className="col-span-12 md:col-span-6 h-full">
          <FunnelOptimizer />
        </div>

        {/* Crowd Hijacker */}
        <div className="col-span-12 md:col-span-6 h-full">
          <CrowdHijacker />
        </div>
      </div>
    </div>
  );
}
