"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { RefreshCw, AlertTriangle, CheckCircle2, MessageCircle } from "lucide-react";
import type {
  PostGenerationInput,
  ContentStrategyOutput,
  PostPackage,
} from "@/lib/types/postGeneration";

interface FacebookOutputProps {
  facebookRefined: NonNullable<PostPackage["facebookRefined"]>;
  caption: string;
  input: PostGenerationInput;
  strategy: ContentStrategyOutput;
  accountId?: string;
  onRefined: (newCaption: string, newScore: number, newFlags: string[]) => void;
}

function getScoreColor(score: number): { text: string; bg: string; ring: string } {
  if (score >= 8) return { text: "text-green-600", bg: "bg-green-50", ring: "ring-green-200" };
  if (score >= 6) return { text: "text-amber-600", bg: "bg-amber-50", ring: "ring-amber-200" };
  return { text: "text-red-600", bg: "bg-red-50", ring: "ring-red-200" };
}

export const FacebookOutput: React.FC<FacebookOutputProps> = ({
  facebookRefined,
  caption,
  input,
  strategy,
  accountId,
  onRefined,
}) => {
  const [isRefining, setIsRefining] = useState(false);
  const [refineError, setRefineError] = useState<string | null>(null);

  const scoreColors = getScoreColor(facebookRefined.engagementScore);

  const handleReRefine = async () => {
    setIsRefining(true);
    setRefineError(null);
    try {
      const res = await fetch("/api/post-generation/facebook-refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caption, input, strategy, accountId }),
      });
      if (!res.ok) throw new Error("Refine request failed");
      const data = await res.json();
      onRefined(data.refinedPost, data.engagementScore, data.qualityFlags);
    } catch {
      setRefineError("Re-refinement failed. Please try again.");
    } finally {
      setIsRefining(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-blue-50 to-indigo-50/30 border border-blue-400/15 rounded-2xl p-6 flex flex-col gap-5"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#1877F2] flex-shrink-0" />
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">
            Facebook Engagement Score
          </h3>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full">
          <MessageCircle className="w-3 h-3" />
          <span className="text-[10px] font-bold uppercase tracking-wide">Discussion-driven</span>
        </div>
      </div>

      {/* Score + Flags row */}
      <div className="flex items-start gap-5">
        {/* Engagement Score circle */}
        <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center ring-4 ${scoreColors.bg} ${scoreColors.ring}`}
          >
            <span className={`text-2xl font-black ${scoreColors.text}`}>{facebookRefined.engagementScore}</span>
          </div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center leading-tight">
            Engagement
            <br />
            Score
          </span>
        </div>

        {/* Quality flags */}
        <div className="flex-1 flex flex-col gap-2">
          {facebookRefined.qualityFlags.length === 0 ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 border border-green-200 rounded-xl">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
              <span className="text-[12px] font-semibold text-green-700">Post looks great</span>
            </div>
          ) : (
            facebookRefined.qualityFlags.map((flag, i) => (
              <div
                key={i}
                className="flex items-start gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-xl"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                <span className="text-[13px] font-medium text-amber-800 leading-snug">{flag}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Re-refine button */}
      <div>
        <button
          onClick={handleReRefine}
          disabled={isRefining}
          className="flex items-center gap-2 px-4 py-2 bg-[#1877F2] text-white rounded-xl text-[12px] font-bold hover:bg-[#1664d8] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isRefining ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Refining...
            </>
          ) : (
            <>
              <RefreshCw className="w-3.5 h-3.5" />
              Refine Again
            </>
          )}
        </button>
        {refineError && (
          <p className="text-[11px] text-red-500 mt-2">{refineError}</p>
        )}
      </div>
    </motion.div>
  );
};
