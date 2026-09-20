import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken } from "./lib/adminToken";
import { jwtVerify } from "jose";

const ADMIN_COOKIE_NAME = "rp_admin_token";

function extensionOriginAllowed(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  const allowed = (process.env.EXTENSION_ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  return allowed.length > 0 && allowed.includes(origin);
}

async function extensionRequestAuthorized(request: NextRequest): Promise<boolean> {
  if (!extensionOriginAllowed(request)) return false;
  if (request.cookies.get("rp_token")?.value) return true;

  const authorization = request.headers.get("authorization");
  const token = authorization?.startsWith("Bearer ") ? authorization.slice(7).trim() : "";
  if (!token) {
    return process.env.NODE_ENV !== "production" && process.env.ALLOW_LEGACY_EXTENSION_AUTH === "true";
  }

  const secret = process.env.EXTENSION_TOKEN_SECRET?.trim();
  if (!secret || secret.length < 32) return false;
  try {
    await jwtVerify(token, new TextEncoder().encode(secret), { audience: "reachpilot-extension" });
    return true;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    process.env.NODE_ENV === "production" &&
    (
      pathname.startsWith("/api/debug") ||
      pathname.startsWith("/api/test-") ||
      pathname === "/api/find-24"
    )
  ) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (pathname.startsWith("/api/analyze-extension")) {
    if (request.method === "OPTIONS") {
      return extensionOriginAllowed(request)
        ? NextResponse.next()
        : NextResponse.json({ error: "Origin is not allowed" }, { status: 403 });
    }
    if (!(await extensionRequestAuthorized(request))) {
      return NextResponse.json(
        { error: "Extension authentication required", code: "extension_auth_required" },
        { status: 401 },
      );
    }
  }

  // Only handle /admin routes
  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  // Allow login page through (no auth needed)
  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  // Allow admin API login/logout through
  if (
    pathname === "/api/admin/login" ||
    pathname === "/api/admin/logout"
  ) {
    return NextResponse.next();
  }

  // Verify admin token
  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;

  if (!token) {
    // API routes → return 401 JSON
    if (pathname.startsWith("/api/admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    // UI routes → redirect to login
    const loginUrl = new URL("/admin/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const verified = await verifyAdminToken(token);
    if (!verified) {
      throw new Error("Invalid admin token");
    }
    return NextResponse.next();
  } catch {
    // Invalid / expired token
    if (pathname.startsWith("/api/admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const loginUrl = new URL("/admin/login", request.url);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
    "/api/analyze-extension/:path*",
    "/api/:path*",
  ],
};
