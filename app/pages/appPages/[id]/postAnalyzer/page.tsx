"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
// framer-motion removed — entrance animations use Tailwind animate-in (zero bundle cost)
import {
  FaChrome,
  FaArrowRight,
  FaSearch,
  FaMagic,
  FaShare,
  FaChevronRight,
  FaSpinner,
  FaHistory,
} from "react-icons/fa";
import HookCTAScorecard from "../../components/PostAnalyzer/HookCTAScorecard";
import CommentGapDiscovery from "../../components/PostAnalyzer/CommentGapDiscovery";
import LeadPersonaID from "../../components/PostAnalyzer/LeadPersonaID";
import VisualStrategyDecoder from "../../components/PostAnalyzer/VisualStrategyDecoder";
import ViralVelocity from "../../components/PostAnalyzer/ViralVelocity";
import SentimentVibe from "../../components/PostAnalyzer/SentimentVibe";
import CompetitorBenchmarking from "../../components/PostAnalyzer/CompetitorBenchmarking";
import RetentionHook from "../../components/PostAnalyzer/RetentionHook";
import {
  fetchPostAnalysisHistory,
  savePostAnalysis,
  PostAnalysisHistorySession,
} from "../../../../../lib/storage";

export default function PostAnalyzerPage() {
  const params = useParams();
  const accountId = params?.id as string;
  const router = useRouter();
  const searchParams = useSearchParams();
  const analysisId = searchParams.get("analysisId");

  const [analysisData, setAnalysisData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(!!analysisId);
  const [error, setError] = useState<string | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [historyItems, setHistoryItems] = useState<PostAnalysisHistorySession[]>([]);
  const savedAnalysisRef = useRef<string | null>(null);

  useEffect(() => {
    if (!analysisId) return;

    const fetchAnalysis = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/analyze-post/${analysisId}?accountId=${encodeURIComponent(accountId)}`);
        if (!res.ok) throw new Error("Failed to load analysis");
        const json = await res.json();
        if (json.success && json.data) {
          setAnalysisData(json.data);
        } else {
          setError(json.error || "Analysis not found");
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalysis();
  }, [analysisId]);

  useEffect(() => {
    if (!analysisData || !accountId || !analysisData.id) return;
    if (savedAnalysisRef.current === analysisData.id) return;
    savedAnalysisRef.current = analysisData.id;
    savePostAnalysis(analysisData, accountId, {
      analysisId: analysisData.id,
      source: "web",
    });
  }, [analysisData, accountId]);

  const openHistory = async () => {
    setIsHistoryOpen(true);
    setIsHistoryLoading(true);
    try {
      const response = await fetchPostAnalysisHistory(accountId, { limit: 50 });
      setHistoryItems(response.analyses || []);
    } finally {
      setIsHistoryLoading(false);
    }
  };

  const openHistoryItem = (item: PostAnalysisHistorySession) => {
    setIsHistoryOpen(false);
    setError(null);
    setAnalysisData(null);
    setIsLoading(true);
    router.push(`?analysisId=${encodeURIComponent(item.analysisId)}`);
  };

  const formAreaRef = useRef<HTMLDivElement>(null);
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!formAreaRef.current) return;
    const rect = formAreaRef.current.getBoundingClientRect();
    formAreaRef.current.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
    formAreaRef.current.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
  };

  const hasAnalysis = !!analysisData;
  const isDashboard = !isLoading && !error && hasAnalysis;

  return (
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
          backgroundSize: '30px 30px',
          maskImage: 'radial-gradient(800px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), black 0%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(800px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), black 0%, transparent 80%)',
        }}
      />

      {/* Main White Container */}
      <div className={`bg-white rounded-3xl shadow-[0_20px_60px_rgba(0,10,50,0.05)] border border-white/50 flex flex-col relative z-10 p-8 md:p-12 ${isDashboard ? 'w-full max-w-[1600px] min-h-[750px]' : 'w-full max-w-[1000px] h-fit'}`}>
        {/* ─── Loading ─── */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <FaSpinner className="animate-spin text-4xl text-[#074ed5] mb-4" />
            <h2 className="text-2xl font-bold text-[#000100]">
              Analyzing Post DNA...
            </h2>
            <p className="text-slate-500 text-sm mt-2 font-medium">
              Extracting hooks, retention metrics, and audience sentiment.
            </p>
          </div>
        )}

        {/* ─── Error ─── */}
        {error && (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="bg-white text-red-600 p-8 rounded-3xl border border-red-100 max-w-md text-center shadow-[0_10px_30px_rgba(0,0,0,0.03)]">
              <h2 className="text-xl font-bold mb-2 text-[#000100]">
                Analysis Failed
              </h2>
              <p className="text-slate-500 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* ─── STATE 1: Landing ─── */}
        {!isLoading && !error && !analysisData && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16 items-center animate-in fade-in slide-in-from-bottom-4 duration-300">
            {/* Left: Value Prop & CTA */}
            <div className="space-y-8">
              <h2 className="text-4xl md:text-5xl font-black text-[#000100] leading-[1.1]">
                Audit any profile <br />
                <span className="text-[#074ed5]">in seconds.</span>
              </h2>
              <p className="text-lg text-slate-500 font-medium leading-relaxed max-w-md">
                Stop guessing why you're not growing. Get a
                deep-dive audit of your content strategy, audience, and revenue funnels.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <button className="px-8 py-4 bg-[#074ed5] hover:bg-[#0041CC] text-white rounded-2xl font-bold flex items-center justify-center gap-3 transition-all shadow-[0_4px_14px_0_rgba(7,78,213,0.39)] hover:scale-[1.02] active:scale-[0.98]">
                  <FaChrome size={20} />
                  Download Extension
                </button>
                <button className="px-8 py-4 bg-white text-[#000100] border border-slate-200 hover:bg-slate-50 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all">
                  Watch Demo <FaArrowRight size={12} />
                </button>
                <button
                  onClick={openHistory}
                  className="px-8 py-4 bg-white text-[#000100] border border-slate-200 hover:bg-slate-50 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all"
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
                  Join <span className="text-[#000100]">5,000+ marketers</span>{" "}
                  using ReachPilot.
                </p>
              </div>
            </div>

            {/* Right: Visual Steps */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-[#074ed5]/10 to-[#caee55]/10 rounded-[40px] blur-3xl animate-pulse" />
              <div className="relative bg-white rounded-3xl border border-slate-100 p-8 shadow-[0_4px_24px_rgba(0,0,0,0.05)]">
                <h3 className="text-lg font-bold text-[#000100] mb-6 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#074ed5]" /> How
                  it works
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
                      <div className="w-10 h-10 rounded-xl bg-[#f4f8fb] text-slate-400 font-bold text-xs flex items-center justify-center border border-slate-100 group-hover:bg-[#074ed5]/10 group-hover:text-[#074ed5] group-hover:border-[#074ed5]/20 transition-colors shrink-0">
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
        )}

        {/* ─── STATE 2: Analysis Dashboard ─── */}
        {analysisData && (
          <div className="flex flex-col gap-6 animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-slate-200">
              <div>
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                  <span>Analyzed Accounts</span>
                  <FaChevronRight size={8} />
                  <span className="text-[#0052FF]">
                    {analysisData.postData.handle}
                  </span>
                  <FaChevronRight size={8} />
                  <span>Post Analysis</span>
                </div>
                <h1 className="text-3xl font-black text-[#1A1D23] leading-tight">
                  Post Vital Signs
                </h1>
                <p className="text-sm text-slate-500 font-medium mt-1">
                  Scanned {analysisData.postData.metrics.views.toLocaleString()}{" "}
                  views •{" "}
                  {new Date(
                    analysisData.postData.postedAt,
                  ).toLocaleDateString()}{" "}
                  •{" "}
                  <span className="text-[#4D8C00] font-bold">
                    {
                      analysisData.analysis.viralVelocity.velocityData
                        .growthPrediction
                    }
                  </span>
                </p>
              </div>

              <div className="flex gap-3 shrink-0">
                <button
                  onClick={openHistory}
                  className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors flex items-center gap-2 shadow-sm"
                >
                  <FaHistory /> History
                </button>
                <button className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors flex items-center gap-2 shadow-sm">
                  <FaSearch /> Find Similar
                </button>
                <button className="p-2 bg-white text-slate-500 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm">
                  <FaShare />
                </button>
              </div>
            </div>

            {/* Post Preview (horizontal card above grid) */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-[0_10px_30px_rgba(0,0,0,0.03)] overflow-hidden">
              <div className="p-5 flex flex-col md:flex-row gap-5 items-start">
                {/* Author */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-yellow-400 to-pink-500 p-[2px]">
                    {analysisData.postData.authorPfp ? (
                      <img
                        src={analysisData.postData.authorPfp}
                        alt={analysisData.postData.author}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-slate-500 overflow-hidden text-xs font-bold">
                        {analysisData.postData.author
                          .substring(0, 2)
                          .toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-[#1A1D23] text-sm leading-tight">
                      {analysisData.postData.author}
                    </h4>
                    <p className="text-[11px] text-slate-400 font-medium">
                      {analysisData.postData.handle}
                    </p>
                  </div>
                </div>

                {/* Vertical divider */}
                <div className="hidden md:block w-px bg-slate-100 self-stretch" />

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-700 leading-relaxed font-medium whitespace-pre-wrap">
                    {analysisData.postData.content}
                  </p>
                </div>

                {/* Metrics */}
                <div className="flex md:flex-col gap-6 md:gap-3 shrink-0 text-right">
                  <div>
                    <p className="text-xl font-bold text-[#1A1D23]">
                      {analysisData.postData.metrics.likes.toLocaleString()}
                    </p>
                    <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
                      Likes
                    </p>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-[#1A1D23]">
                      {(
                        analysisData.postData.commentCount ||
                        analysisData.postData.metrics.replies
                      ).toLocaleString()}
                    </p>
                    <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
                      Comments
                    </p>
                  </div>
                </div>
              </div>
              {analysisData.postData.images &&
                analysisData.postData.images.length > 0 && (
                  <div className="px-5 pb-5 grid grid-cols-2 gap-3">
                    {analysisData.postData.images.map(
                      (img: string, i: number) => (
                        <img
                          key={i}
                          src={img}
                          alt="Post Content"
                          className="rounded-2xl border border-slate-100 max-h-48 object-cover w-full"
                        />
                      ),
                    )}
                  </div>
                )}
            </div>

            {/* ─── BENTO GRID ─── */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-start">
              {/* Row 1: Performance metrics (3 equal cols) */}
              <div className="h-full">
                <ViralVelocity {...analysisData.analysis.viralVelocity} />
              </div>
              <div className="h-full">
                <SentimentVibe {...analysisData.analysis.sentiment} />
              </div>
              <div className="h-full">
                <CompetitorBenchmarking {...analysisData.analysis.competitor} />
              </div>

              {/* Row 2: Hook CTA (hero, spans 2 cols) + Visual Strategy */}
              <div className="md:col-span-2 xl:col-span-2 h-full">
                <HookCTAScorecard
                  {...analysisData.analysis.hookCTA}
                  analysisId={analysisData.id}
                  postContent={analysisData.postData.content}
                />
              </div>
              <div className="h-full">
                <VisualStrategyDecoder
                  {...analysisData.analysis.visualStrategy}
                  analysisId={analysisData.id}
                  images={analysisData.postData.images}
                />
              </div>

              {/* Row 3: Retention + Lead Persona + Comment Gap */}
              <div className="h-full">
                <RetentionHook {...analysisData.analysis.retention} />
              </div>
              <div className="h-full">
                <LeadPersonaID {...analysisData.analysis.leadPersona} />
              </div>
              <div className="h-full">
                <CommentGapDiscovery {...analysisData.analysis.commentGap} analysisId={analysisData.id} />
              </div>
            </div>
          </div>
        )}
      </div>

      {isHistoryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-[#0F172A]/40 backdrop-blur-sm" onClick={() => setIsHistoryOpen(false)} />
          <div className="relative w-full max-w-3xl max-h-[85vh] bg-white/95 backdrop-blur-xl rounded-[32px] shadow-[0_40px_100px_rgba(15,23,42,0.15)] border border-white flex flex-col overflow-hidden">
            <div className="px-8 py-5 border-b border-[#E2E8F0]/60 flex items-center justify-between bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(238,243,255,0.76))]">
              <div>
                <h3 className="text-lg font-black text-[#1A1D23]">Post Analysis History</h3>
                <p className="text-xs text-[#64748B] font-medium mt-0.5">Review your previous post audits.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsHistoryOpen(false)}
                className="p-2 rounded-full text-[#64748B] hover:text-red-500 hover:bg-red-50 transition-colors"
              >
                <FaArrowRight className="rotate-45" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
              {isHistoryLoading ? (
                <div className="py-12 flex flex-col items-center justify-center text-center">
                  <FaSpinner className="w-6 h-6 text-[#0052FF] animate-spin mb-3" />
                  <p className="text-sm font-semibold text-[#64748B]">Loading history...</p>
                </div>
              ) : historyItems.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center text-center">
                  <FaHistory className="w-12 h-12 text-[#CBD5E1] mb-3" />
                  <p className="text-[#1A1D23] font-bold">No saved analyses yet</p>
                  <p className="text-sm text-[#64748B] mt-1">Your post audits will appear here.</p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {historyItems.map((item) => {
                    const createdLabel = new Date(item.timestamp).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    });

                    return (
                      <div
                        key={item.id}
                        className="group relative flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-2xl border transition-all border-[#E2E8F0] bg-white hover:border-[#0052FF]/30 hover:shadow-md hover:bg-[#F8FAFD]"
                      >
                        <div className="flex-1 min-w-0 cursor-pointer" onClick={() => openHistoryItem(item)}>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[11px] font-semibold text-[#94A3B8] ml-auto shrink-0">{createdLabel}</span>
                          </div>
                          <h4 className="text-sm font-black text-[#1A1D23] truncate mb-1 pr-8">{item.postAuthor}</h4>
                          <p className="text-xs text-[#64748B] truncate mb-2">{item.postHandle}</p>
                          <div className="flex flex-wrap gap-1">
                            <span className="text-[10px] font-bold text-[#0052FF] bg-[#0052FF]/10 px-2 py-0.5 rounded-md">
                              Score: {item.score}
                            </span>
                            {item.summary && (
                              <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                                {item.summary}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex sm:flex-col items-center gap-2 self-end sm:self-center shrink-0">
                          <button
                            type="button"
                            onClick={() => openHistoryItem(item)}
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
    </div>
  );
}
