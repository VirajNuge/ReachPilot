import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { SafeUser } from "./models/user";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback_secret_change_me"
);

const COOKIE_NAME = "rp_token";

export async function signToken(user: SafeUser): Promise<string> {
  return new SignJWT({
    userId: user.id,
    username: user.username,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

export async function verifyToken(
  token: string
): Promise<{
  userId: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
} | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as {
      userId: string;
      username: string;
      email: string;
      firstName: string;
      lastName: string;
    };
  } catch {
    return null;
  }
}

export function setAuthCookie(token: string) {
  // Returns cookie options for the response
  return {
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  };
}

export function clearAuthCookie() {
  return {
    name: COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 0,
  };
}

export async function getAuthFromCookies(): Promise<{
  userId: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
} | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export function getTokenFromRequest(request: NextRequest): string | null {
  return request.cookies.get(COOKIE_NAME)?.value || null;
}
