"use client";

import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { FaChrome, FaArrowRight, FaSearch } from "react-icons/fa";
import MotionBackground from "../../components/Shared/MotionBackground";
import AnalyzedAccountPage from "./analyzed-account/page";

export default function UnifiedAnalyzerPage() {
  const searchParams = useSearchParams();
  const isFromExtension = searchParams.get("source") === "extension";

  // Auto-show dashboard when coming from extension, otherwise use toggle
  const [hasAnalysis, setHasAnalysis] = useState(isFromExtension);

  return (
    <div className="relative min-h-screen bg-[#F9F9FB] font-sans text-gray-900 overflow-x-hidden">
      <MotionBackground />

      <div className="relative z-10 pl-4 max-w-7xl mx-auto pb-24">
        {/* Header Section */}

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
                Audit any profile <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600">
                  in seconds.
                </span>
              </h2>
              <p className="text-lg text-gray-500 font-medium leading-relaxed max-w-md">
                Stop guessing why you're not growing. Get a deep-dive audit of
                your content strategy, audience, and revenue funnels.
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
                  Join <span className="text-gray-900">5,000+ marketers</span>{" "}
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
          /* --- STATE 2: ANALYSIS DASHBOARD --- */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4"
          >
            <AnalyzedAccountPage />
          </motion.div>
        )}
      </div>
    </div>
  );
}
