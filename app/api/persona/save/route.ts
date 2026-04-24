import { NextRequest, NextResponse } from "next/server";
import { upsertPersona } from "@/lib/models/persona";
import { getUserById } from "@/lib/models/user";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET || "reachpilot-secret-key";

async function getUserIdFromRequest(req: NextRequest): Promise<string | null> {
  try {
     const cookieStore = await cookies();
     const token = cookieStore.get("rp_token")?.value;
    if (!token) return null;

    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return (payload.userId as string) || null;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    // Get authenticated user ID from session cookie
    const sessionUserId = await getUserIdFromRequest(req);

    const body = await req.json();
    const { userId: bodyUserId, accountId, persona } = body;

    // Prefer session-derived userId for security; fall back to body userId
    const userId = sessionUserId || bodyUserId;

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized — please log in first." },
        { status: 401 }
      );
    }

    // Validate user exists
    const user = await getUserById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    if (!persona || !persona.personaName?.trim()) {
      return NextResponse.json(
        { error: "Persona name is required." },
        { status: 400 }
      );
    }

    // Guard: logoUrl must not exceed 200 KB when provided as a data URL
    const MAX_LOGO_BYTES = 200 * 1024; // 200 KB
    if (persona.logoUrl && typeof persona.logoUrl === "string") {
      const base64Match = persona.logoUrl.match(/^data:[^;]+;base64,(.+)$/);
      if (base64Match) {
        const estimatedBytes = Math.ceil((base64Match[1].length * 3) / 4);
        if (estimatedBytes > MAX_LOGO_BYTES) {
          return NextResponse.json(
            { error: "Logo image is too large. Maximum size is 200 KB." },
            { status: 400 }
          );
        }
      }
    }

    const result = await upsertPersona(userId, accountId, {
      personaName: persona.personaName || "",
      userRole: persona.userRole || "",
      industry: persona.industry || "",
      tagline: persona.tagline || "",
      websiteUrl: persona.websiteUrl || "",
      businessStage: persona.businessStage || "",
      scrapedWebsiteData: persona.scrapedWebsiteData || "",
      audienceSegments: persona.audienceSegments || [],
      ageRange: persona.ageRange || "",
      region: persona.region || "",
      education: persona.education || "",
      painPoints: persona.painPoints || "",
      audienceGoals: persona.audienceGoals || [],
      primaryObjective: persona.primaryObjective || [],
      conversionTargets: persona.conversionTargets || [],
      contentMix: persona.contentMix || [],
      toneSliders: persona.toneSliders || {
        formalCasual: 50,
        seriousPlayful: 50,
        inspiringInformative: 50,
        dataDriven: 50,
      },
      writingStyle: persona.writingStyle || "",
      sentenceLength: persona.sentenceLength || [],
      brandArchetype: persona.brandArchetype || "",
      coreValues: persona.coreValues || [],
      brandColorHex: persona.brandColorHex || "",
      favoriteInfluencer: persona.favoriteInfluencer || "",
      contentThemes: persona.contentThemes || [],
      postingFrequency: persona.postingFrequency || "",
      contentDepth: persona.contentDepth || "",
      doNotTalk: persona.doNotTalk || "",
      commentReplyStyle: persona.commentReplyStyle || [],
      emojiUsage: persona.emojiUsage || "",
       dmStrategy: persona.dmStrategy || "",
       connections: persona.connections || [],
       uniquePOV: persona.uniquePOV || "",
       productsServices: persona.productsServices || "",
       credibilitySignals: persona.credibilitySignals || "",
       writingSamples: persona.writingSamples || "",
       audienceDesiredOutcome: persona.audienceDesiredOutcome || "",
       audienceRole: persona.audienceRole || "",
       conversionGoal: persona.conversionGoal || "",
       influencerStyle: persona.influencerStyle || "",
       logoUrl: persona.logoUrl || "",
       colorPalette: Array.isArray(persona.colorPalette) ? persona.colorPalette : [],
       fontFamily: persona.fontFamily || "",
     });

    return NextResponse.json({
      success: true,
      id: result.id,
      updated: result.updated,
      message: result.updated
        ? "Persona updated successfully."
        : "Persona created successfully.",
    });
  } catch (error) {
    console.error("[/api/persona/save] Error:", error);
    return NextResponse.json(
      { error: "Failed to save persona. Please try again." },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const sessionUserId = await getUserIdFromRequest(req);
    if (!sessionUserId) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const accountId = searchParams.get("accountId") || undefined;

    const { getPersonaByUserAndAccount } = await import("@/lib/models/persona");
    const persona = await getPersonaByUserAndAccount(sessionUserId, accountId);

    if (!persona) {
      return NextResponse.json({ persona: null });
    }

    return NextResponse.json({ persona });
  } catch (error) {
    console.error("[/api/persona/save GET] Error:", error);
    return NextResponse.json({ error: "Failed to fetch persona." }, { status: 500 });
  }
}
