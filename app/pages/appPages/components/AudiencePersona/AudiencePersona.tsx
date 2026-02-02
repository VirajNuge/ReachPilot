"use client";

import React from "react";
import { motion } from "framer-motion";
import { BsPersonFill, BsLightbulbFill } from "react-icons/bs";

interface AudiencePersonaProps {
  personas?: Array<{
    name: string;
    description: string;
    percentage: number;
  }>;
}

const AudiencePersona: React.FC<AudiencePersonaProps> = ({ personas = [] }) => {
  return (
    <div className="flex h-full w-full flex-col p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h4 className="font-bold text-lg text-gray-900">Persona Deck</h4>
          <p className="text-xs text-gray-500 font-medium">
            Target Audience Profiles
          </p>
        </div>
        <div className="bg-purple-50 p-2 rounded-lg text-purple-600">
          <BsPersonFill size={16} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
        {personas.map((persona, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            whileHover={{ y: -5 }}
            className="group relative flex flex-col justify-between bg-white/70 backdrop-blur-lg rounded-[24px] p-6 border border-white/60 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] hover:bg-white/90 hover:border-white transition-all duration-500 overflow-hidden"
          >
            {/* Gradient Top Line */}
            <div
              className={`absolute top-0 left-0 right-0 h-1.5 opacity-80 bg-gradient-to-r ${
                idx === 0
                  ? "from-purple-500 to-indigo-500"
                  : idx === 1
                    ? "from-pink-500 to-rose-500"
                    : "from-cyan-500 to-blue-500"
              }`}
            />

            <div>
              <div className="flex justify-between items-start mb-4">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl bg-gray-50 border border-gray-100 group-hover:scale-110 transition-transform ${
                    idx === 0
                      ? "group-hover:bg-purple-50"
                      : idx === 1
                        ? "group-hover:bg-pink-50"
                        : "group-hover:bg-cyan-50"
                  }`}
                >
                  {idx === 0 ? "🚀" : idx === 1 ? "💼" : "🎓"}
                </div>
                <span className="px-2 py-1 rounded-md bg-gray-900 text-white text-[10px] font-bold tracking-wider">
                  {persona.percentage}%
                </span>
              </div>

              <h5 className="font-bold text-gray-900 mb-2 text-sm leading-tight group-hover:text-purple-600 transition-colors">
                {persona.name}
              </h5>

              <p className="text-xs text-gray-500 leading-relaxed line-clamp-3">
                {persona.description}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-50 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0 duration-300">
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                Matched
              </span>
              <BsLightbulbFill className="text-yellow-400 text-xs" />
            </div>
          </motion.div>
        ))}

        {personas.length === 0 && (
          <div className="col-span-3 text-center py-10 text-gray-400">
            <p className="text-sm">Identifying audience personas...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AudiencePersona;
