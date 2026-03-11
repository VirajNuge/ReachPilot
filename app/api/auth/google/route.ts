import { NextRequest, NextResponse } from "next/server";
import { getAuthFromCookies } from "@/lib/auth";

export async function GET(req: NextRequest) {
  // 1. Verify user is logged in
  const auth = await getAuthFromCookies();
  if (!auth) {
    return NextResponse.redirect(
      new URL("/login", req.url)
    );
  }

  // 2. Get accountId from query params
  const accountId = req.nextUrl.searchParams.get("accountId");
  if (!accountId) {
    return NextResponse.json(
      { error: "accountId is required" },
      { status: 400 }
    );
  }

  // 3. Build Google OAuth authorization URL
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
    response_type: "code",
    scope:
      "https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/calendar.readonly email profile",
    access_type: "offline",
    prompt: "consent",
    state: accountId,
  });

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

  // 4. Create response with redirect and store accountId in cookie
  const response = NextResponse.redirect(authUrl);
  response.cookies.set("rp_oauth_account", accountId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });

  return response;
}
