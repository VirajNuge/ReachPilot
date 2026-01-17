"use client";

import React from "react";
import {
  MessageCircle,
  HelpCircle,
  Globe,
  ArrowBigUp,
  MessageSquare,
  AlertCircle,
  PenTool,
} from "lucide-react";

// --- TYPES ---
export interface QuestionItem {
  id: string;
  source: "reddit" | "quora" | "google";
  title: string;
  snippet: string;
  metrics: {
    upvotes: number;
    comments: number;
  };
  painLevel: "Critical" | "High" | "Medium";
  timestamp: string;
}

interface QuestionFeedProps {
  isMining?: boolean;
  questions: QuestionItem[]; // Receive from parent
  onSolve?: (question: QuestionItem) => void;
}

export default function QuestionFeed({
  isMining,
  questions,
  onSolve,
}: QuestionFeedProps) {
  // Questions are now managed by the parent component

  // --- HELPER: Platform Styles ---
  const getPlatformBadge = (source: string) => {
    switch (source) {
      case "reddit":
        return (
          <span className="bg-[#FF4500]/10 text-[#FF4500] px-2 py-0.5 rounded text-[10px] font-bold uppercase flex items-center gap-1">
            <MessageCircle size={10} /> Reddit
          </span>
        );
      case "quora":
        return (
          <span className="bg-[#B92B27]/10 text-[#B92B27] px-2 py-0.5 rounded text-[10px] font-bold uppercase flex items-center gap-1">
            <HelpCircle size={10} /> Quora
          </span>
        );
      case "google":
        return (
          <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-[10px] font-bold uppercase flex items-center gap-1">
            <Globe size={10} /> Google
          </span>
        );
      default:
        return null;
    }
  };

  const getPainColor = (level: string) => {
    if (level === "Critical") return "text-red-600 bg-red-50 border-red-100";
    if (level === "High")
      return "text-orange-600 bg-orange-50 border-orange-100";
    return "text-yellow-600 bg-yellow-50 border-yellow-100";
  };

  // --- SKELETON LOADER (for mining state) ---
  const SkeletonLoader = () => (
    <div className="space-y-4 max-w-3xl mx-auto pb-20">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm animate-pulse flex flex-col gap-3"
        >
          <div className="flex justify-between">
            <div className="w-16 h-4 bg-gray-200 rounded" />
            <div className="w-16 h-4 bg-gray-200 rounded" />
          </div>
          <div className="w-3/4 h-6 bg-gray-200 rounded" />
          <div className="w-full h-10 bg-gray-100 rounded" />
        </div>
      ))}
    </div>
  );

  // --- EMPTY STATE ---
  const EmptyState = () => (
    <div className="flex h-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-white/60 p-12 text-center min-h-[500px]">
      <div className="bg-orange-100 p-4 rounded-full mb-4">
        <MessageCircle className="text-orange-500 w-8 h-8" />
      </div>
      <p className="text-gray-500 font-medium">Ready to excavate?</p>
      <p className="text-xs text-gray-400 mt-1">
        Enter a keyword on the left to start finding questions.
      </p>
    </div>
  );

  // --- QUESTION CARD (example for one question) ---
  const QuestionCard = ({ q }: { q: QuestionItem }) => (
    <div className="group bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden relative">
      {/* Top Row: Meta */}
      <div className="px-5 py-3 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
        <div className="flex items-center gap-3">
          {getPlatformBadge(q.source)}
          <span className="text-[10px] text-gray-400 font-medium">
            {q.timestamp}
          </span>
        </div>
        <div
          className={`text-[10px] font-bold px-2 py-0.5 rounded border flex items-center gap-1 ${getPainColor(
            q.painLevel
          )}`}
        >
          <AlertCircle size={10} /> {q.painLevel} Frustration
        </div>
      </div>

      {/* Main Content */}
      <div className="p-5">
        <h3 className="text-lg font-bold text-gray-900 leading-snug mb-2 group-hover:text-orange-600 transition-colors">
          {q.title}
        </h3>
        <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">
          {q.snippet}
        </p>
      </div>

      {/* Footer: Metrics & Action */}
      <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-4 text-xs font-bold text-gray-400">
          <span className="flex items-center gap-1">
            <ArrowBigUp size={16} /> {q.metrics.upvotes}
          </span>
          <span className="flex items-center gap-1">
            <MessageSquare size={14} /> {q.metrics.comments}
          </span>
        </div>

        <button
          onClick={() => onSolve?.(q)}
          className="flex items-center gap-2 bg-gray-900 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors shadow-sm"
        >
          <PenTool size={12} />
          Draft Solution
        </button>
      </div>
    </div>
  );

  // Conditional rendering for 3 states:
  // 1. MINING STATE (isMining === true): Show skeleton loaders
  // 2. EMPTY STATE (questions.length === 0): Show "Ready to excavate?" placeholder
  // 3. RESULTS STATE: Show the question cards
  if (isMining) {
    return <SkeletonLoader />;
  }

  if (questions.length === 0) {
    return <EmptyState />;
  }

  // RESULTS STATE: Show question cards
  return (
    <div className="space-y-4 max-w-3xl mx-auto pb-20">
      {questions.map((q) => (
        <QuestionCard key={q.id} q={q} />
      ))}
    </div>
  );
}
