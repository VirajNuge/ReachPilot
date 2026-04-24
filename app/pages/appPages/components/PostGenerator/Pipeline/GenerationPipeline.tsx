"use client";

import React from "react";
import { motion } from "framer-motion";
import { Check, X, Loader2 } from "lucide-react";

export interface PipelineStage {
  name: string;
  description: string;
  status: "pending" | "active" | "completed" | "error";
}

interface GenerationPipelineProps {
  currentStage: number;
  stages: PipelineStage[];
}

export function GenerationPipeline({ currentStage, stages }: GenerationPipelineProps) {
  return (
    <div className="w-full max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center min-h-[60vh]">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full bg-white/80 backdrop-blur-xl rounded-3xl border border-white/50 shadow-2xl shadow-black/[0.08] p-8 sm:p-12 relative overflow-hidden"
      >
        <div className="text-center mb-12">
          <motion.div 
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[#0052FF] to-[#0066FF] flex items-center justify-center shadow-xl shadow-[#0052FF]/30"
          >
            <Loader2 className="w-10 h-10 text-white animate-spin" />
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Creating Your Content</h2>
          <p className="text-gray-500">AI agents are working together to build your post package</p>
        </div>

        <div className="relative max-w-lg mx-auto">
          {/* Vertical connecting line background */}
          <div className="absolute left-[27px] top-8 bottom-8 w-0.5 bg-gray-100 rounded-full" />
          
          {/* Active progress line */}
          <motion.div 
            className="absolute left-[27px] top-8 w-0.5 bg-[#0052FF] rounded-full origin-top"
            initial={{ scaleY: 0 }}
            animate={{ 
              scaleY: currentStage === 0 ? 0 : currentStage === 1 ? 0.5 : 1 
            }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            style={{ height: "calc(100% - 64px)" }}
          />

          <div className="space-y-12 relative z-10">
            {stages.map((stage, index) => {
              const isActive = stage.status === "active";
              const isCompleted = stage.status === "completed";
              const isError = stage.status === "error";
              const isPending = stage.status === "pending";

              return (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ 
                    opacity: isPending ? 0.4 : 1, 
                    x: 0 
                  }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="flex items-start gap-6"
                >
                  {/* Icon / Status Indicator */}
                  <div className="relative flex-shrink-0 mt-1">
                    <div 
                      className={`w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold transition-all duration-500 bg-white ${
                        isCompleted 
                          ? "text-green-500 border-2 border-green-500 shadow-sm" 
                          : isError
                            ? "text-red-500 border-2 border-red-500 shadow-sm"
                            : isActive
                              ? "text-[#0052FF] border-2 border-[#0052FF] shadow-[0_4px_20px_rgba(0,82,255,0.15)] scale-110"
                              : "text-gray-400 border-2 border-gray-200"
                      }`}
                    >
                      {isCompleted ? (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 200, damping: 10 }}
                        >
                          <Check className="w-6 h-6" />
                        </motion.div>
                      ) : isError ? (
                        <X className="w-6 h-6" />
                      ) : isActive ? (
                        <Loader2 className="w-6 h-6 animate-spin" />
                      ) : (
                        <span>{index + 1}</span>
                      )}
                    </div>
                    
                    {/* Pulse effect for active state */}
                    {isActive && (
                      <div className="absolute inset-0 rounded-full border-2 border-[#0052FF] animate-ping opacity-20" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 pt-2">
                    <h3 className={`text-lg font-bold mb-1 transition-colors duration-300 ${
                      isActive ? "text-[#0052FF]" : isCompleted ? "text-gray-900" : isError ? "text-red-600" : "text-gray-500"
                    }`}>
                      {stage.name}
                    </h3>
                    <p className="text-gray-500 text-sm leading-relaxed">
                      {stage.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
