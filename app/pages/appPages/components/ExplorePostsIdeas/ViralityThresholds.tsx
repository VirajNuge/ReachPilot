"use client";

import React, { useState } from "react";
import { Filter, CalendarClock, BarChart3, Zap } from "lucide-react";

export default function ViralityThresholds() {
  const [minLikes, setMinLikes] = useState(1000);
  const [timeframe, setTimeframe] = useState("24h");

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
        <Filter size={16} className="text-gray-400" />
        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
          Signal Filters
        </h3>
      </div>

      {/* 1. Timeframe Selector (Segmented Control) */}
      <div>
        <label className="text-xs font-bold text-gray-500 mb-3 flex items-center gap-2 uppercase tracking-wider">
          <CalendarClock size={12} /> Time Window
        </label>

        <div className="flex bg-gray-100 p-1 rounded-lg">
          {["24h", "7d", "30d", "All"].map((t) => (
            <button
              key={t}
              onClick={() => setTimeframe(t)}
              className={`
                flex-1 py-1.5 text-xs font-bold rounded-md transition-all shadow-sm
                ${
                  timeframe === t
                    ? "bg-white text-indigo-600 shadow-sm ring-1 ring-black/5"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50 shadow-none"
                }
              `}
            >
              {t.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Engagement Threshold Slider */}
      <div>
        <div className="flex justify-between items-end mb-4">
          <label className="text-xs font-bold text-gray-500 flex items-center gap-2 uppercase tracking-wider">
            <BarChart3 size={12} /> Minimum Engagement
          </label>

          <div className="flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-md border border-indigo-100">
            <Zap size={10} fill="currentColor" />
            <span className="text-xs font-mono font-bold">
              {minLikes.toLocaleString()}{" "}
              <span className="opacity-70 text-[10px] font-medium">LIKES</span>
            </span>
          </div>
        </div>

        {/* Custom Range Input */}
        <div className="relative h-6 flex items-center">
          <input
            type="range"
            min="100"
            max="50000"
            step="100"
            value={minLikes}
            onChange={(e) => setMinLikes(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 hover:accent-indigo-700 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
          />
        </div>

        {/* Scale Labels */}
        <div className="flex justify-between text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-wider">
          <span>Micro</span>
          <span>Trending</span>
          <span>Viral</span>
        </div>
      </div>
    </div>
  );
}
