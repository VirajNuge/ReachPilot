import { NextResponse } from "next/server";
import { clearAdminAuthCookie } from "../../../../lib/adminAuth";

export async function POST() {
  const cookieOpts = clearAdminAuthCookie();
  const response = NextResponse.json({ success: true });
  response.cookies.set(cookieOpts);
  return response;
}
