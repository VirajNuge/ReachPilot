import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/withAuth";
import { connectToDatabase } from "@/lib/mongodb";
import type { PostGenerationDocument, PostPlatform, PostGenerationInput } from "@/lib/types/postGeneration";

export async function POST(req: NextRequest) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;
    const auth = authResult;

    const body = await req.json();
    const { accountId, caption, captions: customCaptions, imageUrl, platformImages, platforms, scheduledDate } = body;

    if (!accountId || (!caption && !customCaptions) || !platforms || !Array.isArray(platforms) || platforms.length === 0) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const col = db.collection<PostGenerationDocument>("postGenerations");

    const now = new Date();

    // Use provided captions map or fallback to single caption
    const finalCaptions: Record<string, string> = customCaptions || {};
    if (!customCaptions) {
      for (const p of platforms) {
        finalCaptions[p] = caption;
      }
    }

    const firstCaption = Object.values(finalCaptions)[0] || "";
    const sanitizedPlatforms = (platforms as unknown[])
      .filter((p): p is PostPlatform => typeof p === "string")
      .map((p) => p as PostPlatform);

    const defaultInput: PostGenerationInput = {
      objective: "engagement",
      targetAudiences: ["general_audience"],
      coreMessage: firstCaption || "Custom post",
      platforms: sanitizedPlatforms,
      brandType: "personal_brand",
      visualStyles: ["minimal"],
      imageGenType: "upload_image",
      brandAssets: {
        colorPalette: ["#0052FF"],
        watermark: false,
      },
      tones: ["friendly"],
      ctas: ["none"],
      emojiLevel: "low",
      hashtagIntensity: "low",
    };

    const newDraft: Omit<PostGenerationDocument, "_id"> = {
      userId: auth.userId,
      accountId,
      createdAt: now,
      updatedAt: now,
      isCustom: true,
      status: scheduledDate ? "scheduled" : "draft",
      ...(scheduledDate ? { scheduledDate: new Date(scheduledDate) } : {}),

      output: {
        captions: finalCaptions,
        imageUrl,
        ...(platformImages ? { platformImages } : {}),
        hashtags: { highReach: [], niche: [], branded: [] },
        imagePrompt: "",
        sizes: {},
        headline: firstCaption.slice(0, 50),
        subtext: "",
        designStyle: "minimal",
      },
      input: {
        ...defaultInput,
      },
    };

    const result = await col.insertOne(newDraft);

    return NextResponse.json({ id: result.insertedId.toString() });
  } catch (error) {
    console.error("Custom post creation error:", error);
    return NextResponse.json(
      { error: "Failed to create custom post" },
      { status: 500 }
    );
  }
}
