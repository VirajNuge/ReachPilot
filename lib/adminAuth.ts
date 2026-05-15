import { SignJWT, jwtVerify } from "jose";
import { NextRequest } from "next/server";

function getAdminJwtSecret() {
  const secret = process.env.ADMIN_JWT_SECRET;
  if (!secret) {
    throw new Error("ADMIN_JWT_SECRET is not set");
  }

  return new TextEncoder().encode(secret);
}

const ADMIN_COOKIE_NAME = "rp_admin_token";

// Hardcoded admin credentials (as requested)
export const ADMIN_CREDENTIALS = {
  // Updated per request: admin login for local/dev access
  username: "virajnuge",
  password: "password-password123",
};

export async function signAdminToken(username: string): Promise<string> {
  return new SignJWT({ username, role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(getAdminJwtSecret());
}

export async function verifyAdminToken(
  token: string
): Promise<{ username: string; role: string } | null> {
  try {
    const { payload } = await jwtVerify(token, getAdminJwtSecret());
    return payload as { username: string; role: string };
  } catch {
    return null;
  }
}

export function setAdminAuthCookie(token: string) {
  return {
    name: ADMIN_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 8, // 8 hours
  };
}

export function clearAdminAuthCookie() {
  return {
    name: ADMIN_COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 0,
  };
}

export function getAdminTokenFromRequest(request: NextRequest): string | null {
  return request.cookies.get(ADMIN_COOKIE_NAME)?.value || null;
}

export async function requireAdminAuth(
  request: NextRequest
): Promise<{ username: string; role: string } | null> {
  const token = getAdminTokenFromRequest(request);
  if (!token) return null;
  return verifyAdminToken(token);
}
