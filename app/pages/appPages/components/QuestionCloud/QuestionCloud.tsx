import React, { useState } from "react";
import {
  FaCloud,
  FaSearch,
  FaListUl,
  FaPencilAlt,
  FaComments,
  FaQuoteLeft,
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
  const [draftedFAQ, setDraftedFAQ] = useState<string | null>(null);

  // Helper to determine size based on count/engagement
  const getSize = (node: KeywordNode) => {
    const baseSize = 12; // min font size
    const sizeMultiplier = Math.log(node.count * 2) * 4;
    return Math.min(baseSize + sizeMultiplier, 32); // Cap at 32px
  };

  const getColor = (intent: IntentType) => {
    switch (intent) {
      case "Urgency":
        return "#000100"; // Dark Text
      case "Buying":
        return "#0052FF"; // Primary Blue
      case "Educational":
        return "#caee55"; // Lime
      default:
        return "#94a3b8"; // Slate
    }
  };

  const handleGenerateFAQ = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setDraftedFAQ(
        "A: Yes! We fully support the App Router in Next.js 14, along with Server Actions for optimized data fetching.",
      );
      setIsGenerating(false);
    }, 1500);
  };

  const handleClosePanel = () => {
    setSelectedKeyword(null);
    setDraftedFAQ(null);
  };

  // Fisher-Yates shuffle to randomize cloud layout visually
  // Note: doing this in render can cause hydration mismatch if not handled carefully,
  // but for this purely client-side interaction it's often acceptable or handled via useEffect.
  // To be safe for Next.js hydration, we'll just use the list as is,
  // identifying that real implementation should shuffle in getStaticProps or useEffect.
  const displayData = data;

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.05)] p-6 h-full flex flex-col relative overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-start mb-5">
        <div>
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
            Comment Intelligence
          </h4>
          <div className="relative group cursor-help inline-block">
            <h2 className="text-xl font-black text-[#000100] leading-none mb-1">
              Keyword Cloud
            </h2>
            <div className="absolute left-0 top-full mt-2 w-64 p-3 bg-[#000100] text-white text-xs rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none">
              <div className="font-bold mb-1 text-[#caee55]">
                Why this matters:
              </div>
              Visualizes the most common questions. Blue = Buying Intent, Lime =
              Learning, Dark = Complaints/Urgency.
              <div className="absolute left-4 -top-1 w-2 h-2 bg-[#000100] transform rotate-45"></div>
            </div>
          </div>
          <p className="text-xs font-medium text-slate-500">
            Common Questions & Gaps
          </p>
        </div>
        <div className="p-2.5 bg-[#074ed5] text-white rounded-2xl shadow-sm shrink-0 flex items-center justify-center">
          <FaCloud size={18} />
        </div>
      </div>

      <div className="flex flex-col h-full overflow-hidden flex-1 relative">
        {/* The Cloud Container */}
        <div className="flex-1 rounded-2xl bg-[#f4f8fb] border border-slate-100 p-6 relative overflow-hidden flex flex-wrap content-center justify-center gap-x-6 gap-y-3">
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
                <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-[#caee55] rounded-full animate-ping pointer-events-none"></span>
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
              className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border border-slate-100 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] rounded-2xl p-6 z-20 m-2"
            >
              <div className="flex justify-between items-center mb-5">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-[#f4f8fb]">
                    <FaSearch
                      size={14}
                      style={{ color: getColor(selectedKeyword.intent) }}
                    />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg text-[#000100] leading-none mb-1">
                      "{selectedKeyword.word}"
                    </h4>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {selectedKeyword.count} mentions •{" "}
                      {selectedKeyword.intent}
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleClosePanel}
                  className="w-8 h-8 flex items-center justify-center rounded-full transition-colors cursor-pointer bg-[#000100] hover:bg-black text-white"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 mb-4 max-h-[160px] overflow-y-auto custom-scrollbar">
                {selectedKeyword.sampleQuestions.map((q, i) => (
                  <div
                    key={i}
                    className="flex gap-3 items-start p-3 bg-white border border-slate-100 rounded-xl shadow-sm"
                  >
                    <FaComments className="text-[#074ed5] flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <p className="text-sm text-slate-600 font-medium leading-snug">
                        "{q.text}"
                      </p>
                      <div className="flex items-center gap-1 mt-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        <span className="text-[#caee55]">🔥</span> {q.likes}{" "}
                        likes
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {draftedFAQ && (
                <div className="mb-4 bg-[#f4f8fb] border border-[#074ed5]/20 p-4 rounded-xl relative">
                  <div className="absolute -top-3 left-4 bg-[#f4f8fb] px-2 text-[10px] font-bold text-[#074ed5] uppercase tracking-wider flex items-center gap-1">
                    <FaQuoteLeft size={10} /> AI Draft
                  </div>
                  <p className="text-sm text-slate-600 font-medium leading-relaxed mt-1">
                    <span className="font-bold text-[#000100]">Q:</span>{" "}
                    {selectedKeyword.sampleQuestions[0]?.text}
                    <br />
                    <span className="font-bold text-[#000100]">A:</span>{" "}
                    {draftedFAQ.replace("A: ", "")}
                  </p>
                </div>
              )}

              <button
                onClick={handleGenerateFAQ}
                disabled={isGenerating || draftedFAQ !== null}
                className="w-full py-3 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-[#000100] hover:bg-black text-white"
              >
                {isGenerating ? (
                  <>
                    <FaPencilAlt className="animate-spin text-[#caee55]" />{" "}
                    Drafting Answer...
                  </>
                ) : draftedFAQ !== null ? (
                  <>
                    <FaPencilAlt className="text-[#caee55]" /> Draft Complete
                  </>
                ) : (
                  <>
                    <FaPencilAlt className="text-[#caee55]" /> Draft Content for
                    "{selectedKeyword.word}"
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
