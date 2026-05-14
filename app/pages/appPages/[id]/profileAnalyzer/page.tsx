"use client";

import React, { useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { FaChrome, FaArrowRight, FaSearch } from "react-icons/fa";
import AnalyzedAccountPage from "./analyzed-account/page";

export default function UnifiedAnalyzerPage() {
  const searchParams = useSearchParams();
  const isFromExtension = searchParams.get("source") === "extension";

  // Auto-show dashboard when coming from extension, otherwise use toggle
  const [hasAnalysis, setHasAnalysis] = useState(isFromExtension);

  const formAreaRef = useRef<HTMLDivElement>(null);
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!formAreaRef.current) return;
    const rect = formAreaRef.current.getBoundingClientRect();
    formAreaRef.current.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
    formAreaRef.current.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
  };

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
      <div className={`bg-white rounded-3xl shadow-[0_20px_60px_rgba(0,10,50,0.05)] border border-white/50 flex flex-col relative z-10 p-8 md:p-12 ${hasAnalysis ? 'w-full max-w-7xl min-h-[750px]' : 'w-full max-w-[1000px] h-fit'}`}>
        {/* Header Section */}

        {!hasAnalysis ? (
          /* --- STATE 1: GUIDE / LANDING --- */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16 items-center"
          >
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
