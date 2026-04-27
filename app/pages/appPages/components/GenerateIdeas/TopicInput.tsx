"use client";

import React from "react";
import { AlignLeft, Users, ToggleLeft, ToggleRight, MessageSquareText } from "lucide-react";

interface TopicInputProps {
  topic: string;
  setTopic: (val: string) => void;
  audience: string;
  setAudience: (val: string) => void;
  coreMessage: string;
  setCoreMessage: (val: string) => void;
  importPersona: boolean;
  setImportPersona: (val: boolean) => void;
  personaAvailable: boolean;
}

export default function TopicInput({
  topic,
  setTopic,
  audience,
  setAudience,
  coreMessage,
  setCoreMessage,
  importPersona,
  setImportPersona,
  personaAvailable,
}: TopicInputProps) {
  return (
    <div className="space-y-5">
      {/* 1. Persona Import Toggle */}
      <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
        <div className="flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">
              Persona Import
            </span>
            <p className="text-xs text-slate-600 leading-snug">
              {personaAvailable
                ? "Use saved persona context to shape ideas."
                : "No persona available for this account yet."}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              if (personaAvailable) setImportPersona(!importPersona);
            }}
            disabled={!personaAvailable}
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold border transition-all ${
              personaAvailable
                ? importPersona
                  ? "bg-[#0052FF]/10 text-[#0052FF] border-[#0052FF]/30"
                  : "bg-white text-slate-600 border-slate-300"
                : "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
            }`}
          >
            {importPersona ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
            {importPersona ? "Enabled" : "Disabled"}
          </button>
        </div>
      </div>

      {/* 2. Topic Input */}
      <div>
        <label className="text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
          <AlignLeft size={16} className="text-gray-400" />
          Core Topic
        </label>
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g. 'SaaS Pricing Models' or 'Sustainable Living'"
          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 outline-none transition-all shadow-sm"
        />
      </div>

      {/* 3. Audience Input */}
      <div>
        <label className="text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
          <Users size={16} className="text-gray-400" />
          Target Audience
        </label>
        <input
          type="text"
          value={audience}
          onChange={(e) => setAudience(e.target.value)}
          placeholder="e.g. 'Early-stage Founders' or 'Fitness Beginners'"
          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 outline-none transition-all shadow-sm"
        />
      </div>

      {/* 4. Core Message */}
      <div>
        <label className="text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
          <MessageSquareText size={16} className="text-gray-400" />
          Core Message
        </label>
        <textarea
          value={coreMessage}
          onChange={(e) => setCoreMessage(e.target.value)}
          rows={4}
          placeholder="What should every generated idea ultimately communicate?"
          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 outline-none transition-all shadow-sm resize-none"
        />
        <p className="text-[11px] text-gray-500 mt-1.5 font-medium">
          Tip: add context, promise, or transformation you want the audience to remember.
        </p>
      </div>
    </div>
  );
}
