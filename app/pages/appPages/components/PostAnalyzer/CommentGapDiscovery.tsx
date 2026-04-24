"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaComments,
  FaExclamationTriangle,
  FaCheckCircle,
  FaMagic,
  FaSpinner,
  FaCheck,
  FaCopy,
  FaTimes,
  FaBolt,
  FaReply,
} from "react-icons/fa";
import { CommentGapProps } from "@/lib/postAnalyzerTypes";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ReplyPost {
  title: string;
  hook: string;
  content: string;
  cta: string;
}

// ─── Copy Button ──────────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className={`relative overflow-hidden shrink-0 px-2.5 py-1.5 rounded-lg font-bold text-[10px] transition-all flex items-center justify-center min-w-[65px] active:scale-95 border ${
        copied
          ? "bg-[#B6FF33]/20 text-[#4D8C00] border-[#B6FF33]/50"
          : "bg-white text-slate-500 border-slate-200 hover:bg-[#0052FF] hover:text-white hover:border-[#0052FF]"
      }`}
      title="Copy to clipboard"
    >
      <AnimatePresence mode="wait">
        {copied ? (
          <motion.div
            key="check"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            className="flex items-center gap-1"
          >
            <FaCheck size={9} /> Copied
          </motion.div>
        ) : (
          <motion.div
            key="copy"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            className="flex items-center gap-1"
          >
            <FaCopy size={9} /> Copy
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
}

// ─── Reply Post Card ──────────────────────────────────────────────────────────

function ReplyPostCard({ post, index }: { post: ReplyPost; index: number }) {
  const dotColors = ["bg-[#B6FF33]", "bg-[#0052FF]", "bg-[#1A1D23]"];
  const labelColors = ["text-[#4D8C00]", "text-[#0052FF]", "text-slate-500"];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      {/* Card header */}
      <div className="px-4 pt-4 pb-3 flex items-center justify-between border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span
            className={`w-5 h-5 rounded-full ${dotColors[index]} flex items-center justify-center text-[#1A1D23] text-[9px] font-black`}
          >
            {index + 1}
          </span>
          <p className={`text-[11px] font-black uppercase tracking-widest ${labelColors[index]}`}>
            {post.title}
          </p>
        </div>
        <CopyButton text={post.content} />
      </div>

      <div className="p-4 space-y-3">
        {/* Hook line */}
        <div>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
            <FaBolt size={8} className="text-[#0052FF]" /> Hook
          </p>
          <p className="text-[12px] font-bold text-[#1A1D23] leading-snug">
            &ldquo;{post.hook}&rdquo;
          </p>
        </div>

        {/* Full content */}
        <div>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
            <FaReply size={8} className="text-slate-400" /> Full Post
          </p>
          <div className="bg-[#1A1D23] rounded-xl p-3">
            <p className="font-mono text-[11px] text-slate-300 leading-relaxed whitespace-pre-wrap">
              {post.content}
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="flex items-start gap-2 pt-1">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 shrink-0">
            CTA:
          </span>
          <p className="text-[11px] text-[#0052FF] font-semibold leading-snug">
            {post.cta}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Reply Posts Modal ────────────────────────────────────────────────────────

function ReplyPostsModal({
  posts,
  onClose,
}: {
  posts: ReplyPost[];
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 28 }}
        className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-xl overflow-hidden max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 flex items-start justify-between sticky top-0 bg-white border-b border-slate-100 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#B6FF33] flex items-center justify-center shrink-0">
              <FaReply className="text-[#1A1D23]" size={15} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Generated Reply Posts
              </p>
              <h3 className="text-lg font-black text-[#1A1D23] leading-tight">
                3 Ready-to-Post Options
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <FaTimes size={14} />
          </button>
        </div>

        <div className="px-6 pb-6 pt-4 space-y-4">
          <p className="text-[12px] text-slate-500 font-medium leading-snug">
            Each post addresses a different comment gap from the original. Copy
            the one that fits your next post.
          </p>
          {posts.map((post, i) => (
            <ReplyPostCard key={i} post={post} index={i} />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CommentGapDiscovery({
  gapData,
  confusionPoint,
  analysisId,
}: CommentGapProps) {
  const [genStatus, setGenStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [replyPosts, setReplyPosts] = useState<ReplyPost[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleGenerate = async () => {
    if (genStatus === "loading" || !analysisId) return;
    setGenStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/analyze-post/generate-reply-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ analysisId }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed to generate reply posts");
      setReplyPosts(data.posts);
      setGenStatus("success");
      setShowModal(true);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "An unexpected error occurred");
      setGenStatus("error");
    }
  };

  return (
    <>
      <AnimatePresence>
        {showModal && replyPosts.length > 0 && (
          <ReplyPostsModal posts={replyPosts} onClose={() => setShowModal(false)} />
        )}
      </AnimatePresence>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-[0_10px_30px_rgba(0,0,0,0.03)] overflow-hidden flex flex-col h-full">
        {/* ── Header ── */}
        <div className="px-5 pt-5 pb-4 flex justify-between items-start">
          <div className="flex-1">
            <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest mb-1">
              Content Opportunities
            </p>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-[#1A1D23] leading-none">
                Comment Gap
              </h3>
              <span className="text-[11px] font-semibold bg-slate-100 text-slate-500 px-3 py-1 rounded-xl flex items-center gap-1">
                <FaCheckCircle className="text-[#0052FF]" size={10} />{" "}
                {gapData.length} Found
              </span>
            </div>
          </div>

          <div className="p-2.5 bg-[#0052FF] text-white rounded-xl shrink-0 cursor-help relative group">
            <FaComments size={16} />
            {/* Tooltip */}
            <div className="absolute right-0 top-full mt-2 w-64 p-3 bg-[#1A1D23] text-white text-xs rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none">
              <div className="font-bold mb-1 text-[#0052FF]">
                Why this matters:
              </div>
              Identify user questions and complaints in the comments to create
              high-value problem-solving content.
              <div className="absolute right-4 -top-1 w-2 h-2 bg-[#1A1D23] transform rotate-45"></div>
            </div>
          </div>
        </div>

        <div className="px-5 pb-5 space-y-6 flex-1 flex flex-col">
          {/* ── Top Gap Metric ── */}
          {gapData.length > 0 && (
            <div className="flex items-end justify-between">
              <div className="w-full">
                <div className="flex justify-between items-end mb-2">
                  <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest">
                    Top Requested Topic
                  </p>
                  <span className="text-xl font-bold text-[#1A1D23]">
                    {gapData[0].frequency} Mentions
                  </span>
                </div>

                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex">
                  <div
                    className="bg-[#B6FF33] h-full w-[65%]"
                    title="High Demand"
                  />
                  <div className="bg-[#0052FF] h-full w-[20%]" />
                  <div className="bg-slate-300 h-full w-[15%]" />
                </div>

                <div className="mt-3">
                  <div className="text-[14px] font-bold text-[#1A1D23] flex flex-wrap gap-2 items-center mb-1">
                    {gapData[0].gap}
                    <span className="w-2 h-2 rounded-full bg-[#B6FF33] inline-block ml-1"></span>
                  </div>
                  <div className="text-[13px] text-slate-500 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="font-semibold text-slate-600">
                      Playbook:
                    </span>{" "}
                    {gapData[0].strategy}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── All Opportunities ── */}
          <div className="pt-2">
            <span className="text-[10px] font-medium text-slate-500 uppercase tracking-widest mb-3 block">
              Opportunity Breakdown
            </span>
            <div className="flex flex-col gap-3">
              {gapData.slice(1).map((item, index) => (
                <div
                  key={index}
                  className="bg-white border text-left border-slate-200 p-3.5 rounded-2xl flex flex-col gap-1.5 shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div className="font-bold text-[#1A1D23] text-[13px] leading-tight flex-1 pr-3">
                      {item.gap}
                    </div>
                    <span className="text-[10px] font-semibold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-lg shrink-0">
                      {item.frequency}x
                    </span>
                  </div>
                  <div className="text-[12px] text-slate-500 leading-relaxed">
                    <span className="font-semibold text-slate-600">
                      Strategy:
                    </span>{" "}
                    {item.strategy}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Friction Finder ── */}
          <div className="mt-auto pt-4">
            <div className="bg-[#1A1D23] text-white px-4 py-3 rounded-2xl flex items-start gap-3">
              <div className="mt-0.5">
                <FaExclamationTriangle className="text-[#B6FF33]" size={14} />
              </div>
              <div>
                <p className="text-[13px] font-bold mb-0.5 text-white">
                  Confusion Alert: {confusionPoint.text}
                </p>
                <p className="text-[12px] text-slate-400 leading-snug">
                  {confusionPoint.insight}
                </p>
              </div>
            </div>
          </div>

          {/* ── Action Button ── */}
          <div className="pt-2 border-t border-slate-100">
            {genStatus === "success" && replyPosts.length > 0 ? (
              <button
                onClick={() => setShowModal(true)}
                className="w-full py-3 bg-[#F2FFD9] text-[#4D8C00] border border-[#C5E88A] rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#E8FAC8] transition-colors"
              >
                <FaCheck size={12} /> Posts Generated — View
              </button>
            ) : (
              <button
                onClick={handleGenerate}
                disabled={genStatus === "loading" || !analysisId}
                className={`w-full py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                  genStatus === "loading"
                    ? "bg-[#000100]/70 text-white cursor-not-allowed"
                    : !analysisId
                    ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                    : "bg-[#000100] hover:bg-black text-white hover:scale-[1.01] active:scale-[0.99]"
                }`}
              >
                {genStatus === "loading" ? (
                  <><FaSpinner className="animate-spin" size={13} /> Generating Posts…</>
                ) : (
                  <><FaMagic size={13} /> Generate &ldquo;Reply Post&rdquo; Content</>
                )}
              </button>
            )}

            {genStatus === "error" && errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 flex items-start gap-2 p-2.5 bg-red-50 rounded-xl border border-red-200"
              >
                <FaExclamationTriangle className="text-red-500 shrink-0 mt-0.5" size={11} />
                <p className="text-[11px] text-red-600 font-medium leading-snug">{errorMsg}</p>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
