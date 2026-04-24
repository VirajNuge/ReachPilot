"use client";

import React, { useState } from "react";
import {
  FaCloud,
  FaComments,
  FaFire,
} from "react-icons/fa";
import { TbChevronRight } from "react-icons/tb";

// --- Types ---

export type IntentType = "Urgency" | "Buying" | "Educational";

export interface QuestionData {
  text: string;
  likes: number;
}

export interface KeywordNode {
  id: string;
  word: string;
  count: number;
  engagement: number;
  intent: IntentType;
  sampleQuestions: QuestionData[];
}

export interface QuestionCloudProps {
  data?: KeywordNode[];
}

// --- Mock Data ---

const MOCK_KEYWORDS: KeywordNode[] = [
  {
    id: "1",
    word: "Language Learning",
    count: 250,
    engagement: 30,
    intent: "Educational",
    sampleQuestions: [
      { text: "Which language should I learn next?", likes: 20 },
      { text: "If you had to choose exactly 5 languages, which 5 would offer the highest roi?", likes: 15 },
      { text: "Is Duolingo actually effective for fluency?", likes: 12 },
      { text: "How long does it realistically take to reach B2?", likes: 9 },
      { text: "What's the best method for memorising vocabulary fast?", likes: 8 },
    ],
  },
  {
    id: "2",
    word: "AI",
    count: 200,
    engagement: 22,
    intent: "Educational",
    sampleQuestions: [
      { text: "Which AI tool do you recommend for content creation?", likes: 35 },
      { text: "Will AI replace language teachers?", likes: 28 },
      { text: "How accurate are AI translators for business use?", likes: 18 },
    ],
  },
  {
    id: "3",
    word: "Location for Startup",
    count: 126,
    engagement: 18,
    intent: "Buying",
    sampleQuestions: [
      { text: "Is it worth relocating to start a company?", likes: 22 },
      { text: "Which cities have the best startup ecosystems right now?", likes: 16 },
      { text: "Does tax residency really matter for a bootstrapped founder?", likes: 11 },
    ],
  },
  {
    id: "4",
    word: "Praying",
    count: 58,
    engagement: 10,
    intent: "Urgency",
    sampleQuestions: [
      { text: "How do you balance spirituality with entrepreneurship?", likes: 14 },
      { text: "Does prayer actually affect mindset and productivity?", likes: 9 },
    ],
  },
  {
    id: "5",
    word: "Pricing",
    count: 65,
    engagement: 18,
    intent: "Buying",
    sampleQuestions: [
      { text: "Is there a lifetime deal?", likes: 45 },
      { text: "Student discount available?", likes: 12 },
      { text: "How does pricing scale for teams?", likes: 10 },
    ],
  },
  {
    id: "6",
    word: "Integrations",
    count: 48,
    engagement: 20,
    intent: "Educational",
    sampleQuestions: [
      { text: "Zapier integration?", likes: 40 },
      { text: "Does it connect with Notion?", likes: 25 },
    ],
  },
  {
    id: "7",
    word: "Next.js",
    count: 85,
    engagement: 12,
    intent: "Educational",
    sampleQuestions: [
      { text: "App Router examples?", likes: 33 },
      { text: "Server Actions support?", likes: 19 },
      { text: "How do you handle auth in Next.js 14?", likes: 15 },
    ],
  },
  {
    id: "8",
    word: "Roadmap",
    count: 22,
    engagement: 30,
    intent: "Educational",
    sampleQuestions: [
      { text: "When is v2 coming?", likes: 55 },
      { text: "Any plans for mobile app?", likes: 30 },
    ],
  },
  {
    id: "9",
    word: "Bug",
    count: 18,
    engagement: 5,
    intent: "Urgency",
    sampleQuestions: [
      { text: "Login is looping", likes: 3 },
      { text: "Dark mode is broken on Safari", likes: 7 },
    ],
  },
  {
    id: "10",
    word: "Support",
    count: 20,
    engagement: 15,
    intent: "Urgency",
    sampleQuestions: [
      { text: "No reply to ticket #123", likes: 18 },
      { text: "Response time is getting worse", likes: 11 },
    ],
  },
];

// --- Helpers ---

const getIntentColor = (intent: IntentType) => {
  switch (intent) {
    case "Buying":
      return { bg: "bg-blue-50", text: "text-[#0052FF]", border: "border-blue-100", badge: "bg-blue-100 text-blue-700" };
    case "Educational":
      return { bg: "bg-lime-50", text: "text-[#4a7c00]", border: "border-lime-200", badge: "bg-lime-100 text-lime-700" };
    case "Urgency":
      return { bg: "bg-red-50", text: "text-red-700", border: "border-red-100", badge: "bg-red-100 text-red-700" };
  }
};

const getIntentDot = (intent: IntentType) => {
  switch (intent) {
    case "Buying": return "bg-[#0052FF]";
    case "Educational": return "bg-[#caee55]";
    case "Urgency": return "bg-red-500";
  }
};

// --- Component ---

export default function QuestionCloud({
  data = MOCK_KEYWORDS,
}: QuestionCloudProps) {
  const [selectedKeyword, setSelectedKeyword] = useState<KeywordNode>(
    data[0] ?? MOCK_KEYWORDS[0],
  );

  const sorted = [...data].sort((a, b) => b.count - a.count);

  const handleSelect = (node: KeywordNode) => {
    if (node.id !== selectedKeyword.id) {
      setSelectedKeyword(node);
    }
  };

  const colors = getIntentColor(selectedKeyword.intent);

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.05)] p-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-start mb-5 shrink-0">
        <div>
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
            Comment Intelligence
          </h4>
          <div className="relative group cursor-help inline-block">
            <h2 className="text-xl font-black text-[#000100] leading-none mb-1">
              Keyword Cloud
            </h2>
            <div className="absolute left-0 top-full mt-2 w-64 p-3 bg-[#000100] text-white text-xs rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none">
              <div className="font-bold mb-1 text-[#caee55]">Why this matters:</div>
              Visualizes the most common questions. Blue = Buying Intent, Lime =
              Learning, Red = Complaints/Urgency.
              <div className="absolute left-4 -top-1 w-2 h-2 bg-[#000100] transform rotate-45" />
            </div>
          </div>
          <p className="text-xs font-medium text-slate-500">
            Common Questions &amp; Gaps
          </p>
        </div>
        <div className="p-2.5 bg-[#074ed5] text-white rounded-2xl shadow-sm shrink-0 flex items-center justify-center">
          <FaCloud size={18} />
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mb-4 shrink-0">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#0052FF] inline-block" />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Buying</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#caee55] inline-block" />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Educational</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Urgency</span>
        </div>
      </div>

      {/* Body: two-column layout */}
      <div className="flex gap-3 flex-1 min-h-0">

        {/* Left: scrollable keyword list */}
        <div className="w-[42%] flex flex-col min-h-0">
          <div className="overflow-y-auto flex-1 pr-1 custom-scrollbar space-y-1.5">
            {sorted.map((node) => {
              const isActive = node.id === selectedKeyword.id;
              const dot = getIntentDot(node.intent);
              return (
                <button
                  key={node.id}
                  onClick={() => handleSelect(node)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl border transition-all flex items-center gap-2.5 group ${
                    isActive
                      ? "bg-[#000100] border-[#000100] text-white shadow-md"
                      : "bg-[#f4f8fb] border-slate-100 text-slate-600 hover:border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full shrink-0 ${dot} ${isActive ? "opacity-100" : "opacity-70"}`} />
                  <span className="font-bold text-xs flex-1 truncate">{node.word}</span>
                  <span className={`text-[10px] font-bold shrink-0 ${isActive ? "text-slate-300" : "text-slate-400"}`}>
                    {node.count}
                  </span>
                  <TbChevronRight
                    size={12}
                    className={`shrink-0 transition-opacity ${isActive ? "opacity-100 text-[#caee55]" : "opacity-0 group-hover:opacity-50"}`}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: always-visible detail panel */}
        <div className="flex-1 min-h-0 flex flex-col">
          <div className={`flex-1 rounded-2xl border p-4 flex flex-col min-h-0 ${colors.bg} ${colors.border}`}>

            {/* Keyword header */}
            <div className="flex items-start justify-between mb-3 shrink-0">
              <div>
                <h3 className={`font-black text-lg leading-none mb-1 ${colors.text}`}>
                  {selectedKeyword.word}
                </h3>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${colors.badge}`}>
                    {selectedKeyword.intent}
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold">
                    {selectedKeyword.count} mentions
                  </span>
                </div>
              </div>
              {selectedKeyword.engagement > 20 && (
                <span className="text-[10px] font-bold text-[#caee55] bg-[#000100] px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Hot
                </span>
              )}
            </div>

            {/* Sample questions — scrollable, fills all available space */}
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 min-h-0">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 shrink-0 flex items-center gap-1.5">
                <FaComments size={9} />
                Sample Comments ({selectedKeyword.sampleQuestions.length})
              </div>
              {selectedKeyword.sampleQuestions.length > 0 ? (
                selectedKeyword.sampleQuestions.map((q, i) => (
                  <div
                    key={i}
                    className="flex gap-2.5 items-start p-3 bg-white border border-slate-100 rounded-xl shadow-sm"
                  >
                    <FaComments className="text-[#074ed5] flex-shrink-0 mt-0.5" size={12} />
                    <div className="flex-1">
                      <p className="text-xs text-slate-600 font-medium leading-snug">
                        &ldquo;{q.text}&rdquo;
                      </p>
                      <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        <FaFire className="text-orange-400" size={9} /> {q.likes} likes
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-8 gap-2 text-slate-300">
                  <FaComments size={24} />
                  <p className="text-xs font-medium text-slate-400">No comments yet</p>
                </div>
              )}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
