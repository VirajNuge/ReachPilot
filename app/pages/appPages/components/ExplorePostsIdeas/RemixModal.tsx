"use client";

import React, { useState, useEffect } from "react";
import { X, Wand2, Copy, Send, RefreshCw, ChevronDown } from "lucide-react";
import { TrendPost } from "./Feed/TrendCard"; // Import types

interface RemixModalProps {
  isOpen: boolean;
  onClose: () => void;
  originalPost: TrendPost | null;
}

export default function RemixModal({
  isOpen,
  onClose,
  originalPost,
}: RemixModalProps) {
  const [generatedContent, setGeneratedContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [angle, setAngle] = useState("Insightful Take");

  const handleCopy = async () => {
    if (!generatedContent) return;
    try {
      await navigator.clipboard.writeText(generatedContent);
      alert("Copied to clipboard!");
    } catch {
      alert("Could not copy. Please copy the text manually.");
    }
  };

  const handleRegenerate = () => {
    if (!originalPost) return;
    setIsGenerating(true);
    setTimeout(() => {
      setGeneratedContent(
        `Here is my take on ${originalPost.author.name}'s point:\n\n` +
          `While the original post argues for "${originalPost.analysis.reason}", I believe the nuance lies in execution.\n\n` +
          `Three things founders often miss:\n` +
          `1. Context is key.\n` +
          `2. Speed matters more than perfection.\n` +
          `3. Iterate or die.\n\n` +
          `What do you think? 👇`
      );
      setIsGenerating(false);
    }, 1500);
  };

  const handleSchedule = () => {
    alert("Scheduling — coming soon!");
  };

  // Simulate AI Generation when modal opens
  useEffect(() => {
    if (isOpen && originalPost) {
      setIsGenerating(true);
      // Mock AI Delay
      setTimeout(() => {
        setGeneratedContent(
          `Here is my take on ${originalPost.author.name}'s point:\n\n` +
            `While the original post argues for "${originalPost.analysis.reason}", I believe the nuance lies in execution.\n\n` +
            `Three things founders often miss:\n` +
            `1. Context is key.\n` +
            `2. Speed matters more than perfection.\n` +
            `3. Iterate or die.\n\n` +
            `What do you think? 👇`
        );
        setIsGenerating(false);
      }, 1500);
    }
  }, [isOpen, originalPost]);

  if (!isOpen || !originalPost) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
      {/* Modal Container */}
      <div className="bg-white w-full max-w-5xl h-[85vh] rounded-2xl shadow-2xl flex overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* === LEFT COLUMN: SOURCE (Reference) === */}
        <div className="w-1/3 bg-gray-50 border-r border-gray-200 p-6 flex flex-col">
          <div className="flex items-center gap-2 mb-4 text-gray-400 text-xs font-bold uppercase tracking-wider">
            <span>Reference Source</span>
          </div>

          {/* Source Card Preview */}
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex-1 overflow-y-auto custom-scrollbar">
            <div className="flex items-center gap-3 mb-3">
              <img
                src={originalPost.author.avatar}
                alt=""
                className="w-8 h-8 rounded-full"
              />
              <div>
                <p className="text-sm font-bold text-gray-900">
                  {originalPost.author.name}
                </p>
                <p className="text-xs text-gray-500">{originalPost.platform}</p>
              </div>
            </div>

            {originalPost.content.image && (
              <img
                src={originalPost.content.image}
                className="w-full rounded-lg mb-3 object-cover"
                alt="ref"
              />
            )}

            <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">
              {originalPost.content.text || "Visual content analysis..."}
            </p>
          </div>

          {/* AI Analysis Recap */}
          <div className="mt-4 p-3 bg-indigo-50 border border-indigo-100 rounded-lg">
            <p className="text-xs text-indigo-800 font-medium">
              <strong>Why it worked:</strong> {originalPost.analysis.reason}
            </p>
          </div>
        </div>

        {/* === RIGHT COLUMN: EDITOR (The Remix) === */}
        <div className="flex-1 flex flex-col bg-white relative">
          {/* Header */}
          <div className="h-16 border-b border-gray-100 flex items-center justify-between px-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                <Wand2 size={18} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  AI Remix Editor
                </h3>
                <p className="text-xs text-gray-500">
                  Drafting as <strong>Tech Founder</strong>
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              aria-label="Close remix editor"
              className="p-2 rounded-full transition-colors bg-[#000100] hover:bg-black text-white"
            >
              <X size={20} />
            </button>
          </div>

          {/* Controls Bar */}
          <div className="px-6 py-3 border-b border-gray-100 flex items-center gap-3 bg-gray-50/30">
            <span className="text-xs font-bold text-gray-500">Angle:</span>
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg font-semibold hover: bg-[#000100] hover:bg-black text-white">
              {angle} <ChevronDown size={12} />
            </button>
            <div className="h-4 w-px bg-gray-300 mx-2"></div>
            <button
              onClick={handleRegenerate}
              className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700"
            >
              <RefreshCw
                size={12}
                className={isGenerating ? "animate-spin" : ""}
              />{" "}
              Regenerate
            </button>
          </div>

          {/* Text Area */}
          <div className="flex-1 p-6 relative">
            {isGenerating ? (
              <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-sm font-medium text-indigo-600 animate-pulse">
                    Drafting new post...
                  </p>
                </div>
              </div>
            ) : null}

            <textarea
              className="w-full h-full resize-none outline-none text-base text-gray-800 leading-relaxed placeholder:text-gray-300"
              placeholder="AI content will appear here..."
              value={generatedContent}
              onChange={(e) => setGeneratedContent(e.target.value)}
            />
          </div>

          {/* Footer Actions */}
          <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50">
            <button onClick={handleCopy} className="px-4 py-2.5 rounded-xl font-bold hover: transition-all flex items-center gap-2 bg-[#000100] hover:bg-black text-white">
              <Copy size={16} /> Copy Text
            </button>
            <button onClick={handleSchedule} className="px-6 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 bg-[#000100] hover:bg-black text-white">
              <Send size={16} /> Schedule Post
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
