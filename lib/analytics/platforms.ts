export const PLATFORM_KEYS = [
  "all",
  "twitter",
  "instagram",
  "facebook",
  "threads",
] as const;

export type PlatformKey = (typeof PLATFORM_KEYS)[number];

export const PLATFORM_LABELS: Record<Exclude<PlatformKey, "all">, string> = {
  twitter: "X / Twitter",
  instagram: "Instagram",
  facebook: "Facebook",
  threads: "Threads",
};

export const DEFAULT_PLATFORM: PlatformKey = "all";
