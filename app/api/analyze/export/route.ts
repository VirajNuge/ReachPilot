import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "../../../../lib/auth";
import { getAccountById } from "../../../../lib/models/account";
import { getAnalysisHistoryForAccount } from "../../../../lib/models/profileAnalyzerHistory";

function toCSV(items: any[]) {
  if (!items || items.length === 0) return "";
  const keys = Object.keys(items[0]);
  const rows = [keys.join(",")];
  for (const it of items) {
    rows.push(keys.map((k) => JSON.stringify(it[k] ?? "")).join(","));
  }
  return rows.join("\n");
}

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthFromRequest(request);
    if (!auth || !auth.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { accountId, format = "json" } = body;
    if (!accountId) return NextResponse.json({ error: "accountId required" }, { status: 400 });

    const account = await getAccountById(accountId);
    if (!account || account.userId !== auth.userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { analyses } = await getAnalysisHistoryForAccount(auth.userId, accountId, 1000, 0, {});

    const simplified = analyses.map((a: any) => ({
      id: a._id?.toHexString?.() || "",
      profileHandle: a.profileHandle,
      profileName: a.profileName,
      platform: a.platform,
      overallScore: a.overallScore,
      createdAt: a.createdAt?.toISOString?.(),
    }));

    if (format === "csv") {
      const csv = toCSV(simplified);
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="analysis_history_${accountId}.csv"`,
        },
      });
    }

    return NextResponse.json({ success: true, analyses: simplified });
  } catch (e) {
    console.error("/api/analyze/export error:", e);
    return NextResponse.json({ error: e instanceof Error ? e.message : "Server error" }, { status: 500 });
  }
}
