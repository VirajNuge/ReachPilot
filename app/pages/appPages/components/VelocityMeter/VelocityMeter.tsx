"use client";

import React, { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
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

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.05)] p-6 h-full flex flex-col relative overflow-hidden">
      {/* Header Row */}
      <div className="flex justify-between items-start mb-5">
        <div>
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
            Engagement Velocity
          </h4>
          <h2 className="text-xl font-black text-[#000100] leading-none mb-1">
            Hook Rate: {safeData.hookRate}%
          </h2>
          <p className="text-xs font-medium text-slate-500">
            Category: {safeData.category}
          </p>
        </div>

        {/* Top Right Icon Badge matching reference */}
        <div className="p-2.5 bg-[#074ed5] text-white rounded-2xl shadow-sm shrink-0">
          <BsSpeedometer size={18} />
        </div>
      </div>

      <div className="flex flex-col flex-1 gap-6">
        {/* Main Chart Area */}
        <div className="flex-1 w-full min-h-[150px] relative">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={safeData.velocityGraph}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f4f8fb"
              />
              <XAxis
                dataKey="hour"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: "#64748b", fontWeight: 500 }}
                dy={10}
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
              <Bar dataKey="engagement" radius={[6, 6, 6, 6]} barSize={32}>
                {safeData.velocityGraph.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={index < 2 ? "#caee55" : "#074ed5"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          {/* Label Helper */}
          <div className="absolute -top-1 right-0 flex flex-col items-end">
            <div className="flex items-center gap-1.5 bg-[#f4f8fb] px-2.5 py-1 rounded-full border border-slate-100">
              <div
                className="w-2h h-2 rounded-full bg-[#caee55]"
                style={{ width: "8px", height: "8px" }}
              />
              <span className="text-[10px] font-bold text-[#000100] uppercase tracking-wider">
                Hook Phase
              </span>
            </div>
          </div>
        </div>

        {/* Insight Box */}
        <div className="bg-[#f4f8fb] rounded-2xl border border-slate-100 p-4">
          <h4 className="text-[10px] font-bold text-[#074ed5] uppercase tracking-widest mb-1 flex items-center gap-1.5">
            <FaFire className="text-[#074ed5] shrink-0" size={10} /> AI
            Observation
          </h4>
          <p className="text-sm text-slate-500 font-medium leading-relaxed">
            {safeData.insight}
          </p>
        </div>

        {/* Action Button */}
        <button
          onClick={() => {
            setShowMatchModal(true);
            onMatchVelocity?.();
          }}
          className="w-full py-3 bg-[#074ed5] hover:bg-[#0041CC] text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-[0_4px_14px_0_rgba(0,82,255,0.39)] active:scale-[0.98]"
        >
          <FaBolt />
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
            className="absolute inset-0 z-20 bg-white/95 backdrop-blur-md flex flex-col p-6 rounded-3xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-[#000100] flex items-center gap-2">
                <FaBolt className="text-[#074ed5]" /> Velocity Matcher
              </h3>
              <button
                onClick={() => setShowMatchModal(false)}
                className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-[#000100] transition-colors"
              >
                Close
              </button>
            </div>

            <div className="flex-1 flex flex-col justify-center items-center text-center gap-4">
              <div className="p-3 bg-[#074ed5]/10 text-[#074ed5] rounded-2xl mb-2 animate-bounce">
                <FaFire size={24} />
              </div>
              <h4 className="text-xl font-black text-[#000100]">
                Generating 3 Hooks...
              </h4>
              <p className="text-sm text-slate-500 font-medium max-w-[250px]">
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
