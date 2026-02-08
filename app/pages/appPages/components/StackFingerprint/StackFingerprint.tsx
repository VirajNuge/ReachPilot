import React from "react";
import {
  FaServer,
  FaCode,
  FaEye,
  FaCreditCard,
  FaShieldAlt,
  FaCheckCircle,
} from "react-icons/fa";
import { motion } from "framer-motion";

// --- Types ---
export interface TechNode {
  category: "Hosting" | "Frontend" | "Tracking" | "Payment" | "Marketing";
  name: string;
  icon: React.ReactNode;
  detected: boolean;
  impact: "High" | "Medium" | "Low";
}

export interface StackData {
  score: number;
  businessClass: "Hobbyist" | "Pro Creator" | "SaaS / Agency" | "Enterprise";
  verdict: string;
  technologies: TechNode[];
}

// --- Mock Data ---
const MOCK_STACK: StackData = {
  score: 88,
  businessClass: "SaaS / Agency",
  verdict:
    "This is a mature business investment. They use a custom Next.js frontend and enterprise-grade tracking. Do not compete on price; their automation is high-end.",
  technologies: [
    {
      category: "Hosting",
      name: "Vercel / AWS",
      icon: <FaServer />,
      detected: true,
      impact: "High",
    },
    {
      category: "Frontend",
      name: "Next.js",
      icon: <FaCode />,
      detected: true,
      impact: "High",
    },
    {
      category: "Tracking",
      name: "Meta Pixel",
      icon: <FaEye />,
      detected: true,
      impact: "Medium",
    },
    {
      category: "Payment",
      name: "Stripe",
      icon: <FaCreditCard />,
      detected: true,
      impact: "High",
    },
    {
      category: "Marketing",
      name: "ActiveCampaign",
      icon: <FaBullhornIcon />,
      detected: true,
      impact: "High",
    },
  ],
};

function FaBullhornIcon() {
  return (
    <svg
      stroke="currentColor"
      fill="currentColor"
      strokeWidth="0"
      viewBox="0 0 512 512"
      height="1em"
      width="1em"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M496 384H128V80c0-8.8-7.2-16-16-16H16C7.2 64 0 71.2 0 80v336c0 8.8 7.2 16 16 16h480c8.8 0 16-7.2 16-16v-32c0-8.8-7.2-16-16-16z"></path>
    </svg>
  ); // Placeholder custom icon if needed, or just use FaBullhorn from react-icons
}

// --- Component ---
export default function StackFingerprint() {
  const data = MOCK_STACK;

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-500";
    if (score >= 50) return "text-yellow-500";
    return "text-gray-400";
  };

  const getBarGradient = (score: number) => {
    if (score >= 80) return "bg-gradient-to-r from-emerald-400 to-teal-500";
    if (score >= 50) return "bg-gradient-to-r from-yellow-400 to-orange-500";
    return "bg-gray-300";
  };

  return (
    <div className="h-full bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col relative">
      {/* Header */}
      <div className="p-6 pb-2 border-b border-gray-50 flex justify-between items-start">
        <div className="flex gap-3">
          <div className="p-2.5 bg-slate-100 text-slate-700 rounded-xl h-fit">
            <FaShieldAlt size={18} />
          </div>
          <div>
            <div className="relative group cursor-help">
              <h3 className="font-bold text-gray-900 text-lg border-b border-dashed border-gray-300 inline-block">
                Stack Fingerprint
              </h3>
              <div className="absolute left-0 top-full mt-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none">
                X-Rays the competitor's tech stack. Tells you if they are a
                "Pro" or "Amateur" based on their hosting, tracking, and payment
                tools.
                <div className="absolute -top-1 left-4 w-2 h-2 bg-gray-900 rotate-45"></div>
              </div>
            </div>
            <p className="text-sm text-gray-500">Infrastructure Audit</p>
          </div>
        </div>
        <div className="px-3 py-1 rounded-full text-xs font-bold bg-slate-50 text-slate-600 border border-slate-200">
          {data.businessClass}
        </div>
      </div>

      <div className="p-6 pt-4 flex-1 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
        {/* Sophistication Score */}
        <div className="text-center py-2">
          <div className={`text-4xl font-black ${getScoreColor(data.score)}`}>
            {data.score}
            <span className="text-lg text-gray-300 font-medium">/100</span>
          </div>
          <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
            Sophistication Score
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full mt-3 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${data.score}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={`h-full ${getBarGradient(data.score)}`}
            />
          </div>
        </div>

        {/* Tech Stack List */}
        <div className="space-y-3">
          {data.technologies.map((tech, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-3 bg-gray-50 border border-gray-100 rounded-xl"
            >
              <div className="flex items-center gap-3">
                <div className="text-gray-400">{tech.icon}</div>
                <div>
                  <div className="text-xs font-bold text-gray-400 uppercase">
                    {tech.category}
                  </div>
                  <div className="font-bold text-gray-800 text-sm">
                    {tech.name}
                  </div>
                </div>
              </div>
              <FaCheckCircle className="text-emerald-500" />
            </div>
          ))}
        </div>

        {/* Verdict Box */}
        <div className="p-4 bg-slate-800 rounded-xl text-white mt-auto">
          <div className="flex items-center gap-2 mb-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
            <FaShieldAlt /> Pro Insight
          </div>
          <p className="text-sm leading-relaxed text-slate-200">
            {data.verdict}
          </p>
        </div>
      </div>
    </div>
  );
}
