import { NextRequest, NextResponse } from "next/server";
import { getAuthFromCookies } from "@/lib/auth";
import { upsertConnection } from "@/lib/models/connection";

export async function GET(req: NextRequest) {
  // 1. Get auth user from cookie
  const auth = await getAuthFromCookies();
  if (!auth) {
    return NextResponse.redirect(
      new URL("/login", req.url)
    );
  }

  // 2. Get accountId from cookie
  const accountId = req.cookies.get("rp_oauth_account")?.value;
  if (!accountId) {
    return NextResponse.json(
      { error: "Missing accountId from OAuth state" },
      { status: 400 }
    );
  }

  // 3. Extract code from URL
  const code = req.nextUrl.searchParams.get("code");
  const error = req.nextUrl.searchParams.get("error");

  if (error || !code) {
    const response = NextResponse.redirect(
      new URL(
        `/${accountId}/accountPersona?error=auth_denied`,
        req.url
      )
    );
    response.cookies.delete("rp_oauth_account");
    return response;
  }

  try {
    // 4. Exchange code for access token
    const tokenUrl = new URL("https://graph.facebook.com/v19.0/oauth/access_token");
    tokenUrl.searchParams.set("client_id", process.env.META_APP_ID!);
    tokenUrl.searchParams.set("client_secret", process.env.META_APP_SECRET!);
    tokenUrl.searchParams.set("redirect_uri", process.env.META_REDIRECT_URI!);
    tokenUrl.searchParams.set("code", code);

    const tokenResponse = await fetch(tokenUrl.toString());
    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      throw new Error(tokenData.error.message || "Token exchange failed");
    }

    const accessToken = tokenData.access_token;

    // Get long-lived token
    const longLivedUrl = new URL("https://graph.facebook.com/v19.0/oauth/access_token");
    longLivedUrl.searchParams.set("grant_type", "fb_exchange_token");
    longLivedUrl.searchParams.set("client_id", process.env.META_APP_ID!);
    longLivedUrl.searchParams.set("client_secret", process.env.META_APP_SECRET!);
    longLivedUrl.searchParams.set("fb_exchange_token", accessToken);

    const longLivedResponse = await fetch(longLivedUrl.toString());
    const longLivedData = await longLivedResponse.json();

    const finalToken = longLivedData.access_token || accessToken;

    // 5. Fetch platform user profile
    const userResponse = await fetch(
      `https://graph.facebook.com/me?fields=id,name&access_token=${finalToken}`
    );
    const userData = await userResponse.json();

    // 6. Upsert connection
    await upsertConnection(auth.userId, accountId, "meta", {
      accessToken: finalToken,
      platformUserId: userData.id,
      platformUsername: userData.name,
      scope:
        "pages_manage_posts,pages_read_engagement,instagram_basic,instagram_content_publish,email,public_profile",
    });

    // 7. Clear OAuth cookie
    const response = NextResponse.redirect(
      new URL(
        `/${accountId}/accountPersona?connected=meta`,
        req.url
      )
    );
    response.cookies.delete("rp_oauth_account");

    return response;
  } catch (error) {
    console.error("Meta OAuth error:", error);
    const response = NextResponse.redirect(
      new URL(
        `/${accountId}/accountPersona?error=auth_failed`,
        req.url
      )
    );
    response.cookies.delete("rp_oauth_account");
    return response;
  }
}
