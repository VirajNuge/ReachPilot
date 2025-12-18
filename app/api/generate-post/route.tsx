import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

/* -------------------------------------------------------
   ROBUST JSON EXTRACTOR
------------------------------------------------------- */
function extractJson(raw: string) {
  let text = raw.trim();

  // Remove Markdown fences anywhere
  text = text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  // Try direct JSON
  try {
    return JSON.parse(text);
  } catch {}

  // Extract content between first { and last }
  const first = text.indexOf("{");
  const last = text.lastIndexOf("}");
  if (first !== -1 && last !== -1 && last > first) {
    const sliced = text.slice(first, last + 1);
    try {
      return JSON.parse(sliced);
    } catch {}
  }

  // Try parse as array → use first object
  if (text.startsWith("[")) {
    try {
      const arr = JSON.parse(text);
      if (Array.isArray(arr) && arr.length > 0) return arr[0];
    } catch {}
  }

  // FAIL → return null (caller will handle)
  return null;
}

/* -------------------------------------------------------
   Ensure correct type
------------------------------------------------------- */
const ensureString = (v: any) =>
  typeof v === "string" ? v : v == null ? "" : String(v);
const ensureArray = (v: any) => (Array.isArray(v) ? v : []);
const ensureObject = (v: any) =>
  v && typeof v === "object" && !Array.isArray(v) ? v : {};

/* -------------------------------------------------------
   POST ROUTE
------------------------------------------------------- */
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { success: false, error: "Missing GEMINI_API_KEY" },
        { status: 500 }
      );
    }

    // Build prompt
    const { buildSinglePostPrompt } = await import("@/lib/singlePostPrompt");

    const promptText = buildSinglePostPrompt(data);

    /* -------------------------------------------------------
       Prepare Gemini multimodal parts
    ------------------------------------------------------- */
    const promptParts: any[] = [{ text: promptText }];

    if (Array.isArray(data.images)) {
      for (const img of data.images) {
        if (!img.base64) continue;
        promptParts.push({
          inlineData: {
            data: img.base64.split(",")[1],
            mimeType: img.mimeType || "image/png",
          },
        });
      }

      promptParts.push({
        text: "CRITICAL: Uploaded images MUST NOT be redrawn. Return them in JSON under `input_images`.",
      });
    }

    /* -------------------------------------------------------
       Call Gemini
    ------------------------------------------------------- */
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const result = await model.generateContent(promptParts);

    const raw = result.response.text();
    // LOG RAW OUTPUT ALWAYS
    console.log("🔵 RAW GEMINI OUTPUT:\n", raw);

    /* -------------------------------------------------------
       SAFE PARSE
    ------------------------------------------------------- */
    const json = extractJson(raw);

    if (!json) {
      console.error("❌ Could not parse JSON:\n", raw);
      return NextResponse.json(
        {
          success: false,
          error: "Model returned invalid JSON",
          raw,
        },
        { status: 500 }
      );
    }

    /* -------------------------------------------------------
       NORMALIZE EXPECTED FIELDS
    ------------------------------------------------------- */
    json.type = ensureString(json.type || "single");
    json.headline = ensureString(json.headline);
    json.content = ensureString(json.content);
    json.caption = ensureString(json.caption);
    json.visual_description = ensureString(json.visual_description);

    json.strategy = {
      best_posting_day: ensureString(json.strategy?.best_posting_day),
      best_posting_time: ensureString(json.strategy?.best_posting_time),
      why_this_works: ensureString(json.strategy?.why_this_works),
      algorithm_alignment: ensureString(json.strategy?.algorithm_alignment),
      engagement_tips: ensureArray(json.strategy?.engagement_tips),
      visual_tips: ensureArray(json.strategy?.visual_tips),
      caption_tips: ensureArray(json.strategy?.caption_tips),
    };

    json.engagement_score = {
      score_value:
        typeof json.engagement_score?.score_value === "number"
          ? json.engagement_score.score_value
          : 0,
      predicted_performance: ensureString(
        json.engagement_score?.predicted_performance
      ),
      score_explanation: ensureString(json.engagement_score?.score_explanation),
      platform_factors: ensureObject(json.engagement_score?.platform_factors),
      content_factors: ensureObject(json.engagement_score?.content_factors),
      audience_factors: ensureObject(json.engagement_score?.audience_factors),
    };

    json.hashtags = ensureArray(json.hashtags);
    json.alt_text = ensureString(json.alt_text);
    json.seo_keywords = ensureArray(json.seo_keywords);
    json.thumbnail_text = ensureString(json.thumbnail_text);

    json.cross_platform_reposts = {
      instagram: ensureString(json.cross_platform_reposts?.instagram),
      linkedin: ensureString(json.cross_platform_reposts?.linkedin),
      facebook: ensureString(json.cross_platform_reposts?.facebook),
      pinterest: ensureString(json.cross_platform_reposts?.pinterest),
      twitter: ensureString(json.cross_platform_reposts?.twitter),
    };

    // Important for Imagen 4
    json.input_images = Array.isArray(json.input_images)
      ? json.input_images
      : data.images || [];

    json.image_request = ensureString(json.image_request);

    /* -------------------------------------------------------
       SUCCESS
    ------------------------------------------------------- */
    return NextResponse.json({
      success: true,
      data: json,
    });
  } catch (err: any) {
    console.error("❌ /api/generate-post ERROR:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Unknown error" },
      { status: 500 }
    );
  }
}
