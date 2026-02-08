import React from "react";
import { FaRocket, FaClock, FaChartLine, FaFire } from "react-icons/fa";

export default function ViralVelocity() {
  // Mock Data
  const velocityData = {
    likesPerHour: 145,
    trend: "Trending High", // Trending High, Stable, Decaying
    peakTime: "Now", // Now, Passed, In 2h
    accountAvg: 45, // LPH
    growthPrediction: "Upward", // Upward, Plateau, Downward
  };

  const isViral = velocityData.likesPerHour > velocityData.accountAvg * 2;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
            <FaRocket size={16} />
          </div>
          <div className="relative group cursor-help">
            <h3 className="font-bold text-gray-900 inline-block leading-tight">
              Viral Velocity
            </h3>
            {/* Tooltip */}
            <div className="absolute left-0 top-full mt-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none">
              <div className="font-bold mb-1 text-emerald-300">
                Why this matters:
              </div>
              Measures the speed of engagement (Likes/Hour). High velocity
              signals viral potential and newsjacking opportunities.
              <div className="absolute left-4 -top-1 w-2 h-2 bg-gray-900 transform rotate-45"></div>
            </div>
          </div>
        </div>
        <div className="px-2 py-1 bg-red-100 text-red-600 text-[10px] font-bold uppercase rounded-full tracking-wide flex items-center gap-1 animate-pulse">
          <FaFire /> {velocityData.trend}
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* --- SECTION 1: VELOCITY METER --- */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Current Speed
            </p>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-gray-900">
                {velocityData.likesPerHour}
              </span>
              <span className="text-xs font-bold text-gray-400">
                Likes / hr
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Vs. Average
            </p>
            <div className="flex items-center justify-end gap-1 text-emerald-600 font-bold text-sm">
              <FaChartLine /> +320%
            </div>
          </div>
        </div>

        {/* --- SECTION 2: MOMENTUM BAR --- */}
        <div>
          <div className="flex justify-between items-end mb-2">
            <span className="text-xs font-bold text-gray-500">
              Momentum Prediction
            </span>
            <span className="text-[10px] font-bold text-emerald-600">
              Peaking Now
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden flex">
            <div
              className="w-[85%] bg-gradient-to-r from-emerald-400 to-green-500 h-full relative"
              title="Current Momentum"
            >
              <div className="absolute top-0 right-0 bottom-0 w-0.5 bg-white opacity-50 animate-pulse"></div>
            </div>
          </div>
          <p className="text-[10px] text-gray-400 mt-1.5 leading-snug">
            Based on{" "}
            <span className="font-bold text-gray-600">High Comment Vol</span>,
            this post will stay active for ~14 more hours.
          </p>
        </div>

        {/* --- SECTION 3: ACTIONABLE INSIGHT (NEWSJACKING) --- */}
        <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100">
          <div className="flex gap-2 items-start">
            <FaClock className="text-emerald-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-emerald-900 font-bold mb-0.5">
                Start "Newsjacking"
              </p>
              <p className="text-[11px] text-emerald-700/90 leading-relaxed">
                Velocity is peaking. <strong>Reply or Quote Quote</strong> this
                post within 1 hour to capture ~40% more profile views.
              </p>
            </div>
          </div>
          <button className="w-full mt-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors shadow-sm">
            Draft High-Velocity Reply
          </button>
        </div>
      </div>
    </div>
  );
}
