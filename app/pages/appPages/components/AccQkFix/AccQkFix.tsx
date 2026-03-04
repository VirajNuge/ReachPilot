"use client";

import React from "react";
import { motion } from "framer-motion";
import { BsArrowRightShort, BsX } from "react-icons/bs";

interface AccQkFixProps {
  headline: string;
  description: string;
  tag: string;
}

const getTagStyle = (tag: string) => {
  switch (tag.toUpperCase()) {
    case "HIGH IMPACT":
      return {
        bg: "bg-gradient-to-r from-red-100 to-orange-100",
        text: "text-red-700",
        border: "border-red-200",
        icon: "🔥",
      };
    case "MEDIUM IMPACT":
      return {
        bg: "bg-gradient-to-r from-amber-100 to-yellow-100",
        text: "text-amber-700",
        border: "border-amber-200",
        icon: "⚡",
      };
    case "LOW IMPACT":
      return {
        bg: "bg-gradient-to-r from-gray-100 to-slate-100",
        text: "text-gray-600",
        border: "border-gray-200",
        icon: "💡",
      };
    default:
      return {
        bg: "bg-gray-100",
        text: "text-gray-700",
        border: "border-gray-200",
        icon: "📌",
      };
  }
};

const AccQkFix: React.FC<AccQkFixProps> = ({ headline, description, tag }) => {
  const style = getTagStyle(tag);

  return (
    <motion.div
      layout
      className="group relative mb-3 overflow-hidden rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100 transition-all hover:shadow-md hover:ring-gray-200"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ y: -2 }}
    >
      <div
        className={`absolute left-0 top-0 h-full w-1 ${style.bg.split(" ")[1] || "bg-gray-200"} group-hover:w-1.5 transition-all`}
      />

      <div className="flex items-start justify-between gap-3 pl-2">
        {/* Icon Box */}
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${style.bg} ${style.text} text-sm shadow-sm`}
        >
          {style.icon}
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-gray-900 text-sm leading-tight">
              {headline}
            </h4>
            <div
              className={`scale-75 opacity-0 transition-all group-hover:scale-100 group-hover:opacity-100`}
            >
              <button className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-900">
                <BsX size={14} />
              </button>
            </div>
          </div>

          <p className="mt-1 text-xs font-medium text-gray-500 leading-relaxed">
            {description}
          </p>

          <div className="mt-3 flex items-center justify-between">
            <span
              className={`inline-flex items-center px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide rounded-md ${style.bg} ${style.text} border border-transparent`}
            >
              {tag}
            </span>

            <button className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-indigo-600 hover:text-indigo-700 transition-colors">
              Fix Now <BsArrowRightShort size={14} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AccQkFix;
