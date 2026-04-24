import { NextRequest, NextResponse } from "next/server";
import { getAuthFromCookies } from "@/lib/auth";
import { upsertConnection } from "@/lib/models/connection";

export async function GET(req: NextRequest) {
  const auth = await getAuthFromCookies();
  if (!auth) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const accountId = req.cookies.get("rp_oauth_account")?.value;
  const expectedState = req.cookies.get("rp_postiz_state")?.value;
  if (!accountId || !expectedState) {
    return NextResponse.json(
      { error: "Missing OAuth state for Postiz callback" },
      { status: 400 }
    );
  }

  const code = req.nextUrl.searchParams.get("code");
  const error = req.nextUrl.searchParams.get("error");
  const state = req.nextUrl.searchParams.get("state");

  if (error || !code || !state || state !== expectedState) {
    const response = NextResponse.redirect(
      new URL(`/${accountId}/accountPersona?error=auth_denied`, req.url)
    );
    response.cookies.delete("rp_oauth_account");
    response.cookies.delete("rp_postiz_state");
    return response;
  }

  if (
    !process.env.POSTIZ_BACKEND_URL ||
    !process.env.POSTIZ_CLIENT_ID ||
    !process.env.POSTIZ_CLIENT_SECRET ||
    !process.env.POSTIZ_REDIRECT_URI
  ) {
    const response = NextResponse.redirect(
      new URL(`/${accountId}/accountPersona?error=auth_failed`, req.url)
    );
    response.cookies.delete("rp_oauth_account");
    response.cookies.delete("rp_postiz_state");
    return response;
  }

  try {
    const tokenResponse = await fetch(`${process.env.POSTIZ_BACKEND_URL}/oauth/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        grant_type: "authorization_code",
        code,
        client_id: process.env.POSTIZ_CLIENT_ID,
        client_secret: process.env.POSTIZ_CLIENT_SECRET,
        redirect_uri: process.env.POSTIZ_REDIRECT_URI,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok || !tokenData?.access_token) {
      throw new Error(tokenData?.error || "Postiz token exchange failed");
    }

    const integrationsResponse = await fetch(
      `${process.env.POSTIZ_BACKEND_URL}/public/v1/integrations`,
      {
        headers: {
          Authorization: tokenData.access_token,
        },
      }
    );

    const integrationsData = await integrationsResponse.json();
    const firstIntegration = Array.isArray(integrationsData?.items)
      ? integrationsData.items[0]
      : Array.isArray(integrationsData)
      ? integrationsData[0]
      : undefined;

    await upsertConnection(auth.userId, accountId, "postiz", {
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      tokenExpiresAt: tokenData.expires_in
        ? new Date(Date.now() + tokenData.expires_in * 1000)
        : undefined,
      platformUserId:
        tokenData.id || tokenData.organizationId || firstIntegration?.organizationId,
      platformUsername:
        firstIntegration?.name || firstIntegration?.profile || "Postiz workspace",
      scope: tokenData.scope,
    });

    const response = NextResponse.redirect(
      new URL(`/${accountId}/accountPersona?connected=postiz`, req.url)
    );
    response.cookies.delete("rp_oauth_account");
    response.cookies.delete("rp_postiz_state");
    return response;
  } catch (callbackError) {
    console.error("Postiz OAuth error:", callbackError);
    const response = NextResponse.redirect(
      new URL(`/${accountId}/accountPersona?error=auth_failed`, req.url)
    );
    response.cookies.delete("rp_oauth_account");
    response.cookies.delete("rp_postiz_state");
    return response;
  }
}
