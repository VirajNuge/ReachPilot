"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaCompass,
  FaFlask,
  FaUserFriends,
  FaMap,
  FaRocket,
} from "react-icons/fa";
import dynamic from "next/dynamic";

// Always-needed (tiny, above the fold)
import LoadingScreen from "../../../components/LoadingScreen/LoadingScreen";
import { ErrorState } from "../../../components/ErrorState/ErrorState";
import { AnalyzerTabs } from "../../../components/Shared/AnalyzerTabs";

// Type-only import for ContentPillars named export (dynamic() only carries default export)
import type { PillarData as UI_PillarData } from "../../../components/ContentPillars/ContentPillars";

// Inline skeleton for deferred components
const TabSkeleton = () => (
  <div className="w-full h-48 bg-white rounded-3xl border border-slate-100 animate-pulse" />
);

// --- Pulse tab components ---
const PulseHeader = dynamic(
  () => import("../../../components/Pulse/PulseHeader"),
  { ssr: false }
);
const PulseScore = dynamic(
  () => import("../../../components/Pulse/PulseScore"),
  { ssr: false }
);
const HeartbeatChart = dynamic(
  () => import("../../../components/Pulse/HeartbeatChart"),
  { ssr: false }
);
const EngagementVitalsPanel = dynamic(
  () => import("../../../components/Pulse/EngagementVitals"),
  { ssr: false }
);
const AudienceTemp = dynamic(
  () => import("../../../components/Pulse/AudienceTemp"),
  { ssr: false }
);
const GrowthTrend = dynamic(
  () => import("../../../components/Pulse/GrowthTrend"),
  { ssr: false }
);
const TriageStation = dynamic(
  () => import("../../../components/Pulse/TriageStation"),
  { ssr: false }
);

// --- Lab tab components ---
const VelocityMeter = dynamic(
  () => import("../../../components/VelocityMeter/VelocityMeter"),
  { ssr: false, loading: () => <TabSkeleton /> }
);
const PsychTriggers = dynamic(
  () => import("../../../components/PsychTriggers/PsychTriggers"),
  { ssr: false }
);
const PostFatigue = dynamic(
  () => import("../../../components/PostFatigue/PostFatigue"),
  { ssr: false }
);
const CompetitorGap = dynamic(
  () => import("../../../components/CompetitorGap/CompetitorGap"),
  { ssr: false }
);
const ViralRecipe = dynamic(
  () => import("../../../components/ViralRecipe/ViralRecipe"),
  { ssr: false }
);
const VoiceSpectrum = dynamic(
  () => import("../../../components/VoiceSpectrum/VoiceSpectrum"),
  { ssr: false }
);
const ContentPillars = dynamic(
  () => import("../../../components/ContentPillars/ContentPillars"),
  { ssr: false }
);

// --- Crowd tab components ---
const SentimentMap = dynamic(
  () => import("../../../components/SentimentMap/SentimentMap"),
  { ssr: false, loading: () => <TabSkeleton /> }
);
const ActiveHours = dynamic(
  () => import("../../../components/ActiveHours/ActiveHours"),
  { ssr: false }
);
const CrowdPersonas = dynamic(
  () => import("../../../components/CrowdPersonas/CrowdPersonas"),
  { ssr: false }
);
const QuestionCloud = dynamic(
  () => import("../../../components/QuestionCloud/QuestionCloud"),
  { ssr: false }
);

// --- Blueprint tab components ---
const EthicalBribe = dynamic(
  () => import("../../../components/EthicalBribe/EthicalBribe"),
  { ssr: false, loading: () => <TabSkeleton /> }
);
const CTACommand = dynamic(
  () => import("../../../components/CTACommand/CTACommand"),
  { ssr: false }
);
const StackFingerprint = dynamic(
  () => import("../../../components/StackFingerprint/StackFingerprint"),
  { ssr: false }
);
const ValueLadder = dynamic(
  () => import("../../../components/ValueLadder/ValueLadder"),
  { ssr: false }
);

// --- Growth / misc ---
const GrowthCommand = dynamic(
  () => import("../../../components/GrowthCommand/GrowthCommand"),
  { ssr: false }
);
const OnboardingTour = dynamic(
  () => import("../../../components/OnboardingTour/OnboardingTour"),
  { ssr: false }
);

import "./analyzedAccount.css";

import { useAnalysisData } from "../../../../../../hooks/useAnalysisData";
import { saveAnalysis, getAnalysisById } from "../../../../../../lib/storage";
import { computePulseScore } from "../../../../../../lib/pulseScore";
import { useAuth } from "../../../../../contexts/AuthContext";
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
  const { user } = useAuth();

  // Hook logic
  const {
    data: apiData,
    platform: apiPlatform,
    loading: apiLoading,
    error: apiError,
  } = useAnalysisData();

  // Local state to handle either API data or History data
  const [data, setData] = useState<RawAnalysisData | null>(null);
  const [platform, setPlatform] = useState<string | null>(null);
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
            disruptor: {
              score: 0,
              focus: "N/A",
              schedule: [],
            },
            funnelTactics: [],
            crowdTactics: [],
            pulseHeartbeat: Array(7).fill({
              day: "Mon",
              activityScore: 50,
              postsCount: 1,
              peakHour: "12 PM",
              trend: "Flat",
            }),
            engagementVitals: {
              engagementRate: 2.5,
              benchmarkRate: 2.0,
              reachEfficiency: 80,
              conversationDensity: 12.5,
              amplificationPower: 3.2,
              status: "Healthy",
              insight: "Engagement is 25% above average with strong conversation density.",
            },
            audienceTemperature: {
              tempScore: 75,
              label: "Hot",
              fanboyPercent: 40,
              criticPercent: 5,
              dominantEmotion: "Excited",
              recommendation:
                "Maintain momentum with more community challenges.",
            },
            growthTrajectory: {
              direction: "Up",
              changePercent: 12.5,
              forecast: "On track for +10% growth in 30 days.",
              sparkline: [
                { week: 1, score: 60 },
                { week: 2, score: 65 },
                { week: 3, score: 75 },
                { week: 4, score: 85 },
              ],
            },
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
        const session = getAnalysisById(loadId, user?.id);
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
        setPlatform(apiPlatform ?? null);
        setLoading(false);
        // Auto-save only if it's a fresh analysis (no loadId and no manual data)
        if (!loadId && !manualDataParam) {
          saveAnalysis(apiData, user?.id);
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
  }, [loadId, apiData, apiPlatform, apiLoading, apiError, searchParams]);

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
      <div className="analyzeAccContainer font-sans pb-20 pt-4">
        <Suspense fallback={<LoadingScreen link={link || ""} />}>
          <div className="flex flex-col gap-6">
            {/* Tabs */}
            <div className="flex justify-start mb-2 sticky top-0 z-20 bg-[#f4f8fb]/95 backdrop-blur-sm py-2">
              <AnalyzerTabs
                className="bg-white border-gray-200/60 shadow-sm w-fit"
                tabs={[
                  {
                    id: "Pulse",
                    label: "Pulse Overview",
                    icon: <FaCompass />,
                  },
                  {
                    id: "Lab",
                    label: "The Lab",
                    icon: <FaFlask />,
                  },
                  {
                    id: "Crowd",
                    label: "The Crowd",
                    icon: <FaUserFriends />,
                  },
                  {
                    id: "Blueprint",
                    label: "The Blueprint",
                    icon: <FaMap />,
                  },
                  {
                    id: "Growth",
                    label: "Growth Command",
                    icon: <FaRocket />,
                  },
                ]}
                activeTab={activeTab}
                onTabChange={setActiveTab}
              />
            </div>

            <div className="min-h-screen overflow-x-hidden">
              <AnimatePresence mode="wait">
                {/* --- Zone 1: The Pulse (Overview) --- */}
                {activeTab === "Pulse" && (
                  <motion.div
                    key="Pulse"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  >
                    {/* Header Summary */}
                    <PulseHeader
                      profile={data.profile}
                      profileScore={computePulseScore(data).totalScore}
                    />

                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                      {/* Left Column (Wide) - 2/3 width */}
                      <div className="xl:col-span-2 flex flex-col gap-6">
                        {/* Engagement Vitals - Top row stats */}
                        <EngagementVitalsPanel
                          data={data.engagementVitals}
                          platform={platform ?? undefined}
                        />

                        {/* Heartbeat Chart - Main wide chart */}
                        <HeartbeatChart data={data.pulseHeartbeat} />

                        {/* Audience Temp - Wide 3-col breakdown */}
                        <AudienceTemp data={data.audienceTemperature} />

                        {/* Growth Trend - Bottom chart */}
                        <div className="min-h-[200px]">
                          <GrowthTrend data={data.growthTrajectory} followers={data.profile.followers} />
                        </div>
                      </div>

                      {/* Right Column (Narrow) - 1/3 width */}
                      <div className="flex flex-col gap-6">
                        {/* Pulse Score - Vertical rating card */}
                        <PulseScore data={data} />

                        {/* Triage Station - Vertical list */}
                        <div className="flex-1 min-h-[300px]">
                          <TriageStation fixes={data.quickFixes} />
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
                    {/* --- Dashboard Grid Layout (12 Columns) --- */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-6">
                      {/* Row 1: Engagement Velocity, Psych Triggers */}
                      <div className="xl:col-span-5 flex flex-col">
                        {data.velocity ? (
                          <VelocityMeter data={data.velocity as any} />
                        ) : (
                          <div className="p-4 text-center text-gray-400 bg-white rounded-3xl border border-slate-100 flex-1 flex items-center justify-center">
                            No Velocity Data
                          </div>
                        )}
                      </div>
                      <div className="xl:col-span-7 flex flex-col">
                        {data.psychTriggers ? (
                          <PsychTriggers data={data.psychTriggers} />
                        ) : (
                          <div className="p-4 text-center text-gray-400 bg-white rounded-3xl border border-slate-100 flex-1 flex items-center justify-center">
                            No Psych Data
                          </div>
                        )}
                      </div>

                      {/* Content Pillars (Full width) */}
                      <div className="xl:col-span-12 flex flex-col">
                        <ContentPillars
                          pillars={mapPillars(data.contentPillars)}
                          aiSummary={
                            data.pillarInsight || "Analyzing pillars..."
                          }
                          onGenerateFormula={undefined}
                        />
                      </div>

                      {/* Row 2: Post Fatigue, Content Gap */}
                      <div className="xl:col-span-4 flex flex-col">
                        {data.postFatigue ? (
                          <PostFatigue
                            data={data.postFatigue as any}
                            pulseHeartbeat={data.pulseHeartbeat}
                          />
                        ) : (
                          <div className="p-4 text-center text-gray-400 bg-white rounded-3xl border border-slate-100 flex-1 flex items-center justify-center">
                            No Fatigue Data
                          </div>
                        )}
                      </div>
                      <div className="xl:col-span-8 flex flex-col">
                        {data.competitorGap ? (
                          <CompetitorGap data={data.competitorGap as any} />
                        ) : (
                          <div className="p-4 text-center text-gray-400 bg-white rounded-3xl border border-slate-100 flex-1 flex items-center justify-center">
                            No Competitor Data
                          </div>
                        )}
                      </div>

                      {/* Row 3: Viral Recipe, Brand Voice */}
                      <div className="xl:col-span-6 flex flex-col">
                        {data.viralRecipe && data.viralRecipe.length > 0 ? (
                          <ViralRecipe recipes={data.viralRecipe} />
                        ) : (
                          <div className="p-4 text-center text-gray-400 bg-white rounded-3xl border border-slate-100 flex-1 flex items-center justify-center">
                            No Viral Recipe
                          </div>
                        )}
                      </div>
                      <div className="xl:col-span-6 flex flex-col">
                        {data.voiceSpectrum ? (
                          <VoiceSpectrum data={data.voiceSpectrum} />
                        ) : (
                          <div className="p-4 text-center text-gray-400 bg-white rounded-3xl border border-slate-100 flex-1 flex items-center justify-center">
                            No Voice Data
                          </div>
                        )}
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
                    {/* Placeholder for future content */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-6">
                      {/* 1. Sentiment Map (Vibe Decoder) */}
                      <div className="xl:col-span-6 flex flex-col">
                        {data.crowdSentiment ? (
                          <SentimentMap data={data.crowdSentiment as any} />
                        ) : (
                          <div className="p-4 text-center text-gray-400 bg-white rounded-3xl border border-slate-100 flex-1 flex items-center justify-center">
                            No Sentiment Data
                          </div>
                        )}
                      </div>

                      {/* 2. Active Hours (Clock Map) */}
                      <div className="xl:col-span-6 flex flex-col">
                        {data.activeHours ? (
                          <ActiveHours data={data.activeHours as any} />
                        ) : (
                          <div className="p-4 text-center text-gray-400 bg-white rounded-3xl border border-slate-100 flex-1 flex items-center justify-center">
                            No Active Hours Data
                          </div>
                        )}
                      </div>

                      {/* Row 2: Top Fan Archetypes */}
                      <div className="xl:col-span-5 flex flex-col">
                        {/* Crowd Personas Component */}
                        {data.crowdPersonas ? (
                          <CrowdPersonas data={data.crowdPersonas} />
                        ) : (
                          <div className="p-4 text-center text-gray-400 bg-white rounded-3xl border border-slate-100 flex-1 flex items-center justify-center">
                            No Persona Data
                          </div>
                        )}
                      </div>

                      {/* 2. Headline Keyword Cloud */}
                      <div className="xl:col-span-7 flex flex-col">
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
                          <div className="p-4 text-center text-gray-400 bg-white rounded-3xl border border-slate-100 flex-1 flex items-center justify-center">
                            No Question Data
                          </div>
                        )}
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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
                      {/* Row 1: Ethical Bribe (Lead Magnet) */}
                      <div className="col-span-1 lg:col-span-5 flex flex-col">
                        {data.leadMagnet ? (
                          <EthicalBribe data={data.leadMagnet} />
                        ) : (
                          <div className="p-4 text-center">
                            No Lead Magnet Data
                          </div>
                        )}
                      </div>

                      {/* Row 1: CTA Command Center */}
                      <div className="col-span-1 lg:col-span-7 flex flex-col">
                        {data.ctaAnalysis ? (
                          <CTACommand data={data.ctaAnalysis} />
                        ) : (
                          <div className="p-4 text-center">No CTA Data</div>
                        )}
                      </div>

                      {/* Row 2: Stack Fingerprinting */}
                      <div className="col-span-1 lg:col-span-4 flex flex-col">
                        {data.techStack ? (
                          <StackFingerprint data={data.techStack} />
                        ) : (
                          <div className="p-4 text-center">
                            No Tech Stack Data
                          </div>
                        )}
                      </div>

                      {/* Row 2: Value Ladder Reconstruction */}
                      <div className="col-span-1 lg:col-span-8 flex flex-col">
                        {data.valueLadder ? (
                          <ValueLadder data={data.valueLadder} />
                        ) : (
                          <div className="p-4 text-center">
                            No Value Ladder Data
                          </div>
                        )}
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
                    <div>
                      <div>
                        <GrowthCommand
                          growthTasks={data.growthTasks}
                          disruptor={data.disruptor}
                          funnelTactics={data.funnelTactics}
                          crowdTactics={data.crowdTactics}
                        />
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
