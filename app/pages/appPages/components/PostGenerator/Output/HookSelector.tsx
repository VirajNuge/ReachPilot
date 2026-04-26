"use client";

import React from "react";
import type { HookOption } from "@/lib/types/postGeneration";

interface HookSelectorProps {
  hooks: HookOption[];
  onSelect: (hook: HookOption) => void;
  selectedHookId?: string;
}

export const HookSelector: React.FC<HookSelectorProps> = ({
  hooks,
  onSelect,
  selectedHookId,
}) => {
  return (
    <section className="space-y-3">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6B7280]">Hooks</p>
        <h3 className="mt-1 text-sm font-semibold text-[#111827]">Switch the opening angle</h3>
      </div>

      <div className="space-y-2">
        {hooks.map((hook) => {
          const isSelected = hook.id === selectedHookId;
          return (
            <button
              key={hook.id}
              type="button"
              onClick={() => onSelect(hook)}
              className={[
                "w-full rounded-[20px] border px-4 py-3 text-left transition-colors",
                isSelected
                  ? "border-[#C7D7FF] bg-[#F7FAFF] text-[#0F172A] shadow-[0_10px_24px_rgba(59,130,246,0.10)]"
                  : "border-[#E5E7EB] bg-white text-[#111827] hover:border-[#9CA3AF]",
              ].join(" ")}
            >
              <p className={["text-[11px] font-semibold uppercase tracking-[0.16em]", isSelected ? "text-[#2563EB]" : "text-[#6B7280]"].join(" ")}>
                {hook.style}
              </p>
              <p className="mt-2 text-sm leading-6">{hook.text}</p>
            </button>
          );
        })}
      </div>
    </section>
  );
};
