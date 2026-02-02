"use client";

import React from "react";
import { motion } from "framer-motion";
import { BsCollectionFill } from "react-icons/bs";

interface ContentPillarsProps {
  pillars?: Array<{
    topic: string;
    performance: string;
  }>;
}

const ContentPillars: React.FC<ContentPillarsProps> = ({ pillars = [] }) => {
  const getPerformanceColor = (perf: string) => {
    switch (perf.toLowerCase()) {
      case "high":
        return "bg-emerald-50 text-emerald-700 border-emerald-100";
      case "medium":
        return "bg-blue-50 text-blue-700 border-blue-100";
      case "low":
        return "bg-gray-50 text-gray-600 border-gray-100";
      default:
        return "bg-gray-50 text-gray-600";
    }
  };

  return (
    <div className="flex bg-transparent w-full h-full flex-col p-5">
      <div className="flex gap-2 items-center mb-4">
        <div className="bg-indigo-50 p-2 rounded-lg text-indigo-600">
          <BsCollectionFill size={16} />
        </div>
        <div>
          <h4 className="font-bold text-lg text-gray-900">Content Pillars</h4>
          <p className="text-xs text-gray-500 font-medium">Core Topics</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 overflow-y-auto pr-1 custom-scrollbar">
        {pillars.map((pillar, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="group flex items-center justify-between p-3 rounded-xl bg-gray-50/80 border border-gray-100 hover:bg-white hover:border-indigo-100 hover:shadow-md transition-all cursor-default"
          >
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-white text-indigo-600 font-bold text-xs shadow-sm border border-indigo-50 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                {idx + 1}
              </span>
              <span className="font-semibold text-gray-700 text-sm">
                {pillar.topic}
              </span>
            </div>

            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold border tracking-wide ${getPerformanceColor(
                pillar.performance,
              )}`}
            >
              {pillar.performance}
            </span>
          </motion.div>
        ))}

        {pillars.length === 0 && (
          <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <p className="text-sm">Analyzing content pillars...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentPillars;
