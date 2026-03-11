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
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
        grant_type: "authorization_code",
      }).toString(),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok || tokenData.error) {
      throw new Error(
        tokenData.error_description || tokenData.error || "Token exchange failed"
      );
    }

    // 5. Fetch platform user profile
    const userResponse = await fetch(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      }
    );
    const userData = await userResponse.json();

    // Calculate token expiration
    const tokenExpiresAt = tokenData.expires_in
      ? new Date(Date.now() + tokenData.expires_in * 1000)
      : undefined;

    // 6. Upsert connection
    await upsertConnection(auth.userId, accountId, "google", {
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      tokenExpiresAt,
      platformUserId: userData.sub,
      platformUsername: userData.email,
      scope:
        "https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/calendar.readonly email profile",
    });

    // 7. Clear OAuth cookie
    const response = NextResponse.redirect(
      new URL(
        `/${accountId}/accountPersona?connected=google`,
        req.url
      )
    );
    response.cookies.delete("rp_oauth_account");

    return response;
  } catch (error) {
    console.error("Google OAuth error:", error);
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
