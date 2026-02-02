"use client";

import React from "react";
import { motion } from "framer-motion";
import { BsEyeFill } from "react-icons/bs";
import { FaGhost } from "react-icons/fa";

interface ShadowAudienceProps {
  data?: {
    lurkersPercent: number; // e.g., 85
    engagersPercent: number; // e.g., 15
    insight: string;
  };
}

const ShadowAudience: React.FC<ShadowAudienceProps> = ({
  data = {
    lurkersPercent: 70,
    engagersPercent: 30,
    insight: "Your content is being read by high-value lurkers.",
  },
}) => {
  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h4 className="font-bold text-lg text-gray-900">Shadow Audience</h4>
          <p className="text-xs text-gray-500 font-medium">
            The "Lurker" Opportunity
          </p>
        </div>
        <div className="bg-gray-100 p-2 rounded-lg text-gray-600">
          <FaGhost size={16} />
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center">
        {/* Metric Split */}
        <div className="flex items-end justify-between mb-4 px-4">
          <div className="text-center">
            <span className="block text-4xl font-black text-gray-900 tracking-tight">
              {data.lurkersPercent}%
            </span>
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">
              Lurkers
            </span>
          </div>

          <div className="pb-3 text-gray-300 font-bold">VS</div>

          <div className="text-center opacity-60">
            <span className="block text-3xl font-bold text-gray-800 tracking-tight">
              {data.engagersPercent}%
            </span>
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">
              Active
            </span>
          </div>
        </div>

        {/* Bar Visualization */}
        <div className="h-4 w-full bg-gray-100 rounded-full overflow-hidden mb-6 relative shadow-inner">
          {/* Gradient Mask for Lurkers (Inverse) */}
          <motion.div
            className="absolute right-0 top-0 bottom-0 bg-gradient-to-l from-indigo-500 to-purple-500"
            initial={{ width: 0 }}
            animate={{ width: `${data.engagersPercent}%` }}
            transition={{ duration: 1.5, ease: "circOut" }}
          />
          <div className="absolute left-2 top-1/2 -translate-y-1/2 text-[9px] font-bold text-gray-400 z-10">
            LURKERS ZONE
          </div>
          <div className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-bold text-white z-10">
            ENGAGERS
          </div>
        </div>

        {/* Insight Box */}
        <div className="bg-gradient-to-r from-gray-50 to-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex gap-2 items-start">
            <BsEyeFill className="mt-1 text-purple-500 shrink-0" />
            <p className="text-xs font-medium text-gray-600 leading-relaxed italic">
              "{data.insight}"
            </p>
          </div>
        </div>

        <button className="mt-5 w-full py-3 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2">
          <FaGhost size={12} />
          Activate Lurker Strategy
        </button>
      </div>
    </div>
  );
};

export default ShadowAudience;
