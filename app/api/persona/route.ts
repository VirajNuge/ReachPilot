import { NextRequest, NextResponse } from "next/server";
import { getAuthFromCookies } from "@/lib/auth";
import { getPersonaByUserAndAccount } from "@/lib/models/persona";

/**
 * GET /api/persona?accountId=xxx
 * Returns the current user's persona for the given account (or their default persona).
 * Used by the PostGenerator wizard to import brand details from persona.
 */
export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthFromCookies();
    if (!auth?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const accountId = searchParams.get("accountId") ?? undefined;

    const persona = await getPersonaByUserAndAccount(auth.userId, accountId);

    if (!persona) {
      return NextResponse.json({ persona: null }, { status: 200 });
    }

    // Return brand-relevant fields needed by the wizard and post generation
    return NextResponse.json({
      persona: {
        personaName: persona.personaName,
        industry: persona.industry,
        tagline: persona.tagline,
        brandColorHex: persona.brandColorHex,
        brandArchetype: persona.brandArchetype,
        coreValues: persona.coreValues,
        websiteUrl: persona.websiteUrl,
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
