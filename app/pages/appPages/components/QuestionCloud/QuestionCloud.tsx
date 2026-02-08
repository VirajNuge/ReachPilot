import React, { useState } from "react";
import {
  FaCloud,
  FaSearch,
  FaListUl,
  FaPencilAlt,
  FaComments,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

// --- Types ---

export type IntentType = "Urgency" | "Buying" | "Educational";

export interface QuestionData {
  text: string;
  likes: number;
}

export interface KeywordNode {
  id: string;
  word: string;
  count: number; // Frequency
  engagement: number; // Avg engagement
  intent: IntentType;
  sampleQuestions: QuestionData[];
}

export interface QuestionCloudProps {
  data?: KeywordNode[];
}

// --- Mock Data ---

const MOCK_KEYWORDS: KeywordNode[] = [
  // Buying Intent (Green)
  {
    id: "1",
    word: "Pricing",
    count: 65,
    engagement: 18,
    intent: "Buying",
    sampleQuestions: [
      { text: "Is there a lifetime deal?", likes: 45 },
      { text: "Student discount available?", likes: 12 },
    ],
  },
  {
    id: "2",
    word: "Enterprise",
    count: 42,
    engagement: 22,
    intent: "Buying",
    sampleQuestions: [{ text: "Do you offer SSO for teams?", likes: 30 }],
  },
  {
    id: "3",
    word: "Refund",
    count: 15,
    engagement: 5,
    intent: "Buying",
    sampleQuestions: [{ text: "What is the policy?", likes: 8 }],
  },
  {
    id: "4",
    word: "Lifetime Deal",
    count: 38,
    engagement: 40,
    intent: "Buying",
    sampleQuestions: [{ text: "Is the LTD still active?", likes: 88 }],
  },
  {
    id: "5",
    word: "API Access",
    count: 29,
    engagement: 25,
    intent: "Buying",
    sampleQuestions: [{ text: "Is API included in Basic?", likes: 21 }],
  },

  // Educational (Blue)
  {
    id: "6",
    word: "Next.js",
    count: 85,
    engagement: 12,
    intent: "Educational",
    sampleQuestions: [
      { text: "App Router examples?", likes: 33 },
      { text: "Server Actions support?", likes: 19 },
    ],
  },
  {
    id: "7",
    word: "Tutorial",
    count: 55,
    engagement: 10,
    intent: "Educational",
    sampleQuestions: [{ text: "Video guide for setup?", likes: 25 }],
  },
  {
    id: "8",
    word: "Mobile",
    count: 32,
    engagement: 8,
    intent: "Educational",
    sampleQuestions: [{ text: "Is it responsive?", likes: 14 }],
  },
  {
    id: "9",
    word: "Export",
    count: 28,
    engagement: 15,
    intent: "Educational",
    sampleQuestions: [{ text: "Can I CSV export?", likes: 18 }],
  },
  {
    id: "10",
    word: "Integrations",
    count: 48,
    engagement: 20,
    intent: "Educational",
    sampleQuestions: [{ text: "Zapier integration?", likes: 40 }],
  },
  {
    id: "11",
    word: "Analytics",
    count: 35,
    engagement: 14,
    intent: "Educational",
    sampleQuestions: [{ text: "Real-time tracking?", likes: 22 }],
  },
  {
    id: "12",
    word: "Roadmap",
    count: 22,
    engagement: 30,
    intent: "Educational",
    sampleQuestions: [{ text: "When is v2 coming?", likes: 55 }],
  },

  // Urgency (Red)
  {
    id: "13",
    word: "Bug",
    count: 18,
    engagement: 5,
    intent: "Urgency",
    sampleQuestions: [{ text: "Login is looping", likes: 3 }],
  },
  {
    id: "14",
    word: "Slow",
    count: 12,
    engagement: 2,
    intent: "Urgency",
    sampleQuestions: [{ text: "Loading takes forever", likes: 6 }],
  },
  {
    id: "15",
    word: "Crash",
    count: 8,
    engagement: 10,
    intent: "Urgency",
    sampleQuestions: [{ text: "App crashes on iOS", likes: 12 }],
  },
  {
    id: "16",
    word: "Login",
    count: 25,
    engagement: 8,
    intent: "Urgency",
    sampleQuestions: [{ text: "Forgot password not sending", likes: 9 }],
  },
  {
    id: "17",
    word: "Support",
    count: 20,
    engagement: 15,
    intent: "Urgency",
    sampleQuestions: [{ text: "No reply to ticket #123", likes: 18 }],
  },
];

// --- Component ---

export default function QuestionCloud({
  data = MOCK_KEYWORDS,
}: QuestionCloudProps) {
  const [selectedKeyword, setSelectedKeyword] = useState<KeywordNode | null>(
    null,
  );
  const [isGenerating, setIsGenerating] = useState(false);

  // Helper to determine size based on count/engagement
  const getSize = (node: KeywordNode) => {
    const baseSize = 12; // min font size
    const sizeMultiplier = Math.log(node.count * 2) * 4;
    return Math.min(baseSize + sizeMultiplier, 32); // Cap at 32px
  };

  // Helper for color based on intent
  const getColor = (intent: IntentType) => {
    switch (intent) {
      case "Urgency":
        return "#ef4444"; // Red
      case "Buying":
        return "#10b981"; // Green
      case "Educational":
        return "#3b82f6"; // Blue
      default:
        return "#6b7280";
    }
  };

  const handleGenerateFAQ = () => {
    setIsGenerating(true);
    setTimeout(() => {
      alert(
        "📝 FAQ Generated!\n\nQ: Is there a lifetime deal?\nA: Yes, limited time only.\n\nQ: Does it support Next.js?\nA: Full App Router support.",
      );
      setIsGenerating(false);
    }, 1500);
  };

  // Fisher-Yates shuffle to randomize cloud layout visually
  // Note: doing this in render can cause hydration mismatch if not handled carefully,
  // but for this purely client-side interaction it's often acceptable or handled via useEffect.
  // To be safe for Next.js hydration, we'll just use the list as is,
  // identifying that real implementation should shuffle in getStaticProps or useEffect.
  const displayData = data;

  return (
    <div className="flex flex-col h-full w-full bg-white relative">
      {/* Header */}
      <div className="flex items-center justify-between p-6 pb-2">
        <div className="flex gap-3 items-center">
          <div className="bg-teal-50 p-2.5 rounded-xl text-teal-600">
            <FaCloud size={18} />
          </div>
          <div>
            <div className="relative group cursor-help">
              <h4 className="font-bold text-lg text-gray-900 leading-tight inline-block">
                Keyword Cloud
              </h4>
              <div className="absolute left-0 top-full mt-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none">
                <div className="font-bold mb-1 text-teal-300">
                  Why this matters:
                </div>
                Visualizes the most common questions. Green = Buying Intent,
                Blue = Learning, Red = Complaints.
                <div className="absolute left-4 -top-1 w-2 h-2 bg-gray-900 transform rotate-45"></div>
              </div>
            </div>
            <p className="text-xs text-gray-500 font-medium">
              Common Questions & Gaps
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 pt-2 flex flex-col h-full overflow-hidden relative">
        {/* The Cloud Container */}
        <div className="flex-1 rounded-2xl bg-gray-50/30 border border-gray-100 p-6 relative overflow-hidden flex flex-wrap content-center justify-center gap-x-6 gap-y-3">
          {/* Background Decoration */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none flex items-center justify-center">
            <FaCloud size={200} />
          </div>

          {displayData.map((node, i) => (
            <motion.button
              key={node.id}
              onClick={() => setSelectedKeyword(node)}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{
                opacity: 1,
                scale: 1,
                y: [0, -4, 0], // Subtle Floating animation
              }}
              transition={{
                duration: 3 + Math.random(),
                repeat: Infinity,
                repeatType: "reverse",
                delay: i * 0.05,
                ease: "easeInOut",
              }}
              whileHover={{ scale: 1.1, zIndex: 10 }}
              whileTap={{ scale: 0.95 }}
              // Removing default button styles: no border, no background, just text
              className={`font-bold leading-none transition-all cursor-pointer relative bg-transparent border-none appearance-none focus:outline-none ${selectedKeyword?.id === node.id ? "opacity-100" : "hover:opacity-100 opacity-80"}`}
              style={{
                fontSize: `${getSize(node)}px`,
                color: getColor(node.intent),
                filter:
                  selectedKeyword && selectedKeyword.id !== node.id
                    ? "blur(1.5px) grayscale(100%) opacity(0.3)"
                    : "none",
                willChange: "transform, opacity", // Performance optimization
              }}
            >
              {node.word}
              {node.engagement > 20 && (
                <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-red-400 rounded-full animate-ping pointer-events-none"></span>
              )}
            </motion.button>
          ))}
        </div>

        {/* Detail Panel / "Deep Dive" Overlay */}
        <AnimatePresence>
          {selectedKeyword && (
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-gray-200 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] rounded-t-2xl p-6 z-20"
            >
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gray-100">
                    <FaSearch
                      size={14}
                      style={{ color: getColor(selectedKeyword.intent) }}
                    />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg text-gray-900 leading-none">
                      "{selectedKeyword.word}"
                    </h4>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      {selectedKeyword.count} mentions •{" "}
                      {selectedKeyword.intent} Intent
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedKeyword(null)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors border-none"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 mb-4 max-h-[160px] overflow-y-auto custom-scrollbar">
                {selectedKeyword.sampleQuestions.map((q, i) => (
                  <div
                    key={i}
                    className="flex gap-3 items-start p-3 bg-white border border-gray-100 rounded-xl shadow-sm"
                  >
                    <FaComments className="text-gray-300 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-800 font-medium leading-snug">
                        "{q.text}"
                      </p>
                      <div className="flex items-center gap-1 mt-1.5 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                        <span>🔥 {q.likes} likes</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={handleGenerateFAQ}
                disabled={isGenerating}
                className="w-full py-2.5 px-4 bg-gray-900 hover:bg-black text-white text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95 border-none"
              >
                {isGenerating ? (
                  <>
                    <FaPencilAlt className="animate-spin" /> Drafting Answer...
                  </>
                ) : (
                  <>
                    <FaPencilAlt /> Draft Content for "{selectedKeyword.word}"
                  </>
                )}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
