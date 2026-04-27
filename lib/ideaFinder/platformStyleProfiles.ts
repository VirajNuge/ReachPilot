import type {
  CaptionStylePreference,
  CTAType,
  IntensityLevel,
  LinkedInPostType,
  LinkedInStyleProfile,
  PostPlatform,
  ToneType,
} from "@/lib/types/postGeneration";

export interface PlatformStyleProfile {
  styleProfileId: string;
  tone: string[];
  toneTypes: ToneType[];
  captionStyle: CaptionStylePreference;
  ctaPattern: string;
  ctaType: CTAType;
  hashtagPolicy: { min: number; max: number };
  emojiPolicy: { min: number; max: number };
  lengthPolicy: {
    recommendedMin: number;
    recommendedMax: number;
    hardMax?: number;
  };
  emojiLevel: IntensityLevel;
  hashtagIntensity: IntensityLevel;
  linkedInPostType?: LinkedInPostType;
  linkedInStyleProfile?: LinkedInStyleProfile;
}

export const PLATFORM_STYLE_PROFILES: Record<PostPlatform, PlatformStyleProfile> = {
  linkedin: {
    styleProfileId: "linkedin-authority-v1",
    tone: ["professional", "authority", "insight-first"],
    toneTypes: ["professional", "authority"],
    captionStyle: "educational",
    ctaPattern: "End with a discussion prompt tied to the main insight.",
    ctaType: "comment_cta",
    hashtagPolicy: { min: 3, max: 5 },
    emojiPolicy: { min: 0, max: 2 },
    lengthPolicy: { recommendedMin: 1000, recommendedMax: 1500, hardMax: 3000 },
    emojiLevel: "low",
    hashtagIntensity: "medium",
    linkedInPostType: "insight",
    linkedInStyleProfile: "startup_founder",
  },
  x: {
    styleProfileId: "x-sharp-conversational-v1",
    tone: ["concise", "conversational", "witty"],
    toneTypes: ["bold", "witty"],
    captionStyle: "auto",
    ctaPattern: "Invite a direct reply with a pointed question.",
    ctaType: "comment_cta",
    hashtagPolicy: { min: 0, max: 2 },
    emojiPolicy: { min: 0, max: 2 },
    lengthPolicy: { recommendedMin: 120, recommendedMax: 260, hardMax: 280 },
    emojiLevel: "low",
    hashtagIntensity: "low",
  },
  instagram_post: {
    styleProfileId: "instagram-visual-story-v1",
    tone: ["visual", "story-driven", "value-forward"],
    toneTypes: ["friendly", "inspirational"],
    captionStyle: "storytelling",
    ctaPattern: "Use a specific save/share/comment CTA.",
    ctaType: "save_this_post",
    hashtagPolicy: { min: 3, max: 5 },
    emojiPolicy: { min: 2, max: 4 },
    lengthPolicy: { recommendedMin: 900, recommendedMax: 1400, hardMax: 2200 },
    emojiLevel: "medium",
    hashtagIntensity: "medium",
  },
  facebook: {
    styleProfileId: "facebook-community-v1",
    tone: ["community", "authentic", "narrative"],
    toneTypes: ["friendly", "professional"],
    captionStyle: "educational",
    ctaPattern: "Close with a conversation-starting question.",
    ctaType: "comment_cta",
    hashtagPolicy: { min: 0, max: 5 },
    emojiPolicy: { min: 1, max: 3 },
    lengthPolicy: { recommendedMin: 700, recommendedMax: 1700, hardMax: 63206 },
    emojiLevel: "low",
    hashtagIntensity: "low",
  },
  pinterest: {
    styleProfileId: "pinterest-search-visual-v1",
    tone: ["search-friendly", "visual", "helpful"],
    toneTypes: ["friendly", "professional"],
    captionStyle: "educational",
    ctaPattern: "Use a practical, keyword-led description that encourages saves and clicks.",
    ctaType: "save_this_post",
    hashtagPolicy: { min: 3, max: 6 },
    emojiPolicy: { min: 0, max: 2 },
    lengthPolicy: { recommendedMin: 250, recommendedMax: 600, hardMax: 500 },
    emojiLevel: "low",
    hashtagIntensity: "medium",
  },
  threads: {
    styleProfileId: "threads-warm-opinion-v1",
    tone: ["personal", "warm", "conversational"],
    toneTypes: ["friendly", "bold"],
    captionStyle: "auto",
    ctaPattern: "End with a quick opinion/reply prompt.",
    ctaType: "comment_cta",
    hashtagPolicy: { min: 0, max: 3 },
    emojiPolicy: { min: 1, max: 2 },
    lengthPolicy: { recommendedMin: 100, recommendedMax: 300, hardMax: 500 },
    emojiLevel: "low",
    hashtagIntensity: "low",
  },
};
