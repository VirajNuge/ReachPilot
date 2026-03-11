import React, { useState } from "react";
import {
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
        className="transition-colors p-1 rounded-md bg-[#000100] hover:bg-black text-white"
        title="Copy"
      >
        {copied ? (
          <FaCheck size={10} className="text-[#B6FF33]" />
        ) : (
          <FaCopy size={10} />
        )}
      </button>
    );
  }

  return (
    <button
      onClick={handleCopy}
      className={`relative overflow-hidden shrink-0 px-2.5 py-1.5 rounded-lg font-bold text-[10px] transition-all flex items-center justify-center min-w-[65px] active:scale-95 border ${
        copied
          ? "bg-[#B6FF33]/20 text-[#4D8C00] border-[#B6FF33]/50"
          : "bg-white text-slate-500 border-slate-200 hover:bg-[#0052FF] hover:text-white hover:border-[#0052FF]"
      }`}
      title="Copy to Clipboard"
    >
      <AnimatePresence mode="wait">
        {copied ? (
          <motion.div
            key="check"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            className="flex items-center gap-1"
          >
            <FaCheck size={9} /> Copied
          </motion.div>
        ) : (
          <motion.div
            key="copy"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            className="flex items-center gap-1"
          >
            <FaCopy size={9} /> Copy
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
    <div className="bg-white rounded-3xl border border-slate-200 shadow-[0_10px_30px_rgba(0,0,0,0.03)] overflow-hidden flex flex-col h-full">
      {/* ─── Header ─── */}
      <div className="px-5 pt-5 pb-4 flex justify-between items-start">
        <div className="flex-1">
          <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest mb-1">
            Visual DNA
          </p>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold text-[#1A1D23] leading-none">
              Aesthetic Analysis
            </h3>
            <span className="text-[11px] font-semibold bg-slate-100 text-slate-500 px-3 py-1 rounded-xl flex items-center gap-1">
              <FaRobot className="text-[#0052FF]" size={10} /> {category}
            </span>
          </div>
        </div>

        <div className="p-2.5 bg-[#0052FF] text-white rounded-xl shrink-0 cursor-help relative group">
          <FaImage size={16} />
          {/* Tooltip */}
          <div className="absolute right-0 top-full mt-2 w-64 p-3 bg-[#1A1D23] text-white text-xs rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none">
            <div className="font-bold mb-1 text-[#0052FF]">
              Why this matters:
            </div>
            Analyzes the visual elements (colors, layout) so you can replicate
            the aesthetic.
            <div className="absolute right-4 -top-1 w-2 h-2 bg-[#1A1D23] transform rotate-45" />
          </div>
        </div>
      </div>

      <div className="px-5 pb-5 space-y-6 flex-1 flex flex-col">
        {/* ─── SECTION 1: Vibe Palette (Hex Codes) ─── */}
        <div className="border-b border-slate-100 pb-5">
          <span className="text-[10px] font-medium text-slate-500 uppercase tracking-widest block mb-3 flex items-center gap-1.5">
            <FaPalette className="text-[#0052FF]" /> Color Identity
          </span>
          <div className="flex gap-3">
            {colors.map((color, i) => (
              <div key={i} className="group relative">
                <div
                  className="w-12 h-12 rounded-full border border-slate-200 shadow-sm cursor-pointer hover:border-[#0052FF] hover:scale-105 transition-all"
                  style={{ backgroundColor: color }}
                  onClick={() => navigator.clipboard.writeText(color)}
                  title={`Copy ${color}`}
                />
                <div className="absolute top-full mt-1.5 left-1/2 -translate-x-1/2 text-[10px] font-bold text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-slate-50 px-2 py-1 rounded-lg border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                  {color.toUpperCase()}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ─── SECTION 2: Text Overlay Zone ─── */}
        <div>
          <span className="text-[10px] font-medium text-slate-500 uppercase tracking-widest block mb-3 flex items-center gap-1.5">
            <FaLayerGroup className="text-[#0052FF]" /> UI Safe Zone
          </span>
          <div className="flex gap-4 items-center bg-[#F4F7FA] p-3.5 rounded-2xl border border-slate-100">
            {/* Diagram */}
            <div className="w-16 h-28 bg-white border border-slate-300 rounded-lg relative overflow-hidden flex flex-col shrink-0">
              {/* Safe Zone */}
              <div className="flex-1 w-full bg-[#B6FF33]/20 flex items-center justify-center border-y border-[#B6FF33]/40 absolute top-1/4 bottom-1/4 left-0 right-0">
                <span className="text-[8px] text-[#4D8C00] font-black uppercase text-center leading-tight">
                  Safe
                  <br />
                  Zone
                </span>
              </div>
            </div>

            {/* Explanation */}
            <div className="flex-1">
              <h4 className="font-bold text-[#1A1D23] text-[13px] mb-1">
                Center 50% Rule
              </h4>
              <p className="text-[11px] text-slate-500 leading-relaxed mb-2">
                Keep key text within the green zone to avoid overlap with
                Instagram/TikTok sidebars and captions.
              </p>
              <span className="text-[9px] font-bold bg-white text-slate-500 px-2.5 py-1 rounded-md border border-slate-200 uppercase tracking-wide inline-block">
                Applies to: Reels, TikTok, Shorts
              </span>
            </div>
          </div>
        </div>

        {/* ─── SECTION 3: AI Prompt Generator ─── */}
        <div className="pt-2 mt-auto">
          <div className="flex justify-between items-end mb-3">
            <span className="text-[10px] font-medium text-slate-500 uppercase tracking-widest block flex items-center gap-1.5">
              <FaMagic className="text-[#0052FF]" /> Prompt Generator
            </span>
            <div className="flex bg-slate-100 rounded-2xl p-1 gap-1 border border-slate-200">
              <button
                onClick={() => setPromptType("midjourney")}
                className={`px-3 py-1 text-[10px] font-bold rounded-xl transition-all ${promptType === "midjourney" ? "bg-[#0052FF] text-white shadow-sm" : "text-slate-500 hover:text-[#1A1D23]"}`}
              >
                Midjourney
              </button>
              <button
                onClick={() => setPromptType("dalle")}
                className={`px-3 py-1 text-[10px] font-bold rounded-xl transition-all ${promptType === "dalle" ? "bg-[#0052FF] text-white shadow-sm" : "text-slate-500 hover:text-[#1A1D23]"}`}
              >
                DALL-E
              </button>
            </div>
          </div>

          <div className="bg-[#1A1D23] rounded-2xl p-4 relative group shadow-inner">
            <p className="font-mono text-[11px] text-slate-300 leading-relaxed pr-6 line-clamp-4">
              {prompts[promptType]}
            </p>
            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <CopyButton text={prompts[promptType]} simple />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
