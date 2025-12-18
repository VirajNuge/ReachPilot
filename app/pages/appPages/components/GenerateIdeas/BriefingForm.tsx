"use client";

import React, { useState } from "react";
import { Sparkles, ArrowRight } from "lucide-react";

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
  // --- Local State ---
  const [topic, setTopic] = useState("");
  const [audience, setAudience] = useState("");
  const [goal, setGoal] = useState("viral");
  const [vibe, setVibe] = useState("Educational");

  // Handler
  const handleSubmit = () => {
    if (!topic) return;
    onGenerate({ topic, audience, goal, vibe });
  };

  const isValid = topic.length > 2;

  return (
    <div className="space-y-8 pb-40">
      {/* 1. The Inputs */}
      <section>
        <TopicInput
          topic={topic}
          setTopic={setTopic}
          audience={audience}
          setAudience={setAudience}
        />
      </section>

      {/* 2. The Strategy */}
      <section>
        <GoalSelector
          goal={goal}
          setGoal={setGoal}
          vibe={vibe}
          setVibe={setVibe}
        />
      </section>

      {/* 3. Primary Trigger (Sticky Bottom) */}
      <div className="pt-6 border-t border-gray-100 sticky bottom-0 bg-white pb-4 z-10">
        <button
          onClick={handleSubmit}
          disabled={!isValid || isGenerating}
          className={`
            w-full py-4 px-6 rounded-xl font-bold text-sm uppercase tracking-wide shadow-lg transition-all transform flex items-center justify-center gap-3
            ${
              isValid && !isGenerating
                ? "bg-yellow-500 hover:bg-yellow-600 text-white shadow-yellow-200 hover:scale-[1.02] active:scale-[0.98]"
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
              <Sparkles size={20} className={isValid ? "animate-pulse" : ""} />{" "}
              Generate Blueprints
            </>
          )}
        </button>

        <p className="text-center text-[10px] text-gray-400 mt-3 font-medium">
          Generates 6 unique concepts. Consumes ~150 AI tokens.
        </p>
      </div>
    </div>
  );
}
