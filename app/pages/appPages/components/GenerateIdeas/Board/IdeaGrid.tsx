"use client";

import React, { useState, useEffect } from "react";
import { Sparkles } from "lucide-react";
import IdeaCard, { ContentIdea } from "./IdeaCard"; // Import from previous step

interface IdeaGridProps {
  isGenerating: boolean;
  onIdeaClick: (idea: ContentIdea) => void;
}

export default function IdeaGrid({ isGenerating, onIdeaClick }: IdeaGridProps) {
  const [ideas, setIdeas] = useState<ContentIdea[]>([]);

  // --- MOCK DATA SIMULATOR ---
  // In a real app, this would be your API response
  useEffect(() => {
    if (isGenerating) {
      // Clear old ideas while generating
      setIdeas([]);
    } else {
      // "AI has finished" - Populate with mock data
      // Only populate if we are NOT generating and have no ideas (initial load simulation)
      // For this demo, we'll just populate it after a delay if empty
      if (ideas.length === 0) {
        setIdeas([
          {
            id: "1",
            title: "The 'Anti-Hustle' Narrative",
            description:
              "Challenge the 4am grindset. Argue that rest is the ultimate productivity hack for creative work.",
            platform: "linkedin",
            score: 94,
            strategy: { goal: "Viral Reach", tone: "Controversial" },
          },
          {
            id: "2",
            title: "SaaS Pricing: The 'Good-Better-Best' Trap",
            description:
              "Break down why the standard 3-tier pricing model is failing in 2025 and what to use instead.",
            platform: "twitter",
            score: 88,
            strategy: { goal: "Lead Gen", tone: "Educational" },
          },
          {
            id: "3",
            title: "My Desk Setup (vs. Reality)",
            description:
              "A carousel showing the curated 'Instagram' view vs. the messy 'Actual Work' view. Relatability play.",
            platform: "instagram",
            score: 92,
            strategy: { goal: "Community", tone: "Funny" },
          },
          {
            id: "4",
            title: "5 AI Tools I Deleted This Week",
            description:
              "Instead of 'Top 10 Tools', do a 'Tools I Quit' list. Negative bias drives higher CTR.",
            platform: "twitter",
            score: 85,
            strategy: { goal: "Viral Reach", tone: "Controversial" },
          },
          {
            id: "5",
            title: "The ROI of Silence",
            description:
              "A deep dive into how deep work periods directly correlated with revenue growth last quarter.",
            platform: "linkedin",
            score: 79,
            strategy: { goal: "Lead Gen", tone: "Data-Driven" },
          },
        ]);
      }
    }
  }, [isGenerating]);

  // --- 1. SKELETON LOADING STATE ---
  if (isGenerating) {
    return (
      <div className="columns-1 md:columns-2 xl:columns-3 gap-6 space-y-6 pb-20">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="break-inside-avoid bg-white rounded-2xl border border-gray-100 p-5 space-y-4 shadow-sm"
          >
            <div className="flex justify-between items-center">
              <div className="w-16 h-6 bg-gray-100 rounded animate-pulse" />
              <div className="w-8 h-8 bg-gray-100 rounded-full animate-pulse" />
            </div>
            <div className="space-y-2">
              <div className="w-3/4 h-6 bg-gray-100 rounded animate-pulse" />
              <div className="w-full h-20 bg-gray-100 rounded animate-pulse" />
            </div>
            <div className="pt-4 border-t border-gray-50 flex justify-between">
              <div className="w-20 h-4 bg-gray-100 rounded animate-pulse" />
              <div className="w-8 h-8 bg-gray-100 rounded-full animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // --- 2. EMPTY STATE ---
  if (ideas.length === 0 && !isGenerating) {
    return (
      <div className="flex h-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-white/60 p-12 text-center min-h-[500px]">
        <div className="mb-6 relative">
          <div className="absolute inset-0 bg-yellow-100 rounded-full blur-xl opacity-50"></div>
          <div className="relative bg-white p-6 rounded-full shadow-sm ring-1 ring-gray-100">
            <Sparkles className="h-12 w-12 text-yellow-500" />
          </div>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-3">
          Ready to Ideate?
        </h3>
        <p className="text-gray-500 text-base max-w-lg mx-auto leading-relaxed">
          Fill out the brief on the left to generate your first batch of content
          blueprints.
        </p>
      </div>
    );
  }

  // --- 3. RESULTS GRID ---
  return (
    <div className="columns-1 md:columns-2 xl:columns-3 gap-6 space-y-6 pb-40">
      {ideas.map((idea) => (
        <div key={idea.id} className="break-inside-avoid">
          <IdeaCard idea={idea} onClick={onIdeaClick} />
        </div>
      ))}

      {/* End of Results Signal */}
      <div className="break-inside-avoid py-8 text-center">
        <button className="font-bold transition-colors uppercase tracking-widest bg-[#000100] hover:bg-black text-white">
          + Generate More Variations
        </button>
      </div>
    </div>
  );
}
