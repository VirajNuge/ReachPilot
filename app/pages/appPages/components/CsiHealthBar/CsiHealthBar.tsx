"use client";

import React from "react";
import { motion } from "framer-motion";
import { BsHeartPulseFill, BsInfoCircle } from "react-icons/bs";

interface CsiHealthBarProps {
  score: number; // 0-100
}

const CsiHealthBar: React.FC<CsiHealthBarProps> = ({ score }) => {
  // Determine health state configuration
  let config = {
    gradient: "from-emerald-400 to-teal-500",
    shadow: "shadow-emerald-200",
    text: "text-emerald-700",
    bg: "bg-emerald-50",
    status: "Excellent",
    advice: "Sustainable growth pace.",
  };

  if (score < 50) {
    config = {
      gradient: "from-rose-400 to-red-500",
      shadow: "shadow-rose-200",
      text: "text-rose-700",
      bg: "bg-rose-50",
      status: "Burnout Risk",
      advice: "High effort, low return detected.",
    };
  } else if (score < 75) {
    config = {
      gradient: "from-amber-400 to-orange-500",
      shadow: "shadow-amber-200",
      text: "text-amber-700",
      bg: "bg-amber-50",
      status: "Good",
      advice: "Consistent, but watch engagement.",
    };
  }

  return (
    <motion.div
      className="group relative w-[320px] overflow-hidden rounded-[24px] border border-white/60 bg-white/60 p-6 shadow-sm backdrop-blur-xl transition-all hover:shadow-md"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-4 ">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-xl ${config.bg} ${config.text}`}
          >
            <BsHeartPulseFill size={20} />
          </div>
          <div>
            <h4 className="text-lg font-bold text-gray-900 leading-tight">
              Content Fitness
            </h4>
            <p className="text-xs font-medium text-gray-500">CSI Score</p>
          </div>
        </div>
        <div
          className={`rounded-full px-3 py-1 text-xs font-bold border ${config.bg} ${config.text} border-current/10`}
        >
          {config.status}
        </div>
      </div>

      <div className="relative mt-2">
        <div className="mb-2 flex items-end justify-between">
          <span className="text-4xl font-extrabold tracking-tight text-gray-900">
            {score}
            <span className="text-lg font-bold text-gray-400">/100</span>
          </span>
        </div>

        {/* Premium Progress Bar */}
        <div className="relative h-6 w-full overflow-hidden rounded-full bg-gray-100/80 shadow-inner">
          {/* Tick Marks */}
          <div className="absolute inset-0 z-10 flex justify-between px-1">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="h-full w-px bg-white/40" />
            ))}
          </div>

          <motion.div
            className={`h-full rounded-full bg-gradient-to-r ${config.gradient} ${config.shadow}`}
            initial={{ width: 0 }}
            animate={{ width: `${score}%` }}
            transition={{ duration: 1.5, ease: "circOut" }}
          >
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')] opacity-20 mix-blend-overlay" />
            <div className="absolute right-0 top-0 h-full w-full bg-gradient-to-l from-white/20 to-transparent" />
          </motion.div>
        </div>

        <div className="mt-4 flex rounded-xl border border-gray-100 bg-white/50 p-3">
          <BsInfoCircle className="mt-0.5 mr-2 h-4 w-4 shrink-0 text-gray-400" />
          <p className="text-sm font-medium text-gray-600 leading-snug">
            {config.advice}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default CsiHealthBar;
