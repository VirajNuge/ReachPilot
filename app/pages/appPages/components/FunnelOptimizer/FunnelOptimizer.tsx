import React, { useState } from "react";
import {
  FaMoneyBillWave,
  FaArrowRight,
  FaMagic,
  FaCheckCircle,
  FaExclamationTriangle,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

// --- Types ---
import { FunnelTactic } from "../../../../../lib/types/analysis";

// --- Mock Data ---

interface FunnelOptimizerProps {
  funnelTactics?: FunnelTactic[];
}

export default function FunnelOptimizer({
  funnelTactics,
}: FunnelOptimizerProps) {
  const [activeTactic, setActiveTactic] = useState<string | null>(null);

  // Use passed data or fallback to empty array
  const tactics = funnelTactics || [];

  return (
    <div className="h-full bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
      <div className="p-6 pb-4 border-b border-gray-50 flex justify-between items-center">
        <div className="flex gap-3 items-center">
          <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
            <FaMoneyBillWave />
          </div>
          <div>
            <div className="relative group cursor-help">
              <h3 className="font-bold text-gray-900 leading-tight border-b border-dashed border-gray-300 inline-block">
                Funnel Optimizer
              </h3>
              <div className="absolute left-0 top-full mt-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none">
                Identifies revenue leaks in your funnel. Suggests tactical fixes
                like "Upgrading the Lead Magnet" or "Adding a Retargeting
                Pixel".
                <div className="absolute -top-1 left-4 w-2 h-2 bg-gray-900 rotate-45"></div>
              </div>
            </div>
            <p className="text-xs text-gray-500">
              Revenue & Conversion Tactics
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 flex flex-col gap-3 overflow-y-auto custom-scrollbar flex-1">
        {tactics.map((tactic) => (
          <motion.div
            key={tactic.id}
            layout
            onClick={() =>
              setActiveTactic(activeTactic === tactic.id ? null : tactic.id)
            }
            className={`p-4 rounded-xl border transition-all cursor-pointer ${activeTactic === tactic.id ? "bg-orange-50 border-orange-200 shadow-sm" : "bg-white border-gray-100 hover:border-orange-100"}`}
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                {tactic.status === "Pending" && (
                  <div className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
                )}
                <h4 className="font-bold text-gray-800 text-sm">
                  {tactic.title}
                </h4>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-white rounded border border-gray-200 text-gray-500 uppercase">
                {tactic.difficulty}
              </span>
            </div>

            <p className="text-xs text-gray-500 mb-3 leading-snug">
              <span className="font-bold text-red-400">Problem:</span>{" "}
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
                  <div className="p-3 bg-white rounded-lg border border-orange-100 mb-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-orange-600 mb-1">
                      <FaMagic /> AI Recommendation
                    </div>
                    <p className="text-sm text-gray-800 font-medium leading-relaxed">
                      {tactic.solution}
                    </p>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <div className="text-xs font-bold text-emerald-600">
                      Exp. Impact: {tactic.impact}
                    </div>
                    <button className="px-3 py-1.5 bg-gray-900 text-white text-xs font-bold rounded-lg flex items-center gap-2 hover:bg-black transition-colors">
                      Generate Assets <FaArrowRight />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {activeTactic !== tactic.id && (
              <div className="flex justify-between items-center pt-2 border-t border-dashed border-gray-100">
                <span className="text-[10px] uppercase font-bold text-gray-400">
                  Solution
                </span>
                <div className="flex items-center gap-1 text-xs font-medium text-gray-600">
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
