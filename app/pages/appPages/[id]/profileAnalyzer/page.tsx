"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { useSearchParams, useRouter, useParams } from "next/navigation";
// framer-motion removed — entrance animations use Tailwind animate-in (zero bundle cost)
import { FaChrome, FaArrowRight, FaSearch, FaHistory } from "react-icons/fa";
import { RefreshCw, X } from "lucide-react";
import Link from "next/link";
import AnalyzedAccountPage from "./analyzed-account/page";
import { useAuth } from "../../../../contexts/AuthContext";
import {
  getHistory,
  AnalysisSession,
  fetchAnalysisHistory,
} from "../../../../../lib/storage";

export default function UnifiedAnalyzerPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const params = useParams();
  const routeAccountId = params?.id as string | undefined;
  const isFromExtension = searchParams.get("source") === "extension";

  // Auto-show dashboard when coming from extension, otherwise use toggle
  const [hasAnalysis, setHasAnalysis] = useState(isFromExtension);

  const { user, accounts } = useAuth();
  const [historyItems, setHistoryItems] = useState<AnalysisSession[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [accountId, setAccountId] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    setIsHistoryLoading(true);
    // Use accountId from route params, local state, or AuthContext (no extra fetch)
    let resolvedAccountId = routeAccountId || accountId || accounts?.[0]?._id;
    if (!resolvedAccountId) {
      try {
        const accountsRes = await fetch("/api/accounts");
        if (accountsRes.ok) {
          const accountsJson = await accountsRes.json();
          const foundId = accountsJson?.accounts?.[0]?._id;
          if (foundId) {
            setAccountId(foundId);
            resolvedAccountId = foundId;
          }
        }
      } catch (e) {
        console.warn("Failed to fetch accounts:", e);
      }
    }

    if (user?.id && resolvedAccountId) {
      try {
        const server = await fetchAnalysisHistory(resolvedAccountId, {
          limit: 50,
        });
        const mapped: AnalysisSession[] = (server.analyses || []).map(
          (a: any) => ({
            id: a.id,
            timestamp: a.createdAt,
            profileHandle: a.profileHandle,
            profileName: a.profileName,
            score: a.overallScore,
            data: a.analysisData,
          }),
        );
        if (mapped.length > 0) {
          setHistoryItems(mapped);
        } else {
          setHistoryItems(await getHistory(user?.id));
        }
      } catch (e) {
        console.warn(
          "Failed to load server history, falling back to local:",
          e,
        );
        const h = await getHistory(user?.id);
        setHistoryItems(h);
      }
    } else {
      const h = await getHistory(user?.id);
      setHistoryItems(h);
    }
    setIsHistoryLoading(false);
  }, [user, accountId, routeAccountId, accounts]);

  // CSS-transition-based close: fade out then unmount
  const closeHistory = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsHistoryOpen(false);
      setIsClosing(false);
    }, 200);
  };

  const formAreaRef = useRef<HTMLDivElement>(null);
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!formAreaRef.current) return;
    const rect = formAreaRef.current.getBoundingClientRect();
    formAreaRef.current.style.setProperty(
      "--mouse-x",
      `${e.clientX - rect.left}px`,
    );
    formAreaRef.current.style.setProperty(
      "--mouse-y",
      `${e.clientY - rect.top}px`,
    );
  };

  return (
    <>
      <div
        ref={formAreaRef}
        onMouseMove={handleMouseMove}
        className="min-h-screen bg-gradient-to-br from-[#E2EFFF] to-[#C7DEFF] pt-12 md:pt-20 pb-16 px-4 sm:px-6 lg:px-8 flex items-start justify-center font-sans text-[#1A1D23] relative overflow-hidden group/page"
      >
        {/* Interactive Background Plus Pattern on the whole page */}
        <div
          className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-500 opacity-50 group-hover/page:opacity-100"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='30' height='30' viewBox='0 0 30 30' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M14 14V0h2v14h14v2H16v14h-2V16H0v-2h14z' fill='%230052FF' fill-opacity='0.12' fill-rule='evenodd'/%3E%3C/svg%3E")`,
            backgroundSize: "30px 30px",
            maskImage:
              "radial-gradient(800px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), black 0%, transparent 80%)",
            WebkitMaskImage:
              "radial-gradient(800px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), black 0%, transparent 80%)",
          }}
        />

        {/* Main White Container */}
        <div
          className={`bg-white rounded-3xl shadow-[0_20px_60px_rgba(0,10,50,0.05)] border border-white/50 flex flex-col relative z-10 p-8 md:p-12 ${hasAnalysis ? "w-full max-w-7xl min-h-[750px]" : "w-full max-w-[1000px] h-fit"}`}
        >
          {/* Header Section */}

          {!hasAnalysis ? (
            /* --- STATE 1: GUIDE / LANDING --- */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16 items-center animate-in fade-in slide-in-from-bottom-4 duration-300">
              {/* Left: Value Prop & CTA */}
              <div className="space-y-8">
                <h2 className="text-4xl md:text-5xl font-black text-[#000100] leading-[1.1]">
                  Audit any profile <br />
                  <span className="text-[#074ed5]">in seconds.</span>
                </h2>
                <p className="text-lg text-slate-500 font-medium leading-relaxed max-w-md">
                  Stop guessing why you're not growing. Get a deep-dive audit of
                  your content strategy, audience, and revenue funnels.
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                  <button className="px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all hover:scale-[1.02] bg-[#0052FF] hover:bg-[#0044dd] text-white shadow-[0_4px_16px_rgba(0,82,255,0.3)]">
                    <FaChrome size={20} />
                    Download Extension
                  </button>
                  <button className="px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all bg-white hover:bg-slate-50 text-[#000100] border border-slate-200 hover:border-slate-300">
                    Watch Demo <FaArrowRight size={12} />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsHistoryOpen(true);
                      fetchHistory();
                    }}
                    className="px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all bg-white hover:bg-slate-50 text-[#000100] border border-slate-200 hover:border-slate-300"
                  >
                    <FaHistory size={18} />
                    History
                  </button>
                </div>

                <div className="flex items-center gap-4 pt-4">
                  <div className="flex -space-x-3">
                    {[10, 11, 12, 13].map((i) => (
                      <div
                        key={i}
                        className="w-10 h-10 rounded-full border-2 border-white bg-gray-200 overflow-hidden"
                      >
                        <img
                          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`}
                          alt="User"
                        />
                      </div>
                    ))}
                  </div>
                  <p className="text-sm font-bold text-slate-500">
                    Join{" "}
                    <span className="text-[#000100]">5,000+ marketers</span>{" "}
                    using ReachPilot.
                  </p>
                </div>
              </div>

              {/* Right: Visual Steps */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-[#074ed5]/10 to-[#caee55]/10 rounded-[40px] blur-3xl animate-pulse" />
                <div className="relative bg-white rounded-3xl border border-slate-100 p-8 shadow-[0_4px_24px_rgba(0,0,0,0.05)]">
                  <h3 className="text-lg font-bold text-[#000100] mb-6 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#074ed5]" />{" "}
                    How it works
                  </h3>

                  <div className="space-y-6">
                    {[
                      {
                        step: "01",
                        title: "Install & Pin",
                        desc: "Add the ReachPilot extension to your browser.",
                      },
                      {
                        step: "02",
                        title: "Visit Profile",
                        desc: "Go to any LinkedIn or Twitter profile you want to audit.",
                      },
                      {
                        step: "03",
                        title: "One-Click Audit",
                        desc: "Open the extension and click 'Run Deep Scan'.",
                      },
                      {
                        step: "04",
                        title: "Growth Blueprint",
                        desc: "Get a complete breakdown of their pillars, funnel, and strategy.",
                      },
                    ].map((item, i) => (
                      <div key={i} className="flex gap-4 group">
                        <div className="w-10 h-10 rounded-xl bg-[#f4f8fb] text-slate-400 font-bold flex items-center justify-center border border-slate-100 group-hover:bg-[#074ed5]/10 group-hover:text-[#074ed5] group-hover:border-[#074ed5]/20 transition-colors shrink-0">
                          {item.step}
                        </div>
                        <div>
                          <h4 className="font-bold text-[#000100] text-sm group-hover:text-[#074ed5] transition-colors">
                            {item.title}
                          </h4>
                          <p className="text-sm text-slate-500 leading-snug">
                            {item.desc}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* --- STATE 2: ANALYSIS DASHBOARD --- */
            <div className="mt-4 animate-in fade-in duration-300">
              <AnalyzedAccountPage />
            </div>
          )}
        </div>
      </div>

      {/* History Modal — CSS transition, no framer-motion dependency */}
      {isHistoryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <div
            className={`absolute inset-0 bg-[#0F172A]/40 backdrop-blur-sm transition-opacity duration-200 ${isClosing ? 'opacity-0' : 'opacity-100'}`}
            onClick={closeHistory}
          />
          {/* Modal panel */}
          <div
            className={`relative w-full max-w-3xl max-h-[85vh] bg-white/95 backdrop-blur-xl rounded-[32px] shadow-[0_40px_100px_rgba(15,23,42,0.15)] border border-white flex flex-col overflow-hidden transition-all duration-200 ${isClosing ? 'opacity-0 scale-95 translate-y-4' : 'opacity-100 scale-100 translate-y-0'}`}
          >
              <div className="px-8 py-5 border-b border-[#E2E8F0]/60 flex items-center justify-between bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(238,243,255,0.76))]">
                <div>
                  <h3 className="text-lg font-black text-[#1A1D23]">
                    Analysis History
                  </h3>
                  <p className="text-xs text-[#64748B] font-medium mt-0.5">
                    Review your previous profile audits.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={fetchHistory}
                    className="px-3 py-1.5 rounded-full text-xs font-bold text-[#64748B] hover:text-[#0052FF] hover:bg-[#0052FF]/5 transition-colors flex items-center gap-1"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Refresh
                  </button>
                  <button
                    type="button"
                    onClick={closeHistory}
                    className="p-2 rounded-full text-[#64748B] hover:text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
                {isHistoryLoading ? (
                  <div className="py-12 flex flex-col items-center justify-center text-center">
                    <RefreshCw className="w-6 h-6 text-[#0052FF] animate-spin mb-3" />
                    <p className="text-sm font-semibold text-[#64748B]">
                      Loading history...
                    </p>
                  </div>
                ) : historyItems.length === 0 ? (
                  <div className="py-12 flex flex-col items-center justify-center text-center">
                    <FaHistory className="w-12 h-12 text-[#CBD5E1] mb-3" />
                    <p className="text-[#1A1D23] font-bold">
                      No saved analyses yet
                    </p>
                    <p className="text-sm text-[#64748B] mt-1">
                      Your profile audits will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {historyItems.map((item) => {
                      const createdLabel = new Date(
                        item.timestamp,
                      ).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      });

                      return (
                        <div
                          key={item.id}
                          className={`group relative flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-2xl border transition-all border-[#E2E8F0] bg-white hover:border-[#0052FF]/30 hover:shadow-md hover:bg-[#F8FAFD]`}
                        >
                          <div
                            className="flex-1 min-w-0 cursor-pointer"
                            onClick={() => {
                              setIsHistoryOpen(false);
                              router.push(`?loadId=${item.id}`);
                              setHasAnalysis(true);
                            }}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[11px] font-semibold text-[#94A3B8] ml-auto shrink-0">
                                {createdLabel}
                              </span>
                            </div>
                            <h4 className="text-sm font-black text-[#1A1D23] truncate mb-1 pr-8">
                              {item.profileName}
                            </h4>
                            <p className="text-xs text-[#64748B] truncate mb-2">
                              @{item.profileHandle}
                            </p>
                            <div className="flex flex-wrap gap-1">
                              <span className="text-[10px] font-bold text-[#0052FF] bg-[#0052FF]/10 px-2 py-0.5 rounded-md">
                                Score: {item.score}
                              </span>
                            </div>
                          </div>
                          <div className="flex sm:flex-col items-center gap-2 self-end sm:self-center shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                setIsHistoryOpen(false);
                                router.push(`?loadId=${item.id}`);
                                setHasAnalysis(true);
                              }}
                              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[linear-gradient(135deg,#111827,#0052FF)] text-white text-[11px] font-bold hover:brightness-110 transition-all shadow-sm flex items-center justify-center gap-1.5"
                            >
                              Open <FaArrowRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
          </div>
        </div>
      )}
    </>
  );
}
