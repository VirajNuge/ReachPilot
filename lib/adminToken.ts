import { SignJWT, jwtVerify } from "jose";

function getAdminJwtSecret(): Uint8Array {
  const secret = process.env.ADMIN_JWT_SECRET;
  if (!secret) throw new Error("ADMIN_JWT_SECRET is not set");
  return new TextEncoder().encode(secret);
}

export async function signAdminToken(username: string): Promise<string> {
  return new SignJWT({ username, role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(getAdminJwtSecret());
}

export async function verifyAdminToken(
  token: string,
): Promise<{ username: string; role: string } | null> {
  try {
    const { payload } = await jwtVerify(token, getAdminJwtSecret());
    return payload as { username: string; role: string };
  } catch {
    return null;
  }
}
