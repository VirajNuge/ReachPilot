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

  // PLAYFUL, NON-TECHNICAL TEXTS
  const loadingTexts = [
    "Warming up the engines...",
    `Spotting ${name} in the digital crowd...`,
    "Gathering all the cool details...",
    "Reading between the lines...",
    "Crunching the numbers (and the vibes)...",
    "Cooking up your secret strategy...",
    "Almost there! Polishing the report...",
  ];

  useEffect(() => {
    // 12 seconds total duration
    const totalTime = 12000;
    const interval = 100;
    const steps = totalTime / interval;
    let current = 0;

    const timer = setInterval(() => {
      current++;
      const percent = Math.min((current / steps) * 100, 95); // Cap at 95%
      setProgress(percent);

      // Change text based on progress
      const textIndex = Math.floor((percent / 100) * loadingTexts.length);
      setCurrentStep(Math.min(textIndex, loadingTexts.length - 1));
    }, interval);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/95 backdrop-blur-sm">
      <div className="w-full max-w-md p-6 text-center">
        {/* Animated Icon (Purple) */}
        <div className="relative flex justify-center mb-8">
          {/* Background Circle */}
          <motion.div className="w-24 h-24 border-4 border-purple-100 rounded-full" />
          {/* Spinning Ring */}
          <motion.div
            className="absolute top-0 w-24 h-24 border-4 border-purple-600 rounded-full border-t-transparent"
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          />
          {/* Percentage Text */}
          <div className="absolute top-0 w-24 h-24 flex items-center justify-center font-bold text-purple-700 text-lg">
            {Math.round(progress)}%
          </div>
        </div>

        {/* Text Animation */}
        <div className="h-16 mb-4 relative">
          <AnimatePresence mode="wait">
            <motion.p
              key={currentStep}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="text-xl font-semibold text-gray-700 absolute w-full"
            >
              {loadingTexts[currentStep]}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Progress Bar (Purple) */}
        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden mt-6 shadow-inner">
          <motion.div
            className="h-full bg-purple-600 rounded-full"
            initial={{ width: "0%" }}
            animate={{ width: `${progress}%` }}
            transition={{ ease: "linear" }}
            style={{
              boxShadow: "0 0 10px rgba(147, 51, 234, 0.5)", // Glowing purple effect
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
