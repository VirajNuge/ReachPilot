import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "../../../../lib/auth";
import { compareAnalyses } from "../../../../lib/analysisComparison";
import { verifyAnalysisAccess } from "../../../../lib/auth/analyzerAuth";

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthFromRequest(request);
    if (!auth || !auth.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { baselineId, currentId } = body;
    if (!baselineId || !currentId) return NextResponse.json({ error: "baselineId and currentId required" }, { status: 400 });

    // Verify access to both analyses
    const canAccessA = await verifyAnalysisAccess(auth.userId, baselineId);
    const canAccessB = await verifyAnalysisAccess(auth.userId, currentId);
    if (!canAccessA || !canAccessB) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const result = await compareAnalyses(baselineId, currentId);
    if (!result) return NextResponse.json({ error: "Comparison failed" }, { status: 500 });

    return NextResponse.json({ success: true, comparison: result });
  } catch (e) {
    console.error("/api/analyze/compare-history error:", e);
    return NextResponse.json({ error: e instanceof Error ? e.message : "Server error" }, { status: 500 });
  }
}
