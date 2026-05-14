"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

const ResetPasswordPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!token) {
      setError("Missing reset token. Please use the link from your email.");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Reset failed");

      setSuccess("Password updated. Redirecting to login...");
      setTimeout(() => router.push("/login"), 1600);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f8fb] flex items-center justify-center p-4">
      <div className="relative w-full max-w-[460px]">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-11 h-11 bg-[#0052FF] rounded-[14px] flex items-center justify-center text-white shadow-[0_4px_14px_rgba(0,82,255,0.25)]">
            <span className="font-black">RP</span>
          </div>
          <div className="flex flex-col">
            <span className="font-black text-[22px] text-[#1A1D23] tracking-tight leading-none">ReachPilot</span>
            <span className="text-[9px] font-bold text-[#0052FF] tracking-widest uppercase mt-0.5">Creator Suite</span>
          </div>
        </div>

        <div className="bg-white rounded-[40px] p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
          <div className="mb-8">
            <h1 className="text-[28px] font-black text-[#000100] tracking-tight">Reset your password</h1>
            <p className="text-[15px] text-slate-500 font-medium mt-1">Set a new password for your account.</p>
          </div>

          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-100 rounded-xl">
              <p className="text-[13px] font-semibold text-red-600">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 px-4 py-3 bg-green-50 border border-green-100 rounded-xl">
              <p className="text-[13px] font-semibold text-green-700">{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">New password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="New password"
                required
                className="block w-full px-4 py-3.5 bg-[#F1F5F9] rounded-2xl text-[14px] font-medium text-[#000100] placeholder-slate-400 outline-none border-2 border-transparent focus:border-[#0052FF]/20 focus:bg-white transition-all duration-200"
              />
            </div>

            <div>
              <label className="block text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Confirm password</label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Confirm password"
                required
                className="block w-full px-4 py-3.5 bg-[#F1F5F9] rounded-2xl text-[14px] font-medium text-[#000100] placeholder-slate-400 outline-none border-2 border-transparent focus:border-[#0052FF]/20 focus:bg-white transition-all duration-200"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-[#000100] hover:bg-black disabled:bg-[#000100]/60 text-white font-bold text-[15px] rounded-2xl transition-all duration-200 shadow-[0_4px_14px_rgba(0,0,0,0.1)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.15)] cursor-pointer border-none outline-none mt-2"
            >
              {loading ? "Updating..." : "Update password"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-[13px] text-slate-400 font-medium">
              Remembered your password?{' '}
              <Link href="/login" className="text-[#0052FF] font-bold hover:underline no-underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
