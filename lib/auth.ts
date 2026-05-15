import { SignJWT, jwtVerify } from "jose";
import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { createSecretKey } from 'crypto';

const AUTH_COOKIE_NAME = "rp_token";

type SafeUserToken = {
  id: string;
  username: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  createdAt?: string;
};

function getKey() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not set");
  }

  // Create a Node KeyObject for HMAC signing - reliable KeyLike for jose
  return createSecretKey(Buffer.from(secret, 'utf8'));
}

export async function signToken(user: SafeUserToken) {
  return await new SignJWT({
    userId: user.id,
    username: user.username,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    createdAt: user.createdAt,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(getKey());
}

export async function verifyToken(token: string) {
  const { payload } = await jwtVerify(token, getKey());
  return payload;
}

export async function getAuthFromRequest(request: NextRequest) {
  try {
    let token = request.cookies.get(AUTH_COOKIE_NAME)?.value || null;
    
    if (!token) {
      const authHeader = request.headers.get("authorization");
      if (authHeader?.startsWith("Bearer ")) {
        token = authHeader.substring(7);
      }
    }
    
    if (!token) return null;
    const payload = await verifyToken(token);
    return payload as any;
  } catch {
    return null;
  }
}

// For route handlers that rely on Next.js cookies() helper
export async function getAuthFromCookies() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value || null;
    if (!token) return null;
    const payload = await verifyToken(token);
    return payload as any;
  } catch {
    return null;
  }
}

// Utility used in some API routes to read raw token
export function getTokenFromRequest(request: NextRequest) {
  let token = request.cookies.get(AUTH_COOKIE_NAME)?.value || null;
  if (!token) {
    const authHeader = request.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }
  }
  return token;
}

export function setAuthCookie(token: string) {
  // Return object suitable for NextResponse.cookies.set(name, value) or .set(cookieObject)
  return {
    name: AUTH_COOKIE_NAME,
    value: token,
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
  } as const;
}

export async function signResetToken(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("1h")
    .sign(getKey());
}

export function clearAuthCookie() {
  return {
    name: AUTH_COOKIE_NAME,
    value: "",
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 0,
  } as const;
}
