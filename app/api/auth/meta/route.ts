import { NextRequest, NextResponse } from "next/server";

// Meta OAuth - Initiates Facebook/Instagram login
// GET /api/auth/meta?platform=facebook|instagram

const META_AUTH_URL = "https://www.facebook.com/v18.0/dialog/oauth";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const platform = searchParams.get("platform") || "facebook";
  const profileUrl = searchParams.get("profileUrl") || "";

  const appId = process.env.META_APP_ID;
  const redirectUri = process.env.META_REDIRECT_URI;

  if (!appId || !redirectUri) {
    return NextResponse.json(
      {
        success: false,
        error: "Meta API credentials not configured",
        setup: {
          step1: "Go to https://developers.facebook.com/apps",
          step2: "Create a new app (Consumer type)",
          step3: "Add Facebook Login product",
          step4: "Copy App ID and App Secret to .env.local",
          step5:
            "Add redirect URI: " +
            (redirectUri || "http://localhost:3000/api/auth/meta/callback"),
        },
      },
      { status: 503 },
    );
  }

  // Scopes for Facebook/Instagram Business insights
  const scopes =
    platform === "instagram"
      ? "instagram_basic,instagram_manage_insights,pages_show_list,pages_read_engagement"
      : "pages_show_list,pages_read_engagement,pages_read_user_content,public_profile";

  // State includes platform and original profile URL for callback
  const state = Buffer.from(JSON.stringify({ platform, profileUrl })).toString(
    "base64",
  );

  const authUrl = new URL(META_AUTH_URL);
  authUrl.searchParams.set("client_id", appId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("scope", scopes);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("state", state);

  return NextResponse.redirect(authUrl.toString());
}
