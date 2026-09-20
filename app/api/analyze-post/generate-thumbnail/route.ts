import { NextResponse } from "next/server";
import { generateImage, getSafeAiError } from "@/lib/ai/openrouter";

const corsHeaders = {
  "Access-Control-Allow-Origin": process.env.EXTENSION_ALLOWED_ORIGINS?.split(",")[0]?.trim() || "",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { prompt?: unknown };
    if (typeof body.prompt !== "string" || body.prompt.trim().length === 0) {
      return NextResponse.json(
        { error: "prompt is required and must be a non-empty string" },
        { status: 400, headers: corsHeaders },
      );
    }
    if (body.prompt.length > 12_000) {
      return NextResponse.json(
        { error: "prompt is too long" },
        { status: 413, headers: corsHeaders },
      );
    }

    const result = await generateImage({ prompt: body.prompt.trim(), count: 1 });
    const image = result.images[0];
    return NextResponse.json(
      {
        success: true,
        imageUrl: `data:${image.mimeType};base64,${image.data}`,
        service: "openrouter",
        model: result.model,
        requestId: result.requestId,
      },
      { headers: corsHeaders },
    );
  } catch (error) {
    const safe = getSafeAiError(error);
    console.error("[generate-thumbnail] AI request failed", { code: safe.code, requestId: safe.requestId });
    return NextResponse.json(
      { error: safe.message, code: safe.code, requestId: safe.requestId },
      { status: safe.code === "rate_limit" ? 429 : 502, headers: corsHeaders },
    );
  }
}
