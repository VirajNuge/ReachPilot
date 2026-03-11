import { NextRequest, NextResponse } from "next/server";
import { getAuthFromCookies } from "@/lib/auth";

export async function GET(req: NextRequest) {
  // 1. Verify user is logged in
  const auth = await getAuthFromCookies();
  if (!auth) {
    return NextResponse.redirect(
      new URL("/pages/guestPages/loginPage", req.url)
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

  // 3. Build Facebook OAuth authorization URL
  const params = new URLSearchParams({
    client_id: process.env.META_APP_ID!,
    redirect_uri: process.env.META_REDIRECT_URI!,
    scope:
      "pages_manage_posts,pages_read_engagement,instagram_basic,instagram_content_publish,email,public_profile",
    response_type: "code",
    state: accountId,
  });

  const authUrl = `https://www.facebook.com/v19.0/dialog/oauth?${params.toString()}`;

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
