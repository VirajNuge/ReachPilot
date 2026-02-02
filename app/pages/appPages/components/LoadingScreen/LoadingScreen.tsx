"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface LoadingScreenProps {
  link: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ link }) => {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  // Extract name from link to make it personal
  const getName = (url: string) => {
    try {
      const parts = url.split("/");
      const id = parts.filter((p) => p).pop() || "User";
      return id
        .replace(/[-_]/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase())
        .substring(0, 15);
    } catch {
      return "Profile";
    }
  };

  const name = getName(link);

  // Analysis steps with icons
  const steps = [
    { text: "Warming up the engines...", icon: "🚀" },
    { text: `Spotting ${name} in the digital crowd...`, icon: "🔍" },
    { text: "Gathering all the cool details...", icon: "📊" },
    { text: "Reading between the lines...", icon: "📖" },
    { text: "Crunching the numbers (and the vibes)...", icon: "⚡" },
    { text: "Cooking up your secret strategy...", icon: "🎯" },
    { text: "Almost there! Polishing the report...", icon: "✨" },
  ];

  useEffect(() => {
    const totalTime = 12000;
    const interval = 100;
    const totalSteps = totalTime / interval;
    let current = 0;

    const timer = setInterval(() => {
      current++;
      const percent = Math.min((current / totalSteps) * 100, 95);
      setProgress(percent);

      const stepIndex = Math.floor((percent / 100) * steps.length);
      setCurrentStep(Math.min(stepIndex, steps.length - 1));
    }, interval);

    return () => clearInterval(timer);
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        background:
          "linear-gradient(135deg, #fafafa 0%, #f5f3ff 50%, #fafafa 100%)",
      }}
    >
      {/* Subtle background animation */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{
          background: [
            "radial-gradient(circle at 20% 20%, rgba(93, 95, 239, 0.03) 0%, transparent 50%)",
            "radial-gradient(circle at 80% 80%, rgba(93, 95, 239, 0.03) 0%, transparent 50%)",
            "radial-gradient(circle at 20% 20%, rgba(93, 95, 239, 0.03) 0%, transparent 50%)",
          ],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="w-full max-w-md p-6 text-center relative z-10">
        {/* Premium Animated Icon */}
        <div className="relative flex justify-center mb-10">
          {/* Outer glow ring */}
          <motion.div
            className="absolute w-28 h-28 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(93, 95, 239, 0.1) 0%, transparent 70%)",
            }}
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Background Circle */}
          <div className="w-24 h-24 border-4 border-[#E7E6FF] rounded-full" />

          {/* Spinning Ring */}
          <motion.div
            className="absolute top-0 w-24 h-24 border-4 border-[#5D5FEF] rounded-full"
            style={{
              borderTopColor: "transparent",
              borderRightColor: "transparent",
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
          />

          {/* Second spinning ring (opposite direction) */}
          <motion.div
            className="absolute top-1 left-1 w-[88px] h-[88px] border-2 border-[#8B5CF6] rounded-full"
            style={{
              borderBottomColor: "transparent",
              borderLeftColor: "transparent",
            }}
            animate={{ rotate: -360 }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
          />

          {/* Percentage Text */}
          <div className="absolute top-0 w-24 h-24 flex items-center justify-center">
            <motion.span
              className="font-bold text-[#5D5FEF] text-xl"
              key={Math.round(progress)}
            >
              {Math.round(progress)}%
            </motion.span>
          </div>
        </div>

        {/* Step indicator dots */}
        <div className="flex justify-center gap-2 mb-6">
          {steps.map((_, index) => (
            <motion.div
              key={index}
              className="w-2 h-2 rounded-full"
              animate={{
                backgroundColor: index <= currentStep ? "#5D5FEF" : "#E5E7EB",
                scale: index === currentStep ? 1.3 : 1,
              }}
              transition={{ duration: 0.3 }}
            />
          ))}
        </div>

        {/* Text Animation with Icon */}
        <div className="h-20 mb-4 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="absolute w-full"
            >
              <motion.span
                className="text-3xl mb-2 block"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 0.5 }}
              >
                {steps[currentStep].icon}
              </motion.span>
              <p className="text-lg font-medium text-gray-700">
                {steps[currentStep].text}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Premium Progress Bar */}
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mt-8 shadow-inner">
          <motion.div
            className="h-full rounded-full relative"
            initial={{ width: "0%" }}
            animate={{ width: `${progress}%` }}
            transition={{ ease: "linear" }}
            style={{
              background:
                "linear-gradient(90deg, #5D5FEF 0%, #8B5CF6 50%, #A78BFA 100%)",
            }}
          >
            {/* Shimmer effect */}
            <motion.div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)",
              }}
              animate={{ x: ["-100%", "200%"] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </motion.div>
        </div>

        {/* Analyzing URL hint */}
        <motion.p
          className="text-xs text-gray-400 mt-4 truncate max-w-xs mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Analyzing: {link}
        </motion.p>
      </div>
    </motion.div>
  );
};

export default LoadingScreen;
