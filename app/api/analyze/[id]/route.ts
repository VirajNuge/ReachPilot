import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "../../../../lib/auth";
import {
  getAnalysisById,
  updateAnalysisMetadata,
  deleteAnalysis,
} from "../../../../lib/models/profileAnalyzerHistory";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const auth = await getAuthFromRequest(request);
    if (!auth || !auth.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const doc = await getAnalysisById(id);
    if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (doc.userId !== auth.userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    return NextResponse.json({ success: true, analysis: doc });
  } catch (error) {
    console.error("GET /api/analyze/[id] error:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const auth = await getAuthFromRequest(request);
    if (!auth || !auth.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const allowed: any = {};
    if (body.notes !== undefined) allowed.notes = body.notes;
    if (body.tags !== undefined) allowed.tags = body.tags;
    if (body.isBaseline !== undefined) allowed.isBaseline = body.isBaseline;

    const ok = await updateAnalysisMetadata(id, auth.userId, allowed);
    if (!ok) return NextResponse.json({ error: "Not found or forbidden" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PATCH /api/analyze/[id] error:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const auth = await getAuthFromRequest(request);
    if (!auth || !auth.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const ok = await deleteAnalysis(id, auth.userId);
    if (!ok) return NextResponse.json({ error: "Not found or forbidden" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/analyze/[id] error:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Server error" }, { status: 500 });
  }
}
