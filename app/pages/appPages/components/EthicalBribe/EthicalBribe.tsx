import React, { useState } from "react";
import { LeadMagnetData } from "../../../../../lib/types/analysis";
import {
  FaMagnet,
  FaUnlockAlt,
  FaFilePdf,
  FaVideo,
  FaRocket,
  FaCalendarCheck,
  FaReply,
  FaCheckCircle,
  FaExclamationTriangle,
} from "react-icons/fa";
import { motion } from "framer-motion";

// --- Types ---

export type MagnetType =
  | "Checklist"
  | "Webinar"
  | "Free Trial"
  | "Discovery Call";
export type FrictionLevel = "Low" | "Medium" | "High";
export type LeadTemp = "Cold" | "Warm" | "Hot";

export interface BribeData {
  type: MagnetType;
  title: string;
  hook: string;
  friction: FrictionLevel;
  fields: string[]; // e.g. ["Email", "Name"]
  temp: LeadTemp;
  url: string;
}

// --- Mock Data ---

const MOCK_BRIBE: BribeData = {
  type: "Checklist",
  title: "The Zero-To-Hero SaaS Launch Checklist",
  hook: "Go from 0 to 100 users in 30 days without ads.",
  friction: "Low",
  fields: ["Email Address"],
  temp: "Cold",
  url: "gumroad.com/l/launch-checklist",
};

interface EthicalBribeProps {
  data?: LeadMagnetData;
}

export default function EthicalBribe({ data: apiData }: EthicalBribeProps) {
  const [data, setData] = useState<BribeData>(MOCK_BRIBE);
  const [isCountering, setIsCountering] = useState(false);
  const [counterStrategy, setCounterStrategy] = useState<string | null>(null);

  React.useEffect(() => {
    if (apiData) {
      setData({
        type: (apiData.type as MagnetType) || "Checklist",
        title: apiData.title || apiData.suggestion || "Suggested Lead Magnet",
        hook: apiData.hook || apiData.whyItWorks || "High value, low friction.",
        friction: (apiData.friction as FrictionLevel) || "Low",
        fields: ["Email"], // Default, or add to API if needed
        temp: (apiData.temp as LeadTemp) || "Warm",
        url: "#",
      });
      if (apiData.suggestion) {
        // Pre-load the AI strategy if available, or keep it for the button
        // For now, let's just map the main data.
        // actually, apiData.suggestion in the NEW type is the counter-strategy.
        // In the OLD type, it was the title.
        // I need to be careful.
        // New: title=title, suggestion=counter-strategy.
        // Old: suggestion=title.
        // logic above: title || suggestion covers both?
        // If I have new data: title exists. suggestion is counter.
        // title = apiData.title (Good).
        // If I have old data: title undefined. suggestion is title.
        // title = apiData.suggestion (Good).
      }
    }
  }, [apiData]);

  // ... rest of component ...
  const getIcon = (type: MagnetType) => {
    switch (type) {
      case "Checklist":
        return <FaFilePdf className="text-[#074ed5]" />;
      case "Webinar":
        return <FaVideo className="text-[#074ed5]" />;
      case "Free Trial":
        return <FaRocket className="text-[#074ed5]" />;
      case "Discovery Call":
        return <FaCalendarCheck className="text-[#074ed5]" />;
    }
  };

  const getFrictionColor = (level: FrictionLevel) => {
    switch (level) {
      case "Low":
        return "text-[#000100] bg-[#caee55]/20 border-[#caee55]/30";
      case "Medium":
        return "text-[#074ed5] bg-[#074ed5]/10 border-[#074ed5]/20";
      case "High":
        return "text-[#000100] bg-slate-200 border-slate-300";
    }
  };

  const getTempIcon = (temp: LeadTemp) => {
    switch (temp) {
      case "Cold":
        return "❄️";
      case "Warm":
        return "🌤️";
      case "Hot":
        return "🔥";
    }
  };

  const generateCounter = () => {
    setIsCountering(true);
    setTimeout(() => {
      let strategy = "";
      if (data.friction === "Low") {
        strategy =
          "Competitor is playing the Volume Game. Counter with high-trust **Video Audit** to capture quality leads they miss.";
      } else {
        strategy =
          "Competitor asks for too much up-front. Counter with a **One-Click Template** to steal their bounce traffic.";
      }
      setCounterStrategy(strategy);
      setIsCountering(false);
    }, 1500);
  };

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
              Ethical Bribe Decoder
            </h2>
            <div className="absolute left-0 top-full mt-2 w-64 p-3 bg-[#000100] text-white text-xs rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none">
              Analyzes the competitor's "Lead Magnet" strategy. It checks the
              type (e.g., PDF, Webinar), the friction level (how many fields),
              and the temperature of the lead it attracts.
              <div className="absolute left-4 -top-1 w-2 h-2 bg-[#000100] transform rotate-45"></div>
            </div>
          </div>
          <p className="text-xs font-medium text-slate-500">
            Analyzing competitor's entry point
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div
            className={`px-3 py-1.5 rounded-full text-xs font-bold border ${getFrictionColor(data.friction)} flex items-center gap-1.5 h-fit`}
          >
            <FaUnlockAlt size={10} />
            {data.friction} Friction
          </div>
          <div className="p-2.5 bg-[#074ed5] text-white rounded-2xl shadow-sm shrink-0 flex items-center justify-center">
            <FaMagnet size={18} />
          </div>
        </div>
      </div>

      <div className="flex flex-col h-full overflow-hidden flex-1 relative gap-6">
        {/* The Lead Magnet Card */}
        <div className="bg-[#f4f8fb] rounded-xl p-5 border border-slate-100 relative group transition-all hover:shadow-md">
          <div
            className="absolute top-4 right-4 text-2xl"
            title={`${data.temp} Leads`}
          >
            {getTempIcon(data.temp)}
          </div>

          <div className="flex items-center gap-3 mb-3">
            <div className="text-2xl opacity-90">{getIcon(data.type)}</div>
            <span className="font-bold text-sm uppercase tracking-wider text-gray-500">
              {data.type}
            </span>
          </div>

          <h4 className="text-xl font-bold text-gray-900 mb-2 leading-tight">
            {data.title}
          </h4>

          <div className="bg-white p-3 rounded-lg border border-dashed border-[#074ed5]/20 text-sm text-gray-600 italic">
            <span className="not-italic font-bold text-[#074ed5] mr-2">
              🪝 THE HOOK:
            </span>
            {data.hook}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {data.fields.map((field) => (
              <span
                key={field}
                className="text-[10px] font-bold px-2 py-1 bg-[#f4f8fb] text-[#000100] border border-slate-200 rounded uppercase"
              >
                {field}
              </span>
            ))}
          </div>
        </div>

        {/* Diagnostic Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-[#f4f8fb] border border-slate-100">
            <div className="flex items-center gap-2 mb-1 text-[#074ed5] font-bold text-xs uppercase">
              <FaExclamationTriangle />
              Risk Factor
            </div>
            <p className="text-sm text-[#000100] font-medium leading-snug">
              Competitor creates <strong>Low Barriers</strong>. They will likely
              have a larger, less qualified list.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-[#f4f8fb] border border-slate-100">
            <div className="flex items-center gap-2 mb-1 text-[#074ed5] font-bold text-xs uppercase">
              <FaCheckCircle />
              Opportunity
            </div>
            <p className="text-sm text-[#000100] font-medium leading-snug">
              Checklist users are often <strong>looking for shortcuts</strong>.
              Offer a "Done-For-You" template.
            </p>
          </div>
        </div>

        {/* Counter-Offer Generator */}
        <div className="mt-auto">
          {!counterStrategy ? (
            <button
              onClick={generateCounter}
              disabled={isCountering}
              className="w-full py-3 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-70 bg-[#000100] hover:bg-black text-white"
            >
              {isCountering ? (
                <>
                  <FaRocket className="animate-spin text-[#caee55]" /> Analyzing
                  Funnel...
                </>
              ) : (
                <>
                  <FaRocket className="text-[#caee55]" /> Generate
                  Counter-Strategy
                </>
              )}
            </button>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#000100] text-white p-5 rounded-xl shadow-lg relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-3 opacity-10">
                <FaRocket size={80} />
              </div>
              <div className="relative z-10">
                <div className="text-xs font-bold text-[#caee55] uppercase mb-1 tracking-wide">
                  Recommened Strategy
                </div>
                <p className="font-medium text-lg leading-snug">
                  {counterStrategy.split("**").map((part, i) =>
                    i % 2 === 1 ? (
                      <span
                        key={i}
                        className="font-black text-white bg-[#074ed5] px-1 rounded mx-0.5"
                      >
                        {part}
                      </span>
                    ) : (
                      part
                    ),
                  )}
                </p>
                <button
                  onClick={() => setCounterStrategy(null)}
                  className="mt-3 text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1"
                >
                  <FaReply /> Reset
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
