import React, { useState } from "react";
import {
  FaUserTie,
  FaLaptopCode,
  FaBullhorn,
  FaQuoteLeft,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

// --- Types ---

export interface Archetype {
  id: string;
  role: string; // e.g., "The Agency Owner"
  icon: React.ReactNode;
  color: string;
  bio: string; // "Focused on scaling team..."
  percentage: number; // prevalence in comments
  triggers: string[]; // "Scalability", "Client Acquisition"
  painPoints: string[]; // "Hiring", "Retention"
}

export interface CrowdPersonaData {
  primaryArchetype: Archetype;
  secondaryArchetypes: Archetype[];
  insight: {
    title: string;
    description: string;
    actionable: string;
  };
}

const MOCK_PERSONAS: CrowdPersonaData = {
  primaryArchetype: {
    id: "1",
    role: "The Mid-Level Dev",
    icon: <FaLaptopCode />,
    color: "#3b82f6", // Blue-500
    bio: "Backend-focused, uses Next.js professionally. Wants to move from Junior to Senior.",
    percentage: 55,
    triggers: ["Architecture", "Performance", "Career Growth"],
    painPoints: ["Spaghetti Code", "Imposter Syndrome"],
  },
  secondaryArchetypes: [
    {
      id: "2",
      role: "The Agency Founder",
      icon: <FaUserTie />,
      color: "#8b5cf6", // Violet-500
      bio: "Selling web services to local businesses. Cared about speed and margins.",
      percentage: 30,
      triggers: ["Pricing", "Sales", "Templates"],
      painPoints: ["Client Ghosting", "Scope Creep"],
    },
    {
      id: "3",
      role: "The Indie Hacker",
      icon: <FaBullhorn />,
      color: "#10b981", // Emerald-500
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
    <div className="flex flex-col h-full w-full bg-white relative">
      {/* Header */}
      <div className="flex items-center justify-between p-6 pb-2">
        <div className="flex gap-3 items-center">
          <div className="bg-blue-50 p-2.5 rounded-xl text-blue-600">
            <FaUserTie size={18} />
          </div>
          <div>
            <div className="relative group cursor-help">
              <h4 className="font-bold text-lg text-gray-900 leading-tight inline-block">
                Top Fan Archetypes
              </h4>
              <div className="absolute left-0 top-full mt-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none">
                <div className="font-bold mb-1 text-blue-300">
                  Why this matters:
                </div>
                Identifies who is actually leading the conversation. Don't speak
                to the crowd, speak to the leaders.
                <div className="absolute left-4 -top-1 w-2 h-2 bg-gray-900 transform rotate-45"></div>
              </div>
            </div>
            <p className="text-xs text-gray-500 font-medium">
              Crowd Persona Identification
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 pt-2 flex flex-col h-full overflow-hidden">
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
                    ? "bg-gray-900 text-white border-gray-900 shadow-md"
                    : "bg-white text-gray-600 border-gray-100 hover:border-gray-300"
                }`}
              >
                <div
                  className="absolute top-0 right-0 p-2 opacity-10"
                  style={{ color: persona.color }}
                >
                  {persona.icon}
                </div>
                <div className="z-10 text-xs font-bold uppercase tracking-wider opacity-70">
                  {persona.percentage}%
                </div>
                <div className="z-10 font-bold text-sm leading-tight">
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
            className="flex-1 bg-gray-50 border border-gray-100 rounded-2xl p-5 relative overflow-hidden"
          >
            {/* Background Decoration */}
            <div
              className="absolute top-[-20px] right-[-20px] text-[150px] opacity-5 pointer-events-none"
              style={{ color: selectedPersona.color }}
            >
              {selectedPersona.icon}
            </div>

            <div className="relative z-10 flex flex-col h-full justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span style={{ color: selectedPersona.color }}>
                    {selectedPersona.icon}
                  </span>
                  <span className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                    Bio Scan
                  </span>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed mb-4 font-medium">
                  "{selectedPersona.bio}"
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedPersona.triggers.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-white border border-gray-200 rounded-md text-[10px] font-bold text-gray-600 uppercase"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Strategic Advice */}
              <div className="mt-auto bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                <div className="flex gap-2 items-start">
                  <FaQuoteLeft
                    className="text-blue-300 flex-shrink-0 mt-1"
                    size={12}
                  />
                  <div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase mb-1">
                      Communication Guide
                    </div>
                    <div className="text-xs text-gray-800 font-medium">
                      To reach{" "}
                      <span
                        className="font-bold"
                        style={{ color: selectedPersona.color }}
                      >
                        {selectedPersona.role}s
                      </span>
                      , address their pain point of{" "}
                      <span className="underline decoration-red-200 decoration-2">
                        {selectedPersona.painPoints[0]}
                      </span>
                      .
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
