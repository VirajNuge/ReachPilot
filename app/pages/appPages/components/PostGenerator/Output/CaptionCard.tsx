"use client";

import React from "react";
import { motion } from "framer-motion";
import { Check, Copy } from "lucide-react";
import type { PostPlatform } from "@/lib/types/postGeneration";
import { PLATFORM_BRANDS, PlatformLogo } from "../platformBranding";

interface CaptionCardProps {
  platform: string;
  caption: string;
  options?: string[];
  selectedOptionIndex?: number;
  onSelectOption?: (index: number) => void;
  onCopy: () => void;
  onCaptionChange?: (newCaption: string) => void;
}

const PLATFORM_LIMITS: Record<string, number> = {
  x: 280,
  linkedin: 3000,
  instagram_post: 2200,
  facebook: 63200,
};

export const CaptionCard: React.FC<CaptionCardProps> = ({
  platform,
  caption,
  options,
  selectedOptionIndex = 0,
  onSelectOption,
  onCopy,
  onCaptionChange,
}) => {
  const [copied, setCopied] = React.useState(false);
  const brand =
    PLATFORM_BRANDS[platform as PostPlatform] ??
    {
      label: platform,
      shortLabel: platform,
      color: "#0052FF",
      Icon: () => null,
    };

  const handleCopy = () => {
    onCopy();
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  const charLimit = PLATFORM_LIMITS[platform] ?? 2000;
  const currentChars = caption.length;
  const percentage = Math.min((currentChars / charLimit) * 100, 100);
  
  const getRingColor = () => {
    if (percentage > 100) return "text-red-500";
    if (percentage > 90) return "text-amber-500";
    return "text-green-500";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative min-h-[200px] bg-white px-6 py-5 sm:px-8 sm:py-7 overflow-hidden"
    >
      {/* Brand left border */}
      <div 
        className="absolute left-0 top-0 bottom-0 w-1" 
        style={{ backgroundColor: brand.color }} 
      />

      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E5E7EB] pb-4">
          <div className="flex items-center gap-3">
            <span
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E2E8F0] bg-[#F9FAFB]"
              style={{ color: brand.color }}
            >
              <PlatformLogo platform={platform as PostPlatform} className="h-4 w-4" />
            </span>
            <div>
              <p className="text-base font-semibold text-[#111827]">{brand.label}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="relative w-4 h-4">
                  <svg className="w-4 h-4 transform -rotate-90" viewBox="0 0 20 20">
                    <circle cx="10" cy="10" r="8" fill="transparent" stroke="#E5E7EB" strokeWidth="2" />
                    <circle
                      cx="10"
                      cy="10"
                      r="8"
                      fill="transparent"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeDasharray="50.2"
                      strokeDashoffset={50.2 - (percentage / 100) * 50.2}
                      className={getRingColor()}
                    />
                  </svg>
                </div>
                <p className={`text-xs ${percentage > 100 ? "text-red-600 font-bold" : "text-[#6B7280]"}`}>
                  {currentChars} / {charLimit}
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCopy}
            className={[
              "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
              copied
                ? "border-[#C7E8B4] bg-[#F3FBEA] text-[#3F6212]"
                : "border-[#D1D5DB] text-[#374151] hover:border-[#9CA3AF]",
            ].join(" ")}
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>

        {options && options.length > 1 && (
          <div className="flex flex-wrap gap-2">
            {options.map((opt, index) => {
              const isActive = index === selectedOptionIndex;
              const previewText = opt.length > 35 ? opt.slice(0, 35) + "..." : opt;
              return (
                <button
                  key={`${platform}-option-${index}`}
                  type="button"
                  onClick={() => onSelectOption?.(index)}
                  className={[
                    "rounded-xl px-3 py-2 text-xs font-semibold transition-colors max-w-[200px] text-left truncate",
                    isActive
                      ? "bg-[#EEF4FF] text-[#1D4ED8] ring-1 ring-[#C7D7FF]"
                      : "bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB]",
                  ].join(" ")}
                  title={opt}
                >
                  {previewText}
                </button>
              );
            })}
          </div>
        )}

        <textarea
          value={caption}
          onChange={(e) => onCaptionChange?.(e.target.value)}
          className="min-h-[160px] w-full resize-y rounded-xl border border-transparent hover:border-[#E5E7EB] focus:border-[#0052FF] focus:ring-2 focus:ring-[#0052FF]/20 bg-transparent p-2 text-[15px] leading-[1.75] text-[#111827] outline-none transition-all"
          placeholder="Write your caption here..."
        />
      </div>
    </motion.div>
  );
};
