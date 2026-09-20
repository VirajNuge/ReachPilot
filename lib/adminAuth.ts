import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { signAdminToken, verifyAdminToken } from "./adminToken";

export { signAdminToken, verifyAdminToken } from "./adminToken";

const ADMIN_COOKIE_NAME = "rp_admin_token";

export const ADMIN_CREDENTIALS = {
  username: process.env.ADMIN_USERNAME?.trim() || "",
  passwordHash: process.env.ADMIN_PASSWORD_HASH?.trim() || "",
};

export function hasConfiguredAdminCredentials(): boolean {
  return Boolean(ADMIN_CREDENTIALS.username && ADMIN_CREDENTIALS.passwordHash);
}

export async function verifyAdminCredentials(username: unknown, password: unknown): Promise<boolean> {
  if (!hasConfiguredAdminCredentials() || typeof username !== "string" || typeof password !== "string") {
    return false;
  }
  if (username !== ADMIN_CREDENTIALS.username) return false;
  return bcrypt.compare(password, ADMIN_CREDENTIALS.passwordHash);
}

export function setAdminAuthCookie(token: string) {
  return {
    name: ADMIN_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 8, // 8 hours
  };
}

export function clearAdminAuthCookie() {
  return {
    name: ADMIN_COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 0,
  };
}

export function getAdminTokenFromRequest(request: NextRequest): string | null {
  return request.cookies.get(ADMIN_COOKIE_NAME)?.value || null;
}

export async function requireAdminAuth(
  request: NextRequest
): Promise<{ username: string; role: string } | null> {
  const token = getAdminTokenFromRequest(request);
  if (!token) return null;
  return verifyAdminToken(token);
}
