"use client";

import React, { useState } from "react";
import { createPortal } from "react-dom";
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
import {
  FaFire,
  FaRocket,
  FaMagic,
  FaCheck,
  FaTimes,
} from "react-icons/fa";
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

interface HookAlternative {
  trigger: "Curiosity" | "FOMO" | "High-Value Promise";
  text: string;
  why: string;
}

type ModalState = "closed" | "input" | "loading" | "results";

interface VelocityMeterProps {
  data?: VelocityData;
  onMatchVelocity?: () => void;
}

// --- Component ---
const VelocityMeter: React.FC<VelocityMeterProps> = ({
  data,
  onMatchVelocity,
}) => {
  const [modalState, setModalState] = useState<ModalState>("closed");
  const [hookInput, setHookInput] = useState("");
  const [hookResults, setHookResults] = useState<HookAlternative[]>([]);
  const [hookError, setHookError] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

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

  const handleGenerateHooks = async () => {
    if (!hookInput.trim()) return;
    setModalState("loading");
    setHookError(false);
    try {
      const res = await fetch("/api/analyze-extension/boost-hook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentHook: hookInput,
          velocityCategory: safeData.category,
          hookRate: safeData.hookRate,
          insight: safeData.insight,
          platform: "X (Twitter)",
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.hooks) throw new Error("bad response");
      setHookResults(json.hooks as HookAlternative[]);
      setModalState("results");
    } catch {
      setHookError(true);
      setModalState("input");
    }
  };

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const triggerColors: Record<string, string> = {
    Curiosity: "bg-purple-100 text-purple-700",
    FOMO: "bg-red-100 text-red-600",
    "High-Value Promise": "bg-blue-100 text-blue-700",
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

        {/* Top Right Icon Badge */}
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
                    fill={index < 2 ? "#caee55" : "#0052FF"}
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
            setModalState("input");
            setHookInput("");
            setHookError(false);
            setHookResults([]);
            onMatchVelocity?.();
          }}
          className="w-full py-3 bg-[#074ed5] hover:bg-[#0041CC] text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-[0_4px_14px_0_rgba(0,82,255,0.39)] active:scale-[0.98]"
        >
          <FaRocket />
          Boost Hook Rate
        </button>
      </div>

      {/* --- Boost Hook Modal via Portal --- */}
      {modalState !== "closed" &&
        typeof window !== "undefined" &&
        createPortal(
          <AnimatePresence>
            <motion.div
              key="boost-hook-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
              onClick={(e) => {
                if (e.target === e.currentTarget) setModalState("closed");
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.18 }}
                className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-6 flex flex-col gap-5 relative"
              >
                {/* Close button */}
                <button
                  onClick={() => setModalState("closed")}
                  className="absolute top-4 right-4 text-slate-400 hover:text-[#1A1D23] transition-colors"
                >
                  <FaTimes />
                </button>

                {/* INPUT state */}
                {modalState === "input" && (
                  <>
                    <div>
                      <h3 className="text-lg font-black text-[#1A1D23] flex items-center gap-2">
                        <FaRocket className="text-[#0052FF]" /> Boost Hook Rate
                      </h3>
                      <p className="text-xs text-slate-400 font-medium mt-1">
                        Paste your current hook or first line
                      </p>
                    </div>
                    <textarea
                      value={hookInput}
                      onChange={(e) => setHookInput(e.target.value)}
                      placeholder="Your post's first line or video hook..."
                      rows={3}
                      className="w-full border border-slate-200 rounded-2xl p-3 text-sm text-[#1A1D23] resize-none focus:outline-none focus:border-[#0052FF] transition-colors"
                    />
                    <p className="text-[11px] text-slate-400 -mt-2">
                      Generating with:{" "}
                      <span className="font-bold text-[#074ed5]">
                        {safeData.category}
                      </span>{" "}
                      velocity patterns
                    </p>
                    {hookError && (
                      <p className="text-xs text-red-500 font-medium">
                        Failed to generate hooks. Try again.
                      </p>
                    )}
                    <button
                      onClick={handleGenerateHooks}
                      disabled={!hookInput.trim()}
                      className="w-full py-3 bg-[#074ed5] hover:bg-[#0041CC] disabled:opacity-40 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all"
                    >
                      <FaMagic /> Generate Alternatives
                    </button>
                  </>
                )}

                {/* LOADING state */}
                {modalState === "loading" && (
                  <div className="flex flex-col items-center justify-center py-10 gap-4">
                    <div className="p-3 bg-[#074ed5]/10 text-[#074ed5] rounded-2xl animate-bounce">
                      <FaFire size={24} />
                    </div>
                    <h4 className="text-base font-black text-[#1A1D23]">
                      Analyzing {safeData.category} patterns...
                    </h4>
                    <p className="text-xs text-slate-400 font-medium">
                      Injecting proven emotional triggers
                    </p>
                  </div>
                )}

                {/* RESULTS state */}
                {modalState === "results" && (
                  <>
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-black text-[#1A1D23] flex items-center gap-2">
                        <FaRocket className="text-[#0052FF]" /> 3 Hook
                        Alternatives
                      </h3>
                      <button
                        onClick={() => setModalState("input")}
                        className="text-xs font-bold text-[#074ed5] hover:underline"
                      >
                        ← Back
                      </button>
                    </div>
                    <div className="flex flex-col gap-3 overflow-y-auto max-h-[60vh] pr-1">
                      {hookResults.map((hook, idx) => (
                        <div
                          key={idx}
                          className="bg-[#F5F6FA] rounded-2xl border border-slate-100 p-4 flex flex-col gap-2"
                        >
                          <span
                            className={`self-start text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wide ${triggerColors[hook.trigger] ?? "bg-slate-100 text-slate-600"}`}
                          >
                            {hook.trigger}
                          </span>
                          <p className="text-sm font-black text-[#1A1D23] leading-snug">
                            {hook.text}
                          </p>
                          <p className="text-[11px] text-slate-400 leading-relaxed">
                            <span className="font-semibold text-slate-500">
                              Why it works:
                            </span>{" "}
                            {hook.why}
                          </p>
                          <button
                            onClick={() => handleCopy(hook.text, idx)}
                            className="self-end flex items-center gap-1.5 text-[11px] font-bold border border-slate-200 rounded-xl px-3 py-1.5 hover:border-[#0052FF] hover:text-[#0052FF] transition-colors"
                          >
                            {copiedIndex === idx ? (
                              <>
                                <FaCheck size={10} /> Copied
                              </>
                            ) : (
                              "Copy"
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </motion.div>
            </motion.div>
          </AnimatePresence>,
          document.body,
        )}
    </div>
  );
};

export default VelocityMeter;
