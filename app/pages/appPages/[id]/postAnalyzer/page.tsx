"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  FaChrome,
  FaArrowRight,
  FaSearch,
  FaMagic,
  FaShare,
  FaChevronRight,
  FaSpinner,
} from "react-icons/fa";
import MotionBackground from "../../components/Shared/MotionBackground";
import HookCTAScorecard from "../../components/PostAnalyzer/HookCTAScorecard";
import CommentGapDiscovery from "../../components/PostAnalyzer/CommentGapDiscovery";
import LeadPersonaID from "../../components/PostAnalyzer/LeadPersonaID";
import VisualStrategyDecoder from "../../components/PostAnalyzer/VisualStrategyDecoder";
import ViralVelocity from "../../components/PostAnalyzer/ViralVelocity";
import SentimentVibe from "../../components/PostAnalyzer/SentimentVibe";
import AIRemixEngine from "../../components/PostAnalyzer/AIRemixEngine";
import CompetitorBenchmarking from "../../components/PostAnalyzer/CompetitorBenchmarking";
import RetentionHook from "../../components/PostAnalyzer/RetentionHook";

export default function PostAnalyzerPage() {
  const params = useParams();
  const id = params?.id as string;

  const [analysisData, setAnalysisData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchAnalysis = async () => {
      try {
        const res = await fetch(`/api/analyze-post/${id}`);
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
  }, [id]);

  return (
    <div className="relative min-h-screen bg-[#F9F9FB] font-sans text-gray-900 overflow-x-hidden">
      <MotionBackground />

      <div className="relative z-10 px-4 py-6 md:px-8 max-w-[1600px] mx-auto pb-24">
        {isLoading && (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <FaSpinner className="animate-spin text-4xl text-violet-600 mb-4" />
            <h2 className="text-xl font-bold text-gray-800">
              Analyzing Post DNA...
            </h2>
            <p className="text-gray-500 text-sm mt-2">
              Extracting hooks, retention metrics, and audience sentiment.
            </p>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-100 max-w-md text-center">
              <h2 className="text-xl font-bold mb-2">Analysis Failed</h2>
              <p>{error}</p>
            </div>
          </div>
        )}

        {!isLoading && !error && !analysisData && (
          /* --- STATE 1: GUIDE / LANDING (MATCH PROFILE ANALYZER STYLE) --- */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center mt-12 max-w-7xl mx-auto"
          >
            {/* Left: Value Prop & CTA */}
            <div className="space-y-8">
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 leading-[1.1]">
                Analyze any post <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600">
                  in one click.
                </span>
              </h2>
              <p className="text-lg text-gray-500 font-medium leading-relaxed max-w-md">
                Stop guessing why your posts aren't going viral. Get a deep-dive
                audit of hooks, visuals, and retention.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <button className="px-8 py-4 bg-gray-900 hover:bg-black text-white rounded-2xl font-bold flex items-center justify-center gap-3 transition-all shadow-xl shadow-gray-900/20 hover:scale-[1.02] active:scale-[0.98]">
                  <FaChrome size={20} />
                  Download Extension
                </button>
                <button className="px-8 py-4 bg-white text-gray-900 border border-gray-200 hover:bg-gray-50 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all">
                  Watch Demo <FaArrowRight size={12} />
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
                <p className="text-sm font-bold text-gray-500">
                  Join <span className="text-gray-900">5,000+ creators</span>{" "}
                  using ReachPilot.
                </p>
              </div>
            </div>

            {/* Right: Visual Steps */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-violet-500/10 to-indigo-500/10 rounded-[40px] blur-3xl" />
              <div className="relative bg-white/60 backdrop-blur-xl border border-white/50 rounded-[32px] p-8 shadow-2xl shadow-indigo-500/10">
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-violet-500" /> How it
                  works
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
                      title: "Visit Post",
                      desc: "Go to any LinkedIn or X post you want to reverse-engineer.",
                    },
                    {
                      step: "03",
                      title: "One-Click Scan",
                      desc: "Open the extension and click 'Analyze Post'.",
                    },
                    {
                      step: "04",
                      title: "Viral Breakdown",
                      desc: "Get a forensic breakdown of the hook, structure, and quality.",
                    },
                  ].map((item, i) => (
                    <div key={i} className="flex gap-4 group">
                      <div className="w-10 h-10 rounded-xl bg-gray-50 text-gray-300 font-bold flex items-center justify-center border border-gray-100 group-hover:bg-violet-50 group-hover:text-violet-600 group-hover:border-violet-100 transition-colors">
                        {item.step}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm group-hover:text-violet-700 transition-colors">
                          {item.title}
                        </h4>
                        <p className="text-sm text-gray-500 leading-snug">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
        {analysisData && (
          /* --- STATE 2: ANALYSIS DASHBOARD (CONTROL CENTER LAYOUT) --- */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col gap-6"
          >
            {/* ─── 1. BREADCRUMBS & HEADER ─── */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-gray-200 pb-6">
              <div>
                <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                  <span>Analyzed Accounts</span>
                  <FaChevronRight size={8} />
                  <span className="text-violet-600">
                    {analysisData.postData.handle}
                  </span>
                  <FaChevronRight size={8} />
                  <span>Post Analysis</span>
                </div>
                <h1 className="text-3xl font-black text-gray-900 leading-tight">
                  Post Vital Signs
                </h1>
                <p className="text-sm text-gray-500 font-medium mt-1">
                  Scanned {analysisData.postData.metrics.views.toLocaleString()}{" "}
                  views •{" "}
                  {new Date(
                    analysisData.postData.postedAt,
                  ).toLocaleDateString()}{" "}
                  •{" "}
                  <span className="text-emerald-600">High Viral Potential</span>
                </p>
              </div>

              <div className="flex gap-3">
                <button className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-50 transition-colors flex items-center gap-2 shadow-sm">
                  <FaSearch /> Find Similar
                </button>
                <button className="px-4 py-2 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-black transition-colors flex items-center gap-2 shadow-lg shadow-gray-200">
                  <FaMagic /> Generate Ideas
                </button>
                <button className="p-2 bg-violet-50 text-violet-600 rounded-xl hover:bg-violet-100 transition-colors">
                  <FaShare />
                </button>
              </div>
            </div>

            {/* ─── 2. MAIN GRID LAYOUT ─── */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* === LEFT COLUMN: THE PATIENT & VITALS (STICKY) === */}
              <div className="lg:col-span-4 xl:col-span-3 space-y-6 lg:sticky lg:top-6 h-fit">
                {/* A. TARGET POST PREVIEW */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden relative transform transition-transform hover:scale-[1.01] duration-300">
                  {/* Floating Label */}
                  <div className="absolute top-3 right-3 z-20">
                    <div className="bg-black/80 backdrop-blur text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-lg flex items-center gap-2">
                      <FaChrome size={10} /> Source
                    </div>
                  </div>

                  {/* Header */}
                  <div className="p-4 flex items-center gap-3 border-b border-gray-50 bg-gray-50/30">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-400 to-pink-500 p-[2px]">
                      <div className="w-full h-full rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-gray-500 overflow-hidden text-xs font-bold">
                        {analysisData.postData.author
                          .substring(0, 2)
                          .toUpperCase()}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm leading-tight">
                        {analysisData.postData.author}
                      </h4>
                      <p className="text-[10px] text-gray-400 font-medium">
                        {analysisData.postData.handle}
                      </p>
                    </div>
                    <div className="ml-auto text-gray-300 text-xs">•••</div>
                  </div>

                  {/* Post Content */}
                  <div className="p-4 bg-white">
                    <p className="text-sm text-gray-800 leading-relaxed font-medium whitespace-pre-wrap">
                      {analysisData.postData.content}
                    </p>
                    {analysisData.postData.images &&
                      analysisData.postData.images.length > 0 && (
                        <div className="mt-3 grid grid-cols-1 gap-2">
                          {analysisData.postData.images.map((img, i) => (
                            <img
                              key={i}
                              src={img}
                              alt="Post Content"
                              className="rounded-xl border border-gray-100 max-h-64 object-cover w-full"
                            />
                          ))}
                        </div>
                      )}
                  </div>

                  {/* Metrics Footer */}
                  <div className="p-3 border-t border-gray-50 bg-gray-50/50 flex justify-between text-xs text-gray-500 font-bold">
                    <span>
                      {analysisData.postData.metrics.likes.toLocaleString()}{" "}
                      Likes
                    </span>
                    <span>
                      {analysisData.postData.commentCount?.toLocaleString() ||
                        analysisData.postData.metrics.replies.toLocaleString()}{" "}
                      Comments
                    </span>
                  </div>
                </div>

                {/* B. VITAL SIGNS (Small Cards) */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                      Vital Signs
                    </span>
                  </div>

                  <ViralVelocity {...analysisData.analysis.viralVelocity} />
                  <SentimentVibe {...analysisData.analysis.sentiment} />
                  <CompetitorBenchmarking
                    {...analysisData.analysis.competitor}
                  />
                </div>
              </div>

              {/* === RIGHT COLUMN: THE DIAGNOSIS & CURE (MAIN FEED) === */}
              <div className="lg:col-span-8 xl:col-span-9 space-y-8">
                {/* SECTION 1: THE HOOK (Priority) */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                      Phase 1: Attraction
                    </span>
                    <div className="h-px bg-gray-200 flex-1"></div>
                  </div>
                  <HookCTAScorecard {...analysisData.analysis.hookCTA} />
                </div>

                {/* SECTION 2: RETENTION & VISUALS (Grid) */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                      Phase 2: Retention
                    </span>
                    <div className="h-px bg-gray-200 flex-1"></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <RetentionHook {...analysisData.analysis.retention} />
                    <VisualStrategyDecoder
                      {...analysisData.analysis.visualStrategy}
                    />
                  </div>
                </div>

                {/* SECTION 3: REMIX ENGINE (Full Width) */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                      Phase 3: Viral Remix
                    </span>
                    <div className="h-px bg-gray-200 flex-1"></div>
                  </div>
                  <div className="h-[500px]">
                    {" "}
                    {/* Fixed height for editor */}
                    <AIRemixEngine />
                  </div>
                </div>

                {/* SECTION 4: OPPORTUNITIES (Grid) */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                      Phase 4: Growth Gaps
                    </span>
                    <div className="h-px bg-gray-200 flex-1"></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <LeadPersonaID {...analysisData.analysis.leadPersona} />
                    <CommentGapDiscovery
                      {...analysisData.analysis.commentGap}
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
