import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/auth";
import { getExtensionSession, extensionCorsHeaders } from "@/lib/extensionAuth";
import { getPostAnalysisHistoryByAnalysisId } from "@/lib/models/postAnalyzerHistory";

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, { status: 204, headers: extensionCorsHeaders(request) });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!id) return NextResponse.json({ error: "Analysis ID is required" }, { status: 400 });

  const appAuth = await getAuthFromRequest(request);
  const extensionAuth = appAuth?.userId ? null : await getExtensionSession(request);
  const userId = appAuth?.userId ?? extensionAuth?.userId;
  const accountId = request.nextUrl.searchParams.get("accountId") ?? extensionAuth?.accountId;
  if (!userId || !accountId) {
    return NextResponse.json({ error: "Authentication and accountId are required" }, { status: 401 });
  }

  try {
    const record = await getPostAnalysisHistoryByAnalysisId(userId, accountId, id);
    if (!record) return NextResponse.json({ error: "Analysis not found" }, { status: 404 });

    return NextResponse.json({
      success: true,
      data: {
        id: record.analysisId,
        analysis: record.analysisData?.analysis,
        postData: record.analysisData?.postData,
        timestamp: record.analysisData?.timestamp ?? record.createdAt.toISOString(),
        historyId: record._id?.toHexString?.(),
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to load analysis" }, { status: 500 });
  }
}
