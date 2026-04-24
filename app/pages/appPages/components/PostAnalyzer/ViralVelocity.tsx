import React from "react";
import { FaRocket, FaClock } from "react-icons/fa";
import { FaFireFlameCurved } from "react-icons/fa6";
import { ViralVelocityProps } from "@/lib/postAnalyzerTypes";

export default function ViralVelocity({ velocityData }: ViralVelocityProps) {
  // Fix percentage calculation - ensure reasonable bounds
  const calculateVsAvgPercentage = (): number => {
    const { likesPerHour, accountAvg } = velocityData;
    
    // Handle edge cases
    if (accountAvg === 0) {
      return likesPerHour > 0 ? 100 : 0; // 100% increase if no baseline
    }
    
    const percentageChange = ((likesPerHour - accountAvg) / accountAvg) * 100;
    
    // Cap extreme values to prevent display issues
    if (percentageChange > 1000) return 1000; // Max +1000%
    if (percentageChange < -100) return -100;  // Max -100%
    
    return Math.round(percentageChange);
  };

  const vsAvg = calculateVsAvgPercentage();

  return (
    <div className="bg-white rounded-[24px] shadow-[0_4px_24px_rgba(0,0,0,0.02)] overflow-hidden flex flex-col h-full border-none">
      {/* ── Top Section ── */}
      <div className="px-6 pt-6 pb-2 relative">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
          Viral Velocity
        </p>

        <div className="flex items-end gap-3 mb-1 relative pr-12">
          <span className="text-[44px] font-black text-[#1A1D23] leading-[0.9] tracking-tight">
            {velocityData.likesPerHour}
          </span>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm text-slate-400 font-medium">
              Likes / hr
            </span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wide ${
                vsAvg > 0
                  ? "bg-[#F3FFE5] text-[#4D8C00]"
                  : "bg-[#FFF0F0] text-[#FF4D4D]"
              }`}
            >
              {vsAvg > 0 ? "+" : ""}
              {vsAvg}%
            </span>
          </div>
        </div>

        <p className="text-sm text-slate-400 font-medium tracking-tight">
          vs. account average
        </p>

        {/* Rocket Icon */}
        <div className="absolute top-8 right-6 w-10 h-10 bg-[#0052FF] text-white rounded-[14px] flex items-center justify-center cursor-help group shadow-[0_4px_12px_rgba(0,82,255,0.2)]">
          <FaRocket size={18} className="transform -rotate-12" />
          {/* Tooltip */}
          <div className="absolute right-0 top-full mt-2 w-64 p-3 bg-[#1A1D23] text-white text-xs rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none">
            <div className="font-bold mb-1 text-[#B6FF33]">
              Why this matters:
            </div>
            Measures the speed of engagement. High velocity signals viral
            potential and newsjacking opportunities.
            <div className="absolute right-4 -top-1 w-2 h-2 bg-[#1A1D23] transform rotate-45"></div>
          </div>
        </div>
      </div>

      <div className="px-6 pb-6 mt-4 flex-1 flex flex-col">
        {/* ── Momentum Bar ── */}
        <div className="mb-auto">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Momentum
            </span>
            <span className="text-[11px] font-bold bg-[#F3FFE5] text-[#4D8C00] px-2.5 py-1 rounded-full tracking-wide">
              Peak: {velocityData.peakTime}
            </span>
          </div>

          <div className="h-2.5 w-full bg-[#F1F5F9] rounded-full overflow-hidden mb-3">
            <div className="h-full rounded-full bg-[#0052FF] w-[85%]" />
          </div>

          <div className="text-[13px] text-slate-500 flex items-center gap-1.5 font-medium">
            <FaFireFlameCurved className="text-[#FF8A00] shrink-0" size={13} />
            <span className="text-[#1A1D23] font-bold">
              {velocityData.trend}
            </span>
            <span className="text-slate-400">—</span>
            <span className="text-slate-500">
              {velocityData.growthPrediction}
            </span>
          </div>
        </div>

        {/* ── Newsjacking Callout ── */}
        <div className="mt-8">
          <div className="bg-[#F4F7FB] rounded-2xl p-4 flex gap-3 items-start">
            <div className="w-5 h-5 rounded-full bg-[#0052FF] text-white flex items-center justify-center shrink-0 mt-0.5">
              <FaClock size={10} />
            </div>
            <div>
              <p className="text-[13px] font-bold text-[#1A1D23] mb-1">
                Start &ldquo;Newsjacking&rdquo;
              </p>
              <p className="text-[13px] text-slate-500 leading-relaxed font-medium">
                Reply or quote this post within 1 hr to capture ~40% more
                profile views.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
