import "server-only";

import { jwtVerify, SignJWT } from "jose";
import { NextRequest, NextResponse } from "next/server";
import { corsHeaders, isAllowedRequestOrigin } from "@/lib/httpSecurity";

export interface ExtensionSession {
  userId: string;
  accountId: string;
}

function getExtensionSecret(): Uint8Array {
  const secret = process.env.EXTENSION_TOKEN_SECRET?.trim();
  if (!secret || secret.length < 32) {
    throw new Error("EXTENSION_TOKEN_SECRET must be at least 32 characters");
  }
  return new TextEncoder().encode(secret);
}

export async function issueExtensionToken(session: ExtensionSession): Promise<string> {
  return new SignJWT({ accountId: session.accountId, role: "extension" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(session.userId)
    .setIssuedAt()
    .setExpirationTime("15m")
    .setAudience("reachpilot-extension")
    .sign(getExtensionSecret());
}

export function isAllowedExtensionOrigin(request: Request): boolean {
  return isAllowedRequestOrigin(request);
}

export async function getExtensionSession(request: NextRequest): Promise<ExtensionSession | null> {
  if (!isAllowedExtensionOrigin(request)) return null;
  const authorization = request.headers.get("authorization");
  const token = authorization?.startsWith("Bearer ") ? authorization.slice(7).trim() : "";

  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getExtensionSecret(), {
      audience: "reachpilot-extension",
    });
    if (typeof payload.sub !== "string" || typeof payload.accountId !== "string") return null;
    return { userId: payload.sub, accountId: payload.accountId };
  } catch {
    return null;
  }
}

export async function requireExtensionSession(
  request: NextRequest,
): Promise<ExtensionSession | NextResponse> {
  if (!isAllowedExtensionOrigin(request)) {
    return NextResponse.json({ error: "Origin is not allowed", code: "origin_not_allowed" }, { status: 403 });
  }
  const session = await getExtensionSession(request);
  if (!session) {
    return NextResponse.json({ error: "Extension authentication required", code: "extension_auth_required" }, { status: 401 });
  }
  return session;
}

export function extensionCorsHeaders(request: Request): Record<string, string> {
  return corsHeaders(request);
}
