import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { getPostAnalysisHistoryByAnalysisId } from "../../../../lib/models/postAnalyzerHistory";
import { getAuthFromRequest } from "../../../../lib/auth";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const CACHE_FILE_PATH = path.join(process.cwd(), "post_analysis_cache.json");

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }, // In Next.js 15, route params are Promises
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Analysis ID is required" },
        { status: 400, headers: corsHeaders },
      );
    }

    const data = await fs.readFile(CACHE_FILE_PATH, "utf-8");
    const cacheArray = JSON.parse(data);

    if (!Array.isArray(cacheArray)) {
      return NextResponse.json(
        { error: "Cache data is invalid." },
        { status: 500, headers: corsHeaders },
      );
    }

    const matchedAnalysis = cacheArray.find((item: any) => item.id === id);

    if (!matchedAnalysis) {
      const auth = await getAuthFromRequest(request as any);
      const accountId = new URL(request.url).searchParams.get("accountId") || undefined;
      if (auth?.userId && accountId) {
        const historyRecord = await getPostAnalysisHistoryByAnalysisId(auth.userId, accountId, id);
        if (historyRecord) {
          return NextResponse.json(
            {
              success: true,
              data: {
                id: historyRecord.analysisId,
                analysis: historyRecord.analysisData?.analysis || historyRecord.analysis,
                postData: historyRecord.analysisData?.postData || historyRecord.postData,
                timestamp: historyRecord.analysisData?.timestamp || historyRecord.createdAt.toISOString(),
                historyId: historyRecord._id?.toHexString?.(),
              },
            },
            { headers: corsHeaders },
          );
        }
      }

      return NextResponse.json(
        { error: "Analysis not found." },
        { status: 404, headers: corsHeaders },
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: matchedAnalysis,
      },
      { headers: corsHeaders },
    );
  } catch (error) {
    // File doesn't exist or error reading
    return NextResponse.json(
      { error: "No analysis available or failed to read." },
      { status: 500, headers: corsHeaders },
    );
  }
}
