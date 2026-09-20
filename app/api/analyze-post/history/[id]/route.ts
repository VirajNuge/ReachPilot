import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "../../../../../lib/auth";
import { getAccountById } from "../../../../../lib/models/account";
import {
  deletePostAnalysisHistory,
  getPostAnalysisHistoryById,
  getPostAnalysisHistoryByAnalysisId,
  updatePostAnalysisHistoryMetadata,
} from "../../../../../lib/models/postAnalyzerHistory";

const corsHeaders = {
  "Access-Control-Allow-Origin": process.env.EXTENSION_ALLOWED_ORIGINS?.split(",")[0]?.trim() || "null",
  "Access-Control-Allow-Methods": "POST, GET, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Request-ID",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}

async function resolveHistory(request: NextRequest, id: string) {
  const auth = await getAuthFromRequest(request);
  if (!auth || !auth.userId) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: corsHeaders }) };
  }

  const url = new URL(request.url);
  const accountId = url.searchParams.get("accountId");
  if (!accountId) {
    return { error: NextResponse.json({ error: "accountId is required" }, { status: 400, headers: corsHeaders }) };
  }

  const account = await getAccountById(accountId);
  if (!account || account.userId !== auth.userId) {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403, headers: corsHeaders }) };
  }

  const direct = await getPostAnalysisHistoryById(id);
  if (direct && direct.userId === auth.userId && direct.accountId === accountId) {
    return { auth, accountId, record: direct };
  }

  const byAnalysisId = await getPostAnalysisHistoryByAnalysisId(auth.userId, accountId, id);
  if (byAnalysisId) {
    return { auth, accountId, record: byAnalysisId };
  }

  return { error: NextResponse.json({ error: "Analysis not found" }, { status: 404, headers: corsHeaders }) };
}

function toResponse(record: any) {
  return {
    success: true,
    data: {
      id: record.analysisId || record._id?.toHexString?.() || record.id,
      analysisId: record.analysisId,
      analysis: record.analysisData?.analysis || record.analysis,
      postData: record.analysisData?.postData || record.postData,
      timestamp: record.analysisData?.timestamp || record.createdAt?.toISOString?.() || new Date().toISOString(),
      historyId: record._id?.toHexString?.(),
      snapshot: record.snapshot,
    },
  };
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Analysis ID is required" }, { status: 400, headers: corsHeaders });
    }

    const { error, record } = await resolveHistory(request, id);
    if (error) return error;

    return NextResponse.json(toResponse(record), { headers: corsHeaders });
  } catch (error) {
    return NextResponse.json({ error: "No analysis available or failed to read." }, { status: 500, headers: corsHeaders });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const auth = await getAuthFromRequest(request);
    if (!auth || !auth.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: corsHeaders });
    }

    const body = await request.json();
    const updated = await updatePostAnalysisHistoryMetadata(id, auth.userId, body);
    if (!updated) {
      return NextResponse.json({ error: "Analysis not found or not updated" }, { status: 404, headers: corsHeaders });
    }

    return NextResponse.json({ success: true }, { headers: corsHeaders });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Server error" }, { status: 500, headers: corsHeaders });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const auth = await getAuthFromRequest(request);
    if (!auth || !auth.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: corsHeaders });
    }

    const deleted = await deletePostAnalysisHistory(id, auth.userId);
    if (!deleted) {
      return NextResponse.json({ error: "Analysis not found or not deleted" }, { status: 404, headers: corsHeaders });
    }

    return NextResponse.json({ success: true }, { headers: corsHeaders });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Server error" }, { status: 500, headers: corsHeaders });
  }
}
