import { NextRequest, NextResponse } from "next/server";
import { getAuthFromCookies } from "@/lib/auth";
import crypto from "crypto";

function getXClientId(): string | undefined {
  return process.env.X_CLIENT_ID?.trim() || process.env.X_CONSUMER_KEY?.trim();
}

function getXRedirectUri(req: NextRequest): string | undefined {
  return (
    process.env.X_REDIRECT_URI?.trim() ||
    new URL("/api/auth/x/callback", process.env.NEXTAUTH_URL || req.url).toString()
  );
}

export async function GET(req: NextRequest) {
  // 1. Verify user is logged in
  const auth = await getAuthFromCookies();
  if (!auth) {
    return NextResponse.redirect(
      new URL("/pages/guestPages/loginPage", req.url)
    );
  }

  // 2. Get accountId from query params
  const accountId = req.nextUrl.searchParams.get("accountId");
  if (!accountId) {
    return NextResponse.json(
      { error: "accountId is required" },
      { status: 400 }
    );
  }

  // 3. Generate PKCE code verifier and challenge
  const codeVerifier = crypto.randomBytes(32).toString("base64url");
  const codeChallenge = crypto
    .createHash("sha256")
    .update(codeVerifier)
    .digest("base64url");

  const clientId = getXClientId();
  const redirectUri = getXRedirectUri(req);

  if (!clientId || !redirectUri) {
    return NextResponse.json(
      { error: "Missing X OAuth environment variables" },
      { status: 500 }
    );
  }

  // 4. Build X OAuth authorization URL
  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: "tweet.read tweet.write users.read media.write offline.access",
    state: accountId,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
  });

  const authUrl = `https://twitter.com/i/oauth2/authorize?${params.toString()}`;

  // 5. Create response with redirect and store accountId + verifier in cookies
  const response = NextResponse.redirect(authUrl);
  response.cookies.set("rp_oauth_account", accountId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });
  response.cookies.set("rp_x_verifier", codeVerifier, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });

  return response;
}
