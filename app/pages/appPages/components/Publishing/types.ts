// Aligned with PostGenerator platform names
export type Platform = "linkedin" | "x" | "instagram_post" | "facebook";

export interface PlatformMeta {
  label: string;
  shortLabel: string;
  color: string;
  charLimit: number;
}

export const PLATFORM_META: Record<Platform, PlatformMeta> = {
  linkedin:      { label: "LinkedIn",  shortLabel: "LI", color: "#0A66C2", charLimit: 3000  },
  x:             { label: "X",         shortLabel: "X",  color: "#000000", charLimit: 280   },
  instagram_post:{ label: "Instagram", shortLabel: "IG", color: "#E1306C", charLimit: 2200  },
  facebook:      { label: "Facebook",  shortLabel: "FB", color: "#1877F2", charLimit: 63206 },
};

export const ALL_PLATFORMS: Platform[] = ["linkedin", "x", "instagram_post", "facebook"];

export interface PostHashtags {
  highReach: string[];
  niche: string[];
  branded: string[];
}

export interface PostDraft {
  id: string;
  title: string;
  /** Platforms this post targets */
  platforms: Platform[];
  /** Per-platform caption, keyed by platform id */
  captions: Partial<Record<Platform, string>>;
  /** 3-tier hashtag strategy */
  hashtags: PostHashtags;
  /** Optional AI-generated image URL */
  imageUrl?: string;
  status: "draft" | "scheduled" | "published";
  scheduledDate?: Date;
}

// ── Reach Forecaster score ──────────────────────────────────────────────────

export interface ReachScore {
  keywordRelevance: number;   // 0-100
  sentimentStrength: number;  // 0-100
  hookVelocity: number;       // 0-100
  total: number;              // KR×0.4 + SS×0.3 + HV×0.3
}
