"use client";

import React, { useState } from "react";
import { createPortal } from "react-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  FaBullseye,
  FaLightbulb,
  FaRocket,
  FaGem,
  FaCrosshairs,
  FaShieldAlt,
  FaExclamationTriangle,
  FaCalendarAlt,
  FaBolt,
  FaStar,
} from "react-icons/fa";
import { BsGraphUpArrow } from "react-icons/bs";
import { motion, AnimatePresence } from "framer-motion";
import { IoMdClose } from "react-icons/io";

// --- Types ---
export interface GapMetric {
  category: string;
  profileValue: number; // %
  benchmarkValue: number; // %
  gapType: "Opportunity" | "Over-indexed" | "On Par";
}

export interface GapData {
  metrics: GapMetric[];
  topOpportunity: string;
  insight: string;
  recommendations: string[];
}

interface CompetitorGapProps {
  data?: GapData;
}

type ModalState = "closed" | "loading" | "results" | "error";

// --- AI Result Types (mirrors API response) ---
interface UpgradedHook {
  trigger: string;
  hookText: string;
  why: string;
}

interface HookHijackPlan {
  attackAngle: string;
  competitorWeakness: string;
  upgradedHooks: UpgradedHook[];
}

interface BlitzDay {
  day: string;
  time: string;
  contentType: string;
  topic: string;
  hook: string;
  rationale: string;
}

interface BlitzSchedulePlan {
  attackAngle: string;
  competitorWeakness: string;
  blitzSchedule: BlitzDay[];
}

interface RewriteBrief {
  originalAngle: string;
  upgradedAngle: string;
  contentType: string;
  depthTactics: string[];
  suggestedHook: string;
  expectedImpact: string;
}

interface QualityBridgePlan {
  attackAngle: string;
  competitorWeakness: string;
  rewriteBriefs: RewriteBrief[];
}

type HijackPlan = HookHijackPlan | BlitzSchedulePlan | QualityBridgePlan;

interface HijackResult {
  planType: "hooks" | "blitz" | "quality";
  plan: HijackPlan;
}

// --- Type guards ---
function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function isHookHijackPlan(v: unknown): v is HookHijackPlan {
  if (!isObject(v)) return false;
  return (
    typeof v.attackAngle === "string" &&
    typeof v.competitorWeakness === "string" &&
    Array.isArray(v.upgradedHooks)
  );
}

function isBlitzSchedulePlan(v: unknown): v is BlitzSchedulePlan {
  if (!isObject(v)) return false;
  return (
    typeof v.attackAngle === "string" &&
    typeof v.competitorWeakness === "string" &&
    Array.isArray(v.blitzSchedule)
  );
}

function isQualityBridgePlan(v: unknown): v is QualityBridgePlan {
  if (!isObject(v)) return false;
  return (
    typeof v.attackAngle === "string" &&
    typeof v.competitorWeakness === "string" &&
    Array.isArray(v.rewriteBriefs)
  );
}

// --- Attack vector helpers ---
interface AttackVector {
  label: string;
  color: string;
  bg: string;
  border: string;
}

function getAttackVector(metric: GapMetric): AttackVector {
  const ratio =
    metric.benchmarkValue > 0
      ? metric.profileValue / metric.benchmarkValue
      : 1;
  if (ratio < 0.7) {
    return {
      label: "Primary Attack Vector",
      color: "text-red-600",
      bg: "bg-red-50",
      border: "border-red-200",
    };
  }
  if (ratio >= 1) {
    return {
      label: "Over-indexed — Defend",
      color: "text-[#074ed5]",
      bg: "bg-[#074ed5]/10",
      border: "border-[#074ed5]/20",
    };
  }
  return {
    label: "Monitor",
    color: "text-slate-500",
    bg: "bg-slate-100",
    border: "border-slate-200",
  };
}

// --- Delta label helpers ---
function formatDelta(profileValue: number, benchmarkValue: number): string {
  const delta = profileValue - benchmarkValue;
  const sign = delta >= 0 ? "+" : "";
  const formatted =
    Math.abs(delta) < 1 ? delta.toFixed(3) : delta.toFixed(1);
  return `Gap: ${sign}${formatted}%`;
}

function getDeltaColor(profileValue: number, benchmarkValue: number): string {
  return profileValue >= benchmarkValue ? "text-green-600" : "text-red-500";
}

// --- Trigger badge colors ---
const triggerColorMap: Record<string, { bg: string; text: string }> = {
  Curiosity: { bg: "bg-purple-100", text: "text-purple-700" },
  FOMO: { bg: "bg-orange-100", text: "text-orange-700" },
  Authority: { bg: "bg-blue-100", text: "text-blue-700" },
  Urgency: { bg: "bg-red-100", text: "text-red-700" },
  "Social Proof": { bg: "bg-green-100", text: "text-green-700" },
};

function triggerBadgeStyle(trigger: string): { bg: string; text: string } {
  return triggerColorMap[trigger] ?? { bg: "bg-slate-100", text: "text-slate-600" };
}

// --- Component ---
const CompetitorGap: React.FC<CompetitorGapProps> = ({ data }) => {
  const [modalState, setModalState] = useState<ModalState>("closed");
  const [hijackResult, setHijackResult] = useState<HijackResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");

  // Mock data fallback
  const safeData: GapData = data || {
    metrics: [
      {
        category: "Engagement Rate",
        profileValue: 80,
        benchmarkValue: 40,
        gapType: "Over-indexed",
      },
      {
        category: "Post Frequency",
        profileValue: 5,
        benchmarkValue: 35,
        gapType: "Opportunity",
      },
      {
        category: "Content Quality",
        profileValue: 45,
        benchmarkValue: 50,
        gapType: "On Par",
      },
    ],
    topOpportunity: "Post Frequency",
    insight:
      "This competitor is posting 5x less than the industry average. They have high engagement but low frequency, creating a massive void you can fill.",
    recommendations: [
      "Create a 'State of the Industry' carousel (5 slides).",
      "Summarize their latest viral Reel into a step-by-step PDF/Carousel.",
      "Post a static infographic on Sundays when they are silent.",
    ],
  };

  // Derive top opportunity metric
  const topMetric = safeData.metrics.find(
    (m) => m.category === safeData.topOpportunity
  );

  // Attack vector for top opportunity badge
  const topAttackVector = topMetric ? getAttackVector(topMetric) : null;

  const handleGeneratePlan = async () => {
    setModalState("loading");
    setHijackResult(null);
    setErrorMsg("");

    const payload = {
      gapType: safeData.topOpportunity,
      topOpportunity: safeData.topOpportunity,
      competitorValue: topMetric?.profileValue ?? 0,
      benchmarkValue: topMetric?.benchmarkValue ?? 0,
      niche: "social media content",
    };

    try {
      const res = await fetch("/api/analyze-extension/hijack-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = (await res.json()) as { error?: string };
        setErrorMsg(errData.error ?? "Request failed");
        setModalState("error");
        return;
      }

      const json = (await res.json()) as {
        planType?: unknown;
        plan?: unknown;
        error?: string;
      };

      if (json.error) {
        setErrorMsg(json.error);
        setModalState("error");
        return;
      }

      const planType = json.planType;
      const plan = json.plan;

      if (planType === "hooks" && isHookHijackPlan(plan)) {
        setHijackResult({ planType: "hooks", plan });
        setModalState("results");
      } else if (planType === "blitz" && isBlitzSchedulePlan(plan)) {
        setHijackResult({ planType: "blitz", plan });
        setModalState("results");
      } else if (planType === "quality" && isQualityBridgePlan(plan)) {
        setHijackResult({ planType: "quality", plan });
        setModalState("results");
      } else {
        setErrorMsg("Unexpected response shape from AI");
        setModalState("error");
      }
    } catch {
      setErrorMsg("Network error — please try again");
      setModalState("error");
    }
  };

  const closeModal = () => {
    setModalState("closed");
    setHijackResult(null);
    setErrorMsg("");
  };

  // --- Modal content rendering ---
  const renderModalContent = () => {
    if (!hijackResult) return null;
    const { planType, plan } = hijackResult;

    if (planType === "hooks" && isHookHijackPlan(plan)) {
      return (
        <div className="flex flex-col gap-4">
          {/* Attack summary */}
          <div className="p-4 bg-red-50 border border-red-100 rounded-2xl">
            <p className="text-xs font-bold text-red-600 uppercase tracking-widest mb-1">
              Attack Angle
            </p>
            <p className="text-sm font-semibold text-[#000100] leading-relaxed">
              {plan.attackAngle}
            </p>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              {plan.competitorWeakness}
            </p>
          </div>

          {/* Hooks */}
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            5 Upgraded Hooks
          </p>
          {plan.upgradedHooks.map((hook, i) => {
            const style = triggerBadgeStyle(hook.trigger);
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="p-4 bg-[#f4f8fb] border border-slate-100 rounded-2xl flex flex-col gap-2"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${style.bg} ${style.text}`}
                  >
                    {hook.trigger}
                  </span>
                </div>
                <p className="text-sm font-bold text-[#000100] leading-snug">
                  &ldquo;{hook.hookText}&rdquo;
                </p>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {hook.why}
                </p>
              </motion.div>
            );
          })}
        </div>
      );
    }

    if (planType === "blitz" && isBlitzSchedulePlan(plan)) {
      return (
        <div className="flex flex-col gap-4">
          {/* Attack summary */}
          <div className="p-4 bg-orange-50 border border-orange-100 rounded-2xl">
            <p className="text-xs font-bold text-orange-600 uppercase tracking-widest mb-1">
              Blitz Strategy
            </p>
            <p className="text-sm font-semibold text-[#000100] leading-relaxed">
              {plan.attackAngle}
            </p>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              {plan.competitorWeakness}
            </p>
          </div>

          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            7-Day Blitz Schedule
          </p>
          {plan.blitzSchedule.map((entry, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="p-4 bg-[#f4f8fb] border border-slate-100 rounded-2xl flex flex-col gap-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FaCalendarAlt className="text-[#074ed5]" size={11} />
                  <span className="text-xs font-black text-[#000100] uppercase tracking-wider">
                    {entry.day}
                  </span>
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  {entry.time}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 bg-[#074ed5]/10 text-[#074ed5] rounded-full uppercase tracking-wider">
                  {entry.contentType}
                </span>
              </div>
              <p className="text-sm font-bold text-[#000100] leading-snug">
                {entry.topic}
              </p>
              <p className="text-xs text-slate-500 italic leading-relaxed">
                &ldquo;{entry.hook}&rdquo;
              </p>
              <p className="text-xs text-slate-400 leading-relaxed">
                {entry.rationale}
              </p>
            </motion.div>
          ))}
        </div>
      );
    }

    if (planType === "quality" && isQualityBridgePlan(plan)) {
      return (
        <div className="flex flex-col gap-4">
          {/* Attack summary */}
          <div className="p-4 bg-purple-50 border border-purple-100 rounded-2xl">
            <p className="text-xs font-bold text-purple-600 uppercase tracking-widest mb-1">
              Quality Bridge Strategy
            </p>
            <p className="text-sm font-semibold text-[#000100] leading-relaxed">
              {plan.attackAngle}
            </p>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              {plan.competitorWeakness}
            </p>
          </div>

          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            3 Quality Rewrite Briefs
          </p>
          {plan.rewriteBriefs.map((brief, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-4 bg-[#f4f8fb] border border-slate-100 rounded-2xl flex flex-col gap-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full uppercase tracking-wider">
                  {brief.contentType}
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  Brief {i + 1}
                </span>
              </div>

              {/* Before / After */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 bg-red-50 border border-red-100 rounded-xl">
                  <p className="text-[9px] font-bold text-red-500 uppercase tracking-wider mb-1">
                    Competitor Angle
                  </p>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {brief.originalAngle}
                  </p>
                </div>
                <div className="p-2.5 bg-green-50 border border-green-100 rounded-xl">
                  <p className="text-[9px] font-bold text-green-600 uppercase tracking-wider mb-1">
                    Your Angle
                  </p>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {brief.upgradedAngle}
                  </p>
                </div>
              </div>

              {/* Depth tactics */}
              <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  Depth Tactics
                </p>
                <ul className="flex flex-col gap-1">
                  {brief.depthTactics.map((tactic, j) => (
                    <li key={j} className="flex items-start gap-1.5">
                      <FaStar
                        className="text-[#caee55] mt-0.5 shrink-0"
                        size={9}
                      />
                      <span className="text-xs text-slate-600 leading-relaxed">
                        {tactic}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Hook */}
              <div className="p-2.5 bg-[#074ed5]/5 border border-[#074ed5]/10 rounded-xl">
                <p className="text-[9px] font-bold text-[#074ed5] uppercase tracking-wider mb-1">
                  Suggested Hook
                </p>
                <p className="text-xs font-semibold text-[#000100] leading-relaxed italic">
                  &ldquo;{brief.suggestedHook}&rdquo;
                </p>
              </div>

              {/* Expected impact */}
              <p className="text-xs text-slate-500 leading-relaxed">
                <span className="font-bold text-green-600">Impact: </span>
                {brief.expectedImpact}
              </p>
            </motion.div>
          ))}
        </div>
      );
    }

    return null;
  };

  // --- Portal Modal ---
  const modal =
    modalState !== "closed"
      ? createPortal(
          <AnimatePresence>
            <motion.div
              key="hijack-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
              onClick={(e) => {
                if (e.target === e.currentTarget) closeModal();
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 16 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden"
              >
                {/* Modal header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-[#000100] text-[#caee55] rounded-2xl">
                      <FaSwords size={16} />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-[#000100] leading-none">
                        Hijack Plan
                      </h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                        {safeData.topOpportunity} Attack Vector
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={closeModal}
                    className="p-2 hover:bg-[#f4f8fb] rounded-full transition-colors"
                  >
                    <IoMdClose size={22} className="text-slate-400" />
                  </button>
                </div>

                {/* Modal body */}
                <div className="flex-1 overflow-y-auto p-6 custom-scroll">
                  {modalState === "loading" && (
                    <div className="flex flex-col items-center justify-center gap-4 py-16">
                      <FaRocket className="text-[#074ed5] text-4xl animate-bounce" />
                      <p className="font-bold text-slate-500 uppercase tracking-widest text-xs">
                        Generating Hijack Plan...
                      </p>
                    </div>
                  )}

                  {modalState === "error" && (
                    <div className="flex flex-col items-center justify-center gap-4 py-16">
                      <FaExclamationTriangle
                        className="text-red-400 text-4xl"
                      />
                      <p className="font-bold text-red-500 text-sm text-center">
                        {errorMsg || "Something went wrong"}
                      </p>
                      <button
                        onClick={handleGeneratePlan}
                        className="px-5 py-2.5 bg-[#074ed5] text-white rounded-2xl font-bold text-sm hover:bg-[#0041CC] transition-colors"
                      >
                        Retry
                      </button>
                    </div>
                  )}

                  {modalState === "results" && renderModalContent()}
                </div>
              </motion.div>
            </motion.div>
          </AnimatePresence>,
          document.body
        )
      : null;

  return (
    <>
      <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.05)] p-6 h-full flex flex-col">
        {/* Header Row */}
        <div className="flex justify-between items-start mb-5">
          <div>
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
              Market Arbitrage
            </h4>
            <h2 className="text-xl font-black text-[#000100] leading-none mb-1">
              Competitor Gap Discovery
            </h2>

            {/* Opportunity badge + attack vector status */}
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#caee55]/20 text-[#000100] border border-[#caee55]/30 rounded-full">
                <FaGem className="text-[#074ed5]" size={10} />
                <span className="text-[10px] uppercase font-bold tracking-wider">
                  Opportunity: {safeData.topOpportunity}
                </span>
              </div>

              {topAttackVector && (
                <div
                  className={`flex items-center gap-1.5 px-2.5 py-1 border rounded-full ${topAttackVector.bg} ${topAttackVector.border}`}
                >
                  {topAttackVector.label === "Primary Attack Vector" ? (
                    <FaBolt className={topAttackVector.color} size={9} />
                  ) : topAttackVector.label === "Over-indexed — Defend" ? (
                    <FaShieldAlt className={topAttackVector.color} size={9} />
                  ) : (
                    <FaBullseye className={topAttackVector.color} size={9} />
                  )}
                  <span
                    className={`text-[10px] uppercase font-bold tracking-wider ${topAttackVector.color}`}
                  >
                    {topAttackVector.label}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Top Right Icon Badge */}
          <div className="p-2.5 bg-[#074ed5] text-white rounded-2xl shadow-sm shrink-0">
            <FaBullseye size={18} />
          </div>
        </div>

        <div className="flex flex-col lg:flex-row flex-1 gap-6">
          {/* Chart Area */}
          <div className="flex-1 min-h-[220px] flex flex-col gap-0">
            {/* Delta labels per metric row — rendered above chart */}
            <div className="mb-1">
              {safeData.metrics.map((m) => {
                const av = getAttackVector(m);
                return (
                  <div
                    key={m.category}
                    className="flex items-center justify-between px-1 py-0.5"
                    style={{ height: 28 }}
                  >
                    <div className="flex items-center gap-1.5 ml-[90px]">
                      <span
                        className={`text-[9px] font-bold ${getDeltaColor(m.profileValue, m.benchmarkValue)}`}
                      >
                        {formatDelta(m.profileValue, m.benchmarkValue)}
                      </span>
                      <span
                        className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full border ${av.bg} ${av.border} ${av.color}`}
                      >
                        {av.label}
                      </span>
                    </div>
                    {/* 0% marker for zero profile value */}
                    {m.profileValue === 0 && (
                      <span className="text-[9px] font-bold text-slate-300 mr-1">
                        0%
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex-1 min-h-[160px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={safeData.metrics}
                  layout="vertical"
                  margin={{ top: 0, right: 10, left: 10, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    horizontal={false}
                    stroke="#f4f8fb"
                  />
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="category"
                    type="category"
                    tick={{ fontSize: 10, fontWeight: 600, fill: "#64748b" }}
                    width={90}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: "transparent" }}
                    contentStyle={{
                      backgroundColor: "#000100",
                      color: "white",
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                      fontSize: "12px",
                      fontWeight: "bold",
                      padding: "6px 10px",
                    }}
                    itemStyle={{ color: "white" }}
                    formatter={(value: number, name: string) => [
                      `${value}%`,
                      name,
                    ]}
                  />
                  <Legend
                    iconType="circle"
                    wrapperStyle={{
                      fontSize: "10px",
                      fontWeight: "bold",
                      color: "#64748b",
                      paddingTop: "10px",
                    }}
                  />
                  <Bar
                    dataKey="profileValue"
                    name="Competitor"
                    fill="#000100"
                    radius={[0, 4, 4, 0]}
                    barSize={12}
                    minPointSize={3}
                  />
                  <Bar
                    dataKey="benchmarkValue"
                    name="Industry Avg"
                    fill="#0052FF"
                    radius={[0, 4, 4, 0]}
                    barSize={12}
                    minPointSize={3}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Insight & Action */}
          <div className="w-full lg:w-[40%] flex flex-col justify-between gap-5">
            {/* Strategic Brief Insight Box */}
            <div className="bg-[#f4f8fb] rounded-2xl border border-slate-100 p-4">
              <h4 className="text-[10px] font-bold text-[#074ed5] uppercase tracking-widest mb-1 flex items-center gap-1.5">
                <BsGraphUpArrow
                  className="text-[#074ed5] shrink-0"
                  size={10}
                />{" "}
                The Attack Plan
              </h4>
              <p className="text-sm text-slate-500 font-medium leading-relaxed">
                {safeData.insight}
              </p>
            </div>

            <div className="mt-auto">
              <button
                onClick={handleGeneratePlan}
                disabled={modalState === "loading"}
                className="w-full py-3 bg-[#074ed5] hover:bg-[#0041CC] disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-[0_4px_14px_0_rgba(0,82,255,0.39)] active:scale-[0.98]"
              >
                <FaCrosshairs size={14} />
                Generate Hijack Plan
              </button>
            </div>
          </div>
        </div>
      </div>

      {modal}
    </>
  );
};

export default CompetitorGap;
