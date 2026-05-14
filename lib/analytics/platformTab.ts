import type { AnalyticsDataset, AnalyticsSummaryResponse, DateRangeKey, TopPost } from "./types";
import { PLATFORM_LABELS, type PlatformKey } from "./platforms";
import type { PersonaDocument } from "@/lib/models/persona";
import type { PostGenerationDocument } from "@/lib/types/postGeneration";

export interface PlatformStatCard {
  label: string;
  value: string;
  delta: string;
  trend: "up" | "down" | "neutral";
  note: string;
}

export interface PlatformTrendSignal {
  type: "spike" | "drop" | "watch" | "win";
  label: string;
  value: string;
  reason: string;
}

export interface PlatformRecentPost {
  id: string;
  title: string;
  platform: string;
  objective: string;
  status: string;
  createdAt: string;
}

export interface PlatformPersonaFit {
  score: number;
  summary: string;
  audience: number;
  tone: number;
  format: number;
  objective: number;
  brand: number;
  isLimited: boolean;
}

export interface PlatformRecommendation {
  priority: "high" | "medium" | "low";
  title: string;
  explanation: string;
  nextStep: string;
  metric: string;
}

export interface MissingPersonaField {
  key: string;
  label: string;
}

export interface PlatformTabAnalysis {
  platform: PlatformKey;
  platformLabel: string;
  stats: PlatformStatCard[];
  trendSignals: PlatformTrendSignal[];
  recentPosts: PlatformRecentPost[];
  analysisSummary: string;
  personaFit: PlatformPersonaFit;
  recommendations: PlatformRecommendation[];
  missingPersonaFields: MissingPersonaField[];
}

interface BuildPlatformTabInput {
  platform: PlatformKey;
  summary: AnalyticsSummaryResponse | null;
  dataset: AnalyticsDataset | null;
  persona: PersonaDocument | null;
  postGenerations: PostGenerationDocument[];
  dateRange: DateRangeKey;
}

const PLATFORM_STAT_NOTES: Record<PlatformKey, Record<string, string>> = {
  all: {},
  twitter: {
    audience: "Follower base on X",
    reach: "Views and impressions",
    engagement: "Total interactions",
    comments: "Replies that drive conversation",
    shares: "Reposts and quote activity",
    clicks: "Click intent",
  },
  facebook: {
    audience: "Page followers",
    reach: "Feed distribution",
    engagement: "Reactions + comments",
    comments: "Conversation depth",
    shares: "Share momentum",
  },
  instagram: {
    audience: "Follower base",
    reach: "Impressions + reach",
    engagement: "Engagement volume",
    comments: "Conversation depth",
    shares: "Saves and shares",
  },
  threads: {
    audience: "Follower base",
    reach: "Views and reach",
    engagement: "Interactions",
    comments: "Replies that spark discussion",
    shares: "Reposts",
  },
};

const PLATFORM_RECOMMENDATION_LIBRARY: Record<PlatformKey, PlatformRecommendation[]> = {
  all: [],
  twitter: [
    {
      priority: "high",
      title: "Sharpen the first line hook",
      explanation: "X rewards posts that grab attention in the first sentence.",
      nextStep: "Rewrite the top-performing idea into a shorter, hook-first version.",
      metric: "Engagement rate",
    },
    {
      priority: "medium",
      title: "Ask for replies, not just likes",
      explanation: "Replies are a stronger signal on X than passive reactions.",
      nextStep: "End posts with a direct question or opinion prompt.",
      metric: "Replies",
    },
  ],
  facebook: [
    {
      priority: "high",
      title: "Spark community conversation",
      explanation: "Facebook favors posts that pull people into comments.",
      nextStep: "Use a community question or a short story to encourage replies.",
      metric: "Comments",
    },
    {
      priority: "medium",
      title: "Increase shareable value",
      explanation: "Shares extend reach into new audiences.",
      nextStep: "Create a post people would share with their audience.",
      metric: "Shares",
    },
  ],
  instagram: [
    {
      priority: "high",
      title: "Create save-worthy carousels",
      explanation: "Saves and shares push Instagram reach forward.",
      nextStep: "Turn the strongest idea into a carousel with clear takeaways.",
      metric: "Saves",
    },
    {
      priority: "medium",
      title: "Improve caption hook",
      explanation: "The first line decides whether people keep reading.",
      nextStep: "Rewrite captions with a bold, value-first opening.",
      metric: "Engagements",
    },
  ],
  threads: [
    {
      priority: "high",
      title: "Post short, opinion-led updates",
      explanation: "Threads rewards quick, conversational takes.",
      nextStep: "Publish a concise opinion post and invite replies.",
      metric: "Replies",
    },
    {
      priority: "medium",
      title: "Turn winners into mini threads",
      explanation: "Threads engagement grows with short follow-up posts.",
      nextStep: "Expand the best idea into a short thread.",
      metric: "Engagements",
    },
  ],
};

const PERSONA_FIELDS: MissingPersonaField[] = [
  { key: "personaName", label: "Persona name" },
  { key: "userRole", label: "User role" },
  { key: "industry", label: "Industry" },
  { key: "businessStage", label: "Business stage" },
  { key: "audienceSegments", label: "Audience segments" },
  { key: "audienceRole", label: "Audience role" },
  { key: "primaryObjective", label: "Primary objective" },
  { key: "conversionTargets", label: "Conversion targets" },
  { key: "contentMix", label: "Content mix" },
  { key: "writingStyle", label: "Writing style" },
  { key: "brandArchetype", label: "Brand archetype" },
  { key: "brandColorHex", label: "Brand color" },
  { key: "contentThemes", label: "Content themes" },
];

function toArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }
  if (typeof value === "string") {
    return value.split(/[,/|]/).map((item) => item.trim()).filter(Boolean);
  }
  return [];
}

function toDate(value: unknown): Date | null {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }
  if (typeof value === "string" || typeof value === "number") {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  return null;
}

function parseCompactNumber(value: string): number {
  const normalized = value.replace(/,/g, "").trim().toUpperCase();
  if (!normalized) return 0;
  const match = normalized.match(/(-?\d+(?:\.\d+)?)([KMB])?/);
  if (!match) return Number(normalized) || 0;
  const amount = Number.parseFloat(match[1]) || 0;
  const suffix = match[2] ?? "";
  if (suffix === "K") return amount * 1000;
  if (suffix === "M") return amount * 1000000;
  if (suffix === "B") return amount * 1000000000;
  return amount;
}

function formatCompactNumber(value: number): string {
  const absolute = Math.abs(value);
  if (absolute >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (absolute >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return `${Math.round(value)}`;
}

function formatSigned(value: number): string {
  const prefix = value > 0 ? "+" : "";
  return `${prefix}${formatCompactNumber(value)}`;
}

function platformLabel(platform: PlatformKey): string {
  if (platform === "all") return "Overview";
  return PLATFORM_LABELS[platform] ?? platform;
}

function withinRange(createdAt: unknown, dateRange: DateRangeKey): boolean {
  const date = toDate(createdAt);
  if (!date) return false;
  const days = dateRange === "7D" ? 7 : dateRange === "30D" ? 30 : 90;
  const lowerBound = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  return date >= lowerBound;
}

function platformKeyFromPostPlatform(value: string): PlatformKey {
  const normalized = value.toLowerCase();
  if (normalized === "x" || normalized === "twitter") return "twitter";
  if (normalized.includes("instagram")) return "instagram";
  if (normalized.includes("facebook")) return "facebook";
  if (normalized.includes("threads")) return "threads";
  return "all";
}

function extractPlatformFromGeneration(post: PostGenerationDocument): PlatformKey {
  const platforms = post.input?.platforms ?? [];
  if (platforms.length > 0) {
    return platformKeyFromPostPlatform(platforms[0]);
  }

  if (post.output?.captions) {
    const firstCaption = Object.keys(post.output.captions)[0];
    if (firstCaption) {
      return platformKeyFromPostPlatform(firstCaption);
    }
  }

  return "all";
}

function normalizeTitle(post: PostGenerationDocument): string {
  return (
    post.output?.headline ||
    post.strategy?.hookIdea ||
    post.input?.coreMessage ||
    "Untitled draft"
  )
    .trim()
    .slice(0, 90);
}

function scoreToneFit(persona: PersonaDocument | null, posts: PostGenerationDocument[]): number {
  if (!persona) return 70;
  if (posts.length === 0) return 64;

  const seriousness = persona.toneSliders?.seriousPlayful ?? 50;
  const informative = persona.toneSliders?.inspiringInformative ?? 50;
  const postToneScores = posts.map((post) => {
    const styles = [post.input?.captionStyle, post.input?.postIntent, post.input?.objective].flatMap((item) => (item ? [String(item)] : []));
    const toneValue = styles.some((text) => /story|educat|authority|professional|insight/i.test(text)) ? 70 : 55;
    return toneValue;
  });

  const averagePostTone = postToneScores.reduce((sum, value) => sum + value, 0) / postToneScores.length;
  const personaTone = (seriousness + informative) / 2;
  const delta = Math.abs(personaTone - averagePostTone);
  return Math.max(35, Math.min(96, Math.round(100 - delta * 1.2)));
}

function scoreAudienceFit(persona: PersonaDocument | null, posts: PostGenerationDocument[]): number {
  if (!persona) return 68;
  if (posts.length === 0) return 60;

  const personaAudience = new Set([...toArray(persona.audienceSegments), ...toArray(persona.audienceRole)]);
  const audienceMatches = posts.filter((post) => {
    const targetAudiences = new Set([...(post.input?.targetAudiences ?? []), ...(post.input?.customAudience ? [post.input.customAudience] : [])].map((item) => String(item).toLowerCase()));
    const personaAudienceTokens = [...personaAudience].map((item) => item.toLowerCase());
    return personaAudienceTokens.some((token) =>
      [...targetAudiences].some((audience) => audience.includes(token) || token.includes(audience))
    );
  }).length;

  const score = (audienceMatches / posts.length) * 100;
  return Math.max(35, Math.min(96, Math.round(55 + score * 0.45)));
}

function scoreObjectiveFit(persona: PersonaDocument | null, posts: PostGenerationDocument[]): number {
  if (!persona) return 70;
  if (posts.length === 0) return 60;

  const personaObjectives = new Set(toArray(persona.primaryObjective).map((item) => item.toLowerCase()));
  const objectives = posts.filter((post) => personaObjectives.has(String(post.input?.objective ?? "").toLowerCase())).length;
  const score = (objectives / posts.length) * 100;
  return Math.max(35, Math.min(98, Math.round(55 + score * 0.5)));
}

function scoreFormatFit(persona: PersonaDocument | null, topPosts: TopPost[], posts: PostGenerationDocument[]): number {
  const personaFormats = new Set(toArray(persona?.contentMix).map((item) => item.toLowerCase()));
  const topFormats = new Set(topPosts.map((post) => post.format.toLowerCase()));
  const postFormats = new Set(posts.flatMap((post) => toArray(post.input?.captionStyle)).map((item) => item.toLowerCase()));

  const overlap = [...personaFormats].filter((item) => topFormats.has(item) || postFormats.has(item)).length;
  const base = personaFormats.size > 0 ? (overlap / personaFormats.size) * 100 : 60;
  return Math.max(40, Math.min(98, Math.round(50 + base * 0.5)));
}

function scoreBrandFit(persona: PersonaDocument | null, posts: PostGenerationDocument[]): number {
  if (!persona) return 72;
  if (posts.length === 0) return 65;

  const brandColor = (persona.brandColorHex || "").replace("#", "").toLowerCase();
  const paletteHits = posts.filter((post) => {
    const designColors = post.design?.brandColors ?? post.input?.brandAssets?.colorPalette ?? [];
    const flattened = designColors.map((item) => item.replace("#", "").toLowerCase());
    return brandColor ? flattened.includes(brandColor) : flattened.length > 0;
  }).length;

  const score = (paletteHits / posts.length) * 100;
  return Math.max(40, Math.min(98, Math.round(60 + score * 0.4)));
}

function buildMissingPersonaFields(persona: PersonaDocument | null): MissingPersonaField[] {
  if (!persona) return PERSONA_FIELDS;
  return PERSONA_FIELDS.filter((field) => {
    if (field.key === "conversionTargets") {
      const conversionTargets = toArray((persona as any)?.conversionTargets);
      const conversionGoal = toArray((persona as any)?.conversionGoal);
      return conversionTargets.length === 0 && conversionGoal.length === 0;
    }

    const value = (persona as any)?.[field.key];
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === "string") return value.trim().length === 0;
    if (value === null || value === undefined) return true;
    return false;
  });
}

function buildRecentPosts(posts: PostGenerationDocument[], platform: PlatformKey, dateRange: DateRangeKey): PlatformRecentPost[] {
  return posts
    .filter((post) => withinRange(post.createdAt, dateRange))
    .filter((post) => extractPlatformFromGeneration(post) === platform)
    .sort((a, b) => {
      const left = toDate(a.createdAt)?.getTime() ?? 0;
      const right = toDate(b.createdAt)?.getTime() ?? 0;
      return right - left;
    })
    .slice(0, 6)
    .map((post) => ({
      id: post._id?.toString?.() || normalizeTitle(post),
      title: normalizeTitle(post),
      platform: platformLabel(platform),
      objective: String(post.input?.objective ?? post.status ?? "draft"),
      status: post.status,
      createdAt: toDate(post.createdAt)?.toISOString() || new Date().toISOString(),
    }));
}

function buildStats(dataset: AnalyticsDataset | null, platform: PlatformKey): PlatformStatCard[] {
  if (!dataset) return [];

  const vitals = dataset.vitals;
  const stats: Array<{ key: keyof typeof vitals; label: string; note: string }> = [];
  const notes = PLATFORM_STAT_NOTES[platform] || {};

  const addStat = (key: keyof typeof vitals, label: string) => {
    const metric = vitals[key];
    if (!metric) return;
    stats.push({ key, label, note: notes[key] || "" });
  };

  if (platform === "twitter") {
    addStat("audience", "Total Followers");
    addStat("reach", "Total Impressions");
    addStat("engagement", "Total Engagements");
    addStat("comments", "Total Replies");
    addStat("shares", "Total Reposts");
  } else if (platform === "instagram") {
    addStat("audience", "Total Followers");
    addStat("reach", "Total Impressions");
    addStat("engagement", "Total Engagements");
    addStat("comments", "Total Comments");
    addStat("shares", "Total Saves");
  } else if (platform === "threads") {
    addStat("audience", "Total Followers");
    addStat("reach", "Total Views");
    addStat("engagement", "Total Engagements");
    addStat("comments", "Total Replies");
    addStat("shares", "Total Reposts");
  } else {
    addStat("audience", "Total Followers");
    addStat("reach", "Total Impressions");
    addStat("engagement", "Total Engagements");
    addStat("comments", "Total Comments");
    addStat("shares", "Total Shares");
  }

  return stats.map((stat) => {
    const metric = vitals[stat.key] as any;
    return {
      label: stat.label,
      value: (metric?.value as string) ?? "0",
      delta: formatSigned((metric?.change as number) ?? 0),
      trend: (metric?.trend as "up" | "down" | "neutral") ?? "neutral",
      note: stat.note || "Platform stat",
    };
  });
}

function buildTrendSignals(summary: AnalyticsSummaryResponse | null, dataset: AnalyticsDataset | null, platform: PlatformKey): PlatformTrendSignal[] {
  const signals: PlatformTrendSignal[] = [];
  const anomalies = dataset?.anomalies ?? [];
  const topAnomaly = anomalies[0];
  if (topAnomaly) {
    signals.push({
      type: topAnomaly.type === "spike" ? "spike" : "drop",
      label: topAnomaly.reason,
      value: `${topAnomaly.icon} ${topAnomaly.value}`,
      reason: topAnomaly.date,
    });
  }

  if (summary?.globalData?.topPosts?.[0]) {
    signals.push({
      type: "win",
      label: "Top post format is winning",
      value: summary.globalData.topPosts[0].format,
      reason: summary.globalData.topPosts[0].whyItWorked,
    });
  }

  if (signals.length === 0) {
    signals.push({
      type: "watch",
      label: "No major trend spikes yet",
      value: "Stable",
      reason: "Performance is steady for this range.",
    });
  }

  return signals.slice(0, 3);
}

function buildPersonaFit(
  persona: PersonaDocument | null,
  posts: PostGenerationDocument[],
  topPosts: TopPost[],
  missingPersonaFields: MissingPersonaField[],
): PlatformPersonaFit {
  const isLimited = missingPersonaFields.length > 0;

  const audience = scoreAudienceFit(persona, posts);
  const tone = scoreToneFit(persona, posts);
  const format = scoreFormatFit(persona, topPosts, posts);
  const objective = scoreObjectiveFit(persona, posts);
  const brand = scoreBrandFit(persona, posts);

  const overallScore = Math.round((audience + tone + format + objective + brand) / 5);
  const summary = isLimited
    ? "Persona data is incomplete. Finish the persona to unlock full recommendations."
    : overallScore >= 85
      ? "This platform is strongly aligned with the persona strategy."
      : overallScore >= 70
        ? "The strategy is mostly aligned, but a few areas need attention."
        : overallScore >= 50
          ? "Content and persona are partially aligned and need refinement."
          : "Content strategy needs stronger alignment with the persona.";

  return {
    score: overallScore,
    summary,
    audience,
    tone,
    format,
    objective,
    brand,
    isLimited,
  };
}

function buildAnalysisSummary(dataset: AnalyticsDataset | null, platform: PlatformKey): string {
  if (!dataset) {
    return "No data is available yet for this platform.";
  }

  const reach = parseCompactNumber(dataset.vitals.reach.value);
  const engagement = parseCompactNumber(dataset.vitals.engagement.value);
  const trend = dataset.vitals.engagement.trend;

  if (reach > 0 && engagement > 0 && trend === "up") {
    return "Engagement is rising faster than reach, which suggests the content is resonating on this platform.";
  }

  if (reach > 0 && engagement === 0) {
    return "Reach is present, but engagement is not keeping up. The format or hook may need improvement.";
  }

  if (trend === "down") {
    return "Engagement has slowed, which means the current content pattern needs adjustment.";
  }

  return "Performance is steady. Use recent winning patterns to push the next batch.";
}

function buildRecommendations(
  platform: PlatformKey,
  personaFit: PlatformPersonaFit,
  recentPosts: PlatformRecentPost[],
  missingPersonaFields: MissingPersonaField[],
): PlatformRecommendation[] {
  if (missingPersonaFields.length > 0) {
    return [
      {
        priority: "high",
        title: "Complete your persona",
        explanation: "Recommendations are limited until the persona is finished.",
        nextStep: "Fill in the missing persona details to unlock platform advice.",
        metric: "Persona completeness",
      },
    ];
  }

  const recommendations = [...(PLATFORM_RECOMMENDATION_LIBRARY[platform] || [])];

  if (recentPosts.length < 2) {
    recommendations.push({
      priority: "medium",
      title: "Increase posting cadence",
      explanation: "There are not enough recent posts to reveal a strong pattern.",
      nextStep: "Publish at least 2-3 posts in the next period and compare results.",
      metric: "Consistency",
    });
  }

  if (personaFit.score < 70) {
    recommendations.push({
      priority: "high",
      title: "Improve persona alignment",
      explanation: "Recent posts are drifting away from the saved persona strategy.",
      nextStep: "Adjust tone, format, and CTA to match persona intent.",
      metric: "Persona fit",
    });
  }

  return recommendations.slice(0, 4);
}

export function buildPlatformTabAnalysis({
  platform,
  summary,
  dataset,
  persona,
  postGenerations,
  dateRange,
}: BuildPlatformTabInput): PlatformTabAnalysis {
  const recentPosts = buildRecentPosts(postGenerations, platform, dateRange);
  const missingPersonaFields = buildMissingPersonaFields(persona);
  const personaFit = buildPersonaFit(persona, postGenerations, dataset?.topPosts ?? [], missingPersonaFields);

  return {
    platform,
    platformLabel: platformLabel(platform),
    stats: buildStats(dataset, platform),
    trendSignals: buildTrendSignals(summary, dataset, platform),
    recentPosts,
    analysisSummary: buildAnalysisSummary(dataset, platform),
    personaFit,
    recommendations: buildRecommendations(platform, personaFit, recentPosts, missingPersonaFields),
    missingPersonaFields,
  };
}
