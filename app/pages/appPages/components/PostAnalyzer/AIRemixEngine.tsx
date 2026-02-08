import React, { useState } from "react";
import {
  FaMagic,
  FaTwitter,
  FaLinkedin,
  FaRocket,
  FaCopy,
  FaPenFancy,
} from "react-icons/fa";

export default function AIRemixEngine() {
  const [activeTab, setActiveTab] = useState("contrarian"); // contrarian, howto, story
  const [tone, setTone] = useState("Professional");

  const remixes: Record<
    string,
    { title: string; content: string; icon: React.ReactNode }
  > = {
    contrarian: {
      title: "The Contrarian Take",
      icon: <FaRocket />,
      content: `Stop trying to build a "Personal Brand". 🛑\n\nMost people think branding is about colors and logos. It's not.\n\nIt's about reputation.\n\nReputation is what happens when you:\n1. Solve hard problems.\n2. Keep your promises.\n\nThat's it. Forget the fluff. Focus on the work. 👇`,
    },
    howto: {
      title: "Step-by-Step Guide",
      icon: <FaLinkedin />,
      content: `How to build a reputation that outlasts any algorithm:\n\n1️⃣ Do Hard Things\n- Pick the problems no one else wants to touch.\n\n2️⃣ Values > Views\n- Don't chase trends. Chase trust.\n\n3️⃣ Document, Don't Create\n- Share your actual work, not just "content".\n\nSave this checklist for your next strategy session. 📌`,
    },
    story: {
      title: "Founder's Story",
      icon: <FaTwitter />,
      content: `I used to obsess over my "Personal Brand".\n\nI spent hours on colors, fonts, and logos.\n\nThen I realized something:\n\nNo one cared.\n\nThey only cared if I could help them obtain a result.\n\nSo I stopped "branding" and started "building".\n\nThe result? My business grew 3x faster.\n\nLesson: Build a reputation, not just a brand. 🧵`,
    },
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-gray-700 shadow-xl overflow-hidden hover:shadow-2xl transition-all relative group h-full flex flex-col">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

      {/* Header */}
      <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-gray-900/50 backdrop-blur-sm relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-violet-500/20 text-violet-300 rounded-lg border border-violet-500/30">
            <FaMagic size={16} />
          </div>
          <div className="relative group cursor-help">
            <h3 className="font-bold text-sm tracking-wide text-white inline-block leading-tight">
              AI Remix Lab
            </h3>
            {/* Tooltip */}
            <div className="absolute left-0 top-full mt-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none border border-gray-800">
              <div className="font-bold mb-1 text-violet-300">
                Why this matters:
              </div>
              AI-generated content variations tailored to different platforms
              and tones. Save hours of writing time.
              <div className="absolute left-4 -top-1 w-2 h-2 bg-gray-900 transform rotate-45 border-l border-t border-gray-800"></div>
            </div>
          </div>
        </div>

        {/* Tone Selector */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase font-bold text-gray-400">
            Tone:
          </span>
          <select
            value={tone}
            onChange={(e) => setTone(e.target.value)}
            className="bg-gray-800 text-white text-xs font-bold py-1 px-2 rounded border border-gray-600 focus:outline-none focus:border-violet-500"
          >
            <option>Professional</option>
            <option>Witty</option>
            <option>Aggressive</option>
            <option>Empathetic</option>
          </select>
        </div>
      </div>

      <div className="p-4 flex-1 flex flex-col relative z-10">
        {/* --- TABS --- */}
        <div className="flex gap-2 mb-4 bg-gray-800/50 p-1 rounded-lg">
          {Object.keys(remixes).map((key) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${
                activeTab === key
                  ? "bg-violet-600 text-white shadow-lg shadow-violet-900/50"
                  : "text-gray-400 hover:text-white hover:bg-gray-700"
              }`}
            >
              {remixes[key].icon} {key}
            </button>
          ))}
        </div>

        {/* --- EDITOR AREA --- */}
        <div className="flex-1 bg-gray-800/80 rounded-xl border border-gray-600 p-4 relative font-mono text-sm text-gray-300 leading-relaxed overflow-y-auto custom-scrollbar shadow-inner">
          {remixes[activeTab].content.split("\n").map((line, i) => (
            <React.Fragment key={i}>
              {line}
              <br />
            </React.Fragment>
          ))}

          {/* Copy Action Overlay */}
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              className="p-2 bg-gray-700 text-white rounded-lg hover:bg-violet-600 transition-colors shadow-lg"
              title="Copy to Clipboard"
            >
              <FaCopy size={12} />
            </button>
          </div>
        </div>

        {/* --- FOOTER ACTIONS --- */}
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
    </div>
  );
}
