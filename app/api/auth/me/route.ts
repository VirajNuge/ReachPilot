import { NextResponse } from "next/server";
import { getAuthFromCookies } from "../../../../lib/auth";
import { getUserById } from "../../../../lib/models/user";

export async function GET() {
  try {
    const auth = await getAuthFromCookies();
    if (!auth) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    const user = await getUserById(auth.userId);
    if (!user) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch {
    return NextResponse.json({ user: null }, { status: 401 });
  }
}
