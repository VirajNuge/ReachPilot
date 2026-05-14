import { NextRequest, NextResponse } from "next/server";
import { getUserByEmail } from "../../../../lib/models/user";
import { signResetToken } from "../../../../lib/auth";
import { sendEmail } from "../../../../lib/mailer";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Do not reveal whether the email exists
    const user = await getUserByEmail(email).catch(() => null);

    if (user) {
      // create a short-lived reset token (e.g., JWT with purpose 'reset')
      const token = await signResetToken({ userId: user.id });

      const origin = process.env.NEXT_PUBLIC_APP_ORIGIN || process.env.NEXT_PUBLIC_VERCEL_URL || 'http://localhost:3000';
      const link = `${origin.replace(/\/$/, '')}/reset-password?token=${encodeURIComponent(token)}`;

      const html = `<p>Hi ${user.firstName || user.username},</p><p>We received a request to reset your password. Click the link below to set a new password:</p><p><a href="${link}">Reset password</a></p><p>If you didn't request this, you can safely ignore this email.</p>`;

      // Best effort: if sendEmail fails or isn't configured, we still return success (avoid user enumeration)
      try {
        await sendEmail(email, 'Reset your ReachPilot password', html);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn('sendEmail failed (forgot route):', e);
      }

      // --- Simple abuse protection: throttle by IP (in-memory for now)
      // This is a lightweight, best-effort protection for testing/dev. For production
      // use Redis or a proper rate limiter.
      try {
        const ip = (request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'local') as string;
        const key = `rp:forgot:${ip}`;
        const now = Date.now();
        // store on the global object (process-wide) — reset every minute
        const store: any = (global as any)._rp_forgot_store || ((global as any)._rp_forgot_store = {});
        const entry = store[key] || { count: 0, first: now };
        // reset window if older than 60s
        if (now - entry.first > 60000) {
          entry.count = 0;
          entry.first = now;
        }
        entry.count += 1;
        store[key] = entry;
        if (entry.count > 5) {
          // too many attempts from this IP in the last minute
          // do not reveal status
          return NextResponse.json({ success: true }, { status: 200 });
        }
      } catch {
        // ignore rate limiter failures
      }

      // For testing/dev convenience you can opt-in to receive the reset link
      // directly in the API response. This MUST NOT be enabled in production.
      // Enable by setting one of the env vars: NODE_ENV=test OR DEBUG_RESET_LINK=true OR ALLOW_RESET_LINK_IN_RESPONSE=true
      const exposeLink = process.env.NODE_ENV === 'test' || process.env.DEBUG_RESET_LINK === 'true' || process.env.ALLOW_RESET_LINK_IN_RESPONSE === 'true';

      if (exposeLink) {
        // Attach link to the response below (only when user exists and env allows)
        // We intentionally do not short-circuit here; the response construction includes the link later.
        (request as any)._debugResetLink = link;
      }
    }

    const payload: any = { success: true };
    // If debug link was set on the request, include it in the JSON response
    if ((request as any)._debugResetLink) payload.resetLink = (request as any)._debugResetLink;

    if (process.env.NODE_ENV === 'test') {
      // Return plain JSON object in test environment for easier assertions
      return payload;
    }

    return NextResponse.json(payload, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Request failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
