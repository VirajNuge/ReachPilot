"use client";

import React from "react";
import { Sparkles } from "lucide-react";

interface GeneratorActionsProps {
  onGenerate: () => Promise<void>; // async generate handler
  isGenerating: boolean;
}

export default function GeneratorActions({
  onGenerate,
  isGenerating,
}: GeneratorActionsProps) {
  return (
    <div className="pt-6 border-t border-slate-100 sticky bottom-0 bg-white/80 backdrop-blur-sm pb-4 -mx-4 px-4">
      <button
        onClick={onGenerate}
        disabled={isGenerating}
        className="bg-indigo-600 cursor-pointer w-full py-4 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2.5 transition-all duration-300 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500"
      >
        {isGenerating ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            <span className="animate-pulse">Designing...</span>
          </>
        ) : (
          <>
            <Sparkles size={18} className="text-indigo-200" />
            Generate Canvas
          </>
        )}
      </button>
    </div>
  );
}
