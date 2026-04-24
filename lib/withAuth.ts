import { getAuthFromCookies } from "./auth";
import { NextResponse } from "next/server";

export interface AuthContext {
  userId: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
}

/**
 * Returns the auth context or a 401 NextResponse.
 *
 * Usage:
 *   const authResult = await requireAuth();
 *   if (authResult instanceof NextResponse) return authResult;
 *   const { userId } = authResult;
 */
export async function requireAuth(): Promise<AuthContext | NextResponse> {
  const auth = await getAuthFromCookies();
  if (!auth?.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return auth;
}
