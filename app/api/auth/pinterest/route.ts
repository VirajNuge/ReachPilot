import { NextRequest, NextResponse } from "next/server";
import { getAuthFromCookies } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const auth = await getAuthFromCookies();
  if (!auth) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const accountId = req.nextUrl.searchParams.get("accountId");
  if (!accountId) {
    return NextResponse.json({ error: "accountId is required" }, { status: 400 });
  }

  // Build Pinterest OAuth URL
  // Scopes: boards:read,pins:read,pins:write,user_accounts:read
  const params = new URLSearchParams({
    response_type: "code",
    client_id: process.env.PINTEREST_APP_ID!,
    redirect_uri: process.env.PINTEREST_REDIRECT_URI!,
    scope: "boards:read,pins:read,pins:write,user_accounts:read",
    state: accountId,
  });

  const authUrl = `https://www.pinterest.com/oauth/?${params.toString()}`;

  const response = NextResponse.redirect(authUrl);
  response.cookies.set("rp_oauth_account", accountId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });

  return response;
}
