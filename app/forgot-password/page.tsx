"use client";

import React, { useState } from "react";
import Link from "next/link";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await fetch("/api/auth/forgot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      setSuccess(
        "If an account with that email exists, we sent instructions to reset your password. Check your inbox."
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
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
            <span className="font-black text-[22px] text-[#1A1D23] tracking-tight leading-none">
              ReachPilot
            </span>
            <span className="text-[9px] font-bold text-[#0052FF] tracking-widest uppercase mt-0.5">
              Creator Suite
            </span>
          </div>
        </div>

        <div className="bg-white rounded-[40px] p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
          <div className="mb-8">
            <h1 className="text-[28px] font-black text-[#000100] tracking-tight">Forgot password</h1>
            <p className="text-[15px] text-slate-500 font-medium mt-1">
              Enter your email and we will send password reset instructions.
            </p>
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
              <label className="block text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="block w-full px-4 py-3.5 bg-[#F1F5F9] rounded-2xl text-[14px] font-medium text-[#000100] placeholder-slate-400 outline-none border-2 border-transparent focus:border-[#0052FF]/20 focus:bg-white transition-all duration-200"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-[#000100] hover:bg-black disabled:bg-[#000100]/60 text-white font-bold text-[15px] rounded-2xl transition-all duration-200 shadow-[0_4px_14px_rgba(0,0,0,0.1)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.15)] cursor-pointer border-none outline-none mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Sending...
                </span>
              ) : (
                "Send reset link"
              )}
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

export default ForgotPasswordPage;
