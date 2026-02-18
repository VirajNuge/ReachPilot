import React, { useState, useEffect } from "react";
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
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { motion } from "framer-motion";
import PriorityHeatmap from "../../components/PriorityHeatmap/PriorityHeatmap";
import ContentDisruptor from "../../components/ContentDisruptor/ContentDisruptor";
import FunnelOptimizer from "../../components/FunnelOptimizer/FunnelOptimizer";
import CrowdHijacker from "../../components/CrowdHijacker/CrowdHijacker";

// --- Types ---
import {
  GrowthTask,
  DisruptorData,
  FunnelTactic,
  CrowdTactic,
  GrowthSimulationResult,
  TaskCategory,
} from "../../../../../lib/types/analysis";

interface GrowthCommandProps {
  growthTasks?: GrowthTask[];
  disruptor?: DisruptorData;
  funnelTactics?: FunnelTactic[];
  crowdTactics?: CrowdTactic[];
}

export default function GrowthCommand({
  growthTasks,
  disruptor,
  funnelTactics,
  crowdTactics,
}: GrowthCommandProps) {
  const [simulationValue, setSimulationValue] = useState(20);
  const [consistencyValue, setConsistencyValue] = useState(50); // New slider
  const [simulationResult, setSimulationResult] =
    useState<GrowthSimulationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Client-side simulation logic
  const calculateResult = (authority: number, consistency: number) => {
    // Algorithm: Growth = (Authority * Consistency) / MarketResistance
    const baseGrowth = 1.2; // 20% organic growth baseline
    const authorityMultiplier = 1 + authority / 100; // 1.0 - 2.0
    const consistencyMultiplier = 1 + consistency / 100; // 1.0 - 2.0

    // Outcome: 30-day projection
    const engagementBoost = Math.floor(
      baseGrowth * authorityMultiplier * consistencyMultiplier * 10,
    );

    // Generate Graph Data (Exponential Curve)
    const graphData = Array.from({ length: 30 }, (_, i) => {
      const day = i + 1;
      // Simple compound interest formula for visualization
      const growthFactor = 1 + engagementBoost / 100 / 30;
      const value = Math.floor(1000 * Math.pow(growthFactor, day));
      return { day, value };
    });

    return {
      input: { authority, frequency: consistency },
      outcome: {
        followers: Math.floor(engagementBoost * 12.5), // Heuristic
        engagement: engagementBoost,
        revenue_potential: engagementBoost * 45, // $ value heuristic
      },
      trajectory_graph: graphData,
    };
  };

  // Initial calculation
  useEffect(() => {
    const result = calculateResult(simulationValue, consistencyValue);
    setSimulationResult(result);
  }, [simulationValue, consistencyValue]);

  return (
    <div className="flex flex-col gap-6">
      {/* Top Row: Priority Matrix & Trajectory Simulator */}
      <div className="grid grid-cols-12 gap-6">
        {/* 1. Priority Heatmap (The Command Center) */}
        <div className="col-span-12 lg:col-span-7 h-full">
          <PriorityHeatmap tasks={growthTasks} />
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
          <div className="p-6 flex-1 flex flex-col gap-6">
            {/* Sliders */}
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">
                  <span>Authority Signal</span>
                  <span className="text-indigo-600">{simulationValue}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={simulationValue}
                  onChange={(e) => setSimulationValue(Number(e.target.value))}
                  className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>
              <div>
                <div className="flex justify-between text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">
                  <span>Consistency</span>
                  <span className="text-emerald-600">{consistencyValue}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={consistencyValue}
                  onChange={(e) => setConsistencyValue(Number(e.target.value))}
                  className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
              </div>
            </div>

            {/* Result Display */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-center">
                <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">
                  Engagement
                </div>
                <div className="text-2xl font-black text-indigo-700">
                  +{simulationResult?.outcome.engagement}%
                </div>
              </div>
              <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-center">
                <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-1">
                  Revenue Pot.
                </div>
                <div className="text-2xl font-black text-emerald-700">
                  $
                  {simulationResult?.outcome.revenue_potential.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Graph Visualization */}
            <div className="flex-1 min-h-[120px] w-full relative">
              <div className="absolute inset-0">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={simulationResult?.trajectory_graph}>
                    <defs>
                      <linearGradient
                        id="colorValue"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#6366f1"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="#6366f1"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <Tooltip
                      contentStyle={{
                        borderRadius: "8px",
                        border: "none",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      }}
                      labelStyle={{ color: "#6b7280", fontSize: "10px" }}
                      itemStyle={{
                        color: "#4f46e5",
                        fontWeight: "bold",
                        fontSize: "12px",
                      }}
                      formatter={(value: number) => [
                        `${value}`,
                        "Growth Score",
                      ]}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#6366f1"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorValue)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Row: Content Disruptor (Weekly Plan) */}
      <div className="col-span-12 h-full">
        <ContentDisruptor disruptor={disruptor!} />
      </div>

      {/* Bottom Row: Funnel Optimizer & Crowd Hijacker */}
      <div className="grid grid-cols-12 gap-6 h-[400px]">
        {/* Funnel Optimizer */}
        <div className="col-span-12 md:col-span-6 h-full">
          <FunnelOptimizer funnelTactics={funnelTactics} />
        </div>

        {/* Crowd Hijacker */}
        <div className="col-span-12 md:col-span-6 h-full">
          <CrowdHijacker crowdTactics={crowdTactics} />
        </div>
      </div>
    </div>
  );
}
