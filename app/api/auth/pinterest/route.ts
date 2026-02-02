import { NextRequest, NextResponse } from "next/server";

// Pinterest OAuth 2.0 - Initiates login
// GET /api/auth/pinterest?profileUrl=xxx

const PINTEREST_AUTH_URL = "https://www.pinterest.com/oauth/";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const profileUrl = searchParams.get("profileUrl") || "";

  const appId = process.env.PINTEREST_APP_ID;
  const redirectUri = process.env.PINTEREST_REDIRECT_URI;

  if (!appId || !redirectUri) {
    return NextResponse.json(
      {
        success: false,
        error: "Pinterest API credentials not configured",
        setup: {
          step1: "Go to https://developers.pinterest.com/apps/",
          step2: "Create a new app (or use existing)",
          step3: "Go to the app settings",
          step4: "Copy App ID and App Secret to .env.local",
          step5:
            "Add redirect URI: http://localhost:3000/api/auth/pinterest/callback",
          step6: "Request access to 'boards:read' and 'pins:read' scopes",
        },
      },
      { status: 503 },
    );
  }

  // State for callback
  const state = Buffer.from(JSON.stringify({ profileUrl })).toString(
    "base64url",
  );

  const scopes = ["boards:read", "pins:read", "user_accounts:read"].join(",");

  const authUrl = new URL(PINTEREST_AUTH_URL);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("client_id", appId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("scope", scopes);
  authUrl.searchParams.set("state", state);

  return NextResponse.redirect(authUrl.toString());
}
