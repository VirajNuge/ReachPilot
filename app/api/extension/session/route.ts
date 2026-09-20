import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/auth";
import { getAccountById } from "@/lib/models/account";
import { issueExtensionToken } from "@/lib/extensionAuth";

export async function POST(request: NextRequest) {
  const auth = await getAuthFromRequest(request);
  if (!auth?.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = (await request.json()) as { accountId?: unknown };
    if (typeof body.accountId !== "string" || !body.accountId) {
      return NextResponse.json({ error: "accountId is required" }, { status: 400 });
    }
    const account = await getAccountById(body.accountId);
    if (!account || account.userId !== auth.userId) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }
    const token = await issueExtensionToken({ userId: auth.userId, accountId: body.accountId });
    return NextResponse.json({ token, expiresIn: 900 });
  } catch {
    return NextResponse.json({ error: "Extension authentication is not configured" }, { status: 503 });
  }
}
