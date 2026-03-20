"use client";

import React, { useState } from "react";
import { createPortal } from "react-dom";
import {
  FaFire,
  FaMagic,
  FaCopy,
  FaCheck,
  FaQuoteLeft,
  FaLayerGroup,
  FaMicroscope,
  FaBookmark,
  FaChevronRight,
  FaExclamationTriangle,
} from "react-icons/fa";
import { BsStars, BsGraphUpArrow } from "react-icons/bs";
import { motion, AnimatePresence } from "framer-motion";
import { IoMdClose } from "react-icons/io";

// --- Types ---
export interface ViralIngredient {
  name: string;
  value: string;
  score: number; // 0-10 impact
  icon?: React.ReactNode;
}

export interface ViralPostData {
  id: string;
  engagementMultiplier: string; // e.g., "5.2x"
  hookType: string;
  hookText: string;
  ingredients: ViralIngredient[];
  whyItWorked: string;
  templateStructure: string[];
}

interface ViralRecipeProps {
  data?: ViralPostData;
  recipes?: ViralPostData[];
}

type SaveState = "idle" | "saving" | "saved" | "error";

// --- Helpers ---
function buildTemplateName(recipe: ViralPostData): string {
  return `${recipe.hookType} (${recipe.engagementMultiplier} Impact)`;
}

function buildTemplateDescription(recipe: ViralPostData): string {
  const hook = recipe.hookText;
  return `Viral format with ${recipe.engagementMultiplier} engagement uplift. Hook: "${hook.slice(0, 80)}${hook.length > 80 ? "…" : ""}"`;
}

function buildTemplateStructure(recipe: ViralPostData): string {
  return recipe.templateStructure.join("\n");
}

// --- Component ---
const ViralRecipe: React.FC<ViralRecipeProps> = ({ data, recipes }) => {
  const [showReplicateModal, setShowReplicateModal] = useState(false);
  const [generatedDraft, setGeneratedDraft] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showAllFormats, setShowAllFormats] = useState(false);
  const [saveStates, setSaveStates] = useState<Record<string, SaveState>>({});

  // Mock fallback
  const mockRecipe: ViralPostData = {
    id: "outlier-1",
    engagementMultiplier: "5.2x",
    hookType: "Controversial Statement",
    hookText: "Stop using useEffect for data fetching.",
    ingredients: [
      { name: "Caption Density", value: "Short & Punchy (Under 150 chars)", score: 9 },
      { name: "Emoji Saturation", value: "Minimalist (Only 2 emojis)", score: 8 },
      { name: "Visual Sentiment", value: "High Contrast / Bold Text", score: 9 },
    ],
    whyItWorked:
      "This post challenged a common developer habit (Controversy) and offered a simpler alternative immediately, creating a high 'Share' impulse to developer teams.",
    templateStructure: [
      "HOOK: [Stop doing Common Habit X]",
      "BODY: [Explain why it's bad/slow]",
      "SOLUTION: [Introduce Better Alternative Y]",
      "CTA: [Save this for your next project]",
    ],
  };

  const allRecipes: ViralPostData[] =
    recipes && recipes.length > 0 ? recipes : data ? [data] : [mockRecipe];

  const safeData: ViralPostData = allRecipes[0];

  const handleReplicate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      const template = safeData.templateStructure
        .map((line, i) => `${i + 1}. ${line}`)
        .join("\n\n");
      setGeneratedDraft(
        `Template based on Viral Logic:\n\n${template}\n\n// Fill in the brackets with your specific niche topic.`,
      );
    }, 1500);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedDraft);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveTemplate = async (recipe: ViralPostData) => {
    setSaveStates((prev) => ({ ...prev, [recipe.id]: "saving" }));

    const platforms = ["linkedin", "instagram_post", "x", "facebook"] as const;
    const body = {
      name: buildTemplateName(recipe),
      description: buildTemplateDescription(recipe),
      category: "thought_leadership",
      platforms: [...platforms],
      platformVariants: platforms.map((platform) => ({
        platform,
        structure: buildTemplateStructure(recipe),
      })),
      isBundle: true,
      matchKeywords: [recipe.hookType.toLowerCase(), "viral", "outlier"],
      bestForObjectives: ["awareness", "engagement"],
    };

    try {
      const res = await fetch("/api/caption-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        setSaveStates((prev) => ({ ...prev, [recipe.id]: "error" }));
        setTimeout(
          () => setSaveStates((prev) => ({ ...prev, [recipe.id]: "idle" })),
          3000,
        );
        return;
      }

      setSaveStates((prev) => ({ ...prev, [recipe.id]: "saved" }));
    } catch {
      setSaveStates((prev) => ({ ...prev, [recipe.id]: "error" }));
      setTimeout(
        () => setSaveStates((prev) => ({ ...prev, [recipe.id]: "idle" })),
        3000,
      );
    }
  };

  // --- "View All Formats" Portal ---
  const allFormatsModal =
    showAllFormats
      ? createPortal(
          <AnimatePresence>
            <motion.div
              key="all-formats-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
              onClick={(e) => {
                if (e.target === e.currentTarget) setShowAllFormats(false);
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 16 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden"
              >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-[#000100] text-[#caee55] rounded-2xl">
                      <FaLayerGroup size={16} />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-[#000100] leading-none">
                        All Viral Formats
                      </h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                        {allRecipes.length} format{allRecipes.length !== 1 ? "s" : ""} — Outlier Forensics
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowAllFormats(false)}
                    className="p-2 hover:bg-[#f4f8fb] rounded-full transition-colors"
                  >
                    <IoMdClose size={22} className="text-slate-400" />
                  </button>
                </div>

                {/* Scrollable body */}
                <div className="flex-1 overflow-y-auto p-6 custom-scroll flex flex-col gap-5">
                  {allRecipes.map((recipe, idx) => {
                    const saveState = saveStates[recipe.id] ?? "idle";
                    return (
                      <motion.div
                        key={recipe.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.06 }}
                        className="bg-[#f4f8fb] border border-slate-100 rounded-2xl p-5 flex flex-col gap-4"
                      >
                        {/* Format header */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-[#074ed5] text-white text-[10px] font-black flex items-center justify-center shrink-0">
                              {idx + 1}
                            </span>
                            <div>
                              <p className="text-sm font-black text-[#000100] leading-none">
                                {recipe.hookType}
                              </p>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <FaFire className="text-[#074ed5]" size={9} />
                                <span className="text-[10px] font-bold text-[#074ed5]">
                                  {recipe.engagementMultiplier} Impact
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Save Template button */}
                          <button
                            onClick={() => handleSaveTemplate(recipe)}
                            disabled={saveState === "saving" || saveState === "saved"}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all border ${
                              saveState === "saved"
                                ? "bg-[#caee55] border-[#caee55] text-[#000100]"
                                : saveState === "error"
                                ? "bg-red-50 border-red-200 text-red-600"
                                : saveState === "saving"
                                ? "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed"
                                : "bg-white border-slate-200 text-slate-600 hover:border-[#074ed5] hover:text-[#074ed5]"
                            }`}
                          >
                            {saveState === "saving" ? (
                              <>
                                <BsStars className="animate-spin" size={11} />
                                Saving…
                              </>
                            ) : saveState === "saved" ? (
                              <>
                                <FaCheck size={11} />
                                Saved
                              </>
                            ) : saveState === "error" ? (
                              <>
                                <FaExclamationTriangle size={11} />
                                Retry
                              </>
                            ) : (
                              <>
                                <FaBookmark size={11} />
                                Save Template
                              </>
                            )}
                          </button>
                        </div>

                        {/* Hook */}
                        <div className="bg-white border border-slate-100 rounded-xl p-3 relative overflow-hidden">
                          <div className="absolute top-0 right-0 p-2 opacity-20">
                            <FaQuoteLeft className="text-slate-300 text-3xl rotate-12" />
                          </div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                            Hook
                          </p>
                          <p className="text-sm font-bold text-[#000100] italic leading-relaxed relative z-10">
                            &ldquo;{recipe.hookText}&rdquo;
                          </p>
                        </div>

                        {/* Template structure */}
                        <div className="bg-[#000100] rounded-xl p-4 font-mono text-[10px] text-slate-300 leading-6">
                          {recipe.templateStructure.map((line, i) => (
                            <div
                              key={i}
                              className="border-l-2 border-[#caee55] pl-3 mb-1.5 font-medium tracking-wide"
                            >
                              {line}
                            </div>
                          ))}
                        </div>

                        {/* Ingredients */}
                        <div className="flex flex-col gap-1.5">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            Key Ingredients
                          </p>
                          {recipe.ingredients.map((ing, i) => (
                            <div
                              key={i}
                              className="flex items-center justify-between bg-white border border-slate-100 rounded-xl px-3 py-2"
                            >
                              <div>
                                <p className="text-xs font-bold text-[#000100]">{ing.name}</p>
                                <p className="text-[10px] text-slate-500">{ing.value}</p>
                              </div>
                              <div className="flex gap-0.5">
                                {[...Array(Math.min(ing.score > 7 ? 3 : 2, 3))].map((_, idx2) => (
                                  <div key={idx2} className="w-1.5 h-3 bg-[#caee55] rounded-full" />
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Why it worked */}
                        <div className="flex items-start gap-2">
                          <BsGraphUpArrow className="text-[#074ed5] mt-0.5 shrink-0" size={11} />
                          <p className="text-xs text-slate-500 font-medium leading-relaxed">
                            {recipe.whyItWorked}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Footer note */}
                <div className="px-6 py-4 border-t border-slate-100 shrink-0">
                  <p className="text-[10px] text-slate-400 font-medium text-center">
                    Saved templates appear in Post Generator → Writing Style selector
                  </p>
                </div>
              </motion.div>
            </motion.div>
          </AnimatePresence>,
          document.body
        )
      : null;

  // --- Replicate modal (portal) ---
  const replicateModal =
    showReplicateModal
      ? createPortal(
          <AnimatePresence>
            <motion.div
              key="replicate-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
              onClick={(e) => {
                if (e.target === e.currentTarget) setShowReplicateModal(false);
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 16 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden"
              >
                <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-[#caee55] text-[#000100] rounded-2xl">
                      <FaMagic size={16} />
                    </div>
                    <h3 className="text-lg font-black text-[#000100]">
                      Template Generator
                    </h3>
                  </div>
                  <button
                    onClick={() => setShowReplicateModal(false)}
                    className="p-2 hover:bg-[#f4f8fb] rounded-full transition-colors"
                  >
                    <IoMdClose size={22} className="text-slate-400" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 custom-scroll flex flex-col gap-4">
                  {isGenerating ? (
                    <div className="flex flex-col items-center justify-center gap-4 py-16">
                      <BsStars className="text-[#074ed5] text-4xl animate-spin" />
                      <p className="font-bold text-slate-500 uppercase tracking-widest text-xs">
                        Extracting Viral DNA…
                      </p>
                    </div>
                  ) : (
                    <>
                      <p className="text-xs text-slate-500 font-medium">
                        Here is a structure based on the outlier post. Fill in the blanks with your topic.
                      </p>
                      <div className="flex-1 bg-[#f4f8fb] border border-slate-200 rounded-2xl p-5 font-mono text-sm text-[#000100] whitespace-pre-wrap overflow-y-auto custom-scroll shadow-inner">
                        {generatedDraft}
                      </div>
                      <button
                        onClick={copyToClipboard}
                        className={`w-full py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                          copied
                            ? "bg-[#caee55] text-[#000100]"
                            : "bg-[#074ed5] text-white hover:bg-[#0041CC] shadow-[0_4px_14px_0_rgba(0,82,255,0.39)]"
                        }`}
                      >
                        {copied ? <FaCheck /> : <FaCopy />}
                        {copied ? "Copied to Clipboard!" : "Copy Template"}
                      </button>
                    </>
                  )}
                </div>
              </motion.div>
            </motion.div>
          </AnimatePresence>,
          document.body
        )
      : null;

  return (
    <>
      <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.05)] p-6 h-full flex flex-col">
        {/* Header Row */}
        <div className="flex justify-between items-start mb-5">
          <div>
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
              Outlier Forensics
            </h4>
            <h2 className="text-xl font-black text-[#000100] leading-none mb-1">
              Viral Recipe Replicator
            </h2>
            <div className="flex items-center gap-2 flex-wrap mt-2">
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#caee55]/20 rounded-full border border-[#caee55]/30 text-[#000100] inline-flex">
                <FaFire className="text-[#074ed5]" size={10} />
                <span className="text-[10px] uppercase font-bold tracking-wider">
                  {safeData.engagementMultiplier} Impact
                </span>
              </div>
            </div>
          </div>

          {/* Top Right Icon Badge */}
          <div className="p-2.5 bg-[#074ed5] text-white rounded-2xl shadow-sm shrink-0">
            <FaMicroscope size={18} />
          </div>
        </div>

        {/* View All Formats row — shown when multiple recipes available */}
        {allRecipes.length > 1 && (
          <button
            onClick={() => setShowAllFormats(true)}
            className="mb-4 w-full flex items-center justify-between px-4 py-3 bg-[#f4f8fb] border border-slate-100 rounded-2xl hover:border-[#074ed5]/30 transition-all group"
          >
            <div className="flex items-center gap-2">
              <FaLayerGroup className="text-[#074ed5]" size={12} />
              <span className="text-xs font-bold text-[#074ed5]">
                View All Formats
              </span>
              <span className="text-[10px] font-medium text-slate-400">
                ({allRecipes.length} viral templates for this profile)
              </span>
            </div>
            <FaChevronRight className="text-slate-300 group-hover:text-[#074ed5] transition-colors" size={12} />
          </button>
        )}

        <div className="flex flex-col lg:flex-row flex-1 gap-6">
          {/* Left: Decomposition Card */}
          <div className="w-full lg:w-1/2 flex flex-col gap-4">
            {/* The Hook Analysis */}
            <div className="bg-[#f4f8fb] rounded-2xl p-4 border border-slate-100 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-2 opacity-30">
                <FaQuoteLeft className="text-slate-300 text-4xl transform rotate-12" />
              </div>
              <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                The Hook ({safeData.hookType})
              </h5>
              <p className="text-sm font-black text-[#000100] leading-relaxed relative z-10 italic">
                &ldquo;{safeData.hookText}&rdquo;
              </p>
            </div>

            {/* Ingredients List */}
            <div className="flex flex-col gap-2">
              <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                Key Ingredients
              </h5>
              {safeData.ingredients.map((ing, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-2xl shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-[#f4f8fb] flex items-center justify-center text-slate-500 text-[10px] font-black">
                      {i + 1}
                    </span>
                    <div>
                      <p className="text-xs font-bold text-[#000100]">{ing.name}</p>
                      <p className="text-[10px] font-medium text-slate-500">{ing.value}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {[...Array(Math.min(ing.score > 7 ? 3 : 2, 3))].map((_, idx) => (
                      <div key={idx} className="w-1.5 h-3 bg-[#caee55] rounded-full" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Insight & Action */}
          <div className="w-full lg:w-1/2 flex flex-col justify-between gap-5">
            {/* Why It Worked Insight Box */}
            <div className="bg-[#f4f8fb] rounded-2xl p-4 border border-slate-100">
              <div className="flex items-center gap-1.5 mb-2">
                <BsGraphUpArrow className="text-[#074ed5]" size={10} />
                <h5 className="text-[10px] font-bold text-[#074ed5] uppercase tracking-widest">
                  Why It Worked
                </h5>
              </div>
              <p className="text-sm text-slate-500 font-medium leading-relaxed">
                {safeData.whyItWorked}
              </p>
            </div>

            {/* Template Preview */}
            <div className="flex-1 bg-[#000100] rounded-2xl p-5 text-slate-300 font-mono text-[10px] leading-6 overflow-hidden relative shadow-inner">
              <div className="absolute top-3 right-3 text-slate-600">
                <FaLayerGroup size={14} />
              </div>
              {safeData.templateStructure.map((line, i) => (
                <div
                  key={i}
                  className="border-l-2 border-[#074ed5] pl-3 mb-2 font-medium tracking-wide"
                >
                  {line}
                </div>
              ))}
              <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-[#000100] to-transparent pointer-events-none" />
            </div>

            <div className="mt-auto flex flex-col gap-2">
              <button
                onClick={() => {
                  setShowReplicateModal(true);
                  handleReplicate();
                }}
                className="w-full py-3 bg-[#000100] hover:bg-black text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-[0_4px_14px_0_rgba(26,29,35,0.2)] active:scale-[0.98]"
              >
                <FaMagic className="text-[#caee55]" />
                Replicate Recipe
              </button>

              {allRecipes.length === 1 && (
                <button
                  onClick={() => setShowAllFormats(true)}
                  className="w-full py-3 border border-[#074ed5]/30 text-[#074ed5] bg-[#074ed5]/5 hover:bg-[#074ed5]/10 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                >
                  <FaLayerGroup size={13} />
                  View All Formats
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {allFormatsModal}
      {replicateModal}
    </>
  );
};

export default ViralRecipe;
