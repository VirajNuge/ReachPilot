import React, { useState } from "react";
import {
  FaBolt,
  FaCheckCircle,
  FaExclamationTriangle,
  FaHourglassHalf,
  FaRocket,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

// --- Types ---
export interface GrowthTask {
  id: string;
  title: string;
  category: "Quick Win" | "Big Bet" | "Filler" | "Money Pit";
  impact: number; // 1-10
  effort: number; // 1-10
  reasoning: string;
  actionType: "Bio" | "Content" | "Strategy" | "Tech";
}

// --- Mock Data ---
const MOCK_TASKS: GrowthTask[] = [
  {
    id: "1",
    title: "Add 'Lead Magnet' Link",
    category: "Quick Win",
    impact: 9,
    effort: 2,
    reasoning:
      "Competitor has no lead magnet. You can capture 20% more leads instantly.",
    actionType: "Tech",
  },
  {
    id: "2",
    title: "Launch 'React Patterns' Series",
    category: "Big Bet",
    impact: 9,
    effort: 8,
    reasoning:
      "High demand in 'The Crowd' for advanced tutorials. Will drive authority.",
    actionType: "Content",
  },
  {
    id: "3",
    title: "Update Highlight Covers",
    category: "Filler",
    impact: 3,
    effort: 3,
    reasoning:
      "Visual polish. Good for brand consistency but won't drive immediate growth.",
    actionType: "Bio",
  },
  {
    id: "4",
    title: "Podcast Launch",
    category: "Money Pit",
    impact: 4,
    effort: 9,
    reasoning:
      "Saturated market. High effort with low probability of short-term return.",
    actionType: "Strategy",
  },
  {
    id: "5",
    title: "Reply to 'Skeptics'",
    category: "Quick Win",
    impact: 8,
    effort: 3,
    reasoning:
      "30+ unanswered questions in competitor comments. Easy authority win.",
    actionType: "Strategy",
  },
];

export default function PriorityHeatmap() {
  const [selectedTask, setSelectedTask] = useState<GrowthTask | null>(null);

  // Helper to position dots on the 10x10 grid
  const getPosition = (impact: number, effort: number) => {
    // Impact (Y): 10 is top (0%), 1 is bottom (100%)
    // Effort (X): 1 is left (0%), 10 is right (100%)
    const top = `${(10 - impact) * 10 + 5}%`;
    const left = `${(effort - 1) * 11 + 5}%`;
    return { top, left };
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case "Quick Win":
        return "bg-emerald-500 shadow-emerald-200";
      case "Big Bet":
        return "bg-indigo-500 shadow-indigo-200";
      case "Filler":
        return "bg-gray-400 shadow-gray-200";
      case "Money Pit":
        return "bg-red-500 shadow-red-200";
      default:
        return "bg-gray-500";
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "Bio":
        return "👤";
      case "Content":
        return "📝";
      case "Strategy":
        return "♟️";
      case "Tech":
        return "💻";
      default:
        return "⚡";
    }
  };

  return (
    <div className="h-full bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col md:flex-row">
      {/* LEFT: The Matrix Visualization */}
      <div className="flex-1 p-6 relative border-r border-gray-50 min-h-[350px]">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div className="relative group cursor-help flex items-center gap-2">
            <FaBolt className="text-yellow-500" />
            <h3 className="font-bold text-gray-900 border-b border-dashed border-gray-300 inline-block">
              Priority Heatmap
            </h3>
            <div className="absolute left-0 top-full mt-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none">
              Visualizes your growth tasks based on Impact vs. Effort. Focus on
              "Quick Wins" (High Impact, Low Effort) and avoid "Money Pits".
              <div className="absolute -top-1 left-4 w-2 h-2 bg-gray-900 rotate-45"></div>
            </div>
          </div>
          <div className="flex gap-3 text-[10px] font-bold uppercase text-gray-400">
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div> Quick
              Win
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-indigo-500"></div> Big Bet
            </span>
          </div>
        </div>

        {/* The Grid Container */}
        <div className="relative w-full h-[280px] bg-gray-50/50 rounded-xl border border-gray-100">
          {/* Axis Labels */}
          <div className="absolute -left-6 top-1/2 -rotate-90 text-[10px] font-bold text-gray-400 tracking-widest">
            IMPACT
          </div>
          <div className="absolute bottom-[-20px] left-1/2 -translate-x-1/2 text-[10px] font-bold text-gray-400 tracking-widest">
            EFFORT
          </div>

          {/* Quadrant Dividers */}
          <div className="absolute top-1/2 left-0 w-full h-px bg-gray-200 border-t border-dashed border-gray-300"></div>
          <div className="absolute left-1/2 top-0 h-full w-px bg-gray-200 border-l border-dashed border-gray-300"></div>

          {/* Quadrant Labels (Subtle) */}
          <div className="absolute top-2 left-2 text-[10px] font-bold text-emerald-600/30 uppercase">
            Quick Wins
          </div>
          <div className="absolute top-2 right-2 text-[10px] font-bold text-indigo-600/30 uppercase">
            Big Bets
          </div>
          <div className="absolute bottom-2 left-2 text-[10px] font-bold text-gray-400/30 uppercase">
            Fillers
          </div>
          <div className="absolute bottom-2 right-2 text-[10px] font-bold text-red-400/30 uppercase">
            Money Pits
          </div>

          {/* Tasks Dots */}
          {MOCK_TASKS.map((task) => {
            const pos = getPosition(task.impact, task.effort);
            return (
              <motion.button
                key={task.id}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.2, zIndex: 10 }}
                onClick={() => setSelectedTask(task)}
                className={`absolute w-8 h-8 -ml-4 -mt-4 rounded-full flex items-center justify-center text-xs text-white shadow-lg border-2 border-white transition-colors ${getCategoryColor(task.category)} ${selectedTask?.id === task.id ? "ring-4 ring-offset-2 ring-indigo-200" : ""}`}
                style={{ top: pos.top, left: pos.left }}
              >
                {getIcon(task.actionType)}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* RIGHT: Task Details Card */}
      <div className="w-full md:w-[320px] bg-gray-50/50 p-6 flex flex-col">
        <AnimatePresence mode="wait">
          {selectedTask ? (
            <motion.div
              key={selectedTask.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col h-full"
            >
              <div className="mb-4">
                <span
                  className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide border ${
                    selectedTask.category === "Quick Win"
                      ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                      : selectedTask.category === "Big Bet"
                        ? "bg-indigo-100 text-indigo-700 border-indigo-200"
                        : selectedTask.category === "Money Pit"
                          ? "bg-red-100 text-red-700 border-red-200"
                          : "bg-gray-200 text-gray-600 border-gray-300"
                  }`}
                >
                  {selectedTask.category}
                </span>
              </div>

              <h4 className="text-lg font-bold text-gray-900 leading-tight mb-3">
                {selectedTask.title}
              </h4>

              <div className="p-3 bg-white border border-gray-200 rounded-xl mb-4 shadow-sm">
                <div className="text-[10px] font-bold text-gray-400 uppercase mb-1">
                  Why this task?
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {selectedTask.reasoning}
                </p>
              </div>

              <div className="mt-auto grid grid-cols-2 gap-3">
                <div className="p-2 bg-white rounded border border-gray-100 text-center">
                  <div className="text-[10px] text-gray-400 font-bold uppercase">
                    Impact
                  </div>
                  <div className="text-xl font-black text-gray-800">
                    {selectedTask.impact}/10
                  </div>
                </div>
                <div className="p-2 bg-white rounded border border-gray-100 text-center">
                  <div className="text-[10px] text-gray-400 font-bold uppercase">
                    Effort
                  </div>
                  <div className="text-xl font-black text-gray-800">
                    {selectedTask.effort}/10
                  </div>
                </div>
              </div>

              <button className="w-full mt-4 py-3 bg-gray-900 hover:bg-black text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg">
                <FaRocket /> Start Execution
              </button>
            </motion.div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center opacity-40">
              <div className="text-4xl mb-3">👆</div>
              <p className="font-bold text-gray-800">
                Select a task
                <br />
                to view action plan
              </p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
