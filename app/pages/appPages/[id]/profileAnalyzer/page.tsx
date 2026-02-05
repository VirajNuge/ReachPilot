"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  BsSend,
  BsLightningChargeFill,
  BsBarChartFill,
  BsPersonLinesFill,
  BsSearch,
  BsArrowRepeat,
} from "react-icons/bs";
import {
  PlatformSelector,
  getPlatformConfig,
  validatePlatformUrl,
} from "../../components/Shared";
import type { Platform } from "../../components/Shared";

type AnalysisMode = "solo" | "compare";

export default function UnifiedAnalyzerPage() {
  const [platform, setPlatform] = useState<Platform>("linkedin");
  const [mode, setMode] = useState<AnalysisMode>("solo");
  const [profileLink, setProfileLink] = useState("");
  const [competitorLink, setCompetitorLink] = useState("");

  const platformConfig = getPlatformConfig(platform);

  const isValidUrl =
    profileLink.trim().length > 0 && validatePlatformUrl(profileLink, platform);
  const isValid =
    mode === "solo"
      ? isValidUrl
      : isValidUrl &&
        competitorLink.trim().length > 0 &&
        validatePlatformUrl(competitorLink, platform);

  /* eslint-disable @typescript-eslint/no-unused-vars */
  const paramsHook = useParams();
  const id = paramsHook?.id as string;

  const getAnalyzeUrl = () => {
    const base = `/pages/appPages/${id}/profileAnalyzer/analyzed-account`;
    const params = new URLSearchParams({
      link: profileLink,
      platform: platform,
    });
    if (mode === "compare" && competitorLink) {
      params.append("competitor", competitorLink);
      params.append("mode", "compare");
    }
    return `${base}?${params.toString()}`;
  };

  return (
    <div className="grid place-items-center w-[1240px]">
      <div className="flex flex-col justify-center items-center relative overflow-hidden font-sans p-6">
        <motion.div
          className="relative z-10 bg-white p-12 max-w-2xl w-full shadow-[0_2px_12px_rgba(0,0,0,0.04)] rounded-[24px] border border-gray-100/50"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <motion.h1
            className="text-gray-900 text-3xl font-bold text-center mb-2 tracking-tight leading-tight"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.3 }}
          >
            Optimize Your Social Presence
          </motion.h1>

          <motion.p
            className="text-gray-500 text-[15px] text-center mb-10 font-medium tracking-tight"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.3 }}
          >
            Get AI-powered insights for any platform
          </motion.p>

          {/* Platform Selector */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            <PlatformSelector selected={platform} onSelect={setPlatform} />
          </motion.div>

          {/* Mode Toggle */}
          <motion.div
            className="flex justify-center gap-1.5 mb-10 p-1.5 bg-gray-50 rounded-full w-fit mx-auto border border-gray-100"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25, duration: 0.3 }}
          >
            <motion.button
              className={`px-6 py-2.5 rounded-full text-sm font-semibold cursor-pointer transition-all duration-200 border-none flex items-center gap-2 ${
                mode === "solo"
                  ? "bg-white text-indigo-600 shadow-[0_2px_8px_rgba(0,0,0,0.08)]"
                  : "bg-transparent text-gray-500 hover:text-gray-900 hover:bg-black/5"
              }`}
              onClick={() => setMode("solo")}
              whileTap={{ scale: 0.98 }}
            >
              Analyze Profile
            </motion.button>
            <motion.button
              className={`px-6 py-2.5 rounded-full text-sm font-semibold cursor-pointer transition-all duration-200 border-none flex items-center gap-2 ${
                mode === "compare"
                  ? "bg-white text-indigo-600 shadow-[0_2px_8px_rgba(0,0,0,0.08)]"
                  : "bg-transparent text-gray-500 hover:text-gray-900 hover:bg-black/5"
              }`}
              onClick={() => setMode("compare")}
              whileTap={{ scale: 0.98 }}
            >
              Compare
            </motion.button>
          </motion.div>

          {/* Input Fields */}
          <div className="flex flex-col gap-7">
            <motion.div
              className="relative"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.3 }}
            >
              <label className="block text-gray-700 text-xs font-bold mb-2.5 uppercase tracking-wide ml-1.5">
                Your {platformConfig.name} Profile
              </label>
              <div className="relative flex items-center group">
                <span className="absolute left-5 z-10 flex items-center justify-center pointer-events-none transition-colors duration-200 text-gray-400 group-focus-within:text-indigo-600">
                  {React.createElement(platformConfig.icon, { size: 18 })}
                </span>
                <input
                  type="text"
                  className={`w-full py-4 px-6 pl-[54px] rounded-2xl border-none bg-[#F9FAFB] text-sm text-gray-900 transition-all duration-200 font-medium ring-1 ring-transparent hover:bg-gray-100 focus:outline-none focus:bg-white focus:ring-gray-200 placeholder:text-gray-400 placeholder:font-normal ${
                    profileLink && !isValidUrl
                      ? "ring-red-500/20 bg-red-50/50"
                      : ""
                  }`}
                  placeholder={platformConfig.placeholder}
                  value={profileLink}
                  onChange={(e) => setProfileLink(e.target.value)}
                />
                {profileLink && isValidUrl && (
                  <span className="absolute right-5 text-emerald-500 bg-emerald-50 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold pointer-events-none animate-in fade-in zoom-in duration-300">
                    ✓
                  </span>
                )}
              </div>
              <AnimatePresence>
                {profileLink && !isValidUrl && (
                  <motion.p
                    className="flex items-center gap-1.5 text-red-500 text-[13px] mt-2 font-medium ml-1.5"
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                  >
                    Please enter a valid {platformConfig.name} URL
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>

            <AnimatePresence>
              {mode === "compare" && (
                <motion.div
                  className="relative"
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: "auto", marginTop: 4 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  <label className="block text-gray-700 text-xs font-bold mb-2.5 uppercase tracking-wide ml-1.5">
                    Competitor&apos;s {platformConfig.name} Profile
                  </label>
                  <div className="relative flex items-center group">
                    <span className="absolute left-5 z-10 flex items-center justify-center pointer-events-none transition-colors duration-200 text-gray-400 group-focus-within:text-indigo-600">
                      <BsArrowRepeat size={18} />
                    </span>
                    <input
                      type="text"
                      className="w-full py-5 px-6 pl-[54px] rounded-[18px] border-2 border-gray-100 bg-gray-50 text-base text-gray-900 transition-all duration-200 font-medium hover:border-gray-200 hover:bg-white focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 placeholder:text-gray-400 placeholder:font-normal"
                      placeholder={platformConfig.placeholder}
                      value={competitorLink}
                      onChange={(e) => setCompetitorLink(e.target.value)}
                    />
                    {competitorLink &&
                      validatePlatformUrl(competitorLink, platform) && (
                        <span className="absolute right-5 text-emerald-500 bg-emerald-50 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold pointer-events-none animate-in fade-in zoom-in duration-300">
                          ✓
                        </span>
                      )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Analyze Button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35, duration: 0.3 }}
          >
            <Link
              href={isValid ? getAnalyzeUrl() : "#"}
              className={`flex items-center justify-center gap-3 w-[620px] py-4 px-8 mt-8 rounded-full border-none text-[15px] font-bold cursor-pointer no-underline transition-all duration-300 shadow-md hover:translate-y-[-1px] hover:shadow-lg active:scale-[0.98] group ${
                !isValid
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed shadow-none"
                  : "bg-black text-white shadow-gray-200"
              }`}
              onClick={(e) => !isValid && e.preventDefault()}
            >
              <BsSend
                size={14}
                className={`transition-transform mb-0.5 ${
                  isValid ? "group-hover:rotate-12" : ""
                }`}
              />
              Analyze {platformConfig.name}
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
