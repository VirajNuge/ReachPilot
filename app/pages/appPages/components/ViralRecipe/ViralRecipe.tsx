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
import { BsStars, BsGraphUpArrow, BsEmojiSmile } from "react-icons/bs";
import { motion, AnimatePresence } from "framer-motion";

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
      setGeneratedDraft(
        `Template based on Viral Logic:\n\n1. HOOK: "Stop [Your Topic's Bad Habit] immediately."\n2. REASON: "It's killing your [Metric/Goal]."\n3. FIX: "Try [Your Solution] instead."\n4. CTA: "Drop a 🔥 if you agree."`,
      );
    }, 1500);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedDraft);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full w-full bg-white relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-6 pb-2">
        <div className="flex gap-3 items-center">
          <div className="bg-purple-50 p-2.5 rounded-xl text-purple-600">
            <FaMicroscope size={18} />
          </div>
          <div>
            <div className="relative group cursor-help">
              <h4 className="font-bold text-lg text-gray-900 leading-tight inline-block">
                Viral Recipe Replicator
              </h4>
              {/* Tooltip */}
              <div className="absolute left-0 top-full mt-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none">
                <div className="font-bold mb-1 text-purple-300">
                  Why this matters:
                </div>
                Deconstructs outlier posts to find the exact ingredients (hooks,
                emojis, length) that caused them to go viral.
                <div className="absolute left-4 -top-1 w-2 h-2 bg-gray-900 transform rotate-45"></div>
              </div>
            </div>
            <p className="text-xs text-gray-500 font-medium">
              Outlier Forensics
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-purple-100/50 rounded-full border border-purple-100 text-purple-700">
          <FaFire className="text-orange-500" />
          <span className="text-[10px] uppercase font-bold tracking-wider">
            {safeData.engagementMultiplier} Avg
          </span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row flex-1 p-6 pt-0 gap-6">
        {/* Left: Decomposition Card */}
        <div className="w-full lg:w-1/2 flex flex-col gap-4">
          {/* The Hook Analysis */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-2 opacity-50">
              <FaQuoteLeft className="text-gray-200 text-4xl transform rotate-12" />
            </div>
            <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
              The Hook ({safeData.hookType})
            </h5>
            <p className="text-sm font-bold text-gray-800 italic leading-relaxed relative z-10">
              "{safeData.hookText}"
            </p>
          </div>

          {/* Ingredients List */}
          <div className="flex flex-col gap-2">
            <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
              Key Ingredients
            </h5>
            {safeData.ingredients.map((ing, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-lg shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 text-[10px] font-bold">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-xs font-bold text-gray-700">
                      {ing.name}
                    </p>
                    <p className="text-[10px] text-gray-500">{ing.value}</p>
                  </div>
                </div>
                <div className="flex gap-0.5">
                  {[...Array(Math.min(ing.score > 7 ? 3 : 2, 3))].map(
                    (_, idx) => (
                      <div
                        key={idx}
                        className="w-1 h-3 bg-green-400 rounded-full"
                      />
                    ),
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Insight & Action */}
        <div className="w-full lg:w-1/2 flex flex-col gap-4">
          {/* Simple Analysis */}
          <div className="bg-purple-50/50 rounded-xl p-4 border border-purple-100/50">
            <div className="flex items-center gap-2 mb-2">
              <BsGraphUpArrow className="text-purple-600 text-xs" />
              <h5 className="text-[10px] font-bold text-purple-800 uppercase tracking-wider">
                Why It Worked
              </h5>
            </div>
            <p className="text-xs text-gray-700 font-medium leading-relaxed">
              "{safeData.whyItWorked}"
            </p>
          </div>

          {/* Template Preview */}
          <div className="flex-1 bg-gray-900 rounded-xl p-4 text-gray-300 font-mono text-[10px] leading-6 overflow-hidden relative">
            <div className="absolute top-2 right-2 text-gray-600">
              <FaLayerGroup />
            </div>
            {safeData.templateStructure.map((line, i) => (
              <div key={i} className="border-l-2 border-purple-500 pl-2 mb-1">
                {line}
              </div>
            ))}
            <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-gray-900 to-transparent" />
          </div>

          <button
            onClick={() => {
              setShowReplicateModal(true);
              handleReplicate();
            }}
            className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.98]"
          >
            <FaMagic />
            Replicate Recipe
          </button>
        </div>
      </div>

      {/* --- Action Modal --- */}
      <AnimatePresence>
        {showReplicateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-20 bg-white/95 backdrop-blur-md flex flex-col p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="bg-purple-100 p-2 rounded-lg text-purple-700">
                  <FaMagic />
                </div>
                <h3 className="text-lg font-bold text-gray-900">
                  Template Generator
                </h3>
              </div>
              <button
                onClick={() => setShowReplicateModal(false)}
                className="text-xs font-bold text-gray-500 hover:text-gray-900 underline"
              >
                Close
              </button>
            </div>

            {isGenerating ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-3">
                <BsStars className="text-purple-500 text-3xl animate-spin" />
                <p className="font-bold text-gray-600">
                  Extracting Viral DNA...
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-4 flex-1">
                <p className="text-xs text-gray-500">
                  Here is a structure based on the outlier post. Fill in the
                  blanks with your topic.
                </p>
                <div className="flex-1 bg-gray-50 border border-gray-200 rounded-xl p-4 font-mono text-sm text-gray-700 whitespace-pre-wrap overflow-y-auto custom-scroll">
                  {generatedDraft}
                </div>
                <button
                  onClick={copyToClipboard}
                  className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${copied ? "bg-green-500 text-white" : "bg-gray-900 text-white hover:bg-black"}`}
                >
                  {copied ? <FaCheck /> : <FaCopy />}
                  {copied ? "Copied!" : "Copy Template"}
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
