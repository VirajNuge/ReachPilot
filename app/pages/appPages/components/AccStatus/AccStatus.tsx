"use client";
import React from "react";
import { motion } from "framer-motion";
import { BsPersonFill, BsDiagram3, BsTrophyFill } from "react-icons/bs";
import { AnimatedCounter, AnimatedProgress } from "../Shared";

interface AccStatusProps {
  name: string;
  title: string;
  image: string;
  followers: number;
  following?: number;
  projects: string | number;
  target: number;
}

// Get color based on score tier
const getScoreConfig = (score: number) => {
  if (score >= 80) {
    return {
      color: "#10B981", // Green
      bgColor: "bg-emerald-50",
      textColor: "text-emerald-700",
      label: "Excellent",
      gradient: "from-emerald-500 to-green-400",
    };
  }
  if (score >= 60) {
    return {
      color: "#F59E0B", // Amber
      bgColor: "bg-amber-50",
      textColor: "text-amber-700",
      label: "Good",
      gradient: "from-amber-500 to-orange-400",
    };
  }
  return {
    color: "#EF4444", // Red
    bgColor: "bg-red-50",
    textColor: "text-red-700",
    label: "Needs Work",
    gradient: "from-red-500 to-rose-400",
  };
};

export default function AccStatusBar({
  name,
  title,
  image,
  followers,
  following,
  projects,
  target,
}: AccStatusProps) {
  const scoreConfig = getScoreConfig(target);

  return (
    <motion.div
      className="w-full relative overflow-hidden rounded-[32px] border border-gray-100 bg-white shadow-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
    >
      {/* Decorative background blob - Subtle now */}
      <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-gradient-to-br from-violet-50 to-fuchsia-50 opacity-50" />

      <div className="relative flex flex-col items-center gap-6 p-8 md:flex-row md:items-start md:gap-8">
        {/* Avatar Section */}
        <div className="relative shrink-0">
          <motion.div
            className="rounded-full p-1 bg-white shadow-md border border-gray-50"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <img
              src={image}
              alt={name}
              className="h-24 w-24 rounded-full object-cover border-4 border-white"
            />
          </motion.div>
          <div className="absolute -bottom-2 -right-2 rounded-xl bg-white p-2 shadow-sm border border-gray-100">
            <div className="bg-violet-100 p-1.5 rounded-lg">
              <BsTrophyFill size={14} className="text-violet-600" />
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="flex-1 text-center md:text-left pt-2">
          <motion.h3
            className="text-2xl font-bold text-gray-900 tracking-tight"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
          >
            {name}
          </motion.h3>
          <motion.p
            className="mt-1 text-base font-medium text-gray-500 max-w-md"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            {title}
          </motion.p>

          <motion.div
            className="mt-6 flex flex-wrap justify-center gap-4 md:justify-start"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.25 }}
          >
            <div className="group flex items-center gap-3 rounded-2xl bg-gray-50 px-5 py-2.5 transition-all hover:bg-white hover:shadow-md border border-transparent hover:border-violet-100">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-violet-600 shadow-sm transition-colors">
                <BsPersonFill size={14} />
              </div>
              <div className="text-left">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Followers
                </p>
                <p className="text-sm font-bold text-gray-900">
                  <AnimatedCounter value={followers} />
                </p>
              </div>
            </div>

            {following !== undefined && (
              <div className="group flex items-center gap-3 rounded-2xl bg-gray-50 px-5 py-2.5 transition-all hover:bg-white hover:shadow-md border border-transparent hover:border-violet-100">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-violet-600 shadow-sm transition-colors">
                  <BsPersonFill size={14} />
                </div>
                <div className="text-left">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Following
                  </p>
                  <p className="text-sm font-bold text-gray-900">
                    <AnimatedCounter value={following} />
                  </p>
                </div>
              </div>
            )}

            <div className="group flex items-center gap-3 rounded-2xl bg-gray-50 px-5 py-2.5 transition-all hover:bg-white hover:shadow-md border border-transparent hover:border-blue-100">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-blue-600 shadow-sm transition-colors">
                <BsDiagram3 size={14} />
              </div>
              <div className="text-left">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Projects
                </p>
                <p className="text-sm font-bold text-gray-900">{projects}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Score Section (Dominant) */}
        <div className="shrink-0 w-full md:w-auto mt-4 md:mt-0">
          <motion.div
            className="relative flex flex-col items-center justify-center p-6 bg-gray-50 rounded-[28px] border border-gray-100 shadow-sm premium-shimmer"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
              Profile Score
            </span>
            <div className="flex items-baseline gap-1">
              <span
                className={`text-5xl font-extrabold tracking-tighter ${scoreConfig.textColor} drop-shadow-sm`}
              >
                <AnimatedCounter value={target} />
              </span>
              <span className="text-xl font-bold text-gray-300">/100</span>
            </div>

            <div
              className={`mt-2 px-3 py-1 rounded-full text-xs font-bold ${scoreConfig.bgColor} ${scoreConfig.textColor} border border-current/10`}
            >
              {scoreConfig.label}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Smooth Progress Bar at bottom */}
      <div className="absolute bottom-0 left-0 w-full h-1.5 bg-gray-100">
        <motion.div
          className={`h-full bg-gradient-to-r ${scoreConfig.gradient}`}
          initial={{ width: 0 }}
          animate={{ width: `${target}%` }}
          transition={{ duration: 1.2, delay: 0.5, ease: "circOut" }}
        />
      </div>
    </motion.div>
  );
}
