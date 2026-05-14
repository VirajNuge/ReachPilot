import { NextResponse, NextRequest } from "next/server";
import { getAuthFromRequest } from "@/lib/auth";
import { updateUserPassword } from "@/lib/models/user";

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthFromRequest(request);
    if (!auth || !auth.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { password } = body;
    if (!password || typeof password !== "string" || password.length < 6) {
      return NextResponse.json({ error: "Invalid password" }, { status: 400 });
    }

    await updateUserPassword(auth.userId, password);

    // Clear auth cookie to force re-login after password change
    const res = NextResponse.json({ ok: true });
    try {
      res.cookies.set({ name: "rp_token", value: "", path: "/", httpOnly: true, sameSite: "lax", maxAge: 0 });
    } catch {
      // some runtimes don't support res.cookies.set with object; ignore
    }
    return res;
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}
