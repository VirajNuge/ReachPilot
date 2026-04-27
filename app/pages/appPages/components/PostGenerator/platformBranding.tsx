"use client";

import React from "react";
import type { PostPlatform } from "@/lib/types/postGeneration";
import { SiFacebook, SiInstagram, SiLinkedin, SiPinterest, SiThreads, SiX } from "react-icons/si";

type PlatformBrand = {
  label: string;
  shortLabel: string;
  color: string;
  Icon: React.ComponentType<{ className?: string }>;
};

export const PLATFORM_BRANDS: Record<PostPlatform, PlatformBrand> = {
  linkedin: {
    label: "LinkedIn",
    shortLabel: "LI",
    color: "#0A66C2",
    Icon: SiLinkedin,
  },
  x: {
    label: "X",
    shortLabel: "X",
    color: "#111111",
    Icon: SiX,
  },
  instagram_post: {
    label: "Instagram",
    shortLabel: "IG",
    color: "#E4405F",
    Icon: SiInstagram,
  },
  facebook: {
    label: "Facebook",
    shortLabel: "FB",
    color: "#1877F2",
    Icon: SiFacebook,
  },
  pinterest: {
    label: "Pinterest",
    shortLabel: "PIN",
    color: "#E60023",
    Icon: SiPinterest,
  },
  threads: {
    label: "Threads",
    shortLabel: "TH",
    color: "#111827",
    Icon: SiThreads,
  },
};

type PlatformLogoProps = {
  platform: PostPlatform;
  className?: string;
};

export function PlatformLogo({ platform, className }: PlatformLogoProps) {
  const Icon = PLATFORM_BRANDS[platform].Icon;
  return <Icon className={className} />;
}
