import { NextRequest, NextResponse } from "next/server";
import { ADMIN_CREDENTIALS, signAdminToken, setAdminAuthCookie } from "../../../../lib/adminAuth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (
      username !== ADMIN_CREDENTIALS.username ||
      password !== ADMIN_CREDENTIALS.password
    ) {
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
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
