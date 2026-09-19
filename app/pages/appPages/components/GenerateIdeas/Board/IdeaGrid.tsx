"use client";

import React from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import IdeaCard from "./IdeaCard";
import type { GeneratedIdea, IdeaMode } from "@/lib/ideaFinder/types";

interface IdeaGridProps {
  ideas: GeneratedIdea[];
  mode?: IdeaMode;
  isGenerating: boolean;
  generationStep?: string;
  onIdeaClick: (idea: GeneratedIdea) => void;
  onSave?: (idea: GeneratedIdea) => void;
  savedIdeaIds?: Record<string, string>;
  onGenerateMore?: () => void;
}

const MODE_HINTS: Record<string, string> = {
  "voice-match": "Generate blueprints that perfectly match your tone and style.",
  "trend-jacker": "Find real-time trends to jump on before your competitors do.",
  "repurpose": "Turn your best hits into fresh, new formats instantly.",
  "gap-filler": "Discover the topics your audience wants but you haven't covered.",
  "prism": "Explore a single topic through 10+ distinct psychological angles.",
};

const MODE_LABELS: Record<string, string> = {
  "voice-match": "Voice-Match",
  "trend-jacker": "Trend-Jacker",
  "repurpose": "Repurpose",
  "gap-filler": "Gap Filler",
  "prism": "Prism 360°",
};

export default function IdeaGrid({
  ideas,
  mode,
  isGenerating,
  generationStep,
  onIdeaClick,
  onSave,
  savedIdeaIds,
}: IdeaGridProps) {
  const currentModeStr = mode ? MODE_LABELS[mode] : "Voice-Match";
  const firstPlatform = ideas.length > 0 ? ideas[0].platform : "All Platforms";
  
  // --- 1. MINIMAL PROCESSING STATE ---
  if (isGenerating) {
    return (
      <div className="flex h-[calc(100vh-140px)] items-center justify-center pb-20">
        <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white/85 backdrop-blur-sm p-10 text-center shadow-[0_12px_32px_rgba(0,0,0,0.05)]">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full border-4 border-[#0052FF] border-t-transparent animate-spin" />
          <h3 className="text-xl font-black text-[#000100] tracking-tight">Generating your ideas...</h3>
          <p className="mt-2 text-sm font-medium text-slate-500">
            {generationStep ?? "Building strategy and creating the best angles for your brief."}
          </p>
          <div className="mt-6 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div className="h-full w-1/2 animate-pulse rounded-full bg-[#0052FF]" />
          </div>
        </div>
      </div>
    );
  }

  // --- 2. EMPTY STATE ---
  if (ideas.length === 0 && !isGenerating) {
    const hintText = mode ? MODE_HINTS[mode] : MODE_HINTS["voice-match"];
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="flex h-[calc(100vh-140px)] flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-white/40 backdrop-blur-sm p-12 text-center"
      >
        <div className="mb-8 relative flex items-center justify-center">
          <div className="absolute w-32 h-32 bg-gradient-to-br from-[#0052FF]/30 via-[#074ed5]/20 to-[#caee55]/30 rounded-full blur-2xl animate-pulse" />
          <div className="relative bg-white w-20 h-20 rounded-2xl shadow-[0_8px_32px_rgba(0,82,255,0.1)] flex items-center justify-center ring-1 ring-slate-100 rotate-3">
            <Sparkles className="h-10 w-10 text-[#0052FF]" strokeWidth={2.5} />
          </div>
        </div>
        <h3 className="text-3xl font-black text-[#000100] mb-4 tracking-tight">
          Ready to Ideate?
        </h3>
        <p className="text-slate-500 font-medium text-base max-w-sm mx-auto leading-relaxed">
          {hintText} Fill out the brief on the left to get started.
        </p>
      </motion.div>
    );
  }

  // --- 3. RESULTS GRID ---
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col gap-6"
    >
      <div className="flex items-center gap-3 px-2">
        <span className="px-3 py-1 bg-white border border-slate-200 rounded-full text-[11px] font-black text-slate-500 uppercase tracking-widest shadow-sm">
          {ideas.length} Blueprints
        </span>
        <span className="text-slate-300">•</span>
        <span className="text-[12px] font-bold text-[#000100] uppercase tracking-wide">
          {currentModeStr}
        </span>
        <span className="text-slate-300">•</span>
        <span className="text-[12px] font-bold text-slate-500 uppercase tracking-wide">
          {ideas[0].platform === 'all' ? 'Multi-Platform' : firstPlatform}
        </span>
      </div>

      <div className="columns-1 md:columns-2 xl:columns-3 gap-6 space-y-6 pb-20">
        {ideas.map((idea, idx) => (
          <motion.div
            key={idea.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: idx * 0.05 }}
            className="break-inside-avoid"
          >
            <IdeaCard
              idea={idea}
              mode={mode}
              onClick={onIdeaClick}
              onSave={onSave}
              isSaved={!!(savedIdeaIds && savedIdeaIds[idea.id])}
            />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
