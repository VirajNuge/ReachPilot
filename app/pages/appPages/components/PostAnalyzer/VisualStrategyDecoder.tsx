import React from "react";
import {
  FaEye,
  FaPalette,
  FaChartLine,
  FaRobot,
  FaImage,
} from "react-icons/fa";

export default function VisualStrategyDecoder() {
  // Mock Data
  const visualData = {
    category: "Technical Screenshot",
    confidence: "94%",
    elements: ["Code Snippet", "Dark Mode", "No Faces"],
    performance: {
      label: "Technical Authority",
      score: "High", // High, Medium, Low
      uplift: "+42%", // vs Average
    },
    insight:
      "Dark mode code screenshots drive 2x more saves than light mode in SaaS.",
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
            <FaImage size={16} />
          </div>
          <div className="relative group cursor-help">
            <h3 className="font-bold text-gray-900 inline-block leading-tight">
              Visual DNA
            </h3>
            {/* Tooltip */}
            <div className="absolute left-0 top-full mt-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none">
              <div className="font-bold mb-1 text-indigo-300">
                Why this matters:
              </div>
              Analyzes the visual elements (colors, faces, text) contributing to
              performance.
              <div className="absolute left-4 -top-1 w-2 h-2 bg-gray-900 transform rotate-45"></div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 px-2 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase rounded-full tracking-wide">
          <FaRobot size={10} /> AI Analyzed
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* --- SECTION 1: CLASSIFICATION --- */}
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-lg bg-gray-900 flex items-center justify-center text-white text-xs font-mono border border-gray-700 shadow-inner">
            {`<code>`}
          </div>
          <div>
            <h4 className="font-bold text-gray-900 text-lg leading-tight">
              {visualData.category}
            </h4>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {visualData.elements.map((el, i) => (
                <span
                  key={i}
                  className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-md border border-gray-200"
                >
                  {el}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* --- SECTION 2: PERFORMANCE CORRELATION --- */}
        <div>
          <div className="flex justify-between items-end mb-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Performance Impact
            </span>
            <span className="text-sm font-black text-emerald-600 flex items-center gap-1">
              <FaChartLine /> {visualData.performance.uplift} Virality
            </span>
          </div>

          <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden flex">
            <div
              className="w-1/2 bg-gray-300 h-full border-r border-white"
              title="Niche Average"
            ></div>
            <div
              className="w-[42%] bg-indigo-500 h-full relative"
              title="This Post"
            >
              <div className="absolute top-0 right-0 bottom-0 w-0.5 bg-white opacity-50 animate-pulse"></div>
            </div>
          </div>
          <div className="flex justify-between text-[9px] text-gray-400 mt-1 font-medium">
            <span>Niche Avg</span>
            <span>You are here</span>
          </div>
        </div>

        {/* --- SECTION 3: VISUAL BRIEF (INSIGHT) --- */}
        <div className="bg-indigo-50 rounded-xl p-3 border border-indigo-100 flex gap-3 items-start">
          <FaPalette className="text-indigo-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs text-indigo-900 font-bold mb-0.5">
              Design Recommendation
            </p>
            <p className="text-[11px] text-indigo-700/80 leading-snug">
              {visualData.insight}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
