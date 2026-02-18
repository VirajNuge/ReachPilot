import React, { useState, useEffect } from "react";
import {
  FaMagic,
  FaTwitter,
  FaLinkedin,
  FaRocket,
  FaCopy,
  FaPenFancy,
  FaUserAstronaut,
  FaPlus,
  FaTrash,
  FaCheck,
  FaTimes,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

// ─── Types ────────────────────────────────────────────────────────────────────

type Persona = {
  id: string;
  name: string;
  niche: string;
  terms: string;
  tone: string;
};

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_SKELETON =
  "[Controversial Statement] + [Personal Anecdote] + [The 'Ah-Ha' Moment] + [Call to Action]";

// ─── Persona Storage Helper ───────────────────────────────────────────────────

const usePersonas = () => {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [activePersonaId, setActivePersonaId] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("reachpilot_personas");
    if (saved) setPersonas(JSON.parse(saved));
  }, []);

  const savePersona = (persona: Persona) => {
    const newPersonas = [...personas, persona];
    setPersonas(newPersonas);
    localStorage.setItem("reachpilot_personas", JSON.stringify(newPersonas));
  };

  const deletePersona = (id: string) => {
    const newPersonas = personas.filter((p) => p.id !== id);
    setPersonas(newPersonas);
    localStorage.setItem("reachpilot_personas", JSON.stringify(newPersonas));
    if (activePersonaId === id) setActivePersonaId(null);
  };

  const activePersona = personas.find((p) => p.id === activePersonaId);

  return {
    personas,
    activePersona,
    activePersonaId,
    setActivePersonaId,
    savePersona,
    deletePersona,
  };
};

// ─── Components ───────────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      className="p-2 bg-gray-700 hover:bg-violet-600 text-white rounded-lg transition-colors shadow-lg"
      title="Copy to Clipboard"
    >
      <AnimatePresence mode="wait">
        {copied ? (
          <motion.div
            key="check"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
          >
            <FaCheck size={12} />
          </motion.div>
        ) : (
          <motion.div
            key="copy"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
          >
            <FaCopy size={12} />
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
}

export default function AIRemixEngine() {
  const [activeTab, setActiveTab] = useState("contrarian"); // contrarian, howto, story
  const [isPersonaPanelOpen, setIsPersonaPanelOpen] = useState(false);

  // New Persona Form State
  const [newPersonaName, setNewPersonaName] = useState("");
  const [newPersonaNiche, setNewPersonaNiche] = useState("");
  const [newPersonaTerms, setNewPersonaTerms] = useState("");
  const [newPersonaTone, setNewPersonaTone] = useState("Professional");

  const {
    personas,
    activePersona,
    activePersonaId,
    setActivePersonaId,
    savePersona,
    deletePersona,
  } = usePersonas();

  // ─── Dynamic Content Generation (Mock) ──────────────────────────────────────

  const getRemixContent = (type: string) => {
    const terms = activePersona
      ? activePersona.terms.split(",").map((t) => t.trim())
      : ["reputation", "work", "trust"];

    const niche = activePersona ? activePersona.niche : "Business";
    const term1 = terms[0] || "value";
    const term2 = terms[1] || "consistency";

    switch (type) {
      case "contrarian":
        return `Stop trying to build a "Personal Brand" in ${niche}. 🛑\n\nMost people think it's about colors and logos. It's not.\n\nIt's about ${term1}.\n\n${term1} is what happens when you:\n1. Solve hard problems.\n2. Keep your promises.\n\nThat's it. Forget the fluff. Focus on the ${term2}. 👇`;
      case "howto":
        return `How to build ${term1} that outlasts any algorithm:\n\n1️⃣ Do Hard Things\n- Pick the problems no one else wants to touch.\n\n2️⃣ Values > Views\n- Don't chase trends. Chase ${term2}.\n\n3️⃣ Document, Don't Create\n- Share your actual work, not just "content".\n\nSave this checklist for your next strategy session. 📌`;
      case "story":
        return `I used to obsess over my "Personal Brand" in ${niche}.\n\nI spent hours on colors, fonts, and logos.\n\nThen I realized something:\n\nNo one cared.\n\nThey only cared if I could help them obtain ${term1}.\n\nSo I stopped "branding" and started "building".\n\nThe result? My ${term2} grew 3x faster.\n\nLesson: Build a reputation, not just a brand. 🧵`;
      default:
        return "";
    }
  };

  const remixContent = getRemixContent(activeTab);

  const remixes = {
    contrarian: { title: "The Contrarian Take", icon: <FaRocket /> },
    howto: { title: "Step-by-Step Guide", icon: <FaLinkedin /> },
    story: { title: "Founder's Story", icon: <FaTwitter /> },
  };

  const handleSavePersona = () => {
    if (!newPersonaName || !newPersonaNiche) return;
    savePersona({
      id: Date.now().toString(),
      name: newPersonaName,
      niche: newPersonaNiche,
      terms: newPersonaTerms,
      tone: newPersonaTone,
    });
    // Reset form
    setNewPersonaName("");
    setNewPersonaNiche("");
    setNewPersonaTerms("");
    setNewPersonaTone("Professional");
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-gray-700 shadow-xl overflow-hidden hover:shadow-2xl transition-all relative group h-full flex flex-col">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

      {/* ─── Header ─── */}
      <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-gray-900/50 backdrop-blur-sm relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-violet-500/20 text-violet-300 rounded-lg border border-violet-500/30">
            <FaMagic size={16} />
          </div>
          <div>
            <h3 className="font-bold text-sm tracking-wide text-white leading-tight">
              AI Remix Lab
            </h3>
            {activePersona && (
              <span className="text-[10px] text-violet-400 font-mono flex items-center gap-1">
                <FaUserAstronaut size={8} /> Using: {activePersona.name}
              </span>
            )}
          </div>
        </div>

        {/* Persona Toggle */}
        <button
          onClick={() => setIsPersonaPanelOpen(!isPersonaPanelOpen)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
            activePersona
              ? "bg-violet-600 border-violet-500 text-white shadow-lg shadow-violet-900/20"
              : "bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700"
          }`}
        >
          <FaUserAstronaut />
          {activePersona ? "Personas Active" : "Personas"}
        </button>
      </div>

      {/* ─── Main Content ─── */}
      <div className="p-4 flex-1 flex flex-col relative z-0">
        {/* Skeleton Banner */}
        <div className="mb-4 py-2 px-3 bg-gray-800/80 border border-gray-600/50 rounded-lg flex items-center gap-2 text-[10px] text-gray-400 font-mono">
          <span className="text-violet-400 uppercase font-black tracking-wider shrink-0">
            Internal Skeleton:
          </span>
          <span className="truncate opacity-80">{MOCK_SKELETON}</span>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4 bg-gray-800/50 p-1 rounded-lg">
          {Object.entries(remixes).map(([key, { icon }]) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${
                activeTab === key
                  ? "bg-violet-600 text-white shadow-lg shadow-violet-900/50"
                  : "text-gray-400 hover:text-white hover:bg-gray-700"
              }`}
            >
              {icon} {key}
            </button>
          ))}
        </div>

        {/* Editor Area */}
        <div className="flex-1 bg-gray-800/80 rounded-xl border border-gray-600 p-4 relative font-mono text-sm text-gray-300 leading-relaxed overflow-y-auto custom-scrollbar shadow-inner min-h-[200px]">
          {remixContent.split("\n").map((line, i) => (
            <React.Fragment key={i}>
              {line}
              <br />
            </React.Fragment>
          ))}

          {/* Copy Overlay */}
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <CopyButton text={remixContent} />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 flex gap-3">
          <button className="flex-1 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-tests-500/20 flex items-center justify-center gap-2 group/btn">
            <FaMagic className="group-hover/btn:rotate-12 transition-transform" />
            Regenerate Remix
          </button>
          <button className="px-4 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-xl text-xs font-bold transition-all border border-gray-600">
            <FaPenFancy />
          </button>
        </div>
      </div>

      {/* ─── Slide-in Persona Panel ─── */}
      <AnimatePresence>
        {isPersonaPanelOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="absolute inset-0 z-20 bg-gray-900 border-l border-gray-700 flex flex-col"
          >
            {/* Panel Header */}
            <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-800/50">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <FaUserAstronaut className="text-violet-400" /> Brand Personas
              </h3>
              <button
                onClick={() => setIsPersonaPanelOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <FaTimes />
              </button>
            </div>

            {/* Panel Content */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              {/* Existing Personas List */}
              <div className="space-y-3 mb-6">
                {personas.length === 0 && (
                  <p className="text-gray-500 text-xs text-center italic py-4">
                    No personas saved yet. create one below!
                  </p>
                )}
                {personas.map((p) => (
                  <div
                    key={p.id}
                    className={`p-3 rounded-lg border transition-all ${
                      activePersonaId === p.id
                        ? "bg-violet-900/20 border-violet-500/50"
                        : "bg-gray-800 border-gray-700 hover:border-gray-600"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-bold text-white text-xs">{p.name}</h4>
                      <div className="flex gap-2">
                        <button
                          onClick={() => deletePersona(p.id)}
                          className="text-gray-500 hover:text-red-400 transition-colors"
                        >
                          <FaTrash size={10} />
                        </button>
                      </div>
                    </div>
                    <div className="text-[10px] text-gray-400 mb-2">
                      {p.niche} • {p.tone}
                    </div>
                    <button
                      onClick={() =>
                        setActivePersonaId(
                          activePersonaId === p.id ? null : p.id,
                        )
                      }
                      className={`w-full py-1.5 rounded text-[10px] font-bold uppercase tracking-wider transition-colors ${
                        activePersonaId === p.id
                          ? "bg-violet-600 text-white"
                          : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                      }`}
                    >
                      {activePersonaId === p.id ? "Active" : "Use This Persona"}
                    </button>
                  </div>
                ))}
              </div>

              {/* Create New Form */}
              <div className="pt-4 border-t border-gray-800">
                <h4 className="font-bold text-gray-300 text-xs mb-3 flex items-center gap-2">
                  <FaPlus size={10} /> Create New Persona
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-xs text-white focus:border-violet-500 outline-none"
                      placeholder="e.g. My Coding Brand"
                      value={newPersonaName}
                      onChange={(e) => setNewPersonaName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
                      Niche
                    </label>
                    <input
                      type="text"
                      className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-xs text-white focus:border-violet-500 outline-none"
                      placeholder="e.g. SaaS Marketing"
                      value={newPersonaNiche}
                      onChange={(e) => setNewPersonaNiche(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
                      Key Terms (comma separated)
                    </label>
                    <input
                      type="text"
                      className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-xs text-white focus:border-violet-500 outline-none"
                      placeholder="e.g. ROI, churn, growth"
                      value={newPersonaTerms}
                      onChange={(e) => setNewPersonaTerms(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
                      Tone
                    </label>
                    <select
                      className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-xs text-white focus:border-violet-500 outline-none"
                      value={newPersonaTone}
                      onChange={(e) => setNewPersonaTone(e.target.value)}
                    >
                      <option>Professional</option>
                      <option>Witty</option>
                      <option>Aggressive</option>
                      <option>Empathetic</option>
                    </select>
                  </div>
                  <button
                    onClick={handleSavePersona}
                    className="w-full py-2 bg-white text-gray-900 rounded-lg text-xs font-bold hover:bg-gray-200 transition-colors"
                  >
                    Save & Activate
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
