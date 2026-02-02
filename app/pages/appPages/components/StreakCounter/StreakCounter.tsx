"use client";

import React, { useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import { BsFire } from "react-icons/bs";

interface StreakCounterProps {
  days: number;
}

const StreakCounter: React.FC<StreakCounterProps> = ({ days }) => {
  const circles = Array.from({ length: 7 }, (_, i) => i + 1);
  const activeDay = Math.min(days % 7 || 7, 7);

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="relative mb-4 flex items-center justify-center">
        {/* Fire Icon with Glow */}
        <motion.div
          className="relative z-10 text-orange-500 drop-shadow-[0_0_15px_rgba(249,115,22,0.6)]"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <BsFire size={32} />
        </motion.div>

        {/* Ring Background */}
        <div className="absolute inset-0 -m-4 rounded-full border border-orange-100 bg-orange-50/50" />
      </div>

      <div className="text-center">
        <h3 className="text-3xl font-black text-gray-900 leading-none tracking-tight">
          {days}
        </h3>
        <p className="text-xs font-bold uppercase tracking-widest text-orange-500 mb-4">
          Day Streak
        </p>

        {/* Weekly Dots */}
        <div className="flex gap-2">
          {circles.map((day) => (
            <div
              key={day}
              className={`h-2.5 w-2.5 rounded-full border transition-all duration-300 ${
                day <= activeDay
                  ? "bg-orange-500 border-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.4)]"
                  : "bg-transparent border-gray-200"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default StreakCounter;
