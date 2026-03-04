import React from "react";
import {
  FaHeart,
  FaExclamationTriangle,
  FaCheckCircle,
  FaRobot,
} from "react-icons/fa";
import { SentimentProps } from "@/lib/postAnalyzerTypes";

export default function SentimentVibe({ sentimentData }: SentimentProps) {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-[0_10px_30px_rgba(0,0,0,0.03)] overflow-hidden">
      {/* ── Header ── */}
      <div className="px-5 pt-5 pb-4 flex justify-between items-start">
        <div className="flex-1">
          <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest mb-1">
            Brand Sentiment
          </p>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold text-[#1A1D23] leading-none">
              Audience Vibe
            </h3>
            <span className="text-[11px] font-semibold bg-slate-100 text-slate-500 px-3 py-1 rounded-xl flex items-center gap-1">
              <FaRobot size={10} /> AI Analyzed
            </span>
          </div>
        </div>

        <div className="p-2.5 bg-[#0052FF] text-white rounded-xl shrink-0 cursor-help relative group">
          <FaHeart size={16} />
          {/* Tooltip */}
          <div className="absolute right-0 top-full mt-2 w-64 p-3 bg-[#1A1D23] text-white text-xs rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none">
            <div className="font-bold mb-1 text-[#0052FF]">
              Why this matters:
            </div>
            Emotional impact analysis. How does your audience feel about this?
            Positive vibes drive shares, negative vibes drive comments.
            <div className="absolute right-4 -top-1 w-2 h-2 bg-[#1A1D23] transform rotate-45"></div>
          </div>
        </div>
      </div>

      <div className="px-5 pb-5 space-y-5">
        {/* ── Sentiment Pulse Bar ── */}
        <div>
          <div className="flex justify-between items-end mb-2">
            <span className="text-[10px] font-medium text-slate-500 uppercase tracking-widest">
              Sentiment Pulse
            </span>
            <span className="text-xl font-bold text-[#1A1D23]">
              {sentimentData.positive}% Positive
            </span>
          </div>

          <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex">
            <div
              style={{ width: `${sentimentData.positive}%` }}
              className="bg-[#B6FF33] h-full"
              title={`Positive: ${sentimentData.positive}%`}
            />
            <div
              style={{ width: `${sentimentData.constructive}%` }}
              className="bg-[#0052FF] h-full"
              title={`Constructive: ${sentimentData.constructive}%`}
            />
            <div
              style={{ width: `${sentimentData.neutral}%` }}
              className="bg-slate-300 h-full"
              title={`Neutral: ${sentimentData.neutral}%`}
            />
            <div
              style={{ width: `${sentimentData.negative}%` }}
              className="bg-[#1A1D23] h-full"
              title={`Negative: ${sentimentData.negative}%`}
            />
          </div>

          <div className="flex justify-between mt-2 px-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#B6FF33]"></span>
              <span className="text-[11px] font-semibold text-slate-500">
                Pos
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0052FF]"></span>
              <span className="text-[11px] font-semibold text-slate-500">
                Constr
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span>
              <span className="text-[11px] font-semibold text-slate-500">
                Neut
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#1A1D23]"></span>
              <span className="text-[11px] font-semibold text-slate-500">
                Neg
              </span>
            </div>
          </div>
        </div>

        {/* ── Key Indicators ── */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest mb-1">
              Top Emotion
            </p>
            <div className="text-[11px] font-semibold bg-slate-100 text-slate-500 px-3 py-1.5 rounded-xl inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#B6FF33]"></span>
              {sentimentData.dominantEmotion}
            </div>
          </div>
          <div>
            <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest mb-1">
              Trust Score
            </p>
            <div className="text-3xl font-bold text-[#1A1D23] leading-none flex items-baseline gap-1">
              {sentimentData.trustScore}
              <FaCheckCircle className="text-[#0052FF]" size={12} />
            </div>
          </div>
        </div>

        {/* ── Audience Mood Word cloud ── */}
        <div>
          <span className="text-[10px] font-medium text-slate-500 uppercase tracking-widest mb-2 block">
            Audience Mood
          </span>
          <div className="flex flex-wrap gap-2">
            {sentimentData.keywords.map((word, i) => (
              <span
                key={i}
                className="bg-slate-100 text-slate-600 text-[11px] font-medium px-3 py-1.5 rounded-xl border border-slate-200/50"
              >
                {word}
              </span>
            ))}
          </div>
        </div>

        {/* ── Controversy Warning (Conditional) ── */}
        {sentimentData.isControversial && (
          <div className="border-t border-slate-100 pt-4 mt-4">
            <div className="bg-[#1A1D23] text-white px-4 py-3 rounded-2xl flex gap-3 items-center shadow-lg">
              <div className="p-2 bg-white/10 rounded-xl shrink-0">
                <FaExclamationTriangle className="text-[#B6FF33] text-lg" />
              </div>
              <div>
                <p className="text-[13px] font-bold text-white mb-0.5">
                  High Controversy Risk
                </p>
                <p className="text-[11px] text-slate-300">
                  Topic is polarizing. Expect debate in the comments.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
