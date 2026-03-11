"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "../../../contexts/AuthContext";
import { FaRocket, FaEye, FaEyeSlash } from "react-icons/fa";

const SignupPage = () => {
  const { signup } = useAuth();
  const [formData, setFormData] = useState({
    username: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!agreeTerms) {
      setError("Please agree to the terms & conditions");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      await signup(formData);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f8fb] flex items-center justify-center p-4">
      <style jsx global>{`
        * {
          box-sizing: border-box;
        }
        input,
        button {
          margin: 0;
          padding: 0;
          border: none;
        }
      `}</style>
      <div className="relative w-full max-w-[460px]">
        {/* Logo Header */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-11 h-11 bg-[#0052FF] rounded-[14px] flex items-center justify-center text-white shadow-[0_4px_14px_rgba(0,82,255,0.25)]">
            <FaRocket size={20} />
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

        {/* Signup Card */}
        <div className="bg-white rounded-[40px] p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
          <div className="mb-8">
            <h1 className="text-[28px] font-black text-[#000100] tracking-tight">
              Create account
            </h1>
            <p className="text-[15px] text-slate-500 font-medium mt-1">
              Join thousands of creators growing with AI
            </p>
          </div>

          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-100 rounded-xl">
              <p className="text-[13px] font-semibold text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                Username
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Choose a username"
                required
                className="block w-full px-4 py-3.5 bg-[#F1F5F9] rounded-2xl text-[14px] font-medium text-[#000100] placeholder-slate-400 outline-none border-2 border-transparent focus:border-[#0052FF]/20 focus:bg-white transition-all duration-200"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Viraj"
                  required
                  className="block w-full px-4 py-3.5 bg-[#F1F5F9] rounded-2xl text-[14px] font-medium text-[#000100] placeholder-slate-400 outline-none border-2 border-transparent focus:border-[#0052FF]/20 focus:bg-white transition-all duration-200"
                />
              </div>
              <div>
                <label className="block text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Nugekotuwa"
                  required
                  className="block w-full px-4 py-3.5 bg-[#F1F5F9] rounded-2xl text-[14px] font-medium text-[#000100] placeholder-slate-400 outline-none border-2 border-transparent focus:border-[#0052FF]/20 focus:bg-white transition-all duration-200"
                />
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="viraj@gmail.com"
                required
                className="block w-full px-4 py-3.5 bg-[#F1F5F9] rounded-2xl text-[14px] font-medium text-[#000100] placeholder-slate-400 outline-none border-2 border-transparent focus:border-[#0052FF]/20 focus:bg-white transition-all duration-200"
              />
            </div>

            <div>
              <label className="block text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                Password
              </label>
              <div className="relative w-full flex items-center">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min. 6 characters"
                  required
                  className="block w-full px-4 py-3.5 bg-[#F1F5F9] rounded-2xl text-[14px] font-medium text-[#000100] placeholder-slate-400 outline-none border-2 border-transparent focus:border-[#0052FF]/20 focus:bg-white transition-all duration-200 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 text-slate-400 hover:text-slate-600 transition-colors bg-transparent border-none outline-none cursor-pointer flex items-center justify-center p-0 z-10"
                >
                  {showPassword ? (
                    <FaEyeSlash size={16} />
                  ) : (
                    <FaEye size={16} />
                  )}
                </button>
              </div>
            </div>

            <label className="flex items-center gap-2.5 cursor-pointer mt-1">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="w-4 h-4 rounded accent-[#0052FF]"
              />
              <span className="text-[12px] font-semibold text-slate-500">
                I agree to the{" "}
                <span className="text-[#0052FF]">Terms & Conditions</span>
              </span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-[#000100] hover:bg-black disabled:bg-[#000100]/60 text-white font-bold text-[15px] rounded-2xl transition-all duration-200 shadow-[0_4px_14px_rgba(0,0,0,0.1)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.15)] cursor-pointer border-none outline-none mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Creating account...
                </span>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <div className="mt-5 text-center">
            <p className="text-[13px] text-slate-400 font-medium">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-[#0052FF] font-bold hover:underline no-underline outline-none border-none"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
