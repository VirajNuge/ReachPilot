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
    return NextResponse.json(
      { error: "Missing accountId from OAuth state" },
      { status: 400 }
    );
  }

  const code = req.nextUrl.searchParams.get("code");
  const error = req.nextUrl.searchParams.get("error");
  // Threads passes state back too, we can verify if needed, but we already have accountId from cookie
  // const state = req.nextUrl.searchParams.get("state"); 

  if (error || !code) {
    const response = NextResponse.redirect(
      new URL(`/${accountId}/accountPersona?error=auth_denied`, process.env.NEXTAUTH_URL || req.url)
    );
    response.cookies.delete("rp_oauth_account");
    return response;
  }

  try {
    // 1. Exchange short-lived token
    const tokenFormData = new URLSearchParams({
      client_id: process.env.THREADS_APP_ID!,
      client_secret: process.env.THREADS_APP_SECRET!,
      grant_type: "authorization_code",
      redirect_uri: process.env.THREADS_REDIRECT_URI!,
      code,
    });

    const tokenResponse = await fetch("https://graph.threads.net/oauth/access_token", {
      method: "POST",
      body: tokenFormData,
    });
    
    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok || tokenData.error) {
      throw new Error(tokenData.error?.message || "Threads token exchange failed");
    }

    const shortLivedToken = tokenData.access_token;
    const userId = tokenData.user_id;

    // 2. Exchange for long-lived token
    const longLivedUrl = new URL("https://graph.threads.net/access_token");
    longLivedUrl.searchParams.set("grant_type", "th_exchange_token");
    longLivedUrl.searchParams.set("client_secret", process.env.THREADS_APP_SECRET!);
    longLivedUrl.searchParams.set("access_token", shortLivedToken);

    const longLivedResponse = await fetch(longLivedUrl.toString());
    const longLivedData = await longLivedResponse.json();

    const finalToken = longLivedData.access_token || shortLivedToken;
    const expiresIn = longLivedData.expires_in; 
    const tokenExpiresAt = expiresIn ? new Date(Date.now() + expiresIn * 1000) : undefined;

    // 3. Fetch User Profile
    const profileResponse = await fetch(
      `https://graph.threads.net/v1.0/me?fields=id,username,name&access_token=${finalToken}`
    );
    const profileData = await profileResponse.json();

    // 4. Save to DB
    await upsertConnection(auth.userId, accountId, "threads", {
      accessToken: finalToken,
      tokenExpiresAt,
      platformUserId: profileData.id || userId,
      platformUsername: profileData.username || profileData.name || "Threads User",
      scope: [
        "threads_basic",
        "threads_content_publish",
        "threads_manage_insights",
        "threads_manage_replies",
        "threads_read_replies",
        "threads_manage_mentions",
        "threads_keyword_search",
        "threads_delete",
        "threads_location_tagging",
      ].join(","),
    });

    const response = NextResponse.redirect(
      new URL(`/${accountId}/accountPersona?connected=threads`, process.env.NEXTAUTH_URL || req.url)
    );
    response.cookies.delete("rp_oauth_account");
    return response;

  } catch (err) {
    console.error("Threads OAuth Error:", err);
    const response = NextResponse.redirect(
      new URL(`/${accountId}/accountPersona?error=auth_failed`, process.env.NEXTAUTH_URL || req.url)
    );
    response.cookies.delete("rp_oauth_account");
    return response;
  }
}

