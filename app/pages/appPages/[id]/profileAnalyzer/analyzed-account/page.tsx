"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

// Component imports
import TopMenu from "../../../components/topMenu/topMenu";
import AccStatus from "../../../components/AccStatus/page";
import QkFix from "../../../components/AccQkFix/page";
import AccBio from "../../../components/AccBio/AccBio";
import KeyAcc from "../../../components/KeyAcc/KeyAcc";
import AccEngagment from "../../../components/AccEngagement/AccEngagment";
import AccTime from "../../../components/AccTime/AccTime";
import LoadingScreen from "../../../components/LoadingScreen/LoadingScreen";
import { ErrorState } from "../../../components/ErrorState/ErrorState";
import AnalyzerTabs from "../../../components/Shared/AnalyzerTabs";
import CsiHealthBar from "../../../components/CsiHealthBar/CsiHealthBar";
import AudiencePersona from "../../../components/AudiencePersona/AudiencePersona";
import ContentPillars from "../../../components/ContentPillars/ContentPillars";
import IdeaPlanner from "../../../components/IdeaPlanner/IdeaPlanner";
import DeconstructionTable from "../../../components/DeconstructionTable/DeconstructionTable";
import HypeValueMeter from "../../../components/HypeValueMeter/HypeValueMeter";
import ContentGapRadar from "../../../components/ContentGapRadar/ContentGapRadar";
import TribalMap from "../../../components/TribalMap/TribalMap";
import ShadowAudience from "../../../components/ShadowAudience/ShadowAudience";
import StreakCounter from "../../../components/StreakCounter/StreakCounter";
import OnboardingTour from "../../../components/OnboardingTour/OnboardingTour";

import "./analyzedAccount.css";

interface AnalysisData {
  profile: {
    name: string;
    headline: string;
    followers: number;
    projects: string;
    profileScore?: number;
  };
  contentMetrics?: {
    frequencyScore: number;
    contentMixScore: number;
    engagementScore: number;
  };
  quickFixes: Array<{
    headline: string;
    description: string;
    tag: "HIGH IMPACT" | "MEDIUM IMPACT" | "LOW IMPACT";
  }>;
  bioAnalysis: {
    clarityScore: number;
    keywordScore: number;
    tone: string;
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
  };
  keywords: { current: string[]; missing: string[] };
  textAnalysis: { frequency: string; contentMix: string; engagement: string };
  schedule: Array<{
    day: string;
    slots: Array<{
      id: string;
      label: string;
      value: number;
      engagement: string;
    }>;
  }>;
  scheduleHighlight: string;
  // Phase 2 Deep Analysis Data
  csiScore?: number;
  contentPillars?: Array<{
    topic: string;
    performance: string;
  }>;
  audiencePersonas?: Array<{
    name: string;
    description: string;
    percentage: number;
  }>;
  hypeValueScore?: {
    hype: number;
    value: number;
  };
  ideaBank?: Array<{
    concept: string;
    impact: string;
  }>;
  postDNA?: Array<{
    hookType: string;
    format: string;
    topic: string;
    verdict: string;
  }>;
  tribes?: Array<{
    name: string;
    size: number;
    growth: string;
    sentiment: string;
  }>;
  shadowAudience?: {
    lurkersPercent: number;
    engagersPercent: number;
    insight: string;
  };
}

function AnalysisContent() {
  const searchParams = useSearchParams();
  const link = searchParams.get("link");

  const [activeTab, setActiveTab] = useState("Pulse");
  const [data, setData] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!link) {
      setError("No link provided.");
      setLoading(false);
      return;
    }
    const fetchData = async () => {
      try {
        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ link }),
        });
        if (!res.ok) throw new Error("Server Error");
        setData(await res.json());
      } catch (err) {
        console.error(err);
        setError("Analysis Failed.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [link]);

  // Retry function
  const handleRetry = () => {
    setError("");
    setLoading(true);
    setData(null);
    // Re-trigger fetch
    if (link) {
      fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          link,
          platform: searchParams.get("platform") || "linkedin",
        }),
      })
        .then(async (res) => {
          if (!res.ok) {
            const errorText = await res.text();
            throw new Error(errorText || "Server Error");
          }
          return res.json();
        })
        .then((data) => {
          if (data && typeof data === "object") {
            setData(data);
          } else {
            throw new Error("Invalid response format");
          }
        })
        .catch((err) => {
          console.error(err);
          setError("Analysis Failed. Please check the URL and try again.");
        })
        .finally(() => setLoading(false));
    }
  };

  if (loading) return <LoadingScreen link={link || ""} />;
  if (error || !data)
    return (
      <ErrorState
        title="Analysis Failed"
        message={
          error ||
          "We couldn't analyze this profile. Please check the URL and try again."
        }
        onRetry={handleRetry}
      />
    );

  const statusDataMap = {
    current: {
      label: "Current Skills:",
      keywords: data.keywords?.current?.join(", ") || "N/A",
      color: { bg: "bg-[#DFFFC7]", text: "text-[#208800]" },
    },
    missing: {
      label: "Needs Improvement:",
      keywords: data.keywords?.missing?.join(", ") || "N/A",
      color: { bg: "bg-[#FFC7C7]", text: "text-[#D90000]" },
    },
  };

  return (
    <>
      <OnboardingTour />
      <div className="analyzeAccContainer font-sans pb-20 pt-2 ">
        <Suspense fallback={<LoadingScreen link={link || ""} />}>
          <div className="flex flex-col gap-6">
            {/* Tabs */}
            <div className="flex justify-start mb-6 sticky top-0 z-20 bg-[#F9F9FB]/95 backdrop-blur-sm py-2">
              <AnalyzerTabs
                className="bg-white border-gray-200/60 shadow-sm w-fit mb-[-30px]"
                tabs={[
                  {
                    id: "Pulse",
                    label: "Pulse Overview",
                    icon: <span>🧭</span>,
                  },
                  {
                    id: "Lab",
                    label: "The Lab",
                    icon: <span>🧪</span>,
                  },
                  {
                    id: "Crowd",
                    label: "The Crowd",
                    icon: <span>👥</span>,
                  },
                  {
                    id: "Blueprint",
                    label: "Blueprint",
                    icon: <span>🗺️</span>,
                  },
                ]}
                activeTab={activeTab}
                onTabChange={setActiveTab}
              />
            </div>

            <div className="min-h-[1000px] overflow-x-hidden">
              <AnimatePresence mode="wait">
                {/* --- Zone 1: The Pulse (Overview) --- */}
                {activeTab === "Pulse" && (
                  <motion.div
                    key="Pulse"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="grid grid-cols-1 lg:grid-cols-3 gap-6"
                  >
                    <div className="flex gap-6">
                      {/* Left Column (2/3): Hero Stats */}
                      <div className="lg:col-span-2 flex flex-col gap-6">
                        <div className="w-[750px]">
                          <AccStatus
                            name={data.profile?.name || "User"}
                            title={data.profile?.headline || ""}
                            image="/images/app/pp.jpg"
                            followers={data.profile?.followers || 0}
                            projects={data.profile?.projects || "0"}
                            target={data.profile?.profileScore || 50}
                          />
                        </div>
                        {/* Bio Analysis Card */}
                        <div className="w-[700px]">
                          <AccBio
                            clarityScore={data.bioAnalysis?.clarityScore || 0}
                            clarityTotal={10}
                            keywordScore={data.bioAnalysis?.keywordScore || 0}
                            keywordTotal={10}
                            tone={data.bioAnalysis?.tone || "Neutral"}
                            strengths={data.bioAnalysis?.strengths || []}
                            weaknesses={data.bioAnalysis?.weaknesses || []}
                            suggestions={data.bioAnalysis?.suggestions || []}
                          />
                        </div>
                      </div>

                      {/* Right Column (1/3): Health & Streaks */}
                      <div className="flex flex-col gap-6 ">
                        <div className="soft-panel p-6 w-[370px]">
                          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                            Content Fitness
                          </h3>

                          <CsiHealthBar score={data.csiScore || 78} />

                          <div className="mt-6">
                            <StreakCounter days={12} />
                          </div>
                        </div>

                        <div className="soft-panel p-6">
                          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                            Quick Fixes
                          </h3>
                          <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scroll pr-2">
                            {data.quickFixes?.map((fix, i) => (
                              <QkFix
                                key={i}
                                headline={fix.headline}
                                description={fix.description}
                                tag={fix.tag}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* --- Zone 2: The Lab (Content Strategy) --- */}
                {activeTab === "Lab" && (
                  <motion.div
                    key="Lab"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="flex flex-col gap-6"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">🔬</span>
                        <h3 className="text-2xl font-bold text-gray-900 tracking-tight">
                          Strategy Lab
                        </h3>
                      </div>
                      <div className="flex gap-2">
                        <span className="px-3 py-1 bg-violet-50 text-violet-700 border border-violet-100 rounded-full text-xs font-bold shadow-sm">
                          AI Powered Analysis
                        </span>
                      </div>
                    </div>

                    {/* Bento Grid Layout - Phase 8 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 auto-rows-fr">
                      {/* 1. Hype Meter (Top Left) - spans 4 cols */}
                      <div className="lg:col-span-4 h-full min-h-[220px]">
                        <div className="h-full bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden p-1">
                          <HypeValueMeter score={data.hypeValueScore} />
                        </div>
                      </div>

                      {/* 2. Content Pillars (Top Right) - spans 8 cols */}
                      <div className="lg:col-span-8 h-full min-h-[220px]">
                        <div className="h-full bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden">
                          <ContentPillars pillars={data.contentPillars} />
                        </div>
                      </div>

                      {/* 3. Engagement Chart (Middle) - spans 8 cols */}
                      <div className="lg:col-span-8 h-full min-h-[300px]">
                        <div className="h-full bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden">
                          <AccEngagment
                            contentMetrics={data.contentMetrics}
                            analysisText={data.textAnalysis}
                          />
                        </div>
                      </div>

                      {/* 4. Radar (Bottom Left) - spans 4 cols */}
                      <div className="lg:col-span-4 h-full">
                        <div className="h-full bg-white rounded-[24px] border border-gray-100 shadow-sm p-4">
                          <ContentGapRadar
                            currentKeywords={data.keywords?.current}
                            missingKeywords={data.keywords?.missing}
                          />
                        </div>
                      </div>

                      {/* 5. Keywords and DNA (Bottom Right) - spans 12 cols for better flow */}
                      <div className="lg:col-span-12 flex flex-col lg:flex-row gap-6">
                        <div className="flex-1">
                          <KeyAcc
                            alignmentTags={data.keywords?.current || []}
                            statusData={statusDataMap}
                          />
                        </div>
                        <div className="flex-1 bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-x-auto">
                          <DeconstructionTable posts={data.postDNA} />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* --- Zone 3: The Crowd (Audience) --- */}
                {activeTab === "Crowd" && (
                  <motion.div
                    key="Crowd"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="flex flex-col gap-6"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">👥</span>
                        <h3 className="text-2xl font-bold text-gray-900 tracking-tight">
                          Audience Intelligence
                        </h3>
                      </div>
                      <div className="flex gap-2">
                        <span className="px-3 py-1 bg-pink-50 text-pink-700 border border-pink-100 rounded-full text-xs font-bold shadow-sm">
                          Deep Dive
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 h-auto">
                      {/* 1. Tribal Map - 7 Cols */}
                      <div className="lg:col-span-7 h-full min-h-[400px]">
                        <div className="h-full bg-white rounded-[24px] border border-gray-100 shadow-sm p-6">
                          <TribalMap tribes={data.tribes} />
                        </div>
                      </div>

                      {/* 2. Shadow Audience - 5 Cols */}
                      <div className="lg:col-span-5 h-full">
                        <div className="h-full bg-white rounded-[24px] border border-gray-100 shadow-sm p-6">
                          <ShadowAudience data={data.shadowAudience} />
                        </div>
                      </div>

                      {/* 3. Schedule & Time - 6 Cols */}
                      <div className="lg:col-span-6 h-full">
                        <div className="h-full bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden">
                          <AccTime
                            scheduleData={data.schedule || []}
                            aiInsight={data.scheduleHighlight || ""}
                          />
                        </div>
                      </div>

                      {/* 4. Persona Cards - 6 Cols */}
                      <div className="lg:col-span-6 h-full">
                        <div className="h-full bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden">
                          <AudiencePersona personas={data.audiencePersonas} />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* --- Zone 4: The Blueprint (Planner) --- */}
                {activeTab === "Blueprint" && (
                  <motion.div
                    key="Blueprint"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="flex flex-col gap-2"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">⚡</span>
                        <h3 className="text-2xl font-bold text-gray-900 tracking-tight">
                          Content Blueprint
                        </h3>
                      </div>
                      <div className="flex gap-2">
                        <span className="px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-full text-xs font-bold shadow-sm">
                          Flow Board
                        </span>
                      </div>
                    </div>
                    <div className="min-h-[600px]">
                      <IdeaPlanner initialIdeas={data.ideaBank} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </Suspense>
      </div>
    </>
  );
}

export default function AnalyzedAccountPage() {
  return <AnalysisContent />;
}
