import React, { useState } from "react";
import { FaMoneyBillWave, FaArrowRight, FaMagic } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

// --- Types ---
import { FunnelTactic } from "../../../../../lib/types/analysis";

interface FunnelOptimizerProps {
  funnelTactics?: FunnelTactic[];
}

export default function FunnelOptimizer({
  funnelTactics,
}: FunnelOptimizerProps) {
  const [activeTactic, setActiveTactic] = useState<string | null>(null);

  const tactics = funnelTactics || [];

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.05)] h-full overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-6 pb-4 border-b border-slate-100 flex justify-between items-start">
        <div>
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
            Growth Command
          </h4>
          <div className="relative group cursor-help inline-block">
            <h2 className="text-xl font-black text-[#000100] leading-none mb-1">
              Funnel Optimizer
            </h2>
            <div className="absolute left-0 top-full mt-2 w-64 p-3 bg-[#000100] text-white text-xs rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none">
              Identifies revenue leaks in your funnel. Suggests tactical fixes
              like "Upgrading the Lead Magnet" or "Adding a Retargeting Pixel".
              <div className="absolute left-4 -top-1 w-2 h-2 bg-[#000100] transform rotate-45"></div>
            </div>
          </div>
          <p className="text-xs font-medium text-slate-500">
            Revenue &amp; Conversion Tactics
          </p>
        </div>
        <div className="p-2.5 bg-[#074ed5] text-white rounded-2xl shadow-sm shrink-0">
          <FaMoneyBillWave size={16} />
        </div>
      </div>

      <div className="p-4 flex flex-col gap-3 overflow-y-auto custom-scrollbar flex-1">
        {tactics.length === 0 && (
          <div className="flex flex-col items-center justify-center flex-1 py-8 text-center">
            <div className="w-10 h-10 rounded-2xl bg-[#074ed5]/10 flex items-center justify-center mb-2">
              <FaMoneyBillWave className="text-[#074ed5]" />
            </div>
            <p className="text-sm font-bold text-[#000100]">No tactics yet</p>
            <p className="text-xs text-slate-400">
              Run an analysis to see funnel fixes
            </p>
          </div>
        )}
        {tactics.map((tactic) => (
          <motion.div
            key={tactic.id}
            layout
            onClick={() =>
              setActiveTactic(activeTactic === tactic.id ? null : tactic.id)
            }
            className={`p-4 rounded-2xl border transition-all cursor-pointer ${activeTactic === tactic.id ? "bg-[#074ed5]/5 border-[#074ed5]/20 shadow-sm" : "bg-white border-slate-100 hover:border-[#074ed5]/20"}`}
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                {tactic.status === "Pending" && (
                  <div className="w-2 h-2 rounded-full bg-[#caee55] animate-pulse" />
                )}
                <h4 className="font-bold text-[#000100] text-sm">
                  {tactic.title}
                </h4>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-[#f4f8fb] rounded border border-slate-200 text-slate-500 uppercase">
                {tactic.difficulty}
              </span>
            </div>

            <p className="text-xs text-slate-500 mb-3 leading-snug">
              <span className="font-bold text-[#074ed5]">Problem:</span>{" "}
              {tactic.problem}
            </p>

            <AnimatePresence>
              {activeTactic === tactic.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-3 bg-[#f4f8fb] rounded-xl border border-slate-100 mb-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#074ed5] mb-1">
                      <FaMagic /> AI Recommendation
                    </div>
                    <p className="text-sm text-[#000100] font-medium leading-relaxed">
                      {tactic.solution}
                    </p>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <div className="text-xs font-bold text-[#caee55] bg-[#caee55]/20 px-2 py-1 rounded-lg border border-[#caee55]/30">
                      Exp. Impact: {tactic.impact}
                    </div>
                    <button className="px-3 py-1.5 font-bold rounded-xl flex items-center gap-2 transition-colors bg-[#000100] hover:bg-black text-white">
                      <FaMagic className="text-[#caee55]" /> Generate Assets
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {activeTactic !== tactic.id && (
              <div className="flex justify-between items-center pt-2 border-t border-dashed border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400">
                  Solution
                </span>
                <div className="flex items-center gap-1 text-xs font-medium text-slate-500">
                  {tactic.solution.substring(0, 30)}...
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
