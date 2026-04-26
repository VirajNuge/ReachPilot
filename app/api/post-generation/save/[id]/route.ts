import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/withAuth";
import {
  getPostGenerationById,
} from "@/lib/models/postGeneration";
import type { PostGenerationStatus } from "@/lib/types/postGeneration";

const VALID_STATUSES: PostGenerationStatus[] = ["draft", "scheduled", "published"];

function isValidStatus(value: unknown): value is PostGenerationStatus {
  return typeof value === "string" && VALID_STATUSES.includes(value as PostGenerationStatus);
}

type PatchBody = {
  status?: PostGenerationStatus;
  scheduledDate?: string;
  input?: Record<string, unknown>;
  design?: Record<string, unknown>;
  strategy?: Record<string, unknown>;
  output?: Record<string, unknown> & {
    captions?: Record<string, string>;
  };
  variations?: unknown[];
};

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isValidPatchBody(value: unknown): value is PatchBody {
  if (!isObject(value)) return false;
  if (value.status !== undefined && !isValidStatus(value.status)) return false;
  if (value.scheduledDate !== undefined && typeof value.scheduledDate !== "string") return false;
  if (value.output !== undefined) {
    if (!isObject(value.output)) return false;
    if (value.output.captions !== undefined && !isObject(value.output.captions)) return false;
  }
  if (value.input !== undefined && !isObject(value.input)) return false;
  if (value.design !== undefined && !isObject(value.design)) return false;
  if (value.strategy !== undefined && !isObject(value.strategy)) return false;
  if (value.variations !== undefined && !Array.isArray(value.variations)) return false;
  return true;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;
    const auth = authResult;

    const { id } = await params;

    const body = (await req.json()) as unknown;
    if (!isValidPatchBody(body)) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    // Build the update using dot notation for nested fields
    const update: Record<string, unknown> = {};

    if (body.status !== undefined) {
      update.status = body.status;
    }

    if (body.scheduledDate !== undefined) {
      const parsedDate = new Date(body.scheduledDate);
      if (Number.isNaN(parsedDate.getTime())) {
        return NextResponse.json(
          { error: "Invalid scheduledDate format" },
          { status: 400 }
        );
      }
      update.scheduledDate = parsedDate;
    }

    if (body.input !== undefined) {
      update.input = body.input;
    }

    if (body.design !== undefined) {
      update.design = body.design;
    }

    if (body.strategy !== undefined) {
      update.strategy = body.strategy;
    }

    if (body.output !== undefined) {
      for (const [key, value] of Object.entries(body.output)) {
        update[`output.${key}`] = value;
      }
    }

    if (body.variations !== undefined) {
      update.variations = body.variations;
    }

    // Only use dot-notation caption patching when a full output object
    // was not provided, otherwise MongoDB will reject conflicting paths.
    // (Removed contradictory logic that caused TS errors since body.output === undefined means body.output.captions is also undefined)

    if (Object.keys(update).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    // Use raw MongoDB $set for dot-notation support
    const { db } = await (await import("@/lib/mongodb")).connectToDatabase();
    const { ObjectId } = await import("mongodb");

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const result = await db.collection("postGenerations").updateOne(
      { _id: new ObjectId(id), userId: auth.userId },
      {
        $set: {
          ...update,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Post generation PATCH error:", error);
    return NextResponse.json(
      { error: "Failed to update post generation" },
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;
    const auth = authResult;

    const { id } = await params;

    const post = await getPostGenerationById(id);
    if (!post || post.userId !== auth.userId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ post });
  } catch (error) {
    console.error("Post generation GET [id] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch post generation" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;
    const auth = authResult;

    const { id } = await params;

    const { db } = await (await import("@/lib/mongodb")).connectToDatabase();
    const { ObjectId } = await import("mongodb");

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const result = await db.collection("postGenerations").deleteOne({
      _id: new ObjectId(id),
      userId: auth.userId, // Scoped to owner only — prevents cross-user deletion
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Post generation DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to delete post generation" },
      { status: 500 }
    );
  }
}

