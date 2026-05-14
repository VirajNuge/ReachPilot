import type { AnalyticsSummaryResponse, DateRangeKey, TopPost } from "./types";
import { PLATFORM_LABELS, type PlatformKey } from "./platforms";
import type { PersonaDocument } from "@/lib/models/persona";
import type { ConnectionDocument } from "@/lib/models/connection";
import type { PostGenerationDocument } from "@/lib/types/postGeneration";

export interface OverviewMetricCard {
  label: string;
  value: string;
  delta: string;
  trend: "up" | "down" | "neutral";
  note: string;
}

export interface OverviewPlatformRank {
  platform: PlatformKey;
  label: string;
  score: number;
  metricLabel: string;
  reason: string;
  action: string;
  rank: number;
}

export interface OverviewContentWinner {
  id: string;
  title: string;
  format: string;
  platform: string;
  score: number;
  reason: string;
  action: string;
}

export interface OverviewPersonaAlignment {
  score: number;
  summary: string;
  audience: number;
  tone: number;
  format: number;
  objective: number;
  brand: number;
}

export interface OverviewRecommendation {
  priority: "high" | "medium" | "low";
  title: string;
  explanation: string;
  nextStep: string;
  metric: string;
}

export interface OverviewAudienceSummary {
  dominantSegment: string;
  topJobTitles: string[];
  topLocations: string[];
  seniority: string;
  note: string;
}

export interface OverviewSignalHighlight {
  type: "spike" | "drop" | "win" | "watch";
  label: string;
  value: string;
  reason: string;
}

export interface OverviewConnectedAccount {
  platform: PlatformKey;
  label: string;
  username: string;
  connectedAt?: string;
}

export interface OverviewRecentPost {
  id: string;
  title: string;
  platform: string;
  objective: string;
  status: string;
  createdAt: string;
}

export interface AnalyticsOverview {
  snapshot: OverviewMetricCard[];
  platformLeaderboard: OverviewPlatformRank[];
  bestPlatform: OverviewPlatformRank | null;
  weakestPlatform: OverviewPlatformRank | null;
  contentWinners: OverviewContentWinner[];
  personaAlignment: OverviewPersonaAlignment;
  actionRecommendations: OverviewRecommendation[];
  audienceSummary: OverviewAudienceSummary;
  signalHighlights: OverviewSignalHighlight[];
  connectedAccounts: OverviewConnectedAccount[];
  recentGeneratedPosts: OverviewRecentPost[];
}

export interface BuildAnalyticsOverviewInput {
  summary: AnalyticsSummaryResponse | null;
  persona: PersonaDocument | null;
  connections: ConnectionDocument[];
  postGenerations: PostGenerationDocument[];
  dateRange: DateRangeKey;
}

function toArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(/[,/|]/)
      .map((item) => item.trim())
      .filter(Boolean);
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

function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

function platformKeyFromLabel(label: string): PlatformKey {
  const normalized = label.toLowerCase();
  if (normalized.includes("instagram")) return "instagram";
  if (normalized.includes("facebook")) return "facebook";
  if (normalized.includes("threads")) return "threads";
  if (normalized.includes("twitter") || normalized.includes("x")) return "twitter";
  return "all";
}

function platformLabel(platform: PlatformKey | string): string {
  if (platform === "all") return "Overview";
  return PLATFORM_LABELS[platform as Exclude<PlatformKey, "all">] ?? String(platform);
}

function withinRange(createdAt: unknown, dateRange: DateRangeKey): boolean {
  const date = toDate(createdAt);
  if (!date) return false;

  const days = dateRange === "7D" ? 7 : dateRange === "30D" ? 30 : 90;
  const lowerBound = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  return date >= lowerBound;
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

function platformKeyFromPostPlatform(value: string): PlatformKey {
  const normalized = value.toLowerCase();
  if (normalized === "x" || normalized === "twitter") return "twitter";
  if (normalized.includes("instagram")) return "instagram";
  if (normalized.includes("facebook")) return "facebook";
  if (normalized.includes("threads")) return "threads";
  return "all";
}

function extractPlatformFromGeneration(post: PostGenerationDocument): string {
  const platforms = post.input?.platforms ?? [];
  if (platforms.length > 0) {
    return platformLabel(platformKeyFromPostPlatform(platforms[0]));
  }

  if (post.output?.captions) {
    const firstCaption = Object.keys(post.output.captions)[0];
    if (firstCaption) {
      return platformLabel(platformKeyFromPostPlatform(firstCaption));
    }
  }

  return "Draft";
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

function buildAudienceSummary(persona: PersonaDocument | null): OverviewAudienceSummary {
  const dominantSegment =
    toArray(persona?.audienceRole)[0] ||
    toArray(persona?.audienceSegments)[0] ||
    toArray(persona?.userRole)[0] ||
    "Unspecified";
  const topJobTitles = toArray(persona?.audienceRole).slice(0, 3);
  const topLocations = [persona?.region, persona?.businessStage].filter(Boolean).map(String).slice(0, 3);

  const seniority = /founder|ceo|owner|exec|director/i.test(dominantSegment)
    ? "Senior decision makers"
    : /manager|lead|head/i.test(dominantSegment)
      ? "Mid-to-senior operators"
      : persona?.education || "Mixed seniority";
  const outcomeRaw = persona?.audienceDesiredOutcome;
  const outcomeText = Array.isArray(outcomeRaw)
    ? outcomeRaw.join(", ")
    : typeof outcomeRaw === "string"
    ? outcomeRaw
    : outcomeRaw != null
    ? String(outcomeRaw)
    : "";

  return {
    dominantSegment,
    topJobTitles: topJobTitles.length > 0 ? topJobTitles : [toArray(persona?.userRole)[0] || "Not defined yet"],
    topLocations: topLocations.length > 0 ? topLocations : [persona?.region || "Not enough audience location data yet"],
    seniority,
    note: outcomeText
      ? `Strategy is currently aimed at ${outcomeText.toLowerCase()}.`
      : "Audience detail is mostly strategy-led until deeper demographic data is available.",
  };
}

function buildConnectedAccounts(connections: ConnectionDocument[]): OverviewConnectedAccount[] {
  return connections
    .map((connection) => ({
      platform: connection.platform === "x" ? "twitter" : platformKeyFromLabel(connection.platform),
      label: platformLabel(connection.platform === "x" ? "twitter" : platformKeyFromLabel(connection.platform)),
      username: connection.platformUsername || connection.platformUserId || connection.platform,
      connectedAt: connection.createdAt ? new Date(connection.createdAt).toISOString() : undefined,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

function buildContentWinners(topPosts: TopPost[]): OverviewContentWinner[] {
  return topPosts.slice(0, 3).map((post, index) => ({
    id: post.id.toString(),
    title: post.headline,
    format: post.format,
    platform: post.stats.views ? `${post.stats.views} views` : "Platform winner",
    score: post.score,
    reason: post.whyItWorked,
    action: index === 0 ? "Clone the structure" : `Repurpose this ${post.format.toLowerCase()} again`,
  }));
}

function buildSignalHighlights(summary: AnalyticsSummaryResponse | null, leaderboard: OverviewPlatformRank[]): OverviewSignalHighlight[] {
  const anomalies = summary?.globalData.anomalies ?? [];
  const highlights: OverviewSignalHighlight[] = anomalies.slice(0, 3).map((anomaly) => ({
    type: anomaly.type === "spike" ? "spike" : "drop",
    label: anomaly.reason,
    value: `${anomaly.icon} ${anomaly.value}`,
    reason: anomaly.date,
  }));

  if (leaderboard[0]) {
    highlights.unshift({
      type: "win",
      label: `${leaderboard[0].label} is leading`,
      value: formatPercent(leaderboard[0].score),
      reason: leaderboard[0].reason,
    });
  }

  if (highlights.length === 0) {
    highlights.push({
      type: "watch",
      label: "No major anomalies yet",
      value: "Stable",
      reason: "The current range does not show sharp spikes or drops.",
    });
  }

  return highlights.slice(0, 4);
}

function buildPlatformLeaderboard(summary: AnalyticsSummaryResponse | null): OverviewPlatformRank[] {
  const radar = summary?.globalData.radar ?? [];
  const leaderboard = radar
    .map((point) => ({
      platform: platformKeyFromLabel(point.subject),
      label: platformLabel(platformKeyFromLabel(point.subject)),
      score: point.A,
      metricLabel: "Engagement rate",
      reason: `${formatPercent(point.A)} engagement rate`,
      action: point.A >= 15
        ? "Repurpose this winning format on slower platforms"
        : "Add stronger hooks and CTAs to raise interaction",
      rank: 0,
    }))
    .sort((a, b) => b.score - a.score)
    .map((item, index) => ({ ...item, rank: index + 1 }));

  return leaderboard;
}

function buildRecommendations(
  summary: AnalyticsSummaryResponse | null,
  personaAlignment: OverviewPersonaAlignment,
  leaderboard: OverviewPlatformRank[],
  contentWinners: OverviewContentWinner[],
  postGenerations: PostGenerationDocument[],
  dateRange: DateRangeKey,
): OverviewRecommendation[] {
  const recommendations: OverviewRecommendation[] = [];
  const topPlatform = leaderboard[0];
  const weakestPlatform = leaderboard[leaderboard.length - 1];
  const totalGenerated = postGenerations.filter((post) => withinRange(post.createdAt, dateRange) && post.status !== "failed").length;

  if (topPlatform && weakestPlatform && topPlatform.score - weakestPlatform.score >= 8) {
    recommendations.push({
      priority: "high",
      title: `Move winning structure from ${topPlatform.label} to ${weakestPlatform.label}`,
      explanation: `Your best platform is outperforming your weakest one by ${formatPercent(topPlatform.score - weakestPlatform.score)}.`,
      nextStep: `Repurpose the strongest format into a version tailored for ${weakestPlatform.label}.`,
      metric: "Cross-platform engagement",
    });
  }

  if (personaAlignment.score < 72) {
    recommendations.push({
      priority: "high",
      title: "Tighten persona alignment",
      explanation: "The saved persona and the recent post mix are not yet speaking the same language.",
      nextStep: "Adjust the next content batch to match the intended audience, tone, and objective more closely.",
      metric: "Persona fit",
    });
  }

  if (contentWinners[0]) {
    recommendations.push({
      priority: "medium",
      title: `Create more ${contentWinners[0].format} posts`,
      explanation: `${contentWinners[0].title} is your strongest recent pattern and should be repeated while it is working.`,
      nextStep: `Draft 2-3 new posts using the same ${contentWinners[0].format.toLowerCase()} structure.`,
      metric: "Top post performance",
    });
  }

  if (totalGenerated < 3) {
    recommendations.push({
      priority: "medium",
      title: "Increase posting cadence",
      explanation: "There are not enough recent generated posts to fully reveal the pattern.",
      nextStep: "Create a small test batch of 3-5 posts and compare which platform and format wins.",
      metric: "Posting consistency",
    });
  }

  if ((summary?.globalData.vitals.clicks.change ?? 0) === 0 && (summary?.globalData.vitals.clicks.value ?? "0") !== "0") {
    recommendations.push({
      priority: "low",
      title: "Improve click-through intent",
      explanation: "Engagement is present, but the current mix is not clearly pushing the next action.",
      nextStep: "Use more explicit CTAs and track which hooks produce clicks instead of only reactions.",
      metric: "Clicks",
    });
  }

  if (recommendations.length === 0) {
    recommendations.push({
      priority: "medium",
      title: "Keep the current pattern and measure again",
      explanation: "The current overview does not show a major correction, so the safest move is to repeat the winning structure.",
      nextStep: "Publish the next batch using the same platform and format mix, then compare the next range.",
      metric: "Consistency",
    });
  }

  return recommendations.slice(0, 4);
}

function buildMetricCards(summary: AnalyticsSummaryResponse | null, connections: ConnectionDocument[], dateRange: DateRangeKey): OverviewMetricCard[] {
  const dataset = summary?.globalData;
  const audienceValue = dataset ? parseCompactNumber(dataset.vitals.audience.value) : 0;
  const reachValue = dataset ? parseCompactNumber(dataset.vitals.reach.value) : 0;
  const engagementValue = dataset ? parseCompactNumber(dataset.vitals.engagement.value) : 0;
  const posts = dataset?.topPosts?.length ?? 0;
  const connectedPlatforms = new Set(connections.map((connection) => connection.platform)).size;

  return [
    {
      label: "Connected accounts",
      value: `${connections.length}`,
      delta: `${connectedPlatforms} active platforms`,
      trend: connections.length > 0 ? "up" : "neutral",
      note: "Accounts connected to this workspace",
    },
    {
      label: "Total audience",
      value: formatCompactNumber(audienceValue),
      delta: dataset ? formatSigned(dataset.vitals.audience.change) : "+0",
      trend: dataset && dataset.vitals.audience.trend === "down" ? "down" : "up",
      note: `Audience size across the ${dateRange} window`,
    },
    {
      label: "Reach",
      value: formatCompactNumber(reachValue),
      delta: dataset ? formatSigned(dataset.vitals.reach.change) : "+0",
      trend: dataset && dataset.vitals.reach.trend === "down" ? "down" : "up",
      note: "Impressions across connected platforms",
    },
    {
      label: "Engagements",
      value: formatCompactNumber(engagementValue),
      delta: dataset ? formatSigned(dataset.vitals.engagement.change) : "+0",
      trend: dataset && dataset.vitals.engagement.trend === "down" ? "down" : "up",
      note: `${posts} top posts shaped this result`,
    },
    {
      label: "Click activity",
      value: dataset ? formatCompactNumber(parseCompactNumber(dataset.vitals.clicks.value)) : "0",
      delta: dataset ? formatSigned(dataset.vitals.clicks.change) : "+0",
      trend: dataset && dataset.vitals.clicks.trend === "down" ? "down" : "neutral",
      note: "Click intent is strongest when CTA language is clear",
    },
  ];
}

function buildRecentGeneratedPosts(posts: PostGenerationDocument[], dateRange: DateRangeKey): OverviewRecentPost[] {
  return posts
    .filter((post) => withinRange(post.createdAt, dateRange))
    .sort((a, b) => {
      const left = toDate(a.createdAt)?.getTime() ?? 0;
      const right = toDate(b.createdAt)?.getTime() ?? 0;
      return right - left;
    })
    .slice(0, 6)
    .map((post) => ({
      id: post._id?.toString?.() || normalizeTitle(post),
      title: normalizeTitle(post),
      platform: extractPlatformFromGeneration(post),
      objective: String(post.input?.objective ?? post.status ?? "draft"),
      status: post.status,
      createdAt: toDate(post.createdAt)?.toISOString() || new Date().toISOString(),
    }));
}

export function buildAnalyticsOverview({
  summary,
  persona,
  connections,
  postGenerations,
  dateRange,
}: BuildAnalyticsOverviewInput): AnalyticsOverview {
  const leaderboard = buildPlatformLeaderboard(summary);
  const contentWinners = buildContentWinners(summary?.globalData.topPosts ?? []);

  const personaScore = {
    audience: scoreAudienceFit(persona, postGenerations),
    tone: scoreToneFit(persona, postGenerations),
    format: scoreFormatFit(persona, summary?.globalData.topPosts ?? [], postGenerations),
    objective: scoreObjectiveFit(persona, postGenerations),
    brand: scoreBrandFit(persona, postGenerations),
  };

  const overallScore = Math.round(
    (personaScore.audience + personaScore.tone + personaScore.format + personaScore.objective + personaScore.brand) / 5,
  );

  const overallSummary =
    overallScore >= 85
      ? "Your current post mix strongly supports the saved persona."
      : overallScore >= 70
        ? "Your strategy is broadly aligned, but a few parts need tightening."
        : overallScore >= 50
          ? "Your posts and persona are partially aligned, but the message is not yet consistent."
          : "Your content strategy needs a clearer link back to the saved persona.";

  const connectedAccounts = buildConnectedAccounts(connections);
  const recentGeneratedPosts = buildRecentGeneratedPosts(postGenerations, dateRange);

  const personaAlignment: OverviewPersonaAlignment = {
    score: overallScore,
    summary: overallSummary,
    audience: personaScore.audience,
    tone: personaScore.tone,
    format: personaScore.format,
    objective: personaScore.objective,
    brand: personaScore.brand,
  };

  return {
    snapshot: buildMetricCards(summary, connections, dateRange),
    platformLeaderboard: leaderboard,
    bestPlatform: leaderboard[0] ?? null,
    weakestPlatform: leaderboard.length > 0 ? leaderboard[leaderboard.length - 1] : null,
    contentWinners,
    personaAlignment,
    actionRecommendations: buildRecommendations(summary, personaAlignment, leaderboard, contentWinners, postGenerations, dateRange),
    audienceSummary: buildAudienceSummary(persona),
    signalHighlights: buildSignalHighlights(summary, leaderboard),
    connectedAccounts,
    recentGeneratedPosts,
  };
}
