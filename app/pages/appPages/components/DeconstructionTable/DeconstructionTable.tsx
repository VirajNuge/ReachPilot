"use client";

import React from "react";
import { motion } from "framer-motion";
import { BsTable, BsTrophyFill } from "react-icons/bs";

interface PostDNA {
  hookType: string;
  format: string;
  topic: string;
  verdict: string;
}

interface DeconstructionTableProps {
  posts?: PostDNA[];
}

const DeconstructionTable: React.FC<DeconstructionTableProps> = ({
  posts = [],
}) => {
  return (
    <div className="flex h-full w-full flex-col p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h4 className="font-bold text-lg text-gray-900">DNA Deconstructor</h4>
          <p className="text-xs text-gray-500 font-medium">
            Reverse-engineering winning content
          </p>
        </div>
        <div className="bg-rose-50 p-2 rounded-lg text-rose-600">
          <BsTrophyFill size={16} />
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-100">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50/50">
            <tr>
              <th className="py-3 pl-4 font-bold text-gray-400 font-medium tracking-wide text-[10px] uppercase">
                Hook Type
              </th>
              <th className="py-3 font-bold text-gray-400 font-medium tracking-wide text-[10px] uppercase">
                Format
              </th>
              <th className="py-3 font-bold text-gray-400 font-medium tracking-wide text-[10px] uppercase">
                Topic
              </th>
              <th className="py-3 font-bold text-gray-400 font-medium tracking-wide text-[10px] uppercase pl-4">
                The Verdict
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {posts.map((post, idx) => (
              <motion.tr
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="group hover:bg-gray-50/80 transition-colors"
              >
                <td className="py-4 pl-4 font-semibold text-gray-800">
                  <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-md text-[11px] font-bold border border-gray-200 group-hover:bg-white group-hover:border-rose-200 group-hover:text-rose-600 transition-colors">
                    {post.hookType}
                  </span>
                </td>
                <td className="py-4 text-gray-600">
                  <span className="flex items-center gap-1.5 text-xs font-medium">
                    {post.format === "Carousel" && "🎠"}
                    {post.format === "Video" && "📹"}
                    {post.format === "Text" && "📝"}
                    {post.format === "Image" && "🖼️"}
                    {post.format}
                  </span>
                </td>
                <td className="py-4 text-gray-700 font-medium text-xs">
                  {post.topic}
                </td>
                <td className="py-4 text-gray-500 text-xs italic border-l border-transparent group-hover:border-rose-100 pl-4">
                  "{post.verdict}"
                </td>
              </motion.tr>
            ))}

            {posts.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="py-12 text-center text-gray-400 bg-gray-50/30"
                >
                  <p className="text-sm font-medium">
                    Analyzing top performing posts...
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DeconstructionTable;
