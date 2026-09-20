import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_CREDENTIALS,
  hasConfiguredAdminCredentials,
  signAdminToken,
  setAdminAuthCookie,
  verifyAdminCredentials,
} from "../../../../lib/adminAuth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!hasConfiguredAdminCredentials()) {
      return NextResponse.json({ error: "Admin authentication is not configured" }, { status: 503 });
    }

    if (!(await verifyAdminCredentials(username, password))) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const token = await signAdminToken(username);
    const cookieOpts = setAdminAuthCookie(token);

    const response = NextResponse.json({ success: true, username });
    response.cookies.set(cookieOpts);
    return response;
  } catch (err: unknown) {
    // Log a safe, concise error message (avoid printing the entire Request object)
    const message = err instanceof Error ? err.message : String(err);
    console.error('[admin/login] Unexpected error:', message);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
