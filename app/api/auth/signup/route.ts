import { NextRequest, NextResponse } from "next/server";
import { createUser } from "../../../../lib/models/user";
import { signToken, setAuthCookie } from "../../../../lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, email, firstName, lastName, password } = body;

    // Validation
    if (!username || !email || !firstName || !lastName || !password) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    if (username.length < 3) {
      return NextResponse.json(
        { error: "Username must be at least 3 characters" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    const user = await createUser({ username, email, firstName, lastName, password });
    const token = await signToken(user);
    const cookie = setAuthCookie(token);

    const response = NextResponse.json(
      { success: true, user },
      { status: 201 }
    );

    response.cookies.set(cookie);
    return response;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Signup failed";
    const status = message.includes("already") ? 409 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
