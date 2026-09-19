"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthCard, AuthField, AuthMessage, AuthShell, authStyles } from "../components/auth/AuthShell";

function ResetPasswordForm() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token") || "";
  const [password, setPassword] = useState(""); const [confirm, setConfirm] = useState(""); const [error, setError] = useState(""); const [success, setSuccess] = useState(""); const [loading, setLoading] = useState(false);
  useEffect(() => { if (!token) setError("Missing reset token. Please use the link from your email."); }, [token]);
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setSuccess(""); if (!token) return; if (password.length < 6) { setError("Password must be at least 6 characters."); return; } if (password !== confirm) { setError("Passwords do not match."); return; } setLoading(true);
    try { const response = await fetch("/api/auth/reset", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, password }) }); const data = await response.json(); if (!response.ok) throw new Error(data?.error || "Reset failed"); setSuccess("Password updated. Redirecting to sign in…"); setTimeout(() => router.push("/login"), 1600); } catch (err) { setError(err instanceof Error ? err.message : "Reset failed"); } finally { setLoading(false); }
  }
  return <AuthShell eyebrow="Account recovery"><AuthCard title="Reset your password" description="Choose a new password for your ReachPilot account.">{error && <AuthMessage type="error">{error}</AuthMessage>}{success && <AuthMessage type="success">{success}</AuthMessage>}<form onSubmit={handleSubmit}><AuthField label="New password" type="password" value={password} onChange={event => setPassword(event.target.value)} placeholder="At least 6 characters" autoComplete="new-password" required /><AuthField label="Confirm password" type="password" value={confirm} onChange={event => setConfirm(event.target.value)} placeholder="Repeat your password" autoComplete="new-password" required /><button className={authStyles.submit} disabled={loading || !token}>{loading ? "Updating…" : "Update password"}</button></form><div className={authStyles.authLinks}><Link href="/login">Back to sign in</Link></div></AuthCard></AuthShell>;
}

export default function ResetPasswordPage() { return <Suspense fallback={<div style={{ minHeight: "100vh", background: "#f5f0fa" }} />}><ResetPasswordForm /></Suspense>; }
