import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/withAuth";
import { connectToDatabase } from "@/lib/mongodb";
import { getPersonaByUserAndAccount } from "@/lib/models/persona";

function calculatePersonaCompleteness(persona: any | null): number {
  if (!persona) return 0;
  const fields = [
    persona.personaName,
    persona.userRole,
    persona.industry,
    persona.tagline,
    persona.websiteUrl,
    persona.audienceSegments,
    persona.painPoints,
    persona.primaryObjective,
    persona.writingStyle,
    persona.brandArchetype,
  ];

  const filled = fields.filter((value) => {
    if (Array.isArray(value)) return value.length > 0;
    return Boolean(value);
  }).length;

  return Math.round((filled / fields.length) * 100);
}

export async function GET(req: NextRequest) {
  const authResult = await requireAuth(req);
  if (authResult instanceof NextResponse) return authResult;

  const { userId } = authResult;
  const accountId = req.nextUrl.searchParams.get("accountId") || "";

  if (!accountId) {
    return NextResponse.json({ error: "accountId is required" }, { status: 400 });
  }

  const { db } = await connectToDatabase();
  const [
    totalPosts,
    totalGenerated,
    totalTemplates,
    totalIdeas,
    totalAnalyzed,
  ] = await Promise.all([
    db.collection("postGenerations").countDocuments({ userId, accountId }),
    db.collection("postGenerations").countDocuments({ userId, accountId }),
    db.collection("userSavedPostTemplates").countDocuments({ userId, accountId }),
    db.collection("savedIdeas").countDocuments({ userId, accountId }),
    db.collection("analysis_sessions").countDocuments({ userId }),
  ]);

  const persona = await getPersonaByUserAndAccount(userId, accountId);
  const personaCompleteness = calculatePersonaCompleteness(persona);

  return NextResponse.json({
    success: true,
    stats: {
      totalPosts,
      totalGenerated,
      totalAnalyzed,
      templatesCount: totalTemplates,
      ideasCount: totalIdeas,
      personaCompleteness,
    },
  });
}
