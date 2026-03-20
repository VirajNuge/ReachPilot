import { NextResponse } from "next/server";
import { getAuthFromCookies } from "../../../../lib/auth";

export async function GET() {
  try {
    const auth = await getAuthFromCookies();
    if (!auth) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    // All user fields are embedded in the JWT — no DB lookup needed.
    return NextResponse.json(
      {
        user: {
          id: auth.userId,
          username: auth.username,
          email: auth.email,
          firstName: auth.firstName,
          lastName: auth.lastName,
        },
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json({ user: null }, { status: 401 });
  }
}
