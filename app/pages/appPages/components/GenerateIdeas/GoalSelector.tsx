"use client";

import React from "react";
import { Zap, Target, HeartHandshake, Mic2, ChevronDown } from "lucide-react";

interface GoalSelectorProps {
  goal: string;
  setGoal: (val: string) => void;
  vibe: string;
  setVibe: (val: string) => void;
}

const TONE_OPTIONS: { value: string; label: string; desc: string; emoji: string }[] = [
  { value: "Educational",    label: "Educational",      desc: "Teach something valuable",                 emoji: "📚" },
  { value: "Professional",   label: "Professional",     desc: "Polished and credible",                    emoji: "💼" },
  { value: "Conversational", label: "Conversational",   desc: "Casual, like talking to a friend",         emoji: "💬" },
  { value: "Authoritative",  label: "Authoritative",    desc: "Expert positioning, strong claims",        emoji: "🏆" },
  { value: "Inspirational",  label: "Inspirational",    desc: "Motivate and uplift the audience",         emoji: "✨" },
  { value: "Controversial",  label: "Controversial",    desc: "Challenge conventions, spark debate",      emoji: "🔥" },
  { value: "Witty",          label: "Witty / Humorous", desc: "Smart humor and wordplay",                 emoji: "😄" },
  { value: "Empathetic",     label: "Empathetic",       desc: "Understand and validate feelings",         emoji: "🤝" },
  { value: "Direct",         label: "Direct / Bold",    desc: "Straight to the point, no fluff",         emoji: "⚡" },
  { value: "Data-Driven",    label: "Data-Driven",      desc: "Stats and evidence-backed insights",       emoji: "📊" },
  { value: "Storytelling",   label: "Storytelling",     desc: "Narrative-first, emotional journey",       emoji: "📖" },
  { value: "Visionary",      label: "Visionary",        desc: "Big-picture future-focused ideas",         emoji: "🔭" },
  { value: "Motivational",   label: "Motivational",     desc: "Push to action, energize readers",         emoji: "🚀" },
  { value: "Thought-Leader", label: "Thought Leader",   desc: "Industry-shaping opinions and frameworks", emoji: "💡" },
];

export default function GoalSelector({
  goal,
  setGoal,
  vibe,
  setVibe,
}: GoalSelectorProps) {
  const goals = [
    { id: "viral",     label: "Viral Reach", icon: <Zap size={18} />,           desc: "Maximize views & shares" },
    { id: "leads",     label: "Lead Gen",    icon: <Target size={18} />,         desc: "Drive clicks & signups" },
    { id: "community", label: "Community",   icon: <HeartHandshake size={18} />, desc: "Spark discussion & trust" },
  ];

  const selectedTone = TONE_OPTIONS.find((t) => t.value === vibe) ?? TONE_OPTIONS[0];

  return (
    <div className="space-y-5">
      {/* 1. Goal Selection */}
      <div>
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 block">
          Primary Objective
        </label>
        <div className="space-y-2">
          {goals.map((g) => {
            const isActive = goal === g.id;
            return (
              <button
                key={g.id}
                type="button"
                onClick={() => setGoal(g.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all duration-200 group ${
                  isActive
                    ? "bg-amber-50 border-amber-300 shadow-sm ring-1 ring-amber-300"
                    : "bg-white border-slate-200 hover:border-amber-200 hover:bg-amber-50/40"
                }`}
              >
                <div
                  className={`p-2 rounded-lg transition-colors ${
                    isActive
                      ? "bg-amber-400 text-white"
                      : "bg-slate-100 text-slate-400 group-hover:text-amber-500"
                  }`}
                >
                  {g.icon}
                </div>
                <div>
                  <span className={`text-sm font-bold block ${isActive ? "text-slate-900" : "text-slate-600"}`}>
                    {g.label}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">{g.desc}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Tone & Vibe — Dropdown */}
      <div>
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
          <Mic2 size={12} className="text-slate-400" />
          Tone &amp; Vibe
        </label>

        {/* Styled native select */}
        <div className="relative group">
          <select
            value={vibe}
            onChange={(e) => setVibe(e.target.value)}
            className="w-full appearance-none px-4 py-3 pr-10 rounded-xl border border-slate-200 bg-white text-[13px] font-semibold text-slate-700 shadow-sm outline-none cursor-pointer transition-all hover:border-slate-300 focus:border-[#0052FF] focus:ring-2 focus:ring-[#0052FF]/15"
          >
            {TONE_OPTIONS.map((t) => (
              <option key={t.value} value={t.value}>
                {t.emoji}  {t.label}
              </option>
            ))}
          </select>
          <ChevronDown
            size={15}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within:text-[#0052FF] transition-colors"
          />
        </div>

        {/* Inline description preview */}
        <p className="mt-1.5 text-[10px] font-medium text-slate-400 px-1">
          {selectedTone.emoji} <span className="font-semibold text-slate-500">{selectedTone.label}</span> — {selectedTone.desc}
        </p>
      </div>
    </div>
  );
}
