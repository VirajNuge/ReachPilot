"use client";

import React from "react";
import { motion } from "framer-motion";
import { Loader2, Timer, XCircle } from "lucide-react";

import type { PipelineStage } from "./GenerationPipeline";

interface GenerationExperienceProps {
  stages: PipelineStage[];
  currentStage: number;
  onCancel: () => void;
}

function formatElapsed(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export default function GenerationExperience({
  stages,
  currentStage,
  onCancel,
}: GenerationExperienceProps) {
  const [elapsedSeconds, setElapsedSeconds] = React.useState(0);

  React.useEffect(() => {
    const timer = window.setInterval(() => {
      setElapsedSeconds((value) => value + 1);
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  const activeStage =
    stages.find((stage) => stage.status === "active") ??
    stages[Math.min(Math.max(currentStage - 1, 0), Math.max(stages.length - 1, 0))];

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,#fff6e8_0%,#fefefe_48%,#f6f7f9_100%)]">
      <div className="pointer-events-none absolute -left-24 top-16 h-64 w-64 rounded-full bg-[#F59E0B]/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-10 h-72 w-72 rounded-full bg-[#22C55E]/15 blur-3xl" />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-5xl flex-col justify-center px-5 py-10 sm:px-8">
        <div className="rounded-[34px] border border-white/70 bg-white/85 p-6 shadow-[0_30px_90px_rgba(15,23,42,0.12)] backdrop-blur-xl sm:p-8">
          <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="max-w-2xl">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#9CA3AF]">Generating</p>
              <h2 className="mt-2 text-3xl font-black leading-[1.1] text-[#111827] sm:text-4xl">
                Building your post package now
              </h2>
              <p className="mt-3 text-sm leading-7 text-[#4B5563]">
                The form is locked while AI agents compose captions and visuals. You can cancel anytime.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#E5E7EB] bg-white px-3 py-1.5 text-xs font-bold text-[#374151]">
                <Timer className="h-3.5 w-3.5 text-[#F59E0B]" />
                {formatElapsed(elapsedSeconds)}
              </div>
              <button
                type="button"
                onClick={onCancel}
                className="inline-flex items-center gap-2 rounded-full border border-[#FECACA] bg-white px-3 py-1.5 text-xs font-bold text-[#B91C1C] transition-colors hover:bg-[#FEF2F2]"
              >
                <XCircle className="h-3.5 w-3.5" />
                Cancel
              </button>
            </div>
          </div>

          <div className="mb-6 rounded-2xl border border-[#FDE68A] bg-[#FFFBEB] px-4 py-3">
            <div className="flex items-center gap-2 text-[#92400E]">
              <Loader2 className="h-4 w-4 animate-spin" />
              <p className="text-sm font-semibold">
                {activeStage?.name ?? "Preparing pipeline"}
              </p>
            </div>
            <p className="mt-1 text-xs text-[#B45309]">
              {activeStage?.description ?? "Initializing generation context."}
            </p>
          </div>

          <div className="space-y-3">
            {stages.map((stage, index) => {
              const isActive = stage.status === "active";
              const isCompleted = stage.status === "completed";
              const isError = stage.status === "error";

              return (
                <motion.div
                  key={`${stage.name}-${index}`}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                  className={`rounded-2xl border px-4 py-3 transition-colors ${
                    isCompleted
                      ? "border-[#BBF7D0] bg-[#F0FDF4]"
                      : isActive
                        ? "border-[#FDE68A] bg-[#FFFBEB]"
                        : isError
                          ? "border-[#FECACA] bg-[#FEF2F2]"
                          : "border-[#E5E7EB] bg-white"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`mt-0.5 inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                        isCompleted
                          ? "bg-[#22C55E] text-white"
                          : isActive
                            ? "bg-[#F59E0B] text-white"
                            : isError
                              ? "bg-[#EF4444] text-white"
                              : "bg-[#E5E7EB] text-[#6B7280]"
                      }`}
                    >
                      {isCompleted ? "✓" : isActive ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : index + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-[#111827]">{stage.name}</p>
                      <p className="text-xs text-[#6B7280]">{stage.description}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
