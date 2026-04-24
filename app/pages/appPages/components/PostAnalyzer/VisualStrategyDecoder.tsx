"use client";

import React, { useState } from "react";
import {
  FaRobot,
  FaImage,
  FaCheck,
  FaCopy,
  FaMagic,
  FaSpinner,
  FaExclamationTriangle,
  FaTimes,
  FaLayerGroup,
  FaBolt,
  FaPaintBrush,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { VisualStrategyProps } from "@/lib/postAnalyzerTypes";

// ─── Copy Button ──────────────────────────────────────────────────────────────

function CopyButton({ text, simple = false }: { text: string; simple?: boolean }) {
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

// ─── Success Modal ────────────────────────────────────────────────────────────

interface SavedVisualTemplate {
  templateId: string;
  templateName: string;
  description: string;
  visualStyle: string;
  prompt: string;
  previewImage?: string;
}

function SuccessModal({
  template,
  onClose,
}: {
  template: SavedVisualTemplate;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 28 }}
        className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 flex items-start justify-between sticky top-0 bg-white border-b border-slate-100 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#B6FF33] flex items-center justify-center shrink-0">
              <FaCheck className="text-[#1A1D23]" size={16} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Visual Template Saved
              </p>
              <h3 className="text-lg font-black text-[#1A1D23] leading-tight">
                {template.templateName}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <FaTimes size={14} />
          </button>
        </div>

        <div className="px-6 pb-6 space-y-4 pt-4">
          {/* Style badge */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-1 bg-[#EEF3FF] text-[#0052FF] text-[10px] font-bold uppercase tracking-widest rounded-lg border border-[#C7D8FF] flex items-center gap-1">
              <FaPaintBrush size={8} /> {template.visualStyle}
            </span>
          </div>

          {/* Description */}
          <p className="text-[13px] text-slate-600 leading-relaxed font-medium">
            {template.description}
          </p>

          {/* Preview image */}
          {template.previewImage && (
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <FaImage size={10} /> Source Image
              </p>
              <img
                src={template.previewImage}
                alt="Visual reference"
                className="w-full rounded-2xl border border-slate-100 max-h-48 object-cover"
              />
            </div>
          )}

          {/* Prompt */}
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <FaBolt size={10} className="text-[#0052FF]" /> Design Prompt
            </p>
            <div className="bg-[#1A1D23] rounded-2xl p-4 relative group">
              <p className="font-mono text-[11px] text-slate-300 leading-relaxed pr-6">
                {template.prompt}
              </p>
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <CopyButton text={template.prompt} simple />
              </div>
            </div>
          </div>

        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function VisualStrategyDecoder({
  category,
  prompts,
  analysisId,
  images,
}: VisualStrategyProps) {
  const hasImage = Array.isArray(images) && images.length > 0;

  const [saveStatus, setSaveStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [savedTemplate, setSavedTemplate] = useState<SavedVisualTemplate | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [showModal, setShowModal] = useState(false);
  
  // Image generation state
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [generateStatus, setGenerateStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [generateError, setGenerateError] = useState("");

  const handleSave = async () => {
    if (saveStatus === "loading" || !analysisId) return;
    setSaveStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/analyze-post/generate-visual-template", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ analysisId }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed to save template");
      setSavedTemplate(data as SavedVisualTemplate);
      setSaveStatus("success");
      setShowModal(true);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "An unexpected error occurred");
      setSaveStatus("error");
    }
  };
  
  const handleGenerateImage = async () => {
    if (generateStatus === "loading") return;
    setGenerateStatus("loading");
    setGenerateError("");
    
    try {
      const prompt = prompts.dalle || prompts.midjourney;
      const res = await fetch("/api/analyze-post/generate-thumbnail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed to generate image");
      setGeneratedImage(data.imageUrl);
      setGenerateStatus("success");
    } catch (err: unknown) {
      setGenerateError(err instanceof Error ? err.message : "An unexpected error occurred");
      setGenerateStatus("error");
    }
  };

  return (
    <>
      <AnimatePresence>
        {showModal && savedTemplate && (
          <SuccessModal template={savedTemplate} onClose={() => setShowModal(false)} />
        )}
      </AnimatePresence>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-[0_10px_30px_rgba(0,0,0,0.03)] overflow-hidden flex flex-col h-full">
        {/* ── Header ── */}
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
            <div className="absolute right-0 top-full mt-2 w-64 p-3 bg-[#1A1D23] text-white text-xs rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none">
              <div className="font-bold mb-1 text-[#0052FF]">Why this matters:</div>
              Analyzes the visual elements (colors, layout) so you can replicate the aesthetic.
              <div className="absolute right-4 -top-1 w-2 h-2 bg-[#1A1D23] transform rotate-45" />
            </div>
          </div>
        </div>

        <div className="px-5 pb-5 space-y-5 flex-1 flex flex-col">

          {/* ── SECTION 1: Visual Style Overview ── */}
          <div className="border-b border-slate-100 pb-5">
            <span className="text-[10px] font-medium text-slate-500 uppercase tracking-widest block mb-3 flex items-center gap-1.5">
              <FaPaintBrush className="text-[#0052FF]" size={10} /> Visual Style
            </span>

            {hasImage ? (
              <div className="flex gap-3 items-start">
                {/* Image thumbnail */}
                <div className="w-16 h-16 rounded-xl border border-slate-200 overflow-hidden shrink-0 bg-slate-100">
                  <img
                    src={images![0]}
                    alt="Post visual"
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Style info */}
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-bold text-[#1A1D23] mb-1 leading-tight">
                    {category}
                  </p>
                  <p className="text-[11px] text-slate-500 leading-snug">
                    Design follows a{" "}
                    <span className="font-semibold text-slate-700">{category.toLowerCase()}</span>{" "}
                    aesthetic. Use the prompt below to replicate this visual style.
                  </p>
                  {images!.length > 1 && (
                    <p className="text-[10px] text-slate-400 mt-1 font-medium">
                      +{images!.length - 1} more image{images!.length - 1 > 1 ? "s" : ""}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {/* No image placeholder with generate button */}
                <div className="flex items-center gap-3 p-3.5 bg-[#F4F7FA] rounded-2xl border border-slate-100">
                  <div className="w-10 h-10 rounded-xl bg-slate-200 flex items-center justify-center shrink-0">
                    <FaImage className="text-slate-400" size={16} />
                  </div>
                  <div className="flex-1">
                    <p className="text-[13px] font-bold text-slate-400">No Image Available</p>
                    <p className="text-[11px] text-slate-400 leading-snug">
                      Generate a preview using AI based on the design prompt below.
                    </p>
                  </div>
                </div>
                
                {/* Generate button */}
                <button
                  onClick={handleGenerateImage}
                  disabled={generateStatus === "loading"}
                  className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                    generateStatus === "loading"
                      ? "bg-[#0052FF]/70 text-white cursor-not-allowed"
                      : generateStatus === "success"
                      ? "bg-[#B6FF33]/20 text-[#4D8C00] border-2 border-[#B6FF33]"
                      : "bg-[#0052FF] hover:bg-[#0041CC] text-white shadow-[0_4px_14px_0_rgba(0,82,255,0.3)] hover:scale-[1.01] active:scale-[0.99]"
                  }`}
                >
                  {generateStatus === "loading" ? (
                    <><FaSpinner className="animate-spin" size={12} /> Generating Preview...</>
                  ) : generateStatus === "success" ? (
                    <><FaCheck size={12} /> Preview Generated</>
                  ) : (
                    <><FaMagic size={12} /> Generate AI Preview</>
                  )}
                </button>
                
                {/* Generated image display */}
                {generatedImage && generateStatus === "success" && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="rounded-2xl border-2 border-[#B6FF33] overflow-hidden"
                  >
                    <img
                      src={generatedImage}
                      alt="AI Generated Preview"
                      className="w-full h-auto"
                    />
                    <div className="bg-[#F2FFD9] px-3 py-2 border-t border-[#B6FF33]">
                      <p className="text-[10px] font-bold text-[#4D8C00] uppercase tracking-widest flex items-center gap-1.5">
                        <FaMagic size={9} /> What Could Have Been
                      </p>
                    </div>
                  </motion.div>
                )}
                
                {/* Error display */}
                {generateStatus === "error" && generateError && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-2 p-2.5 bg-red-50 rounded-xl border border-red-200"
                  >
                    <FaExclamationTriangle className="text-red-500 shrink-0 mt-0.5" size={11} />
                    <p className="text-[11px] text-red-600 font-medium leading-snug">{generateError}</p>
                  </motion.div>
                )}
              </div>
            )}
          </div>

          {/* ── SECTION 2: Design Prompt ── */}
          <div className="flex-1 flex flex-col">
            <span className="text-[10px] font-medium text-slate-500 uppercase tracking-widest block mb-3 flex items-center gap-1.5">
              <FaMagic className="text-[#0052FF]" size={10} /> Design Prompt
            </span>

            <div className="bg-[#1A1D23] rounded-2xl p-4 relative group shadow-inner flex-1">
              <p className="font-mono text-[11px] text-slate-300 leading-relaxed pr-6">
                {prompts.midjourney || prompts.dalle}
              </p>
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <CopyButton text={prompts.midjourney || prompts.dalle} simple />
              </div>
            </div>
          </div>

          {/* ── SECTION 3: Save as Template ── */}
          {analysisId && (
            <div className="pt-2 border-t border-slate-100 mt-auto">
              {!hasImage ? (
                <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <FaLayerGroup className="text-slate-400 shrink-0" size={12} />
                  <p className="text-[11px] text-slate-400 font-medium">
                    Save as template is available when the post contains an image.
                  </p>
                </div>
              ) : saveStatus === "success" && savedTemplate ? (
                <button
                  onClick={() => setShowModal(true)}
                  className="w-full py-3 bg-[#F2FFD9] text-[#4D8C00] border border-[#C5E88A] rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#E8FAC8] transition-colors"
                >
                  <FaCheck size={12} /> Template Saved — View
                </button>
              ) : (
                <button
                  onClick={handleSave}
                  disabled={saveStatus === "loading"}
                  className={`w-full py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                    saveStatus === "loading"
                      ? "bg-[#074ed5]/70 text-white cursor-not-allowed"
                      : "bg-[#074ed5] hover:bg-[#0041CC] text-white shadow-[0_4px_14px_0_rgba(7,78,213,0.3)] hover:scale-[1.01] active:scale-[0.99]"
                  }`}
                >
                  {saveStatus === "loading" ? (
                    <><FaSpinner className="animate-spin" size={13} /> Saving Template…</>
                  ) : (
                    <><FaMagic size={13} /> Save as Visual Template</>
                  )}
                </button>
              )}

              {saveStatus === "error" && errorMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 flex items-start gap-2 p-2.5 bg-red-50 rounded-xl border border-red-200"
                >
                  <FaExclamationTriangle className="text-red-500 shrink-0 mt-0.5" size={11} />
                  <p className="text-[11px] text-red-600 font-medium leading-snug">{errorMsg}</p>
                </motion.div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
