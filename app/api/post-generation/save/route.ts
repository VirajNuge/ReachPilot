import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/withAuth";
import { getAccountById } from "@/lib/models/account";
import {
  createPostGeneration,
  getPostGenerationsByUser,
} from "@/lib/models/postGeneration";
import type {
  PostGenerationDocument,
  PostGenerationStatus,
  PostGenerationInput,
  VisualStyle,
  ContentStrategyOutput,
  PostPackage,
  PostVariation,
} from "@/lib/types/postGeneration";

type SavePostBody = {
  personaId?: string;
  accountId?: string;
  input: PostGenerationInput;
  design: {
    brandColors: string[];
    fontFamily: string;
    visualStyle: VisualStyle;
    logoUrl?: string;
  };
  strategy?: ContentStrategyOutput;
  output?: PostPackage;
  variations: PostVariation[];
  status: PostGenerationStatus;
};

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isSavePostBody(value: unknown): value is SavePostBody {
  if (!isObject(value)) return false;
  if (!isObject(value.input)) return false;
  if (!isObject(value.design)) return false;
  if (!Array.isArray(value.variations)) return false;
  if (typeof value.status !== "string") return false;
  return true;
}

export async function POST(req: NextRequest) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;
    const auth = authResult;

    const body = (await req.json()) as unknown;
    if (!isSavePostBody(body)) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 },
      );
    }

    // SEC-02: Verify account ownership if accountId provided
    if (body.accountId) {
      const account = await getAccountById(body.accountId);
      if (!account || account.userId !== auth.userId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    const createData: Omit<PostGenerationDocument, "_id" | "createdAt" | "updatedAt"> = {
      userId: auth.userId,
      ...(body.personaId ? { personaId: body.personaId } : {}),
      ...(body.accountId ? { accountId: body.accountId } : {}),
      input: body.input,
      design: body.design,
      ...(body.strategy ? { strategy: body.strategy } : {}),
      ...(body.output ? { output: body.output } : {}),
      variations: body.variations,
      status: body.status,
    };

    const id = await createPostGeneration(createData);
    return NextResponse.json({ id }, { status: 201 });
  } catch (error) {
    console.error("Save post generation POST error:", error);
    return NextResponse.json({ error: "Failed to save post generation" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;
    const auth = authResult;

    const { searchParams } = new URL(req.url);
    const accountIdParam = searchParams.get("accountId");
    const accountId = accountIdParam && accountIdParam.trim() !== "" ? accountIdParam : undefined;

    const limitParam = searchParams.get("limit");
    const parsedLimit = limitParam ? Number.parseInt(limitParam, 10) : 50;
    const limit = Number.isFinite(parsedLimit) && parsedLimit > 0 ? parsedLimit : 50;

    const statusParam = searchParams.get("status") as import("@/lib/types/postGeneration").PostGenerationStatus | null;
    const status = statusParam && ["draft", "scheduled", "published"].includes(statusParam) ? statusParam : undefined;

    const posts = await getPostGenerationsByUser(auth.userId, accountId, limit, status);
    return NextResponse.json({ posts });
  } catch (error) {
    console.error("Save post generation GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch post generations" },
      { status: 500 },
    );
  }
}
