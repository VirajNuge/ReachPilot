import { NextRequest, NextResponse } from "next/server";
import { getAuthFromCookies } from "@/lib/auth";
import {
  extractTemplateFromPost,
  generatePlatformVariants,
} from "@/lib/postGeneration/templateExtractor";
import {
  saveUserTemplate,
  findExistingTemplate,
  ensureTemplateIndexes,
} from "@/lib/models/userSavedPostTemplate";
import type { Platform } from "@/lib/models/userSavedPostTemplate";
import {
  createWritingStyle,
  getAllWritingStyles,
} from "@/lib/models/adminStyles";

const VALID_PLATFORMS: Platform[] = ["x", "linkedin", "facebook", "instagram", "pinterest", "threads"];

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user
    const auth = await getAuthFromCookies();
    if (!auth?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse request
    const body = await request.json();
    const {
      platform,
      postUrl,
      caption: rawCaption,
      content,
      mediaUrls: rawMediaUrls = [],
      images = [],
      videos = [],
      authorUsername: rawAuthorUsername,
      handle,
      authorName,
      metrics,
    } = body;

    const caption = typeof rawCaption === "string" && rawCaption.trim().length > 0
      ? rawCaption
      : typeof content === "string"
        ? content
        : "";
    const authorUsername =
      typeof rawAuthorUsername === "string" && rawAuthorUsername.trim().length > 0
        ? rawAuthorUsername
        : typeof handle === "string"
          ? handle.replace(/^@/, "")
          : "";
    const mediaUrls = Array.isArray(rawMediaUrls) && rawMediaUrls.length > 0
      ? rawMediaUrls
      : [...(Array.isArray(images) ? images : []), ...(Array.isArray(videos) ? videos : [])];

    const normalizedMetrics = normalizeMetrics(platform as Platform, metrics);

    // Create indexes lazily on write so template reuse/search works even on fresh installs
    await ensureTemplateIndexes();

    // 3. Validate required fields
    if (!platform || !caption) {
      return NextResponse.json(
        { error: "Missing required fields: platform, caption" },
        { status: 400 }
      );
    }

    if (!VALID_PLATFORMS.includes(platform as Platform)) {
      return NextResponse.json(
        { error: `Invalid platform: ${platform}` },
        { status: 400 }
      );
    }

    if (typeof caption !== "string" || caption.trim().length < 10) {
      return NextResponse.json(
        { error: "Caption must be at least 10 characters" },
        { status: 400 }
      );
    }

    // 4. Check for duplicate
    if (postUrl) {
      const existing = await findExistingTemplate(auth.userId, postUrl);
      if (existing) {
        return NextResponse.json(
          {
            error: "You've already saved this post",
            templateId: existing._id?.toString(),
          },
          { status: 409 }
        );
      }
    }

    // 5. Extract template using AI
    let extractionResult;
    try {
      extractionResult = await extractTemplateFromPost({
        platform: platform as Platform,
        caption: caption.trim(),
        mediaUrls,
        metrics: normalizedMetrics,
        authorUsername,
      });
    } catch (error) {
      console.error("AI extraction error:", error);
      return NextResponse.json(
        {
          error: "Unable to extract coherent template. Try a post with clearer structure.",
          code: "EXTRACTION_FAILED",
        },
        { status: 400 }
      );
    }

    // 6. Check confidence threshold
    if (extractionResult.confidence < 50) {
      return NextResponse.json(
        {
          error: "Unable to extract coherent template. Try a post with clearer structure.",
          code: "EXTRACTION_FAILED",
        },
        { status: 400 }
      );
    }

    // 7. Generate platform variants
    let variants;
    try {
      variants = await generatePlatformVariants(
        extractionResult.template,
        platform as Platform,
        extractionResult.platformSuggestions
      );
    } catch (error) {
      console.error("Variant generation error:", error);
      // Continue without variants if generation fails
      variants = [
        {
          platform: platform as Platform,
          structure: extractionResult.template.structure,
          confidence: extractionResult.confidence,
        },
      ];
    }

    // 8. Save to MongoDB
    const savedId = await saveUserTemplate(auth.userId, auth.userId, {
      sourcePost: {
        platform: platform as Platform,
        postUrl: postUrl || "",
        authorUsername: authorUsername || "",
        authorName,
        caption: caption.trim(),
        mediaUrls,
        metrics: normalizedMetrics,
      },
      template: extractionResult.template,
      platformVariants: variants,
      aiAnalysis: {
        confidence: extractionResult.confidence,
        extractionMethod: extractionResult.method,
        aiModel: "openrouter/free",
      },
      metadata: {
        tags: [],
        isPublic: false,
        viewCount: 0,
        usageCount: 0,
        isArchived: false,
        source: "extension_capture",
      },
    });

    await mirrorAsWritingStyle({
      templateName: extractionResult.template.name,
      description: extractionResult.template.description,
      tone: extractionResult.template.tone,
      platform: platform as Platform,
      caption: caption.trim(),
      cta: extractionResult.template.cta,
      structure: extractionResult.template.structure,
    });

    // 9. Return success with preview
    return NextResponse.json({
      success: true,
      templateId: savedId,
      preview: {
        name: extractionResult.template.name,
        category: extractionResult.template.category,
        hooks: extractionResult.template.hooks,
        cta: extractionResult.template.cta,
        tone: extractionResult.template.tone,
      },
      platformVariants: variants.map((v) => ({
        platform: v.platform,
        applicable: true,
        confidence: v.confidence,
      })),
      savedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Save template error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

async function mirrorAsWritingStyle(input: {
  templateName: string;
  description: string;
  tone: string;
  platform: Platform;
  caption: string;
  cta: string;
  structure: string;
}) {
  try {
    const styles = await getAllWritingStyles(false);
    const duplicate = styles.find(
      (style) =>
        style.name === `X Template: ${input.templateName}` &&
        style.examplePost === input.caption
    );

    if (duplicate) {
      return;
    }

    await createWritingStyle({
      name: `X Template: ${input.templateName}`,
      description: `${input.description} Captured from ${input.platform.toUpperCase()} and mirrored for admin review.`,
      toneProfile: deriveToneProfile(input.tone, input.structure, input.caption),
      sentenceLength: deriveSentenceLengths(input.structure),
      emojiUsage: deriveEmojiUsage(input.caption),
      hashtagIntensity: deriveHashtagIntensity(input.caption),
      ctas: [input.cta].filter(Boolean),
      examplePost: input.caption,
      isActive: true,
    });
  } catch (error) {
    console.warn("[save-template] Failed to mirror writing style:", error);
  }
}

function deriveToneProfile(tone: string, structure: string, caption: string) {
  const normalizedTone = tone.toLowerCase();
  const hasData = /data|stat|number|research|proof|metric/i.test(`${tone} ${structure} ${caption}`);
  const isPlayful = /playful|fun|humor|light/i.test(normalizedTone);
  const isCasual = /casual|conversational|relaxed|friendly/i.test(normalizedTone);
  const isInformative = /informative|educational|teaching|guide/i.test(normalizedTone);

  return {
    formalCasual: isCasual ? 70 : 45,
    seriousPlayful: isPlayful ? 70 : 35,
    inspiringInformative: isInformative ? 75 : 55,
    dataDriven: hasData ? 75 : 45,
  };
}

function deriveSentenceLengths(structure: string) {
  const length = structure.length;
  if (length < 180) return ["short"];
  if (length < 420) return ["medium"];
  return ["long"];
}

function deriveEmojiUsage(caption: string): "none" | "minimal" | "moderate" | "heavy" {
  const emojiCount = Array.from(caption).filter((char) => /[\p{Extended_Pictographic}]/u.test(char)).length;
  if (emojiCount === 0) return "none";
  if (emojiCount <= 2) return "minimal";
  if (emojiCount <= 5) return "moderate";
  return "heavy";
}

function deriveHashtagIntensity(caption: string): "none" | "low" | "medium" | "high" {
  const hashtagCount = (caption.match(/#[\p{L}\p{N}_]+/gu) || []).length;
  if (hashtagCount === 0) return "none";
  if (hashtagCount <= 2) return "low";
  if (hashtagCount <= 5) return "medium";
  return "high";
}

function normalizeMetrics(platform: Platform, metrics: any) {
  if (!metrics || typeof metrics !== "object") {
    return undefined;
  }

  const likes = Number(metrics.likes || 0);
  const comments = Number(metrics.comments ?? metrics.replies ?? 0);
  const shares = Number(metrics.shares ?? metrics.retweets ?? 0);
  const views = metrics.views !== undefined ? Number(metrics.views) : undefined;

  if (platform === "x") {
    return {
      likes,
      comments,
      shares,
      views,
      replies: Number(metrics.replies ?? comments),
      retweets: Number(metrics.retweets ?? shares),
    };
  }

  return {
    likes,
    comments,
    shares,
    views,
  };
}
