import { NextRequest, NextResponse } from "next/server";
import { getAuthFromCookies } from "@/lib/auth";
import { getAuthFromRequest } from "@/lib/auth";
import { getPersonaByUserAndAccount } from "@/lib/models/persona";

/**
 * GET /api/persona?accountId=xxx
 * Returns the current user's persona for the given account (or their default persona).
 * Used by the PostGenerator wizard to import brand details from persona.
 */
export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthFromRequest(req);
    if (!auth?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const accountId = searchParams.get("accountId") ?? undefined;

    const persona = await getPersonaByUserAndAccount(auth.userId, accountId);

    if (!persona) {
      return NextResponse.json({ persona: null }, { status: 200 });
    }

    // Return all fields needed by the wizard and post generation
    return NextResponse.json({
      persona: {
        // Identity (Step 1)
        personaName: persona.personaName,
        userRole: persona.userRole,
        industry: persona.industry,
        businessStage: persona.businessStage,
        tagline: persona.tagline,
        websiteUrl: persona.websiteUrl,
        // Audience (Step 2)
        audienceRole: persona.audienceRole ?? [],
        audienceSegments: persona.audienceSegments ?? [],
        region: persona.region,
        education: persona.education,
        painPoints: persona.painPoints,
        audienceGoals: persona.audienceGoals ?? [],
        audienceDesiredOutcome: persona.audienceDesiredOutcome,
        // Objectives (Step 3)
        primaryObjective: persona.primaryObjective ?? [],
        conversionTargets: persona.conversionTargets?.length
          ? persona.conversionTargets
          : persona.conversionGoal ?? [],
        contentMix: persona.contentMix ?? [],
        contentThemes: persona.contentThemes ?? [],
        conversionGoal: persona.conversionGoal,
        // Tone & Voice (Step 4)
        toneSliders: persona.toneSliders,
        writingStyle: persona.writingStyle,
        emojiUsage: persona.emojiUsage,
        influencerStyle: persona.influencerStyle,
        // Brand identity
        brandArchetype: persona.brandArchetype,
        coreValues: persona.coreValues,
        brandColorHex: persona.brandColorHex,
        // Brand style fields (Step 6)
        logoUrl: persona.logoUrl ?? "",
        colorPalette: persona.colorPalette?.length
          ? persona.colorPalette
          : persona.brandColorHex
          ? [persona.brandColorHex]
          : [],
        fontFamily: persona.fontFamily ?? "",
      },
    });
  } catch (error) {
    console.error("GET /api/persona error:", error);
    return NextResponse.json({ error: "Request failed" }, { status: 500 });
  }
}
