import { NextRequest, NextResponse } from "next/server";
import { getAuthFromCookies } from "@/lib/auth";
import { upsertConnection } from "@/lib/models/connection";

export async function GET(req: NextRequest) {
  const auth = await getAuthFromCookies();
  if (!auth) {
    return NextResponse.redirect(new URL("/login", process.env.NEXTAUTH_URL || req.url));
  }

  const accountId = req.cookies.get("rp_oauth_account")?.value;
  if (!accountId) {
    return NextResponse.json({ error: "Missing accountId from OAuth state" }, { status: 400 });
  }

  const code = req.nextUrl.searchParams.get("code");
  const error = req.nextUrl.searchParams.get("error");

  if (error || !code) {
    const response = NextResponse.redirect(new URL(`/${accountId}/accountPersona?error=auth_denied`, process.env.NEXTAUTH_URL || req.url));
    response.cookies.delete("rp_oauth_account");
    return response;
  }

  try {
    // 1. Exchange code for short-lived user token
    const tokenUrl = new URL("https://graph.facebook.com/v19.0/oauth/access_token");
    tokenUrl.searchParams.set("client_id", process.env.FACEBOOK_APP_ID!);
    tokenUrl.searchParams.set("client_secret", process.env.FACEBOOK_APP_SECRET!);
    tokenUrl.searchParams.set("redirect_uri", process.env.FACEBOOK_REDIRECT_URI!);
    tokenUrl.searchParams.set("code", code);

    const tokenResponse = await fetch(tokenUrl.toString());
    const tokenData = await tokenResponse.json();
    if (tokenData.error) throw new Error(tokenData.error.message || "Token exchange failed");

    const shortLivedToken = tokenData.access_token;

    // 2. Exchange for long-lived user token (~60 days)
    const longLivedUrl = new URL("https://graph.facebook.com/v19.0/oauth/access_token");
    longLivedUrl.searchParams.set("grant_type", "fb_exchange_token");
    longLivedUrl.searchParams.set("client_id", process.env.FACEBOOK_APP_ID!);
    longLivedUrl.searchParams.set("client_secret", process.env.FACEBOOK_APP_SECRET!);
    longLivedUrl.searchParams.set("fb_exchange_token", shortLivedToken);

    const longLivedResponse = await fetch(longLivedUrl.toString());
    const longLivedData = await longLivedResponse.json();
    const userToken = longLivedData.access_token || shortLivedToken;

    // 3. Fetch Facebook user profile
    const userResponse = await fetch(`https://graph.facebook.com/me?fields=id,name&access_token=${userToken}`);
    const userData = await userResponse.json();

    // 4. Fetch managed Pages to get Page Access Token (required for publishing)
    let pageId: string | undefined;
    let pageAccessToken: string | undefined;
    let platformUsername = userData.name;

    try {
      const pagesResponse = await fetch(
        `https://graph.facebook.com/v19.0/me/accounts?access_token=${userToken}`
      );
      const pagesData = await pagesResponse.json();
      const firstPage = pagesData?.data?.[0];

      if (firstPage) {
        pageId = firstPage.id as string;
        pageAccessToken = firstPage.access_token as string;
        platformUsername = firstPage.name || userData.name;
      }
    } catch (pageErr) {
      // Non-fatal: user may have no pages, we still store the user token
      console.warn("Facebook Pages fetch failed (non-fatal):", pageErr);
    }

    // 5. Upsert connection with both user token and page token
    await upsertConnection(auth.userId, accountId, "facebook", {
      accessToken: userToken,
      platformUserId: userData.id,
      platformUsername,
      scope: "pages_manage_posts,pages_read_engagement,pages_show_list,read_insights,public_profile",
      pageId,
      pageAccessToken,
    });

    const response = NextResponse.redirect(new URL(`/${accountId}/accountPersona?connected=facebook`, process.env.NEXTAUTH_URL || req.url));
    response.cookies.delete("rp_oauth_account");
    return response;
  } catch (error) {
    console.error("Facebook OAuth error:", error);
    const response = NextResponse.redirect(new URL(`/${accountId}/accountPersona?error=auth_failed`, process.env.NEXTAUTH_URL || req.url));
    response.cookies.delete("rp_oauth_account");
    return response;
  }
}
