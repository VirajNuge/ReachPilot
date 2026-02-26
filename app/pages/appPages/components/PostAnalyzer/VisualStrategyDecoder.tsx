import React, { useState } from "react";
import {
  FaEye,
  FaPalette,
  FaRobot,
  FaImage,
  FaCheck,
  FaCopy,
  FaLayerGroup,
  FaMagic,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

import { VisualStrategyProps } from "@/lib/postAnalyzerTypes";

// ─── Components ───────────────────────────────────────────────────────────────

function CopyButton({
  text,
  simple = false,
}: {
  text: string;
  simple?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (simple) {
    return (
      <button
        onClick={handleCopy}
        className="text-gray-400 hover:text-white transition-colors"
        title="Copy"
      >
        {copied ? (
          <FaCheck size={10} className="text-green-500" />
        ) : (
          <FaCopy size={10} />
        )}
      </button>
    );
  }

  return (
    <button
      onClick={handleCopy}
      className="p-1.5 bg-gray-200 hover:bg-indigo-600 hover:text-white text-gray-500 rounded-lg transition-colors"
      title="Copy to Clipboard"
    >
      <AnimatePresence mode="wait">
        {copied ? (
          <motion.div
            key="check"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
          >
            <FaCheck size={12} />
          </motion.div>
        ) : (
          <motion.div
            key="copy"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
          >
            <FaCopy size={12} />
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
}

export default function VisualStrategyDecoder({
  category,
  colors,
  prompts,
}: VisualStrategyProps) {
  const [promptType, setPromptType] = useState<"midjourney" | "dalle">(
    "midjourney",
  );

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      {/* ─── Header ─── */}
      <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
            <FaImage size={16} />
          </div>
          <div className="relative group cursor-help">
            <h3 className="font-bold text-gray-900 inline-block leading-tight">
              Visual DNA
            </h3>
            <div className="absolute left-0 top-full mt-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none">
              <div className="font-bold mb-1 text-indigo-300">
                Why this matters:
              </div>
              Analyzes the visual elements (colors, layout) so you can replicate
              the aesthetic.
              <div className="absolute left-4 -top-1 w-2 h-2 bg-gray-900 transform rotate-45" />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 px-2 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase rounded-full tracking-wide">
          <FaRobot size={10} /> {category}
        </div>
      </div>

      <div className="p-5 space-y-6">
        {/* ─── SECTION 1: Vibe Palette (Hex Codes) ─── */}
        <div>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 block flex items-center gap-2">
            <FaPalette /> Vibe Palette
          </span>
          <div className="flex gap-2">
            {colors.map((color, i) => (
              <div key={i} className="group relative">
                <div
                  className="w-10 h-10 rounded-full border-2 border-white shadow-sm cursor-pointer hover:scale-110 transition-transform"
                  style={{ backgroundColor: color }}
                  onClick={() => navigator.clipboard.writeText(color)}
                  title={`Copy ${color}`}
                />
                <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 text-[9px] font-mono text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-white px-1 rounded shadow-sm border border-gray-100">
                  {color}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ─── SECTION 2: Text Overlay Zone ─── */}
        <div>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 block flex items-center gap-2">
            <FaLayerGroup /> Text Safe Zone
          </span>
          <div className="flex gap-4">
            {/* Diagram */}
            <div className="w-24 h-32 bg-gray-100 border border-gray-200 rounded-lg relative overflow-hidden flex flex-col">
              {/* Top UI Chrome Buffer */}
              <div className="h-[20%] w-full bg-red-500/10 border-b border-red-500/20 flex items-center justify-center">
                <span className="text-[8px] text-red-400 font-bold">UI</span>
              </div>
              {/* Safe Zone */}
              <div className="flex-1 w-full bg-green-500/10 flex items-center justify-center border-y border-green-500/20">
                <span className="text-[8px] text-green-600 font-bold">
                  Safe Zone
                </span>
              </div>
              {/* Bottom UI Chrome Buffer */}
              <div className="h-[20%] w-full bg-red-500/10 border-t border-red-500/20 flex items-center justify-center">
                <span className="text-[8px] text-red-400 font-bold">UI</span>
              </div>
            </div>

            {/* Explanation */}
            <div className="flex-1 py-1">
              <h4 className="font-bold text-gray-800 text-xs mb-1">
                Center 60% Rule
              </h4>
              <p className="text-[10px] text-gray-500 leading-relaxed mb-2">
                Keep your hook and key text within the green zone to avoid
                overlap with Instagram/TikTok UI overlays (captions, likes,
                etc.).
              </p>
              <div className="inline-block px-2 py-1 bg-gray-100 rounded text-[9px] font-bold text-gray-500">
                Applies to: Reels, TikTok, Shorts
              </div>
            </div>
          </div>
        </div>

        {/* ─── SECTION 3: AI Prompt Generator ─── */}
        <div className="pt-4 border-t border-gray-100">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <FaMagic /> AI Prompt Gen
            </span>
            <div className="flex bg-gray-100 rounded-lg p-0.5">
              <button
                onClick={() => setPromptType("midjourney")}
                className={`px-2 py-0.5 text-[9px] font-bold rounded-md transition-all ${promptType === "midjourney" ? "bg-white text-indigo-600 shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
              >
                Midjourney
              </button>
              <button
                onClick={() => setPromptType("dalle")}
                className={`px-2 py-0.5 text-[9px] font-bold rounded-md transition-all ${promptType === "dalle" ? "bg-white text-indigo-600 shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
              >
                DALL-E
              </button>
            </div>
          </div>

          <div className="bg-gray-900 rounded-xl p-3 relative group">
            <p className="font-mono text-[10px] text-gray-300 leading-relaxed pr-6">
              {prompts[promptType]}
            </p>
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <CopyButton text={prompts[promptType]} simple />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
