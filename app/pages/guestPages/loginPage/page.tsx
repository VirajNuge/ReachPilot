"use client";

import Link from "next/link";
import { useState } from "react";
import { AuthCard, AuthField, AuthMessage, AuthShell, authStyles } from "../../../components/auth/AuthShell";
import { useAuth } from "../../../contexts/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setLoading(true);
    try { await login(username, password); } catch (err) { setError(err instanceof Error ? err.message : "Login failed"); } finally { setLoading(false); }
  }

  return <AuthShell eyebrow="Welcome back"><AuthCard title="Welcome back" description="Sign in to return to your workspace.">{error && <AuthMessage type="error">{error}</AuthMessage>}<form onSubmit={handleSubmit}><AuthField label="Username" value={username} onChange={event => setUsername(event.target.value)} placeholder="Enter your username" autoComplete="username" required /><AuthField label="Password" type="password" value={password} onChange={event => setPassword(event.target.value)} placeholder="Enter your password" autoComplete="current-password" required /><button className={authStyles.submit} disabled={loading}>{loading ? "Signing in…" : "Sign in"}</button></form><div className={authStyles.authLinks}><Link href="/forgot-password">Forgot password?</Link><span>Need an account? <Link href="/signup">Get access</Link></span></div></AuthCard></AuthShell>;
}
