import React, { useState } from "react";
import { LeadMagnetData } from "../../../../../lib/types/analysis";
import {
  FaMagnet,
  FaThermometerHalf,
  FaUnlockAlt,
  FaFilePdf,
  FaVideo,
  FaRocket,
  FaCalendarCheck,
  FaReply,
  FaCheckCircle,
  FaExclamationTriangle,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

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
        return <FaFilePdf className="text-red-500" />;
      case "Webinar":
        return <FaVideo className="text-blue-500" />;
      case "Free Trial":
        return <FaRocket className="text-purple-500" />;
      case "Discovery Call":
        return <FaCalendarCheck className="text-green-500" />;
    }
  };

  const getFrictionColor = (level: FrictionLevel) => {
    switch (level) {
      case "Low":
        return "text-green-500 bg-green-50 border-green-200";
      case "Medium":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "High":
        return "text-red-500 bg-red-50 border-red-200";
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
    <div className="h-full bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col relative">
      {/* Header */}
      <div className="p-6 pb-4 border-b border-gray-50 flex justify-between items-start">
        <div className="flex gap-3">
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl h-fit">
            <FaMagnet size={18} />
          </div>
          <div>
            <div className="relative group cursor-help">
              <h3 className="font-bold text-gray-900 text-lg border-b border-dashed border-gray-300 inline-block">
                Ethical Bribe Decoder
              </h3>
              <div className="absolute left-0 top-full mt-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none">
                Analyzes the competitor's "Lead Magnet" strategy. It checks the
                type (e.g., PDF, Webinar), the friction level (how many fields),
                and the temperature of the lead it attracts.
                <div className="absolute -top-1 left-4 w-2 h-2 bg-gray-900 rotate-45"></div>
              </div>
            </div>
            <p className="text-sm text-gray-500">
              Analyzing competitor's entry point
            </p>
          </div>
        </div>
        <div
          className={`px-3 py-1 rounded-full text-xs font-bold border ${getFrictionColor(data.friction)} flex items-center gap-1.5`}
        >
          <FaUnlockAlt size={10} />
          {data.friction} Friction
        </div>
      </div>

      <div className="p-6 pt-4 flex-1 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
        {/* The Lead Magnet Card */}
        <div className="bg-gray-50 rounded-xl p-5 border border-gray-200 relative group transition-all hover:shadow-md">
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
            "{data.title}"
          </h4>

          <div className="bg-white p-3 rounded-lg border border-dashed border-gray-300 text-sm text-gray-600 italic">
            <span className="not-italic font-bold text-indigo-600 mr-2">
              🪝 THE HOOK:
            </span>
            {data.hook}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {data.fields.map((field) => (
              <span
                key={field}
                className="text-[10px] font-bold px-2 py-1 bg-gray-200 text-gray-600 rounded uppercase"
              >
                {field}
              </span>
            ))}
          </div>
        </div>

        {/* Diagnostic Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-orange-50 border border-orange-100">
            <div className="flex items-center gap-2 mb-1 text-orange-700 font-bold text-xs uppercase">
              <FaExclamationTriangle />
              Risk Factor
            </div>
            <p className="text-sm text-orange-900 font-medium leading-snug">
              Competitor creates <strong>Low Barriers</strong>. They will likely
              have a larger, less qualified list.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
            <div className="flex items-center gap-2 mb-1 text-blue-700 font-bold text-xs uppercase">
              <FaCheckCircle />
              Opportunity
            </div>
            <p className="text-sm text-blue-900 font-medium leading-snug">
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
              className="w-full py-3 bg-gray-900 hover:bg-black text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95 disabled:opacity-70"
            >
              {isCountering ? (
                <>
                  <FaRocket className="animate-spin" /> Analyzing Funnel...
                </>
              ) : (
                <>
                  <FaReply /> Generate Counter-Strategy
                </>
              )}
            </button>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-indigo-600 text-white p-5 rounded-xl shadow-lg relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-3 opacity-10">
                <FaRocket size={80} />
              </div>
              <div className="relative z-10">
                <div className="text-xs font-bold text-indigo-200 uppercase mb-1 tracking-wide">
                  Recommened Strategy
                </div>
                <p className="font-medium text-lg leading-snug">
                  {counterStrategy.split("**").map((part, i) =>
                    i % 2 === 1 ? (
                      <span
                        key={i}
                        className="font-black text-white bg-indigo-500 px-1 rounded"
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
                  className="mt-3 text-xs font-bold text-indigo-200 hover:text-white flex items-center gap-1"
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
