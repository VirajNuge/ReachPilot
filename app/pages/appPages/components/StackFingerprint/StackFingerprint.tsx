import React, { useState } from "react";
import { TechStackData } from "../../../../../lib/types/analysis";
import { FaServer, FaCode, FaShieldAlt, FaCheckCircle } from "react-icons/fa";
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
    // ... items ...
  ],
};

interface StackFingerprintProps {
  data?: TechStackData;
}

export default function StackFingerprint({
  data: apiData,
}: StackFingerprintProps) {
  const [data, setData] = useState<StackData>(MOCK_STACK);

  React.useEffect(() => {
    if (apiData) {
      // Map API data to component state
      // apiData is now the full object, not an array
      if (apiData.tools) {
        const mappedTech: TechNode[] = apiData.tools.map((item) => ({
          category: item.category,
          name: item.name,
          icon: <FaCode />, // In a real app, mapping icons by category/name would be better
          detected: true,
          impact: item.confidence === "High" ? "High" : "Medium",
        }));

        // Use the score if we derived it, or calculate simple one
        // For now we calculate based on class
        let baseScore = 40;
        if (apiData.businessClass === "Pro Creator") baseScore = 65;
        if (apiData.businessClass === "SaaS / Agency") baseScore = 85;
        if (apiData.businessClass === "Enterprise") baseScore = 95;

        setData({
          score: baseScore,
          businessClass: apiData.businessClass,
          verdict: apiData.verdict,
          technologies: mappedTech,
        });
      }
    }
  }, [apiData]);

  // score color logic removed, we use solid #074ed5

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.05)] p-6 h-full flex flex-col relative overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-start mb-5">
        <div>
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
            Blueprint Intel
          </h4>
          <div className="relative group cursor-help inline-block">
            <h2 className="text-xl font-black text-[#000100] leading-none mb-1">
              Stack Fingerprint
            </h2>
            <div className="absolute left-0 top-full mt-2 w-64 p-3 bg-[#000100] text-white text-xs rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none">
              X-Rays the competitor's tech stack. Tells you if they are a "Pro"
              or "Amateur" based on their hosting, tracking, and payment tools.
              <div className="absolute left-4 -top-1 w-2 h-2 bg-[#000100] transform rotate-45"></div>
            </div>
          </div>
          <p className="text-xs font-medium text-slate-500">
            Infrastructure Audit
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-full text-xs font-bold bg-[#f4f8fb] text-[#000100] border border-slate-200">
            {data.businessClass}
          </div>
          <div className="p-2.5 bg-[#074ed5] text-white rounded-2xl shadow-sm shrink-0 flex items-center justify-center">
            <FaShieldAlt size={18} />
          </div>
        </div>
      </div>

      <div className="flex flex-col h-full overflow-hidden flex-1 relative gap-6">
        {/* Sophistication Score */}
        <div className="text-center py-2">
          <div className={`text-4xl font-black text-[#074ed5]`}>
            {data.score}
            <span className="text-lg text-slate-400 font-medium">/100</span>
          </div>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
            Sophistication Score
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full mt-3 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${data.score}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={`h-full bg-[#074ed5]`}
            />
          </div>
        </div>

        {/* Tech Stack List */}
        <div className="space-y-3">
          {data.technologies.map((tech, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-3 bg-[#f4f8fb] border border-slate-100 rounded-xl"
            >
              <div className="flex items-center gap-3">
                <div className="text-[#074ed5]">{tech.icon}</div>
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase">
                    {tech.category}
                  </div>
                  <div className="font-bold text-[#000100] text-sm">
                    {tech.name}
                  </div>
                </div>
              </div>
              <FaCheckCircle className="text-[#caee55]" />
            </div>
          ))}
        </div>

        {/* Verdict Box */}
        <div className="p-4 bg-[#000100] rounded-xl text-white mt-auto">
          <div className="flex items-center gap-2 mb-2 text-[#caee55] font-bold text-xs uppercase tracking-wider">
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
