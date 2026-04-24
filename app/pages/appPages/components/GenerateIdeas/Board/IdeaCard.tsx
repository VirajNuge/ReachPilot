"use client";

import React from "react";
import {
  ArrowRight,
  Bookmark,
  ThumbsUp,
  ThumbsDown,
  Copy,
  ExternalLink,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import type { GeneratedIdea, IdeaMode } from "@/lib/ideaFinder/types";

// Re-export for backwards compat
export type ContentIdea = GeneratedIdea;

interface IdeaCardProps {
  idea: GeneratedIdea;
  mode?: IdeaMode;
  onClick: (idea: GeneratedIdea) => void;
  onSave?: (idea: GeneratedIdea) => void;
  onFeedback?: (idea: GeneratedIdea, feedback: "positive" | "negative") => void;
}

const MODE_BADGE: Record<string, { label: string; color: string; accent: string; bg: string }> = {
  "voice-match": { label: "Voice-Match", color: "text-[#0052FF]", accent: "bg-[#0052FF]", bg: "bg-[#0052FF]/10" },
  "trend-jacker": { label: "Trend", color: "text-rose-600", accent: "bg-rose-500", bg: "bg-rose-50" },
  repurpose: { label: "Remix", color: "text-emerald-600", accent: "bg-emerald-500", bg: "bg-emerald-50" },
  "gap-filler": { label: "Gap", color: "text-blue-600", accent: "bg-blue-500", bg: "bg-blue-50" },
  prism: { label: "Prism", color: "text-indigo-600", accent: "bg-indigo-500", bg: "bg-indigo-50" },
};

function getPlatformLabel(platform: string): string {
  const map: Record<string, string> = {
    instagram: "Instagram",
    linkedin: "LinkedIn",
    x: "X",
    facebook: "Facebook",
    all: "All Platforms",
  };
  return map[platform] || platform;
}

function getConfidenceStyles(score: number): { text: string; bg: string; border: string; ring: string } {
  if (score >= 80) return { text: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200", ring: "stroke-emerald-500" };
  if (score >= 60) return { text: "text-yellow-700", bg: "bg-yellow-50", border: "border-yellow-200", ring: "stroke-yellow-500" };
  return { text: "text-slate-600", bg: "bg-slate-50", border: "border-slate-200", ring: "stroke-slate-400" };
}

export default function IdeaCard({
  idea,
  mode,
  onClick,
  onSave,
  onFeedback,
}: IdeaCardProps) {
  const confStyles = getConfidenceStyles(idea.confidenceScore);
  const modeBadge = mode ? MODE_BADGE[mode] : MODE_BADGE["voice-match"];

  const handleCopyHook = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(idea.hook);
  };

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSave?.(idea);
  };

  const handleFeedback = (e: React.MouseEvent, fb: "positive" | "negative") => {
    e.stopPropagation();
    onFeedback?.(idea, fb);
  };

  // SVG Ring for confidence
  const radius = 10;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (idea.confidenceScore / 100) * circumference;

  return (
    <div
      onClick={() => onClick(idea)}
      className={`group break-inside-avoid mb-6 bg-white rounded-3xl border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.12)] hover:-translate-y-1 transition-all duration-400 cursor-pointer overflow-hidden relative flex flex-col`}
    >
      {/* Left Accent Bar on Hover */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${modeBadge.accent}`} />

      {/* Top Bar: Mode Pill & Confidence Score */}
      <div className="px-6 py-4 flex items-center justify-between border-b border-slate-50/80">
        <div className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 ${modeBadge.bg} ${modeBadge.color}`}>
          <Sparkles size={12} strokeWidth={3} />
          <span className="text-[10px] font-black uppercase tracking-widest leading-none mt-[1px]">
            {modeBadge.label}
          </span>
        </div>

        <div className={`flex items-center gap-2 px-2.5 py-1.5 rounded-full ${confStyles.bg} border ${confStyles.border}`}>
          <div className="relative w-5 h-5 flex items-center justify-center">
            <svg className="w-5 h-5 transform -rotate-90">
              <circle
                cx="10"
                cy="10"
                r="8"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                className="text-black/5"
              />
              <circle
                cx="10"
                cy="10"
                r="8"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className={confStyles.ring}
              />
            </svg>
          </div>
          <span className={`text-[11px] font-bold ${confStyles.text}`}>
            {idea.confidenceScore}%
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 flex-1 flex flex-col">
        <h3 className="text-[20px] font-black text-[#000100] leading-[1.2] mb-4 tracking-tight group-hover:text-[#074ed5] transition-colors">
          {idea.title}
        </h3>
        
        {/* Hook Pull-Quote */}
        <div className={`relative pl-4 py-1 border-l-2 ${modeBadge.color.replace('text-', 'border-')} mb-4`}>
          <p className="text-[14px] text-slate-600 leading-relaxed italic font-medium">
            "{idea.hook}"
          </p>
        </div>

        <p className="text-[13px] text-slate-500 leading-relaxed line-clamp-3 mb-2 flex-1">
          {idea.angle}
        </p>

        {/* Tags row */}
        <div className="mt-auto pt-4 flex items-center gap-2 flex-wrap">
          {idea.urgency && (
            <span
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider ${
                idea.urgency === "high"
                  ? "bg-rose-100 text-rose-700"
                  : idea.urgency === "medium"
                    ? "bg-amber-100 text-amber-700"
                    : "bg-slate-100 text-slate-600"
              }`}
            >
              {idea.urgency === "high" ? "🔥" : idea.urgency === "medium" ? "⏰" : "📌"}{" "}
              {idea.urgency}
            </span>
          )}

          {/* Platform in footer now */}
          <span className="px-2 py-1 rounded-md bg-slate-50 border border-slate-100 text-[9px] font-bold text-slate-500 uppercase tracking-widest">
            {getPlatformLabel(idea.platform)}
          </span>

          <span className="px-2 py-1 rounded-md bg-slate-50 border border-slate-100 text-[9px] font-bold text-slate-500 uppercase tracking-widest">
            {idea.format}
          </span>
          
          {idea.angleFramework && (
            <span className={`px-2 py-1 rounded-md border text-[9px] font-bold uppercase tracking-widest ${modeBadge.bg} ${modeBadge.color.replace('text-', 'border-')}/20 ${modeBadge.color}`}>
              {idea.angleFramework}
            </span>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <button
            onClick={handleCopyHook}
            className="p-2 rounded-xl text-slate-400 hover:bg-white hover:text-slate-800 hover:shadow-sm transition-all border border-transparent hover:border-slate-200"
            title="Copy hook"
          >
            <Copy size={16} />
          </button>
          {onSave && (
            <button
              onClick={handleSave}
              className="p-2 rounded-xl text-slate-400 hover:bg-[#caee55]/20 hover:text-[#000100] hover:shadow-sm transition-all border border-transparent hover:border-[#caee55]/40"
              title="Save to planner"
            >
              <Bookmark size={16} />
            </button>
          )}
          {onFeedback && (
            <>
              <button
                onClick={(e) => handleFeedback(e, "positive")}
                className="p-2 rounded-xl text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 hover:shadow-sm transition-all border border-transparent hover:border-emerald-200 ml-2"
                title="Good idea"
              >
                <ThumbsUp size={16} />
              </button>
              <button
                onClick={(e) => handleFeedback(e, "negative")}
                className="p-2 rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-600 hover:shadow-sm transition-all border border-transparent hover:border-rose-200"
                title="Not useful"
              >
                <ThumbsDown size={16} />
              </button>
            </>
          )}
        </div>

        <div className={`w-10 h-10 rounded-full bg-white shadow-sm border border-slate-200 flex items-center justify-center text-slate-400 group-hover:${modeBadge.accent} group-hover:text-white group-hover:border-transparent transition-all duration-300`}>
          <ArrowRight size={16} strokeWidth={2.5} />
        </div>
      </div>
    </div>
  );
}
