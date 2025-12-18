"use client";

import React from "react";
import { User, Edit2, Zap, CheckCircle2 } from "lucide-react";

export default function PersonaSummaryCard() {
  return (
    <div className="w-full bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden group hover:border-indigo-300 transition-colors">
      {/* Header Bar */}
      <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2 text-gray-700">
          <User size={16} className="text-indigo-600" />
          <span className="text-xs font-bold uppercase tracking-wider">
            Active Digital Twin
          </span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-green-100 text-green-700 rounded-full border border-green-200">
          <CheckCircle2 size={12} />
          <span className="text-[10px] font-bold uppercase">High Fidelity</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-5">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900 leading-tight">
              Tech Founder Persona
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Voice:{" "}
              <span className="font-medium text-gray-900">
                Professional, Direct, Insightful
              </span>
            </p>
          </div>
          <button className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
            <Edit2 size={16} />
          </button>
        </div>

        {/* Topics / Pillars */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-400 uppercase">
            Core Topics
          </p>
          <div className="flex flex-wrap gap-2">
            {["#SaaSGrowth", "#Bootstrapping", "#RemoteWork", "#NextJS"].map(
              (tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-md border border-indigo-100"
                >
                  {tag}
                </span>
              )
            )}
          </div>
        </div>
      </div>

      {/* Footer / Context */}
      <div className="px-5 py-3 bg-gray-50/50 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-500">
        <Zap size={14} className="text-amber-500" />
        <span>
          Optimized for <strong>LinkedIn</strong> and{" "}
          <strong>X (Twitter)</strong> formats.
        </span>
      </div>
    </div>
  );
}
