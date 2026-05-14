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

  const strokeDasharray = 2 * Math.PI * 36;
  const strokeDashoffset = strokeDasharray - ((viralityScore * 10) / 100) * strokeDasharray;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-[#EEF3FB] to-blue-50/30 border border-[#0A66C2]/15 rounded-[24px] p-6 flex flex-col gap-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#0A66C2] flex-shrink-0" />
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">
            LinkedIn Performance
          </h3>
        </div>
        <button
          onClick={handleReRefine}
          disabled={isRefining}
          className="flex items-center gap-1.5 px-3 py-1.5 text-[#0A66C2] hover:bg-[#0A66C2]/10 rounded-full text-xs font-semibold transition-all disabled:opacity-50"
        >
          {isRefining ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <RefreshCw className="w-3.5 h-3.5" />
          )}
          {isRefining ? "Refining..." : "Refine"}
        </button>
      </div>

      {refineError && (
        <p className="text-[11px] text-red-500">{refineError}</p>
      )}

      {/* Score + Flags row */}
      <div className="flex items-start gap-6">
        {/* Virality Score circle */}
        <div className="flex flex-col items-center gap-2 flex-shrink-0">
          <div className="relative flex w-20 h-20 items-center justify-center">
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="36" fill="transparent" stroke="#E2E8F0" strokeWidth="6" />
              <circle
                cx="40"
                cy="40"
                r="36"
                fill="transparent"
                stroke="currentColor"
                strokeWidth="6"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className={`${scoreColors.text} transition-all duration-1000 ease-out`}
              />
            </svg>
            <span className={`absolute text-2xl font-black ${scoreColors.text}`}>
              {viralityScore}
            </span>
          </div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center leading-tight">
            Virality
          </span>
        </div>

        {/* Quality flags */}
        <div className="flex-1 flex flex-col gap-3">
          {qualityFlags.length === 0 ? (
            <div className="flex items-center gap-2.5 px-4 py-3 bg-green-50/80 border border-green-200/60 rounded-2xl">
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0"
              >
                <CheckCircle2 className="w-4 h-4 text-green-600" />
              </motion.div>
              <span className="text-sm font-semibold text-green-700">Post looks great!</span>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                Improvement Suggestions
              </p>
              {qualityFlags.map((flag, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2.5 px-3 py-2 bg-white/60 border border-amber-200/60 rounded-xl"
                >
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span className="text-[13px] font-medium text-slate-700 leading-snug">{flag}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Style + Post Type badges */}
      {(styleProfile || postType) && (
        <div className="flex flex-wrap gap-2 pt-2 border-t border-[#0A66C2]/10">
          {styleProfile && (
            <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-[#0A66C2]/10 text-[#0A66C2] border border-[#0A66C2]/20">
              {LINKEDIN_STYLE_PROFILE_LABELS[styleProfile].label} style
            </span>
          )}
          {postType && (
            <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-white text-gray-700 border border-gray-200 shadow-sm">
              {LINKEDIN_POST_TYPE_LABELS[postType].emoji} {LINKEDIN_POST_TYPE_LABELS[postType].label}
            </span>
          )}
        </div>
      )}
    </motion.div>
  );
};
