"use client";

import React from "react";
import { motion } from "framer-motion";
import { BsLightningFill } from "react-icons/bs";

interface HypeValueMeterProps {
  score?: {
    hype: number;
    value: number;
  };
}

const HypeValueMeter: React.FC<HypeValueMeterProps> = ({
  score = { hype: 30, value: 70 },
}) => {
  const total = score.hype + score.value;
  const hypePercent = Math.round((score.hype / total) * 100);

  return (
    <div className="flex h-full w-full flex-col pl-5">
      <div className="flex items-center mb-2">
        <div className="rounded-lg bg-orange-50 p-2 text-orange-600 mr-2">
          <BsLightningFill size={16} />
        </div>
        <div className="pt-5">
          <h4 className="text-lg font-bold text-gray-900">Authority Balance</h4>
          <p className="text-xs text-gray-500 font-medium">
            Hype vs. Value Ratio
          </p>
        </div>
      </div>

      <div className="relative flex-1 flex flex-col justify-center p-0">
        {/* Ruler Track */}
        <div className="relative h-4 max-w-[330px] rounded-full bg-gray-100 shadow-inner">
          {/* Gradient Fill */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-400 via-violet-500 to-blue-500 opacity-20" />

          {/* Sweet Spot Zone */}
          <div className="absolute left-[30%] width-[40%] h-full border-x border-white/50 bg-white/20" />
          <div className="absolute left-[30%] -top-5 text-[9px] font-bold uppercase tracking-wider text-gray-400">
            Sweet Spot
          </div>

          {/* The Thumb/Slider */}
          <motion.div
            className="absolute top-1/2 -mt-3.5 h-7 w-7 rounded-full border-4 border-white bg-violet-600 shadow-md z-10 cursor-help"
            initial={{ left: "0%" }}
            animate={{ left: `calc(${hypePercent}% - 14px)` }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-violet-900 text-white text-[10px] font-bold rounded-md whitespace-nowrap opacity-0 hover:opacity-100 transition-opacity">
              {hypePercent}% Hype
            </div>
          </motion.div>
        </div>

        {/* Labels */}
        <div className="mt-4 flex justify-between max-w-[330px] text-xs font-bold uppercase tracking-widest text-gray-400">
          <span className="text-orange-400">Hype</span>
          <span className="text-blue-500">Value</span>
        </div>
      </div>

      <p className="mt-auto text-xs font-medium text-gray-500 flex items-center gap-2 pt-4 border-t border-gray-50 pb-5">
        {hypePercent > 40
          ? "⚠️ High 'Hype'. Add more depth."
          : hypePercent < 20
            ? "⚠️ High 'Value'. Add more hooks."
            : "✅ Perfect balance established."}
      </p>
    </div>
  );
};

export default HypeValueMeter;
