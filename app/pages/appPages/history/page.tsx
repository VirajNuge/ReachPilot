"use client";

import React, { useEffect, useState } from "react";
import {
  getHistory,
  clearHistory,
  AnalysisSession,
} from "../../../../lib/storage";
import { FaHistory, FaTrash, FaArrowRight, FaChartLine } from "react-icons/fa";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function HistoryPage() {
  const [history, setHistory] = useState<AnalysisSession[]>([]);

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  const handleClear = () => {
    if (confirm("Are you sure you want to clear all history?")) {
      clearHistory();
      setHistory([]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
              <FaHistory />
            </div>
            <h1 className="text-xl font-bold tracking-tight">
              Analysis History
            </h1>
          </div>
          {history.length > 0 && (
            <button
              onClick={handleClear}
              className="text-sm font-bold text-red-500 hover:text-red-700 flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors"
            >
              <FaTrash size={12} /> Clear History
            </button>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10">
        {history.length === 0 ? (
          <div className="text-center py-20 opacity-50">
            <div className="text-6xl mb-4">📂</div>
            <h2 className="text-2xl font-bold text-gray-400 mb-2">
              No History Found
            </h2>
            <p className="text-gray-500">Run an analysis to see it here.</p>
            <Link
              href="/pages/appPages"
              className="mt-6 inline-block px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors"
            >
              Start New Analysis
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {history.map((session) => (
                <motion.div
                  key={session.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">
                        {session.profileName}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {new Date(session.timestamp).toLocaleDateString()}{" "}
                        <span className="opacity-50">•</span>{" "}
                        {new Date(session.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <div className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold border border-indigo-100">
                      Score: {session.score}
                    </div>
                  </div>

                  <div className="h-px bg-gray-50 mb-4"></div>

                  <div className="flex justify-between items-center">
                    <div className="flex -space-x-2">
                      {/* Avatar placeholder or small icons */}
                      <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-xs text-gray-400">
                        👤
                      </div>
                    </div>
                    <Link
                      href={`/pages/appPages/${session.id}/profileAnalyzer/analyzed-account?loadId=${session.id}`}
                      className="flex items-center gap-2 text-sm font-bold text-indigo-600 group-hover:gap-3 transition-all"
                    >
                      View Report <FaArrowRight />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
