import { NextRequest, NextResponse } from "next/server";
import { upsertPersona } from "@/lib/models/persona";
import { getUserById } from "@/lib/models/user";
import { cookies } from "next/headers";
import { verifyToken } from "../../../../lib/auth";

function toTrimmedString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === "string" ? item.trim() : ""))
      .filter(Boolean);
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed ? [trimmed] : [];
  }
  return [];
}

async function getUserIdFromRequest(req: NextRequest): Promise<string | null> {
  try {
     const cookieStore = await cookies();
     const token = cookieStore.get("rp_token")?.value;
    if (!token) return null;

    const payload = await verifyToken(token);
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
      personaName: toTrimmedString(persona.personaName),
      userRole: toStringArray(persona.userRole),
      industry: toStringArray(persona.industry),
      tagline: toTrimmedString(persona.tagline),
      websiteUrl: toTrimmedString(persona.websiteUrl),
      businessStage: toStringArray(persona.businessStage),
      scrapedWebsiteData: toTrimmedString(persona.scrapedWebsiteData),
      audienceSegments: toStringArray(persona.audienceSegments),
      ageRange: toTrimmedString(persona.ageRange),
      region: toTrimmedString(persona.region),
      education: toTrimmedString(persona.education),
      painPoints: toStringArray(persona.painPoints),
      audienceGoals: toStringArray(persona.audienceGoals),
      primaryObjective: toStringArray(persona.primaryObjective),
      conversionTargets: toStringArray(persona.conversionTargets).length > 0
        ? toStringArray(persona.conversionTargets)
        : toStringArray(persona.conversionGoal),
      contentMix: toStringArray(persona.contentMix),
      toneSliders: persona.toneSliders || {
        formalCasual: 50,
        seriousPlayful: 50,
        inspiringInformative: 50,
        dataDriven: 50,
      },
      writingStyle: toStringArray(persona.writingStyle),
      sentenceLength: toStringArray(persona.sentenceLength),
      brandArchetype: toStringArray(persona.brandArchetype),
      coreValues: toStringArray(persona.coreValues),
      brandColorHex: toTrimmedString(persona.brandColorHex),
      favoriteInfluencer: toTrimmedString(persona.favoriteInfluencer),
      contentThemes: toStringArray(persona.contentThemes),
      postingFrequency: toStringArray(persona.postingFrequency),
      contentDepth: toTrimmedString(persona.contentDepth),
      doNotTalk: toStringArray(persona.doNotTalk),
      commentReplyStyle: toStringArray(persona.commentReplyStyle),
      emojiUsage: toStringArray(persona.emojiUsage),
       dmStrategy: toTrimmedString(persona.dmStrategy),
       connections: toStringArray(persona.connections),
       uniquePOV: toStringArray(persona.uniquePOV),
       productsServices: toStringArray(persona.productsServices),
       credibilitySignals: toStringArray(persona.credibilitySignals),
       writingSamples: toTrimmedString(persona.writingSamples),
       audienceDesiredOutcome: toStringArray(persona.audienceDesiredOutcome),
       audienceRole: toStringArray(persona.audienceRole),
      conversionGoal: toStringArray(persona.conversionGoal),
       influencerStyle: toStringArray(persona.influencerStyle),
       logoUrl: toTrimmedString(persona.logoUrl),
       colorPalette: Array.isArray(persona.colorPalette) ? persona.colorPalette : [],
       fontFamily: toTrimmedString(persona.fontFamily),
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

    return NextResponse.json({ persona }, {
      headers: {
        "Cache-Control": "private, max-age=60, stale-while-revalidate=120",
      },
    });
  } catch (error) {
    console.error("[/api/persona/save GET] Error:", error);
    return NextResponse.json({ error: "Failed to fetch persona." }, { status: 500 });
  }
}
