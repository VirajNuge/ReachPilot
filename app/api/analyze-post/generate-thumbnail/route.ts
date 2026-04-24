import { NextResponse } from "next/server";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}

/**
 * Generate thumbnail image using AI based on design prompt
 * 
 * This endpoint accepts a text prompt and generates an image.
 * Currently supports multiple generation services:
 * 1. Pollinations.ai (free, no API key required) - DEFAULT
 * 2. OpenAI DALL-E (requires OPENAI_API_KEY)
 * 3. Stability AI (requires STABILITY_API_KEY)
 */
export async function POST(request: Request) {
  try {
    let body: { prompt?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid request body — expected JSON with prompt" },
        { status: 400, headers: corsHeaders },
      );
    }

    const { prompt } = body;
    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      return NextResponse.json(
        { error: "prompt is required and must be a non-empty string" },
        { status: 400, headers: corsHeaders },
      );
    }

    console.log("[generate-thumbnail] Generating image with prompt:", prompt.substring(0, 100) + "...");

    // Strategy 1: Use Pollinations.ai (free, no API key, instant)
    // This service generates images via URL - no API call needed
    const pollinationsUrl = generatePollinationsUrl(prompt);
    
    // Verify the image is accessible
    try {
      const imageResponse = await fetch(pollinationsUrl, { method: "HEAD" });
      if (imageResponse.ok) {
        console.log("[generate-thumbnail] Successfully generated image via Pollinations.ai");
        return NextResponse.json(
          {
            success: true,
            imageUrl: pollinationsUrl,
            service: "pollinations",
          },
          { headers: corsHeaders },
        );
      }
    } catch (pollinationsError) {
      console.warn("[generate-thumbnail] Pollinations.ai failed, trying fallback:", pollinationsError);
    }

    // Strategy 2: Fallback to OpenAI DALL-E (if API key exists)
    const openaiKey = process.env.OPENAI_API_KEY;
    if (openaiKey) {
      try {
        const dalleUrl = await generateWithDallE(prompt, openaiKey);
        return NextResponse.json(
          {
            success: true,
            imageUrl: dalleUrl,
            service: "openai",
          },
          { headers: corsHeaders },
        );
      } catch (dalleError) {
        console.error("[generate-thumbnail] DALL-E generation failed:", dalleError);
      }
    }

    // Strategy 3: Use Stability AI (if API key exists)
    const stabilityKey = process.env.STABILITY_API_KEY;
    if (stabilityKey) {
      try {
        const stabilityUrl = await generateWithStability(prompt, stabilityKey);
        return NextResponse.json(
          {
            success: true,
            imageUrl: stabilityUrl,
            service: "stability",
          },
          { headers: corsHeaders },
        );
      } catch (stabilityError) {
        console.error("[generate-thumbnail] Stability AI generation failed:", stabilityError);
      }
    }

    // If all strategies fail, return the Pollinations URL anyway
    // (it might load slowly but will work eventually)
    console.log("[generate-thumbnail] All services failed, returning Pollinations URL as last resort");
    return NextResponse.json(
      {
        success: true,
        imageUrl: pollinationsUrl,
        service: "pollinations",
        warning: "Image generation may take a moment to load",
      },
      { headers: corsHeaders },
    );

  } catch (error: unknown) {
    console.error("[generate-thumbnail] Unexpected error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate thumbnail",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500, headers: corsHeaders },
    );
  }
}

/**
 * Generate image URL using Pollinations.ai
 * Free service that generates images on-demand via URL
 */
function generatePollinationsUrl(prompt: string): string {
  // Pollinations.ai accepts prompts as URL parameters
  // Format: https://image.pollinations.ai/prompt/{encoded-prompt}
  const encodedPrompt = encodeURIComponent(prompt);
  const width = 1024;
  const height = 1024;
  return `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&nologo=true&enhance=true`;
}

/**
 * Generate image using OpenAI DALL-E
 */
async function generateWithDallE(prompt: string, apiKey: string): Promise<string> {
  const response = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`DALL-E API error: ${errorData.error?.message || response.statusText}`);
  }

  const data = await response.json();
  return data.data[0].url;
}

/**
 * Generate image using Stability AI
 */
async function generateWithStability(prompt: string, apiKey: string): Promise<string> {
  const response = await fetch(
    "https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        text_prompts: [{ text: prompt }],
        cfg_scale: 7,
        height: 1024,
        width: 1024,
        samples: 1,
        steps: 30,
      }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Stability AI error: ${errorData.message || response.statusText}`);
  }

  const data = await response.json();
  const base64Image = data.artifacts[0].base64;
  
  // Convert base64 to data URL
  return `data:image/png;base64,${base64Image}`;
}
