import React from "react";
import {
  FaHeart,
  FaExclamationTriangle,
  FaCloud,
  FaCheckCircle,
  FaRobot,
} from "react-icons/fa";
import { SentimentProps } from "@/lib/postAnalyzerTypes";

export default function SentimentVibe({ sentimentData }: SentimentProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-pink-100 text-pink-600 rounded-lg">
            <FaHeart size={16} />
          </div>
          <div className="relative group cursor-help">
            <h3 className="font-bold text-gray-900 inline-block leading-tight">
              Brand Vibe
            </h3>
            {/* Tooltip */}
            <div className="absolute left-0 top-full mt-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none">
              <div className="font-bold mb-1 text-pink-300">
                Why this matters:
              </div>
              Emotional impact analysis. How does your audience feel about this?
              Positive vibes drive shares, negative vibes drive comments.
              <div className="absolute left-4 -top-1 w-2 h-2 bg-gray-900 transform rotate-45"></div>
            </div>
          </div>
        </div>
        <div className="px-2 py-1 bg-gray-100 text-gray-500 text-[10px] font-bold uppercase rounded-full tracking-wide flex items-center gap-1">
          <FaRobot size={10} /> AI Analyzed
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* --- SECTION 1: SENTIMENT PULSE BAR --- */}
        <div>
          <div className="flex justify-between items-end mb-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Sentiment Pulse
            </span>
            <span className="text-sm font-black text-gray-900">
              {sentimentData.positive}% Positive
            </span>
          </div>

          <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden flex shadow-inner">
            <div
              style={{ width: `${sentimentData.positive}%` }}
              className="bg-emerald-400 h-full"
              title="Positive"
            ></div>
            <div
              style={{ width: `${sentimentData.constructive}%` }}
              className="bg-blue-400 h-full"
              title="Constructive"
            ></div>
            <div
              style={{ width: `${sentimentData.neutral}%` }}
              className="bg-gray-300 h-full"
              title="Neutral"
            ></div>
            <div
              style={{ width: `${sentimentData.negative}%` }}
              className="bg-red-400 h-full"
              title="Negative"
            ></div>
          </div>
          <div className="flex justify-between text-[9px] text-gray-400 mt-1.5 font-medium px-0.5">
            <span className="text-emerald-500">Pos</span>
            <span className="text-blue-500">Constr</span>
            <span className="text-red-400">Neg</span>
          </div>
        </div>

        {/* --- SECTION 2: VIBE WORD CLOUD --- */}
        <div>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 block">
            Audience Mood
          </span>
          <div className="flex flex-wrap gap-1.5">
            {sentimentData.keywords.map((word, i) => (
              <span
                key={i}
                className="text-[10px] font-bold text-gray-600 bg-gray-50 px-2 py-1 rounded-md border border-gray-100"
              >
                {word}
              </span>
            ))}
          </div>
        </div>

        {/* --- SECTION 3: EMOTION COMPASS --- */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-pink-50 rounded-xl p-3 border border-pink-100">
            <p className="text-[9px] font-bold text-pink-400 uppercase tracking-wider mb-0.5">
              Top Emotion
            </p>
            <p className="text-sm font-black text-pink-700 flex items-center gap-1">
              <FaHeart size={10} /> {sentimentData.dominantEmotion}
            </p>
          </div>
          <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
            <p className="text-[9px] font-bold text-blue-400 uppercase tracking-wider mb-0.5">
              Trust Score
            </p>
            <p className="text-sm font-black text-blue-700 flex items-center gap-1">
              <FaCheckCircle size={10} /> {sentimentData.trustScore}
            </p>
          </div>
        </div>

        {/* --- SECTION 4: CONTROVERSY WARNING (Conditional) --- */}
        {sentimentData.isControversial && (
          <div className="bg-orange-50 rounded-xl p-3 border border-orange-100 flex gap-2 items-start">
            <FaExclamationTriangle className="text-orange-500 mt-0.5" />
            <div>
              <p className="text-xs text-orange-800 font-bold">
                High Controversy Risk
              </p>
              <p className="text-[10px] text-orange-700/80">
                Topic is polarizing. Expect debate.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
