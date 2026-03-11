"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BsPlusLg,
  BsLightbulb,
  BsCheckCircleFill,
  BsTrash,
  BsArrowRight,
  BsMagic,
} from "react-icons/bs";
import GhostDraftModal from "../GhostDraftModal/GhostDraftModal";

interface Idea {
  id: string;
  concept: string;
  impact: string;
  status: "todo" | "inprogress" | "done";
}

interface IdeaPlannerProps {
  initialIdeas?: Array<{ concept: string; impact: string }>;
}

const IdeaPlanner: React.FC<IdeaPlannerProps> = ({ initialIdeas = [] }) => {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [newIdeaInput, setNewIdeaInput] = useState("");
  const [activeDraftIdea, setActiveDraftIdea] = useState<{
    concept: string;
    impact: string;
  } | null>(null);

  // Load from LocalStorage or Initial Props
  useEffect(() => {
    try {
      const saved = localStorage.getItem("reachpilot_idea_planner");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setIdeas(parsed);
        }
      } else if (initialIdeas.length > 0) {
        const formatted = initialIdeas.map((idea, i) => ({
          id: `init-${i}`,
          concept: idea.concept,
          impact: idea.impact,
          status: "todo" as const,
        }));
        setIdeas(formatted);
      }
    } catch (error) {
      console.error("Error loading ideas from localStorage:", error);
      if (initialIdeas.length > 0) {
        const formatted = initialIdeas.map((idea, i) => ({
          id: `init-${i}`,
          concept: idea.concept,
          impact: idea.impact,
          status: "todo" as const,
        }));
        setIdeas(formatted);
      }
    }
  }, [initialIdeas]);

  // Save to LocalStorage
  useEffect(() => {
    if (ideas.length > 0) {
      localStorage.setItem("reachpilot_idea_planner", JSON.stringify(ideas));
    }
  }, [ideas]);

  const addIdea = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newIdeaInput.trim()) return;

    const newIdea: Idea = {
      id: Date.now().toString(),
      concept: newIdeaInput,
      impact: "User Generated",
      status: "todo",
    };

    setIdeas((prev) => [newIdea, ...prev]);
    setNewIdeaInput("");
  };

  const moveIdea = (id: string, newStatus: Idea["status"]) => {
    setIdeas((prev) =>
      prev.map((idea) => {
        if (idea.id === id) {
          if (newStatus === "inprogress" && idea.status === "todo") {
            setActiveDraftIdea({ concept: idea.concept, impact: idea.impact });
          }
          return { ...idea, status: newStatus };
        }
        return idea;
      }),
    );
  };

  const deleteIdea = (id: string) => {
    setIdeas((prev) => prev.filter((idea) => idea.id !== id));
  };

  return (
    <div className="w-full flex lg:grid lg:grid-cols-3 gap-4 lg:gap-6 h-[650px] overflow-x-auto snap-x snap-mandatory lg:snap-none scroll-px-4 lg:overflow-visible pb-4 lg:pb-0 [&::-webkit-scrollbar]:hidden">
      <GhostDraftModal
        idea={activeDraftIdea}
        onClose={() => setActiveDraftIdea(null)}
      />

      {/* Column 1: Idea Bank (To Do) */}
      <div className="min-w-[85vw] md:min-w-[50vw] lg:min-w-0 snap-center shrink-0 flex flex-col h-full bg-gray-50/50 rounded-[24px] border border-gray-100 p-2">
        <div className="flex justify-between items-center mb-4 p-4 pb-0">
          <div>
            <h4 className="font-bold text-gray-900 text-lg">Idea Bank</h4>
            <p className="text-xs text-gray-400 font-medium">Capture & Plan</p>
          </div>
          <span className="text-xs font-bold text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-100 shadow-sm">
            {ideas.filter((i) => i.status === "todo").length}
          </span>
        </div>

        {/* Add New Input */}
        <div className="px-2 mb-2">
          <form onSubmit={addIdea} className="relative group">
            <input
              type="text"
              placeholder="Capture a new concept..."
              className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-100 shadow-sm transition-all text-gray-800 placeholder:text-gray-400"
              value={newIdeaInput}
              onChange={(e) => setNewIdeaInput(e.target.value)}
            />
            <button
              type="submit"
              className="absolute right-2 top-2 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:scale-105 disabled:opacity-0 bg-[#000100] hover:bg-black text-white"
              disabled={!newIdeaInput.trim()}
            >
              <BsPlusLg size={12} />
            </button>
          </form>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 custom-scroll p-2">
          <AnimatePresence mode="popLayout">
            {ideas
              .filter((i) => i.status === "todo")
              .map((idea) => (
                <motion.div
                  key={idea.id}
                  layoutId={idea.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white border border-gray-100/80 p-4 rounded-[16px] shadow-sm hover:shadow-md hover:border-gray-200 transition-all group relative"
                >
                  <p className="text-sm font-medium text-gray-700 pr-6 leading-relaxed">
                    {idea.concept}
                  </p>
                  <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-50">
                    <span className="text-[9px] uppercase font-bold text-gray-400 tracking-wider">
                      {idea.impact}
                    </span>
                    <button
                      onClick={() => moveIdea(idea.id, "inprogress")}
                      className="text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 p-1.5 rounded-full transition-all"
                      title="Move to Drafting"
                    >
                      <BsArrowRight size={14} />
                    </button>
                  </div>
                  <button
                    onClick={() => deleteIdea(idea.id)}
                    className="absolute top-3 right-3 text-gray-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <BsTrash size={12} />
                  </button>
                </motion.div>
              ))}
            {ideas.filter((i) => i.status === "todo").length === 0 && (
              <div className="text-center py-12 opacity-50">
                <div className="bg-gray-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-400">
                  <BsLightbulb size={20} />
                </div>
                <p className="text-xs font-medium text-gray-400">
                  Your bank is empty
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Column 2: In Progress (Drafting) */}
      <div className="min-w-[85vw] md:min-w-[50vw] lg:min-w-0 snap-center shrink-0 flex flex-col h-full bg-gradient-to-b from-indigo-50/50 to-white/50 rounded-[24px] border border-indigo-100/50 p-2 relative overflow-hidden">
        {/* Decorative Background */}
        <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-indigo-500/5 blur-[80px] rounded-full pointer-events-none" />

        <div className="flex justify-between items-center mb-4 p-4 pb-0 relative z-10">
          <div>
            <h4 className="font-bold text-indigo-950 text-lg flex items-center gap-2">
              <span className="text-indigo-500 animate-pulse">
                <BsMagic />
              </span>
              Drafting
            </h4>
            <p className="text-xs text-indigo-400/80 font-medium">
              Ghost AI Active
            </p>
          </div>
          <span className="text-xs font-bold text-indigo-500 bg-white px-3 py-1 rounded-full border border-indigo-100 shadow-sm">
            {ideas.filter((i) => i.status === "inprogress").length}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 custom-scroll p-2 relative z-10">
          <AnimatePresence mode="popLayout">
            {ideas
              .filter((i) => i.status === "inprogress")
              .map((idea) => (
                <motion.div
                  key={idea.id}
                  layoutId={idea.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white p-5 rounded-[20px] shadow-sm shadow-indigo-100/50 ring-1 ring-indigo-50 group border border-transparent hover:border-indigo-100 transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className="h-full w-1 bg-gradient-to-b from-indigo-400 to-purple-400 rounded-full mt-1 shrink-0 px-0.5" />
                    <div className="w-full">
                      <p className="text-[15px] font-semibold text-gray-800 mb-3 leading-relaxed">
                        {idea.concept}
                      </p>
                      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-2.5 mb-3 border border-indigo-50">
                        <div className="flex items-center gap-2 text-xs font-semibold text-indigo-700">
                          <BsMagic size={10} className="text-purple-500" />
                          <span>Generating Content...</span>
                        </div>
                      </div>
                      <div className="flex justify-end pt-2 border-t border-gray-50">
                        <button
                          onClick={() => moveIdea(idea.id, "done")}
                          className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide font-bold text-indigo-600 hover:text-white hover:bg-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          Mark Ready <BsArrowRight />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
          </AnimatePresence>
          {ideas.filter((i) => i.status === "inprogress").length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-indigo-300 text-center p-8 opacity-60">
              <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center mb-3">
                <BsMagic size={24} className="text-indigo-200" />
              </div>
              <p className="text-sm font-medium">
                Drag users concepts here to
                <br />
                ignite the Ghost Engine
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Column 3: Done (Published) */}
      <div className="min-w-[85vw] md:min-w-[50vw] lg:min-w-0 snap-center shrink-0 flex flex-col h-full bg-gray-50/30 rounded-[24px] border border-dashed border-gray-200 p-2 opacity-80 hover:opacity-100 transition-opacity">
        <div className="flex justify-between items-center mb-4 p-4 pb-0">
          <div>
            <h4 className="font-bold text-gray-500 text-lg">Published</h4>
            <p className="text-xs text-gray-400 font-medium">
              Archive & History
            </p>
          </div>
          <span className="text-xs font-bold text-gray-400 bg-white px-3 py-1 rounded-full border border-gray-100">
            {ideas.filter((i) => i.status === "done").length}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 custom-scroll p-2">
          <AnimatePresence mode="popLayout">
            {ideas
              .filter((i) => i.status === "done")
              .map((idea) => (
                <motion.div
                  key={idea.id}
                  layoutId={idea.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white border border-gray-100 p-4 rounded-[16px] group transition-all opacity-80 hover:opacity-100"
                >
                  <div className="flex justify-between items-start">
                    <p className="text-sm text-gray-500 line-through decoration-gray-300 font-medium leading-relaxed max-w-[85%]">
                      {idea.concept}
                    </p>
                    <button
                      onClick={() => deleteIdea(idea.id)}
                      className="text-gray-200 hover:text-red-400 transition-colors"
                    >
                      <BsTrash size={12} />
                    </button>
                  </div>

                  <div className="mt-2.5 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-600 border border-emerald-100">
                    <BsCheckCircleFill size={8} />
                    <span className="text-[9px] font-bold uppercase tracking-wider">
                      Posted
                    </span>
                  </div>
                </motion.div>
              ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default IdeaPlanner;
