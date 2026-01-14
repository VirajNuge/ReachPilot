"use client";

import React, { useState, useEffect } from "react";
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
  isMining: boolean;
  onSolve: (question: QuestionItem) => void;
}

export default function QuestionFeed({ isMining, onSolve }: QuestionFeedProps) {
  const [questions, setQuestions] = useState<QuestionItem[]>([]);

  // --- MOCK DATA SIMULATION ---
  useEffect(() => {
    if (isMining) {
      setQuestions([]); // Clear while mining
    } else {
      // Simulate results appearing after mining finishes
      if (questions.length === 0) {
        // This would normally come from your backend scraper
        // We populate slightly delayed to feel natural
        const timer = setTimeout(() => {
          setQuestions([
            {
              id: "1",
              source: "reddit",
              title: "Why is everyone quitting freelance for full-time jobs?",
              snippet:
                "I've been seeing a trend of successful freelancers going back to corporate. Is the market drying up? I'm scared to make the jump...",
              metrics: { upvotes: 452, comments: 89 },
              painLevel: "Critical",
              timestamp: "4h ago",
            },
            {
              id: "2",
              source: "quora",
              title: "What is the biggest hidden cost of running a SaaS?",
              snippet:
                "Beyond server costs and salaries, what eats up margin that first-time founders don't expect?",
              metrics: { upvotes: 1200, comments: 45 },
              painLevel: "High",
              timestamp: "1d ago",
            },
            {
              id: "3",
              source: "google",
              title: "how to get clients without cold calling",
              snippet:
                "People also ask: What is the best alternative to cold email for agencies?",
              metrics: { upvotes: 0, comments: 0 }, // Google doesn't have these usually
              painLevel: "High",
              timestamp: "Trending",
            },
            {
              id: "4",
              source: "reddit",
              title: "My client refuses to pay the final 50%. What do I do?",
              snippet:
                "We didn't sign a formal contract, just emails. Now he's ghosting me. Is small claims court worth it?",
              metrics: { upvotes: 2100, comments: 340 },
              painLevel: "Critical",
              timestamp: "2h ago",
            },
            {
              id: "5",
              source: "quora",
              title: "Is it possible to learn coding after 40?",
              snippet:
                "I feel like I missed the boat. Has anyone successfully pivoted this late?",
              metrics: { upvotes: 89, comments: 12 },
              painLevel: "Medium",
              timestamp: "5h ago",
            },
          ]);
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [isMining]);

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

  // --- 1. MINING STATE (Skeleton) ---
  if (isMining) {
    return (
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
  }

  // --- 2. EMPTY STATE ---
  if (questions.length === 0) {
    return (
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
  }

  // --- 3. RESULTS FEED ---
  return (
    <div className="space-y-4 max-w-3xl mx-auto pb-40">
      {questions.map((q) => (
        <div
          key={q.id}
          className="group bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden relative"
        >
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
              onClick={() => onSolve(q)}
              className="flex items-center gap-2 bg-gray-900 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors shadow-sm"
            >
              <PenTool size={12} />
              Draft Solution
            </button>
          </div>
        </div>
      ))}

      {/* Load More Trigger */}
      <div className="text-center py-6">
        <button className="text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-orange-600 transition-colors">
          Load more threads
        </button>
      </div>
    </div>
  );
}
