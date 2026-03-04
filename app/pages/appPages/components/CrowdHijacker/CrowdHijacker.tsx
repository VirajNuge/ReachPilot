import React, { useState } from "react";
import { FaUserFriends, FaReply, FaRocket } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

// --- Types ---
import { CrowdTactic } from "../../../../../lib/types/analysis";

interface CrowdHijackerProps {
  crowdTactics?: CrowdTactic[];
}

export default function CrowdHijacker({ crowdTactics }: CrowdHijackerProps) {
  const [activeTactic, setActiveTactic] = useState<string | null>(null);

  const tactics = crowdTactics || [];

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
              Crowd Hijacker
            </h2>
            <div className="absolute left-0 top-full mt-2 w-64 p-3 bg-[#000100] text-white text-xs rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none">
              Strategies to engage the competitor's audience directly. Turns
              their "Skeptics" into your "Believers" through targeted
              interaction.
              <div className="absolute left-4 -top-1 w-2 h-2 bg-[#000100] transform rotate-45"></div>
            </div>
          </div>
          <p className="text-xs font-medium text-slate-500">
            Community Engagement
          </p>
        </div>
        <div className="p-2.5 bg-[#000100] text-white rounded-2xl shadow-sm shrink-0">
          <FaUserFriends size={16} />
        </div>
      </div>

      <div className="p-4 flex flex-col gap-3 overflow-y-auto custom-scrollbar flex-1">
        {tactics.length === 0 && (
          <div className="flex flex-col items-center justify-center flex-1 py-8 text-center">
            <div className="w-10 h-10 rounded-2xl bg-[#000100]/10 flex items-center justify-center mb-2">
              <FaUserFriends className="text-[#000100]" />
            </div>
            <p className="text-sm font-bold text-[#000100]">No tactics yet</p>
            <p className="text-xs text-slate-400">
              Run an analysis to see crowd tactics
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
            className={`p-4 rounded-2xl border transition-all cursor-pointer ${activeTactic === tactic.id ? "bg-[#000100]/5 border-[#000100]/15 shadow-sm" : "bg-white border-slate-100 hover:border-slate-300"}`}
          >
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-bold text-[#000100] text-sm">
                {tactic.title}
              </h4>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-[#caee55]/20 text-[#000100] rounded border border-[#caee55]/30 uppercase">
                {tactic.audienceState}
              </span>
            </div>

            <AnimatePresence>
              {activeTactic === tactic.id ? (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <p className="text-sm text-slate-600 leading-relaxed mb-3">
                    {tactic.action}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-[#f4f8fb] px-2 py-1 rounded-lg border border-slate-100">
                      {tactic.targetParams}
                    </span>
                    <button className="px-4 py-2 bg-[#000100] hover:bg-black text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-[0_4px_14px_0_rgba(0,0,0,0.29)]">
                      <FaRocket className="text-[#caee55]" /> Execute Now
                    </button>
                  </div>
                </motion.div>
              ) : (
                <p className="text-xs text-slate-400 leading-snug">
                  {tactic.action}
                </p>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
