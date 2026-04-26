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
}

export const CaptionCard: React.FC<CaptionCardProps> = ({
  platform,
  caption,
  options,
  selectedOptionIndex = 0,
  onSelectOption,
  onCopy,
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-[420px] bg-white px-6 py-5 sm:px-8 sm:py-7"
    >
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
              <p className="text-xs text-[#6B7280]">{caption.length} characters</p>
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
            {copied ? "Copied" : "Copy caption"}
          </button>
        </div>

        {options && options.length > 1 && (
          <div className="flex flex-wrap gap-2">
            {options.map((_, index) => {
              const isActive = index === selectedOptionIndex;
              return (
                <button
                  key={`${platform}-option-${index}`}
                  type="button"
                  onClick={() => onSelectOption?.(index)}
                  className={[
                    "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                    isActive
                      ? "bg-[#EEF4FF] text-[#1D4ED8] ring-1 ring-[#C7D7FF]"
                      : "bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB]",
                  ].join(" ")}
                >
                  Version {index + 1}
                </button>
              );
            })}
          </div>
        )}

        <div className="min-h-[280px] whitespace-pre-wrap text-[15px] leading-[1.75] text-[#111827]">
          {caption}
        </div>
      </div>
    </motion.div>
  );
};
