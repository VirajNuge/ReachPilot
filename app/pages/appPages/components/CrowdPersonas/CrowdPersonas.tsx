import React, { useState } from "react";
import {
  FaUserTie,
  FaLaptopCode,
  FaBullhorn,
  FaQuoteLeft,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { CrowdPersonaData, Archetype } from "@/lib/types/analysis";

// --- Mock Data ---

const MOCK_PERSONAS: CrowdPersonaData = {
  primaryArchetype: {
    id: "1",
    role: "The Mid-Level Dev",
    iconName: "LaptopCode",
    color: "#074ed5", // Primary blue
    bio: "Backend-focused, uses Next.js professionally. Wants to move from Junior to Senior.",
    percentage: 55,
    triggers: ["Architecture", "Performance", "Career Growth"],
    painPoints: ["Spaghetti Code", "Imposter Syndrome"],
  },
  secondaryArchetypes: [
    {
      id: "2",
      role: "The Agency Founder",
      iconName: "UserTie",
      color: "#000100", // Dark text
      bio: "Selling web services to local businesses. Cared about speed and margins.",
      percentage: 30,
      triggers: ["Pricing", "Sales", "Templates"],
      painPoints: ["Client Ghosting", "Scope Creep"],
    },
    {
      id: "3",
      role: "The Indie Hacker",
      iconName: "Bullhorn",
      color: "#caee55", // Lime highlight
      bio: "Building SaaS in public. Obsessed with MRR and marketing.",
      percentage: 15,
      triggers: ["MRR", "Launch", "Viral"],
      painPoints: ["Churn", "Traffic"],
    },
  ],
  insight: {
    title: "Shift to Advanced Content",
    description:
      "The Crowd Leaders are mostly 'Mid-Level Devs' looking for seniority. They are past the 'Hello World' phase.",
    actionable:
      "Stop posting 'How to use map()'. Start posting 'Advanced Server Actions Patterns'.",
  },
};

// --- Helper ---
const getIcon = (name: string) => {
  switch (name) {
    case "UserTie":
      return <FaUserTie />;
    case "LaptopCode":
      return <FaLaptopCode />;
    case "Bullhorn":
      return <FaBullhorn />;
    default:
      return <FaUserTie />;
  }
};

// --- Component ---

export default function CrowdPersonas({
  data = MOCK_PERSONAS,
}: {
  data?: CrowdPersonaData;
}) {
  const [selectedPersona, setSelectedPersona] = useState<Archetype>(
    data.primaryArchetype,
  );

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.05)] p-6 h-full flex flex-col relative overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-start mb-5">
        <div>
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
            Audience Profiles
          </h4>
          <div className="relative group cursor-help inline-block">
            <h2 className="text-xl font-black text-[#000100] leading-none mb-1">
              Fan Archetypes
            </h2>
            <div className="absolute left-0 top-full mt-2 w-64 p-3 bg-[#000100] text-white text-xs rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none">
              <div className="font-bold mb-1 text-[#caee55]">
                Why this matters:
              </div>
              Identifies who is actually leading the conversation. Don't speak
              to the crowd, speak to the leaders.
              <div className="absolute left-4 -top-1 w-2 h-2 bg-[#000100] transform rotate-45"></div>
            </div>
          </div>
          <p className="text-xs font-medium text-slate-500">
            Crowd Persona Identification
          </p>
        </div>
        <div className="p-2.5 bg-[#074ed5] text-white rounded-2xl shadow-sm shrink-0 flex items-center justify-center">
          <FaUserTie size={18} />
        </div>
      </div>

      <div className="flex flex-col h-full overflow-hidden flex-1">
        {/* Archetype Selector (Top Cards) */}
        <div className="flex gap-3 overflow-x-auto pb-4 custom-scrollbar">
          {[data.primaryArchetype, ...data.secondaryArchetypes].map(
            (persona) => (
              <motion.button
                key={persona.id}
                onClick={() => setSelectedPersona(persona)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`min-w-[140px] p-3 rounded-xl border text-left flex flex-col justify-between h-[100px] transition-all relative overflow-hidden ${
                  selectedPersona.id === persona.id
                    ? "bg-[#000100] text-white border-[#000100] shadow-md"
                    : "bg-white text-slate-500 border-slate-100 hover:border-[#074ed5]/30"
                }`}
              >
                <div
                  className="absolute top-0 right-0 p-2 opacity-10"
                  style={{ color: persona.color }}
                >
                  {getIcon(persona.iconName)}
                </div>
                <div className="z-10 text-xs font-bold uppercase tracking-wider opacity-70">
                  {persona.percentage}%
                </div>
                <div className="z-10 font-bold text-sm leading-tight text-inherit">
                  {persona.role}
                </div>
              </motion.button>
            ),
          )}
        </div>

        {/* Selected Persona Detail Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedPersona.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex-1 bg-[#f4f8fb] border border-slate-100 rounded-2xl p-5 relative overflow-hidden flex flex-col mt-2"
          >
            {/* Background Decoration */}
            <div
              className="absolute top-[-20px] right-[-20px] text-[150px] opacity-5 pointer-events-none"
              style={{ color: selectedPersona.color }}
            >
              {getIcon(selectedPersona.iconName)}
            </div>

            <div className="relative z-10 flex flex-col h-full justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span style={{ color: selectedPersona.color }}>
                    {getIcon(selectedPersona.iconName)}
                  </span>
                  <span className="text-sm font-bold text-[#000100] uppercase tracking-wide">
                    Bio Scan
                  </span>
                </div>
                <p className="text-slate-500 text-sm leading-relaxed mb-4 font-medium">
                  "{selectedPersona.bio}"
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedPersona.triggers.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-white border border-slate-200 rounded-md text-[10px] font-bold text-[#000100] uppercase tracking-wider"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Strategic Advice */}
              <div className="mt-auto bg-white p-4 rounded-2xl border border-slate-100 shadow-sm mb-4">
                <div className="flex gap-2 items-start">
                  <FaQuoteLeft
                    className="text-[#074ed5] flex-shrink-0 mt-1"
                    size={12}
                  />
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">
                      Communication Guide
                    </div>
                    <div className="text-xs text-slate-500 font-medium leading-relaxed">
                      To reach{" "}
                      <span
                        className="font-bold"
                        style={{ color: selectedPersona.color }}
                      >
                        {selectedPersona.role}s
                      </span>
                      , address their pain point of{" "}
                      <span className="underline decoration-[#074ed5]/40 decoration-2 text-[#000100]">
                        {selectedPersona.painPoints[0]}
                      </span>
                      .
                    </div>
                  </div>
                </div>
              </div>
              <button className="w-full py-3 bg-[#074ed5] hover:bg-[#0041CC] text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-[0_4px_14px_0_rgba(7,78,213,0.39)] active:scale-[0.98]">
                Target this Persona
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
