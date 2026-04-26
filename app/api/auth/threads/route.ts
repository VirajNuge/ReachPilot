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
    !process.env.THREADS_APP_ID ||
    !process.env.THREADS_REDIRECT_URI
  ) {
    return NextResponse.json(
      { error: "Missing Threads OAuth environment variables" },
      { status: 500 }
    );
  }

  const params = new URLSearchParams({
    client_id: process.env.THREADS_APP_ID,
    redirect_uri: process.env.THREADS_REDIRECT_URI,
    scope: "threads_basic,threads_content_publish,threads_manage_insights",
    response_type: "code",
    state: accountId,
  });

  const authUrl = `https://threads.net/oauth/authorize?${params.toString()}`;

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
