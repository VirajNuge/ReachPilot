export const PLATFORM_KEYS = [
  "all",
  "linkedin",
  "twitter",
  "instagram",
  "facebook",
  "threads",
  "pinterest",
] as const;

export type PlatformKey = (typeof PLATFORM_KEYS)[number];

export const PLATFORM_LABELS: Record<Exclude<PlatformKey, "all">, string> = {
  linkedin: "LinkedIn",
  twitter: "X / Twitter",
  instagram: "Instagram",
  facebook: "Facebook",
  threads: "Threads",
  pinterest: "Pinterest",
};

export const DEFAULT_PLATFORM: PlatformKey = "all";
