import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/auth";
import { upsertRecommendations, getRecommendationsForAccount } from "@/lib/models/recommendations";

export async function GET(request: NextRequest) {
  const auth = await getAuthFromRequest(request);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const accountId = searchParams.get("accountId") ?? undefined;
  const range = searchParams.get("range") ?? "30D";

  const existing = await getRecommendationsForAccount(auth.userId, accountId, range);
  return NextResponse.json({ recommendations: existing?.recommendations ?? null, updatedAt: existing?.updatedAt ?? null });
}

export async function POST(request: NextRequest) {
  const auth = await getAuthFromRequest(request);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const accountId = body.accountId ?? undefined;
  const range = body.range ?? "30D";
  const recommendations = Array.isArray(body.recommendations) ? body.recommendations : [];

  await upsertRecommendations(auth.userId, accountId, range, recommendations);
  return NextResponse.json({ ok: true });
}
