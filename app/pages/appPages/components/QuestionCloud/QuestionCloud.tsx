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
  {
    id: "1",
    word: "Next.js",
    count: 45,
    engagement: 8,
    intent: "Educational",
    sampleQuestions: [
      { text: "Does this work with Next.js App Router?", likes: 12 },
      { text: "How to integrate this in a server component?", likes: 8 },
    ],
  },
  {
    id: "2",
    word: "Pricing",
    count: 32,
    engagement: 15,
    intent: "Buying",
    sampleQuestions: [
      { text: "Is there a lifetime deal?", likes: 25 },
      { text: "How much for the team plan?", likes: 10 },
    ],
  },
  {
    id: "3",
    word: "Mobile",
    count: 28,
    engagement: 5,
    intent: "Educational",
    sampleQuestions: [{ text: "Is the dashboard responsive?", likes: 6 }],
  },
  {
    id: "4",
    word: "Refund",
    count: 12,
    engagement: 2,
    intent: "Urgency",
    sampleQuestions: [
      { text: "How do I request a refund?", likes: 2 },
      { text: "Money back guarantee?", likes: 4 },
    ],
  },
  {
    id: "5",
    word: "API",
    count: 25,
    engagement: 20,
    intent: "Buying",
    sampleQuestions: [{ text: "Do you have a public API?", likes: 30 }],
  },
  {
    id: "6",
    word: "Broken",
    count: 8,
    engagement: 1,
    intent: "Urgency",
    sampleQuestions: [{ text: "Link is broken in bio", likes: 1 }],
  },
  {
    id: "7",
    word: "Tutorial",
    count: 22,
    engagement: 6,
    intent: "Educational",
    sampleQuestions: [{ text: "Need a full tutorial on this", likes: 15 }],
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
    const sizeMultiplier = Math.log(node.count * 1.5) * 6;
    return Math.min(baseSize + sizeMultiplier, 40); // Cap at 40px
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
        "📝 FAQ Generated!\n\nQ: Does it work with Next.js?\nA: Yes, fully compatible with App Router.\n\nQ: What is the pricing?\nA: Starts at $29/mo.",
      );
      setIsGenerating(false);
    }, 1500);
  };

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
        <div className="flex-1 flex flex-wrap items-center justify-center gap-4 content-center p-4 relative z-0">
          {data.map((node) => (
            <motion.button
              key={node.id}
              onClick={() => setSelectedKeyword(node)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className={`font-bold leading-none transition-colors ${selectedKeyword?.id === node.id ? "opacity-100" : "opacity-80 hover:opacity-100"}`}
              style={{
                fontSize: `${getSize(node)}px`,
                color: getColor(node.intent),
                textShadow:
                  selectedKeyword?.id === node.id
                    ? `0 0 10px ${getColor(node.intent)}40`
                    : "none",
              }}
            >
              {node.word}
            </motion.button>
          ))}
        </div>

        {/* Detail Panel / "Deep Dive" Overlay */}
        <AnimatePresence>
          {selectedKeyword && (
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] rounded-t-2xl p-5 z-20 max-h-[70%]"
            >
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{
                      backgroundColor: getColor(selectedKeyword.intent),
                    }}
                  ></div>
                  <h4 className="font-bold text-lg text-gray-900">
                    Top Questions: "{selectedKeyword.word}"
                  </h4>
                </div>
                <button
                  onClick={() => setSelectedKeyword(null)}
                  className="text-xs text-gray-400 hover:text-gray-600 font-bold uppercase"
                >
                  Close
                </button>
              </div>

              <div className="space-y-3 mb-4 max-h-[150px] overflow-y-auto custom-scrollbar">
                {selectedKeyword.sampleQuestions.map((q, i) => (
                  <div
                    key={i}
                    className="flex gap-3 items-start p-3 bg-gray-50 rounded-xl"
                  >
                    <FaComments className="text-gray-300 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-700 font-medium">
                        "{q.text}"
                      </p>
                      <div className="flex items-center gap-1 mt-1 text-xs text-gray-400 font-bold">
                        <span>❤️ {q.likes} likes</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Bar */}
        <div className="mt-auto border-t border-gray-50 pt-4">
          <button
            onClick={handleGenerateFAQ}
            disabled={isGenerating}
            className="w-full py-2 px-4 bg-teal-500 hover:bg-teal-600 text-white text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm active:scale-95"
          >
            {isGenerating ? (
              <>
                <FaPencilAlt className="animate-spin" /> Writing FAQ...
              </>
            ) : (
              <>
                <FaListUl /> Generate My FAQ
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
