"use client";

import React from "react";
import {
  ArrowRight,
  Twitter,
  Linkedin,
  Instagram,
  Target,
  Sparkles,
  TrendingUp,
} from "lucide-react";

// --- TYPES ---
export interface ContentIdea {
  id: string;
  title: string; // The "Hook"
  description: string; // Brief summary of the angle
  platform: "twitter" | "linkedin" | "instagram";
  score: number; // 0-100 prediction
  strategy: {
    goal: string; // e.g., "Viral Reach"
    tone: string; // e.g., "Controversial"
  };
}

interface IdeaCardProps {
  idea: ContentIdea;
  onClick: (idea: ContentIdea) => void;
}

export default function IdeaCard({ idea, onClick }: IdeaCardProps) {
  // Helper: Get Platform Icon
  const getPlatformIcon = () => {
    switch (idea.platform) {
      case "twitter":
        return <Twitter size={16} className="text-black" />;
      case "linkedin":
        return <Linkedin size={16} className="text-[#0077B5]" />;
      case "instagram":
        return <Instagram size={16} className="text-pink-600" />;
      default:
        return <Sparkles size={16} className="text-yellow-600" />;
    }
  };

  // Helper: Score Color
  const getScoreColor = (score: number) => {
    if (score >= 90) return "bg-green-100 text-green-700 border-green-200";
    if (score >= 75) return "bg-yellow-100 text-yellow-700 border-yellow-200";
    return "bg-gray-100 text-gray-600 border-gray-200";
  };

  return (
    <div
      onClick={() => onClick(idea)}
      className="group break-inside-avoid mb-6 bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg hover:border-yellow-400 hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden relative"
    >
      {/* Top Bar: Platform & Score */}
      <div className="px-5 py-4 flex items-center justify-between border-b border-gray-50">
        <div className="flex items-center gap-2 p-1.5 bg-gray-50 rounded-lg group-hover:bg-white transition-colors">
          {getPlatformIcon()}
          <span className="text-[10px] font-bold uppercase text-gray-500 tracking-wider">
            {idea.platform}
          </span>
        </div>

        <div
          className={`px-2 py-1 rounded-md border text-xs font-bold flex items-center gap-1.5 ${getScoreColor(
            idea.score
          )}`}
        >
          <TrendingUp size={12} />
          {idea.score}
        </div>
      </div>

      {/* Main Content */}
      <div className="p-5">
        <h3 className="text-lg font-bold text-gray-900 leading-snug mb-2 group-hover:text-yellow-600 transition-colors">
          {idea.title}
        </h3>
        <p className="text-sm text-gray-500 leading-relaxed line-clamp-3">
          {idea.description}
        </p>
      </div>

      {/* Footer: Strategy Tags */}
      <div className="px-5 py-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
        <div className="flex gap-2">
          <span className="px-2 py-1 rounded border border-gray-200 bg-white text-[10px] font-semibold text-gray-500 uppercase tracking-wide">
            {idea.strategy.tone}
          </span>
          <span className="px-2 py-1 rounded border border-gray-200 bg-white text-[10px] font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1">
            <Target size={10} /> {idea.strategy.goal}
          </span>
        </div>

        {/* Action Icon */}
        <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 group-hover:bg-yellow-500 group-hover:text-white group-hover:border-yellow-500 transition-all">
          <ArrowRight size={16} />
        </div>
      </div>
    </div>
  );
}
