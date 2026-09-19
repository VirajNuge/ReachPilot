"use client";

import Link from "next/link";
import { useState } from "react";
import { AuthCard, AuthField, AuthMessage, AuthShell, authStyles } from "../components/auth/AuthShell";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setSuccess(""); setLoading(true);
    try { await fetch("/api/auth/forgot", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) }); setSuccess("If an account with that email exists, we sent password-reset instructions."); } catch (err) { setError(err instanceof Error ? err.message : "Request failed"); } finally { setLoading(false); }
  }
  return <AuthShell eyebrow="Account recovery"><AuthCard title="Forgot password?" description="Enter your email and we’ll send instructions if an account matches it.">{error && <AuthMessage type="error">{error}</AuthMessage>}{success && <AuthMessage type="success">{success}</AuthMessage>}<form onSubmit={handleSubmit}><AuthField label="Email" type="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="you@example.com" autoComplete="email" required /><button className={authStyles.submit} disabled={loading}>{loading ? "Sending…" : "Send reset link"}</button></form><div className={authStyles.authLinks}><Link href="/login">Back to sign in</Link><Link href="/signup">Get access</Link></div></AuthCard></AuthShell>;
}
