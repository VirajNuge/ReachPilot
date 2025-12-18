"use client";

import React from "react";
import { UserCircle2, AlignLeft, Users } from "lucide-react";

interface TopicInputProps {
  topic: string;
  setTopic: (val: string) => void;
  audience: string;
  setAudience: (val: string) => void;
}

export default function TopicInput({
  topic,
  setTopic,
  audience,
  setAudience,
}: TopicInputProps) {
  return (
    <div className="space-y-5">
      {/* 1. Persona Context Card */}
      <div className="bg-yellow-50/80 rounded-xl p-4 border border-yellow-100 flex items-start gap-3 transition-colors hover:border-yellow-200 hover:bg-yellow-50">
        <div className="p-2 bg-white rounded-full shadow-sm text-yellow-600 ring-1 ring-yellow-50">
          <UserCircle2 size={20} />
        </div>
        <div>
          <span className="text-[10px] font-bold text-yellow-600 uppercase tracking-wider block mb-0.5">
            Active Persona
          </span>
          <h4 className="text-sm font-bold text-gray-900 leading-tight">
            Senior Content Strategist
          </h4>
          <p className="text-xs text-yellow-700/80 mt-1 leading-snug">
            Optimizing for:{" "}
            <span className="font-medium">
              High Retention, Authority Building
            </span>
          </p>
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
          className="w-[340px] px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 outline-none transition-all shadow-sm"
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
          className="w-[340px] px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 outline-none transition-all shadow-sm"
        />
      </div>
    </div>
  );
}
