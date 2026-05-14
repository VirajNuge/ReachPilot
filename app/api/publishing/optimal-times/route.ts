import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/withAuth";
import { getPersonaByUserAndAccount } from "@/lib/models/persona";
import {
  ensurePublishingOptimalTimesIndexes,
  getPublishingOptimalTimesForAccount,
  upsertPublishingOptimalTimes,
} from "@/lib/models/publishingOptimalTimes";
import {
  buildFallbackOptimalSlots,
  buildMonthlyOptimalSlots,
} from "@/lib/publishing/optimalTimes";

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "Unknown publishing timing error";
}

function resolveMonthAndYear(req: NextRequest): { month: number; year: number } {
  const now = new Date();
  const monthParam = req.nextUrl.searchParams.get("month");
  const yearParam = req.nextUrl.searchParams.get("year");
  const monthValue = Number(monthParam);
  const yearValue = Number(yearParam);

  return {
    month: Number.isFinite(monthValue) ? monthValue : now.getMonth(),
    year: Number.isFinite(yearValue) ? yearValue : now.getFullYear(),
  };
}

async function loadAndMaybeCreateSlots(req: NextRequest, saveIfMissing: boolean) {
  const authResult = await requireAuth(req);
  if (authResult instanceof NextResponse) return authResult;

  const accountId = req.nextUrl.searchParams.get("accountId")?.trim() || "";
  if (!accountId) {
    return NextResponse.json({ error: "accountId is required" }, { status: 400 });
  }

  const { month, year } = resolveMonthAndYear(req);
  const persona = await getPersonaByUserAndAccount(authResult.userId, accountId);
  const personaId = persona?._id?.toString() || "default";

  await ensurePublishingOptimalTimesIndexes();

  const saved = await getPublishingOptimalTimesForAccount(
    authResult.userId,
    accountId,
    month,
    year,
    personaId
  );

  if (saved) {
    return NextResponse.json({
      slots: saved.slots,
      month,
      year,
      personaId: saved.personaId,
      updatedAt: saved.updatedAt,
      personaMissing: !persona,
    });
  }

  if (!saveIfMissing) {
    return NextResponse.json({
      slots: persona
        ? buildMonthlyOptimalSlots(persona, { month, year })
        : buildFallbackOptimalSlots({ month, year }),
      month,
      year,
      personaMissing: !persona,
    });
  }

  const slots = persona
    ? buildMonthlyOptimalSlots(persona, { month, year })
    : buildFallbackOptimalSlots({ month, year });

  const savedDoc = await upsertPublishingOptimalTimes(
    authResult.userId,
    accountId,
    personaId,
    month,
    year,
    slots
  );

  return NextResponse.json({
    slots: savedDoc.slots,
    month,
    year,
    personaId: savedDoc.personaId,
    updatedAt: savedDoc.updatedAt,
    personaMissing: !persona,
  });
}

export async function GET(req: NextRequest) {
  try {
    return await loadAndMaybeCreateSlots(req, false);
  } catch (error) {
    console.error("Optimal times API GET error:", error);
    return NextResponse.json(
      { error: "Failed to load optimal times", details: getErrorMessage(error) },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const authResult = await requireAuth(req);
    if (authResult instanceof NextResponse) return authResult;

    const body = await req.json();
    const accountId = typeof body.accountId === "string" ? body.accountId.trim() : "";
    if (!accountId) {
      return NextResponse.json({ error: "accountId is required" }, { status: 400 });
    }

    const now = new Date();
    const monthValue = Number(body.month);
    const yearValue = Number(body.year);
    const month = Number.isFinite(monthValue) ? monthValue : now.getMonth();
    const year = Number.isFinite(yearValue) ? yearValue : now.getFullYear();

    const persona = await getPersonaByUserAndAccount(authResult.userId, accountId);
    const personaId = persona?._id?.toString() || "default";
    const slots = persona
      ? buildMonthlyOptimalSlots(persona, { month, year })
      : buildFallbackOptimalSlots({ month, year });

    await ensurePublishingOptimalTimesIndexes();
    const savedDoc = await upsertPublishingOptimalTimes(
      authResult.userId,
      accountId,
      personaId,
      month,
      year,
      slots
    );

    return NextResponse.json({
      slots: savedDoc.slots,
      month,
      year,
      personaId: savedDoc.personaId,
      updatedAt: savedDoc.updatedAt,
      personaMissing: !persona,
    });
  } catch (error) {
    console.error("Optimal times API POST error:", error);
    return NextResponse.json(
      { error: "Failed to generate optimal times", details: getErrorMessage(error) },
      { status: 500 }
    );
  }
}
