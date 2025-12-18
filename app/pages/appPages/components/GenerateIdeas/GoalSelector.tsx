"use client";

import React from "react";
import { Zap, Target, HeartHandshake, Mic2 } from "lucide-react";

interface GoalSelectorProps {
  goal: string;
  setGoal: (val: string) => void;
  vibe: string;
  setVibe: (val: string) => void;
}

export default function GoalSelector({
  goal,
  setGoal,
  vibe,
  setVibe,
}: GoalSelectorProps) {
  const goals = [
    {
      id: "viral",
      label: "Viral Reach",
      icon: <Zap size={18} />,
      desc: "Maximize views & shares",
    },
    {
      id: "leads",
      label: "Lead Gen",
      icon: <Target size={18} />,
      desc: "Drive clicks & signups",
    },
    {
      id: "community",
      label: "Community",
      icon: <HeartHandshake size={18} />,
      desc: "Spark discussion & trust",
    },
  ];

  const vibes = [
    "Educational",
    "Controversial",
    "Inspirational",
    "Funny",
    "Data-Driven",
  ];

  return (
    <div className="space-y-6">
      {/* 1. Goal Selection */}
      <div>
        <label className="text-sm font-bold text-gray-800 mb-3 block">
          Primary Objective
        </label>
        <div className="space-y-2">
          {goals.map((g) => {
            const isActive = goal === g.id;
            return (
              <button
                key={g.id}
                onClick={() => setGoal(g.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all duration-200 group
                  ${
                    isActive
                      ? "bg-yellow-50 border-yellow-400 shadow-sm ring-1 ring-yellow-400"
                      : "bg-white border-gray-200 hover:border-yellow-200 hover:bg-yellow-50/50"
                  }
                `}
              >
                <div
                  className={`p-2 rounded-lg ${
                    isActive
                      ? "bg-yellow-500 text-white"
                      : "bg-gray-100 text-gray-400 group-hover:text-yellow-600"
                  }`}
                >
                  {g.icon}
                </div>
                <div>
                  <span
                    className={`text-sm font-bold block ${
                      isActive ? "text-gray-900" : "text-gray-600"
                    }`}
                  >
                    {g.label}
                  </span>
                  <span className="text-[10px] text-gray-400 font-medium">
                    {g.desc}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Vibe/Tone Selector */}
      <div>
        <label className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
          <Mic2 size={16} className="text-gray-400" />
          Tone & Vibe
        </label>
        <div className="flex flex-wrap gap-2">
          {vibes.map((v) => {
            const isActive = vibe === v;
            return (
              <button
                key={v}
                onClick={() => setVibe(v)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all
                  ${
                    isActive
                      ? "bg-gray-800 text-white border-gray-800 shadow-md transform scale-105"
                      : "bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:text-gray-700"
                  }
                `}
              >
                {v}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
