"use client";

import React from "react";
import { motion } from "framer-motion";
import { Copy, RefreshCw, Check } from "lucide-react";
import { PostPlatform, PLATFORM_DISPLAY, RemixStyle } from "@/lib/types/postGeneration";
import { RemixPanel } from "./RemixPanel";

interface CaptionCardProps {
  platform: string;
  caption: string;
  onCopy: () => void;
  onRemix: (style: RemixStyle) => void;
  isRemixing?: boolean;
}

export const CaptionCard: React.FC<CaptionCardProps> = ({
  platform,
  caption,
  onCopy,
  onRemix,
  isRemixing = false,
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const platformData = PLATFORM_DISPLAY[platform as PostPlatform] || {
    label: platform,
    color: "#0052FF",
    shortLabel: platform,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-7 rounded-[32px] border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col gap-5"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-4 h-4 rounded-full flex-shrink-0"
            style={{ backgroundColor: platformData.color }}
          />
          <span className="text-lg font-bold text-gray-900 tracking-tight">{platformData.label}</span>
        </div>
        <span className="px-3 py-1 bg-gray-50 rounded-full text-xs font-bold text-gray-500">
          {caption.length} Chars
        </span>
      </div>

      <div className="bg-[#F8FAFC] p-5 rounded-2xl text-gray-800 whitespace-pre-wrap font-medium text-[15px] leading-relaxed border border-gray-100/50">
        {caption}
      </div>

      <div className="flex flex-col gap-4 mt-1">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Actions
          </span>
          <button
            onClick={handleCopy}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all duration-200 font-bold text-sm shadow-sm ${
              copied 
                ? "bg-[#A5E338] text-gray-900 shadow-[#A5E338]/20" 
                : "bg-[#0047FF] text-white hover:bg-blue-700 hover:shadow-[#0047FF]/20"
            }`}
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
        
        <div className="pt-4 border-t border-gray-100/60">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-4">
            Quick Remix
          </span>
          <RemixPanel onRemix={onRemix} isRemixing={isRemixing} />
        </div>
      </div>
    </motion.div>
  );
};
