"use client";

import React from "react";
import {
  X,
  Copy,
  CheckCircle2,
  MessageCircle,
  Lightbulb,
  ShieldCheck,
  PenTool,
} from "lucide-react";
import { QuestionItem } from "./QuestionFeed";

// --- TYPES ---
interface SolutionModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  question?: QuestionItem | null;
}

export default function SolutionModal({
  isOpen,
  onClose,
  question,
}: SolutionModalProps) {
  // TODO: Add state for loading (boolean) - tracks if AI is generating
  // TODO: Add state for draft (string) - stores the AI-generated response

  // TODO: Add useEffect to simulate AI generation
  // - Trigger when isOpen becomes true AND question is provided
  // - Set loading to true initially
  // - After 1500ms delay, set the draft text and set loading to false
  // - Generate a PAS (Problem-Agitate-Solution) style response using question.title

  // Example draft template:
  // `Stop worrying about the "${question.title.substring(0, 20)}..."
  //
  // I see so many people stressing about this, but here is the truth:
  // The anxiety you feel isn't about the problem itself. It's about lack of clarity.
  //
  // Here is the 3-step fix I use:
  // 1. Audit your current situation.
  // 2. Remove the friction points (usually manual tasks).
  // 3. Double down on what works.
  //
  // Don't overcomplicate it. 👊
  //
  // #Advice #Growth #ProblemSolving`

  // TODO: Add early return if !isOpen || !question
  if (!isOpen || !question) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Modal Container */}
      <div className="bg-white w-full max-w-5xl h-[85vh] rounded-2xl shadow-2xl flex overflow-hidden">
        {/* === LEFT COLUMN: THE CONTEXT === */}
        <div className="w-1/3 bg-gray-50 border-r border-gray-200 p-6 flex flex-col overflow-y-auto custom-scrollbar">
          <div className="mb-6">
            <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600 bg-orange-50 px-2 py-1 rounded border border-orange-100">
              Target Problem
            </span>
            <h2 className="text-xl font-bold text-gray-900 mt-3 leading-snug">
              {question.title}
            </h2>

            {/* Source Card */}
            <div className="mt-4 bg-white p-3 rounded-xl border border-gray-200 shadow-sm flex gap-3">
              <div className="p-2 bg-gray-100 rounded-lg h-fit text-gray-500">
                <MessageCircle size={16} />
              </div>
              <p className="text-xs text-gray-600 leading-relaxed italic">
                "{question.snippet}"
              </p>
            </div>
          </div>

          {/* AI Strategy Box */}
          <div className="space-y-4 mt-2">
            {/* 1. Psychological Trigger */}
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb size={16} className="text-blue-600" />
                <h4 className="text-xs font-bold text-blue-900 uppercase">
                  The Angle
                </h4>
              </div>
              <p className="text-xs text-blue-800 leading-relaxed">
                <strong>Empathy First:</strong> The user is feeling anxious
                ("Critical Pain"). Validate their fear before offering the
                solution. This builds trust instantly.
              </p>
            </div>

            {/* 2. Authority Check */}
            <div className="bg-green-50 p-4 rounded-xl border border-green-100">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck size={16} className="text-green-600" />
                <h4 className="text-xs font-bold text-green-900 uppercase">
                  Authority Goal
                </h4>
              </div>
              <p className="text-xs text-green-800 leading-relaxed">
                Position yourself as the <strong>"Guide"</strong> who has
                already survived this problem. Use direct, confident language.
              </p>
            </div>
          </div>
        </div>

        {/* === RIGHT COLUMN: THE EDITOR === */}
        <div className="flex-1 flex flex-col bg-white relative">
          {/* Header */}
          <div className="h-16 border-b border-gray-100 flex items-center justify-between px-6 bg-white">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
                <PenTool size={18} />
              </div>
              <span className="font-bold text-gray-900 text-sm">
                Draft Response
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Editor Area */}
          <div className="flex-1 p-8 relative bg-gray-50/30">
            {/* TODO: Add conditional rendering for loading state */}
            {/* If loading: show spinner overlay */}
            {/* If not loading: show textarea editor */}

            {/* Loading State (uncomment and use when loading is true) */}
            {/* 
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/60 z-10 backdrop-blur-sm">
              <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-3"></div>
              <p className="text-sm font-medium text-gray-500 animate-pulse">
                Analyzing pain point & drafting...
              </p>
            </div>
            */}

            {/* Editor (show when not loading) */}
            <div className="w-full h-full bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col">
              <textarea
                className="flex-1 w-full resize-none outline-none text-base text-gray-800 leading-relaxed placeholder:text-gray-300 font-medium p-2"
                // TODO: Add value={draft}
                // TODO: Add onChange={(e) => setDraft(e.target.value)}
                placeholder="AI draft will appear here..."
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-6 border-t border-gray-100 bg-white flex justify-end gap-3 z-20">
            <button className="px-5 py-3 rounded-xl border border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center gap-2">
              <Copy size={16} /> Copy to Clipboard
            </button>
            <button className="px-6 py-3 rounded-xl bg-gray-900 text-white font-bold text-sm hover:bg-black shadow-lg transition-all flex items-center gap-2">
              <CheckCircle2 size={16} /> Save to Content Lab
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
