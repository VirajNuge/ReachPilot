import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import {
  createCaptionTemplate,
  type TemplatePlatform,
} from "@/lib/models/captionTemplates";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}

const CACHE_FILE_PATH = path.join(process.cwd(), "post_analysis_cache.json");

function normalisePlatform(raw: string): TemplatePlatform {
  const map: Record<string, TemplatePlatform> = {
    x: "x",
    twitter: "x",
    linkedin: "linkedin",
    instagram: "instagram_post",
    instagram_post: "instagram_post",
    facebook: "facebook",
  };
  return map[raw?.toLowerCase()] ?? "x";
}

export async function POST(request: Request) {
  try {
    let body: { analysisId?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid request body — expected JSON with analysisId" },
        { status: 400, headers: corsHeaders },
      );
    }

    const { analysisId } = body;
    if (!analysisId) {
      return NextResponse.json(
        { error: "analysisId is required" },
        { status: 400, headers: corsHeaders },
      );
    }

    // Read cache
    let cacheRaw: string;
    try {
      cacheRaw = await fs.readFile(CACHE_FILE_PATH, "utf-8");
    } catch {
      return NextResponse.json(
        { error: "No post analysis cache found." },
        { status: 404, headers: corsHeaders },
      );
    }

    let cacheArray: Array<{
      id: string;
      analysis: Record<string, unknown>;
      postData: Record<string, unknown>;
      timestamp: string;
    }>;
    try {
      const parsed = JSON.parse(cacheRaw);
      if (!Array.isArray(parsed)) throw new Error("Cache is not an array");
      cacheArray = parsed;
    } catch {
      return NextResponse.json(
        { error: "Post analysis cache is malformed." },
        { status: 500, headers: corsHeaders },
      );
    }

    const cacheEntry = cacheArray.find((item) => item.id === analysisId);
    if (!cacheEntry) {
      return NextResponse.json(
        { error: "Analysis not found in cache." },
        { status: 404, headers: corsHeaders },
      );
    }

    const { analysis, postData } = cacheEntry;

    // Check images
    const images = Array.isArray(postData.images) ? postData.images as string[] : [];
    if (images.length === 0) {
      return NextResponse.json(
        { error: "No image found in this post — visual template requires an image." },
        { status: 422, headers: corsHeaders },
      );
    }

    const visualStrategy = analysis.visualStrategy as {
      category: string;
      colors: string[];
      prompts: { midjourney: string; dalle: string };
    } | null;

    if (!visualStrategy) {
      return NextResponse.json(
        { error: "Visual strategy data missing from analysis." },
        { status: 422, headers: corsHeaders },
      );
    }

    const platform = typeof postData.platform === "string" ? postData.platform : "x";
    const normPlatform = normalisePlatform(platform);
    const author = typeof postData.author === "string" ? postData.author : "Unknown";
    const { category, prompts } = visualStrategy;

    // Build a concise visual prompt (no Midjourney/DALL-E labels)
    const visualPrompt = prompts.midjourney || prompts.dalle || "";

    const templateName = `${category} Visual Style — ${author}`;
    const description =
      `A visual design template inspired by a ${category.toLowerCase()} aesthetic. ` +
      `Captured from a real post with engaging imagery. ` +
      `Use this as a reference when creating visuals for similar content.`;

    const structure =
      `Visual Style: ${category}\n` +
      `Design Overview:\n${visualPrompt}`;

    const templateData = {
      name: templateName,
      description,
      category: "thought_leadership" as const,
      platforms: [normPlatform] as TemplatePlatform[],
      platformVariants: [
        {
          platform: normPlatform,
          structure,
          examplePost: images[0],
        },
      ],
      isBundle: false,
      matchKeywords: ["visual", "aesthetic", "design", category.toLowerCase()],
      bestForObjectives: ["increase_engagement", "build_authority"],
      isActive: true,
      sortOrder: 999,
    };

    let insertedId: string;
    try {
      insertedId = await createCaptionTemplate(templateData);
    } catch (dbErr) {
      console.error("[generate-visual-template] DB insert error:", dbErr);
      return NextResponse.json(
        { error: "Failed to save template to database" },
        { status: 500, headers: corsHeaders },
      );
    }

    console.log(`[generate-visual-template] Saved visual template "${templateName}" (id: ${insertedId})`);

    return NextResponse.json(
      {
        success: true,
        templateId: insertedId,
        templateName,
        description,
        visualStyle: category,
        prompt: visualPrompt,
        previewImage: images[0],
      },
      { headers: corsHeaders },
    );
  } catch (error: unknown) {
    console.error("[generate-visual-template] Unexpected error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate visual template",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500, headers: corsHeaders },
    );
  }
}
