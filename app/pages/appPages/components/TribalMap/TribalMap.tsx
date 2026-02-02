"use client";

import React from "react";
import { motion } from "framer-motion";
import { BsPeopleFill, BsInfoCircle } from "react-icons/bs";

interface TribalMapProps {
  tribes?: Array<{
    name: string;
    size: number; // 0-100 relative size
    growth: string; // "+12%"
    sentiment: string; // "Positive", "Neutral"
  }>;
}

const TribalMap: React.FC<TribalMapProps> = ({
  tribes = [
    { name: "The Founders", size: 60, growth: "+12%", sentiment: "Positive" },
    { name: "Indie Hackers", size: 40, growth: "+5%", sentiment: "Neutral" },
    { name: "Junior Devs", size: 30, growth: "-2%", sentiment: "Positive" },
  ],
}) => {
  const maxVal = Math.max(...tribes.map((t) => t.size));

  // Determine positions carefully to avoid overlap in this demo
  const positions = [
    {
      top: "15%",
      left: "15%",
      color: "from-blue-100 to-blue-50 border-blue-200 text-blue-700",
    },
    {
      top: "50%",
      left: "55%",
      color: "from-purple-100 to-purple-50 border-purple-200 text-purple-700",
    },
    {
      top: "65%",
      left: "15%",
      color: "from-pink-100 to-pink-50 border-pink-200 text-pink-700",
    },
    {
      top: "20%",
      left: "65%",
      color:
        "from-emerald-100 to-emerald-50 border-emerald-200 text-emerald-700",
    },
  ];

  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="font-bold text-lg text-gray-900">Tribal Map</h4>
          <p className="text-xs text-gray-500 font-medium">
            Audience Sub-cultures
          </p>
        </div>
        <div className="bg-pink-50 p-2 rounded-lg text-pink-600">
          <BsPeopleFill size={16} />
        </div>
      </div>

      <div className="relative flex-1 w-full rounded-2xl bg-white/40 backdrop-blur-sm border border-white/50 overflow-hidden min-h-[280px] shadow-inner">
        {/* Map Grid Background */}
        <div
          className="absolute inset-0 opacity-[0.05] mix-blend-multiply"
          style={{
            backgroundImage:
              "radial-gradient(#6366f1 1.5px, transparent 1.5px)",
            backgroundSize: "24px 24px",
          }}
        />

        {/* Central "You" Marker */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-gray-900 rounded-full shadow-lg border-2 border-white z-0 opacity-20" />

        {tribes.map((tribe, i) => {
          const config = positions[i % positions.length];
          const scale = 0.6 + (tribe.size / maxVal) * 0.8;
          const sizePx = 90 * scale;

          return (
            <motion.div
              key={i}
              className={`absolute flex flex-col items-center justify-center rounded-full shadow-sm border backdrop-blur-sm cursor-pointer hover:shadow-lg hover:border-gray-300 transition-all z-10 bg-gradient-to-br ${config.color}`}
              style={{
                top: config.top,
                left: config.left,
                width: `${sizePx}px`,
                height: `${sizePx}px`,
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                type: "spring",
                stiffness: 120,
                damping: 15,
                delay: i * 0.15,
              }}
              whileHover={{ scale: 1.05, zIndex: 50 }}
            >
              <h5 className="text-xs font-bold leading-tight px-1 text-center">
                {tribe.name}
              </h5>
              <span
                className={`text-[9px] font-bold mt-0.5 px-1.5 py-0.5 rounded-full bg-white/60 ${
                  tribe.growth.startsWith("-")
                    ? "text-red-500"
                    : "text-emerald-600"
                }`}
              >
                {tribe.growth}
              </span>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
        <div className="flex gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-blue-100 border border-blue-200" />
            <span>Tech</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-purple-100 border border-purple-200" />
            <span>Creators</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <BsInfoCircle /> Size = Engagement Vol
        </div>
      </div>
    </div>
  );
};

export default TribalMap;
