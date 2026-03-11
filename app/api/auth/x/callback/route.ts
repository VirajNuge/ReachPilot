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

  // 2. Get accountId and code verifier from cookies
  const accountId = req.cookies.get("rp_oauth_account")?.value;
  const codeVerifier = req.cookies.get("rp_x_verifier")?.value;

  if (!accountId || !codeVerifier) {
    return NextResponse.json(
      { error: "Missing accountId or code verifier from OAuth state" },
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
    response.cookies.delete("rp_x_verifier");
    return response;
  }

  try {
    // 4. Exchange code for access token with PKCE
    const credentials = Buffer.from(
      `${process.env.X_CLIENT_ID}:${process.env.X_CLIENT_SECRET}`
    ).toString("base64");

    const tokenResponse = await fetch("https://api.twitter.com/2/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${credentials}`,
      },
      body: new URLSearchParams({
        code,
        grant_type: "authorization_code",
        redirect_uri: process.env.X_REDIRECT_URI!,
        code_verifier: codeVerifier,
      }).toString(),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok || tokenData.error) {
      throw new Error(
        tokenData.error_description || tokenData.error || "Token exchange failed"
      );
    }

    // 5. Fetch platform user profile
    const userResponse = await fetch("https://api.twitter.com/2/users/me", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });
    const userData = await userResponse.json();

    // Calculate token expiration
    const tokenExpiresAt = tokenData.expires_in
      ? new Date(Date.now() + tokenData.expires_in * 1000)
      : undefined;

    // 6. Upsert connection
    await upsertConnection(auth.userId, accountId, "x", {
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      tokenExpiresAt,
      platformUserId: userData.data?.id,
      platformUsername: userData.data?.username,
      scope: "tweet.read tweet.write users.read offline.access",
    });

    // 7. Clear OAuth cookies
    const response = NextResponse.redirect(
      new URL(
        `/${accountId}/accountPersona?connected=x`,
        req.url
      )
    );
    response.cookies.delete("rp_oauth_account");
    response.cookies.delete("rp_x_verifier");

    return response;
  } catch (error) {
    console.error("X OAuth error:", error);
    const response = NextResponse.redirect(
      new URL(
        `/${accountId}/accountPersona?error=auth_failed`,
        req.url
      )
    );
    response.cookies.delete("rp_oauth_account");
    response.cookies.delete("rp_x_verifier");
    return response;
  }
}
