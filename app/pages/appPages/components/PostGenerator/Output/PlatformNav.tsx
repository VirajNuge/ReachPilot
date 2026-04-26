"use client";

import React from "react";
import { motion } from "framer-motion";
import type { PostPlatform } from "@/lib/types/postGeneration";
import { PLATFORM_BRANDS, PlatformLogo } from "../platformBranding";

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
  const containerClassName = [
    isVertical
      ? "flex flex-col gap-2"
      : "flex items-center gap-2 overflow-x-auto no-scrollbar",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div role="tablist" aria-label="Platforms" className={containerClassName}>
      {platforms.map((platform) => {
        const brand = PLATFORM_BRANDS[platform];
        const isActive = platform === activePlatform;

        return (
          <button
            key={platform}
            type="button"
            role="tab"
            aria-selected={isActive}
            title={brand.label}
            onClick={() => onChange(platform)}
            className={[
              "group relative isolate transition-all duration-200",
              isVertical
                ? "w-full flex items-center justify-between rounded-2xl px-3 py-2.5"
                : "inline-flex items-center gap-2 rounded-full px-3.5 py-2.5 whitespace-nowrap",
              isActive
                ? "text-[#111827]"
                : "text-[#6B7280] hover:text-[#111827]",
            ].join(" ")}
          >
            {isActive && (
              <motion.span
                layoutId={isVertical ? "platform-nav-rail" : "platform-nav-pill"}
                className="absolute inset-0 rounded-[inherit] border border-white/80 bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(241,245,249,0.88))] shadow-[0_12px_30px_rgba(15,23,42,0.08)]"
                transition={{ type: "spring", stiffness: 500, damping: 36 }}
              />
            )}

            <span className="relative z-10 flex items-center gap-2.5">
              <span
                className="flex h-8 w-8 items-center justify-center rounded-full border border-[#E2E8F0] bg-white"
                style={{ color: brand.color }}
              >
                <PlatformLogo platform={platform} className="h-4 w-4" />
              </span>
              {isVertical && <span className="text-sm font-semibold">{brand.label}</span>}
            </span>

            {!isVertical && (
              <span
                className={[
                  "relative z-10 h-2 w-2 rounded-full transition-opacity",
                  isActive ? "opacity-100" : "opacity-30 group-hover:opacity-60",
                ].join(" ")}
                style={{ backgroundColor: brand.color }}
              />
            )}

            {isVertical && (
              <span
                className={[
                  "relative z-10 h-2.5 w-2.5 rounded-full transition-opacity",
                  isActive ? "opacity-100" : "opacity-30 group-hover:opacity-60",
                ].join(" ")}
                style={{ backgroundColor: brand.color }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
