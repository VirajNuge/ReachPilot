import React from "react";
import { motion } from "framer-motion";
import {
  FaBolt,
  FaComments,
  FaExclamationTriangle,
  FaMagic,
  FaCheckCircle,
  FaFire,
  FaBullseye,
  FaMagnet,
} from "react-icons/fa";

export default function HookCTAScorecard() {
  // Mock Data based on user request
  const hookData = {
    score: 8.5,
    type: "Curiosity Gap",
    text: "The one tool I used to 10x my reach (and it’s not what you think).",
    feedback: "High-intensity hook, but could use more urgency.",
  };

  const ctaData = {
    type: "Soft Engagement",
    alignment: "Perfect Match",
    friction: "Low (Comment-based)",
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-violet-100 text-violet-600 rounded-lg">
            <FaBullseye size={16} />
          </div>
          <div className="relative group cursor-help">
            <h3 className="font-bold text-gray-900 inline-block leading-tight">
              Hook & CTA Insight
            </h3>
            {/* Tooltip */}
            <div className="absolute left-0 top-full mt-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none">
              <div className="font-bold mb-1 text-violet-300">
                Why this matters:
              </div>
              Your hook determines if they stop scrolling, and your CTA
              determines if they convert. Low scores here mean wasted reach.
              <div className="absolute left-4 -top-1 w-2 h-2 bg-gray-900 transform rotate-45"></div>
            </div>
          </div>
        </div>
        <div className="px-2 py-1 bg-green-100 text-green-700 text-[10px] font-bold uppercase rounded-full tracking-wide">
          High Potential
        </div>
      </div>

      <div className="p-5 space-y-6">
        {/* --- SECTION 1: HOOK ANALYSIS --- */}
        <div>
          <div className="flex justify-between items-end mb-2">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Hook Strategy
            </span>
            <span className="text-2xl font-black text-gray-900 leading-none">
              {hookData.score}
              <span className="text-sm text-gray-400 font-medium">/10</span>
            </span>
          </div>

          <div className="relative pt-1">
            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-100">
              <div
                style={{ width: `${(hookData.score / 10) * 100}%` }}
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-violet-500 to-fuchsia-500"
              ></div>
            </div>
          </div>

          <div className="bg-violet-50 rounded-xl p-3 border border-violet-100">
            <div className="flex items-center gap-2 mb-1">
              <FaMagnet className="text-violet-500" size={16} />
              <span className="font-bold text-violet-700 text-sm">
                {hookData.type}
              </span>
            </div>
            <p className="text-xs text-violet-600/80 leading-relaxed">
              "{hookData.text}"
            </p>
            <div className="mt-2 pt-2 border-t border-violet-200/50 flex gap-2 items-start">
              <FaBolt className="text-violet-400 mt-0.5 shrink-0" size={12} />
              <p className="text-[10px] text-violet-500 font-medium">
                AI Tip: {hookData.feedback}
              </p>
            </div>
          </div>
        </div>

        {/* --- SECTION 2: CTA PRECISION --- */}
        <div>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">
            Call to Action
          </span>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
              <div className="text-[10px] text-gray-400 mb-1">Type</div>
              <div className="font-bold text-gray-800 text-sm flex items-center gap-1">
                <FaComments className="text-blue-500" /> {ctaData.type}
              </div>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
              <div className="text-[10px] text-gray-400 mb-1">Friction</div>
              <div className="font-bold text-gray-800 text-sm flex items-center gap-1">
                <FaCheckCircle className="text-green-500" /> {ctaData.friction}
              </div>
            </div>
          </div>
        </div>

        {/* --- SECTION 3: VISUAL HEATMAP --- */}
        <div>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">
            Structure Heatmap
          </span>
          <div className="h-4 w-full rounded-full flex overflow-hidden">
            <div
              className="w-[15%] bg-red-400"
              title="Hook (Highest Retention)"
            ></div>
            <div className="w-[65%] bg-blue-400" title="Body (Value)"></div>
            <div
              className="w-[20%] bg-green-400"
              title="CTA (Conversion)"
            ></div>
          </div>
          <div className="flex justify-between text-[10px] text-gray-400 mt-1 font-medium">
            <span className="text-red-400">Hook</span>
            <span className="text-blue-400">Body</span>
            <span className="text-green-400">CTA</span>
          </div>
        </div>

        {/* --- SECTION 4: AI REMIX BUTTONS --- */}
        <div className="pt-4 border-t border-gray-100">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 block">
            Instant Remix
          </span>
          <div className="grid grid-cols-2 gap-3">
            <button className="py-2 px-3 bg-gray-900 text-white rounded-lg text-xs font-bold hover:bg-black transition-colors flex items-center justify-center gap-2 shadow-lg shadow-gray-200">
              <FaFire className="text-orange-400" /> Aggressive
            </button>
            <button className="py-2 px-3 bg-white text-violet-600 border border-violet-100 rounded-lg text-xs font-bold hover:bg-violet-50 transition-colors flex items-center justify-center gap-2">
              <FaMagic /> Viral Spin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
