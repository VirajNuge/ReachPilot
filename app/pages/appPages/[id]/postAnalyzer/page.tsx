"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaChrome, FaArrowRight, FaSearch, FaMagic } from "react-icons/fa";
import MotionBackground from "../../components/Shared/MotionBackground";
import HookCTAScorecard from "../../components/PostAnalyzer/HookCTAScorecard";
import CommentGapDiscovery from "../../components/PostAnalyzer/CommentGapDiscovery";
import LeadPersonaID from "../../components/PostAnalyzer/LeadPersonaID";
import VisualStrategyDecoder from "../../components/PostAnalyzer/VisualStrategyDecoder";
import ViralVelocity from "../../components/PostAnalyzer/ViralVelocity";
import SentimentVibe from "../../components/PostAnalyzer/SentimentVibe";
import AIRemixEngine from "../../components/PostAnalyzer/AIRemixEngine";
import CompetitorBenchmarking from "../../components/PostAnalyzer/CompetitorBenchmarking";

export default function PostAnalyzerPage() {
  const [hasAnalysis, setHasAnalysis] = useState(false); // Toggle for demo purposes

  return (
    <div className="relative min-h-screen bg-[#F9F9FB] font-sans text-gray-900 overflow-x-hidden">
      <MotionBackground />

      <div className="relative z-10 p-4 md:p-8 max-w-7xl mx-auto pb-24">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex justify-between items-end"
        >
          {/* Dev Toggle - Remove in production */}
          <button
            onClick={() => setHasAnalysis(!hasAnalysis)}
            className="text-xs text-gray-300 hover:text-gray-500 transition-colors"
          >
            [Dev: Toggle View]
          </button>
        </motion.div>

        {!hasAnalysis ? (
          /* --- STATE 1: GUIDE / LANDING --- */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center mt-12"
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
                Don't guess what works. Use our browser extension to X-Ray top
                performing posts on LinkedIn, X, and Instagram.
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
                  {[1, 2, 3, 4].map((i) => (
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
                  Join <span className="text-gray-900">2,000+ creators</span>{" "}
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
                      title: "Browse & Hunt",
                      desc: "Go to any social platform. Find a viral post.",
                    },
                    {
                      step: "03",
                      title: "One-Click Scan",
                      desc: "Click the 'Analyze' button floating on the post.",
                    },
                    {
                      step: "04",
                      title: "Deep Insights",
                      desc: "See the Hook Score, Retention Logic, and CTA Breakdown right here.",
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
        ) : (
          /* --- STATE 2: ANALYSIS VIEW (REORGANIZED) --- */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6"
          >
            {/* ACTION BAR (Top) */}
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 bg-white p-4 rounded-2xl border border-gray-200 shadow-sm gap-4">
              <div>
                <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></span>
                  Analysis Complete
                </h2>
                <p className="text-xs text-gray-500 font-medium">
                  Scanned 124K followers • 2h ago
                </p>
              </div>
              <div className="flex gap-3">
                <button className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-50 transition-colors flex items-center gap-2 shadow-sm">
                  <FaSearch /> Find Similar
                </button>
                <button className="px-4 py-2 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-black transition-colors flex items-center gap-2 shadow-lg shadow-gray-200">
                  <FaMagic /> Generate Ideas
                </button>
                <button className="px-4 py-2 bg-violet-600 text-white rounded-xl text-xs font-bold hover:bg-violet-700 transition-colors flex items-center gap-2 shadow-lg shadow-violet-200">
                  Save Analysis
                </button>
              </div>
            </div>

            <div className="grid grid-cols-12 gap-6">
              {/* --- LEFT COLUMN: CONTENT FORENSICS (The "What") --- */}
              <div className="col-span-12 lg:col-span-4 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                    Content Forensics
                  </span>
                  <div className="h-px bg-gray-200 flex-1"></div>
                </div>

                {/* 1. Hook & CTA Scorecard */}
                <HookCTAScorecard />

                {/* 2. Visual Strategy */}
                <VisualStrategyDecoder />

                {/* 3. Sentiment Vibe */}
                <SentimentVibe />
              </div>

              {/* --- CENTER COLUMN: POST CONTEXT (The "Status") --- */}
              <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                    Target Post
                  </span>
                  <div className="h-px bg-gray-200 flex-1"></div>
                </div>

                {/* The Post Itself */}
                <div className="col-span-12 lg:col-span-4 flex flex-col items-center">
                  <div className="w-full max-w-[380px] bg-white rounded-xl border border-gray-200 shadow-xl overflow-hidden relative transform scale-95 origin-top">
                    {/* Floating 'Analyze' Action (Simulated Extension Overlay) */}
                    <div className="absolute top-4 right-4 z-20">
                      <div className="bg-gray-900 text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-2 animate-pulse">
                        <FaChrome /> Analysis Live
                      </div>
                    </div>

                    {/* Header */}
                    <div className="p-4 flex items-center gap-3 border-b border-gray-50">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-400 to-pink-500 p-[2px]">
                        <img
                          src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
                          alt="Profile"
                          className="w-full h-full rounded-full border-2 border-white bg-white"
                        />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm">
                          alex_hormozi_fan
                        </h4>
                        <p className="text-xs text-gray-400">
                          124K followers • 2h ago
                        </p>
                      </div>
                      <div className="ml-auto text-gray-300">•••</div>
                    </div>

                    {/* Content */}
                    <div className="p-4 pb-2">
                      <p className="text-sm text-gray-800 leading-relaxed mb-3">
                        <span className="font-bold">
                          Stop trying to build a 'Personal Brand'.
                        </span>{" "}
                        🛑
                        <br />
                        <br />
                        Build a reputation instead.
                        <br />
                        <br />
                        Brand is what you say about you. Reputation is what they
                        say about you when you leave the room.
                        <br />
                        <br />
                        1. Do hard things.
                        <br />
                        2. Keep promises.
                        <br />
                        3. Give away the secrets.
                        <br />
                        <br />
                        That's it. That's the strategy. 👇
                      </p>
                      <div className="text-blue-600 text-xs font-medium">
                        #marketing #branding #business
                      </div>
                    </div>

                    {/* Image Mockup */}
                    <div className="w-full h-[250px] bg-gray-100 flex items-center justify-center relative overflow-hidden group cursor-pointer">
                      <img
                        src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                        alt="Post Visual"
                        className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-md px-3 py-1 rounded-lg text-white text-[10px] font-bold">
                        ALT: Meeting Room
                      </div>
                    </div>

                    {/* Footer Stats */}
                    <div className="p-4 border-t border-gray-50 flex justify-between items-center text-sm text-gray-600">
                      <div className="flex gap-4 font-bold">
                        <span>❤️ 1,245</span>
                        <span>💬 342</span>
                        <span>🚀 890</span>
                      </div>
                      <div className="text-gray-400">Bookmark</div>
                    </div>
                  </div>
                </div>

                {/* Competitor Benchmarking (Moved to Center) */}
                <CompetitorBenchmarking />

                {/* Viral Velocity (Moved to Center) */}
                <ViralVelocity />
              </div>

              {/* --- RIGHT COLUMN: GROWTH & ACTION (The "Now What") --- */}
              <div className="col-span-12 lg:col-span-4 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                    Growth Opportunities
                  </span>
                  <div className="h-px bg-gray-200 flex-1"></div>
                </div>

                {/* 1. Lead Persona ID */}
                <LeadPersonaID />

                {/* 2. Comment Gap Discovery */}
                <CommentGapDiscovery />

                {/* 3. AI Remix Engine */}
                <div className="h-[340px]">
                  <AIRemixEngine />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
