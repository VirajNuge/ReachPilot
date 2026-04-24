"use client";

import React, { useState } from "react";
import { createPortal } from "react-dom";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import {
  FaBrain,
  FaExchangeAlt,
  FaRobot,
  FaTimes,
  FaCheck,
  FaLightbulb,
  FaChartLine,
  FaSave,
  FaExternalLinkAlt,
} from "react-icons/fa";
import { BsStars } from "react-icons/bs";
import { motion, AnimatePresence } from "framer-motion";

// --- Types ---
export interface TriggerData {
  trigger: string;
  score: number; // 0-100
  fullMark: number;
}

export interface PsychData {
  radarData: TriggerData[];
  winningTrigger: string;
  insight: string;
}

interface TriggerSwapResult {
  originalTrigger: string;
  targetTrigger: string;
  originalPost: string;
  rewrittenPost: string;
  explanation: string;
  expectedImpact: string;
}

type ModalState = "closed" | "loading" | "results" | "error";

type TemplateState = "idle" | "loading" | "success" | "error";

interface SavedTemplateResult {
  templateId: string;
  templateName: string;
  description: string;
  category: string;
  platform: string;
  structure: string;
  examplePost: string;
}

interface PsychTriggersProps {
  data?: PsychData;
}

// --- Trigger metadata ---
const TRIGGER_META: Record<
  string,
  { color: string; bgColor: string; description: string; icon: string }
> = {
  Authority: {
    color: "text-blue-700",
    bgColor: "bg-blue-100",
    description: "Credentials & expertise",
    icon: "🎓",
  },
  FOMO: {
    color: "text-red-600",
    bgColor: "bg-red-100",
    description: "Fear of missing out",
    icon: "⚡",
  },
  "Social Proof": {
    color: "text-emerald-700",
    bgColor: "bg-emerald-100",
    description: "Community & results",
    icon: "👥",
  },
  Reciprocity: {
    color: "text-purple-700",
    bgColor: "bg-purple-100",
    description: "Give value first",
    icon: "🎁",
  },
  Urgency: {
    color: "text-orange-700",
    bgColor: "bg-orange-100",
    description: "Time pressure",
    icon: "⏰",
  },
  Curiosity: {
    color: "text-indigo-700",
    bgColor: "bg-indigo-100",
    description: "Open loops & mystery",
    icon: "🔍",
  },
};

// --- Derive a richer AI observation from radar data ---
function buildRichObservation(data: PsychData): {
  headline: string;
  gap: string;
  recommendation: string;
  gapTrigger: string;
} {
  const sorted = [...data.radarData].sort((a, b) => b.score - a.score);
  const top = sorted[0];
  const weakest = sorted[sorted.length - 1];
  const second = sorted[1];

  const winnerScore = top?.score ?? 0;
  const weakScore = weakest?.score ?? 0;
  const gap = winnerScore - weakScore;

  const recMap: Record<string, string> = {
    Authority:
      "Try leading with hard data or credentials to validate claims before asking for engagement.",
    FOMO: "Introduce limited-time framing or exclusivity signals to accelerate decisions.",
    "Social Proof":
      "Weave in social proof elements — numbers, testimonials, or follower milestones — to lower resistance.",
    Reciprocity:
      "Lead with actionable free value before any ask to build goodwill and reciprocal engagement.",
    Urgency:
      "Add deadline-driven language to posts that currently feel open-ended.",
    Curiosity:
      "Open with a provocative question or contrarian take to force readers to engage before scrolling.",
  };

  return {
    headline: `${top?.trigger ?? "Unknown"} dominates at ${winnerScore}/100, with ${second?.trigger ?? ""} close behind at ${second?.score ?? 0}/100.`,
    gap:
      gap > 40
        ? `Heavy over-reliance on ${top?.trigger} (${winnerScore}) leaves ${weakest?.trigger} severely underdeveloped (${weakScore}) — a ${gap}-point gap that creates predictable, one-dimensional content.`
        : `Trigger mix is relatively balanced, but ${weakest?.trigger} (${weakScore}) still has the most room to grow.`,
    recommendation:
      recMap[weakest?.trigger ?? ""] ??
      "Diversify trigger usage across post types.",
    gapTrigger: weakest?.trigger ?? "",
  };
}

// --- Component ---
const PsychTriggers: React.FC<PsychTriggersProps> = ({ data }) => {
  const [modalState, setModalState] = useState<ModalState>("closed");
  const [selectedTrigger, setSelectedTrigger] = useState("");
  const [swapResult, setSwapResult] = useState<TriggerSwapResult | null>(null);
  const [swapError, setSwapError] = useState(false);
  const [copiedSide, setCopiedSide] = useState<"original" | "rewrite" | null>(
    null,
  );

  // Template generation state
  const [templateState, setTemplateState] = useState<TemplateState>("idle");
  const [savedTemplate, setSavedTemplate] =
    useState<SavedTemplateResult | null>(null);
  const [templateModalOpen, setTemplateModalOpen] = useState(false);

  // Mock Data
  const safeData: PsychData = data || {
    radarData: [
      { trigger: "Authority", score: 80, fullMark: 100 },
      { trigger: "FOMO", score: 40, fullMark: 100 },
      { trigger: "Social Proof", score: 90, fullMark: 100 },
      { trigger: "Reciprocity", score: 60, fullMark: 100 },
      { trigger: "Urgency", score: 70, fullMark: 100 },
      { trigger: "Curiosity", score: 50, fullMark: 100 },
    ],
    winningTrigger: "Social Proof",
    insight:
      "This brand leans heavily into Social Proof. Their engagement spikes by 40% when they use testimonials or user results.",
  };

  const observation = buildRichObservation(safeData);

  const triggersList = safeData.radarData.map((t) => t.trigger);

  // Infer the current dominant trigger from the post content heuristically —
  // default to winningTrigger since we don't have real-time post analysis
  const currentTrigger = safeData.winningTrigger;

  const handleTriggerSwap = async () => {
    const targetTrigger = observation.gapTrigger || triggersList[0];
    setSelectedTrigger(targetTrigger);
    setModalState("loading");
    setSwapError(false);
    setSwapResult(null);
    try {
      const res = await fetch("/api/analyze-extension/trigger-swap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentTrigger,
          targetTrigger,
          winningTrigger: safeData.winningTrigger,
          insight: safeData.insight,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.rewrittenPost) throw new Error("bad response");
      setSwapResult(json as TriggerSwapResult);
      setModalState("results");
    } catch {
      setSwapError(true);
      setModalState("error");
    }
  };

  const handleCopy = (text: string, side: "original" | "rewrite") => {
    navigator.clipboard.writeText(text);
    setCopiedSide(side);
    setTimeout(() => setCopiedSide(null), 2000);
  };

  const handleSaveTemplate = async () => {
    setTemplateState("loading");
    setSavedTemplate(null);
    setTemplateModalOpen(true);
    try {
      const res = await fetch("/api/analyze-extension/generate-template", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const json = await res.json();
      if (!res.ok || !json.templateId)
        throw new Error(json.error || "bad response");
      setSavedTemplate(json as SavedTemplateResult);
      setTemplateState("success");
    } catch {
      setTemplateState("error");
    }
  };

  const meta = TRIGGER_META[safeData.winningTrigger];

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.05)] p-6 h-full flex flex-col relative overflow-hidden">
      {/* Header Row */}
      <div className="flex justify-between items-start mb-5">
        <div>
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
            Psychological Triggers
          </h4>
          <h2 className="text-xl font-black text-[#000100] leading-none mb-1">
            Intent Analysis
          </h2>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs font-medium text-slate-500">
              Top Lever:
            </span>
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[#000100] ${meta?.bgColor ?? "bg-[#caee55]/20"} border-slate-200`}
            >
              <BsStars className="text-[#074ed5]" size={10} />
              <span className="text-[10px] uppercase font-bold tracking-wider">
                {safeData.winningTrigger}
              </span>
            </div>
          </div>
        </div>

        {/* Top Right Icon Badge */}
        <div className="p-2.5 bg-[#074ed5] text-white rounded-2xl shadow-sm shrink-0">
          <FaBrain size={18} />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row flex-1 gap-6 overflow-hidden">
        {/* Left: Radar Chart */}
        <div className="w-full lg:w-1/2 min-h-[250px] relative">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart
              cx="50%"
              cy="50%"
              outerRadius="70%"
              data={safeData.radarData}
            >
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis
                dataKey="trigger"
                tick={{ fill: "#64748b", fontSize: 10, fontWeight: 600 }}
              />
              <PolarRadiusAxis
                angle={30}
                domain={[0, 100]}
                tick={false}
                axisLine={false}
              />
              <Radar
                name="Psych Profile"
                dataKey="score"
                stroke="#0052FF"
                strokeWidth={2}
                fill="#0052FF"
                fillOpacity={0.12}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#000100",
                  color: "white",
                  borderRadius: "12px",
                  border: "none",
                  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                  fontSize: "12px",
                  fontWeight: "bold",
                  padding: "6px 10px",
                }}
                itemStyle={{ color: "white" }}
                cursor={false}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Right: Rich Observation & Action */}
        <div className="flex-1 flex flex-col gap-4 justify-between min-w-0">
          {/* Rich AI Observation */}
          <div className="bg-[#f4f8fb] rounded-2xl border border-slate-100 p-4 flex flex-col gap-3">
            <h4 className="text-[10px] font-bold text-[#074ed5] uppercase tracking-widest flex items-center gap-1.5">
              <FaBrain className="text-[#074ed5] shrink-0" size={10} /> AI
              Observation
            </h4>

            {/* Headline stat */}
            <p className="text-xs font-black text-[#1A1D23] leading-snug">
              {observation.headline}
            </p>

            {/* Gap analysis */}
            <div className="flex items-start gap-2">
              <FaChartLine
                className="text-[#074ed5] shrink-0 mt-0.5"
                size={11}
              />
              <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                {observation.gap}
              </p>
            </div>

            {/* Recommendation */}
            <div className="flex items-start gap-2 bg-white rounded-xl border border-slate-100 p-2.5">
              <FaLightbulb
                className="text-amber-500 shrink-0 mt-0.5"
                size={11}
              />
              <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                <span className="font-black text-[#1A1D23]">Tip: </span>
                {observation.recommendation}
              </p>
            </div>

            {/* Original insight from AI */}
            {safeData.insight && (
              <p className="text-[11px] text-slate-400 italic leading-relaxed border-t border-slate-100 pt-2">
                &ldquo;{safeData.insight}&rdquo;
              </p>
            )}
          </div>

          <div className="mt-auto flex flex-col gap-2">
            <button
              onClick={handleTriggerSwap}
              className="w-full py-3 bg-[#074ed5] hover:bg-[#0041CC] text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              <FaExchangeAlt />
              Trigger Swap
            </button>

            {/* Save as Template */}
            <button
              onClick={handleSaveTemplate}
              disabled={templateState === "loading"}
              className={`w-full py-3 rounded-2xl border-0 md:border-none font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] border ${
                templateState === "success"
                  ? "bg-emerald-50 border-emerald-200 text-emerald-700 cursor-default"
                  : templateState === "loading"
                    ? "bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed"
                    : "bg-white border-slate-200 text-slate-700 hover:border-[#074ed5] hover:text-[#074ed5]"
              }`}
            >
              {templateState === "loading" ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-slate-300 border-t-slate-500 rounded-full animate-spin" />
                  Generating Template...
                </>
              ) : templateState === "success" ? (
                <>
                  <FaCheck size={11} />
                  Template Saved
                </>
              ) : (
                <>
                  <FaSave size={12} />
                  Save as Template
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* --- Trigger Swap Portal Modal --- */}
      {modalState !== "closed" &&
        typeof window !== "undefined" &&
        createPortal(
          <AnimatePresence>
            <motion.div
              key="trigger-swap-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
              onClick={(e) => {
                if (e.target === e.currentTarget) setModalState("closed");
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 8 }}
                transition={{ duration: 0.18 }}
                className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl p-6 flex flex-col gap-5 relative max-h-[90vh] overflow-y-auto"
              >
                {/* Close button */}
                <button
                  onClick={() => setModalState("closed")}
                  className="absolute top-4 right-4 text-slate-400 hover:text-[#1A1D23] transition-colors z-10"
                >
                  <FaTimes />
                </button>

                {/* LOADING state */}
                {modalState === "loading" && (
                  <div className="flex flex-col items-center justify-center py-14 gap-4">
                    <div className="p-3 bg-[#074ed5]/10 text-[#074ed5] rounded-2xl animate-pulse">
                      <FaExchangeAlt size={24} />
                    </div>
                    <h4 className="text-base font-black text-[#1A1D23]">
                      Swapping {currentTrigger} → {selectedTrigger}...
                    </h4>
                    <p className="text-xs text-slate-400 font-medium">
                      Analyzing psychological lever patterns
                    </p>
                  </div>
                )}

                {/* RESULTS state — side-by-side */}
                {modalState === "results" && swapResult && (
                  <>
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-black text-[#1A1D23] flex items-center gap-2">
                        <FaExchangeAlt className="text-[#0052FF]" /> Trigger
                        Swap Result
                      </h3>
                      <button
                        onClick={() => handleTriggerSwap()}
                        className="text-xs font-bold text-[#074ed5] hover:underline"
                      >
                        ↺ Regenerate
                      </button>
                    </div>

                    {/* Explanation & impact */}
                    <div className="bg-[#f4f8fb] rounded-2xl border border-slate-100 p-4 flex flex-col gap-2">
                      <div className="flex items-start gap-2">
                        <FaBrain
                          className="text-[#074ed5] shrink-0 mt-0.5"
                          size={12}
                        />
                        <p className="text-xs text-slate-600 font-medium leading-relaxed">
                          <span className="font-black text-[#1A1D23]">
                            What changed:{" "}
                          </span>
                          {swapResult.explanation}
                        </p>
                      </div>
                      <div className="flex items-start gap-2">
                        <FaChartLine
                          className="text-emerald-500 shrink-0 mt-0.5"
                          size={12}
                        />
                        <p className="text-xs text-slate-600 font-medium leading-relaxed">
                          <span className="font-black text-emerald-700">
                            Expected impact:{" "}
                          </span>
                          {swapResult.expectedImpact}
                        </p>
                      </div>
                    </div>

                    {/* Side-by-side */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Original */}
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wide ${TRIGGER_META[swapResult.originalTrigger]?.bgColor ?? "bg-slate-100"} ${TRIGGER_META[swapResult.originalTrigger]?.color ?? "text-slate-600"}`}
                          >
                            Original · {swapResult.originalTrigger}
                          </span>
                        </div>
                        <div className="bg-[#f4f8fb] rounded-2xl border border-slate-200 p-4 flex flex-col gap-3 flex-1">
                          <p className="text-sm text-slate-500 font-medium leading-relaxed flex-1">
                            {swapResult.originalPost}
                          </p>
                          <button
                            onClick={() =>
                              handleCopy(swapResult.originalPost, "original")
                            }
                            className="self-end flex items-center gap-1.5 text-[11px] font-bold border border-slate-200 rounded-xl px-3 py-1.5 hover:border-slate-400 transition-colors"
                          >
                            {copiedSide === "original" ? (
                              <>
                                <FaCheck size={9} /> Copied
                              </>
                            ) : (
                              "Copy"
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Rewrite */}
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wide ${TRIGGER_META[swapResult.targetTrigger]?.bgColor ?? "bg-blue-100"} ${TRIGGER_META[swapResult.targetTrigger]?.color ?? "text-blue-700"}`}
                          >
                            Rewrite · {swapResult.targetTrigger}
                          </span>
                        </div>
                        <div className="bg-white rounded-2xl border-2 border-[#0052FF]/20 p-4 flex flex-col gap-3 flex-1 shadow-[0_2px_12px_rgba(0,82,255,0.08)]">
                          <p className="text-sm text-[#1A1D23] font-medium leading-relaxed flex-1">
                            {swapResult.rewrittenPost}
                          </p>
                          <button
                            onClick={() =>
                              handleCopy(swapResult.rewrittenPost, "rewrite")
                            }
                            className="self-end flex items-center gap-1.5 text-[11px] font-bold border border-[#0052FF]/30 text-[#0052FF] rounded-xl px-3 py-1.5 hover:bg-[#0052FF] hover:text-white transition-all"
                          >
                            {copiedSide === "rewrite" ? (
                              <>
                                <FaCheck size={9} /> Copied
                              </>
                            ) : (
                              "Use This"
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* ERROR state */}
                {modalState === "error" && (
                  <div className="flex flex-col items-center justify-center py-14 gap-4">
                    <div className="p-3 bg-red-100 text-red-500 rounded-2xl">
                      <FaTimes size={24} />
                    </div>
                    <h4 className="text-base font-black text-[#1A1D23]">
                      Failed to generate rewrite
                    </h4>
                    <p className="text-xs text-slate-400 font-medium">
                      Something went wrong. Please try again.
                    </p>
                    <button
                      onClick={() => handleTriggerSwap()}
                      className="px-6 py-2.5 bg-[#074ed5] hover:bg-[#0041CC] text-white rounded-2xl font-bold text-sm flex items-center gap-2 transition-all"
                    >
                      <FaRobot /> Try Again
                    </button>
                  </div>
                )}
              </motion.div>
            </motion.div>
          </AnimatePresence>,
          document.body,
        )}

      {/* --- Save as Template Portal Modal --- */}
      {templateModalOpen &&
        typeof window !== "undefined" &&
        createPortal(
          <AnimatePresence>
            <motion.div
              key="template-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
              onClick={(e) => {
                if (
                  e.target === e.currentTarget &&
                  templateState !== "loading"
                ) {
                  setTemplateModalOpen(false);
                }
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 8 }}
                transition={{ duration: 0.18 }}
                className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl p-6 flex flex-col gap-5 relative max-h-[90vh] overflow-y-auto"
              >
                {/* Close button (only when not loading) */}
                {templateState !== "loading" && (
                  <button
                    onClick={() => setTemplateModalOpen(false)}
                    className="absolute top-4 right-4 text-slate-400 hover:text-[#1A1D23] transition-colors z-10"
                  >
                    <FaTimes />
                  </button>
                )}

                {/* LOADING state */}
                {templateState === "loading" && (
                  <div className="flex flex-col items-center justify-center py-14 gap-4">
                    <div className="p-3 bg-[#074ed5]/10 text-[#074ed5] rounded-2xl animate-pulse">
                      <FaSave size={24} />
                    </div>
                    <h4 className="text-base font-black text-[#1A1D23]">
                      Generating Template...
                    </h4>
                    <p className="text-xs text-slate-400 font-medium text-center max-w-xs">
                      Analysing viral recipe, voice spectrum, and psychological
                      triggers to build a reusable caption template.
                    </p>
                  </div>
                )}

                {/* SUCCESS state */}
                {templateState === "success" && savedTemplate && (
                  <>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <div className="p-1.5 bg-emerald-100 text-emerald-600 rounded-xl">
                            <FaCheck size={11} />
                          </div>
                          <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                            Template Saved
                          </span>
                        </div>
                        <h3 className="text-lg font-black text-[#1A1D23] leading-tight">
                          {savedTemplate.templateName}
                        </h3>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#074ed5]/10 text-[#074ed5] uppercase tracking-wide">
                            {savedTemplate.platform.toUpperCase()}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 uppercase tracking-wide">
                            {savedTemplate.category.replace(/_/g, " ")}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="bg-[#f4f8fb] rounded-2xl border border-slate-100 p-4">
                      <p className="text-xs text-slate-600 font-medium leading-relaxed">
                        {savedTemplate.description}
                      </p>
                    </div>

                    {/* Structure preview */}
                    <div className="flex flex-col gap-2">
                      <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                        <FaBrain size={10} /> Template Structure
                      </h5>
                      <div className="bg-[#000100] rounded-2xl p-4 max-h-36 overflow-y-auto">
                        <pre className="text-[11px] text-slate-300 leading-relaxed whitespace-pre-wrap font-mono">
                          {savedTemplate.structure}
                        </pre>
                      </div>
                    </div>

                    {/* Example post */}
                    <div className="flex flex-col gap-2">
                      <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                        <BsStars size={10} /> Example Post
                      </h5>
                      <div className="bg-white rounded-2xl border-2 border-[#0052FF]/20 p-4 shadow-[0_2px_12px_rgba(0,82,255,0.06)]">
                        <p className="text-sm text-[#1A1D23] font-medium leading-relaxed whitespace-pre-wrap">
                          {savedTemplate.examplePost}
                        </p>
                      </div>
                    </div>

                    {/* Footer CTA */}
                    <div className="flex items-center gap-3 pt-1">
                      <a
                        href="/admin/caption-templates"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-[11px] font-bold text-[#074ed5] hover:underline"
                      >
                        <FaExternalLinkAlt size={10} />
                        View in Admin Templates
                      </a>
                      <button
                        onClick={() => setTemplateModalOpen(false)}
                        className="ml-auto px-5 py-2 bg-[#1A1D23] hover:bg-[#000100] text-white rounded-2xl font-bold text-xs transition-all"
                      >
                        Done
                      </button>
                    </div>
                  </>
                )}

                {/* ERROR state */}
                {templateState === "error" && (
                  <div className="flex flex-col items-center justify-center py-14 gap-4">
                    <div className="p-3 bg-red-100 text-red-500 rounded-2xl">
                      <FaTimes size={24} />
                    </div>
                    <h4 className="text-base font-black text-[#1A1D23]">
                      Failed to generate template
                    </h4>
                    <p className="text-xs text-slate-400 font-medium text-center max-w-xs">
                      Something went wrong. Make sure the analysis is complete
                      and try again.
                    </p>
                    <button
                      onClick={() => handleSaveTemplate()}
                      className="px-6 py-2.5 bg-[#074ed5] hover:bg-[#0041CC] text-white rounded-2xl font-bold text-sm flex items-center gap-2 transition-all"
                    >
                      <FaRobot /> Try Again
                    </button>
                  </div>
                )}
              </motion.div>
            </motion.div>
          </AnimatePresence>,
          document.body,
        )}
    </div>
  );
};

export default PsychTriggers;
