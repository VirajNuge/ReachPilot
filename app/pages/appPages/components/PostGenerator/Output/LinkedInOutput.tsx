"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { RefreshCw, AlertTriangle, CheckCircle2 } from "lucide-react";
import type {
  LinkedInStyleProfile,
  LinkedInPostType,
  PostGenerationInput,
  ContentStrategyOutput,
} from "@/lib/types/postGeneration";
import {
  LINKEDIN_STYLE_PROFILE_LABELS,
  LINKEDIN_POST_TYPE_LABELS,
} from "@/lib/types/postGeneration";

interface LinkedInOutputProps {
  viralityScore: number;
  qualityFlags: string[];
  styleProfile?: LinkedInStyleProfile;
  postType?: LinkedInPostType;
  caption: string;
  input: PostGenerationInput;
  strategy: ContentStrategyOutput;
  accountId?: string;
  onRefinedCaption: (newCaption: string, newScore: number, newFlags: string[]) => void;
}

function getScoreColor(score: number): { text: string; bg: string; ring: string } {
  if (score >= 8) return { text: "text-green-600", bg: "bg-green-50", ring: "ring-green-200" };
  if (score >= 6) return { text: "text-amber-600", bg: "bg-amber-50", ring: "ring-amber-200" };
  return { text: "text-red-600", bg: "bg-red-50", ring: "ring-red-200" };
}

export const LinkedInOutput: React.FC<LinkedInOutputProps> = ({
  viralityScore,
  qualityFlags,
  styleProfile,
  postType,
  caption,
  input,
  strategy,
  accountId,
  onRefinedCaption,
}) => {
  const [isRefining, setIsRefining] = useState(false);
  const [refineError, setRefineError] = useState<string | null>(null);

  const scoreColors = getScoreColor(viralityScore);

  const handleReRefine = async () => {
    setIsRefining(true);
    setRefineError(null);
    try {
      const res = await fetch("/api/post-generation/linkedin-refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caption, input, strategy, accountId }),
      });
      if (!res.ok) throw new Error("Refine request failed");
      const data = await res.json();
      onRefinedCaption(data.refinedCaption, data.viralityScore, data.qualityFlags);
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
      className="bg-gradient-to-br from-[#EEF3FB] to-blue-50/30 border border-[#0A66C2]/15 rounded-2xl p-5 flex flex-col gap-4"
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="w-2.5 h-2.5 rounded-full bg-[#0A66C2] flex-shrink-0" />
        <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
          LinkedIn Performance
        </h3>
      </div>

      {/* Score + Flags row */}
      <div className="flex items-start gap-5">
        {/* Virality Score circle */}
        <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center ring-4 ${scoreColors.bg} ${scoreColors.ring}`}
          >
            <span className={`text-2xl font-black ${scoreColors.text}`}>{viralityScore}</span>
          </div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center leading-tight">
            Virality
            <br />
            Score
          </span>
        </div>

        {/* Quality flags */}
        <div className="flex-1 flex flex-col gap-1.5">
          {qualityFlags.length === 0 ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 border border-green-200 rounded-xl">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
              <span className="text-[12px] font-semibold text-green-700">Post looks great</span>
            </div>
          ) : (
            qualityFlags.map((flag, i) => (
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

      {/* Style + Post Type badges */}
      {(styleProfile || postType) && (
        <div className="flex flex-wrap gap-2">
          {styleProfile && (
            <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-[#0A66C2]/10 text-[#0A66C2] border border-[#0A66C2]/20">
              {LINKEDIN_STYLE_PROFILE_LABELS[styleProfile].label} style
            </span>
          )}
          {postType && (
            <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-white text-gray-700 border border-gray-200">
              {LINKEDIN_POST_TYPE_LABELS[postType].emoji} {LINKEDIN_POST_TYPE_LABELS[postType].label}
            </span>
          )}
        </div>
      )}

      {/* Re-refine button */}
      <div>
        <button
          onClick={handleReRefine}
          disabled={isRefining}
          className="flex items-center gap-2 px-4 py-2 bg-[#0A66C2] text-white rounded-xl text-[12px] font-bold hover:bg-blue-800 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
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
