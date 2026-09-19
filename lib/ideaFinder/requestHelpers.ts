import type { IdeaFinderRequest, IdeaMode, IdeaPlatform } from "./types";

const VALID_MODES: IdeaMode[] = [
  "voice-match",
  "trend-jacker",
  "repurpose",
  "gap-filler",
  "prism",
];

const VALID_PLATFORMS: IdeaPlatform[] = [
  "instagram",
  "linkedin",
  "x",
  "facebook",
  "pinterest",
  "all",
];

export function isValidRequest(body: unknown): body is IdeaFinderRequest {
  if (typeof body !== "object" || body === null) return false;
  const value = body as Record<string, unknown>;
  const hasValidCoreMessage =
    value.coreMessage === undefined || typeof value.coreMessage === "string";
  const hasValidPersonaToggle =
    value.importPersona === undefined || typeof value.importPersona === "boolean";
  return (
    typeof value.mode === "string" &&
    VALID_MODES.includes(value.mode as IdeaMode) &&
    typeof value.platform === "string" &&
    VALID_PLATFORMS.includes(value.platform as IdeaPlatform) &&
    typeof value.accountId === "string" &&
    value.accountId.length > 0 &&
    hasValidCoreMessage &&
    hasValidPersonaToggle
  );
}

export function buildEmptyIdeaFinderContext(platform: IdeaPlatform) {
  return {
    persona: {
      summary: "",
      audience: "",
      voice: "",
      writingSamples: [],
      doNotTalk: [],
      contentThemes: [],
      contentPillars: [],
      uniquePOV: "",
    },
    analysis: {
      ideaBank: [],
      contentPillars: [],
      viralRecipe: [],
      questionCloud: [],
      postDNA: [],
      voiceSpectrum: { signatureWords: [], avoidWords: [] },
    },
    postHistory: { recentPosts: [] },
    platform: { target: platform === "all" ? "all platforms" : platform },
  };
}

export function joinCandidateText(
  candidate: { content?: { parts?: Array<{ text?: string | null }> } } | undefined,
): string {
  const parts = candidate?.content?.parts;
  if (!parts?.length) return "";
  return parts
    .map((part) => (typeof part?.text === "string" ? part.text : ""))
    .join("")
    .trim();
}
