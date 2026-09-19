"use client";

import Link from "next/link";
import { useState } from "react";
import { AuthCard, AuthField, AuthMessage, AuthShell, authStyles } from "../../../components/auth/AuthShell";
import { useAuth } from "../../../contexts/AuthContext";

export default function SignupPage() {
  const { signup } = useAuth();
  const [formData, setFormData] = useState({ username: "", firstName: "", lastName: "", email: "", password: "", signupCode: "" });
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function updateField(event: React.ChangeEvent<HTMLInputElement>) { setFormData(current => ({ ...current, [event.target.name]: event.target.value })); }
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError("");
    if (!agreeTerms) { setError("Please agree to the Terms and Privacy Policy before continuing."); return; }
    if (formData.password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setLoading(true);
    try { await signup(formData); } catch (err) { setError(err instanceof Error ? err.message : "Signup failed"); } finally { setLoading(false); }
  }

  return <AuthShell eyebrow="Invite-only access"><AuthCard title="Create your account" description="ReachPilot is currently invite-only. Enter the access code you received to begin.">{error && <AuthMessage type="error">{error}</AuthMessage>}<form onSubmit={handleSubmit}><AuthField label="Access code" name="signupCode" value={formData.signupCode} onChange={updateField} placeholder="Enter your access code" autoComplete="one-time-code" required /><div className={authStyles.fieldGrid}><AuthField label="First name" name="firstName" value={formData.firstName} onChange={updateField} placeholder="First name" autoComplete="given-name" required /><AuthField label="Last name" name="lastName" value={formData.lastName} onChange={updateField} placeholder="Last name" autoComplete="family-name" required /></div><AuthField label="Username" name="username" value={formData.username} onChange={updateField} placeholder="Choose a username" autoComplete="username" required /><AuthField label="Email" type="email" name="email" value={formData.email} onChange={updateField} placeholder="you@example.com" autoComplete="email" required /><AuthField label="Password" type="password" name="password" value={formData.password} onChange={updateField} placeholder="At least 6 characters" autoComplete="new-password" minLength={6} required /><label className={authStyles.terms}><input type="checkbox" checked={agreeTerms} onChange={event => setAgreeTerms(event.target.checked)} /> I agree to the <Link href="/terms">Terms</Link> and <Link href="/privacy">Privacy Policy</Link>.</label><button className={authStyles.submit} disabled={loading}>{loading ? "Creating account…" : "Create account"}</button></form><div className={authStyles.authLinks}><span>Already have an account?</span><Link href="/login">Sign in</Link></div></AuthCard></AuthShell>;
}
