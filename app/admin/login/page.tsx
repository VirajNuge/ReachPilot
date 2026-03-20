"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, Eye, EyeOff } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Invalid credentials");
        return;
      }
      router.push("/admin");
    } catch {
      setError("Connection failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-[#F8F9FC] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 bg-[#0052FF] rounded-2xl flex items-center justify-center shadow-[0_4px_20px_rgba(0,82,255,0.3)]">
            <Shield size={22} className="text-white" />
          </div>
          <div>
            <p className="text-[#1A1D23] font-black text-[22px] leading-none tracking-tight">
              Admin Panel
            </p>
            <p className="text-[10px] font-bold text-[#0052FF] tracking-widest uppercase mt-0.5">
              ReachPilot Control Center
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl p-10 border border-slate-200 shadow-[0_20px_60px_rgba(0,0,0,0.08)]">
          <div className="mb-7">
            <h1 className="text-[26px] font-black text-[#1A1D23] tracking-tight">
              Welcome back
            </h1>
            <p className="text-[14px] text-slate-400 font-medium mt-1">
              Sign in with your admin credentials
            </p>
          </div>

          {error && (
            <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-[13px] font-semibold text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Admin username"
                required
                autoComplete="username"
                className="block w-full px-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-[14px] font-medium text-[#1A1D23] placeholder-slate-400 outline-none focus:border-[#0052FF] focus:ring-1 focus:ring-[#0052FF]/20 transition-colors duration-200"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Admin password"
                  required
                  autoComplete="current-password"
                  className="block w-full px-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-[14px] font-medium text-[#1A1D23] placeholder-slate-400 outline-none focus:border-[#0052FF] focus:ring-1 focus:ring-[#0052FF]/20 transition-colors duration-200 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors bg-transparent border-none cursor-pointer"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-[#0052FF] hover:bg-[#0047FF] disabled:opacity-60 text-white font-bold text-[15px] rounded-2xl transition-all duration-200 shadow-[0_4px_14px_rgba(0,82,255,0.3)] hover:shadow-[0_6px_20px_rgba(0,82,255,0.4)] cursor-pointer border-none mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Signing in...
                </span>
              ) : (
                "Sign In to Admin"
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-[12px] text-slate-400 mt-6">
          Restricted access — authorized personnel only
        </p>
      </div>
    </div>
  );
}
