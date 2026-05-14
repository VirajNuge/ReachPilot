import { NextRequest, NextResponse } from "next/server";
import { verifyUser } from "@/lib/models/user";
import { signToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      username?: string;
      password?: string;
    };

    const identifier = body.username;
    const password = body.password;

    if (!identifier || !password) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 }
      );
    }

    const user = await verifyUser(identifier, password);
    const token = await signToken(user);

    return NextResponse.json({ token, user }, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Login failed";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}
