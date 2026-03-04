"use client";

import React, { useState } from "react";
import {
  FaFire,
  FaMagic,
  FaCopy,
  FaCheck,
  FaQuoteLeft,
  FaLayerGroup,
  FaMicroscope,
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
}

// --- Component ---
const ViralRecipe: React.FC<ViralRecipeProps> = ({ data }) => {
  const [showReplicateModal, setShowReplicateModal] = useState(false);
  const [generatedDraft, setGeneratedDraft] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  // Mock Data
  const safeData: ViralPostData = data || {
    id: "outlier-1",
    engagementMultiplier: "5.2x",
    hookType: "Controversial Statement",
    hookText: "Stop using useEffect for data fetching.",
    ingredients: [
      {
        name: "Caption Density",
        value: "Short & Punchy (Under 150 chars)",
        score: 9,
      },
      {
        name: "Emoji Saturation",
        value: "Minimalist (Only 2 emojis)",
        score: 8,
      },
      {
        name: "Visual Sentiment",
        value: "High Contrast / Bold Text",
        score: 9,
      },
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

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.05)] p-6 h-full flex flex-col relative overflow-hidden">
      {/* Header Row */}
      <div className="flex justify-between items-start mb-5">
        <div>
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
            Outlier Forensics
          </h4>
          <h2 className="text-xl font-black text-[#000100] leading-none mb-1">
            Viral Recipe Replicator
          </h2>
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#caee55]/20 rounded-full border border-[#caee55]/30 text-[#000100] mt-2 inline-flex w-fit">
            <FaFire className="text-[#074ed5]" size={10} />
            <span className="text-[10px] uppercase font-bold tracking-wider">
              {safeData.engagementMultiplier} Impact
            </span>
          </div>
        </div>

        {/* Top Right Icon Badge */}
        <div className="p-2.5 bg-[#074ed5] text-white rounded-2xl shadow-sm shrink-0">
          <FaMicroscope size={18} />
        </div>
      </div>

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
              "{safeData.hookText}"
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
                    <p className="text-xs font-bold text-[#000100]">
                      {ing.name}
                    </p>
                    <p className="text-[10px] font-medium text-slate-500">
                      {ing.value}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1">
                  {[...Array(Math.min(ing.score > 7 ? 3 : 2, 3))].map(
                    (_, idx) => (
                      <div
                        key={idx}
                        className="w-1.5 h-3 bg-[#caee55] rounded-full"
                      />
                    ),
                  )}
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

          <div className="mt-auto">
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
          </div>
        </div>
      </div>

      {/* --- Action Modal --- */}
      <AnimatePresence>
        {showReplicateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-20 bg-white/95 backdrop-blur-md flex flex-col p-6 rounded-3xl"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-[#caee55] text-[#000100] rounded-2xl">
                  <FaMagic size={18} />
                </div>
                <h3 className="text-xl font-black text-[#000100]">
                  Template Generator
                </h3>
              </div>
              <button
                onClick={() => setShowReplicateModal(false)}
                className="p-2 hover:bg-[#f4f8fb] rounded-full transition-colors"
              >
                <IoMdClose size={24} className="text-slate-400" />
              </button>
            </div>

            {isGenerating ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-4">
                <BsStars className="text-[#074ed5] text-4xl animate-spin" />
                <p className="font-bold text-slate-500 uppercase tracking-widest text-xs">
                  Extracting Viral DNA...
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-4 flex-1">
                <p className="text-xs text-slate-500 font-medium">
                  Here is a structure based on the outlier post. Fill in the
                  blanks with your topic.
                </p>
                <div className="flex-1 bg-[#f4f8fb] border border-slate-200 rounded-2xl p-5 font-mono text-sm text-[#000100] whitespace-pre-wrap overflow-y-auto custom-scroll shadow-inner">
                  {generatedDraft}
                </div>
                <button
                  onClick={copyToClipboard}
                  className={`w-full py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-sm ${
                    copied
                      ? "bg-[#caee55] text-[#000100]"
                      : "bg-[#074ed5] text-white hover:bg-[#0041CC] shadow-[0_4px_14px_0_rgba(0,82,255,0.39)]"
                  }`}
                >
                  {copied ? <FaCheck /> : <FaCopy />}
                  {copied ? "Copied to Clipboard!" : "Copy Template"}
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ViralRecipe;
