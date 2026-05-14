import { NextRequest, NextResponse } from "next/server";
import { getAuthFromCookies } from "@/lib/auth";
import { upsertConnection } from "@/lib/models/connection";

function getXClientId(): string | undefined {
  return process.env.X_CLIENT_ID?.trim() || process.env.X_CONSUMER_KEY?.trim();
}

function getXClientSecret(): string | undefined {
  return process.env.X_CLIENT_SECRET?.trim() || process.env.X_CONSUMER_SECRET?.trim();
}

function getXRedirectUri(req: NextRequest): string {
  return (
    process.env.X_REDIRECT_URI?.trim() ||
    new URL("/api/auth/x/callback", process.env.NEXTAUTH_URL || req.url).toString()
  );
}

function getSafeRedirectUrl(path: string, req: NextRequest): URL {
  const url = new URL(path, req.url);
  if (process.env.NODE_ENV !== "production" && url.hostname === "localhost" && url.port === "3000") {
    url.protocol = "http:";
  }
  return url;
}

export async function GET(req: NextRequest) {
  // 1. Get auth user from cookie
  const auth = await getAuthFromCookies();
  if (!auth) {
    return NextResponse.redirect(
      getSafeRedirectUrl("/login", req)
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
      getSafeRedirectUrl(`/${accountId}/accountPersona?error=auth_denied`, req)
    );
    response.cookies.delete("rp_oauth_account");
    response.cookies.delete("rp_x_verifier");
    return response;
  }

  try {
    const clientId = getXClientId();
    const clientSecret = getXClientSecret();
    const redirectUri = getXRedirectUri(req);

    if (!clientId || !clientSecret) {
      throw new Error("Missing X OAuth environment variables");
    }

    // 4. Exchange code for access token with PKCE
    const credentials = Buffer.from(
      `${clientId}:${clientSecret}`
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
        redirect_uri: redirectUri,
        code_verifier: codeVerifier,
      }).toString(),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok || tokenData.error) {
      console.error("[X OAuth] Token Exchange Error:", {
        status: tokenResponse.status,
        statusText: tokenResponse.statusText,
        error: tokenData.error,
        error_description: tokenData.error_description,
        errorDetail: tokenData,
        requestDetails: {
          grant_type: "authorization_code",
          redirect_uri: redirectUri,
          code_length: code?.length,
          code_verifier_length: codeVerifier?.length,
        },
      });
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

    if (!userResponse.ok) {
      console.error("[X OAuth] User Profile Fetch Error:", {
        status: userResponse.status,
        statusText: userResponse.statusText,
        error: userData.error || userData,
      });
      throw new Error("Failed to fetch X user profile");
    }

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
      scope:
        tokenData.scope ||
        "tweet.read tweet.write users.read media.write offline.access",
    });

    // 7. Clear OAuth cookies
    const response = NextResponse.redirect(
      getSafeRedirectUrl(`/${accountId}/accountPersona?connected=x`, req)
    );
    response.cookies.delete("rp_oauth_account");
    response.cookies.delete("rp_x_verifier");

    return response;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("[X OAuth] Full Flow Error:", {
      message: errorMessage,
      error: error,
      stack: error instanceof Error ? error.stack : undefined,
      accountId,
      cookies: {
        hasAccountCookie: !!accountId,
        hasVerifierCookie: !!codeVerifier,
      },
    });
    const response = NextResponse.redirect(
      getSafeRedirectUrl(`/${accountId}/accountPersona?error=auth_failed`, req)
    );
    response.cookies.delete("rp_oauth_account");
    response.cookies.delete("rp_x_verifier");
    return response;
  }
}

