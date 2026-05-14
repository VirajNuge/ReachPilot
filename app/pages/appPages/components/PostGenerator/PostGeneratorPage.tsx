"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertCircle,
  RefreshCw,
  ChevronDown,
  User,
  Sparkles,
  SlidersHorizontal,
  FileText,
  LayoutGrid,
  Image as ImageIcon,
  Plus,
  X,
  Upload,
  Wand2,
  Palette,
  PenLine,
  ClipboardList,
  History,
  ArrowRight,
  Zap,
  Trash2,
  Smartphone,
} from "lucide-react";

import type {
  PostGenerationInput,
  PostObjective,
  TargetAudience,
  ContentAngle,
  PostPlatform,
  BrandType,
  VisualStyle,
  ImageGenType,
  GeminiImageModel,
  ToneType,
  CTAType,
  IntensityLevel,
  ContentStrategyOutput,
  CaptionGeneratorOutput,
  PosterPromptOutput,
  ImageCreativeDirectorOutput,
  ImageVariation,
  PostPackage,
  ContentScore,
  HookOption,
  RemixStyle,
  PostTextBlock,
  ReferenceImage,
  NicheCategory,
  PostIntent,
  LightingDirection,
  ShadingStyle,
  ImageStyle,
  CompositionPreference,
  TextStylePreference,
  ColorThemePreset,
  CaptionStylePreference,
  PostGenerationDocument,
} from "@/lib/types/postGeneration";
import {
  POST_OBJECTIVE_LABELS,
  TARGET_AUDIENCE_LABELS,
  CONTENT_ANGLE_LABELS,
  BRAND_TYPE_LABELS,
  VISUAL_STYLE_LABELS,
  IMAGE_GEN_TYPE_LABELS,
  IMAGE_MODEL_LABELS,
  TONE_LABELS,
  CTA_LABELS,
  PLATFORM_INTELLIGENCE,
  POST_IMAGE_SIZES,
  NICHE_CATEGORY_LABELS,
  POST_INTENT_LABELS,
  LIGHTING_DIRECTION_LABELS,
  SHADING_STYLE_LABELS,
  IMAGE_STYLE_LABELS,
  COMPOSITION_PREFERENCE_LABELS,
  TEXT_STYLE_PREFERENCE_LABELS,
  COLOR_THEME_PRESET_LABELS,
  CAPTION_STYLE_LABELS,
} from "@/lib/types/postGeneration";

import type { PipelineStage } from "./Pipeline/GenerationPipeline";
import GenerationExperience from "./Pipeline/GenerationExperience";
import { OutputDashboard } from "./Output/OutputDashboard";
import StylePickerModal from "./Modals/StylePickerModal";
import WritingStyleModal from "./Modals/WritingStyleModal";
import { PLATFORM_BRANDS, PlatformLogo } from "./platformBranding";
import { normalizeGroupedHashtags } from "@/lib/postGeneration/hashtags";
import { aggregatePlatformScores } from "@/lib/postGeneration/scoreAggregator";
import {
  POSTGEN_AUTO_ANALYTICS,
  POSTGEN_CREATIVE_DIRECTOR_STAGE,
} from "@/lib/postGeneration/featureFlags";

// ── Constants ────────────────────────────────────────────────────────────────

type ViewState = "idle" | "generating" | "output";
type InputStep = 1 | 2 | 3;

type OutputPreviewSnapshot = {
  postPackage: PostPackage;
  input: PostGenerationInput;
  strategy: ContentStrategyOutput | null;
  hooks: HookOption[] | null;
  contentScore: ContentScore | null;
  usedTemplateName?: string;
  templateAICurated?: boolean;
  imageGenError?: string | null;
};

type HistoryPostRecord = Omit<PostGenerationDocument, "_id" | "createdAt" | "updatedAt"> & {
  _id: string;
  createdAt: string;
  updatedAt: string;
  source?: "web" | "mobile";
};

const POST_GENERATOR_PREVIEW_KEY = "reachpilot_post_generator_preview_snapshot";
const POST_GENERATOR_SEED_INPUT_KEY = "reachpilot_post_generator_seed_input";
const CAPTION_OPTION_LIMIT = 3;
const STARTER_BRAND_COLORS = ["#F97316", "#22C55E", "#EAB308", "#EF4444", "#14B8A6"];

function isDataUrl(value: string | undefined): boolean {
  return typeof value === "string" && value.startsWith("data:");
}

function sanitizeInputForPersistence(input: PostGenerationInput): PostGenerationInput {
  return {
    ...input,
    referenceImages: (input.referenceImages ?? []).map((img) => ({
      ...img,
      dataUrl: "",
    })),
    brandAssets: {
      ...input.brandAssets,
      logoUrl: isDataUrl(input.brandAssets.logoUrl) ? undefined : input.brandAssets.logoUrl,
    },
  };
}

function sanitizeOutputForPersistence(output: PostPackage): PostPackage {
  // Do NOT strip dataUrls for generated images. They are needed for publishing.
  // The backend API handles the base64 conversion during platform upload.
  return output;
}

function normalizeMongoId(value: unknown): string | null {
  if (typeof value === "string" && value.trim().length > 0) return value;
  if (typeof value === "object" && value !== null) {
    const withOid = value as { $oid?: unknown; toString?: () => string };
    if (typeof withOid.$oid === "string" && withOid.$oid.trim().length > 0) return withOid.$oid;
    if (typeof withOid.toString === "function") {
      const candidate = withOid.toString();
      if (candidate && candidate !== "[object Object]") return candidate;
    }
  }
  return null;
}

function mergePostPackageForPersistence(
  base: PostPackage,
  hooks: HookOption[] | null,
  contentScore: ContentScore | null
): PostPackage {
  return {
    ...base,
    ...(hooks ? { hooks } : {}),
    ...(contentScore ? { contentScore } : {}),
  };
}

function normalizeCaptionOptionsMap(
  captionOptions: PostPackage["captionOptions"],
  captions: PostPackage["captions"]
): NonNullable<PostPackage["captionOptions"]> {
  const entries = Object.entries(captionOptions ?? {}).map(([platform, options]) => {
    const normalized = Array.from(
      new Set(
        (options ?? [])
          .map((option) => option.trim())
          .filter((option) => option.length > 0)
      )
    ).slice(0, CAPTION_OPTION_LIMIT);

    const fallbackCaption = captions[platform] ?? "";
    const finalOptions = normalized.length > 0 ? normalized : fallbackCaption ? [fallbackCaption] : [];
    return [platform, finalOptions];
  });

  return Object.fromEntries(entries);
}

function normalizePostPackage(postPackage: PostPackage): PostPackage {
  const normalizedCaptionOptions = normalizeCaptionOptionsMap(postPackage.captionOptions, postPackage.captions);
  const normalizedHashtags = normalizeGroupedHashtags(postPackage.hashtags);

  return {
    ...postPackage,
    imagePrompt: postPackage.imagePrompt || "",
    headline: postPackage.headline || "",
    subtext: postPackage.subtext || "",
    cta: postPackage.cta || "",
    captionOptions: normalizedCaptionOptions,
    hashtags: normalizedHashtags,
  };
}

// Status badge config for history panel
const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  draft:     { label: "Draft",     className: "bg-[#F1F5F9] text-[#64748B]" },
  scheduled: { label: "Scheduled", className: "bg-[#EEF3FF] text-[#2563EB]" },
  published: { label: "Published", className: "bg-[#F0FDF4] text-[#16A34A]" },
};

// Empty package used as placeholder when creating a shell draft at pipeline start
const EMPTY_POST_PACKAGE: PostPackage = {
  imagePrompt: "",
  captions: {},
  captionOptions: {},
  hashtags: { highReach: [], niche: [], branded: [] },
  sizes: {},
  headline: "",
  subtext: "",
  cta: "",
  designStyle: "minimal",
};

const DUMMY_PREVIEW_SNAPSHOT: OutputPreviewSnapshot = {
  input: {
    objective: "lead_generation",
    targetAudiences: ["startup_founders"],
    coreMessage: "Launching our AI social studio that turns one idea into multi-platform content in minutes.",
    platforms: ["linkedin", "x", "instagram_post", "facebook", "threads"],
    generationFocus: "balanced",
    generateImage: true,
    brandType: "startup_saas",
    visualStyles: ["minimal", "tech"],
    imageGenType: "ai_background",
    ctas: ["visit_link", "follow_for_more"],
    tones: ["professional", "authority"],
    emojiLevel: "low",
    hashtagIntensity: "medium",
    textBlocks: [],
    referenceImages: [],
    brandAssets: {
      colorPalette: ["#F97316", "#22C55E", "#EAB308"],
      watermark: false,
      fontFamily: "Inter",
    },
  },
  strategy: {
    postAngle: "From scattered posting to one streamlined social pipeline",
    hookIdea: "Most teams don’t need more content ideas — they need better execution systems.",
    contentStructure: "Problem → Shift in approach → New workflow → CTA",
    visualIdea: "Minimal SaaS dashboard mockup with content blocks flowing into social platform cards",
    talkingPoints: [
      "Single input, multi-platform output",
      "Brand consistency without manual rewrites",
      "Faster approval-to-publish cycles",
    ],
  },
  hooks: [
    { id: "hook-1", style: "Contrarian", text: "Content isn’t your bottleneck. Workflow is." },
    { id: "hook-2", style: "Story", text: "We stopped writing 5 separate posts and shipped better content." },
    { id: "hook-3", style: "Direct", text: "One brief. Five platforms. Zero formatting chaos." },
  ],
  contentScore: {
    hookStrength: 86,
    clarity: 90,
    engagementPotential: 84,
    virality: 79,
    overall: 85,
    feedback: "Strong and clear message with good platform alignment. Add one stronger proof point to increase virality.",
  },
  usedTemplateName: "Launch Momentum",
  templateAICurated: true,
  imageGenError: null,
  postPackage: {
    imagePrompt:
      "Clean modern SaaS campaign visual, dashboard UI in perspective, content tiles flowing into LinkedIn/X/Instagram/Facebook/Threads icons, warm amber glow, citrus-green accents, minimalist, high contrast, premium product launch style",
    imageUrl:
      "https://image.pollinations.ai/prompt/Minimal%20SaaS%20launch%20dashboard%20poster%20amber%20and%20green?width=1080&height=1080&nologo=true&enhance=true",
    imageVariations: [
      {
        id: 1,
        imageUrl:
          "https://image.pollinations.ai/prompt/Minimal%20SaaS%20launch%20dashboard%20poster%20amber%20and%20green?width=1080&height=1080&nologo=true&enhance=true",
        model: "gemini-2.5-flash-image",
        aspectRatio: "1:1",
      },
    ],
    captions: {
      linkedin:
        "Most teams don’t have a content ideation problem — they have a content operations problem.\n\nWe built a workflow where one strategic brief turns into platform-ready posts in minutes.\n\nResult: faster publishing, cleaner brand voice, less back-and-forth.\n\nIf you’re still rewriting from scratch for every channel, your process is slowing your growth.",
      x: "One brief. Five platforms. Better consistency. Faster publishing.\n\nContent quality scales when workflow quality scales.",
      instagram_post:
        "If your content process feels messy, it’s not your creativity. It’s your system ✨\n\nWe now turn one clear brief into content for every major platform — without losing tone or brand style.",
      facebook:
        "We changed one thing in our content workflow and it saved us hours every week: we stopped creating each post from scratch.\n\nNow we start with one strategic brief and adapt with intention.",
      threads:
        "Hot take: most content burnout comes from process debt, not idea shortage.\n\nOne good brief can power your whole social calendar when your system is designed right.",
    },
    captionOptions: {
      linkedin: [
        "Most teams don’t have a content ideation problem — they have a content operations problem.\n\nWe built a workflow where one strategic brief turns into platform-ready posts in minutes.",
        "Your team doesn’t need more content hacks. It needs a repeatable system.\n\nOne brief can power your full platform mix if your workflow is built for it.",
        "The fastest way to improve content quality? Fix your process before fixing your copy.\n\nOperational clarity creates better creative outcomes.",
      ],
      x: [
        "One brief. Five platforms. Better consistency. Faster publishing.",
        "Content scales when your workflow scales.",
        "Stop rewriting from scratch. Start repurposing with strategy.",
      ],
      instagram_post: [
        "Your content process should feel focused, not frantic ✨",
        "Less chaos. More consistency. Better content.",
        "One strategic brief can power your whole social week.",
      ],
      facebook: [
        "What if one great brief replaced five separate content drafts?",
        "We simplified our content workflow and got better results.",
        "The real productivity boost in content? Process design.",
      ],
      threads: [
        "Content burnout is often workflow burnout.",
        "One brief can be enough if your process is smart.",
        "Creative teams need systems, not more pressure.",
      ],
    },
    hashtags: {
      highReach: ["#ContentMarketing", "#SocialMedia", "#SaaS"],
      niche: ["#ContentOps", "#MarketingWorkflow", "#CreatorSystems"],
      branded: ["#ReachPilot", "#BuildInPublic"],
    },
    sizes: {
      linkedin: "1200x627",
      x: "1600x900",
      instagram_post: "1080x1080",
      facebook: "1200x630",
      threads: "1080x1080",
    },
    headline: "One Brief, All Platforms",
    subtext: "Turn a single idea into organized social output.",
    cta: "Try it now",
    designStyle: "minimal",
    contentScore: {
      hookStrength: 86,
      clarity: 90,
      engagementPotential: 84,
      virality: 79,
      overall: 85,
      feedback: "Strong structure. Add one concrete metric to strengthen credibility.",
    },
    hooks: [
      { id: "hook-1", style: "Contrarian", text: "Content isn’t your bottleneck. Workflow is." },
      { id: "hook-2", style: "Story", text: "We stopped writing 5 separate posts and shipped better content." },
      { id: "hook-3", style: "Direct", text: "One brief. Five platforms. Zero formatting chaos." },
    ],
    linkedInRefined: {
      viralityScore: 8.4,
      qualityFlags: ["Add one data point", "Shorten intro paragraph"],
      styleProfile: "startup_founder",
      postType: "framework",
    },
    xRefined: {
      engagementScore: 8.1,
      qualityFlags: ["Could be punchier", "Try a stronger first line"],
    },
    instagramRefined: {
      engagementScore: 8.6,
      qualityFlags: ["Add one stronger emotional hook"],
      postType: "carousel_tips",
    },
    facebookRefined: {
      engagementScore: 7.9,
      qualityFlags: ["Invite more conversation in final line"],
    },
  },
};

const ALL_PLATFORMS: PostPlatform[] = ["linkedin", "x", "instagram_post", "facebook", "threads"];

const FONTS = [
  "Montserrat",
  "Inter",
  "Poppins",
  "Roboto",
  "Playfair Display",
  "Space Grotesk",
];

const INITIAL_STAGES: PipelineStage[] = [
  {
    name: "Content Strategist",
    description: "Analyzing your brief and creating a content strategy",
    status: "pending",
  },
  {
    name: "Caption Generator",
    description: "Writing platform-optimized captions",
    status: "pending",
  },
  {
    name: "Image Prompt Generator",
    description: "Designing visual concepts for your post",
    status: "pending",
  },
  ...(POSTGEN_CREATIVE_DIRECTOR_STAGE
    ? [{
        name: "Creative Director",
        description: "Upgrading your visual brief with advanced art direction",
        status: "pending" as const,
      }]
    : []),
  {
    name: "Image Render",
    description: "Generating your social media image with AI",
    status: "pending",
  },
];

function buildPipelineStages(platforms: PostPlatform[], shouldGenerateImage: boolean): PipelineStage[] {
  const stages: PipelineStage[] = [
    { name: "Content Strategist", description: "Analyzing your brief and creating a content strategy", status: "pending" },
    { name: "Caption Generator", description: "Writing platform-optimized captions", status: "pending" },
  ];
  if (platforms.includes("linkedin")) {
    stages.push({ name: "LinkedIn Optimizer", description: "Refining your LinkedIn post for maximum virality", status: "pending" });
  }
  if (platforms.includes("x")) {
    stages.push({ name: "X Optimizer", description: "Refining your X post for maximum engagement", status: "pending" });
  }
  if (platforms.includes("instagram_post")) {
    stages.push({ name: "Instagram Optimizer", description: "Refining your Instagram post for maximum engagement", status: "pending" });
  }
  if (platforms.includes("facebook")) {
    stages.push({ name: "Facebook Optimizer", description: "Refining your Facebook post for maximum discussion and reach", status: "pending" });
  }
  if (platforms.includes("threads")) {
    stages.push({ name: "Threads Optimizer", description: "Refining your Threads post for punch and flow", status: "pending" });
  }
  if (shouldGenerateImage) {
    stages.push({ name: "Image Prompt Generator", description: "Designing visual concepts for your post", status: "pending" });
    if (POSTGEN_CREATIVE_DIRECTOR_STAGE) {
      stages.push({ name: "Creative Director", description: "Upgrading your visual brief with advanced art direction", status: "pending" });
    }
    stages.push({ name: "Image Render", description: "Generating your social media image with AI", status: "pending" });
  }
  return stages;
}

const DEFAULT_INPUT: PostGenerationInput = {
  objective: "educational",
  targetAudiences: ["general_audience"],
  coreMessage: "",
  platforms: ["linkedin"],
  generationFocus: "balanced",
  generateImage: true,
  brandType: "personal_brand",
  visualStyles: ["minimal"],
  imageGenType: "ai_background",
  brandAssets: { colorPalette: [], watermark: false },
  tones: ["professional"],
  ctas: ["none"],
  emojiLevel: "medium",
  hashtagIntensity: "medium",
  textBlocks: [],
  referenceImages: [],
};

// ── Persona → Wizard mapping helpers ─────────────────────────────────────────

function deriveBrandType(userRole: string, industry: string): BrandType {
  if (["Agency"].includes(industry)) return "agency";
  if (["E-commerce"].includes(industry)) return "ecommerce";
  if (["Founder", "Executive"].includes(userRole) && ["SaaS", "Fintech", "EdTech"].includes(industry)) return "startup_saas";
  if (["Creator", "Coach", "Freelancer"].includes(userRole)) return "creator";
  if (["Marketer", "Sales Rep", "Consultant"].includes(userRole)) return "personal_brand";
  return "personal_brand";
}

function deriveTargetAudience(
  audienceRole: string | string[] | undefined,
  audienceSegments: string[] | undefined
): TargetAudience {
  const roleStr = Array.isArray(audienceRole) ? audienceRole.join(" ") : (audienceRole ?? "");
  const combined = (roleStr + " " + (audienceSegments ?? []).join(" ")).toLowerCase();
  if (combined.includes("founder") || combined.includes("startup")) return "startup_founders";
  if (combined.includes("developer") || combined.includes("engineer")) return "developers";
  if (combined.includes("marketing") || combined.includes("agency")) return "marketing_agencies";
  if (combined.includes("real estate")) return "real_estate_buyers";
  if (roleStr || (audienceSegments && audienceSegments.length > 0)) return "custom";
  return "general_audience";
}

function deriveTone(
  sliders: { formalCasual: number; seriousPlayful: number; inspiringInformative: number; dataDriven: number } | undefined
): ToneType {
  if (!sliders) return "professional";
  if (sliders.formalCasual < 30) return "authority";
  if (sliders.formalCasual > 70) return sliders.seriousPlayful > 60 ? "witty" : "friendly";
  if (sliders.inspiringInformative < 40) return "inspirational";
  if (sliders.dataDriven > 60) return "professional";
  return "professional";
}

function deriveVisualStyle(
  brandArchetype: string | string[] | undefined,
  toneSliders: { formalCasual: number } | undefined
): VisualStyle {
  const a = (Array.isArray(brandArchetype) ? brandArchetype.join(" ") : (brandArchetype ?? "")).toLowerCase();
  if (a.includes("luxury") || a.includes("sage")) return "luxury";
  if (a.includes("rebel") || a.includes("outlaw")) return "bold";
  if (a.includes("tech") || a.includes("magician")) return "tech";
  if (a.includes("caregiver") || a.includes("everyman")) return "friendly";
  if (toneSliders && toneSliders.formalCasual < 35) return "corporate";
  return "minimal";
}

function deriveEmojiLevel(emojiUsage: string | undefined): IntensityLevel {
  if (!emojiUsage || emojiUsage.includes("None") || emojiUsage.includes("Strict")) return "low";
  if (emojiUsage.includes("Minimal")) return "low";
  if (emojiUsage.includes("Moderate")) return "medium";
  if (emojiUsage.includes("Heavy")) return "high";
  return "medium";
}

function deriveCTA(conversionGoal: string | string[] | undefined): CTAType {
  if (!conversionGoal || (Array.isArray(conversionGoal) && conversionGoal.length === 0)) return "none";
  const goal = Array.isArray(conversionGoal) ? conversionGoal.join(" ") : conversionGoal;
  if (goal.includes("call")) return "visit_link";
  if (goal.includes("newsletter") || goal.includes("lead magnet")) return "sign_up";
  if (goal.includes("Buy") || goal.includes("product")) return "visit_link";
  if (goal.includes("Follow")) return "follow_for_more";
  if (goal.includes("community") || goal.includes("Join")) return "comment_cta";
  return "none";
}

function deriveContentAngle(contentMix: string[] | undefined): ContentAngle | undefined {
  if (!contentMix?.length) return undefined;
  if (contentMix.includes("How-to Guides")) return "step_by_step_guide";
  if (contentMix.includes("Thought Leadership")) return "contrarian_opinion";
  if (contentMix.includes("Personal Stories") || contentMix.includes("Behind-the-Scenes")) return "story";
  if (contentMix.includes("Case Studies")) return "data_insight";
  return undefined;
}

function deriveObjective(primaryObjective: string[] | undefined): PostObjective {
  if (!primaryObjective?.length) return "educational";
  if (primaryObjective.includes("Generate Leads")) return "lead_generation";
  if (primaryObjective.includes("Sell Products")) return "promotional";
  if (primaryObjective.includes("Build Authority")) return "thought_leadership";
  if (primaryObjective.includes("Grow Community")) return "engagement";
  return "educational";
}

function nextPreferredWeekday(targetDay: number, targetHour: number, targetMinute = 0): Date {
  const now = new Date();
  const candidate = new Date(now);
  candidate.setHours(targetHour, targetMinute, 0, 0);

  const dayOffset = (targetDay - candidate.getDay() + 7) % 7;
  candidate.setDate(candidate.getDate() + dayOffset);

  if (candidate <= now) {
    candidate.setDate(candidate.getDate() + 7);
  }

  return candidate;
}

function getSuggestedSchedule(input: PostGenerationInput): Date {
  const niche = input.niche ?? "other";
  const market = (input.location ?? "").toLowerCase();
  const isB2B =
    input.platforms.includes("linkedin") ||
    ["tech_saas", "finance", "legal", "agency_marketing", "education", "personal_brand"].includes(niche);
  const isLifestyle = ["fitness", "beauty", "fashion", "food_restaurant", "travel", "ecommerce"].includes(niche);
  const isWeekendFriendly = ["travel", "food_restaurant", "beauty", "fashion"].includes(niche);

  let weekday = 2;
  let hour = isB2B ? 9 : 18;
  let minute = 30;

  if (isLifestyle) {
    weekday = 4;
    hour = market.includes("dubai") || market.includes("uae") ? 20 : 18;
    minute = 0;
  } else if (niche === "finance" || niche === "legal" || niche === "healthcare") {
    weekday = 2;
    hour = 8;
    minute = 30;
  } else if (niche === "education") {
    weekday = 3;
    hour = 12;
    minute = 0;
  } else if (niche === "tech_saas" || niche === "agency_marketing") {
    weekday = 2;
    hour = market.includes("uk") || market.includes("london") ? 10 : 9;
  }

  if (!isB2B && isWeekendFriendly) {
    const saturday = nextPreferredWeekday(6, 10, 0);
    if (saturday.getTime() - Date.now() < 3 * 24 * 60 * 60 * 1000) {
      return saturday;
    }
  }

  return nextPreferredWeekday(weekday, hour, minute);
}

// ── Dropdown component helper ─────────────────────────────────────────────────

interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  className?: string;
}

function SelectField({ label, value, onChange, options, className }: SelectFieldProps) {
  return (
    <div className={`mb-4 ${className ?? ""}`}>
      <label className="block text-[11px] font-bold text-[#475569] uppercase tracking-widest mb-1.5">
        {label}
      </label>
      <div className="relative group">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-[#CBD5E1] bg-white focus:border-[#0052FF] focus:ring-2 focus:ring-[#0052FF]/20 shadow-sm outline-none transition-all text-[13px] sm:text-sm font-semibold text-[#1A1D23] appearance-none cursor-pointer pr-10 hover:border-[#A8B7D1]"
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B] pointer-events-none group-focus-within:text-[#0052FF] transition-colors" />
      </div>
    </div>
  );
}

// ── Multi-select pill component ───────────────────────────────────────────────

interface MultiSelectPillsProps {
  label: string;
  options: { value: string; label: string }[];
  selected: string[];
  onChange: (values: string[]) => void;
}

function MultiSelectPills({ label, options, selected, onChange }: MultiSelectPillsProps) {
  const toggle = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <label className="text-[11px] font-bold text-[#475569] uppercase tracking-widest">
          {label}
        </label>
        {selected.length > 0 && (
          <span className="text-[10px] font-bold text-[#0052FF] bg-[#EEF3FF] px-2 py-0.5 rounded-full">
            {selected.length} selected
          </span>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const isSelected = selected.includes(opt.value);
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => toggle(opt.value)}
              className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold transition-all border shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0052FF]/15 ${
                isSelected
                  ? "bg-[#0052FF] text-white border-[#0052FF] shadow-sm"
                  : "bg-white text-[#475569] border-[#E2E8F0] hover:border-[#0052FF]/40 hover:text-[#0052FF] hover:bg-[#EEF3FF]"
              }`}
            >
              {opt.label}
              {isSelected && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#AAFF50] flex-shrink-0" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}



// ── Main Component ────────────────────────────────────────────────────────────

export function PostGeneratorPage() {
  const params = useParams();
  const routeAccountId = params?.id as string;
  const searchParams = useSearchParams();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const refImgInputRef = useRef<HTMLInputElement>(null);
  const generationAbortRef = useRef<AbortController | null>(null);

  // Form state
  const [formInput, setFormInput] = useState<PostGenerationInput>(DEFAULT_INPUT);

  const formAreaRef = useRef<HTMLDivElement>(null);
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!formAreaRef.current) return;
    const rect = formAreaRef.current.getBoundingClientRect();
    formAreaRef.current.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
    formAreaRef.current.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
  };

  // Pre-populate selectedTemplateId from URL ?templateId= query param
  useEffect(() => {
    const templateIdFromUrl = searchParams.get("templateId");
    if (templateIdFromUrl) {
      setFormInput((prev) => ({ ...prev, selectedTemplateId: templateIdFromUrl }));
    }
  }, [searchParams]);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState<InputStep>(1);

  // Modal state
  const [styleModalOpen, setStyleModalOpen] = useState(false);
  const [writingStyleModalOpen, setWritingStyleModalOpen] = useState(false);

  // Persona import state
  const [usePersonaImport, setUsePersonaImport] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  // Generation state machine
  const [view, setView] = useState<ViewState>("idle");
  const [lastInput, setLastInput] = useState<PostGenerationInput | null>(null);
  const [strategy, setStrategy] = useState<ContentStrategyOutput | null>(null);
  const [captionOutput, setCaptionOutput] = useState<CaptionGeneratorOutput | null>(null);
  const [usedTemplateName, setUsedTemplateName] = useState<string | undefined>(undefined);
  const [templateAICurated, setTemplateAICurated] = useState(false);
  const [imagePrompt, setImagePrompt] = useState<PosterPromptOutput | null>(null);
  const [postPackage, setPostPackage] = useState<PostPackage | null>(null);
  const [contentScore, setContentScore] = useState<ContentScore | null>(null);
  const [hooks, setHooks] = useState<HookOption[] | null>(null);
  const [pipelineStages, setPipelineStages] = useState<PipelineStage[]>(INITIAL_STAGES);
  const [error, setError] = useState<string | null>(null);
  const [imageGenError, setImageGenError] = useState<string | null>(null);
  const [isRemixing, setIsRemixing] = useState(false);
  const [isSavingToQueue, setIsSavingToQueue] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const [isPublishingNow, setIsPublishingNow] = useState(false);
  const [activeGenerationId, setActiveGenerationId] = useState<string | null>(null);

  const [historyItems, setHistoryItems] = useState<HistoryPostRecord[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const [hasPreviewSnapshot, setHasPreviewSnapshot] = useState(false);
  const [seedImported, setSeedImported] = useState(false);
  const [resolvedAccountId, setResolvedAccountId] = useState<string | null>(routeAccountId || null);
  const effectiveAccountId = resolvedAccountId;
  // Ref mirror so saveGenerationToDb always has the latest accountId without stale closures
  const resolvedAccountIdRef = useRef<string | null>(null);
  useEffect(() => { resolvedAccountIdRef.current = resolvedAccountId; }, [resolvedAccountId]);
  const suggestedScheduleIso = useMemo(() => {
    const basis = lastInput ?? formInput;
    if (!basis?.platforms?.length) return null;
    return getSuggestedSchedule(basis).toISOString();
  }, [formInput, lastInput]);

  useEffect(() => {
    let mounted = true;

    const resolveAccountId = async () => {
      if (routeAccountId) {
        setResolvedAccountId(routeAccountId);
        return;
      }

      try {
        const activeRes = await fetch("/api/accounts/active");
        if (activeRes.ok) {
          const activeData = await activeRes.json();
          if (mounted && typeof activeData?.accountId === "string" && activeData.accountId) {
            setResolvedAccountId(activeData.accountId);
            return;
          }
        }

        const accountsRes = await fetch("/api/accounts");
        if (accountsRes.ok) {
          const accountsData = await accountsRes.json();
          const firstAccountId = accountsData?.accounts?.[0]?._id;
          if (mounted && typeof firstAccountId === "string" && firstAccountId) {
            setResolvedAccountId(firstAccountId);
          }
        }
      } catch (error) {
        console.error("Failed to resolve active account:", error);
      }
    };

    resolveAccountId();

    return () => {
      mounted = false;
    };
  }, [routeAccountId]);

  const savePreviewSnapshot = React.useCallback(
    (snapshot: OutputPreviewSnapshot) => {
      try {
        localStorage.setItem(POST_GENERATOR_PREVIEW_KEY, JSON.stringify(snapshot));
        setHasPreviewSnapshot(true);
      } catch (err) {
        console.warn("Failed to save output preview snapshot:", err);
      }
    },
    []
  );

  const loadPreviewSnapshot = React.useCallback(() => {
    try {
      const raw = localStorage.getItem(POST_GENERATOR_PREVIEW_KEY);
      if (!raw) {
        savePreviewSnapshot(DUMMY_PREVIEW_SNAPSHOT);
        setPostPackage(normalizePostPackage(DUMMY_PREVIEW_SNAPSHOT.postPackage));
        setLastInput(DUMMY_PREVIEW_SNAPSHOT.input);
        setFormInput(DUMMY_PREVIEW_SNAPSHOT.input);
        setStrategy(DUMMY_PREVIEW_SNAPSHOT.strategy ?? null);
        setHooks(DUMMY_PREVIEW_SNAPSHOT.hooks ?? null);
        setContentScore(DUMMY_PREVIEW_SNAPSHOT.contentScore ?? null);
        setUsedTemplateName(DUMMY_PREVIEW_SNAPSHOT.usedTemplateName);
        setTemplateAICurated(DUMMY_PREVIEW_SNAPSHOT.templateAICurated === true);
        setImageGenError(DUMMY_PREVIEW_SNAPSHOT.imageGenError ?? null);
        setError(null);
        setView("output");
        return true;
      }
      const parsed = JSON.parse(raw) as OutputPreviewSnapshot;
      if (!parsed?.postPackage || !parsed?.input) {
        savePreviewSnapshot(DUMMY_PREVIEW_SNAPSHOT);
        setPostPackage(normalizePostPackage(DUMMY_PREVIEW_SNAPSHOT.postPackage));
        setLastInput(DUMMY_PREVIEW_SNAPSHOT.input);
        setFormInput(DUMMY_PREVIEW_SNAPSHOT.input);
        setStrategy(DUMMY_PREVIEW_SNAPSHOT.strategy ?? null);
        setHooks(DUMMY_PREVIEW_SNAPSHOT.hooks ?? null);
        setContentScore(DUMMY_PREVIEW_SNAPSHOT.contentScore ?? null);
        setUsedTemplateName(DUMMY_PREVIEW_SNAPSHOT.usedTemplateName);
        setTemplateAICurated(DUMMY_PREVIEW_SNAPSHOT.templateAICurated === true);
        setImageGenError(DUMMY_PREVIEW_SNAPSHOT.imageGenError ?? null);
        setError(null);
        setView("output");
        return true;
      }

      setPostPackage(normalizePostPackage(parsed.postPackage));
      setLastInput(parsed.input);
      setFormInput(parsed.input);
      setStrategy(parsed.strategy ?? null);
      setHooks(parsed.hooks ?? null);
      setContentScore(parsed.contentScore ?? null);
      setUsedTemplateName(parsed.usedTemplateName);
      setTemplateAICurated(parsed.templateAICurated === true);
      setImageGenError(parsed.imageGenError ?? null);
      setError(null);
      setView("output");
      setHasPreviewSnapshot(true);
      return true;
    } catch (err) {
      console.warn("Failed to load output preview snapshot:", err);
      savePreviewSnapshot(DUMMY_PREVIEW_SNAPSHOT);
      setPostPackage(normalizePostPackage(DUMMY_PREVIEW_SNAPSHOT.postPackage));
      setLastInput(DUMMY_PREVIEW_SNAPSHOT.input);
      setFormInput(DUMMY_PREVIEW_SNAPSHOT.input);
      setStrategy(DUMMY_PREVIEW_SNAPSHOT.strategy ?? null);
      setHooks(DUMMY_PREVIEW_SNAPSHOT.hooks ?? null);
      setContentScore(DUMMY_PREVIEW_SNAPSHOT.contentScore ?? null);
      setUsedTemplateName(DUMMY_PREVIEW_SNAPSHOT.usedTemplateName);
      setTemplateAICurated(DUMMY_PREVIEW_SNAPSHOT.templateAICurated === true);
      setImageGenError(DUMMY_PREVIEW_SNAPSHOT.imageGenError ?? null);
      setError(null);
      setView("output");
      return true;
    }
  }, [savePreviewSnapshot]);

  useEffect(() => {
    try {
      const exists = !!localStorage.getItem(POST_GENERATOR_PREVIEW_KEY);
      if (!exists) {
        savePreviewSnapshot(DUMMY_PREVIEW_SNAPSHOT);
      } else {
        setHasPreviewSnapshot(true);
      }
    } catch {
      setHasPreviewSnapshot(true);
    }
  }, [savePreviewSnapshot]);

  useEffect(() => {
    try {
      const rawSeed = localStorage.getItem(POST_GENERATOR_SEED_INPUT_KEY);
      if (!rawSeed) return;
      const parsedSeed = JSON.parse(rawSeed) as PostGenerationInput;
      if (!parsedSeed || typeof parsedSeed !== "object") return;

      // Validate imported seed shape
      const hasRequiredFields =
        typeof parsedSeed.objective === "string" &&
        Array.isArray(parsedSeed.platforms) &&
        parsedSeed.platforms.length > 0 &&
        typeof parsedSeed.coreMessage === "string";

      if (hasRequiredFields) {
        setFormInput((prev) => ({
          ...prev,
          ...parsedSeed,
          brandAssets: {
            ...prev.brandAssets,
            ...(parsedSeed.brandAssets ?? {}),
          },
        }));
        setCurrentStep(3);
        setSeedImported(true);
      } else {
        // Fallback to defaults with warning
        console.warn("[PostGenerator] Imported seed is malformed, using defaults");
        setError("Imported seed from Idea Finder was incomplete — using default values. Please review your inputs.");
        setSeedImported(true);
      }

      localStorage.removeItem(POST_GENERATOR_SEED_INPUT_KEY);
    } catch {
      // Ignore malformed seed payloads
      console.warn("[PostGenerator] Failed to parse seed from localStorage");
    }
  }, []);

  useEffect(() => {
    if (view !== "output" || !postPackage || !lastInput) return;
    savePreviewSnapshot({
      postPackage,
      input: lastInput,
      strategy,
      hooks,
      contentScore,
      usedTemplateName,
      templateAICurated,
      imageGenError,
    });
  }, [
    view,
    postPackage,
    lastInput,
    strategy,
    hooks,
    contentScore,
    usedTemplateName,
    templateAICurated,
    imageGenError,
    savePreviewSnapshot,
  ]);

  const fetchHistory = React.useCallback(async () => {
    if (!effectiveAccountId) return;
    setIsHistoryLoading(true);
    try {
      const res = await fetch(`/api/post-generation/save?accountId=${encodeURIComponent(effectiveAccountId)}&limit=20`);
      if (!res.ok) throw new Error("Failed to load history");
      const data = await res.json();
      const posts = Array.isArray(data?.posts) ? data.posts : [];

      const normalized: HistoryPostRecord[] = posts
        .map((post: unknown) => {
          if (typeof post !== "object" || post === null) return null;
          const asRecord = post as Record<string, unknown>;
          const id = normalizeMongoId(asRecord._id);
          if (!id) return null;
          return {
            ...(asRecord as Omit<HistoryPostRecord, "_id" | "createdAt" | "updatedAt">),
            _id: id,
            createdAt: typeof asRecord.createdAt === "string" ? asRecord.createdAt : new Date().toISOString(),
            updatedAt: typeof asRecord.updatedAt === "string" ? asRecord.updatedAt : new Date().toISOString(),
          };
        })
        .filter((p: HistoryPostRecord | null): p is HistoryPostRecord => p !== null);

      setHistoryItems(normalized);
    } catch (err) {
      console.error("History fetch failed:", err);
    } finally {
      setIsHistoryLoading(false);
    }
  }, [effectiveAccountId]);

  // Re-fetch history whenever the account ID resolves (fixes first-load empty state)
  useEffect(() => {
    if (effectiveAccountId) {
      fetchHistory();
    }
  }, [effectiveAccountId, fetchHistory]);

  // ── Form helpers ──────────────────────────────────────────────────────────

  const updateInput = (updates: Partial<PostGenerationInput>) => {
    setFormInput((prev) => ({ ...prev, ...updates }));
  };

  const handlePlatformToggle = (platform: PostPlatform) => {
    const current = formInput.platforms;
    if (current.includes(platform)) {
      const nextPlatforms = current.filter((p) => p !== platform);
      const nextStyleMap = { ...(formInput.platformWritingStyleIds ?? {}) };
      const nextTemplateMap = { ...(formInput.platformTemplateIds ?? {}) };
      delete nextStyleMap[platform];
      delete nextTemplateMap[platform];
      updateInput({
        platforms: nextPlatforms,
        platformWritingStyleIds: nextStyleMap,
        platformTemplateIds: nextTemplateMap,
      });
    } else {
      updateInput({ platforms: [...current, platform] });
    }
  };

  // ── Color palette helpers ─────────────────────────────────────────────────

  const handleAddColor = () => {
    if (formInput.brandAssets.colorPalette.length < 5) {
      const nextDefault =
        STARTER_BRAND_COLORS.find((color) => !formInput.brandAssets.colorPalette.includes(color)) ??
        STARTER_BRAND_COLORS[formInput.brandAssets.colorPalette.length % STARTER_BRAND_COLORS.length];

      updateInput({
        brandAssets: {
          ...formInput.brandAssets,
          colorPalette: [...formInput.brandAssets.colorPalette, nextDefault],
        },
      });
    }
  };

  const handleUpdateColor = (index: number, color: string) => {
    const newPalette = [...formInput.brandAssets.colorPalette];
    newPalette[index] = color;
    updateInput({ brandAssets: { ...formInput.brandAssets, colorPalette: newPalette } });
  };

  const handleRemoveColor = (index: number) => {
    const newPalette = formInput.brandAssets.colorPalette.filter((_, i) => i !== index);
    updateInput({ brandAssets: { ...formInput.brandAssets, colorPalette: newPalette } });
  };

  // ── Logo upload ───────────────────────────────────────────────────────────

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateInput({
          brandAssets: { ...formInput.brandAssets, logoUrl: reader.result as string },
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // ── Persona import ────────────────────────────────────────────────────────

  const handlePersonaImport = async (enabled: boolean) => {
    setUsePersonaImport(enabled);
    if (!enabled) {
      setImportStatus(null);
      return;
    }
    if (!effectiveAccountId) {
      setImportStatus("No account ID provided");
      return;
    }

    setIsImporting(true);
    setImportStatus(null);

    try {
      const res = await fetch(`/api/persona?accountId=${effectiveAccountId}`);
      if (!res.ok) {
        setImportStatus("No persona found for this account");
        return;
      }
      const data = await res.json();
      const p = data.persona;
      if (!p) {
        setImportStatus("No persona found — set up your Persona Builder first");
        return;
      }

      const updates: Partial<PostGenerationInput> = {};

      updates.objective = deriveObjective(p.primaryObjective);
      const audience = deriveTargetAudience(p.audienceRole, p.audienceSegments);
      updates.targetAudiences = [audience];
      if (audience === "custom") {
        updates.customAudience = [
          ...(Array.isArray(p.audienceRole) ? p.audienceRole : p.audienceRole ? [p.audienceRole] : []),
          ...(p.audienceSegments ?? [])
        ].filter(Boolean).join(", ");
      }
      const angle = deriveContentAngle(p.contentMix);
      if (angle) updates.contentAngles = [angle];

      updates.brandType = deriveBrandType(p.userRole ?? "", p.industry ?? "");
      updates.visualStyles = [deriveVisualStyle(p.brandArchetype, p.toneSliders)];
      const personaColors =
        p.colorPalette?.length ? p.colorPalette : p.brandColorHex ? [p.brandColorHex] : [];
      updates.brandAssets = {
        watermark: formInput.brandAssets.watermark,
        colorPalette: personaColors.length ? personaColors : formInput.brandAssets.colorPalette,
        fontFamily: p.fontFamily || formInput.brandAssets.fontFamily,
        logoUrl: p.logoUrl || formInput.brandAssets.logoUrl,
      };

      updates.tones = [deriveTone(p.toneSliders)];
      updates.ctas = [deriveCTA(p.conversionGoal)];
      updates.emojiLevel = deriveEmojiLevel(p.emojiUsage);

      updateInput(updates);
      setImportStatus(`Imported ${Object.keys(updates).length} fields from persona`);
    } catch {
      setImportStatus("Failed to import persona");
    } finally {
      setIsImporting(false);
    }
  };

  // ── Pipeline helpers ──────────────────────────────────────────────────────

  const updateStageStatus = (index: number, status: PipelineStage["status"]) => {
    setPipelineStages((prev) =>
      prev.map((stage, i) => (i === index ? { ...stage, status } : stage))
    );
  };

  const getCurrentStageIndex = () => {
    const activeIndex = pipelineStages.findIndex((s) => s.status === "active");
    if (activeIndex !== -1) return activeIndex;
    const errorIndex = pipelineStages.findIndex((s) => s.status === "error");
    if (errorIndex !== -1) return errorIndex;
    const allCompleted = pipelineStages.every((s) => s.status === "completed");
    if (allCompleted) return pipelineStages.length;
    return 0;
  };

  // ── Generation ────────────────────────────────────────────────────────────

  const handleGenerate = async (wizardInput: PostGenerationInput) => {
    // Cancel any previous in-flight generation
    generationAbortRef.current?.abort();
    const abortController = new AbortController();
    generationAbortRef.current = abortController;
    const { signal } = abortController;

    setLastInput(wizardInput);
    setView("generating");
    setError(null);
    setImageGenError(null);
    setUsedTemplateName(undefined);
    setTemplateAICurated(false);

    const hasLinkedIn = wizardInput.platforms.includes("linkedin");
    const hasX = wizardInput.platforms.includes("x");
    const hasInstagram = wizardInput.platforms.includes("instagram_post");
    const hasFacebook = wizardInput.platforms.includes("facebook");
    const hasThreads = wizardInput.platforms.includes("threads");
    const shouldGenerateImage = wizardInput.generateImage !== false;
    const dynamicStages = buildPipelineStages(wizardInput.platforms, shouldGenerateImage);
    setPipelineStages(dynamicStages.map((s, i) => i === 0 ? { ...s, status: "active" } : s));

    // Dynamic stage indices
    let offset = 2; // after strategist + captions
    const stageIdx = {
      strategist: 0,
      captions: 1,
      linkedInOptimizer: hasLinkedIn ? offset++ : -1,
      xOptimizer: hasX ? offset++ : -1,
      instagramOptimizer: hasInstagram ? offset++ : -1,
      facebookOptimizer: hasFacebook ? offset++ : -1,
      threadsOptimizer: hasThreads ? offset++ : -1,
      imagePrompt: shouldGenerateImage ? offset++ : -1,
      creativeDirector: shouldGenerateImage && POSTGEN_CREATIVE_DIRECTOR_STAGE ? offset++ : -1,
      imageRender: shouldGenerateImage ? offset : -1,
    };

    try {
      // ── Shell draft: create a DB record immediately so no generation is ever lost ──
      try {
        const shellId = await saveGenerationToDb(wizardInput, null, EMPTY_POST_PACKAGE, "draft");
        if (shellId) setActiveGenerationId(shellId);
      } catch (shellErr) {
        console.warn("[PostGenerator] Shell draft save failed (non-fatal):", shellErr);
      }

      // Stage 1: Strategist
      const strategyRes = await fetch("/api/post-generation/strategist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: wizardInput, accountId: effectiveAccountId, includePersona: usePersonaImport }),
        signal,
      });

      if (!strategyRes.ok) {
        const errBody = await strategyRes.json().catch(() => ({}));
        throw new Error((errBody as { error?: string }).error || `Strategy failed (${strategyRes.status})`);
      }
      const strategyJson = await strategyRes.json();
      const strategyData: ContentStrategyOutput = strategyJson.strategy;
      setStrategy(strategyData);

      updateStageStatus(stageIdx.strategist, "completed");
      updateStageStatus(stageIdx.captions, "active");

      // Stage 2: Captions
      const captionsRes = await fetch("/api/post-generation/captions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: wizardInput, strategy: strategyData, accountId: effectiveAccountId, includePersona: usePersonaImport }),
        signal,
      });

      if (!captionsRes.ok) {
        const errBody = await captionsRes.json().catch(() => ({}));
        throw new Error((errBody as { error?: string }).error || `Captions failed (${captionsRes.status})`);
      }
      const captionsJson = await captionsRes.json();
      const captionsData: CaptionGeneratorOutput = captionsJson.captions;
      setCaptionOutput(captionsData);
      if (captionsJson.usedTemplateName) setUsedTemplateName(captionsJson.usedTemplateName as string);
      setTemplateAICurated(captionsJson.templateAICurated === true);

      // Build captions record early so we can refine LinkedIn before image prompt
      const captionsRecord: Record<string, string> = Object.fromEntries(
        captionsData.captions.map((c) => [c.platform, c.caption])
      );

      updateStageStatus(stageIdx.captions, "completed");

      // Stage 2.5: LinkedIn Optimizer (conditional)
      let linkedInRefinedData: PostPackage["linkedInRefined"] | undefined = undefined;
      if (hasLinkedIn && captionsRecord["linkedin"]) {
        updateStageStatus(stageIdx.linkedInOptimizer, "active");
        try {
          const linkedInRefineRes = await fetch("/api/post-generation/linkedin-refine", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              caption: captionsRecord["linkedin"],
              input: wizardInput,
              strategy: strategyData,
              accountId: effectiveAccountId,
              includePersona: usePersonaImport,
            }),
            signal,
          });
          if (linkedInRefineRes.ok) {
            const refineJson = await linkedInRefineRes.json();
            captionsRecord["linkedin"] = refineJson.refinedCaption;
            linkedInRefinedData = {
               viralityScore: refineJson.viralityScore,
               qualityFlags: refineJson.qualityFlags,
             };
          }
        } catch (err) {
          console.warn("LinkedIn refine failed (non-fatal):", err);
        }
        updateStageStatus(stageIdx.linkedInOptimizer, "completed");
      }

      // Stage 2.6: X Optimizer (conditional)
      let xRefinedData: PostPackage["xRefined"] | undefined = undefined;
      if (hasX && captionsRecord["x"]) {
        updateStageStatus(stageIdx.xOptimizer, "active");
        try {
          const xRefineRes = await fetch("/api/post-generation/x-refine", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              caption: captionsRecord["x"],
              input: wizardInput,
              strategy: strategyData,
              accountId: effectiveAccountId,
              includePersona: usePersonaImport,
            }),
            signal,
          });
          if (xRefineRes.ok) {
            const refineJson = await xRefineRes.json();
            captionsRecord["x"] = refineJson.refinedPost;
            xRefinedData = {
              engagementScore: refineJson.engagementScore,
              qualityFlags: refineJson.qualityFlags,
            };
          }
        } catch (err) {
          console.warn("X refine failed (non-fatal):", err);
        }
        updateStageStatus(stageIdx.xOptimizer, "completed");
      }

      // Stage 2.7: Instagram Optimizer (conditional)
      let instagramRefinedData: PostPackage["instagramRefined"] | undefined = undefined;
      if (hasInstagram && captionsRecord["instagram_post"]) {
        updateStageStatus(stageIdx.instagramOptimizer, "active");
        try {
          const igRefineRes = await fetch("/api/post-generation/instagram-refine", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              caption: captionsRecord["instagram_post"],
              input: wizardInput,
              strategy: strategyData,
              accountId: effectiveAccountId,
              includePersona: usePersonaImport,
            }),
            signal,
          });
          if (igRefineRes.ok) {
            const refineJson = await igRefineRes.json();
            captionsRecord["instagram_post"] = refineJson.refinedCaption;
            instagramRefinedData = {
              engagementScore: refineJson.engagementScore,
              qualityFlags: refineJson.qualityFlags,
              postType: refineJson.postType,
            };
          }
        } catch (err) {
          console.warn("Instagram refine failed (non-fatal):", err);
        }
        updateStageStatus(stageIdx.instagramOptimizer, "completed");
      }

      // Stage 2.8: Facebook Optimizer (conditional)
      let facebookRefinedData: PostPackage["facebookRefined"] | undefined = undefined;
      if (hasFacebook && captionsRecord["facebook"]) {
        updateStageStatus(stageIdx.facebookOptimizer, "active");
        try {
          const fbRefineRes = await fetch("/api/post-generation/facebook-refine", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              caption: captionsRecord["facebook"],
              input: wizardInput,
              strategy: strategyData,
              accountId: effectiveAccountId,
              includePersona: usePersonaImport,
            }),
            signal,
          });
          if (fbRefineRes.ok) {
            const refineJson = await fbRefineRes.json();
            captionsRecord["facebook"] = refineJson.refinedPost;
            facebookRefinedData = {
              engagementScore: refineJson.engagementScore,
              qualityFlags: refineJson.qualityFlags,
            };
          }
        } catch (err) {
          console.warn("Facebook refine failed (non-fatal):", err);
        }
        updateStageStatus(stageIdx.facebookOptimizer, "completed");
      }

      // Stage 2.9: Threads Optimizer (conditional, reusing X optimizer for now)
      if (hasThreads && captionsRecord["threads"]) {
        updateStageStatus(stageIdx.threadsOptimizer, "active");
        try {
          const threadsRefineRes = await fetch("/api/post-generation/x-refine", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              caption: captionsRecord["threads"],
              input: wizardInput,
              strategy: strategyData,
              accountId: effectiveAccountId,
              includePersona: usePersonaImport,
            }),
            signal,
          });
          if (threadsRefineRes.ok) {
            const refineJson = await threadsRefineRes.json();
            captionsRecord["threads"] = refineJson.refinedPost;
          }
        } catch (err) {
          console.warn("Threads refine failed (non-fatal):", err);
        }
        updateStageStatus(stageIdx.threadsOptimizer, "completed");
      }

      let imagePromptData: PosterPromptOutput = {
        masterPrompt: "",
        posterPrompt: "",
        headline: strategyData.postAngle.slice(0, 72) || "Generated post",
        subtext: strategyData.visualIdea || strategyData.contentStructure,
        cta: wizardInput.ctas?.[0] && wizardInput.ctas[0] !== "none" ? CTA_LABELS[wizardInput.ctas[0]] : "Ready to publish",
        layout: "minimal_card",
        typographyStyle: "modern_sans",
        compositionNotes: "Caption-first post without generated image.",
      };
      let generatedVariations: ImageVariation[] = [];
      let creativeDirectorOutput: ImageCreativeDirectorOutput | undefined;

      if (shouldGenerateImage) {
        updateStageStatus(stageIdx.imagePrompt, "active");

        const imagePromptRes = await fetch("/api/post-generation/image-prompt", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ input: wizardInput, strategy: strategyData, accountId: effectiveAccountId, includePersona: usePersonaImport }),
          signal,
        });

        if (!imagePromptRes.ok) {
          const errBody = await imagePromptRes.json().catch(() => ({}));
          throw new Error((errBody as { error?: string }).error || `Image prompt failed (${imagePromptRes.status})`);
        }
        const imagePromptJson = await imagePromptRes.json();
        imagePromptData = imagePromptJson.imagePrompt;
        setImagePrompt(imagePromptData);

        updateStageStatus(stageIdx.imagePrompt, "completed");
        if (stageIdx.creativeDirector >= 0) {
          updateStageStatus(stageIdx.creativeDirector, "active");

          try {
            const creativeDirectorRes = await fetch("/api/post-generation/image-creative-director", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                input: wizardInput,
                strategy: strategyData,
                imagePrompt: imagePromptData,
              }),
              signal,
            });

            if (creativeDirectorRes.ok) {
              const creativeDirectorJson = await creativeDirectorRes.json();
              creativeDirectorOutput = creativeDirectorJson.creativeDirector;
            } else {
              const errBody = await creativeDirectorRes.json().catch(() => ({}));
              console.warn(
                "Creative director stage failed (non-fatal):",
                (errBody as { error?: string }).error || `creative director failed (${creativeDirectorRes.status})`
              );
            }
          } catch (creativeError) {
            if ((creativeError as Error)?.name !== "AbortError") {
              console.warn("Creative director stage error (non-fatal):", creativeError);
            }
          }

          updateStageStatus(stageIdx.creativeDirector, "completed");
        }
        updateStageStatus(stageIdx.imageRender, "active");

        try {
          const generateImageRes = await fetch("/api/post-generation/generate-image", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              posterOutput: imagePromptData,
              creativeDirector: creativeDirectorOutput,
              input: wizardInput,
              imageModel: wizardInput.imageModel,
              accountId: effectiveAccountId,
            }),
            signal,
          });

          if (generateImageRes.ok) {
            const imageGenJson = await generateImageRes.json();
            generatedVariations = imageGenJson.images ?? [];
          } else {
            const errBody = await generateImageRes.json().catch(() => ({}));
            const errMsg = (errBody as { error?: string }).error || `Image generation failed (${generateImageRes.status})`;
            setImageGenError(errMsg);
            console.warn("Image generation failed:", errMsg);
          }
        } catch (imageGenError) {
          if ((imageGenError as Error)?.name !== "AbortError") {
            const msg = imageGenError instanceof Error ? imageGenError.message : "Image generation error";
            setImageGenError(msg);
            console.warn("Image generation error (non-fatal):", imageGenError);
          }
        }

        updateStageStatus(stageIdx.imageRender, "completed");
      } else {
        setImagePrompt(null);
        setImageGenError(null);
      }

      const sizesRecord = Object.fromEntries(
        wizardInput.platforms.map((p) => [
          p,
          `${PLATFORM_INTELLIGENCE[p].imageSizes[0].width}x${PLATFORM_INTELLIGENCE[p].imageSizes[0].height}`,
        ])
      );

      let newPostPackage: PostPackage = normalizePostPackage({
        imagePrompt: imagePromptData.posterPrompt,
        imageUrl: generatedVariations[0]?.imageUrl,
        imageVariations: generatedVariations,
        captions: captionsRecord,
        captionOptions: Object.fromEntries(
          captionsData.captions.map((c) => [c.platform, c.options && c.options.length > 0 ? c.options : [c.caption]])
        ),
        hashtags: captionsData.hashtags,
        sizes: sizesRecord,
        headline: imagePromptData.headline,
        subtext: imagePromptData.subtext,
        cta: imagePromptData.cta,
        selectedImageVariationId: generatedVariations[0]?.id,
        designStyle: wizardInput.visualStyles[0] ?? "minimal",
        linkedInRefined: linkedInRefinedData,
        xRefined: xRefinedData,
        instagramRefined: instagramRefinedData,
        facebookRefined: facebookRefinedData,
      });

      let autoContentScore: ContentScore | null = null;
      if (POSTGEN_AUTO_ANALYTICS) {
        try {
          autoContentScore = await runAutoAnalytics(captionsRecord, imagePromptData.headline);
        } catch (scoreError) {
          console.warn("Auto analytics failed (non-fatal):", scoreError);
        }
      }

      if (autoContentScore) {
        newPostPackage = normalizePostPackage({
          ...newPostPackage,
          contentScore: autoContentScore,
        });
      }

      setPostPackage(newPostPackage);
      setContentScore(autoContentScore);
      savePreviewSnapshot({
        postPackage: newPostPackage,
        input: wizardInput,
        strategy: strategyData,
        hooks: null,
        contentScore: autoContentScore,
        usedTemplateName: captionsJson.usedTemplateName,
        templateAICurated: captionsJson.templateAICurated === true,
        imageGenError,
      });
      setView("output");

      // Update the existing shell draft with the completed output
      try {
        await saveGenerationToDb(wizardInput, strategyData, newPostPackage, "draft", null);
      } catch (saveErr) {
        console.error("Auto-save failed:", saveErr);
      }

      // Fire Hooks generation in background
      fetch("/api/post-generation/hooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: wizardInput, strategy: strategyData, accountId: effectiveAccountId, includePersona: usePersonaImport }),
      })
        .then((res) => res.json())
        .then(async (data) => {
          setHooks(data.hooks);
          const postWithHooks: PostPackage = normalizePostPackage({
            ...newPostPackage,
            hooks: data.hooks ?? undefined,
          });
          setPostPackage(postWithHooks);
          savePreviewSnapshot({
            postPackage: postWithHooks,
            input: wizardInput,
            strategy: strategyData,
            hooks: data.hooks ?? null,
            contentScore: autoContentScore,
            usedTemplateName: captionsJson.usedTemplateName,
            templateAICurated: captionsJson.templateAICurated === true,
            imageGenError,
          });
          try {
            await saveGenerationToDb(wizardInput, strategyData, postWithHooks, "draft");
          } catch (saveErr) {
            console.error("History save after hooks failed:", saveErr);
          }
        })
        .catch((err) => console.error("Failed to generate hooks:", err));
    } catch (err: unknown) {
      if ((err as Error)?.name === "AbortError") return; // generation was cancelled — no error to show
      console.error("Generation error:", err);
      setError(err instanceof Error ? err.message : "An unexpected error occurred during generation.");
      setView("idle");
      setPipelineStages((prev) =>
        prev.map((stage) => (stage.status === "active" ? { ...stage, status: "error" } : stage))
      );
    }
  };

  const handleSaveToQueue = async (updatedPackage?: PostPackage) => {
    const pkgToSave = updatedPackage ?? postPackage;
    if (!pkgToSave || !lastInput) return;
    setIsSavingToQueue(true);
    try {
      await saveGenerationToDb(lastInput, strategy, pkgToSave, "draft");
      router.push(`/${routeAccountId}/publishing`);
    } catch (err) {
      console.error("Save to queue error:", err);
    } finally {
      setIsSavingToQueue(false);
    }
  };

  const handleSchedulePost = async (scheduledIso: string, updatedPackage?: PostPackage) => {
    const pkgToSave = updatedPackage ?? postPackage;
    if (!pkgToSave || !lastInput) return;
    setIsScheduling(true);
    try {
      const scheduledId = await saveGenerationToDb(
        lastInput,
        strategy,
        pkgToSave,
        "scheduled",
        activeGenerationId,
        scheduledIso
      );

      if (!scheduledId) {
        throw new Error("Failed to schedule post");
      }

      setActiveGenerationId(scheduledId);
      await fetchHistory();
      router.push(`/${routeAccountId}/publishing`);
    } catch (err) {
      console.error("Schedule post error:", err);
    } finally {
      setIsScheduling(false);
    }
  };

  const handlePublishNow = async (updatedPackage?: PostPackage) => {
    const pkgToSave = updatedPackage ?? postPackage;
    if (!pkgToSave || !lastInput) return [];
    setIsPublishingNow(true);
    try {
      // Always save before publish to capture latest manual edits
      const publishId = await saveGenerationToDb(lastInput, strategy, pkgToSave, "draft", activeGenerationId);
      if (publishId) setActiveGenerationId(publishId);
      
      if (!publishId) return [{ platform: "all", success: false, error: "Could not save post before publishing" }];

      const res = await fetch(`/api/post-generation/publish/${publishId}`, { method: "POST" });
      const data = await res.json() as { results?: Array<{ platform: string; success: boolean; platformPostId?: string; error?: string }> };

      if (!res.ok) return [{ platform: "all", success: false, error: "Publish failed" }];

      const results = data.results ?? [];
      if (results.some((r) => r.success)) {
        await fetchHistory();
      }
      return results;
    } catch (err) {
      console.error("Publish now error:", err);
      return [{ platform: "all", success: false, error: "Network error" }];
    } finally {
      setIsPublishingNow(false);
    }
  };

  const handleRemix = async (caption: string, platform: string, style: RemixStyle) => {
    if (!postPackage) return;
    setIsRemixing(true);
    try {
      const res = await fetch("/api/post-generation/remix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caption, platform, remixStyle: style, accountId: effectiveAccountId }),
      });
      if (!res.ok) throw new Error("Failed to remix caption");
      const data = await res.json();
      const updatedPackage: PostPackage = normalizePostPackage({
        ...postPackage,
        captions: { ...postPackage.captions, [platform]: data.remixedCaption },
      });
      setPostPackage(updatedPackage);
      if (lastInput) {
        try {
          await saveGenerationToDb(lastInput, strategy, updatedPackage, "draft");
        } catch (saveErr) {
          console.error("Failed to persist remixed caption:", saveErr);
        }
      }
    } catch (err) {
      console.error("Remix error:", err);
    } finally {
      setIsRemixing(false);
    }
  };

  const requestContentScore = async (
    caption: string,
    platform: string,
    headline: string,
  ): Promise<ContentScore | null> => {
    const res = await fetch("/api/post-generation/score", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ caption, platform, headline }),
    });
    if (!res.ok) return null;
    const scoreJson = await res.json();
    return (scoreJson.score as ContentScore) ?? null;
  };

  const runAutoAnalytics = async (
    captions: Record<string, string>,
    headline: string,
  ): Promise<ContentScore | null> => {
    if (!POSTGEN_AUTO_ANALYTICS) return null;

    const scoredEntries = await Promise.all(
      Object.entries(captions).map(async ([platform, caption]) => {
        if (!caption) return null;
        const score = await requestContentScore(caption, platform, headline);
        if (!score) return null;
        return [platform as PostPlatform, score] as const;
      }),
    );

    const map = Object.fromEntries(
      scoredEntries.filter((entry): entry is readonly [PostPlatform, ContentScore] => entry !== null),
    ) as Partial<Record<PostPlatform, ContentScore>>;

    return aggregatePlatformScores(map);
  };

  const handleRetry = () => {
    if (lastInput) {
      handleGenerate(lastInput);
    } else {
      setView("idle");
    }
  };

  const handleCancelGeneration = () => {
    generationAbortRef.current?.abort();
    generationAbortRef.current = null;
    setView("idle");
    setPipelineStages(INITIAL_STAGES);
    setImageGenError(null);
  };

  const loadHistoryItem = async (id: string) => {
    try {
      const res = await fetch(`/api/post-generation/save/${id}`);
      if (!res.ok) throw new Error("Failed to load history item");
      const data = await res.json();
      const post = data?.post as HistoryPostRecord | undefined;
      if (!post) return;

      setActiveGenerationId(id);
      setLastInput(post.input ?? null);
      setFormInput(post.input ?? DEFAULT_INPUT);
      setStrategy(post.strategy ?? null);
      setPostPackage(post.output ? normalizePostPackage(post.output) : null);
      setHooks(post.output?.hooks ?? null);
      setContentScore(post.output?.contentScore ?? null);
      setImageGenError(null);
      setError(null);
      setView(post.output ? "output" : "idle");
      setIsHistoryOpen(false);

      if (post.output) {
        savePreviewSnapshot({
          postPackage: normalizePostPackage(post.output),
          input: post.input ?? DEFAULT_INPUT,
          strategy: post.strategy ?? null,
          hooks: post.output.hooks ?? null,
          contentScore: post.output.contentScore ?? null,
          usedTemplateName,
          templateAICurated,
          imageGenError: null,
        });
      }
    } catch (err) {
      console.error("Failed to load history item:", err);
    }
  };

  const handleDeleteHistoryItem = async (id: string) => {
    try {
      const res = await fetch(`/api/post-generation/save/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setHistoryItems((prev) => prev.filter((item) => item._id !== id));
      if (activeGenerationId === id) setActiveGenerationId(null);
    } catch (err) {
      console.error("Failed to delete history item:", err);
    }
  };

  const handleSelectImageVariation = async (variationId: number) => {
    if (!postPackage || !lastInput) return;

    const selectedVariation = postPackage.imageVariations?.find((item) => item.id === variationId);
    const updatedPackage: PostPackage = normalizePostPackage({
      ...postPackage,
      selectedImageVariationId: variationId,
      ...(selectedVariation ? { imageUrl: selectedVariation.imageUrl } : {}),
    });

    setPostPackage(updatedPackage);
    savePreviewSnapshot({
      postPackage: updatedPackage,
      input: lastInput,
      strategy,
      hooks,
      contentScore,
      usedTemplateName,
      templateAICurated,
      imageGenError,
    });

    try {
      await saveGenerationToDb(lastInput, strategy, updatedPackage, "draft");
    } catch (saveErr) {
      console.error("Failed to persist selected variation:", saveErr);
    }
  };

  const saveGenerationToDb = React.useCallback(
    async (
      input: PostGenerationInput,
      strategyData: ContentStrategyOutput | null,
      output: PostPackage,
      status: "draft" | "scheduled" | "published" = "draft",
      existingId?: string | null,
      scheduledDate?: string
    ): Promise<string | null> => {
      // Use ref so we always have the latest accountId even if effectiveAccountId
      // hasn't propagated into this useCallback closure yet (async race fix)
      const accountId = resolvedAccountIdRef.current ?? effectiveAccountId;
      if (!accountId) {
        console.warn("[PostGenerator] saveGenerationToDb skipped — accountId not yet resolved");
        return null;
      }

      const safeInput = sanitizeInputForPersistence(input);
      const mergedOutput = mergePostPackageForPersistence(output, hooks, contentScore);
      const safeOutput = sanitizeOutputForPersistence(mergedOutput);

      const targetId = existingId ?? activeGenerationId;

      const body = {
        accountId,
        input: safeInput,
        design: {
          brandColors: safeInput.brandAssets.colorPalette,
          fontFamily: safeInput.brandAssets.fontFamily ?? "Inter",
          visualStyle: safeInput.visualStyles[0] ?? "minimal",
          logoUrl: safeInput.brandAssets.logoUrl,
        },
        ...(strategyData ? { strategy: strategyData } : {}),
        output: safeOutput,
        variations: [],
        status,
        ...(scheduledDate ? { scheduledDate } : {}),
      };

      if (targetId) {
        const res = await fetch(`/api/post-generation/save/${targetId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status,
            input: safeInput,
            ...(strategyData ? { strategy: strategyData } : {}),
            output: safeOutput,
            variations: [],
            ...(scheduledDate ? { scheduledDate } : {}),
          }),
        });

        if (!res.ok) {
          const errPayload = await res.json().catch(() => ({}));
          throw new Error((errPayload as { error?: string }).error ?? "Failed to update post history item");
        }
        await fetchHistory();
        return targetId;
      } else {
        const res = await fetch("/api/post-generation/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) {
          const errPayload = await res.json().catch(() => ({}));
          throw new Error((errPayload as { error?: string }).error ?? "Failed to save post history item");
        }
        const data = await res.json();
        if (typeof data?.id === "string") {
          setActiveGenerationId(data.id);
          await fetchHistory();
          return data.id;
        }
        await fetchHistory();
        return null;
      }
    },
    [effectiveAccountId, activeGenerationId, contentScore, fetchHistory, hooks]
  );

  const handleNewPost = () => {
    generationAbortRef.current?.abort();
    setView("idle");
    setPostPackage(null);
    setHooks(null);
    setContentScore(null);
    setError(null);
    setImageGenError(null);
    setStrategy(null);
    setCaptionOutput(null);
    setImagePrompt(null);
    setLastInput(null);
    setUsedTemplateName(undefined);
    setTemplateAICurated(false);
    setPipelineStages(INITIAL_STAGES);
    setFormInput(DEFAULT_INPUT);
    setCurrentStep(1);
    setActiveGenerationId(null);
  };

  const canGenerate = formInput.coreMessage.trim().length > 0 && formInput.platforms.length > 0;
  const canGoStep2 = canGenerate;
  const canGoStep3 = canGoStep2;

  const steps = useMemo(
    () => [
      { id: 1 as const, title: "Core Brief", subtitle: "Message + platforms" },
      { id: 2 as const, title: "Content & Style", subtitle: "Generation details" },
      { id: 3 as const, title: "Brand Assets", subtitle: "Colors, logo, persona" },
    ],
    []
  );

  // ── Text block helpers ────────────────────────────────────────────────────

  const addTextBlock = () => {
    const newBlock: PostTextBlock = {
      id: Date.now().toString(),
      label: "Title",
      text: "",
    };
    updateInput({ textBlocks: [...(formInput.textBlocks ?? []), newBlock] });
  };

  const updateTextBlock = (id: string, changes: Partial<PostTextBlock>) => {
    updateInput({
      textBlocks: (formInput.textBlocks ?? []).map((b) =>
        b.id === id ? { ...b, ...changes } : b
      ),
    });
  };

  const removeTextBlock = (id: string) => {
    updateInput({ textBlocks: (formInput.textBlocks ?? []).filter((b) => b.id !== id) });
  };

  // ── Reference image helpers ───────────────────────────────────────────────

  const handleReferenceImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newImg: ReferenceImage = {
          id: Date.now().toString() + Math.random().toString(36).slice(2),
          label: file.name.replace(/\.[^/.]+$/, ""),
          dataUrl: reader.result as string,
        };
        updateInput({ referenceImages: [...(formInput.referenceImages ?? []), newImg] });
      };
      reader.readAsDataURL(file);
    });
    // Reset input so same file can be re-added
    if (e.target) e.target.value = "";
  };

  const updateReferenceImageLabel = (id: string, label: string) => {
    updateInput({
      referenceImages: (formInput.referenceImages ?? []).map((img) =>
        img.id === id ? { ...img, label } : img
      ),
    });
  };

  const removeReferenceImage = (id: string) => {
    updateInput({ referenceImages: (formInput.referenceImages ?? []).filter((img) => img.id !== id) });
  };

  // ── Options arrays for dropdowns ──────────────────────────────────────────

  const objectiveOptions = (
    Object.entries(POST_OBJECTIVE_LABELS) as [PostObjective, { label: string; emoji: string }][]
  ).map(([key, { label }]) => ({ value: key, label }));

  const audienceOptions = (
    Object.entries(TARGET_AUDIENCE_LABELS) as [TargetAudience, string][]
  ).map(([key, label]) => ({ value: key, label }));

  const contentAngleOptions = [
    { value: "", label: "— None —" },
    ...(Object.entries(CONTENT_ANGLE_LABELS) as [ContentAngle, { label: string; desc: string }][]).map(
      ([key, { label }]) => ({ value: key, label })
    ),
  ];

  const toneOptions = (
    Object.entries(TONE_LABELS) as [ToneType, { label: string; desc: string }][]
  ).map(([key, { label }]) => ({ value: key, label }));

  const ctaOptions = (
    Object.entries(CTA_LABELS) as [CTAType, string][]
  ).map(([key, label]) => ({ value: key, label }));

  const intensityOptions: { value: IntensityLevel; label: string }[] = [
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
  ];

  const brandTypeOptions = (
    Object.entries(BRAND_TYPE_LABELS) as [BrandType, string][]
  ).map(([key, label]) => ({ value: key, label }));

  const visualStyleOptions = (
    Object.entries(VISUAL_STYLE_LABELS) as [VisualStyle, { label: string; desc: string }][]
  ).map(([key, { label }]) => ({ value: key, label }));

  const imageGenTypeOptions = (
    Object.entries(IMAGE_GEN_TYPE_LABELS) as [ImageGenType, { label: string; desc: string }][]
  ).map(([key, { label }]) => ({ value: key, label }));

  const imageModelOptions = (
    Object.entries(IMAGE_MODEL_LABELS) as [GeminiImageModel, { label: string; desc: string; badge: string }][]
  ).map(([key, { label, badge }]) => ({ value: key, label: `${label} (${badge})` }));

  const fontOptions = FONTS.map((f) => ({ value: f, label: f }));

  // Creative Engine option arrays
  const nicheOptions = [
    { value: "", label: "— Auto —" },
    ...(Object.entries(NICHE_CATEGORY_LABELS) as [NicheCategory, { label: string; emoji: string }][]).map(
      ([key, { label, emoji }]) => ({ value: key, label: `${emoji} ${label}` })
    ),
  ];

  const postIntentOptions = [
    { value: "", label: "— Auto —" },
    ...(Object.entries(POST_INTENT_LABELS) as [PostIntent, { label: string; desc: string; emoji: string }][]).map(
      ([key, { label, emoji }]) => ({ value: key, label: `${emoji} ${label}` })
    ),
  ];

  const lightingOptions = [
    { value: "", label: "— Auto —" },
    ...(Object.entries(LIGHTING_DIRECTION_LABELS) as [LightingDirection, { label: string; desc: string }][]).map(
      ([key, { label }]) => ({ value: key, label })
    ),
  ];

  const shadingOptions = [
    { value: "", label: "— Auto —" },
    ...(Object.entries(SHADING_STYLE_LABELS) as [ShadingStyle, { label: string; desc: string }][]).map(
      ([key, { label }]) => ({ value: key, label })
    ),
  ];

  const imageStyleOptions = [
    { value: "", label: "— Auto —" },
    ...(Object.entries(IMAGE_STYLE_LABELS) as [ImageStyle, { label: string; desc: string }][]).map(
      ([key, { label }]) => ({ value: key, label })
    ),
  ];

  const compositionOptions = [
    { value: "", label: "— Auto —" },
    ...(Object.entries(COMPOSITION_PREFERENCE_LABELS) as [CompositionPreference, { label: string; desc: string }][]).map(
      ([key, { label }]) => ({ value: key, label })
    ),
  ];

  const textStyleOptions = [
    { value: "", label: "— Auto —" },
    ...(Object.entries(TEXT_STYLE_PREFERENCE_LABELS) as [TextStylePreference, { label: string; desc: string }][]).map(
      ([key, { label }]) => ({ value: key, label })
    ),
  ];

  const colorThemeOptions = [
    { value: "", label: "— Auto —" },
    ...(Object.entries(COLOR_THEME_PRESET_LABELS) as [ColorThemePreset, { label: string; desc: string }][]).map(
      ([key, { label }]) => ({ value: key, label })
    ),
  ];

  const captionStyleOptions = [
    { value: "", label: "— Auto —" },
    ...(Object.entries(CAPTION_STYLE_LABELS) as [CaptionStylePreference, { label: string; desc: string }][]).map(
      ([key, { label }]) => ({ value: key, label })
    ),
  ];

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div 
      ref={formAreaRef}
      onMouseMove={handleMouseMove}
      className="min-h-screen bg-gradient-to-br from-[#E2EFFF] to-[#C7DEFF] font-sans text-[#1A1D23] relative overflow-hidden group/page"
    >
      <div 
        className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-500 opacity-50 group-hover/page:opacity-100"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='30' height='30' viewBox='0 0 30 30' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M14 14V0h2v14h14v2H16v14h-2V16H0v-2h14z' fill='%230052FF' fill-opacity='0.12' fill-rule='evenodd'/%3E%3C/svg%3E")`,
          backgroundSize: '30px 30px',
          maskImage: 'radial-gradient(800px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), black 0%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(800px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), black 0%, transparent 80%)',
        }}
      />
      <div className="relative z-10 w-full h-full">
      {view === "generating" ? (
        <GenerationExperience
          stages={pipelineStages}
          currentStage={getCurrentStageIndex()}
          onCancel={handleCancelGeneration}
        />
      ) : view !== "output" ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="max-w-2xl mx-auto mb-5 flex flex-col sm:flex-row sm:items-center sm:justify-end gap-2">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsHistoryOpen((prev) => !prev);
                  if (!isHistoryOpen) {
                    fetchHistory();
                  }
                }}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-[#E2E8F0] bg-white text-xs font-bold text-[#1A1D23] hover:border-[#0052FF]/30 hover:text-[#0052FF]"
              >
                <History className="w-3.5 h-3.5" />
                History
              </button>
              <button
                type="button"
                onClick={loadPreviewSnapshot}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-[#E2E8F0] bg-white text-xs font-bold text-[#1A1D23] hover:border-[#0052FF]/30 hover:text-[#0052FF]"
              >
                <History className="w-3.5 h-3.5" />
                {hasPreviewSnapshot ? "Open Last Preview" : "Open Preview Demo"}
              </button>
            </div>
          </div>



          {/* Seed Imported Banner */}
          {seedImported && (
            <div className="max-w-2xl mx-auto mb-4">
              <div className="flex items-center gap-3 px-5 py-3 bg-[#0052FF]/5 border border-[#0052FF]/20 rounded-2xl">
                <Sparkles className="w-4 h-4 text-[#0052FF] shrink-0" />
                <p className="text-[13px] font-semibold text-[#0052FF] flex-1">
                  Seed imported from Idea Finder — review your inputs and generate when ready.
                </p>
                <button
                  type="button"
                  onClick={() => setSeedImported(false)}
                  className="text-[#0052FF]/50 hover:text-[#0052FF] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="max-w-3xl mx-auto overflow-hidden rounded-[36px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.9),rgba(255,255,255,0.76))] shadow-[0_40px_100px_rgba(15,23,42,0.10)] backdrop-blur-xl"
            >
              <div className="border-b border-[#E2E8F0]/80 bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(238,243,255,0.76))] px-6 py-6 rounded-t-[36px]">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-[linear-gradient(135deg,#111827,#0052FF)] shadow-[0_10px_25px_rgba(0,82,255,0.25)]">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#94A3B8]">Build</p>
                      <h2 className="text-[22px] font-black text-[#1A1D23]">{steps[currentStep - 1].title}</h2>
                      <p className="text-[13px] text-[#64748B]">{steps[currentStep - 1].subtitle}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setAdvancedOpen(true)}
                    className="self-start rounded-full border border-[#D8E0EC] bg-white/90 px-3.5 py-2 text-[13px] font-bold text-[#475569] transition-colors hover:border-[#0052FF]/30 hover:text-[#0052FF] sm:self-auto"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    Advanced
                  </button>
                </div>

                {/* Integrated stepper */}
                <div className="flex flex-wrap items-center gap-2">
                  {steps.map((step) => {
                    const active = currentStep === step.id;
                    const done = currentStep > step.id;
                    const canClick = (step.id === 2 && canGoStep2) || (step.id === 3 && canGoStep3) || step.id === 1;
                    return (
                      <button
                        key={step.id}
                        type="button"
                        disabled={!canClick && !done}
                        onClick={() => {
                          if (step.id === 2 && !canGoStep2) return;
                          if (step.id === 3 && !canGoStep3) return;
                          setCurrentStep(step.id);
                        }}
                        className={`relative flex items-center gap-2 px-4 py-2 rounded-full border text-[13px] font-bold transition-all ${
                          active
                            ? "border-[#BFD2FF] text-[#0F172A] bg-[#F8FBFF] shadow-sm"
                            : done || canClick
                              ? "border-[#E2E8F0] text-[#64748B] bg-white hover:border-[#CBD5E1]"
                              : "border-[#F1F5F9] text-[#94A3B8] bg-[#F8FAFD] cursor-not-allowed"
                        }`}
                      >
                        <span
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold transition-colors ${
                            active
                              ? "bg-[#EEF3FF] text-[#0052FF]"
                              : done
                                ? "bg-[#EEF3FF] text-[#0052FF]"
                                : "bg-[#F1F5F9] text-[#94A3B8]"
                          }`}
                        >
                          {done ? "✓" : step.id}
                        </span>
                        <span>{step.title}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="px-5 sm:px-6 py-6 space-y-6">
                {currentStep === 1 && (
                <>
                  {/* Core Message - Enhanced */}
                  <div className="relative">
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <label className="text-[12px] font-bold text-[#475569] uppercase tracking-widest flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-[#0052FF]" />
                        Core Message <span className="text-red-500 normal-case">*</span>
                      </label>
                      <div className="text-[12px] font-bold text-[#0052FF]">
                        {formInput.coreMessage.length} chars
                      </div>
                    </div>
                      <p className="text-[14px] text-[#64748B] mb-4">What's the one idea you want people to remember?</p>
                      <textarea
                        value={formInput.coreMessage}
                        onChange={(e) => updateInput({ coreMessage: e.target.value })}
                        placeholder="Write your post idea..."
                        className="w-full h-24 border-0 outline-none bg-transparent resize-none text-[15px] text-[#1A1D23] placeholder-[#94A3B8] leading-relaxed"
                      />
                    </div>

                  {/* Platforms - Enhanced */}
                  <div>
                    <label className="text-[12px] font-bold text-[#475569] uppercase tracking-widest mb-4 flex items-center gap-2">
                      <LayoutGrid className="w-3.5 h-3.5 text-[#0052FF]" />
                      Platforms <span className="text-red-500 normal-case">*</span>
                    </label>
                    <div className="flex flex-wrap gap-3">
                      {ALL_PLATFORMS.map((platform) => {
                        const isSelected = formInput.platforms.includes(platform);
                        const brand = PLATFORM_BRANDS[platform];
                        return (
                          <button
                            key={platform}
                            type="button"
                            onClick={() => handlePlatformToggle(platform)}
                            title={brand.label}
                            className={`group relative flex items-center gap-3 px-4 py-3 rounded-full border transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-[#0052FF]/20 ${
                              isSelected
                                ? "border-[#BFD2FF] bg-[#F8FBFF] shadow-sm"
                                : "bg-white border-[#E2E8F0] hover:border-[#CBD5E1]"
                            }`}
                          >
                            <span
                              className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E2E8F0] bg-[#F9FAFB]"
                              style={{ color: brand.color }}
                            >
                              <PlatformLogo platform={platform} className="h-4 w-4" />
                            </span>
                            <span className={`text-[14px] font-bold ${isSelected ? "text-[#111827]" : "text-[#475569]"}`}>
                              {brand.label}
                            </span>
                            <span
                              className={`ml-auto h-2.5 w-2.5 rounded-full transition-opacity ${
                                isSelected ? "opacity-100" : "opacity-30 group-hover:opacity-60"
                              }`}
                              style={{ backgroundColor: brand.color }}
                            />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}

              {currentStep === 2 && (
                <>
                  <div className="rounded-2xl border border-[#E2E8F0] bg-white p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-[13px] font-bold text-[#111827]">Generate post image</p>
                        <p className="text-[11px] text-[#64748B] mt-1">When this is off, ReachPilot builds captions only and hides the visual controls.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          updateInput({
                            generateImage: !(formInput.generateImage !== false),
                            generationFocus: formInput.generateImage === false ? "balanced" : "caption",
                          })
                        }
                        className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-300 ${
                          formInput.generateImage !== false ? "bg-[#2563EB]" : "bg-gray-200"
                        }`}
                      >
                        <span
                          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-300 ${
                            formInput.generateImage !== false ? "translate-x-8" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  <SelectField
                    label="Objective"
                    value={formInput.objective}
                    onChange={(v) => updateInput({ objective: v as PostObjective })}
                    options={objectiveOptions}
                  />

                  <div className="bg-[#F8FAFD] rounded-2xl border border-[#E2E8F0] p-4">
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3">
                      Generation Focus
                    </label>
                    <div className="bg-white p-1.5 rounded-xl flex items-center gap-1 border border-[#E2E8F0]">
                      {(["caption", "balanced", "image"] as const)
                        .filter((focus) => formInput.generateImage !== false || focus !== "image")
                        .map((focus) => {
                        const isActive = (formInput.generationFocus ?? "balanced") === focus;
                        const labels = { caption: "Caption", balanced: "Balanced", image: "Image" };
                        return (
                          <button
                            key={focus}
                            type="button"
                            onClick={() => updateInput({ generationFocus: focus })}
                            className={`relative flex-1 py-2.5 rounded-lg text-[13px] font-bold transition-all ${
                              isActive ? "bg-[#0052FF] text-white" : "text-[#64748B] hover:text-[#1A1D23]"
                            }`}
                          >
                            {labels[focus]}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {formInput.generateImage !== false && (
                    <>
                  <div className="grid gap-4 md:grid-cols-2">
                    <SelectField
                      label="Image Model"
                      value={formInput.imageModel ?? "gemini-2.5-flash-image"}
                      onChange={(v) => updateInput({ imageModel: v as GeminiImageModel })}
                      options={imageModelOptions}
                    />
                    <SelectField
                      label="Image Generation"
                      value={formInput.imageGenType}
                      onChange={(v) => updateInput({ imageGenType: v as ImageGenType })}
                      options={imageGenTypeOptions}
                    />
                  </div>

                  <div className="bg-[#F8FAFD] rounded-2xl border border-[#E2E8F0] p-4">
                    <label className="block text-[11px] font-bold text-[#1A1D23] uppercase tracking-widest mb-2">
                      Image Concept
                    </label>
                    <p className="text-[11px] text-[#64748B] mb-2">Describe the setting, subject, and style. Example: “Minimal desk setup, soft shadows, clean tech vibe.”</p>
                    <textarea
                      value={formInput.imageConcept ?? ""}
                      onChange={(e) => updateInput({ imageConcept: e.target.value || undefined })}
                      placeholder="Describe the visual you have in mind..."
                      className="w-full h-[72px] border-0 outline-none bg-transparent resize-none text-sm text-[#1A1D23] placeholder-gray-400 p-0"
                    />
                  </div>

                  <div className="bg-[#F8FAFD] rounded-2xl border border-[#E2E8F0] p-4">
                    <label className="block text-[11px] font-bold text-[#1A1D23] uppercase tracking-widest mb-2">
                      Post Text
                    </label>
                    <p className="text-[11px] text-[#64748B] mb-3">Optional headline/body snippets for overlays.</p>
                    <div className="space-y-3">
                      {(formInput.textBlocks ?? []).map((block) => (
                        <div key={block.id} className="flex flex-col gap-2 p-3.5 bg-white rounded-xl border border-[#E2E8F0]">
                          <div className="flex items-center justify-between">
                            <select
                              value={block.label}
                              onChange={(e) => updateTextBlock(block.id, { label: e.target.value })}
                              className="px-2.5 py-1.5 rounded-lg border border-[#E2E8F0] bg-white text-[11px] font-bold text-[#1A1D23]"
                            >
                              {[
                                "Title",
                                "Subtitle",
                                "Caption",
                                "Body",
                                "Tagline",
                                "CTA Text",
                              ].map((lbl) => (
                                <option key={lbl} value={lbl}>
                                  {lbl}
                                </option>
                              ))}
                            </select>
                            <button
                              type="button"
                              onClick={() => removeTextBlock(block.id)}
                              className="w-6 h-6 flex items-center justify-center text-[#64748B] hover:bg-red-50 hover:text-red-500 rounded-md transition-colors"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <input
                            type="text"
                            value={block.text}
                            onChange={(e) => updateTextBlock(block.id, { text: e.target.value })}
                            placeholder={`Enter ${block.label.toLowerCase()}...`}
                            className="w-full px-3 py-2.5 rounded-lg border border-[#E2E8F0] bg-white text-[13px] text-[#1A1D23] outline-none placeholder-gray-400"
                          />
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={addTextBlock}
                      className="mt-3 w-full flex items-center justify-center gap-1.5 py-3 rounded-xl border border-dashed border-[#0052FF]/30 bg-white text-[12px] font-bold text-[#0052FF] hover:border-[#AAFF50] hover:bg-[#AAFF50]/10"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Text Block
                    </button>
                  </div>

                  <div className="bg-[#F8FAFD] rounded-2xl border border-[#E2E8F0] p-4">
                    <label className="block text-[11px] font-bold text-[#1A1D23] uppercase tracking-widest mb-1">
                      Reference Images
                    </label>
                    <p className="text-[11px] text-[#64748B] mb-3">Add people/products/objects to include.</p>
                    <input
                      ref={refImgInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleReferenceImageUpload}
                    />
                    {(formInput.referenceImages ?? []).length > 0 && (
                      <div className="space-y-3 mb-3">
                        {(formInput.referenceImages ?? []).map((img) => (
                          <div key={img.id} className="flex items-center gap-3 p-2 bg-white rounded-xl border border-[#E2E8F0]">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={img.dataUrl} alt={img.label} className="w-12 h-12 rounded-lg object-cover border border-[#E2E8F0]" />
                            <input
                              type="text"
                              value={img.label}
                              onChange={(e) => updateReferenceImageLabel(img.id, e.target.value)}
                              className="flex-1 px-3 py-2 rounded-lg border border-[#E2E8F0] bg-white text-[13px] text-[#1A1D23] outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => removeReferenceImage(img.id)}
                              className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-[#64748B] hover:bg-red-50 hover:text-red-500 rounded-lg"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => refImgInputRef.current?.click()}
                      className="w-full flex items-center justify-center gap-1.5 py-3 rounded-xl border border-dashed border-[#E2E8F0] bg-white text-[12px] font-bold text-[#64748B] hover:border-[#AAFF50] hover:bg-[#AAFF50]/10"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Reference Image
                    </button>
                  </div>
                    </>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setStyleModalOpen(true)}
                      className="flex items-center justify-center gap-2 bg-white rounded-2xl border border-[#E2E8F0] p-3 text-[13px] font-bold text-[#1A1D23] hover:border-[#0052FF]/30"
                    >
                      <Palette className="w-4 h-4 text-[#0052FF]" /> Visual Style
                    </button>
                    <button
                      type="button"
                      onClick={() => setWritingStyleModalOpen(true)}
                      className="flex items-center justify-center gap-2 bg-white rounded-2xl border border-[#E2E8F0] p-3 text-[13px] font-bold text-[#1A1D23] hover:border-[#0052FF]/30"
                    >
                      <PenLine className="w-4 h-4 text-[#0052FF]" /> Writing Style
                    </button>
                  </div>
                </>
              )}

              {currentStep === 3 && (
                <>
                  <div className="bg-[#F8FAFD] rounded-2xl border border-[#E2E8F0] p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[13px] font-bold text-gray-800">Import from Persona</p>
                        <p className="text-[11px] text-gray-500 mt-0.5">Auto-fill your brand assets and style.</p>
                      </div>
                      <button
                        onClick={() => handlePersonaImport(!usePersonaImport)}
                        disabled={isImporting}
                        className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-300 ${
                          usePersonaImport ? "bg-[#0052FF]" : "bg-gray-200"
                        } ${isImporting ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        <span
                          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-300 ${
                            usePersonaImport ? "translate-x-8" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>
                    {isImporting && <p className="text-[12px] font-semibold text-gray-500 mt-3">Importing...</p>}
                    {importStatus && !isImporting && <p className="text-[12px] mt-3 font-semibold text-[#64748B]">{importStatus}</p>}
                  </div>

                  <div className="bg-[#F8FAFD] rounded-2xl border border-[#E2E8F0] p-4 space-y-4">
                    <div>
                      <label className="block text-[11px] font-bold text-[#64748B] uppercase tracking-widest mb-2">Brand Logo</label>
                      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                      {formInput.brandAssets.logoUrl ? (
                        <div className="flex items-center gap-3">
                          <div className="w-16 h-16 rounded-xl border border-[#E2E8F0] bg-white flex items-center justify-center overflow-hidden">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={formInput.brandAssets.logoUrl} alt="Brand logo" className="max-w-full max-h-full object-contain p-1.5" />
                          </div>
                          <button
                            type="button"
                            onClick={() => updateInput({ brandAssets: { ...formInput.brandAssets, logoUrl: undefined } })}
                            className="px-3 py-2 rounded-lg text-[11px] font-bold text-[#64748B] border border-[#E2E8F0] hover:bg-red-50"
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full h-20 rounded-xl border border-dashed border-[#E2E8F0] bg-white text-[#64748B] text-[12px] font-bold hover:border-[#0052FF]"
                        >
                          Upload Brand Logo
                        </button>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-[11px] font-bold text-[#64748B] uppercase tracking-widest">Color Palette</label>
                        <span className="text-[10px] font-bold text-[#64748B] bg-white px-1.5 py-0.5 rounded-md border border-[#E2E8F0]">Max 5</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 p-3 bg-white rounded-xl border border-[#E2E8F0]">
                        {formInput.brandAssets.colorPalette.map((color, index) => (
                          <div key={index} className="relative group">
                            <div className="w-10 h-10 rounded-full border border-white shadow-sm overflow-hidden relative" style={{ backgroundColor: color }}>
                              <input
                                type="color"
                                value={color}
                                onChange={(e) => handleUpdateColor(index, e.target.value)}
                                className="absolute inset-0 w-[200%] h-[200%] -top-1/2 -left-1/2 cursor-pointer opacity-0"
                              />
                            </div>
                            {formInput.brandAssets.colorPalette.length > 1 && (
                              <button
                                onClick={() => handleRemoveColor(index)}
                                className="absolute -top-1 -right-1 w-4 h-4 bg-white border border-[#E2E8F0] rounded-full flex items-center justify-center text-[#64748B] hover:text-red-500"
                              >
                                <X className="w-2.5 h-2.5" />
                              </button>
                            )}
                          </div>
                        ))}
                        {formInput.brandAssets.colorPalette.length < 5 && (
                          <button
                            onClick={handleAddColor}
                            className="w-10 h-10 rounded-full border border-dashed border-[#A0AABF] bg-white flex items-center justify-center text-[#64748B] hover:text-[#0052FF]"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    <SelectField
                      label="Primary Font"
                      value={formInput.brandAssets.fontFamily ?? "Montserrat"}
                      onChange={(v) => updateInput({ brandAssets: { ...formInput.brandAssets, fontFamily: v } })}
                      options={fontOptions}
                    />
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-[#E2E8F0]/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,253,0.92))] px-6 py-6 rounded-b-[36px]">
              <button
                type="button"
                onClick={() => setCurrentStep((s) => (s > 1 ? ((s - 1) as InputStep) : s))}
                className="flex items-center gap-2 rounded-full border border-[#D8E0EC] bg-white px-6 py-3 text-[14px] font-bold text-[#64748B] transition-all hover:border-[#CBD5E1] hover:bg-[#F8FAFD] disabled:opacity-50"
                disabled={currentStep === 1}
              >
                <ArrowRight className="w-4 h-4 rotate-180" />
                Back
              </button>
              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep((s) => (s < 3 ? ((s + 1) as InputStep) : s))}
                  disabled={(currentStep === 1 && !canGoStep2) || (currentStep === 2 && !canGoStep3)}
                  className={`flex items-center justify-center gap-2 rounded-full px-6 py-3 text-[14px] font-bold transition-all ${
                    (currentStep === 1 && !canGoStep2) || (currentStep === 2 && !canGoStep3)
                      ? "bg-[#F8FAFD] text-[#CBD5E1] border border-[#E2E8F0] cursor-not-allowed"
                      : "bg-[linear-gradient(135deg,#111827,#0052FF)] text-white shadow-[0_12px_30px_rgba(0,82,255,0.24)] hover:brightness-105"
                  }`}
                >
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  disabled={!canGenerate || (view as ViewState) === "generating"}
                  onClick={() => handleGenerate(formInput)}
                  className={`flex items-center justify-center gap-2 rounded-full px-6 py-3 text-[14px] font-bold transition-all ${
                    canGenerate && (view as ViewState) !== "generating"
                      ? "bg-[linear-gradient(135deg,#111827,#0052FF)] text-white shadow-[0_12px_30px_rgba(0,82,255,0.24)] hover:brightness-105"
                      : "bg-[#F8FAFD] text-[#CBD5E1] border border-[#E2E8F0] cursor-not-allowed"
                  }`}
                >
                  {(view as ViewState) === "generating" ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      Generate Content
                    </>
                  )}
                </button>
              )}
            </div>
            </motion.div>
            </AnimatePresence>

        </div>
      ) : (
        <div className="relative max-w-7xl mx-auto px-6 py-8">
          {/* Output view toolbar: History + New Post */}
          <div className="flex items-center justify-end gap-2 mb-4">
            <button
              type="button"
              onClick={() => {
                setIsHistoryOpen((prev) => !prev);
                if (!isHistoryOpen) fetchHistory();
              }}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-[#E2E8F0] bg-white text-xs font-bold text-[#1A1D23] hover:border-[#0052FF]/30 hover:text-[#0052FF] transition-colors"
            >
              <History className="w-3.5 h-3.5" />
              History
              {historyItems.length > 0 && (
                <span className="ml-0.5 bg-[#0052FF] text-white text-[9px] font-black rounded-full px-1.5 py-0.5">
                  {historyItems.length}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={handleNewPost}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-[#E2E8F0] bg-white text-xs font-bold text-[#1A1D23] hover:border-[#0052FF]/30 hover:text-[#0052FF] transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              New Post
            </button>
          </div>

          {/* Output view history panel — same data as idle-view history */}


          {(usedTemplateName || templateAICurated) && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-5 flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-white to-[#F8FAFD] border border-[#E2E8F0] rounded-2xl shadow-sm w-fit"
            >
              <ClipboardList size={16} className="shrink-0 text-[#0052FF]" />
              {usedTemplateName && (
                <span className="text-sm font-semibold text-[#1A1D23]">{usedTemplateName}</span>
              )}
              {templateAICurated && (
                <span className="px-2.5 py-1 bg-gradient-to-r from-[#AAFF50]/20 to-[#6FD670]/20 text-[#059669] text-[11px] font-bold rounded-full flex items-center gap-1">
                  ✨ AI curated
                </span>
              )}
            </motion.div>
          )}
          {imageGenError && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-5 flex items-start gap-3 px-5 py-4 bg-gradient-to-r from-amber-50 to-amber-100/50 border border-amber-200 rounded-2xl text-sm text-amber-900 shadow-sm"
            >
              <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0 text-amber-500" />
              <div>
                <p className="font-semibold">Image generation issue</p>
                <p className="text-amber-800/80 text-xs mt-1">{imageGenError}. Your captions are still ready below.</p>
              </div>
            </motion.div>
          )}
          {postPackage && (
            <OutputDashboard
              postPackage={{
                ...postPackage,
                hooks: hooks || undefined,
                contentScore: contentScore || undefined,
              }}
              input={lastInput ?? formInput}
              strategy={strategy ?? undefined}
              accountId={effectiveAccountId ?? undefined}
              onRemix={handleRemix}
              onSaveToQueue={handleSaveToQueue}
              isSavingToQueue={isSavingToQueue}
              onSchedulePost={handleSchedulePost}
              isScheduling={isScheduling}
              onPublishNow={handlePublishNow}
              isPublishingNow={isPublishingNow}
              suggestedScheduleIso={suggestedScheduleIso}
              isRemixing={isRemixing}
              onSelectImageVariation={handleSelectImageVariation}
            />
          )}
        </div>
      )}

      {/* Minimal idle error fallback for non-output mode */}
      {view === "idle" && !postPackage && error && (
        <div className="max-w-xl mx-auto px-6 pb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-red-100 text-center">
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Generation Failed</h3>
            <p className="text-gray-500 mb-6">{error}</p>
            <button
              onClick={handleRetry}
              className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-[#0052FF] text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
              Retry Generation
            </button>
          </div>
        </div>
      )}

      {/* Advanced settings popup */}
      {advancedOpen && (
        <div className="fixed inset-0 z-40 bg-[#0F172A]/30 flex items-center justify-center p-4" onClick={() => setAdvancedOpen(false)}>
          <div className="w-full max-w-xl bg-white rounded-2xl border border-[#E2E8F0] shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#1A1D23]">Advanced Settings</h3>
                <p className="text-xs text-[#64748B]">Fine-tune objective, tone, CTA, and style.</p>
              </div>
              <button
                type="button"
                onClick={() => setAdvancedOpen(false)}
                className="w-7 h-7 rounded-lg border border-[#E2E8F0] text-[#64748B] hover:text-[#1A1D23]"
              >
                ×
              </button>
            </div>
            <div className="px-5 py-5 max-h-[70vh] overflow-y-auto space-y-4">
              <MultiSelectPills
                label="Target Audience"
                options={audienceOptions}
                selected={formInput.targetAudiences}
                onChange={(v) => updateInput({ targetAudiences: v as TargetAudience[] })}
              />
              <MultiSelectPills
                label="Content Angle"
                options={contentAngleOptions.filter((o) => o.value !== "")}
                selected={formInput.contentAngles ?? []}
                onChange={(v) => updateInput({ contentAngles: v.length ? (v as ContentAngle[]) : undefined })}
              />
              <MultiSelectPills
                label="Tone"
                options={toneOptions}
                selected={formInput.tones}
                onChange={(v) => updateInput({ tones: v as ToneType[] })}
              />
              <MultiSelectPills
                label="Call to Action"
                options={ctaOptions}
                selected={formInput.ctas}
                onChange={(v) => updateInput({ ctas: v as CTAType[] })}
              />
              <SelectField
                label="Emoji Level"
                value={formInput.emojiLevel}
                onChange={(v) => updateInput({ emojiLevel: v as IntensityLevel })}
                options={intensityOptions}
              />
              <SelectField
                label="Hashtag Density"
                value={formInput.hashtagIntensity}
                onChange={(v) => updateInput({ hashtagIntensity: v as IntensityLevel })}
                options={intensityOptions}
              />
              <SelectField
                label="Brand Type"
                value={formInput.brandType}
                onChange={(v) => updateInput({ brandType: v as BrandType })}
                options={brandTypeOptions}
              />
              <MultiSelectPills
                label="Visual Style"
                options={visualStyleOptions}
                selected={formInput.visualStyles}
                onChange={(v) => updateInput({ visualStyles: v as VisualStyle[] })}
              />
            </div>
            <div className="px-5 py-4 border-t border-[#E2E8F0] flex justify-end">
              <button
                type="button"
                onClick={() => setAdvancedOpen(false)}
                className="px-4 py-2 rounded-xl bg-[#0052FF] text-white text-sm font-bold hover:bg-blue-700"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* History Modal Popup */}
      <AnimatePresence>
        {isHistoryOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#0F172A]/40 backdrop-blur-sm"
              onClick={() => setIsHistoryOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-3xl max-h-[85vh] bg-white/95 backdrop-blur-xl rounded-[32px] shadow-[0_40px_100px_rgba(15,23,42,0.15)] border border-white flex flex-col overflow-hidden"
            >
              <div className="px-8 py-5 border-b border-[#E2E8F0]/60 flex items-center justify-between bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(238,243,255,0.76))]">
                <div>
                  <h3 className="text-lg font-black text-[#1A1D23]">Post History</h3>
                  <p className="text-xs text-[#64748B] font-medium mt-0.5">Resume your drafts or review previous generations.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={fetchHistory}
                    className="px-3 py-1.5 rounded-full text-xs font-bold text-[#64748B] hover:text-[#0052FF] hover:bg-[#0052FF]/5 transition-colors flex items-center gap-1"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Refresh
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsHistoryOpen(false)}
                    className="p-2 rounded-full text-[#64748B] hover:text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
                {isHistoryLoading ? (
                  <div className="py-12 flex flex-col items-center justify-center text-center">
                    <RefreshCw className="w-6 h-6 text-[#0052FF] animate-spin mb-3" />
                    <p className="text-sm font-semibold text-[#64748B]">Loading history...</p>
                  </div>
                ) : historyItems.length === 0 ? (
                  <div className="py-12 flex flex-col items-center justify-center text-center">
                    <History className="w-12 h-12 text-[#CBD5E1] mb-3" />
                    <p className="text-[#1A1D23] font-bold">No saved posts yet</p>
                    <p className="text-sm text-[#64748B] mt-1">Your generations and drafts will appear here.</p>
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {historyItems.map((item) => {
                      const itemId = item._id;
                      const createdLabel = new Date(item.createdAt).toLocaleDateString("en-US", {
                        month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                      });
                      const previewText = item.output?.headline || item.input?.coreMessage || "Untitled post";
                      const angle = (item.strategy as { postAngle?: string } | undefined)?.postAngle;
                      const platforms = (item.input?.platforms ?? []) as string[];
                      const status = (item.status ?? "draft") as string;
                      const badge = STATUS_BADGE[status] ?? STATUS_BADGE.draft;
                      const isActive = activeGenerationId === itemId;
                      
                      return (
                        <div
                          key={itemId}
                          className={`group relative flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-2xl border transition-all ${
                            isActive 
                              ? "border-[#0052FF] bg-[#0052FF]/5 shadow-sm" 
                              : "border-[#E2E8F0] bg-white hover:border-[#0052FF]/30 hover:shadow-md hover:bg-[#F8FAFD]"
                          }`}
                        >
                          <div className="flex-1 min-w-0 cursor-pointer" onClick={() => { loadHistoryItem(itemId); setIsHistoryOpen(false); }}>
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`shrink-0 text-[10px] uppercase tracking-widest font-black px-2 py-0.5 rounded-full ${badge.className}`}>
                                {badge.label}
                              </span>
                              {item.source === "mobile" && (
                                <span className="flex items-center gap-1 text-[10px] font-bold text-[#64748B] bg-slate-100 px-2 py-0.5 rounded-full">
                                  <Smartphone className="w-3 h-3" /> Mobile
                                </span>
                              )}
                              <span className="text-[11px] font-semibold text-[#94A3B8] ml-auto shrink-0">
                                {createdLabel}
                              </span>
                            </div>
                            <h4 className="text-sm font-black text-[#1A1D23] truncate mb-1 pr-8">{previewText}</h4>
                            {angle && <p className="text-xs text-[#64748B] truncate mb-2">{angle}</p>}
                            <div className="flex flex-wrap gap-1">
                              {platforms.map(p => (
                                <span key={p} className="text-[10px] font-bold text-[#0052FF] bg-[#0052FF]/10 px-2 py-0.5 rounded-md">
                                  {p === "instagram_post" ? "instagram" : p}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="flex sm:flex-col items-center gap-2 self-end sm:self-center shrink-0">
                            <button
                              type="button"
                              onClick={() => { loadHistoryItem(itemId); setIsHistoryOpen(false); }}
                              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[linear-gradient(135deg,#111827,#0052FF)] text-white text-[11px] font-bold hover:brightness-110 transition-all shadow-sm flex items-center justify-center gap-1.5"
                            >
                              Open <ArrowRight className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); void handleDeleteHistoryItem(itemId); }}
                              className="p-2 text-[#94A3B8] hover:text-red-500 hover:bg-red-50 transition-colors rounded-xl flex-shrink-0"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>      {/* Modals */}
      <StylePickerModal
        open={styleModalOpen}
        onClose={() => setStyleModalOpen(false)}
        formInput={formInput}
        updateInput={updateInput}
      />
      <WritingStyleModal
        open={writingStyleModalOpen}
        onClose={() => setWritingStyleModalOpen(false)}
        formInput={formInput}
        updateInput={updateInput}
      />
      </div>
    </div>
  );
}
