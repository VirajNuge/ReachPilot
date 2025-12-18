"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Copy,
  Image as ImageIcon,
  Hash,
  Target,
  TrendingUp,
  CheckCircle2,
  Share2,
} from "lucide-react";
import { ContentIdea } from "./Board/IdeaCard";

interface BlueprintModalProps {
  isOpen: boolean;
  onClose: () => void;
  idea: ContentIdea | null;
}

export default function BlueprintModal({
  isOpen,
  onClose,
  idea,
}: BlueprintModalProps) {
  const [loading, setLoading] = useState(true);
  const [caption, setCaption] = useState("");

  // --- MOCK AI GENERATION ---
  useEffect(() => {
    if (isOpen && idea) {
      setLoading(true);
      // Simulate AI writing the full blueprint based on the idea summary
      setTimeout(() => {
        setCaption(
          `Here’s the hard truth: Most people work hard, but lack leverage.\n\n` +
            `The "Hustle Culture" narrative tells you to wake up at 4AM. \n` +
            `But data shows that 4 hours of deep work beats 12 hours of distracted busy work.\n\n` +
            `Your "Grindset" isn't impressive. It's inefficient.\n\n` +
            `Stop trading time. Start building systems. ⚙️\n\n` +
            `#Productivity #DeepWork #AntiHustle #SystemsThinking`
        );
        setLoading(false);
      }, 1500);
    }
  }, [isOpen, idea]);

  if (!isOpen || !idea) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Modal Container */}
      <div className="bg-white w-full max-w-5xl h-[85vh] rounded-2xl shadow-2xl flex overflow-hidden">
        {/* === LEFT COLUMN: STRATEGY INSIGHTS === */}
        <div className="w-1/3 bg-gray-50 border-r border-gray-200 p-6 flex flex-col overflow-y-auto custom-scrollbar">
          {/* Header */}
          <div className="mb-6">
            <span className="text-[10px] font-bold uppercase tracking-wider text-yellow-600 bg-yellow-50 px-2 py-1 rounded border border-yellow-100">
              {idea.strategy.goal} Strategy
            </span>
            <h2 className="text-xl font-bold text-gray-900 mt-3 leading-snug">
              {idea.title}
            </h2>
            <p className="text-sm text-gray-500 mt-2 leading-relaxed">
              {idea.description}
            </p>
          </div>

          {/* AI Insights Block */}
          <div className="space-y-4">
            {/* 1. Why it works */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Target size={16} className="text-indigo-600" />
                <h4 className="text-xs font-bold text-gray-900 uppercase">
                  Why this works
                </h4>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                This angle leverages <strong>Pattern Interruption</strong>. By
                challenging a common belief ("Hustle is good"), you force the
                user to stop scrolling to defend or validate their worldview.
              </p>
            </div>

            {/* 2. Success Prediction */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp size={16} className="text-green-600" />
                <h4 className="text-xs font-bold text-gray-900 uppercase">
                  Success Factors
                </h4>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Hook Strength</span>
                  <span className="font-bold text-gray-900">92/100</span>
                </div>
                <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-green-500 h-full w-[92%]"></div>
                </div>

                <div className="flex justify-between text-xs pt-1">
                  <span className="text-gray-500">Shareability</span>
                  <span className="font-bold text-gray-900">High</span>
                </div>
              </div>
            </div>

            {/* 3. Visual Directive */}
            <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
              <div className="flex items-center gap-2 mb-2">
                <ImageIcon size={16} className="text-indigo-600" />
                <h4 className="text-xs font-bold text-indigo-900 uppercase">
                  AI Image Prompt
                </h4>
              </div>
              <p className="text-[11px] font-mono text-indigo-800 bg-white/50 p-2 rounded border border-indigo-100 leading-relaxed select-all cursor-text">
                "Minimalist workspace, moody lighting, messy desk with coffee
                cup vs clean desk with laptop, split screen comparison,
                hyper-realistic, 4k --ar 4:5"
              </p>
            </div>
          </div>
        </div>

        {/* === RIGHT COLUMN: EXECUTION (EDITOR) === */}
        <div className="flex-1 flex flex-col bg-white relative">
          {/* Editor Header */}
          <div className="h-16 border-b border-gray-100 flex items-center justify-between px-6 bg-white">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gray-100 rounded-lg text-gray-600">
                <CheckCircle2 size={18} />
              </div>
              <span className="font-bold text-gray-900 text-sm">
                Draft Content
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Text Editor Area */}
          <div className="flex-1 p-8 relative bg-gray-50/30">
            {loading ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/60 z-10 backdrop-blur-sm">
                <div className="w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                <p className="text-sm font-medium text-gray-500 animate-pulse">
                  Drafting caption...
                </p>
              </div>
            ) : (
              <div className="w-full h-full bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col">
                <div className="flex items-center gap-2 mb-4 text-gray-400">
                  <Hash size={14} />
                  <span className="text-xs font-bold uppercase">
                    Caption Editor
                  </span>
                </div>
                <textarea
                  className="flex-1 w-full resize-none outline-none text-base text-gray-800 leading-relaxed placeholder:text-gray-300 font-medium"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="AI generated caption will appear here..."
                />
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-6 border-t border-gray-100 bg-white flex justify-end gap-3 z-20">
            <button className="px-5 py-3 rounded-xl border border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center gap-2">
              <Copy size={16} /> Copy Text
            </button>
            <button className="px-6 py-3 rounded-xl bg-yellow-500 text-white font-bold text-sm hover:bg-yellow-600 shadow-lg shadow-yellow-200 transition-all flex items-center gap-2">
              <Share2 size={16} /> Generate Post
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
