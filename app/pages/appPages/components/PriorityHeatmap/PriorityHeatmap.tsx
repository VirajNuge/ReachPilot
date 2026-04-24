import React, { useState } from "react";
import {
  FaBolt,
  FaRocket,
  FaUser,
  FaPenNib,
  FaChessKnight,
  FaLaptopCode,
} from "react-icons/fa";
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
      "Your competitor has zero lead capture on their profile — no link, no freebie, no tripwire. This is a direct revenue gap you can exploit immediately. By adding a single lead magnet link (a free checklist, template, or mini-course), you intercept audience curiosity at the exact moment it peaks. Audience data shows 20–30% of profile visitors never return after the first visit, meaning every day without a capture mechanism is permanently lost pipeline. High impact (9/10) because a single link can funnel hundreds of warm leads per week. Low effort (2/10) because it requires only a bio edit and a pre-existing asset.",
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
      "Crowd analysis identified 'advanced React patterns' as the #1 unanswered demand across competitor comment threads — dozens of questions, almost no quality answers. Launching a dedicated series positions you as the definitive authority on this topic before any competitor fills the gap. This is a Big Bet: the investment is real (8/10 effort — consistent scripting, recording, and publishing over weeks), but the compound return is massive. Authority content in an underserved niche drives follower growth, saves, and shares simultaneously. Every episode builds long-tail discoverability. The series also creates repurposable assets (clips, carousels, threads) that extend reach across formats.",
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
      "Visual polish has a real but limited effect on trust signals — a visitor's first impression of your profile is partly shaped by brand cohesion. Mismatched or dated highlight covers subtly erode perceived authority. However, this task sits firmly in the Filler quadrant: it won't drive follower growth, improve reach, or generate leads on its own. The ROI is proportional to how much traffic your profile already receives. Complete this only during low-energy work sessions or when other higher-priority tasks are blocked. Pair it with a bio refresh to maximise the session's value. Effort and impact are symmetrically low (3/10 each) — it's a maintenance task, not a growth lever.",
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
      "The podcast space is hyper-saturated — over 4 million active shows compete for listener attention, and discovery algorithms on audio platforms heavily favour established shows with back-catalogues. For a creator at your current follower tier, launching a podcast requires massive upfront investment: equipment, editing, guest booking, distribution, promotion — all before a single episode earns back its cost. The impact ceiling at this stage is modest (4/10), primarily limited to deepening existing fan relationships rather than driving new audience growth. Unless you have an existing high-intent email list of 5,000+, the probability of short-term traction is low. Revisit this after you've hit the next follower milestone and have a warm audience ready to migrate.",
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
      "Crowd analysis flagged 30+ unanswered questions sitting in your competitor's comment sections — specifically from 'Skeptic' audience segments who are actively searching for better answers. These are warm prospects who already self-identified their pain point and are receptive to value. Engaging them directly with thoughtful, insight-driven replies costs almost no resources (3/10 effort) but delivers outsized authority signals: you appear in their notifications, the comment thread, and potentially their algorithm feed. The conversion pathway is clear — value reply → profile visit → follow → eventual lead. Replying to even 10 of these comments per week can drive 50–100 new targeted profile visits. Impact is high (8/10) because you're converting competitor audience members at the peak of their curiosity.",
    actionType: "Strategy",
    type: "Crowd",
    status: "Pending",
  },
];

// Derive a rich breakdown from task fields beyond the raw reasoning string
function getDetailedReasoning(task: GrowthTask): {
  summary: string;
  impactNote: string;
  effortNote: string;
  categoryNote: string;
  actionNote: string;
} {
  const impactNote =
    task.impact >= 8
      ? "High-leverage opportunity — top-tier impact on growth trajectory."
      : task.impact >= 5
        ? "Moderate impact — meaningful but not transformational on its own."
        : "Low impact — marginal value; deprioritise unless other tasks are blocked.";

  const effortNote =
    task.effort <= 3
      ? "Low effort — executable in a single focused session."
      : task.effort <= 6
        ? "Medium effort — requires planning across multiple sessions."
        : "High effort — significant time and resource commitment required.";

  const categoryMap: Record<string, string> = {
    "Quick Win":
      "Prioritise immediately — high return for minimal investment. Execute this before anything else.",
    "Big Bet":
      "High upside but high commitment. Plan carefully and track milestones.",
    Filler:
      "Low urgency. Schedule during downtime or when higher-priority tasks are blocked.",
    "Money Pit":
      "Avoid or defer. Cost exceeds expected return at your current growth stage.",
  };

  const actionMap: Record<string, string> = {
    Bio: "Execution happens directly on your profile — fast to ship.",
    Content: "Content production required — schedule dedicated creation blocks.",
    Strategy:
      "Strategic/behavioural change — no hard assets needed, just consistent execution.",
    Tech: "Technical or tool-based setup — one-time investment with ongoing returns.",
  };

  return {
    summary: task.reasoning,
    impactNote,
    effortNote,
    categoryNote: categoryMap[task.category] ?? "",
    actionNote: actionMap[task.actionType] ?? "",
  };
}

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
        return <FaUser size={11} />;
      case "Content":
        return <FaPenNib size={11} />;
      case "Strategy":
        return <FaChessKnight size={11} />;
      case "Tech":
        return <FaLaptopCode size={11} />;
      default:
        return <FaBolt size={11} />;
    }
  };

  const getActionTypeLabel = (type: string) => {
    switch (type) {
      case "Bio":
        return "Profile";
      case "Content":
        return "Content";
      case "Strategy":
        return "Strategy";
      case "Tech":
        return "Tech";
      default:
        return type;
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
      <div className="w-full md:w-[320px] bg-[#f4f8fb] p-6 flex flex-col border-l border-slate-100 overflow-y-auto custom-scrollbar">
        <AnimatePresence mode="wait">
          {selectedTask ? (
            <motion.div
              key={selectedTask.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col"
            >
              <div className="mb-4">
                <span
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide border ${getCategoryBadge(selectedTask.category)}`}
                >
                  {selectedTask.category}
                </span>
              </div>

              <h4 className="text-lg font-black text-[#000100] leading-tight mb-4">
                {selectedTask.title}
              </h4>

              {/* Detailed Reasoning Section */}
              {(() => {
                const detail = getDetailedReasoning(selectedTask);
                return (
                  <div className="flex flex-col gap-3 mb-4">
                    {/* Main reasoning */}
                    <div className="p-3 bg-white border border-slate-100 rounded-xl shadow-sm">
                      <div className="text-[10px] font-bold text-[#074ed5] uppercase mb-1.5">
                        Why this task?
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {detail.summary}
                      </p>
                    </div>

                    {/* Impact note */}
                    <div className="p-3 bg-white border border-[#074ed5]/10 rounded-xl shadow-sm">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#074ed5] uppercase mb-1">
                        <FaBolt size={9} /> Impact Assessment
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {detail.impactNote}
                      </p>
                    </div>

                    {/* Effort note */}
                    <div className="p-3 bg-white border border-slate-100 rounded-xl shadow-sm">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase mb-1">
                        <FaRocket size={9} /> Effort Required
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {detail.effortNote}
                      </p>
                    </div>

                    {/* Category verdict */}
                    <div className="p-3 bg-white border border-[#caee55]/30 rounded-xl shadow-sm">
                      <div className="text-[10px] font-bold text-[#000100] uppercase mb-1">
                        Quadrant Verdict
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {detail.categoryNote}
                      </p>
                    </div>
                  </div>
                );
              })()}

              {/* Metrics Row */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="p-2.5 bg-white rounded-xl border border-slate-100 text-center">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">
                    Impact
                  </div>
                  <div className="text-lg font-black text-[#074ed5]">
                    {selectedTask.impact}
                    <span className="text-[10px] font-bold text-slate-300">
                      /10
                    </span>
                  </div>
                </div>
                <div className="p-2.5 bg-white rounded-xl border border-slate-100 text-center">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">
                    Effort
                  </div>
                  <div className="text-lg font-black text-[#000100]">
                    {selectedTask.effort}
                    <span className="text-[10px] font-bold text-slate-300">
                      /10
                    </span>
                  </div>
                </div>
                <div className="p-2.5 bg-white rounded-xl border border-slate-100 text-center flex flex-col items-center justify-center">
                  <div className="text-[10px] text-slate-400 font-bold uppercase mb-1">
                    Type
                  </div>
                  <div className="flex items-center gap-1 text-[#074ed5]">
                    {getIcon(selectedTask.actionType)}
                    <span className="text-[10px] font-bold text-slate-600">
                      {getActionTypeLabel(selectedTask.actionType)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action type note */}
              {(() => {
                const detail = getDetailedReasoning(selectedTask);
                return (
                  <div className="p-3 bg-[#074ed5]/5 border border-[#074ed5]/10 rounded-xl">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#074ed5] uppercase mb-1">
                      {getIcon(selectedTask.actionType)} Execution Mode
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {detail.actionNote}
                    </p>
                  </div>
                );
              })()}
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
