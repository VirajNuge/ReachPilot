import React, { useState } from "react";
import { FaBolt, FaRocket } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

import { GrowthTask } from "../../../../../lib/types/analysis";

// ... Types ...
interface PriorityHeatmapProps {
  tasks?: GrowthTask[];
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
    type: "Funnel",
    status: "Pending",
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
    type: "Content",
    status: "Pending",
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
    type: "Content",
    status: "Pending",
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
    type: "Content",
    status: "Pending",
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
    type: "Crowd",
    status: "Pending",
  },
];

export default function PriorityHeatmap({
  tasks = MOCK_TASKS,
}: PriorityHeatmapProps) {
  const [selectedTask, setSelectedTask] = useState<GrowthTask | null>(null);
  const displayTasks = tasks && tasks.length > 0 ? tasks : MOCK_TASKS;

  const getPosition = (impact: number, effort: number) => {
    const top = `${Math.max(5, Math.min(95, (10 - impact) * 10 + 5))}%`;
    const left = `${Math.max(5, Math.min(95, (effort - 1) * 10 + 5))}%`;
    return { top, left };
  };

  // Palette-mapped category colors
  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case "Quick Win":
        return "bg-[#caee55] shadow-[#caee55]/30 text-[#000100]";
      case "Big Bet":
        return "bg-[#074ed5] shadow-[#074ed5]/30 text-white";
      case "Filler":
        return "bg-slate-400 shadow-slate-200 text-white";
      case "Money Pit":
        return "bg-[#000100] shadow-black/20 text-white";
      default:
        return "bg-slate-500 text-white";
    }
  };

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case "Quick Win":
        return "bg-[#caee55]/20 text-[#000100] border-[#caee55]/40";
      case "Big Bet":
        return "bg-[#074ed5]/10 text-[#074ed5] border-[#074ed5]/20";
      case "Filler":
        return "bg-slate-100 text-slate-600 border-slate-200";
      case "Money Pit":
        return "bg-[#000100]/10 text-[#000100] border-[#000100]/20";
      default:
        return "bg-slate-100 text-slate-600 border-slate-200";
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
    <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.05)] h-full overflow-hidden flex flex-col md:flex-row">
      {/* LEFT: The Matrix Visualization */}
      <div className="flex-1 p-6 relative border-r border-slate-100 min-h-[350px]">
        {/* Header */}
        <div className="flex justify-between items-start mb-5">
          <div>
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
              Growth Command
            </h4>
            <div className="relative group cursor-help inline-block">
              <h2 className="text-xl font-black text-[#000100] leading-none mb-1">
                Priority Heatmap
              </h2>
              <div className="absolute left-0 top-full mt-2 w-64 p-3 bg-[#000100] text-white text-xs rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none">
                Visualizes your growth tasks based on Impact vs. Effort. Focus
                on "Quick Wins" (High Impact, Low Effort) and avoid "Money
                Pits".
                <div className="absolute left-4 -top-1 w-2 h-2 bg-[#000100] transform rotate-45"></div>
              </div>
            </div>
            <p className="text-xs font-medium text-slate-500">
              Impact vs. Effort Matrix
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Legend */}
            <div className="flex gap-2 text-[10px] font-bold uppercase">
              <span className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#caee55]"></div>
                <span className="text-slate-500">Quick Win</span>
              </span>
              <span className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#074ed5]"></div>
                <span className="text-slate-500">Big Bet</span>
              </span>
            </div>
            <div className="p-2.5 bg-[#074ed5] text-white rounded-2xl shadow-sm shrink-0">
              <FaBolt size={16} />
            </div>
          </div>
        </div>

        {/* The Grid Container */}
        <div className="relative w-full h-[280px] bg-[#f4f8fb] rounded-2xl border border-slate-100">
          {/* Axis Labels */}
          <div className="absolute -left-6 top-1/2 -rotate-90 text-[10px] font-bold text-slate-400 tracking-widest">
            IMPACT
          </div>
          <div className="absolute bottom-[-20px] left-1/2 -translate-x-1/2 text-[10px] font-bold text-slate-400 tracking-widest">
            EFFORT
          </div>

          {/* Quadrant Dividers */}
          <div className="absolute top-1/2 left-0 w-full border-t border-dashed border-slate-200"></div>
          <div className="absolute left-1/2 top-0 h-full border-l border-dashed border-slate-200"></div>

          {/* Quadrant Labels */}
          <div className="absolute top-2 left-3 text-[10px] font-black text-[#caee55] uppercase tracking-wider">
            Quick Wins
          </div>
          <div className="absolute top-2 right-3 text-[10px] font-black text-[#074ed5]/40 uppercase tracking-wider">
            Big Bets
          </div>
          <div className="absolute bottom-2 left-3 text-[10px] font-black text-slate-300 uppercase tracking-wider">
            Fillers
          </div>
          <div className="absolute bottom-2 right-3 text-[10px] font-black text-[#000100]/20 uppercase tracking-wider">
            Money Pits
          </div>

          {/* Tasks Dots */}
          {displayTasks.map((task) => {
            const pos = getPosition(task.impact, task.effort);
            return (
              <motion.button
                key={task.id}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.2, zIndex: 10 }}
                onClick={() => setSelectedTask(task)}
                className={`absolute w-8 h-8 -ml-4 -mt-4 rounded-full flex items-center justify-center text-xs shadow-lg border-2 border-white transition-colors ${getCategoryColor(task.category)} ${selectedTask?.id === task.id ? "ring-4 ring-offset-2 ring-[#074ed5]/30" : ""}`}
                style={{ top: pos.top, left: pos.left }}
              >
                {getIcon(task.actionType || "Strategy")}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* RIGHT: Task Details Card */}
      <div className="w-full md:w-[300px] bg-[#f4f8fb] p-6 flex flex-col border-l border-slate-100">
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
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide border ${getCategoryBadge(selectedTask.category)}`}
                >
                  {selectedTask.category}
                </span>
              </div>

              <h4 className="text-lg font-black text-[#000100] leading-tight mb-3">
                {selectedTask.title}
              </h4>

              <div className="p-3 bg-white border border-slate-100 rounded-xl mb-4 shadow-sm">
                <div className="text-[10px] font-bold text-[#074ed5] uppercase mb-1">
                  Why this task?
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {selectedTask.reasoning}
                </p>
              </div>

              <div className="mt-auto grid grid-cols-2 gap-3">
                <div className="p-3 bg-white rounded-xl border border-slate-100 text-center">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">
                    Impact
                  </div>
                  <div className="text-xl font-black text-[#074ed5]">
                    {selectedTask.impact}/10
                  </div>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-100 text-center">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">
                    Effort
                  </div>
                  <div className="text-xl font-black text-[#000100]">
                    {selectedTask.effort}/10
                  </div>
                </div>
              </div>

              <button className="w-full mt-4 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all bg-[#000100] hover:bg-black text-white">
                <FaRocket className="text-[#caee55]" /> Start Execution
              </button>
            </motion.div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-12 h-12 rounded-2xl bg-[#074ed5]/10 flex items-center justify-center mb-3">
                <FaBolt className="text-[#074ed5]" size={20} />
              </div>
              <p className="font-bold text-[#000100]">Select a task</p>
              <p className="text-xs text-slate-400 mt-1">to view action plan</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
