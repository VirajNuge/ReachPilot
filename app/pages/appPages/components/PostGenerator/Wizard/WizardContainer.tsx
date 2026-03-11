"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Check, ChevronRight, ChevronLeft } from "lucide-react";
import type { PostGenerationInput } from "@/lib/types/postGeneration";

import { StepStrategy } from "./StepStrategy";
import { StepVisualIdentity } from "./StepVisualIdentity";
import { StepToneMessaging } from "./StepToneMessaging";

interface WizardContainerProps {
  onGenerate: (input: PostGenerationInput) => void;
  isGenerating: boolean;
  accountId?: string;
}

const DEFAULT_INPUT: PostGenerationInput = {
  objective: "educational",
  targetAudience: "general_audience",
  coreMessage: "",
  platforms: ["linkedin"],
  generationFocus: "balanced",
  brandType: "personal_brand",
  visualStyle: "minimal",
  imageGenType: "ai_background",
  brandAssets: {
    colorPalette: ["#0052FF", "#1A1D23"],
    watermark: false,
  },
  tone: "professional",
  cta: "none",
  emojiLevel: "medium",
  hashtagIntensity: "medium",
};

const STEPS = [
  { id: 1, label: "Strategy & Context" },
  { id: 2, label: "Visual Identity" },
  { id: 3, label: "Tone & Messaging" },
];

export function WizardContainer({ onGenerate, isGenerating, accountId }: WizardContainerProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [input, setInput] = useState<PostGenerationInput>(DEFAULT_INPUT);

  const handleUpdate = (updates: Partial<PostGenerationInput>) => {
    setInput((prev) => ({ ...prev, ...updates }));
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep((prev) => prev + 1);
    } else {
      onGenerate(input);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const isNextDisabled = () => {
    if (currentStep === 1) {
      return !input.coreMessage.trim() || input.platforms.length === 0;
    }
    return false;
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-8">
      {/* Stepper */}
      <div className="mb-12 px-4 sm:px-12">
        <div className="relative flex items-center justify-between">
          {/* Connecting Line Background */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 rounded-full -z-10" />
          
          {/* Connecting Line Active */}
          <div 
            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-[#0052FF] rounded-full -z-10 transition-all duration-500 ease-in-out"
            style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
          />
          
          {STEPS.map((step) => {
            const isCompleted = currentStep > step.id;
            const isCurrent = currentStep === step.id;
            
            return (
              <div key={step.id} className="flex flex-col items-center gap-3 relative z-10">
                <div 
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-base font-bold transition-all duration-300 ${
                    isCompleted 
                      ? "bg-[#0052FF] text-white shadow-md" 
                      : isCurrent 
                        ? "bg-white border-[3px] border-[#0052FF] text-[#0052FF] shadow-[0_4px_20px_rgba(0,82,255,0.15)] scale-110" 
                        : "bg-white border-2 border-gray-200 text-gray-400"
                  }`}
                >
                  {isCompleted ? <Check className="w-6 h-6" /> : step.id}
                </div>
                <span 
                  className={`absolute top-14 whitespace-nowrap text-sm font-bold transition-colors duration-300 ${
                    isCurrent ? "text-[#0052FF]" : isCompleted ? "text-gray-800" : "text-gray-400"
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="mt-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {currentStep === 1 && <StepStrategy input={input} onChange={handleUpdate} accountId={accountId} />}
            {currentStep === 2 && <StepVisualIdentity input={input} onChange={handleUpdate} />}
            {currentStep === 3 && <StepToneMessaging input={input} onChange={handleUpdate} />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="mt-10 flex items-center justify-between px-2">
        <button
          onClick={handleBack}
          disabled={currentStep === 1 || isGenerating}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all duration-200 ${
            currentStep === 1 
              ? "opacity-0 pointer-events-none" 
              : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300 shadow-sm"
          }`}
        >
          <ChevronLeft className="w-5 h-5" />
          Back
        </button>

        <button
          onClick={handleNext}
          disabled={isNextDisabled() || isGenerating}
          className={`flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold transition-all duration-200 ${
            isNextDisabled() || isGenerating
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-[#0052FF] text-white hover:bg-blue-700 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          }`}
        >
          {currentStep === 3 ? (
            <>
              {isGenerating ? "Generating..." : "Generate Content"}
              {!isGenerating && <Sparkles className="w-5 h-5" />}
            </>
          ) : (
            <>
              Next Step
              <ChevronRight className="w-5 h-5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
