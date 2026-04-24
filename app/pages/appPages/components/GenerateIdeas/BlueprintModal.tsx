"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Copy,
  Image as ImageIcon,
  Hash,
  Target,
  TrendingUp,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  FileText,
  Link2,
  SlidersHorizontal,
  Eye,
} from "lucide-react";
import type { GeneratedIdea } from "@/lib/ideaFinder/types";
import type { PostGenerationInput } from "@/lib/types/postGeneration";
import { mapIdeaToPostSeed } from "@/lib/ideaFinder/ideaToPostSeed";
import { validatePostSeed } from "@/lib/ideaFinder/postSeedValidation";
import PostSeedPanel from "./PostSeedPanel";

type ModalTab = "preview" | "inputs";

interface BlueprintModalProps {
  isOpen: boolean;
  onClose: () => void;
  idea: GeneratedIdea | null;
  onGenerateDraft?: (idea: GeneratedIdea, editedSeed?: PostGenerationInput) => void;
}

export default function BlueprintModal({
  isOpen,
  onClose,
  idea,
  onGenerateDraft,
}: BlueprintModalProps) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<ModalTab>("preview");
  const [editedSeed, setEditedSeed] = useState<PostGenerationInput | null>(null);

  // Derive default seed when idea changes
  const defaultSeed = useMemo(() => {
    if (!idea) return null;
    if (idea.postSeed) return idea.postSeed;
    // Fallback: regenerate deterministically
    const { postSeed } = mapIdeaToPostSeed(idea, "voice-match");
    return postSeed;
  }, [idea]);

  // Reset state when modal opens with new idea
  useEffect(() => {
    if (isOpen && idea) {
      setCopied(false);
      setActiveTab("preview");
      setEditedSeed(defaultSeed ? { ...defaultSeed } : null);
    }
  }, [isOpen, idea, defaultSeed]);

  if (!isOpen || !idea) return null;

  const currentSeed = editedSeed ?? defaultSeed;
  const validation = currentSeed ? validatePostSeed(currentSeed) : { valid: false, errors: [] };

  const handleCopy = () => {
    const text = `${idea.hook}\n\n${idea.angle}\n\n${idea.suggestedCTA}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGenerateDraft = () => {
    if (onGenerateDraft && currentSeed) {
      onGenerateDraft(idea, currentSeed);
    }
  };

  const handleResetSeed = () => {
    if (defaultSeed) setEditedSeed({ ...defaultSeed });
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 80) return { text: "text-emerald-600", bg: "bg-emerald-100", bar: "bg-emerald-500" };
    if (score >= 60) return { text: "text-yellow-600", bg: "bg-yellow-100", bar: "bg-yellow-500" };
    return { text: "text-slate-600", bg: "bg-slate-100", bar: "bg-slate-400" };
  };

  const confColors = getConfidenceColor(idea.confidenceScore);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-[#000100]/40 backdrop-blur-md">
        {/* Modal Container */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="bg-white w-full max-w-6xl h-[85vh] rounded-[32px] shadow-[0_24px_80px_rgba(0,0,0,0.12)] flex overflow-hidden ring-1 ring-white/20"
        >
          {/* === LEFT COLUMN: STRATEGY INSIGHTS === */}
          <div className="w-1/3 bg-[#f4f8fb] border-r border-slate-200/60 p-8 flex flex-col overflow-y-auto custom-scrollbar relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#0052FF]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            
            {/* Header */}
            <div className="mb-8 relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#0052FF] bg-[#0052FF]/10 px-2.5 py-1 rounded-md border border-[#0052FF]/20">
                  {idea.format}
                </span>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 bg-white px-2.5 py-1 rounded-md border border-slate-200">
                  {idea.platform}
                </span>
              </div>
              <h2 className="text-2xl font-black text-[#000100] leading-tight tracking-tight">
                {idea.title}
              </h2>
            </div>

            {/* AI Insights */}
            <div className="space-y-5 flex-1 relative z-10">
              {/* Confidence Score */}
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp size={16} className="text-[#000100]" strokeWidth={2.5} />
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Confidence Score
                  </h4>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-baseline">
                    <span className="text-3xl font-black text-[#000100] tracking-tighter leading-none">
                      {idea.confidenceScore}
                      <span className="text-lg text-slate-400">/100</span>
                    </span>
                    <span className={`font-bold px-2 py-0.5 rounded-md text-[10px] uppercase tracking-wider ${confColors.text} ${confColors.bg}`}>
                      {idea.confidenceScore >= 80 ? "High" : idea.confidenceScore >= 60 ? "Medium" : "Low"}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${idea.confidenceScore}%` }}
                      transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                      className={`h-full rounded-full ${confColors.bar}`}
                    />
                  </div>
                </div>
              </div>

              {/* Why it fits */}
              {idea.whyItFits && (
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
                  <div className="flex items-center gap-2 mb-3">
                    <Target size={16} className="text-[#000100]" strokeWidth={2.5} />
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Why this fits
                    </h4>
                  </div>
                  <p className="text-[13px] text-slate-600 leading-relaxed font-medium">
                    {idea.whyItFits}
                  </p>
                </div>
              )}

              {/* Angle */}
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles size={16} className="text-[#000100]" strokeWidth={2.5} />
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Strategic Angle
                  </h4>
                </div>
                <p className="text-[13px] text-slate-600 leading-relaxed font-medium">
                  {idea.angle}
                </p>
              </div>

              {/* Visual Direction */}
              {idea.visualDirection && (
                <div className="bg-[#0052FF]/5 p-5 rounded-2xl border border-[#0052FF]/10">
                  <div className="flex items-center gap-2 mb-3">
                    <ImageIcon size={16} className="text-[#0052FF]" strokeWidth={2.5} />
                    <h4 className="text-[10px] font-black text-[#0052FF] uppercase tracking-widest">
                      Visual Direction
                    </h4>
                  </div>
                  <p className="text-[12px] font-mono text-[#0052FF] bg-white/60 p-3 rounded-xl border border-[#0052FF]/10 leading-relaxed select-all cursor-text">
                    {idea.visualDirection}
                  </p>
                </div>
              )}

              {/* Trend context (Trend-Jacker) */}
              {idea.trendTopic && (
                <div className="bg-rose-50/50 p-5 rounded-2xl border border-rose-100/50">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp size={16} className="text-rose-500" strokeWidth={2.5} />
                    <h4 className="text-[10px] font-black text-rose-500 uppercase tracking-widest">
                      Trend Context
                    </h4>
                  </div>
                  <p className="text-[13px] text-rose-900 font-bold mb-2">
                    {idea.trendTopic}
                  </p>
                  {idea.trendContext && (
                    <p className="text-[12px] text-rose-700/80 leading-relaxed font-medium">
                      {idea.trendContext}
                    </p>
                  )}
                </div>
              )}

              {/* Sources (Grounding) */}
              {idea.sources && idea.sources.length > 0 && (
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
                  <div className="flex items-center gap-2 mb-4">
                    <Link2 size={16} className="text-[#000100]" strokeWidth={2.5} />
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Sources
                    </h4>
                  </div>
                  <div className="space-y-2">
                    {idea.sources.map((src, idx) => (
                      <a
                        key={idx}
                        href={src.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 hover:bg-[#0052FF]/5 border border-slate-100 hover:border-[#0052FF]/20 transition-all group"
                      >
                        <div className="w-6 h-6 rounded-md bg-white shadow-sm flex items-center justify-center shrink-0 text-slate-400 group-hover:text-[#0052FF]">
                          <ExternalLink size={12} strokeWidth={2.5} />
                        </div>
                        <span className="text-[12px] font-bold text-slate-600 group-hover:text-[#0052FF] leading-snug truncate">
                          {src.title || src.url}
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* === RIGHT COLUMN: TABBED CONTENT === */}
          <div className="flex-1 flex flex-col bg-white relative">
            {/* Header with tabs */}
            <div className="border-b border-slate-100 bg-white z-20">
              <div className="h-16 flex items-center justify-between px-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#0052FF]/10 rounded-xl text-[#0052FF] flex items-center justify-center">
                    <FileText size={20} strokeWidth={2.5} />
                  </div>
                  <div>
                    <span className="font-black text-[#000100] text-sm block">
                      Idea Blueprint
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      {activeTab === "preview" ? "Draft Preview" : "Post Generation Inputs"}
                    </span>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 hover:bg-[#000100] hover:text-white transition-all flex items-center justify-center"
                >
                  <X size={20} strokeWidth={2.5} />
                </button>
              </div>
              {/* Tab bar */}
              <div className="flex px-8 gap-1">
                <button type="button" onClick={() => setActiveTab("preview")}
                  className={`px-4 py-2.5 text-[11px] font-black uppercase tracking-widest transition-all border-b-2 flex items-center gap-2 ${activeTab === "preview" ? "border-[#0052FF] text-[#0052FF]" : "border-transparent text-slate-400 hover:text-slate-600"}`}>
                  <Eye size={14} /> Preview
                </button>
                <button type="button" onClick={() => setActiveTab("inputs")}
                  className={`px-4 py-2.5 text-[11px] font-black uppercase tracking-widest transition-all border-b-2 flex items-center gap-2 ${activeTab === "inputs" ? "border-[#0052FF] text-[#0052FF]" : "border-transparent text-slate-400 hover:text-slate-600"}`}>
                  <SlidersHorizontal size={14} /> Inputs
                  {!validation.valid && <span className="w-2 h-2 rounded-full bg-amber-400" />}
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 p-8 overflow-y-auto bg-white custom-scrollbar">
              {activeTab === "preview" ? (
                /* ── Preview Tab ── */
                <div className="max-w-2xl mx-auto space-y-10">
                  {/* Post Preview section (from postPreview) */}
                  {idea.postPreview && (
                    <div className="p-5 bg-gradient-to-br from-[#0052FF]/5 to-transparent rounded-2xl border border-[#0052FF]/10 space-y-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles size={14} className="text-[#0052FF]" />
                        <h4 className="text-[10px] font-black text-[#0052FF] uppercase tracking-widest">Post Preview</h4>
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-[#000100] leading-tight">{idea.postPreview.headline}</h3>
                        <p className="text-[13px] text-slate-500 font-medium mt-1">{idea.postPreview.subtext}</p>
                      </div>
                      {idea.postPreview.hooks.length > 0 && (
                        <div className="space-y-2">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Hook Options</span>
                          {idea.postPreview.hooks.map((h) => (
                            <div key={h.id} className="flex items-start gap-2 p-2 bg-white rounded-xl border border-slate-100">
                              <span className="text-[10px] font-bold text-[#0052FF] bg-[#0052FF]/10 px-1.5 py-0.5 rounded shrink-0">{h.style}</span>
                              <span className="text-[12px] text-slate-700 font-medium">{h.text}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {idea.postPreview.suggestedHashtags && (
                        <div className="flex flex-wrap gap-1.5">
                          {[...idea.postPreview.suggestedHashtags.highReach, ...idea.postPreview.suggestedHashtags.niche].map((tag, i) => (
                            <span key={i} className="text-[11px] font-bold text-[#0052FF]/70 bg-[#0052FF]/5 px-2 py-0.5 rounded-md">{tag}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Hook */}
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="w-1.5 h-6 bg-[#0052FF] rounded-full" />
                      <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Hook</h3>
                    </div>
                    <p className="text-[18px] text-[#000100] leading-relaxed font-medium pl-4 border-l border-slate-100 italic">
                      &quot;{idea.hook}&quot;
                    </p>
                  </div>

                  {/* Body Content Placeholder */}
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="w-1.5 h-6 bg-slate-200 rounded-full" />
                      <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Outline</h3>
                    </div>
                    <div className="pl-4 space-y-4">
                      <div className="w-full h-4 bg-slate-100 rounded-md" />
                      <div className="w-5/6 h-4 bg-slate-100 rounded-md" />
                      <div className="w-4/6 h-4 bg-slate-100 rounded-md" />
                      <p className="text-[13px] text-slate-400 font-medium pt-2">
                        (Body content will be generated from the strategic angle)
                      </p>
                    </div>
                  </div>

                  {/* CTA */}
                  {idea.suggestedCTA && (
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <span className="w-1.5 h-6 bg-[#caee55] rounded-full" />
                        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Suggested CTA</h3>
                      </div>
                      <p className="text-[15px] text-[#000100] leading-relaxed font-bold pl-4">
                        {idea.suggestedCTA}
                      </p>
                    </div>
                  )}

                  {/* Remix info (Repurpose mode) */}
                  {idea.originalContentRef && (
                    <div className="p-6 bg-emerald-50/50 rounded-2xl border border-emerald-100/50">
                      <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-3">
                        Original Content Reference
                      </h4>
                      <p className="text-[13px] text-emerald-900 font-bold mb-2">
                        {idea.originalContentRef}
                      </p>
                      {idea.remixStrategy && (
                        <p className="text-[12px] text-emerald-700 font-medium">
                          Strategy: {idea.remixStrategy}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Gap info (Gap Filler mode) */}
                  {idea.gapTopic && (
                    <div className="p-6 bg-blue-50/50 rounded-2xl border border-blue-100/50">
                      <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-3">
                        Identified Content Gap
                      </h4>
                      <p className="text-[13px] text-blue-900 font-bold mb-2">{idea.gapTopic}</p>
                      {idea.audienceDemandSignal && (
                        <p className="text-[12px] text-blue-700 font-medium">
                          Signal: {idea.audienceDemandSignal}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                /* ── Inputs Tab ── */
                <div className="max-w-2xl mx-auto">
                  {currentSeed && (
                    <PostSeedPanel
                      postSeed={currentSeed}
                      onChange={(updated) => setEditedSeed(updated)}
                      onReset={handleResetSeed}
                    />
                  )}
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="p-6 border-t border-slate-100 bg-white flex justify-end gap-3 z-20 shadow-[0_-8px_32px_rgba(0,0,0,0.02)]">
              <button
                onClick={handleCopy}
                className="px-6 py-4 rounded-2xl font-bold text-[13px] uppercase tracking-wide transition-all flex items-center gap-2 border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300"
              >
                <Copy size={16} /> {copied ? "COPIED!" : "COPY TEXT"}
              </button>
              {onGenerateDraft && (
                <button
                  onClick={handleGenerateDraft}
                  disabled={!validation.valid}
                  className={`px-8 py-4 rounded-2xl font-black text-[13px] uppercase tracking-wide transition-all flex items-center gap-2 ${
                    validation.valid
                      ? "bg-[#0052FF] hover:bg-[#0044dd] text-white shadow-[0_4px_16px_rgba(0,82,255,0.3)] hover:shadow-[0_8px_24px_rgba(0,82,255,0.4)] hover:-translate-y-0.5"
                      : "bg-slate-200 text-slate-400 cursor-not-allowed"
                  }`}
                >
                  <FileText size={16} /> GENERATE DRAFT
                  {!validation.valid && <span className="text-[10px] font-bold ml-1">(Missing fields)</span>}
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
