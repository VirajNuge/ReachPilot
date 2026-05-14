import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "../../../../lib/auth";
import { getUserById } from "../../../../lib/models/user";

export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthFromRequest(request);
    if (!auth) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    const user =
      auth.email && auth.firstName && auth.lastName && auth.createdAt
        ? {
            id: auth.userId,
            username: auth.username,
            email: auth.email,
            firstName: auth.firstName,
            lastName: auth.lastName,
            createdAt: auth.createdAt,
          }
        : await getUserById(auth.userId);

    if (!user) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    return NextResponse.json(
      {
        user,
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json({ user: null }, { status: 401 });
  }
}
