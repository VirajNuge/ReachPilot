"use client";

import React from "react";
import { motion } from "framer-motion";
import type { PostPlatform } from "@/lib/types/postGeneration";
import { PLATFORM_DISPLAY } from "@/lib/types/postGeneration";

type PlatformNavVariant = "horizontal" | "vertical";

type PlatformNavProps = {
  platforms: PostPlatform[];
  activePlatform: PostPlatform;
  onChange: (platform: PostPlatform) => void;
  variant: PlatformNavVariant;
  className?: string;
};

export function PlatformNav({
  platforms,
  activePlatform,
  onChange,
  variant,
  className,
}: PlatformNavProps) {
  const isVertical = variant === "vertical";
  const baseClassName = isVertical
    ? "flex flex-col gap-1"
    : "flex items-center gap-2 overflow-x-auto no-scrollbar px-1";
  const containerClassName = [baseClassName, className].filter(Boolean).join(" ");

  return (
    <div
      role="tablist"
      aria-label="Platforms"
      className={containerClassName}
    >
      {platforms.map((platform) => {
        const display = PLATFORM_DISPLAY[platform];
        const isActive = platform === activePlatform;

        return (
          <button
            key={platform}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(platform)}
            className={
              isVertical
                ? `group relative w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[12px] font-bold transition-all duration-200 ${
                    isActive
                      ? "text-gray-900 bg-[#F6F8FF] shadow-sm"
                      : "text-gray-600 hover:text-gray-700 hover:bg-gray-50"
                  }`
                : `group relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-[12px] font-bold whitespace-nowrap transition-all duration-200 ${
                    isActive
                      ? "text-gray-900 bg-[#F6F8FF] shadow-sm"
                      : "text-gray-600 hover:text-gray-700 hover:bg-gray-50"
                  }`
            }
          >
            <span className="relative w-2.5 h-2.5 rounded-full flex-shrink-0">
              <span className="absolute inset-0 rounded-full bg-[#CBD5E1]" />
              <span
                className={`absolute inset-0 rounded-full transition-opacity duration-200 ${
                  isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                }`}
                style={{ backgroundColor: display?.color ?? "#0052FF" }}
              />
            </span>
            <span className="flex-1 text-left">{display?.label ?? platform}</span>

            {isActive && (
              <motion.span
                layoutId={isVertical ? "activePlatformRail" : "activePlatformPill"}
                className="absolute inset-0 rounded-xl border border-[#C7D7FF]"
                transition={{ type: "spring", stiffness: 500, damping: 35 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
