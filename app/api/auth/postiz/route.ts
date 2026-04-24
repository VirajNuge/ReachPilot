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

  if (
    !process.env.POSTIZ_FRONTEND_URL ||
    !process.env.POSTIZ_CLIENT_ID ||
    !process.env.POSTIZ_REDIRECT_URI
  ) {
    return NextResponse.json(
      { error: "Missing Postiz OAuth environment variables" },
      { status: 500 }
    );
  }

  const state = `${accountId}:${Date.now()}`;
  const params = new URLSearchParams({
    client_id: process.env.POSTIZ_CLIENT_ID,
    response_type: "code",
    state,
  });

  const authUrl = `${process.env.POSTIZ_FRONTEND_URL}/oauth/authorize?${params.toString()}`;

  const response = NextResponse.redirect(authUrl);
  response.cookies.set("rp_oauth_account", accountId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });
  response.cookies.set("rp_postiz_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });

  return response;
}
