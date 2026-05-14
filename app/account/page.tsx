"use client";

import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

const AccountPage = () => {
  const { user } = useAuth();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Change failed");
      setSuccess("Password updated successfully");
      setPassword("");
      setConfirm("");
    } catch (err: any) {
      setError(err.message || "Could not change password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#E8ECF2] pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <h1 className="text-3xl font-black text-[#1A1D23] mb-2">Account</h1>
        <p className="text-slate-500 mb-6">Manage your account settings</p>

        <div className="bg-white rounded-[32px] p-8 shadow-[0_4px_30px_rgba(0,0,0,0.02)]">
          <h2 className="text-xl font-black text-[#1A1D23] mb-4">Change password</h2>
          <p className="text-[13px] text-slate-500 mb-6">Set a new password for your account. No current password required (for testing only).</p>

          {error && <div className="mb-4 px-4 py-3 bg-red-50 border border-red-100 rounded-xl"><p className="text-[13px] font-semibold text-red-600">{error}</p></div>}
          {success && <div className="mb-4 px-4 py-3 bg-green-50 border border-green-100 rounded-xl"><p className="text-[13px] font-semibold text-green-700">{success}</p></div>}

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
                placeholder="Confirm new password"
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
        </div>
      </div>
    </div>
  );
};

export default AccountPage;
