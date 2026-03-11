import { NextRequest, NextResponse } from "next/server";
import { verifyUser } from "../../../../lib/models/user";
import { signToken, setAuthCookie } from "../../../../lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 }
      );
    }

    const user = await verifyUser(username, password);
    const token = await signToken(user);
    const cookie = setAuthCookie(token);

    const response = NextResponse.json(
      { success: true, user },
      { status: 200 }
    );

    response.cookies.set(cookie);
    return response;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Login failed";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}
