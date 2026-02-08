import React, { useState } from "react";
import {
  FaUserFriends,
  FaCommentDots,
  FaBullhorn,
  FaArrowRight,
  FaReply,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

// --- Types ---
export interface CrowdTactic {
  id: string;
  title: string;
  audienceState: string; // e.g., "Skeptical"
  action: string;
  targetParams?: string; // e.g., "Use Case Study"
  status: "Ready" | "Actioned";
}

// --- Mock Data ---
const MOCK_CROWD: CrowdTactic[] = [
  {
    id: "1",
    title: "Vibe Matching",
    audienceState: "Skeptical",
    action: "Post a Case Study with hard metrics.",
    targetParams: "Trust Builder",
    status: "Ready",
  },
  {
    id: "2",
    title: "Unmet Demand",
    audienceState: "Frustrated",
    action: "Answer top 3 ignored questions about 'Pricing'.",
    targetParams: "Authority Win",
    status: "Ready",
  },
  {
    id: "3",
    title: "Superfan Outreach",
    audienceState: "Engaged",
    action: "Reply to 'Top 5 Fans' on their latest post.",
    targetParams: "Reciprocity",
    status: "Ready",
  },
];

export default function CrowdHijacker() {
  const [activeTactic, setActiveTactic] = useState<string | null>(null);

  return (
    <div className="h-full bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
      <div className="p-6 pb-4 border-b border-gray-50 flex justify-between items-center">
        <div className="flex gap-3 items-center">
          <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
            <FaUserFriends />
          </div>
          <div>
            <div className="relative group cursor-help">
              <h3 className="font-bold text-gray-900 leading-tight border-b border-dashed border-gray-300 inline-block">
                Crowd Hijacker
              </h3>
              <div className="absolute left-0 top-full mt-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none">
                Strategies to engage the competitor's audience directly. Turns
                their "Skeptics" into your "Believers" through targeted
                interaction.
                <div className="absolute -top-1 left-4 w-2 h-2 bg-gray-900 rotate-45"></div>
              </div>
            </div>
            <p className="text-xs text-gray-500">Community Engagement</p>
          </div>
        </div>
      </div>

      <div className="p-4 flex flex-col gap-3 overflow-y-auto custom-scrollbar flex-1">
        {MOCK_CROWD.map((tactic) => (
          <motion.div
            key={tactic.id}
            layout
            onClick={() =>
              setActiveTactic(activeTactic === tactic.id ? null : tactic.id)
            }
            className={`p-4 rounded-xl border transition-all cursor-pointer ${activeTactic === tactic.id ? "bg-blue-50 border-blue-200 shadow-sm" : "bg-white border-gray-100 hover:border-blue-100"}`}
          >
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-bold text-gray-800 text-sm">
                {tactic.title}
              </h4>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-100 text-blue-600 rounded uppercase">
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
                  <p className="text-sm text-gray-700 leading-relaxed mb-3">
                    {tactic.action}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      {tactic.targetParams}
                    </span>
                    <button className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors">
                      <FaReply /> Execute Now
                    </button>
                  </div>
                </motion.div>
              ) : (
                <p className="text-xs text-gray-500 leading-snug">
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
