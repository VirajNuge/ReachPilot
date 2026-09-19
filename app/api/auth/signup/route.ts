import { NextRequest, NextResponse } from "next/server";
import { createUser } from "../../../../lib/models/user";
import { signToken, setAuthCookie } from "../../../../lib/auth";
import { isSignupAccessCodeConfigured, isSignupAccessCodeValid } from "../../../../lib/signupAccessCode";
import { randomUUID } from "crypto";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, email, firstName, lastName, password, signupCode } = body;

    if (!isSignupAccessCodeConfigured()) {
      return NextResponse.json(
        { error: "Signup is temporarily unavailable. Please contact the owner." },
        { status: 503 },
      );
    }

    if (!isSignupAccessCodeValid(signupCode)) {
      return NextResponse.json(
        { error: "The access code is invalid or missing.", code: "invalid_access_code" },
        { status: 403 },
      );
    }

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
    const requestId = randomUUID();
    const message = error instanceof Error ? error.message : "Signup failed";
    const errorCode = typeof error === "object" && error !== null && "code" in error
      ? (error as { code?: unknown }).code
      : undefined;
    const duplicate = errorCode === 11000 || /already exists|duplicate key/i.test(message);

    console.error("[auth/signup] request failed", {
      requestId,
      code: errorCode,
      name: error instanceof Error ? error.name : "UnknownError",
    });

    if (duplicate) {
      return NextResponse.json(
        { error: "Username or email is already registered", code: "already_exists", requestId },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { error: "Unable to create your account right now. Please try again shortly.", code: "database_unavailable", requestId },
      { status: 503 },
    );
  }
}
