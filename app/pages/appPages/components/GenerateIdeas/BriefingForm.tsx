"use client";

import React, { useState } from "react";
import { Sparkles, Layers, Box } from "lucide-react";

// --- Sub-Components ---
import TopicInput from "./TopicInput";
import GoalSelector from "./GoalSelector";

interface BriefingFormProps {
  onGenerate: (data: any) => void;
  isGenerating: boolean;
}

export default function BriefingForm({
  onGenerate,
  isGenerating,
}: BriefingFormProps) {
  // --- NEW: Mode Switcher State ---
  const [mode, setMode] = useState<"standard" | "prism">("standard");

  const [topic, setTopic] = useState("");
  const [audience, setAudience] = useState("");
  const [goal, setGoal] = useState("viral");
  const [vibe, setVibe] = useState("Educational");

  const handleSubmit = () => {
    if (!topic) return;
    // We pass the 'mode' up to the parent so it knows which API prompt to use
    onGenerate({ mode, topic, audience, goal, vibe });
  };

  const isValid = topic.length > 2;

  return (
    <div className="space-y-8 pb-40">
      {/* 1. NEW: MODE SWITCHER */}
      <div className="bg-gray-100 p-1 rounded-xl flex">
        <button
          onClick={() => setMode("standard")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold uppercase tracking-wide rounded-lg transition-all ${
            mode === "standard"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          <Layers size={14} /> Standard
        </button>
        <button
          onClick={() => setMode("prism")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold uppercase tracking-wide rounded-lg transition-all ${
            mode === "prism"
              ? "bg-white text-indigo-600 shadow-sm"
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          <Box size={14} /> Prism 360°
        </button>
      </div>

      {/* Context Message based on Mode */}
      {mode === "prism" && (
        <div className="bg-indigo-50 border border-indigo-100 p-3 rounded-lg flex gap-3">
          <div className="mt-0.5 text-indigo-600">
            <Box size={16} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-indigo-900">
              Prism Mode Active
            </h4>
            <p className="text-[10px] text-indigo-700 leading-relaxed">
              We will ignore "Goals" and generate 6 distinct angles (Contrarian,
              Analytical, Storyteller, etc.) for your topic.
            </p>
          </div>
        </div>
      )}

      {/* 2. The Inputs */}
      <section>
        <TopicInput
          topic={topic}
          setTopic={setTopic}
          audience={audience}
          setAudience={setAudience}
        />
      </section>

      {/* 3. The Strategy (Hidden in Prism Mode because Prism SETS the strategy) */}
      {mode === "standard" && (
        <section className="animate-in slide-in-from-top-2 duration-300">
          <GoalSelector
            goal={goal}
            setGoal={setGoal}
            vibe={vibe}
            setVibe={setVibe}
          />
        </section>
      )}

      {/* 4. Primary Trigger */}
      <div className="pt-6 border-t border-gray-100 sticky bottom-0 bg-white pb-4 z-10">
        <button
          onClick={handleSubmit}
          disabled={!isValid || isGenerating}
          className={`
            w-full py-4 px-6 rounded-xl font-bold text-sm uppercase tracking-wide shadow-lg transition-all transform flex items-center justify-center gap-3
            ${
              isValid && !isGenerating
                ? mode === "prism"
                  ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200"
                  : "bg-yellow-500 hover:bg-yellow-600 text-white shadow-yellow-200"
                : "bg-gray-100 text-gray-400 cursor-not-allowed shadow-none"
            }
          `}
        >
          {isGenerating ? (
            <>
              <Sparkles size={20} className="animate-spin" /> Generating...
            </>
          ) : (
            <>
              <Sparkles size={20} className={isValid ? "animate-pulse" : ""} />
              {mode === "prism" ? "Run Prism Analysis" : "Generate Blueprints"}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
