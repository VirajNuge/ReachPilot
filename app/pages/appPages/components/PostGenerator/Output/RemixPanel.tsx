"use client";

import React from "react";
import { motion } from "framer-motion";
import { REMIX_STYLE_LABELS, RemixStyle } from "@/lib/types/postGeneration";
import { RefreshCw } from "lucide-react";

interface RemixPanelProps {
  onRemix: (style: RemixStyle) => void;
  isRemixing?: boolean;
}

export const RemixPanel: React.FC<RemixPanelProps> = ({ onRemix, isRemixing = false }) => {
  const styles = Object.keys(REMIX_STYLE_LABELS) as RemixStyle[];

  return (
    <div className="flex flex-wrap gap-3">
      {styles.map((style) => {
        const { label, emoji } = REMIX_STYLE_LABELS[style];
        return (
          <motion.button
            key={style}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onRemix(style)}
            disabled={isRemixing}
            className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-blue-200 hover:text-[#0052FF] transition-all duration-200 font-semibold text-sm text-gray-700 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>{emoji}</span>
            <span>{label}</span>
            {isRemixing && <RefreshCw className="w-3 h-3 animate-spin ml-1" />}
          </motion.button>
        );
      })}
    </div>
  );
};
