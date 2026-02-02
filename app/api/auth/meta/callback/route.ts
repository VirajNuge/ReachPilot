import { NextRequest, NextResponse } from "next/server";

// Meta OAuth Callback - Exchanges code for access token
// GET /api/auth/meta/callback?code=xxx&state=xxx

const META_TOKEN_URL = "https://graph.facebook.com/v18.0/oauth/access_token";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const stateParam = searchParams.get("state");
  const error = searchParams.get("error");

  if (error) {
    // User denied access
    return NextResponse.redirect(
      new URL(
        "/pages/appPages/1/profileAnalyzer?error=auth_denied",
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
  let state: { platform: string; profileUrl: string } = {
    platform: "facebook",
    profileUrl: "",
  };
  if (stateParam) {
    try {
      state = JSON.parse(Buffer.from(stateParam, "base64").toString());
    } catch (e) {
      console.error("Failed to decode state:", e);
    }
  }

  const appId = process.env.META_APP_ID;
  const appSecret = process.env.META_APP_SECRET;
  const redirectUri = process.env.META_REDIRECT_URI;

  if (!appId || !appSecret || !redirectUri) {
    return NextResponse.json(
      { success: false, error: "Meta API credentials not configured" },
      { status: 503 },
    );
  }

  try {
    // Exchange code for access token
    const tokenUrl = new URL(META_TOKEN_URL);
    tokenUrl.searchParams.set("client_id", appId);
    tokenUrl.searchParams.set("client_secret", appSecret);
    tokenUrl.searchParams.set("redirect_uri", redirectUri);
    tokenUrl.searchParams.set("code", code);

    const tokenResponse = await fetch(tokenUrl.toString());
    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      throw new Error(tokenData.error.message || "Token exchange failed");
    }

    const accessToken = tokenData.access_token;

    // Get long-lived token (60 days instead of short-term)
    const longLivedUrl = new URL(
      "https://graph.facebook.com/v18.0/oauth/access_token",
    );
    longLivedUrl.searchParams.set("grant_type", "fb_exchange_token");
    longLivedUrl.searchParams.set("client_id", appId);
    longLivedUrl.searchParams.set("client_secret", appSecret);
    longLivedUrl.searchParams.set("fb_exchange_token", accessToken);

    const longLivedResponse = await fetch(longLivedUrl.toString());
    const longLivedData = await longLivedResponse.json();

    const finalToken = longLivedData.access_token || accessToken;

    // Store token in cookie (in production, use secure session storage)
    const response = NextResponse.redirect(
      new URL(
        `/pages/appPages/1/profileAnalyzer?platform=${state.platform}&auth=success`,
        request.url,
      ),
    );

    // Set HTTP-only cookie with token
    response.cookies.set("meta_token", finalToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 60, // 60 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Meta OAuth error:", error);
    return NextResponse.redirect(
      new URL(
        `/pages/appPages/1/profileAnalyzer?error=auth_failed&message=${encodeURIComponent(
          error instanceof Error ? error.message : "Unknown error",
        )}`,
        request.url,
      ),
    );
  }
}
