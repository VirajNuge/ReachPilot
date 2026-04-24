import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/withAuth";
import { deleteBrandStyle } from "@/lib/models/postGeneration";

/**
 * DELETE /api/brand-styles/[id]
 * Deletes a brand style preset. Only the owner can delete their own styles.
 */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) return authResult;
  const { userId } = authResult;

  try {
    const { id } = await params;

    const deleted = await deleteBrandStyle(id, userId);

    if (!deleted) {
      return NextResponse.json(
        { error: "Brand style not found or access denied" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/brand-styles/[id] error:", error);
    return NextResponse.json({ error: "Request failed" }, { status: 500 });
  }
}
