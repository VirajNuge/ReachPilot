"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { RefreshCw, AlertTriangle, CheckCircle2 } from "lucide-react";
import type {
  PostGenerationInput,
  ContentStrategyOutput,
  PostPackage,
  InstagramPostType,
} from "@/lib/types/postGeneration";

const POST_TYPE_LABELS: Record<InstagramPostType, string> = {
  carousel_tips: "Carousel Tips",
  mini_story: "Mini Story",
  myth_vs_fact: "Myth vs Fact",
  step_by_step_guide: "Step-by-Step Guide",
  mistake_list: "Mistake List",
};

interface InstagramOutputProps {
  instagramRefined: NonNullable<PostPackage["instagramRefined"]>;
  caption: string;
  input: PostGenerationInput;
  strategy: ContentStrategyOutput;
  accountId?: string;
  onRefined: (newCaption: string, newScore: number, newFlags: string[], newPostType?: InstagramPostType) => void;
}

function getScoreColor(score: number): { text: string; bg: string; ring: string } {
  if (score >= 8) return { text: "text-green-600", bg: "bg-green-50", ring: "ring-green-200" };
  if (score >= 6) return { text: "text-amber-600", bg: "bg-amber-50", ring: "ring-amber-200" };
  return { text: "text-red-600", bg: "bg-red-50", ring: "ring-red-200" };
}

export const InstagramOutput: React.FC<InstagramOutputProps> = ({
  instagramRefined,
  caption,
  input,
  strategy,
  accountId,
  onRefined,
}) => {
  const [isRefining, setIsRefining] = useState(false);
  const [refineError, setRefineError] = useState<string | null>(null);

  const scoreColors = getScoreColor(instagramRefined.engagementScore);

  const handleReRefine = async () => {
    setIsRefining(true);
    setRefineError(null);
    try {
      const res = await fetch("/api/post-generation/instagram-refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caption, input, strategy, accountId }),
      });
      if (!res.ok) throw new Error("Refine request failed");
      const data = await res.json();
      onRefined(data.refinedCaption, data.engagementScore, data.qualityFlags, data.postType);
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
      className="bg-gradient-to-br from-pink-50 to-orange-50/30 border border-pink-400/15 rounded-2xl p-5 flex flex-col gap-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-pink-500 to-orange-400 flex-shrink-0" />
          <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
            Instagram Engagement Score
          </h3>
        </div>
        {instagramRefined.postType && (
          <span className="px-2.5 py-1 bg-pink-100 text-pink-700 text-[10px] font-bold rounded-full uppercase tracking-wide">
            {POST_TYPE_LABELS[instagramRefined.postType]}
          </span>
        )}
      </div>

      {/* Score + Flags row */}
      <div className="flex items-start gap-5">
        {/* Engagement Score circle */}
        <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center ring-4 ${scoreColors.bg} ${scoreColors.ring}`}
          >
            <span className={`text-2xl font-black ${scoreColors.text}`}>{instagramRefined.engagementScore}</span>
          </div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center leading-tight">
            Engagement
            <br />
            Score
          </span>
        </div>

        {/* Quality flags */}
        <div className="flex-1 flex flex-col gap-1.5">
          {instagramRefined.qualityFlags.length === 0 ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 border border-green-200 rounded-xl">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
              <span className="text-[12px] font-semibold text-green-700">Post looks great</span>
            </div>
          ) : (
            instagramRefined.qualityFlags.map((flag, i) => (
              <div
                key={i}
                className="flex items-start gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-xl"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                <span className="text-[12px] font-medium text-amber-700 leading-snug">{flag}</span>
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
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-orange-400 text-white rounded-xl text-[12px] font-bold hover:from-pink-600 hover:to-orange-500 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
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
