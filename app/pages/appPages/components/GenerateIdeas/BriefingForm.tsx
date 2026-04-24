"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Layers,
  Box,
  TrendingUp,
  Recycle,
  Search,
  Globe,
} from "lucide-react";

// --- Sub-Components ---
import TopicInput from "./TopicInput";
import GoalSelector from "./GoalSelector";
import type { IdeaMode, IdeaPlatform } from "@/lib/ideaFinder/types";

interface BriefingFormProps {
  onGenerate: (data: {
    mode: IdeaMode;
    topic: string;
    audience: string;
    goal: string;
    vibe: string;
    platform: IdeaPlatform;
    count: number;
  }) => void;
  isGenerating: boolean;
}

const MODE_CONFIG: Array<{
  id: IdeaMode;
  label: string;
  icon: React.ReactNode;
  description: string;
  color: string;
  activeColor: string;
  accent: string;
}> = [
  {
    id: "voice-match",
    label: "Voice-Match",
    icon: <Layers size={14} />,
    description: "Ideas that sound exactly like your brand voice",
    color: "text-slate-400",
    activeColor: "bg-[#0052FF]/5 border-[#0052FF]/20 text-[#0052FF]",
    accent: "bg-[#0052FF]",
  },
  {
    id: "trend-jacker",
    label: "Trend-Jacker",
    icon: <TrendingUp size={14} />,
    description: "Ride trending topics with your unique angle",
    color: "text-slate-400",
    activeColor: "bg-rose-50 border-rose-200 text-rose-600",
    accent: "bg-rose-500",
  },
  {
    id: "repurpose",
    label: "Repurpose",
    icon: <Recycle size={14} />,
    description: "Remix your best-performing content into new formats",
    color: "text-slate-400",
    activeColor: "bg-emerald-50 border-emerald-200 text-emerald-600",
    accent: "bg-emerald-500",
  },
  {
    id: "gap-filler",
    label: "Gap Filler",
    icon: <Search size={14} />,
    description: "Discover topics your audience wants but you haven't covered",
    color: "text-slate-400",
    activeColor: "bg-blue-50 border-blue-200 text-blue-600",
    accent: "bg-blue-500",
  },
  {
    id: "prism",
    label: "Prism 360°",
    icon: <Box size={14} />,
    description: "One topic, 10+ angles across different frameworks",
    color: "text-slate-400",
    activeColor: "bg-indigo-50 border-indigo-200 text-indigo-600",
    accent: "bg-indigo-500",
  },
];

const PLATFORMS: Array<{ id: IdeaPlatform; label: string; icon: React.ReactNode }> = [
  { id: "all", label: "All", icon: <Globe size={14} /> },
  { id: "instagram", label: "Instagram", icon: <span className="text-xs">📸</span> },
  { id: "linkedin", label: "LinkedIn", icon: <span className="text-xs">💼</span> },
  { id: "x", label: "X", icon: <span className="text-xs">𝕏</span> },
  { id: "facebook", label: "Facebook", icon: <span className="text-xs">📘</span> },
];

export default function BriefingForm({
  onGenerate,
  isGenerating,
}: BriefingFormProps) {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [mode, setMode] = useState<IdeaMode>("voice-match");
  const [platform, setPlatform] = useState<IdeaPlatform>("all");
  const [topic, setTopic] = useState("");
  const [audience, setAudience] = useState("");
  const [goal, setGoal] = useState("viral");
  const [vibe, setVibe] = useState("Educational");

  const handleSubmit = () => {
    if (!topic && mode !== "gap-filler" && mode !== "repurpose") return;
    onGenerate({ mode, topic, audience, goal, vibe, platform, count: 8 });
  };

  const activeConfig = MODE_CONFIG.find((m) => m.id === mode)!;

  // Gap-filler and repurpose don't strictly require topic
  const isValid =
    mode === "gap-filler" || mode === "repurpose" || topic.length > 2;

  const canGoStep2 = true;
  const canGoStep3 = isValid;

  const buttonColor = isValid && !isGenerating
    ? mode === "prism"
      ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-[0_4px_16px_rgba(79,70,229,0.3)]"
      : mode === "trend-jacker"
        ? "bg-rose-500 hover:bg-rose-600 text-white shadow-[0_4px_16px_rgba(244,63,94,0.3)]"
        : mode === "gap-filler"
          ? "bg-blue-500 hover:bg-blue-600 text-white shadow-[0_4px_16px_rgba(59,130,246,0.3)]"
          : mode === "repurpose"
            ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-[0_4px_16px_rgba(16,185,129,0.3)]"
            : "bg-[#0052FF] hover:bg-[#0044dd] text-white shadow-[0_4px_16px_rgba(0,82,255,0.3)]"
    : "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none";

  const buttonLabel = {
    "voice-match": "Generate Blueprints",
    "trend-jacker": "Find Trends",
    repurpose: "Find Remixes",
    "gap-filler": "Find Gaps",
    prism: "Run Prism Analysis",
  }[mode];

  const steps: Array<{ id: 1 | 2 | 3; label: string }> = [
    { id: 1, label: "Mode" },
    { id: 2, label: "Brief" },
    { id: 3, label: "Generate" },
  ];

  const jumpToStep = (step: 1 | 2 | 3) => {
    if (step === 2 && !canGoStep2) return;
    if (step === 3 && !canGoStep3) return;
    setCurrentStep(step);
  };

  return (
    <div className="space-y-6 pb-6 relative">
      <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white p-2">
        {steps.map((step) => {
          const isActive = currentStep === step.id;
          const isComplete = currentStep > step.id;
          const isClickable =
            step.id === 1 ||
            (step.id === 2 && canGoStep2) ||
            (step.id === 3 && canGoStep3);
          return (
            <button
              key={step.id}
              type="button"
              onClick={() => jumpToStep(step.id)}
              disabled={!isClickable}
              className={`flex-1 rounded-xl px-3 py-2 text-[11px] font-bold transition-all border ${
                isActive
                  ? "bg-[#0052FF] text-white border-[#0052FF]"
                  : isComplete
                    ? "bg-[#EEF3FF] text-[#0052FF] border-[#D9E4FF]"
                    : "bg-white text-slate-500 border-slate-200"
              } ${!isClickable ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {isComplete ? "✓ " : ""}
              {step.label}
            </button>
          );
        })}
      </div>

      {/* 1. MODE + PLATFORM */}
      {currentStep === 1 && (
        <>
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2.5 block">
              Idea Mode
            </label>
            <div className="space-y-1.5">
              {MODE_CONFIG.map((m) => {
                const isActive = mode === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setMode(m.id)}
                    className={`relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left transition-all duration-200 group overflow-hidden ${
                      isActive
                        ? m.activeColor + " shadow-sm"
                        : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    {isActive && (
                      <div className={`absolute left-0 top-0 bottom-0 w-1 ${m.accent}`} />
                    )}
                    <div
                      className={`p-2 rounded-lg transition-colors shrink-0 ${
                        isActive ? "bg-white/80 shadow-sm" : "bg-slate-100 text-slate-500 group-hover:bg-white"
                      }`}
                    >
                      {m.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-xs font-bold block ${
                            isActive ? "text-[#000100]" : "text-slate-700"
                          }`}
                        >
                          {m.label}
                        </span>
                        {isActive && (
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${m.accent}`} />
                        )}
                      </div>
                      <span className={`text-[10px] leading-snug block truncate ${
                        isActive ? "text-slate-600" : "text-slate-400"
                      }`}>
                        {m.description}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2.5 block">
              Platform
            </label>
            <div className="flex flex-wrap gap-1.5">
              {PLATFORMS.map((p) => {
                const isActive = platform === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => setPlatform(p.id)}
                    className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-full text-[11px] font-bold transition-all ${
                      isActive
                        ? "bg-[#000100] text-white shadow-md shadow-black/10 scale-[1.02]"
                        : "bg-white text-slate-500 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700"
                    }`}
                  >
                    {p.icon}
                    <span>{p.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* 2. TOPIC + AUDIENCE */}
      {currentStep === 2 && (
        <section className="space-y-4">
          <TopicInput
            topic={topic}
            setTopic={setTopic}
            audience={audience}
            setAudience={setAudience}
          />
        </section>
      )}

      {/* 3. FINAL TUNING */}
      {currentStep === 3 && (
        <>
          {(mode === "voice-match" || mode === "trend-jacker") && (
            <section className="animate-in slide-in-from-top-4 duration-500 ease-out fade-in space-y-4">
              <GoalSelector
                goal={goal}
                setGoal={setGoal}
                vibe={vibe}
                setVibe={setVibe}
              />
            </section>
          )}

          <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Generation Summary</p>
            <p className="text-xs font-semibold text-slate-700">Mode: {activeConfig.label}</p>
            <p className="text-xs font-semibold text-slate-700">Platform: {PLATFORMS.find((p) => p.id === platform)?.label ?? "All"}</p>
            <p className="text-xs font-semibold text-slate-700 truncate">Topic: {topic || "Auto from context"}</p>
          </div>
        </>
      )}

      {/* Shared context message for selected mode */}
      {mode === "trend-jacker" && (
        <div className="bg-rose-50/50 border border-rose-100 p-3 rounded-xl flex gap-3 relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-400" />
          <div className="mt-0.5 text-rose-500 shrink-0">
            <TrendingUp size={15} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-rose-900 mb-0.5">
              Powered by Google Search
            </h4>
            <p className="text-[11px] text-rose-700/80 leading-relaxed font-medium">
              Real-time trend data grounded in live search results. Source citations included.
            </p>
          </div>
        </div>
      )}

      {mode === "repurpose" && (
        <div className="bg-emerald-50/50 border border-emerald-100 p-3 rounded-xl flex gap-3 relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-400" />
          <div className="mt-0.5 text-emerald-500 shrink-0">
            <Recycle size={15} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-emerald-900 mb-0.5">
              Based on your content history
            </h4>
            <p className="text-[11px] text-emerald-700/80 leading-relaxed font-medium">
              We'll analyze your recent posts and suggest fresh remixes of your best performers.
            </p>
          </div>
        </div>
      )}

      {mode === "gap-filler" && (
        <div className="bg-blue-50/50 border border-blue-100 p-3 rounded-xl flex gap-3 relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-400" />
          <div className="mt-0.5 text-blue-500 shrink-0">
            <Search size={15} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-blue-900 mb-0.5">
              Based on your analysis
            </h4>
            <p className="text-[11px] text-blue-700/80 leading-relaxed font-medium">
              Uses audience questions, competitor gaps, and missing keywords from your profile analysis.
            </p>
          </div>
        </div>
      )}

      {mode === "prism" && (
        <div className="bg-indigo-50/50 border border-indigo-100 p-3 rounded-xl flex gap-3 relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-400" />
          <div className="mt-0.5 text-indigo-500 shrink-0">
            <Box size={15} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-indigo-900 mb-0.5">
              Prism Mode Active
            </h4>
            <p className="text-[11px] text-indigo-700/80 leading-relaxed font-medium">
              We will ignore "Goals" and generate 8+ distinct angles (Contrarian, Analytical, Storyteller, etc.) for your topic.
            </p>
          </div>
        </div>
      )}

      {/* 6. Step Actions — sticky inside the scrollable left panel */}
      <div className="sticky bottom-0 -mx-6 px-6 pt-4 pb-5 bg-white/95 backdrop-blur-sm border-t border-slate-100 shadow-[0_-8px_24px_rgba(0,0,0,0.04)]">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setCurrentStep((prev) => (prev > 1 ? ((prev - 1) as 1 | 2 | 3) : prev))}
            disabled={currentStep === 1 || isGenerating}
            className="flex-1 py-3 px-4 rounded-2xl border border-slate-200 text-slate-600 font-bold text-xs uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Back
          </button>

          {currentStep < 3 ? (
            <button
              type="button"
              onClick={() => setCurrentStep((prev) => (prev < 3 ? ((prev + 1) as 1 | 2 | 3) : prev))}
              disabled={(currentStep === 1 && !canGoStep2) || (currentStep === 2 && !canGoStep3) || isGenerating}
              className="flex-1 py-3 px-4 rounded-2xl bg-[#0052FF] text-white font-black text-xs uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!isValid || isGenerating}
              className={`
                flex-1 py-3 px-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-3
                ${buttonColor} ${!isGenerating && isValid ? "hover:scale-[1.02] active:scale-[0.98]" : ""}
              `}
            >
              {isGenerating ? (
                <>
                  <Sparkles size={16} className="animate-spin" /> GENERATING...
                </>
              ) : (
                <>
                  <Sparkles size={16} className={isValid ? "animate-pulse" : ""} />
                  {buttonLabel}
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
