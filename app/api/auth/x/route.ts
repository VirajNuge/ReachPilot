import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

// X (Twitter) OAuth 2.0 with PKCE - Initiates login
// GET /api/auth/x?profileUrl=xxx

const X_AUTH_URL = "https://twitter.com/i/oauth2/authorize";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const profileUrl = searchParams.get("profileUrl") || "";

  const clientId = process.env.X_CLIENT_ID;
  const redirectUri = process.env.X_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    return NextResponse.json(
      {
        success: false,
        error: "X API credentials not configured",
        setup: {
          step1: "Go to https://developer.twitter.com/en/portal/dashboard",
          step2: "Create a new project and app (or use existing)",
          step3:
            "Go to Keys and Tokens > OAuth 2.0 Client ID and Client Secret",
          step4: "Copy Client ID and Client Secret to .env.local",
          step5: "In User authentication settings, enable OAuth 2.0",
          step6: "Set redirect URI: http://localhost:3000/api/auth/x/callback",
          step7: "Request read access for tweets and users",
        },
      },
      { status: 503 },
    );
  }

  // Generate PKCE code verifier and challenge
  const codeVerifier = crypto.randomBytes(32).toString("base64url");
  const codeChallenge = crypto
    .createHash("sha256")
    .update(codeVerifier)
    .digest("base64url");

  // Store code verifier in state (base64 encoded)
  const state = Buffer.from(
    JSON.stringify({ codeVerifier, profileUrl }),
  ).toString("base64url");

  const scopes = [
    "tweet.read",
    "users.read",
    "offline.access", // For refresh token
  ].join(" ");

  const authUrl = new URL(X_AUTH_URL);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("scope", scopes);
  authUrl.searchParams.set("state", state);
  authUrl.searchParams.set("code_challenge", codeChallenge);
  authUrl.searchParams.set("code_challenge_method", "S256");

  return NextResponse.redirect(authUrl.toString());
}
