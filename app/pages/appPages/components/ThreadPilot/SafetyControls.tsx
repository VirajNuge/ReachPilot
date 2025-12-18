"use client";

import React, { useState } from "react";
import { Shield, AlertTriangle, CheckCircle2, Lock } from "lucide-react";

export default function SafetyControls() {
  const [mode, setMode] = useState<"manual" | "semi" | "auto">("manual");
  const [limit, setLimit] = useState(3);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
        <Shield size={18} className="text-gray-400" />
        <h3 className="text-lg font-semibold text-gray-900">Flight Safety</h3>
      </div>

      {/* Automation Mode Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Autonomy Level
        </label>

        <div className="grid grid-cols-3 gap-3">
          {/* Manual Option */}
          <button
            onClick={() => setMode("manual")}
            className={`
              flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all gap-2
              ${
                mode === "manual"
                  ? "border-green-500 bg-green-50/50 text-green-700"
                  : "border-gray-100 bg-white text-gray-400 hover:border-gray-200"
              }
            `}
          >
            <Lock size={20} />
            <span className="text-xs font-bold">Co-Pilot</span>
          </button>

          {/* Semi-Auto Option */}
          <button
            onClick={() => setMode("semi")}
            className={`
              flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all gap-2
              ${
                mode === "semi"
                  ? "border-yellow-500 bg-yellow-50/50 text-yellow-700"
                  : "border-gray-100 bg-white text-gray-400 hover:border-gray-200"
              }
            `}
          >
            <CheckCircle2 size={20} />
            <span className="text-xs font-bold">Semi-Auto</span>
          </button>

          {/* Full Auto Option */}
          <button
            onClick={() => setMode("auto")}
            className={`
              flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all gap-2
              ${
                mode === "auto"
                  ? "border-red-500 bg-red-50/50 text-red-700"
                  : "border-gray-100 bg-white text-gray-400 hover:border-gray-200"
              }
            `}
          >
            <AlertTriangle size={20} />
            <span className="text-xs font-bold">Full Auto</span>
          </button>
        </div>

        {/* Dynamic Explanation Box */}
        <div
          className={`mt-3 p-3 rounded-lg text-xs leading-relaxed border ${
            mode === "manual"
              ? "bg-green-50 border-green-100 text-green-800"
              : mode === "semi"
              ? "bg-yellow-50 border-yellow-100 text-yellow-800"
              : "bg-red-50 border-red-100 text-red-800"
          }`}
        >
          <span className="font-bold block mb-1">
            {mode === "manual" && "Safest Mode (Recommended)"}
            {mode === "semi" && "Balanced Mode"}
            {mode === "auto" && "High Volume Mode"}
          </span>
          {mode === "manual" &&
            "The AI will generate drafts but will NEVER post without your approval. You retain 100% control."}
          {mode === "semi" &&
            "Posts with a Relevance Score >95% are posted automatically. Everything else is sent to drafts."}
          {mode === "auto" &&
            "The AI monitors trends and posts immediately within your limits. Use with caution."}
        </div>
      </div>

      {/* Daily Limit Slider */}
      <div className="pt-2">
        <div className="flex justify-between items-center mb-4">
          <label className="text-sm font-medium text-gray-700">
            Max Posts Per Day
          </label>
          <span className="text-xs font-bold bg-gray-900 text-white px-2.5 py-1 rounded-md">
            {limit} / day
          </span>
        </div>
        <input
          type="range"
          min="1"
          max="10"
          step="1"
          value={limit}
          onChange={(e) => setLimit(parseInt(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 hover:accent-indigo-700"
        />
        <div className="flex justify-between text-[10px] text-gray-400 mt-2 font-medium uppercase">
          <span>Conservative</span>
          <span>Aggressive</span>
        </div>
      </div>
    </div>
  );
}
