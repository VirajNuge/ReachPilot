"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BsArrowRight, BsX } from "react-icons/bs";

interface TourStep {
  targetId: string; // Used for positioning/highlighting if implemented fully, simpler version just centers text
  title: string;
  description: string;
  icon: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    targetId: "Pulse",
    title: "Zone 1: The Pulse",
    description:
      "Start here. Check your CSI (Sustainability) Score and daily vital signs. Health is wealth.",
    icon: "🧭",
  },
  {
    targetId: "Lab",
    title: "Zone 2: The Lab",
    description:
      "Deep dive. Reverse-engineer your hits with the DNA Deconstructor and Hype Meter.",
    icon: "🧪",
  },
  {
    targetId: "Crowd",
    title: "Zone 3: The Crowd",
    description:
      "Know your people. Explore Tribes and uncover the Shadow Audience (Lurkers).",
    icon: "👥",
  },
  {
    targetId: "Blueprint",
    title: "Zone 4: The Blueprint",
    description:
      "Take action. Use the Ghost-Draft Engine to turn ideas into viral posts instantly.",
    icon: "🗺️",
  },
];

const OnboardingTour: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Check if tour has been seen
    const hasSeenTour = localStorage.getItem("reachpilot_tour_seen");
    if (!hasSeenTour) {
      // Small delay to let animations settle
      setTimeout(() => setIsVisible(true), 1500);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem("reachpilot_tour_seen", "true");
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center p-4 pointer-events-none">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/40 pointer-events-auto backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />

          {/* Tour Card */}
          <motion.div
            key="tour-card"
            className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm pointer-events-auto relative overflow-hidden"
            initial={{ y: 50, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 50, opacity: 0, scale: 0.9 }}
          >
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-10 -mt-10 blur-xl" />

            <div className="relative z-10">
              <button
                onClick={handleClose}
                className="absolute top-0 right-0 bg-[#000100] hover:bg-black text-white"
              >
                <BsX size={24} />
              </button>

              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -20, opacity: 0 }}
                  className="flex flex-col gap-4"
                >
                  <span className="text-4xl bg-gray-50 w-16 h-16 rounded-xl flex items-center justify-center shadow-inner">
                    {TOUR_STEPS[currentStep].icon}
                  </span>

                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      {TOUR_STEPS[currentStep].title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {TOUR_STEPS[currentStep].description}
                    </p>
                  </div>
                </motion.div>
              </AnimatePresence>

              <div className="flex items-center justify-between mt-8">
                {/* Dots */}
                <div className="flex gap-1.5">
                  {TOUR_STEPS.map((_, i) => (
                    <div
                      key={i}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        i === currentStep
                          ? "w-4 bg-indigo-600"
                          : "w-1.5 bg-gray-200"
                      }`}
                    />
                  ))}
                </div>

                {/* Next Button */}
                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 px-5 py-2 rounded-lg font-bold transition-colors bg-[#000100] hover:bg-black text-white"
                >
                  {currentStep === TOUR_STEPS.length - 1
                    ? "Get Started"
                    : "Next"}
                  <BsArrowRight />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default OnboardingTour;
