import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "../../../../lib/auth";
import { updateUserPassword } from "../../../../lib/models/user";

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json();
    if (!token || !password) {
      return NextResponse.json({ error: "Token and password are required" }, { status: 400 });
    }

    const payload: any = await verifyToken(token);
    const userId = payload.userId;
    if (!userId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 400 });
    }

    await updateUserPassword(userId, password);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Reset failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
