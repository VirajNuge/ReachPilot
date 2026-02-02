import { NextRequest, NextResponse } from "next/server";

// X (Twitter) OAuth Callback - Exchanges code for access token
// GET /api/auth/x/callback?code=xxx&state=xxx

const X_TOKEN_URL = "https://api.twitter.com/2/oauth2/token";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const stateParam = searchParams.get("state");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(
      new URL(
        "/pages/appPages/1/profileAnalyzer?error=auth_denied",
        request.url,
      ),
    );
  }

  if (!code || !stateParam) {
    return NextResponse.json(
      { success: false, error: "Missing authorization code or state" },
      { status: 400 },
    );
  }

  // Decode state to get code verifier
  let state: { codeVerifier: string; profileUrl: string };
  try {
    state = JSON.parse(Buffer.from(stateParam, "base64url").toString());
  } catch (e) {
    return NextResponse.json(
      { success: false, error: "Invalid state parameter" },
      { status: 400 },
    );
  }

  const clientId = process.env.X_CLIENT_ID;
  const clientSecret = process.env.X_CLIENT_SECRET;
  const redirectUri = process.env.X_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    return NextResponse.json(
      { success: false, error: "X API credentials not configured" },
      { status: 503 },
    );
  }

  try {
    // Exchange code for access token
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString(
      "base64",
    );

    const tokenResponse = await fetch(X_TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${credentials}`,
      },
      body: new URLSearchParams({
        code,
        grant_type: "authorization_code",
        redirect_uri: redirectUri,
        code_verifier: state.codeVerifier,
      }).toString(),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok || tokenData.error) {
      throw new Error(
        tokenData.error_description ||
          tokenData.error ||
          "Token exchange failed",
      );
    }

    // Store tokens in cookies
    const response = NextResponse.redirect(
      new URL(
        "/pages/appPages/1/profileAnalyzer?platform=twitter&auth=success",
        request.url,
      ),
    );

    response.cookies.set("x_access_token", tokenData.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: tokenData.expires_in || 7200, // Default 2 hours
      path: "/",
    });

    if (tokenData.refresh_token) {
      response.cookies.set("x_refresh_token", tokenData.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: "/",
      });
    }

    return response;
  } catch (error) {
    console.error("X OAuth error:", error);
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
