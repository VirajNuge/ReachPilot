import { NextRequest, NextResponse } from "next/server";
import { getAuthFromCookies } from "@/lib/auth";
import { upsertConnection } from "@/lib/models/connection";

export async function GET(req: NextRequest) {
  const auth = await getAuthFromCookies();
  if (!auth) {
    return NextResponse.redirect(new URL("/login", process.env.NEXTAUTH_URL || req.url));
  }

  const accountId =
    req.cookies.get("rp_oauth_account")?.value ||
    req.nextUrl.searchParams.get("state")?.trim() ||
    "";
  if (!accountId) {
    console.error("Pinterest OAuth callback missing accountId", {
      hasCookieAccount: Boolean(req.cookies.get("rp_oauth_account")?.value),
      hasStateParam: Boolean(req.nextUrl.searchParams.get("state")),
      hasCodeParam: Boolean(req.nextUrl.searchParams.get("code")),
      errorParam: req.nextUrl.searchParams.get("error") ?? null,
    });
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
    // 1. Exchange code for token
    // Pinterest uses Basic Auth for the token exchange
    const credentials = Buffer.from(`${process.env.PINTEREST_APP_ID}:${process.env.PINTEREST_APP_SECRET}`).toString("base64");
    
    const tokenResponse = await fetch("https://api.pinterest.com/v5/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${credentials}`,
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: process.env.PINTEREST_REDIRECT_URI!,
      }).toString(),
    });

    const tokenData = await tokenResponse.json();
    if (!tokenResponse.ok || tokenData.error) {
      console.error("Pinterest OAuth token exchange failed", {
        status: tokenResponse.status,
        tokenData,
      });
      throw new Error(tokenData.error_description || tokenData.error || "Token exchange failed");
    }

    const scopeValue = typeof tokenData.scope === "string" ? tokenData.scope : "";
    const grantedScopes = scopeValue.split(/[,\s]+/).filter(Boolean);
    const requiredScopes = ["boards:read", "pins:write"];
    const missingScopes = requiredScopes.filter((scope) => !grantedScopes.includes(scope));
    if (missingScopes.length > 0) {
      throw new Error(`Pinterest token missing required scopes: ${missingScopes.join(", ")}`);
    }

    // 2. Fetch user profile
    const userResponse = await fetch("https://api.pinterest.com/v5/user_account", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const userData = await userResponse.json();
    if (!userResponse.ok || userData?.code || userData?.message) {
      console.error("Pinterest OAuth user profile fetch failed", {
        status: userResponse.status,
        userData,
      });
      throw new Error(userData?.message || "Failed to fetch Pinterest profile");
    }

    const tokenExpiresAt = tokenData.expires_in
      ? new Date(Date.now() + tokenData.expires_in * 1000)
      : undefined;

    // 3. Upsert connection
    await upsertConnection(auth.userId, accountId, "pinterest", {
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      tokenExpiresAt,
      platformUserId: userData.username || userData.id,
      platformUsername: userData.username,
      scope: tokenData.scope,
    });

    const response = NextResponse.redirect(new URL(`/${accountId}/accountPersona?connected=pinterest`, process.env.NEXTAUTH_URL || req.url));
    response.cookies.delete("rp_oauth_account");
    return response;
  } catch (error) {
    console.error("Pinterest OAuth callback failed", {
      accountId,
      hasCodeParam: Boolean(code),
      errorParam: error ?? null,
    });
    const message = error instanceof Error ? encodeURIComponent(error.message) : "OAuth failed";
    const response = NextResponse.redirect(new URL(`/${accountId}/accountPersona?error=auth_failed&platform=pinterest&reason=${message}`, process.env.NEXTAUTH_URL || req.url));
    response.cookies.delete("rp_oauth_account");
    return response;
  }
}

