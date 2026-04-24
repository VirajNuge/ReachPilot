"use client";

import React from "react";
import { motion } from "framer-motion";
import { Copy, Check } from "lucide-react";
import { PostPlatform, PLATFORM_DISPLAY, RemixStyle } from "@/lib/types/postGeneration";

interface CaptionCardProps {
  platform: string;
  caption: string;
  options?: string[];
  selectedOptionIndex?: number;
  onSelectOption?: (index: number) => void;
  onCopy: () => void;
  onRemix?: (style: RemixStyle) => void;
  isRemixing?: boolean;
}

export const CaptionCard: React.FC<CaptionCardProps> = ({
  platform,
  caption,
  options,
  selectedOptionIndex = 0,
  onSelectOption,
  onCopy,
  onRemix: _onRemix,
  isRemixing: _isRemixing = false,
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
      className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col gap-5"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="w-4 h-4 rounded-full flex-shrink-0"
            style={{ backgroundColor: platformData.color }}
          />
          <span className="text-base font-bold text-gray-900 tracking-tight">{platformData.label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 bg-gray-50 rounded-full text-[11px] font-semibold text-gray-600">
            {caption.length} Chars
          </span>
          <span className="px-2.5 py-1 bg-[#EEF3FF] rounded-full text-[11px] font-semibold text-[#0052FF]">
            Draft
          </span>
        </div>
      </div>

      <div className="bg-[#F8FAFC] p-5 rounded-xl text-gray-900 whitespace-pre-wrap font-medium text-[15px] leading-relaxed border border-gray-200 min-h-[4rem]">
        {caption}
      </div>

      {options && options.length > 1 && (
        <div className="space-y-2">
          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-[0.12em]">Caption Options</span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
            {options.map((option, index) => {
              const isActive = index === selectedOptionIndex;
              return (
                <button
                  key={`${platform}-caption-option-${index}`}
                  type="button"
                  onClick={() => onSelectOption?.(index)}
                  className={`text-left px-2.5 py-1.5 rounded-lg border text-[11px] font-semibold transition-all ${
                    isActive
                      ? "border-[#0052FF] bg-[#EEF3FF] text-[#0052FF]"
                      : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                  }`}
                  title={option}
                >
                  Option {index + 1}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
        <div className="flex items-center gap-2 text-[11px] font-semibold text-gray-400 uppercase tracking-[0.12em]">
          Actions
        </div>
        <button
          onClick={handleCopy}
          className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 font-semibold text-[13px] ${
            copied
              ? "bg-[#A5E338] text-gray-900"
              : "bg-[#0047FF] text-white hover:bg-blue-700"
          }`}
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
    </motion.div>
  );
};
