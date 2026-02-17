"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

// Component imports
import AccStatus from "../../../components/AccStatus/page";
import QkFix from "../../../components/AccQkFix/page";
import AccBio from "../../../components/AccBio/AccBio";
import VelocityMeter from "../../../components/VelocityMeter/VelocityMeter";
import PsychTriggers from "../../../components/PsychTriggers/PsychTriggers";
import PostFatigue from "../../../components/PostFatigue/PostFatigue";
import CompetitorGap from "../../../components/CompetitorGap/CompetitorGap";
import ViralRecipe from "../../../components/ViralRecipe/ViralRecipe";
import VoiceSpectrum from "../../../components/VoiceSpectrum/VoiceSpectrum";
import SentimentMap from "../../../components/SentimentMap/SentimentMap";
import ActiveHours from "../../../components/ActiveHours/ActiveHours";
import CrowdPersonas from "../../../components/CrowdPersonas/CrowdPersonas";
import QuestionCloud from "../../../components/QuestionCloud/QuestionCloud";
import EthicalBribe from "../../../components/EthicalBribe/EthicalBribe";
import CTACommand from "../../../components/CTACommand/CTACommand";
import StackFingerprint from "../../../components/StackFingerprint/StackFingerprint";
import ValueLadder from "../../../components/ValueLadder/ValueLadder";
import GrowthCommand from "../../../components/GrowthCommand/GrowthCommand";
import LoadingScreen from "../../../components/LoadingScreen/LoadingScreen";
import { ErrorState } from "../../../components/ErrorState/ErrorState";
import { AnalyzerTabs } from "../../../components/Shared/AnalyzerTabs";
import CsiHealthBar from "../../../components/CsiHealthBar/CsiHealthBar";
import StreakCounter from "../../../components/StreakCounter/StreakCounter";
import OnboardingTour from "../../../components/OnboardingTour/OnboardingTour";
import HypeValueMeter from "../../../components/HypeValueMeter/HypeValueMeter";

import "./analyzedAccount.css";

import { useAnalysisData } from "../../../../../../hooks/useAnalysisData";
import { saveAnalysis, getAnalysisById } from "../../../../../../lib/storage";
import {
  RawAnalysisData,
  VelocityData,
  PsychData,
  FatigueData,
  CompetitorData,
  ViralPostData,
  VoiceData,
  CrowdAnalysisData,
  ActiveHourData,
  CrowdPersonaData,
  KeywordNode,
  PillarData as ApiPillarData,
  LeadMagnetData,
  CTAData,
  TechStackData,
} from "../../../../../../lib/types/analysis";

// ... existing component imports ...
import ContentPillars, {
  PillarData as UI_PillarData,
} from "../../../components/ContentPillars/ContentPillars";

const MOCK_PILLARS: UI_PillarData[] = [
  {
    name: "Educational",
    percentage: 45,
    count: 22,
    avgEngagement: "4.2%",
    color: "#8b5cf6",
    description: "Tutorials, How-to, Industry News",
    topPosts: [],
  },
  {
    name: "Personal",
    percentage: 25,
    count: 12,
    avgEngagement: "6.1%",
    color: "#ec4899",
    description: "Behind the scenes",
    topPosts: [],
  },
  {
    name: "Promotional",
    percentage: 15,
    count: 7,
    avgEngagement: "2.1%",
    color: "#f59e0b",
    description: "Sales, Launches",
    topPosts: [],
  },
  {
    name: "Engagement",
    percentage: 15,
    count: 7,
    avgEngagement: "3.5%",
    color: "#10b981",
    description: "Memes, Polls",
    topPosts: [],
  },
];

function AnalysisContent() {
  const [activeTab, setActiveTab] = useState("Pulse");
  const searchParams = useSearchParams();
  const loadId = searchParams.get("loadId");
  const link = searchParams.get("link"); // existing

  // Hook logic
  const {
    data: apiData,
    loading: apiLoading,
    error: apiError,
  } = useAnalysisData();

  // Local state to handle either API data or History data
  const [data, setData] = useState<RawAnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      const manualDataParam = searchParams.get("data");
      const sourceParam = searchParams.get("source");

      // 1. Load from Manual Entry (LocalStorage or URL)
      let manualData: any = null;

      if (sourceParam === "manual_storage") {
        if (typeof window !== "undefined") {
          const stored = localStorage.getItem("reachpilot_manual_data");
          if (stored) {
            try {
              manualData = JSON.parse(stored);
              // Optional: Clear after use if you don't want persistence on reload
              // localStorage.removeItem("reachpilot_manual_data");
            } catch (e) {
              console.error("Failed to parse local storage data", e);
            }
          }
        }
      } else if (manualDataParam) {
        // Fallback for old URL method
        try {
          manualData = JSON.parse(decodeURIComponent(manualDataParam));
        } catch (e) {
          console.error("Failed to parse manual data param", e);
        }
      }

      if (manualData) {
        try {
          console.log("Loading manual data:", manualData);

          // Construct RawAnalysisData from Manual Data
          // We need to fill in all the required fields of RawAnalysisData with defaults or derived values
          const generatedData: RawAnalysisData = {
            profile: {
              name: manualData.name || "Unknown User",
              headline:
                manualData.username || manualData.bio?.slice(0, 50) || "",
              followers: manualData.followers || 0,
              projects: "0", // Default
              profileScore: 50, // Default score
            },
            quickFixes: [
              {
                headline: "Complete your profile",
                description: "Add more details to get a full analysis.",
                tag: "HIGH IMPACT",
              },
            ],
            bioAnalysis: {
              clarityScore: 7,
              keywordScore: 6,
              tone: "Neutral",
              strengths: ["Clean layout"],
              weaknesses: ["Missing keywords"],
              suggestions: ["Add industry keywords"],
            },
            keywords: {
              current: manualData.bio
                ? manualData.bio.split(" ").slice(0, 5)
                : [],
              missing: ["Strategy", "Growth"],
            },
            textAnalysis: {
              frequency: "Medium",
              contentMix: "Varied",
              engagement: "Average",
            },
            contentMetrics: {
              frequencyScore: 60,
              contentMixScore: 70,
              engagementScore: 50,
            },
            schedule: [],
            scheduleHighlight: "Consistency is key.",
            csiScore: 65,
            contentPillars: [], // Will use mock fallback
            pillarInsight: "Start posting to see your pillars.",
            velocity: {
              hookRate: 0,
              category: "Growth",
              velocityGraph: [],
              insight: "Not enough data for velocity.",
            },
            psychTriggers: {
              radarData: [],
              winningTrigger: "N/A",
              insight: "N/A",
            },
            postFatigue: {
              status: "Healthy",
              fatigueScore: 10,
              optimalFrequency: "Daily",
              saturationPoint: 3,
              weeklyImpact: [],
            },
            competitorGap: {
              metrics: [],
              topOpportunity: "N/A",
              insight: "N/A",
              recommendations: [],
            },
            viralRecipe: [],
            voiceSpectrum: {
              personaName: "Observer",
              axes: [],
              signatureWords: [],
              insight: "N/A",
            },
            audiencePersonas: [],
            hypeValueScore: { hype: 50, value: 50 },
            ideaBank: [],
            postDNA: [],
            tribes: [],
            shadowAudience: {
              lurkersPercent: 90,
              engagersPercent: 10,
              insight: "Typical distribution.",
            },
            crowdSentiment: {
              totalComments: 100,
              vibeScore: 7.5,
              vibes: [],
              sentimentTrend: [],
            },
            questionCloud: [],
            activeHours: [],
            leadMagnet: {
              type: "Checklist",
              title: "Ultimate Guide",
              hook: "Get started fast",
              friction: "Low",
              temp: "Cold",
              suggestion: "Create a video course",
              whyItWorks: "Low barrier relative to high value",
            },
            ctaAnalysis: {
              mix: [
                { type: "Engagement", score: 40, fullMark: 100 },
                { type: "Bridge", score: 30, fullMark: 100 },
                { type: "Conversion", score: 50, fullMark: 100 },
                { type: "Conversation", score: 60, fullMark: 100 },
              ],
              topTrigger: { keyword: "Link in bio", count: 10 },
              urgencyScore: 50,
              dominantStyle: "Community Builder",
              placementHeatmap: [
                { location: "First Line", count: 2 },
                { location: "Bottom", count: 25 },
                { location: "P.S.", count: 3 },
              ],
            },
            techStack: {
              tools: [
                { category: "Hosting", name: "Vercel", confidence: "High" },
                { category: "Frontend", name: "Next.js", confidence: "High" },
              ],
              businessClass: "SaaS / Agency",
              verdict:
                "Professional setup utilizing modern JAMstack architecture.",
            },
            crowdPersonas: {
              primaryArchetype: {
                id: "1",
                role: "The Generic User",
                iconName: "UserTie",
                color: "#9ca3af",
                bio: "General audience member.",
                percentage: 100,
                triggers: [],
                painPoints: [],
              },
              secondaryArchetypes: [],
              insight: {
                title: "Audience Analysis",
                description: "Not enough data to segment audience.",
                actionable: "Post more to gather data.",
              },
            },
            valueLadder: {
              products: {
                Bait: {
                  name: "Free Checklist",
                  price: "Free",
                  type: "PDF",
                  intensity: "Low",
                },
                Core: {
                  name: "Masterclass",
                  price: "$197",
                  type: "Course",
                  intensity: "Medium",
                },
              },
              gap: "Missing Tripwire",
              insight:
                "Big jump from Free to $197. Add a low-ticket offer to increase conversion.",
            },
            growthTasks: [
              {
                id: "1",
                title: "Add 'Lead Magnet' Link",
                category: "Quick Win",
                impact: 9,
                effort: 2,
                type: "Funnel",
                status: "Pending",
                reasoning:
                  "Competitor has no lead magnet. You can capture 20% more leads instantly.",
                actionType: "Tech",
              },
              {
                id: "2",
                title: "Launch 'React Patterns' Series",
                category: "Big Bet",
                impact: 9,
                effort: 8,
                type: "Content",
                status: "Pending",
                reasoning:
                  "High demand in 'The Crowd' for advanced tutorials. Will drive authority.",
                actionType: "Content",
              },
            ],
          };

          setData(generatedData);
          setLoading(false);
          return;
        } catch (e) {
          console.error("Failed to process manual data", e);
        }
      }

      // 2. Load from History if ID present
      if (loadId) {
        console.log("Loading from history:", loadId);
        const session = getAnalysisById(loadId);
        if (session) {
          setData(session.data);
          setLoading(false);
          return;
        } else {
          // Fallback to API if not found (or show error)
          console.warn("History session not found, falling back to API");
        }
      }

      // 3. Load from API (standard flow)
      if (apiData) {
        setData(apiData);
        setLoading(false);
        // Auto-save only if it's a fresh analysis (no loadId and no manual data)
        if (!loadId && !manualDataParam) {
          saveAnalysis(apiData);
        }
      } else if (apiError) {
        setError(apiError);
        setLoading(false);
      } else if (!apiLoading && !apiData) {
        // Waiting for hook... works because apiLoading is true initially in hook
        // But here apiData might be null initially.
        // Effectively, just sync with hook state
      }
    };

    fetchData();
  }, [loadId, apiData, apiLoading, apiError, searchParams]);

  // Sync loading state more directly
  useEffect(() => {
    if (!loadId) {
      setLoading(apiLoading);
    }
  }, [apiLoading, loadId]);

  if (error) {
    return (
      <ErrorState message={error} onRetry={() => window.location.reload()} />
    );
  }

  if (loading || !data) {
    return <LoadingScreen link={link || "profile"} />;
  }

  // Helper to map API pillar data to UI pillar data
  const mapPillars = (apiPillars?: ApiPillarData[]): UI_PillarData[] => {
    if (!apiPillars || apiPillars.length === 0) return MOCK_PILLARS;
    return apiPillars.map((p, i) => ({
      name: p.name,
      percentage: p.percentage > 1 ? p.percentage : p.percentage * 100, // Handle both 0.45 and 45
      count: p.count,
      avgEngagement: p.avgEngagement,
      color:
        p.color ||
        ["#8b5cf6", "#ec4899", "#f59e0b", "#10b981"][i % 4] ||
        "#8b5cf6",
      description: p.description,
      topPosts: p.topPosts.map((post) => ({
        id: post.id,
        type: post.type as any,
        engagementRate: post.engagementRate,
        captionSnippet: post.captionSnippet,
        thumbnail: post.thumbnail,
      })),
    }));
  };

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
      <div className="analyzeAccContainer font-sans pb-20 pt-0">
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
                    label: "The Blueprint",
                    icon: <span>🗺️</span>,
                  },
                  {
                    id: "Growth",
                    label: "Growth Command",
                    icon: <span>🚀</span>,
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
                            title={
                              data.profile?.bio || data.profile?.headline || ""
                            }
                            image={data.profile?.pfp || "/images/app/pp.jpg"}
                            followers={data.profile?.followers || 0}
                            following={data.profile?.followingCount}
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

                          <div className="mt-6 border-t border-gray-100 pt-6">
                            <HypeValueMeter score={data.hypeValueScore} />
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
                    {/* Lab Header */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">🔬</span>
                        <h3 className="text-2xl font-bold text-gray-900 tracking-tight">
                          Strategy Lab
                        </h3>
                      </div>
                      <div className="flex gap-2">
                        <span className="px-3 py-1 bg-violet-50 text-violet-700 border border-violet-100 rounded-full text-xs font-bold shadow-sm">
                          Deep Dive
                        </span>
                      </div>
                    </div>

                    {/* --- Dashboard Grid Layout (12 Columns) --- */}
                    <div className="grid grid-cols-12 gap-5">
                      {/* Row 1: Engagement Velocity, Psych Triggers, Content Pillars */}
                      <div className="col-span-12 md:col-span-6 lg:col-span-5 min-h-[380px]">
                        <div className="h-full bg-white rounded-[20px] border border-gray-100 shadow-sm">
                          {data.velocity ? (
                            <VelocityMeter data={data.velocity as any} />
                          ) : (
                            <div className="p-4 text-center text-gray-400">
                              No Velocity Data
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="col-span-12 md:col-span-6 lg:col-span-7 min-h-[380px]">
                        <div className="h-full bg-white rounded-[20px] border border-gray-100 shadow-sm">
                          {data.psychTriggers ? (
                            <PsychTriggers data={data.psychTriggers} />
                          ) : (
                            <div className="p-4 text-center text-gray-400">
                              No Psych Data
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="col-span-12 lg:col-span-12 min-h-[380px]">
                        <div className="h-full bg-white rounded-[20px] border border-gray-100 shadow-sm">
                          <ContentPillars
                            pillars={mapPillars(data.contentPillars)}
                            aiSummary={
                              data.pillarInsight || "Analyzing pillars..."
                            }
                            onGenerateFormula={() =>
                              alert("Creating your custom formula...")
                            }
                          />
                        </div>
                      </div>

                      {/* Row 2: Post Fatigue, Content Gap */}
                      <div className="col-span-12 md:col-span-6 lg:col-span-4 min-h-[360px]">
                        <div className="h-full bg-white rounded-[20px] border border-gray-100 shadow-sm">
                          {data.postFatigue ? (
                            <PostFatigue data={data.postFatigue as any} />
                          ) : (
                            <div className="p-4 text-center text-gray-400">
                              No Fatigue Data
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="col-span-12 md:col-span-6 lg:col-span-8 min-h-[360px]">
                        <div className="h-full bg-white rounded-[20px] border border-gray-100 shadow-sm">
                          {data.competitorGap ? (
                            <CompetitorGap data={data.competitorGap as any} />
                          ) : (
                            <div className="p-4 text-center text-gray-400">
                              No Competitor Data
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Row 3: Viral Recipe, Brand Voice */}
                      <div className="col-span-12 lg:col-span-6 min-h-[400px]">
                        <div className="h-full bg-white rounded-[20px] border border-gray-100 shadow-sm">
                          {data.viralRecipe && data.viralRecipe.length > 0 ? (
                            <ViralRecipe data={data.viralRecipe[0]} />
                          ) : (
                            <div className="p-4 text-center text-gray-400">
                              No Viral Recipe
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="col-span-12 lg:col-span-6 min-h-[400px]">
                        <div className="h-full bg-white rounded-[20px] border border-gray-100 shadow-sm">
                          {data.voiceSpectrum ? (
                            <VoiceSpectrum data={data.voiceSpectrum} />
                          ) : (
                            <div className="p-4 text-center text-gray-400">
                              No Voice Data
                            </div>
                          )}
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

                    {/* Placeholder for future content */}
                    {/* --- Crowd Grid Layout (12 Columns) --- */}
                    <div className="grid grid-cols-12 gap-5">
                      {/* 1. Sentiment Map (Vibe Decoder) */}
                      <div className="col-span-12 md:col-span-6 lg:col-span-6 min-h-[400px]">
                        <div className="h-full bg-white rounded-[20px] border border-gray-100 shadow-sm">
                          {data.crowdSentiment ? (
                            <SentimentMap data={data.crowdSentiment as any} />
                          ) : (
                            <div className="p-4 text-center">
                              No Sentiment Data
                            </div>
                          )}
                        </div>
                      </div>

                      {/* 2. Active Hours (Clock Map) */}
                      <div className="col-span-12 md:col-span-6 lg:col-span-6 min-h-[400px]">
                        <div className="h-full bg-white rounded-[20px] border border-gray-100 shadow-sm">
                          {data.activeHours ? (
                            <ActiveHours data={data.activeHours as any} />
                          ) : (
                            <div className="p-4 text-center">
                              No Active Hours Data
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Row 2: Top Fan Archetypes */}
                      <div className="col-span-12 lg:col-span-6 min-h-[400px]">
                        <div className="h-full bg-white rounded-[20px] border border-gray-100 shadow-sm">
                          {/* Crowd Personas Component */}
                          {data.crowdPersonas ? (
                            <CrowdPersonas data={data.crowdPersonas} />
                          ) : (
                            <div className="p-4 text-center">
                              No Persona Data
                            </div>
                          )}
                        </div>
                      </div>

                      {/* 2. Headline Keyword Cloud */}
                      <div className="col-span-12 lg:col-span-6 min-h-[400px]">
                        <div className="h-full bg-white rounded-[20px] border border-gray-100 shadow-sm">
                          {data.questionCloud ? (
                            <QuestionCloud
                              data={data.questionCloud.map((q) => ({
                                id: q.id || Math.random().toString(),
                                word: q.word || (q as any).text || "Question",
                                count: q.count || (q as any).frequency || 0,
                                engagement: q.engagement || 0,
                                intent: q.intent || "Educational",
                                sampleQuestions: q.sampleQuestions || [],
                              }))}
                            />
                          ) : (
                            <div className="p-4 text-center">
                              No Question Data
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
                {/* --- Zone 4: The Blueprint (Action Plan) --- */}
                {activeTab === "Blueprint" && (
                  <motion.div
                    key="Blueprint"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="flex flex-col gap-6"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">🗺️</span>
                        <h3 className="text-2xl font-bold text-gray-900 tracking-tight">
                          The Blueprint
                        </h3>
                      </div>
                      <div className="flex gap-2">
                        <span className="px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-full text-xs font-bold shadow-sm">
                          Strategic Roadmap
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-12 gap-5">
                      {/* Row 1: Ethical Bribe (Lead Magnet) */}
                      <div className="col-span-12 md:col-span-6 lg:col-span-5 min-h-[400px]">
                        {data.leadMagnet ? (
                          <EthicalBribe data={data.leadMagnet} />
                        ) : (
                          <div className="p-4 text-center">
                            No Lead Magnet Data
                          </div>
                        )}
                      </div>

                      {/* Row 1: CTA Command Center */}
                      <div className="col-span-12 md:col-span-6 lg:col-span-7 min-h-[400px]">
                        <div className="h-full bg-white rounded-[20px] border border-gray-100 shadow-sm">
                          {data.ctaAnalysis ? (
                            <CTACommand data={data.ctaAnalysis} />
                          ) : (
                            <div className="p-4 text-center">No CTA Data</div>
                          )}
                        </div>
                      </div>

                      {/* Row 2: Stack Fingerprinting */}
                      <div className="col-span-12 md:col-span-4 min-h-[300px]">
                        <div className="h-full bg-white rounded-[20px] border border-gray-100 shadow-sm">
                          {data.techStack ? (
                            <StackFingerprint data={data.techStack} />
                          ) : (
                            <div className="p-4 text-center">
                              No Tech Stack Data
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Row 2: Value Ladder Reconstruction */}
                      <div className="col-span-12 md:col-span-8 min-h-[300px]">
                        <div className="h-full bg-white rounded-[20px] border border-gray-100 shadow-sm">
                          {data.valueLadder ? (
                            <ValueLadder data={data.valueLadder} />
                          ) : (
                            <div className="p-4 text-center">
                              No Value Ladder Data
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
                {/* --- Zone 5: Growth Command (Simulation & Execution) --- */}
                {activeTab === "Growth" && (
                  <motion.div
                    key="Growth"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="flex flex-col gap-6"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">🚀</span>
                        <h3 className="text-2xl font-bold text-gray-900 tracking-tight">
                          Growth Command
                        </h3>
                      </div>
                      <div className="flex gap-2">
                        <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full text-xs font-bold shadow-sm">
                          Simulation & Execution
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-12 gap-5">
                      <div className="col-span-12 min-h-[400px]">
                        <GrowthCommand />
                      </div>
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
