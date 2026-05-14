import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthFromRequest(request);
    if (!auth) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

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
