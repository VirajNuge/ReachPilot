import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/auth";
import { syncAllPlatforms } from "@/lib/analytics/platformDataFetcher";
import { invalidateCacheForAccount } from "@/lib/analytics/cacheLayer";

export async function POST(req: NextRequest) {
  const auth = await getAuthFromRequest(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    // Accept accountId from query params (simple button click) or JSON body
    const accountIdFromQuery = req.nextUrl.searchParams.get("accountId");

    let accountId: string | undefined;
    let platform: string | undefined;
    let priority: string | undefined;

    if (accountIdFromQuery) {
      accountId = accountIdFromQuery;
    } else {
      const body = await req.json().catch(() => ({}));
      accountId = body.accountId;
      platform = body.platform;
      priority = body.priority;
    }

    if (!accountId) {
      return NextResponse.json({ error: "accountId is required" }, { status: 400 });
    }

    // Perform a synchronous immediate sync so the dashboard refreshes right away
    const result = await syncAllPlatforms(auth.userId, accountId);
    // Clear cache so next summary request gets fresh data
    invalidateCacheForAccount(auth.userId, accountId);

    return NextResponse.json({ ok: true, result });
  } catch (err) {
    console.error("[Sync API] error:", err);
    return NextResponse.json({ error: "Failed to sync" }, { status: 500 });
  }
}

