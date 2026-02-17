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
  Cell,
} from "recharts";
import { BsSpeedometer } from "react-icons/bs";
import { FaFire, FaBolt, FaHeartbeat } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

// --- Types ---
export type VelocityCategory = "Pulse" | "Momentum" | "Growth" | "Viral";

export interface VelocityData {
  hookRate: number; // 0 - 100
  category: VelocityCategory;
  velocityGraph: Array<{
    hour: string;
    engagement: number;
    benchmark?: number;
  }>;
  insight: string;
}

interface VelocityMeterProps {
  data?: VelocityData;
  onMatchVelocity?: () => void;
}

// --- Component ---
const VelocityMeter: React.FC<VelocityMeterProps> = ({
  data,
  onMatchVelocity,
}) => {
  const [showMatchModal, setShowMatchModal] = useState(false);

  // Default Mock Data if none provided
  const safeData: VelocityData = data || {
    hookRate: 85,
    category: "Momentum",
    velocityGraph: [
      { hour: "1h", engagement: 450 },
      { hour: "2h", engagement: 800 },
      { hour: "4h", engagement: 950 },
      { hour: "12h", engagement: 1100 },
      { hour: "24h", engagement: 1200 },
    ],
    insight:
      "This competitor has a high Hook-Rate. They rely on controversial openings.",
  };

  // Visual Config based on Category
  const getCategoryConfig = (cat: VelocityCategory) => {
    switch (cat) {
      case "Pulse":
        return {
          icon: <FaHeartbeat />,
          color: "text-gray-500",
          bg: "bg-gray-100",
          gradient: ["#9ca3af", "#6b7280"], // Gray
          description: "Steady Engagement",
        };
      case "Momentum":
        return {
          icon: <FaFire />,
          color: "text-rose-500",
          bg: "bg-rose-100",
          gradient: ["#f43f5e", "#e11d48"], // Rose
          description: "Consistent Growth",
        };
      case "Growth":
        return {
          icon: <FaBolt />,
          color: "text-amber-500",
          bg: "bg-amber-100",
          gradient: ["#f59e0b", "#d97706"], // Amber
          description: "Rapid Trajectory",
        };
      case "Viral":
        return {
          icon: <FaFire />,
          color: "text-indigo-500",
          bg: "bg-indigo-100",
          gradient: ["#6366f1", "#4f46e5"], // Indigo
          description: "Massive Reach",
        };
      default:
        return {
          icon: <FaHeartbeat />,
          color: "text-rose-500",
          bg: "bg-rose-100",
          gradient: ["#f43f5e", "#e11d48"], // Rose
          description: "Balanced Growth",
        };
    }
  };

  const config = getCategoryConfig(safeData.category);

  return (
    <div className="flex flex-col h-full w-full bg-white relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-6 pb-2">
        <div className="flex gap-3 items-center">
          <div className="bg-indigo-50 p-2.5 rounded-xl text-indigo-600">
            <BsSpeedometer size={18} />
          </div>
          <div>
            <div className="relative group cursor-help">
              <h4 className="font-bold text-lg text-gray-900 leading-tight inline-block">
                Engagement Velocity
              </h4>
              {/* Tooltip */}
              <div className="absolute left-0 top-full mt-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none">
                <div className="font-bold mb-1 text-indigo-300">
                  Why this matters:
                </div>
                Measures how quickly your audience reacts. High velocity means
                your hooks are stopping the scroll effectively.
                <div className="absolute left-4 -top-1 w-2 h-2 bg-gray-900 transform rotate-45"></div>
              </div>
            </div>
            <p className="text-xs text-gray-500 font-medium">
              Hook Rate: {safeData.hookRate}%
            </p>
          </div>
        </div>
        <div
          className={`flex items-center gap-2 px-3 py-1 rounded-full border ${config.bg} ${config.color} border-current/20`}
        >
          {config.icon}
          <span className="text-[10px] uppercase font-bold tracking-wider">
            {safeData.category}
          </span>
        </div>
      </div>

      <div className="flex flex-col flex-1 p-6 gap-6">
        {/* Main Gauge / Chart Area */}
        <div className="flex-1 w-full min-h-[150px] relative">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={safeData.velocityGraph}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f3f4f6"
              />
              <XAxis
                dataKey="hour"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: "#9ca3af" }}
              />
              <Tooltip
                cursor={{ fill: "transparent" }}
                contentStyle={{
                  borderRadius: "12px",
                  border: "none",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                }}
              />
              <Bar dataKey="engagement" radius={[4, 4, 0, 0]}>
                {safeData.velocityGraph.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      index < 2
                        ? config.gradient[0]
                        : "#e5e7eb" /* Highlight first 2 hours for Hook Rate */
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          {/* Label Helper */}
          <div className="absolute top-2 right-2 flex flex-col items-end">
            <span className="text-[10px] text-gray-400 font-medium">
              First 2h Impact
            </span>
            <div className="flex items-center gap-1">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: config.gradient[0] }}
              />
              <span className="text-xs font-bold text-gray-700">
                Hook Phase
              </span>
            </div>
          </div>
        </div>

        {/* Insight Box */}
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 relative">
          <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
            AI Observation
          </h5>
          <p className="text-sm text-gray-600 font-medium leading-relaxed">
            "{safeData.insight}"
          </p>
        </div>

        {/* Action Button */}
        <button
          onClick={() => {
            setShowMatchModal(true);
            onMatchVelocity?.();
          }}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.98]"
        >
          <FaBolt className="text-yellow-300" />
          Match this Velocity
        </button>
      </div>

      {/* --- Match Velocity Modal (Simulation) --- */}
      <AnimatePresence>
        {showMatchModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-20 bg-white/95 backdrop-blur-md flex flex-col p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <FaBolt className="text-amber-500" /> Velocity Matcher
              </h3>
              <button
                onClick={() => setShowMatchModal(false)}
                className="text-xs font-bold text-gray-500 hover:text-gray-900 underline"
              >
                Close
              </button>
            </div>

            <div className="flex-1 flex flex-col justify-center items-center text-center gap-4">
              <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-2 animate-bounce">
                <FaFire className="text-indigo-600 text-2xl" />
              </div>
              <h4 className="text-xl font-bold text-gray-800">
                Generating 3 Hooks...
              </h4>
              <p className="text-sm text-gray-500 max-w-[250px]">
                Analyzing {safeData.category} patterns to give your next post
                immediate traction.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VelocityMeter;
