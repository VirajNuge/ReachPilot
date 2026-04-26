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
    tokenUrl.searchParams.set("redirect_uri", process.env.INSTAGRAM_REDIRECT_URI!);
    tokenUrl.searchParams.set("code", code);

    const tokenResponse = await fetch(tokenUrl.toString());
    const tokenData = await tokenResponse.json();
    if (tokenData.error) throw new Error(tokenData.error.message || "Token exchange failed");

    const shortLivedToken = tokenData.access_token;

    // 2. Exchange for long-lived user token
    const longLivedUrl = new URL("https://graph.facebook.com/v19.0/oauth/access_token");
    longLivedUrl.searchParams.set("grant_type", "fb_exchange_token");
    longLivedUrl.searchParams.set("client_id", process.env.FACEBOOK_APP_ID!);
    longLivedUrl.searchParams.set("client_secret", process.env.FACEBOOK_APP_SECRET!);
    longLivedUrl.searchParams.set("fb_exchange_token", shortLivedToken);

    const longLivedResponse = await fetch(longLivedUrl.toString());
    const longLivedData = await longLivedResponse.json();
    const userToken = longLivedData.access_token || shortLivedToken;

    // 3. Fetch FB user profile
    const userResponse = await fetch(`https://graph.facebook.com/me?fields=id,name&access_token=${userToken}`);
    const userData = await userResponse.json();

    // 4. Find the Instagram Business Account linked to the user's Facebook Page
    // Step A: Get the user's managed Pages
    let igBusinessId: string | undefined;
    let pageAccessToken: string | undefined;
    let platformUsername = userData.name || "Instagram User";

    try {
      const pagesRes = await fetch(
        `https://graph.facebook.com/v19.0/me/accounts?access_token=${userToken}`
      );
      const pagesData = await pagesRes.json();
      const pages: Array<{ id: string; access_token: string; name: string }> = pagesData?.data ?? [];

      // Step B: For each page, look up linked IG Business Account
      for (const page of pages) {
        const igRes = await fetch(
          `https://graph.facebook.com/v19.0/${page.id}?fields=instagram_business_account&access_token=${page.access_token}`
        );
        const igData = await igRes.json();
        const igAccount = igData?.instagram_business_account;

        if (igAccount?.id) {
          igBusinessId = igAccount.id as string;
          pageAccessToken = page.access_token;

          // Fetch IG username
          try {
            const igProfileRes = await fetch(
              `https://graph.facebook.com/v19.0/${igBusinessId}?fields=username,name&access_token=${page.access_token}`
            );
            const igProfile = await igProfileRes.json();
            platformUsername = igProfile.username || igProfile.name || page.name;
          } catch {
            platformUsername = page.name;
          }
          break; // Use first linked IG Business Account
        }
      }
    } catch (igErr) {
      // Non-fatal: user may not have an IG Business account linked yet
      console.warn("Instagram Business Account discovery failed (non-fatal):", igErr);
    }

    // 5. Upsert connection — store pageId (IG Business Account ID) for publishing
    await upsertConnection(auth.userId, accountId, "instagram", {
      accessToken: userToken,
      platformUserId: userData.id,
      platformUsername,
      scope: "instagram_basic,instagram_content_publish,instagram_manage_insights,pages_show_list,pages_read_engagement",
      pageId: igBusinessId,         // IG Business Account ID (used in /media endpoints)
      pageAccessToken,              // Page-scoped token required by Graph API
    });

    const response = NextResponse.redirect(new URL(`/${accountId}/accountPersona?connected=instagram`, process.env.NEXTAUTH_URL || req.url));
    response.cookies.delete("rp_oauth_account");
    return response;
  } catch (error) {
    console.error("Instagram OAuth error:", error);
    const response = NextResponse.redirect(new URL(`/${accountId}/accountPersona?error=auth_failed`, process.env.NEXTAUTH_URL || req.url));
    response.cookies.delete("rp_oauth_account");
    return response;
  }
}
