import { NextRequest, NextResponse } from "next/server";
import { getAuthFromCookies } from "@/lib/auth";
import { upsertConnection } from "@/lib/models/connection";
import https from "node:https";

function decodeJwtPayload(token: string): Record<string, unknown> {
  const parts = token.split(".");
  if (parts.length < 2) return {};
  try {
    return JSON.parse(Buffer.from(parts[1], "base64url").toString("utf-8")) as Record<string, unknown>;
  } catch {
    return {};
  }
}

function pickString(data: Record<string, unknown>, key: string): string {
  const value = data[key];
  return typeof value === "string" ? value : "";
}

async function exchangeLinkedInTokenViaHttps(
  tokenUrl: string,
  formBody: string,
): Promise<{ status: number; data: Record<string, unknown> }> {
  const parsed = new URL(tokenUrl);
  return await new Promise((resolve, reject) => {
    const req = https.request(
      {
        protocol: parsed.protocol,
        hostname: parsed.hostname,
        path: parsed.pathname + parsed.search,
        method: "POST",
        family: 4, // Force IPv4 to prevent hanging on Windows
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Content-Length": Buffer.byteLength(formBody),
        },
        timeout: 10000,
      },
      (res) => {
        let raw = "";
        res.setEncoding("utf8");
        res.on("data", (chunk) => {
          raw += chunk;
        });
        res.on("end", () => {
          let data: Record<string, unknown> = {};
          try {
            data = raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
          } catch {
            data = { raw };
          }
          resolve({ status: res.statusCode || 0, data });
        });
      },
    );

    req.on("timeout", () => req.destroy(new Error("Token request timeout")));
    req.on("error", reject);
    req.write(formBody);
  });
}

async function getLinkedInApiViaHttps(
  url: string,
  accessToken: string,
): Promise<{ status: number; data: Record<string, unknown> }> {
  const parsed = new URL(url);
  return await new Promise((resolve, reject) => {
    const req = https.request(
      {
        protocol: parsed.protocol,
        hostname: parsed.hostname,
        path: parsed.pathname + parsed.search,
        method: "GET",
        family: 4, // Force IPv4 to prevent hanging on Windows
        headers: {
          "Authorization": `Bearer ${accessToken}`,
        },
        timeout: 10000,
      },
      (res) => {
        let raw = "";
        res.setEncoding("utf8");
        res.on("data", (chunk) => {
          raw += chunk;
        });
        res.on("end", () => {
          let data: Record<string, unknown> = {};
          try {
            data = raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
          } catch {
            data = { raw };
          }
          resolve({ status: res.statusCode || 0, data });
        });
      },
    );

    req.on("timeout", () => req.destroy(new Error("Request timeout")));
    req.on("error", reject);
    req.end();
  });
}

function describeError(error: unknown): string {
  if (!(error instanceof Error)) return String(error);
  const cause = (error as Error & { cause?: unknown }).cause;
  if (cause instanceof Error) {
    return `${error.message} (cause: ${cause.message})`;
  }
  if (cause) {
    return `${error.message} (cause: ${String(cause)})`;
  }
  return error.message;
}

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
    console.error("LinkedIn OAuth callback missing accountId", {
      hasCookieAccount: Boolean(req.cookies.get("rp_oauth_account")?.value),
      hasStateParam: Boolean(req.nextUrl.searchParams.get("state")),
      hasCodeParam: Boolean(req.nextUrl.searchParams.get("code")),
      errorParam: req.nextUrl.searchParams.get("error") ?? null,
    });
    return NextResponse.json({ error: "Missing accountId from OAuth state" }, { status: 400 });
  }

  const code = req.nextUrl.searchParams.get("code");
  const error = req.nextUrl.searchParams.get("error");
  const redirectUri =
    req.cookies.get("rp_oauth_linkedin_redirect_uri")?.value?.trim() ||
    process.env.LINKEDIN_REDIRECT_URI?.trim() ||
    new URL("/api/auth/linkedin/callback", req.nextUrl.origin).toString();
  const requestedScope =
    process.env.LINKEDIN_SCOPE?.trim() ||
    "openid profile email w_member_social";

  if (error || !code) {
    const response = NextResponse.redirect(new URL(`/${accountId}/accountPersona?error=auth_denied`, process.env.NEXTAUTH_URL || req.url));
    response.cookies.delete("rp_oauth_account");
    response.cookies.delete("rp_oauth_linkedin_redirect_uri");
    return response;
  }

  try {
    if (!process.env.LINKEDIN_CLIENT_ID || !process.env.LINKEDIN_CLIENT_SECRET) {
      throw new Error("Missing LinkedIn OAuth app credentials");
    }

    const tokenBody = new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
      client_id: process.env.LINKEDIN_CLIENT_ID,
      client_secret: process.env.LINKEDIN_CLIENT_SECRET,
    }).toString();

    let tokenData: Record<string, unknown> = {};
    let tokenStatus = 0;
    const exchangeErrors: string[] = [];
    const tokenUrls = [
      "https://www.linkedin.com/oauth/v2/accessToken",
      "https://linkedin.com/oauth/v2/accessToken",
    ];

    for (const tokenUrl of tokenUrls) {
      try {
        const tokenResponse = await fetch(tokenUrl, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: tokenBody,
        });
        tokenStatus = tokenResponse.status;
        tokenData = await tokenResponse.json().catch(() => ({}));
        if (tokenStatus >= 200 && tokenStatus < 300 && !tokenData.error) {
          break;
        }
      } catch (exchangeError) {
        exchangeErrors.push(`${tokenUrl} fetch failed: ${describeError(exchangeError)}`);
        try {
          const httpsFallback = await exchangeLinkedInTokenViaHttps(tokenUrl, tokenBody);
          tokenStatus = httpsFallback.status;
          tokenData = httpsFallback.data;
          if (tokenStatus >= 200 && tokenStatus < 300 && !tokenData.error) {
            break;
          }
        } catch (httpsError) {
          exchangeErrors.push(`${tokenUrl} https fallback failed: ${describeError(httpsError)}`);
        }
      }
    }

    if (tokenStatus < 200 || tokenStatus >= 300 || tokenData.error) {
      const errorDescription =
        (typeof tokenData.error_description === "string" && tokenData.error_description) ||
        (typeof tokenData.error === "string" && tokenData.error) ||
        `Token exchange failed (status ${tokenStatus})`;
      const exchangeDetail = exchangeErrors.length > 0 ? `; attempts: ${exchangeErrors.join(" | ")}` : "";
      throw new Error(`${errorDescription}${exchangeDetail}`);
    }

    const accessToken = pickString(tokenData, "access_token");
    const refreshToken = pickString(tokenData, "refresh_token") || undefined;
    const idTokenPayload =
      typeof tokenData.id_token === "string" ? decodeJwtPayload(tokenData.id_token) : {};
    const expiresInSeconds =
      typeof tokenData.expires_in === "number"
        ? tokenData.expires_in
        : typeof tokenData.expires_in === "string"
          ? Number(tokenData.expires_in)
          : 0;

    if (!accessToken) {
      throw new Error("LinkedIn token response missing access_token");
    }
    let userInfo: Record<string, unknown> = {};

    // Prefer OIDC userinfo because openid/profile/email are requested.
    try {
      const res = await getLinkedInApiViaHttps("https://api.linkedin.com/v2/userinfo", accessToken);
      if (res.status >= 200 && res.status < 300) {
        userInfo = res.data;
      } else {
        throw new Error(`userinfo failed with status ${res.status}`);
      }
    } catch (userinfoError) {
      console.warn("LinkedIn userinfo request failed, falling back", userinfoError);
    }

    let platformUserId =
      (typeof userInfo.sub === "string" ? userInfo.sub : "") ||
      (typeof idTokenPayload.sub === "string" ? idTokenPayload.sub : "") ||
      (typeof userInfo.id === "string" ? userInfo.id : "");

    let platformUsername =
      (typeof userInfo.name === "string" ? userInfo.name : "") ||
      (typeof idTokenPayload.name === "string" ? idTokenPayload.name : "") ||
      (typeof userInfo.given_name === "string" ? userInfo.given_name : "");

    // Fallback for older app permissions that rely on /v2/me.
    if (!platformUserId || !platformUsername) {
      let legacyProfile: Record<string, unknown> = {};
      try {
        const res = await getLinkedInApiViaHttps("https://api.linkedin.com/v2/me", accessToken);
        if (res.status >= 200 && res.status < 300) {
          legacyProfile = res.data;
        } else {
          throw new Error(`/me failed with status ${res.status}`);
        }
      } catch (legacyProfileError) {
        console.warn("LinkedIn /me request failed", legacyProfileError);
      }

      platformUserId = platformUserId || pickString(legacyProfile, "id");
      const firstName = pickString(legacyProfile, "localizedFirstName");
      const lastName = pickString(legacyProfile, "localizedLastName");
      const legacyFullName = [firstName, lastName].filter(Boolean).join(" ");
      platformUsername = platformUsername || legacyFullName || "";
    }

    if (!platformUserId) {
      throw new Error(
        "LinkedIn profile lookup failed: could not resolve member identifier from userinfo/me/id_token",
      );
    }

    const tokenExpiresAt = expiresInSeconds > 0
      ? new Date(Date.now() + expiresInSeconds * 1000)
      : undefined;

    await upsertConnection(auth.userId, accountId, "linkedin", {
      accessToken,
      refreshToken,
      tokenExpiresAt,
      platformUserId,
      platformUsername: platformUsername || undefined,
      scope:
        typeof tokenData.scope === "string" && tokenData.scope.trim().length > 0
          ? tokenData.scope
          : requestedScope,
    });

    const response = NextResponse.redirect(new URL(`/${accountId}/accountPersona?connected=linkedin`, process.env.NEXTAUTH_URL || req.url));
    response.cookies.delete("rp_oauth_account");
    response.cookies.delete("rp_oauth_linkedin_redirect_uri");
    return response;
  } catch (error) {
    console.error("LinkedIn Personal OAuth error:", error);
    const message = error instanceof Error ? encodeURIComponent(error.message) : "OAuth failed";
    const response = NextResponse.redirect(
      new URL(`/${accountId}/accountPersona?error=auth_failed&platform=linkedin&reason=${message}`, process.env.NEXTAUTH_URL || req.url),
    );
    response.cookies.delete("rp_oauth_account");
    response.cookies.delete("rp_oauth_linkedin_redirect_uri");
    return response;
  }
}
