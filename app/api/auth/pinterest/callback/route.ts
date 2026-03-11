import { NextRequest, NextResponse } from "next/server";

// Pinterest OAuth Callback - Exchanges code for access token
// GET /api/auth/pinterest/callback?code=xxx&state=xxx

const PINTEREST_TOKEN_URL = "https://api.pinterest.com/v5/oauth/token";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const stateParam = searchParams.get("state");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(
      new URL(
        "/1/profileAnalyzer?error=auth_denied",
        request.url,
      ),
    );
  }

  if (!code) {
    return NextResponse.json(
      { success: false, error: "No authorization code received" },
      { status: 400 },
    );
  }

  // Decode state
  let state: { profileUrl: string } = { profileUrl: "" };
  if (stateParam) {
    try {
      state = JSON.parse(Buffer.from(stateParam, "base64url").toString());
    } catch (e) {
      console.error("Failed to decode state:", e);
    }
  }

  const appId = process.env.PINTEREST_APP_ID;
  const appSecret = process.env.PINTEREST_APP_SECRET;
  const redirectUri = process.env.PINTEREST_REDIRECT_URI;

  if (!appId || !appSecret || !redirectUri) {
    return NextResponse.json(
      { success: false, error: "Pinterest API credentials not configured" },
      { status: 503 },
    );
  }

  try {
    // Exchange code for access token
    const credentials = Buffer.from(`${appId}:${appSecret}`).toString("base64");

    const tokenResponse = await fetch(PINTEREST_TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${credentials}`,
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
      }).toString(),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok || tokenData.error) {
      throw new Error(
        tokenData.message || tokenData.error || "Token exchange failed",
      );
    }

    // Store tokens in cookies
    const response = NextResponse.redirect(
      new URL(
        "/1/profileAnalyzer?platform=pinterest&auth=success",
        request.url,
      ),
    );

    response.cookies.set("pinterest_access_token", tokenData.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: tokenData.expires_in || 86400, // Default 24 hours
      path: "/",
    });

    if (tokenData.refresh_token) {
      response.cookies.set("pinterest_refresh_token", tokenData.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 365, // 1 year
        path: "/",
      });
    }

    return response;
  } catch (error) {
    console.error("Pinterest OAuth error:", error);
    return NextResponse.redirect(
      new URL(
        `/1/profileAnalyzer?error=auth_failed&message=${encodeURIComponent(
          error instanceof Error ? error.message : "Unknown error",
        )}`,
        request.url,
      ),
    );
  }
}
