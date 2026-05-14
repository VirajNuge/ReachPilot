import { NextRequest, NextResponse } from "next/server";
import { getAuthFromCookies } from "@/lib/auth";

export async function GET(req: NextRequest) {
  // 1. Verify user is logged in
  const auth = await getAuthFromCookies();
  if (!auth) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // 2. Get accountId from query params
  const accountId = req.nextUrl.searchParams.get("accountId");
  if (!accountId) {
    return NextResponse.json({ error: "accountId is required" }, { status: 400 });
  }

  if (!process.env.LINKEDIN_CLIENT_ID) {
    return NextResponse.json(
      { error: "Missing LinkedIn OAuth environment variables" },
      { status: 500 },
    );
  }

  const redirectUri =
    process.env.LINKEDIN_REDIRECT_URI?.trim() ||
    new URL("/api/auth/linkedin/callback", req.nextUrl.origin).toString();
  const requestedScope =
    process.env.LINKEDIN_SCOPE?.trim() ||
    "openid profile email w_member_social";

  // 3. Build LinkedIn OAuth authorization URL
  // Use configurable scope because some LinkedIn apps are not approved for read scopes yet.
  const params = new URLSearchParams({
    response_type: "code",
    client_id: process.env.LINKEDIN_CLIENT_ID,
    redirect_uri: redirectUri,
    scope: requestedScope,
    state: accountId,
  });

  const authUrl = `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`;

  // 4. Create response with redirect and store accountId in cookie
  const response = NextResponse.redirect(authUrl);
  response.cookies.set("rp_oauth_account", accountId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });
  response.cookies.set("rp_oauth_linkedin_redirect_uri", redirectUri, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });

  return response;
}
