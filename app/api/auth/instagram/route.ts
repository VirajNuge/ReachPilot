import { NextRequest, NextResponse } from "next/server";
import { getAuthFromCookies } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const auth = await getAuthFromCookies();
  if (!auth) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const accountId = req.nextUrl.searchParams.get("accountId");
  if (!accountId) {
    return NextResponse.json({ error: "accountId is required" }, { status: 400 });
  }

  if (!process.env.FACEBOOK_APP_ID) {
    return NextResponse.json({ error: "Missing OAuth environment variables" }, { status: 500 });
  }

  const redirectUri =
    process.env.INSTAGRAM_REDIRECT_URI?.trim() ||
    new URL("/api/auth/instagram/callback", req.nextUrl.origin).toString();

  const params = new URLSearchParams({
    client_id: process.env.FACEBOOK_APP_ID,
    redirect_uri: redirectUri,
    scope: [
      // Identity
      "public_profile",
      "email",
      // Instagram core
      "instagram_basic",
      "instagram_content_publish",
      "instagram_manage_insights",
      "instagram_manage_comments",
      "instagram_manage_messages",
      // Page management (required for Instagram Business linking)
      "pages_show_list",
      "pages_read_engagement",
      "pages_read_user_content",
      "pages_manage_posts",
      "pages_manage_metadata",
      "pages_manage_engagement",
      // Insights & analytics
      "read_insights",
      // Business
      "business_management",
    ].join(","),
    response_type: "code",
    auth_type: "rerequest",
    state: accountId,
  });

  const authUrl = `https://www.facebook.com/v19.0/dialog/oauth?${params.toString()}`;

  const response = NextResponse.redirect(authUrl);
  response.cookies.set("rp_oauth_account", accountId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });
  response.cookies.set("rp_oauth_instagram_redirect_uri", redirectUri, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });

  return response;
}
