"use client";

import React, { useEffect, useState } from "react";
import {
  getHistory,
  clearHistory,
  AnalysisSession,
  fetchAnalysisHistory,
} from "../../../../lib/storage";
import { useAuth } from "../../../contexts/AuthContext";
import { FaHistory, FaTrash, FaArrowRight, FaChartLine } from "react-icons/fa";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function HistoryPage() {
  const { user } = useAuth();
  const [history, setHistory] = useState<AnalysisSession[]>([]);
  const [accountId, setAccountId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [comparing, setComparing] = useState(false);
  const [comparisonResult, setComparisonResult] = useState<any | null>(null);

  useEffect(() => {
    const loadHistory = async () => {
      if (user?.id) {
        try {
          // Try to find an account and fetch server-backed history for it
          const accountsRes = await fetch("/api/accounts");
          if (accountsRes.ok) {
            const accountsJson = await accountsRes.json();
            const accountId = accountsJson?.accounts?.[0]?._id;
            if (accountId) setAccountId(accountId);
            if (accountId) {
              const server = await fetchAnalysisHistory(accountId, { limit: 50 });
              const mapped: AnalysisSession[] = (server.analyses || []).map((a: any) => ({
                id: a.id,
                timestamp: a.createdAt,
                profileHandle: a.profileHandle,
                profileName: a.profileName,
                score: a.overallScore,
                data: a.analysisData,
              }));
              setHistory(mapped);
              return;
            }
          }
        } catch (e) {
          console.warn("Failed to load server history, falling back to local:", e);
        }
      }

      const h = await getHistory(user?.id);
      setHistory(h);
    };
    loadHistory();
  }, [user]);

  const handleClear = () => {
    if (confirm("Are you sure you want to clear all history?")) {
      clearHistory(user?.id);
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
          <div className="flex items-center gap-3">
            {history.length > 0 && (
              <>
                <button
                  onClick={async () => {
                    if (!accountId) {
                      alert("No account selected for export");
                      return;
                    }
                    try {
                      const res = await fetch("/api/analyze/export", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ accountId, format: "csv" }),
                      });
                      if (!res.ok) throw new Error("Export failed");
                      const blob = await res.blob();
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `analysis_history_${accountId}.csv`;
                      document.body.appendChild(a);
                      a.click();
                      a.remove();
                      URL.revokeObjectURL(url);
                    } catch (e) {
                      console.error(e);
                      alert("Export failed");
                    }
                  }}
                  className="text-sm font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-indigo-50 transition-colors"
                >
                  <FaChartLine size={12} /> Export CSV
                </button>

                <button
                  onClick={() => {
                    if (selectedIds.length !== 2) {
                      alert("Select exactly two analyses to compare");
                      return;
                    }
                    (async () => {
                      setComparing(true);
                      try {
                        const res = await fetch("/api/analyze/compare-history", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ baselineId: selectedIds[0], currentId: selectedIds[1] }),
                        });
                        const json = await res.json();
                        if (!res.ok) throw new Error(json.error || "Compare failed");
                        setComparisonResult(json.comparison);
                      } catch (e) {
                        console.error(e);
                        alert("Comparison failed");
                      } finally {
                        setComparing(false);
                      }
                    })();
                  }}
                  className="text-sm font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-indigo-50 transition-colors"
                >
                  Compare Selected
                </button>
              </>
            )}

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
      </div>
      {/* Comparison modal */}
      {comparisonResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => { setComparisonResult(null); setSelectedIds([]); }} />
          <div className="relative bg-white rounded-2xl p-6 w-11/12 max-w-2xl z-60">
            <h3 className="text-lg font-bold mb-2">Analysis Comparison</h3>
            <p className="text-sm text-gray-600 mb-4">Score delta: {comparisonResult.scoreDelta}</p>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <h4 className="font-semibold">Added Strengths</h4>
                <ul className="list-disc ml-5">
                  {(comparisonResult.addedStrengths || []).map((s: string, i: number) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold">Removed Strengths</h4>
                <ul className="list-disc ml-5">
                  {(comparisonResult.removedStrengths || []).map((s: string, i: number) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <h4 className="font-semibold">Added Weaknesses</h4>
                <ul className="list-disc ml-5">
                  {(comparisonResult.addedWeaknesses || []).map((s: string, i: number) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold">Removed Weaknesses</h4>
                <ul className="list-disc ml-5">
                  {(comparisonResult.removedWeaknesses || []).map((s: string, i: number) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button className="px-4 py-2 bg-gray-100 rounded-lg" onClick={() => { setComparisonResult(null); setSelectedIds([]); }}>Close</button>
            </div>
          </div>
        </div>
      )}

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
                  <div className="absolute ml-4 mt-4 z-20">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(session.id)}
                      onChange={(e) => {
                        setSelectedIds((prev) => {
                          if (e.target.checked) return [...prev, session.id].slice(-2); // keep last two if user selects more
                          return prev.filter((id) => id !== session.id);
                        });
                      }}
                    />
                  </div>
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
