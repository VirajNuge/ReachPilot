import { jwtVerify } from "jose";
import { NextRequest, NextResponse } from "next/server";

const ADMIN_JWT_SECRET = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET || "admin_super_secret_change_in_production"
);

const ADMIN_COOKIE_NAME = "rp_admin_token";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

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
    await jwtVerify(token, ADMIN_JWT_SECRET);
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
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
