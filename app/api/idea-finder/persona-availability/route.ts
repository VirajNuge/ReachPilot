import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/withAuth";
import { getPersonaByUserAndAccount } from "@/lib/models/persona";

export async function GET(req: NextRequest) {
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) return authResult;

  const { userId } = authResult;
  const accountId = req.nextUrl.searchParams.get("accountId")?.trim();

  if (!accountId) {
    return NextResponse.json({ error: "accountId is required" }, { status: 400 });
  }

  try {
    const persona = await getPersonaByUserAndAccount(userId, accountId);
    return NextResponse.json({
      success: true,
      data: {
        available: Boolean(persona),
      },
    });
  } catch (error) {
    console.error("[idea-finder/persona-availability] Error:", error);
    return NextResponse.json({ error: "Failed to check persona availability" }, { status: 500 });
  }
}
