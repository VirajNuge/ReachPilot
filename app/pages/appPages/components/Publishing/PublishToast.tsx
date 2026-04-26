"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle, XCircle, X } from "lucide-react";

export interface PlatformPublishResult {
  platform: string;
  success: boolean;
  platformPostId?: string;
  error?: string;
}

interface PublishToastProps {
  results: PlatformPublishResult[];
  onDismiss: () => void;
}

const PLATFORM_LABELS: Record<string, string> = {
  linkedin:       "LinkedIn",
  x:              "X (Twitter)",
  instagram_post: "Instagram",
  instagram:      "Instagram",
  facebook:       "Facebook",
  threads:        "Threads",
  pinterest:      "Pinterest",
};

export function PublishToast({ results, onDismiss }: PublishToastProps) {
  const [visible, setVisible] = useState(true);

  // Auto-dismiss after 6 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onDismiss, 300);
    }, 6000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const allSuccess = results.every((r) => r.success);
  const anySuccess = results.some((r) => r.success);

  return (
    <div
      className={`fixed bottom-6 right-6 z-[9999] w-[340px] rounded-[20px] border shadow-[0_24px_60px_rgba(0,0,0,0.18)] transition-all duration-300 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      } ${
        allSuccess
          ? "border-green-200 bg-white"
          : anySuccess
          ? "border-amber-200 bg-white"
          : "border-red-200 bg-white"
      }`}
    >
      {/* Header */}
      <div
        className={`flex items-center justify-between rounded-t-[20px] px-4 py-3 ${
          allSuccess
            ? "bg-green-50"
            : anySuccess
            ? "bg-amber-50"
            : "bg-red-50"
        }`}
      >
        <p className="text-[12px] font-bold text-[#1A1D23]">
          {allSuccess
            ? "✅ Published successfully"
            : anySuccess
            ? "⚠️ Partial publish"
            : "❌ Publish failed"}
        </p>
        <button
          onClick={() => {
            setVisible(false);
            setTimeout(onDismiss, 300);
          }}
          className="text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X size={14} />
        </button>
      </div>

      {/* Per-platform results */}
      <div className="divide-y divide-slate-100 px-4 py-1">
        {results.map((r) => (
          <div key={r.platform} className="flex items-center gap-3 py-2.5">
            {r.success ? (
              <CheckCircle size={15} className="shrink-0 text-green-500" />
            ) : (
              <XCircle size={15} className="shrink-0 text-red-400" />
            )}
            <div className="min-w-0 flex-1">
              <p className="text-[12px] font-bold text-[#1A1D23]">
                {PLATFORM_LABELS[r.platform] ?? r.platform}
              </p>
              {r.error && (
                <p className="mt-0.5 text-[10px] text-red-500 leading-snug truncate" title={r.error}>
                  {r.error}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
