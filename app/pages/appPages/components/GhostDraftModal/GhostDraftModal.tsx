"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BsStars, BsX, BsTextParagraph, BsImage } from "react-icons/bs";

interface GhostDraftModalProps {
  idea: { concept: string; impact: string } | null;
  onClose: () => void;
}

const GhostDraftModal: React.FC<GhostDraftModalProps> = ({ idea, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<{
    hooks: string[];
    outline: string[];
    visual: string;
  } | null>(null);

  useEffect(() => {
    if (idea) {
      setLoading(true);
      // Simulate API delay for dramatic effect
      setTimeout(() => {
        setResult({
          hooks: [
            `Why ${idea.concept} is the future of [Industry]...`,
            `Stop ignoring ${idea.concept} if you want to grow...`,
            `The secret truth about ${idea.concept} no one tells you...`,
          ],
          outline: [
            "Intro: State the common misconception.",
            "Body 1: Present your counter-intuitive data.",
            "Body 2: Give a concrete example.",
            "Conclusion: Call to ACTION.",
          ],
          visual:
            "A split-screen comparison image showing 'Before' vs 'After' applying this concept.",
        });
        setLoading(false);
      }, 2500);
    }
  }, [idea]);

  return (
    <AnimatePresence>
      {idea && (
        <motion.div
          className="fixed inset-0 bg-white/60 backdrop-blur-md z-[60] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white rounded-[24px] w-full max-w-lg overflow-hidden shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] border border-[rgba(0,0,0,0.04)]"
            initial={{ scale: 0.95, y: 10, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 10, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {/* Header */}
            <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 z-20">
                <button
                  onClick={onClose}
                  className="bg-white/20 hover:bg-white/30 text-white rounded-full p-2 transition-all backdrop-blur-sm"
                >
                  <BsX size={20} />
                </button>
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 text-white/90 mb-2 text-xs font-bold tracking-widest uppercase">
                  <BsStars /> Ghost-Draft Engine
                </div>
                <h2 className="text-3xl font-bold text-white leading-tight tracking-tight">
                  {loading ? "Constructing..." : "Draft Ready"}
                </h2>
              </div>
              {/* Decorative circles */}
              <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
              <div className="absolute -top-12 -left-12 w-32 h-32 bg-indigo-300/20 rounded-full blur-2xl" />
            </div>

            {/* Content */}
            <div className="p-6 min-h-[300px]">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-full py-12 space-y-4">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="text-indigo-500"
                  >
                    <BsStars size={40} />
                  </motion.div>
                  <p className="text-gray-500 animate-pulse">
                    Analyzing user DNA...
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Hooks Section */}
                  <div>
                    <h4 className="flex items-center gap-2 font-bold text-gray-800 mb-3">
                      <span className="bg-indigo-100 text-indigo-600 p-1 rounded">
                        🪝
                      </span>
                      Viral Hook Options
                    </h4>
                    <div className="space-y-2">
                      {result?.hooks.map((hook, i) => (
                        <div
                          key={i}
                          className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-sm text-gray-700 hover:bg-indigo-50 hover:border-indigo-100 transition-colors cursor-copy"
                        >
                          "{hook}"
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Outline Section */}
                  <div>
                    <h4 className="flex items-center gap-2 font-bold text-gray-800 mb-3">
                      <span className="bg-purple-100 text-purple-600 p-1 rounded">
                        <BsTextParagraph />
                      </span>
                      Structural Outline
                    </h4>
                    <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
                      {result?.outline.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Visual Generator */}
                  <div className="bg-gray-900 rounded-xl p-4 text-white">
                    <h4 className="flex items-center gap-2 font-bold text-gray-200 mb-2 text-xs uppercase tracking-wider">
                      <BsImage /> Visual Suggestion
                    </h4>
                    <p className="text-sm text-gray-300 italic">
                      {result?.visual}
                    </p>
                  </div>

                  <button
                    onClick={onClose}
                    className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl transition-colors"
                  >
                    Save to Clipboard
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GhostDraftModal;
