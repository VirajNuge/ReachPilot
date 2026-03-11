"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  BsPersonFill,
  BsStars,
  BsCheckCircleFill,
  BsExclamationCircleFill,
  BsLightbulbFill,
} from "react-icons/bs";
import { triggerChatbot } from "@/app/components/Chatbot/chatbotEvents";

interface AccBioProps {
  clarityScore: number;
  clarityTotal: number;
  keywordScore: number;
  keywordTotal: number;
  tone: string;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
}

const getScoreColor = (score: number, total: number) => {
  const percentage = (score / total) * 100;
  if (percentage >= 80) return "text-emerald-500";
  if (percentage >= 60) return "text-amber-500";
  return "text-rose-500";
};

const CircularScore = ({ score, total, label, colorClass }: any) => {
  const percentage = (score / total) * 100;
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative h-16 w-16">
        <svg className="h-full w-full -rotate-90 transform">
          <circle
            cx="32"
            cy="32"
            r={radius}
            stroke="currentColor"
            strokeWidth="4"
            fill="transparent"
            className="text-gray-100"
          />
          <circle
            cx="32"
            cy="32"
            r={radius}
            stroke="currentColor"
            strokeWidth="4"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={colorClass}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-gray-700">
          {score}
        </span>
      </div>
      <span className="text-xs font-medium text-gray-500">{label}</span>
    </div>
  );
};

const AccBio: React.FC<AccBioProps> = ({
  clarityScore,
  clarityTotal,
  keywordScore,
  keywordTotal,
  tone,
  strengths,
  weaknesses,
  suggestions,
}) => {
  const handleRewriteWithAI = () => {
    const context = `Current bio analysis:\n- Clarity: ${clarityScore}/${clarityTotal}\n- Keywords: ${keywordScore}/${keywordTotal}\n- Tone: ${tone}\n- Strengths: ${strengths.join(", ")}\n- Weaknesses: ${weaknesses.join(", ")}\n- Suggestions: ${suggestions.join(", ")}`;
    triggerChatbot(
      "Help me rewrite my bio to be more optimized and professional",
      context,
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="h-full w-full"
    >
      <div className="h-full w-full rounded-[24px] border border-white/60 bg-white/60 p-6 shadow-sm backdrop-blur-xl transition-all hover:shadow-md">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
              <BsPersonFill size={20} />
            </div>
            <div>
              <h4 className="text-lg font-bold text-gray-900">Bio Analysis</h4>
              <p className="text-xs font-medium text-gray-500">
                First Impression Check
              </p>
            </div>
          </div>
          <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-600 border border-indigo-100">
            Tone: {tone}
          </span>
        </div>

        {/* Scores Row */}
        <div className="mb-8 flex justify-center gap-12 border-b border-gray-100 pb-6">
          <CircularScore
            score={clarityScore}
            total={clarityTotal}
            label="Clarity"
            colorClass={getScoreColor(clarityScore, clarityTotal)}
          />
          <CircularScore
            score={keywordScore}
            total={keywordTotal}
            label="Keywords"
            colorClass={getScoreColor(keywordScore, keywordTotal)}
          />
        </div>

        {/* Analysis Columns */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Left Column: Strengths & Weaknesses */}
          <div className="space-y-6">
            <div>
              <div className="mb-3 flex items-center gap-2">
                <BsCheckCircleFill className="text-emerald-500" size={14} />
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  Winning
                </span>
              </div>
              <ul className="space-y-2">
                {strengths.slice(0, 3).map((item, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2 text-sm text-gray-600"
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-300" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="mb-3 flex items-center gap-2">
                <BsExclamationCircleFill className="text-amber-500" size={14} />
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  Needs Work
                </span>
              </div>
              <ul className="space-y-2">
                {weaknesses.slice(0, 3).map((item, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2 text-sm text-gray-600"
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-300" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right Column: Suggestions & Action */}
          <div className="flex flex-col justify-between rounded-xl bg-gray-50/50 p-4 border border-gray-100">
            <div>
              <div className="mb-3 flex items-center gap-2">
                <BsLightbulbFill className="text-indigo-500" size={14} />
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  Pro Tips
                </span>
              </div>
              <ul className="space-y-2">
                {suggestions.slice(0, 3).map((item, idx) => (
                  <li
                    key={idx}
                    className="text-sm font-medium text-gray-700 italic"
                  >
                    "{item}"
                  </li>
                ))}
              </ul>
            </div>

            <motion.button
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl py-3 font-bold transition-all bg-[#000100] hover:bg-black text-white"
              onClick={handleRewriteWithAI}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <BsStars className="text-yellow-400" />
              <span>Rewrite with AI</span>
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AccBio;
