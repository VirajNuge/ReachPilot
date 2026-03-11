"use client";

import React, { useState, useEffect } from "react";
import {
  ReachPilotTemplate,
  Platform,
} from "../../../../../lib/mockdata/templatedata";
import {
  X,
  Check,
  Wand2,
  Image as ImageIcon,
  Layers,
  MessageSquare,
  MonitorPlay,
} from "lucide-react";

interface TemplatePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: ReachPilotTemplate | null;
}

const TemplatePreviewModal: React.FC<TemplatePreviewModalProps> = ({
  isOpen,
  onClose,
  template,
}) => {
  const [activeTab, setActiveTab] = useState<Platform>("LinkedIn");
  const [personaActive, setPersonaActive] = useState(false);

  useEffect(() => {
    if (template) {
      setActiveTab(template.platforms[0]);
      setPersonaActive(false);
    }
  }, [template]);

  if (!isOpen || !template) return null;

  const renderContentPreview = () => {
    // --- 1. IMAGE & HYBRID PREVIEW ---
    // If the template includes an image prompt, show the Visual Blueprint
    if (template.coverImage || template.content.imagePrompt) {
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left: The Visual Style Example */}
            <div className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-100 group">
              {template.coverImage ? (
                <>
                  <img
                    src={template.coverImage}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded backdrop-blur-sm">
                    Style Reference
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-400 text-xs">
                  No Preview Image
                </div>
              )}
            </div>

            {/* Right: The Logic (Prompt) */}
            <div className="flex flex-col justify-center bg-slate-50 border border-slate-200 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3 text-purple-600">
                <Wand2 size={16} />
                <span className="text-xs font-bold uppercase tracking-wider">
                  AI Image Blueprint
                </span>
              </div>
              <p className="text-sm text-slate-700 italic leading-relaxed">
                "{template.content.imagePrompt}"
              </p>
              <div className="mt-auto pt-4 border-t border-slate-200/50">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">
                  Target Model: Flux / Stable Diffusion
                </span>
              </div>
            </div>
          </div>

          {/* If Hybrid, show the Caption below the image info */}
          {(template.content.linkedin || template.content.facebook) && (
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                <MessageSquare size={12} /> Post Caption
              </h4>
              <div
                className={`p-4 rounded-xl border transition-all ${
                  personaActive
                    ? "bg-purple-50 border-purple-200 text-purple-900"
                    : "bg-white border-slate-200 text-slate-600"
                }`}
              >
                <p className="whitespace-pre-wrap text-sm">
                  {personaActive
                    ? "Re-writing caption to match your 'Professional' persona... [AI Simulation]"
                    : template.content.linkedin || template.content.facebook}
                </p>
              </div>
            </div>
          )}
        </div>
      );
    }

    // --- 2. CAROUSEL / THREAD PREVIEW (Text Only) ---
    if (template.content.x && activeTab === "X") {
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Layers size={14} className="text-slate-400" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Thread Structure
            </span>
          </div>
          {template.content.x.map((tweet, idx) => (
            <div
              key={idx}
              className="relative pl-6 border-l-2 border-slate-100 last:border-0"
            >
              <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-slate-50 border-2 border-slate-200 flex items-center justify-center text-[8px] font-bold text-slate-400">
                {idx + 1}
              </div>
              <div
                className={`mb-4 p-4 rounded-xl border text-sm ${
                  personaActive
                    ? "bg-purple-50 border-purple-200"
                    : "bg-white border-slate-200"
                }`}
              >
                {tweet}
              </div>
            </div>
          ))}
        </div>
      );
    }

    // --- 3. STANDARD TEXT PREVIEW ---
    return (
      <div
        className={`p-6 rounded-xl border text-sm leading-relaxed whitespace-pre-wrap transition-all ${
          personaActive
            ? "bg-purple-50 border-purple-200 text-purple-900"
            : "bg-white border-slate-200 text-slate-700"
        }`}
      >
        {activeTab === "LinkedIn" && template.content.linkedin}
        {activeTab === "Facebook" && template.content.facebook}
        {activeTab === "X" && template.content.x && template.content.x[0]}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-1/3 bg-slate-50 border-r border-slate-100 p-6 flex flex-col overflow-y-auto">
          <div className="mb-6">
            <span className="text-xs font-bold text-purple-600 bg-purple-100 px-2 py-1 rounded-md uppercase tracking-wider">
              {template.type} Template
            </span>
            <h2 className="text-2xl font-bold text-slate-800 mt-3 mb-2">
              {template.title}
            </h2>
            <p className="text-sm text-slate-500 leading-relaxed">
              {template.description}
            </p>
          </div>

          <div className="mb-6 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-slate-700">
                Apply Brand Voice
              </span>
              <button
                onClick={() => setPersonaActive(!personaActive)}
                className={`w-10 h-5 rounded-full relative transition-colors ${
                  personaActive ? "bg-purple-600" : "bg-slate-300"
                }`}
              >
                <div
                  className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${
                    personaActive ? "left-6" : "left-1"
                  }`}
                />
              </button>
            </div>
            <p className="text-xs text-slate-400">
              Auto-rewrite tone using active persona.
            </p>
          </div>

          {template.performance && (
            <div className="mb-8">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                Avg. Performance
              </h4>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-800">
                  {template.performance.value}
                </span>
                <span className="text-sm text-slate-500">
                  {template.performance.metricLabel}
                </span>
              </div>
              <div className="text-xs text-green-600 mt-1 font-medium flex items-center gap-1">
                <MonitorPlay size={10} /> Based on recent data
              </div>
            </div>
          )}
        </aside>

        {/* Content Area */}
        <main className="flex-1 flex flex-col bg-white">
          <header className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
            <div className="flex gap-2">
              {template.platforms.map((p) => (
                <button
                  key={p}
                  onClick={() => setActiveTab(p)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === p
                      ? "bg-purple-50 text-purple-700"
                      : "text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
            <button
              onClick={onClose}
              className="bg-[#000100] hover:bg-black text-white"
            >
              <X size={20} />
            </button>
          </header>
          <div className="flex-1 overflow-y-auto p-8 bg-[#f8f9fc]">
            <div className="max-w-xl mx-auto">{renderContentPreview()}</div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default TemplatePreviewModal;
