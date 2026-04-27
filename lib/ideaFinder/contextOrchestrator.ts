// ============================================================
// Idea Finder — Context Orchestrator
// Fetches persona + analysis + post history in parallel,
// then assembles a mode-aware IdeaFinderContext slice.
// ============================================================

import { connectToDatabase } from "../mongodb";
import {
  getPersonaByUserAndAccount,
  type PersonaDocument,
} from "../models/persona";
import { buildContentGenerationContext } from "../personaPromptBuilder";
import type { RawAnalysisData } from "../types/analysis";
import type {
  IdeaMode,
  IdeaPlatform,
  IdeaFinderContext,
  PersonaContextSlice,
  AnalysisContextSlice,
  PostHistorySlice,
} from "./types";

// ---- Internal helpers ----

function cleanStr(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

function cleanArr(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.map((i) => (typeof i === "string" ? i.trim() : "")).filter(Boolean);
}

/** Build a compact persona slice from the full PersonaDocument. */
function buildPersonaSlice(persona: PersonaDocument): PersonaContextSlice {
  const summary = buildContentGenerationContext(persona);

  const audienceParts: string[] = [];
  if (persona.audienceRole) audienceParts.push(`Role: ${persona.audienceRole}`);
  if (persona.audienceSegments?.length)
    audienceParts.push(`Segments: ${persona.audienceSegments.join(", ")}`);
  if (persona.painPoints)
    audienceParts.push(`Pain points: ${persona.painPoints}`);
  if (persona.audienceDesiredOutcome)
    audienceParts.push(`Desired outcome: ${persona.audienceDesiredOutcome}`);

  const voiceParts: string[] = [];
  if (persona.writingStyle)
    voiceParts.push(`Writing style: ${persona.writingStyle}`);
  if (persona.emojiUsage) voiceParts.push(`Emoji: ${persona.emojiUsage}`);
  if (persona.influencerStyle)
    voiceParts.push(`Voice to emulate: ${persona.influencerStyle}`);
  if (persona.toneSliders) {
    voiceParts.push(
      `Tone: F/C=${persona.toneSliders.formalCasual} S/P=${persona.toneSliders.seriousPlayful} I/I=${persona.toneSliders.inspiringInformative} D/S=${persona.toneSliders.dataDriven}`
    );
  }

  return {
    summary,
    audience: audienceParts.join(". "),
    voice: voiceParts.join(". "),
    writingSamples: cleanStr(persona.writingSamples)
      ? [cleanStr(persona.writingSamples)]
      : [],
    doNotTalk: cleanStr(persona.doNotTalk)
      ? cleanStr(persona.doNotTalk)
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [],
    contentThemes: cleanArr(persona.contentThemes),
    contentPillars: [], // populated from analysis below
    uniquePOV: cleanStr(persona.uniquePOV),
  };
}

/** Extract analysis slice from the latest analysis session data. */
function buildAnalysisSlice(
  data: RawAnalysisData | null
): AnalysisContextSlice {
  if (!data) {
    return {
      ideaBank: [],
      contentPillars: [],
      viralRecipe: [],
      questionCloud: [],
      postDNA: [],
      voiceSpectrum: { signatureWords: [], avoidWords: [] },
    };
  }

  return {
    ideaBank: Array.isArray(data.ideaBank)
      ? data.ideaBank.map((i) => ({
          concept: cleanStr(i.concept),
          impact: cleanStr(i.impact),
        }))
      : [],

    contentPillars: Array.isArray(data.contentPillars)
      ? data.contentPillars.map((p) => ({
          name: cleanStr(p.name),
          score: typeof p.percentage === "number" ? p.percentage : 0,
        }))
      : [],

    viralRecipe: Array.isArray(data.viralRecipe)
      ? data.viralRecipe.map((r) => ({
          hookType: cleanStr(r.hookType),
          whyItWorked: cleanStr(r.whyItWorked),
        }))
      : [],

    questionCloud: Array.isArray(data.questionCloud)
      ? data.questionCloud.map((q) => ({
          keyword: cleanStr(q.word),
          weight: typeof q.count === "number" ? q.count : undefined,
        }))
      : [],

    postDNA: Array.isArray(data.postDNA)
      ? data.postDNA.map((d) => ({
          hookType: cleanStr(d.hookType),
          format: cleanStr(d.format),
          topic: cleanStr(d.topic),
          verdict: cleanStr(d.verdict),
        }))
      : [],

    voiceSpectrum: data.voiceSpectrum
      ? {
          signatureWords: Array.isArray(data.voiceSpectrum.signatureWords)
            ? data.voiceSpectrum.signatureWords
            : [],
          avoidWords: [], // voiceSpectrum doesn't have avoidWords directly; derive from axes if needed
        }
      : { signatureWords: [], avoidWords: [] },

    competitorGap: data.competitorGap
      ? cleanStr(data.competitorGap.topOpportunity)
      : undefined,

    missingKeywords: Array.isArray(data.keywords?.missing)
      ? data.keywords.missing
      : undefined,
  };
}

/** Build post history slice from recent postGenerations docs. */
function buildPostHistorySlice(
  docs: Array<Record<string, unknown>>
): PostHistorySlice {
  return {
    recentPosts: docs.map((d) => ({
      caption: cleanStr(d.caption ?? d.generatedCaption),
      hooks: Array.isArray(d.hooks)
        ? d.hooks.map((h: unknown) => (typeof h === "string" ? h : ""))
        : [],
      contentScore:
        typeof d.contentScore === "number" ? d.contentScore : 0,
      platform: cleanStr(d.platform),
    })),
  };
}

// ---- Public API ----

/**
 * Fetch all data sources in parallel and assemble an IdeaFinderContext.
 * The returned context is ready to be passed to the prompt builders.
 */
export async function assembleIdeaFinderContext(
  userId: string,
  accountId: string,
  mode: IdeaMode,
  platform: IdeaPlatform,
  options?: { importPersona?: boolean }
): Promise<IdeaFinderContext> {
  const { db } = await connectToDatabase();
  const shouldImportPersona = options?.importPersona ?? true;

  // Parallel data fetch
  const [persona, analysisSession, postDocs] = await Promise.all([
    shouldImportPersona ? getPersonaByUserAndAccount(userId, accountId) : Promise.resolve(null),
    db
      .collection("analysis_sessions")
      .findOne(
        { userId },
        { sort: { timestamp: -1 } }
      ),
    // Post history — limit based on mode
    db
      .collection("postGenerations")
      .find({ userId, accountId })
      .sort({ createdAt: -1 })
      .limit(mode === "repurpose" ? 20 : 10)
      .toArray(),
  ]);

  // Build slices
  const personaSlice = persona
    ? buildPersonaSlice(persona)
    : {
        summary: "",
        audience: "",
        voice: "",
        writingSamples: [],
        doNotTalk: [],
        contentThemes: [],
        contentPillars: [],
        uniquePOV: "",
      };

  const analysisData = (analysisSession?.data as RawAnalysisData) ?? null;
  const analysisSlice = buildAnalysisSlice(analysisData);

  // Cross-populate: if persona has no contentPillars, use analysis ones
  if (!personaSlice.contentPillars.length && analysisSlice.contentPillars.length) {
    personaSlice.contentPillars = analysisSlice.contentPillars.map((p) => p.name);
  }

  const postHistorySlice = buildPostHistorySlice(postDocs);

  return {
    persona: personaSlice,
    analysis: analysisSlice,
    postHistory: postHistorySlice,
    platform: {
      target: platform === "all" ? "all platforms" : platform,
    },
  };
}
