"use client";

import React from "react";
import { motion } from "framer-motion";
import { HookOption } from "@/lib/types/postGeneration";
import { Zap, Check } from "lucide-react";

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
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col gap-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
          <Zap className="w-4 h-4 text-[#0052FF]" />
          Alternative Hooks
        </h3>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          {hooks.length} Options
        </span>
      </div>

      <div className="flex flex-col gap-3">
        {hooks.map((hook, index) => {
          const isSelected = selectedHookId === hook.id;
          return (
            <motion.div
              key={hook.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => onSelect(hook)}
              className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 flex flex-col gap-2 ${
                isSelected
                  ? "bg-white border-[#0052FF] shadow-[0_4px_20px_rgba(0,0,0,0.03)]"
                  : "bg-[#E8ECF2] border-transparent hover:bg-gray-100"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  {hook.style}
                </span>
                {isSelected && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-[#0052FF] uppercase tracking-widest">
                    <Check className="w-3 h-3" />
                    Selected
                  </span>
                )}
              </div>
              <p className={`text-sm font-medium leading-relaxed ${isSelected ? "text-gray-900" : "text-gray-700"}`}>
                {hook.text}
              </p>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};
