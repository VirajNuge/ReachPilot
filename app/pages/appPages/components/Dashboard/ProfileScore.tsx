import React from "react";
import SectionCard from "./SectionCard";

interface ProfileScoreProps {
  score: number;
  improvements: string[];
}

function scoreColor(score: number) {
  if (score >= 75) return { ring: "stroke-emerald-400", text: "text-emerald-600", bg: "from-emerald-400 to-teal-500" };
  if (score >= 50) return { ring: "stroke-amber-400",   text: "text-amber-600",   bg: "from-amber-400 to-orange-500" };
  return               { ring: "stroke-rose-400",    text: "text-rose-500",    bg: "from-rose-400 to-pink-500"   };
}

export default function ProfileScore({ score, improvements }: ProfileScoreProps) {
  const cfg = scoreColor(score);
  // SVG circle donut
  const r = 30;
  const circ = 2 * Math.PI * r;
  const dash = circ * (Math.min(score, 100) / 100);

  return (
    <SectionCard
      title="Profile Optimization"
      subtitle="Top improvements to increase conversion"
      action={
        <button className="text-[11px] font-semibold text-[#0052FF] hover:text-[#003ED1] bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-full transition-colors">
          View analysis
        </button>
      }
    >
      {/* Score ring + info */}
      <div className="flex items-center gap-5 mb-5">
        <div className="relative flex-shrink-0">
          <svg width="80" height="80" viewBox="0 0 80 80" className="-rotate-90">
            <circle cx="40" cy="40" r={r} fill="none" stroke="#e2e8f0" strokeWidth="8" />
            <circle
              cx="40" cy="40" r={r}
              fill="none"
              className={cfg.ring}
              strokeWidth="8"
              strokeDasharray={`${dash} ${circ}`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-[18px] font-black ${cfg.text}`}>{score}</span>
          </div>
        </div>
        <div>
          <div className="text-[15px] font-bold text-[#1A1D23]">Profile score</div>
          <div className="text-[12px] font-medium text-slate-400 mt-0.5">Target: 85+</div>
          <div className={`mt-2 text-[11px] font-bold uppercase tracking-wide ${cfg.text}`}>
            {score >= 75 ? "Great" : score >= 50 ? "Needs work" : "Low"}
          </div>
        </div>
      </div>

      {/* Improvements */}
      <div className="space-y-2">
        {improvements.map((item, index) => (
          <div key={`${item}-${index}`} className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="flex-shrink-0 h-5 w-5 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-black text-slate-500">
              {index + 1}
            </span>
            <span className="text-[12px] font-medium text-slate-600 leading-snug">{item}</span>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
