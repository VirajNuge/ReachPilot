"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

// Component imports
import ContentPillars, {
  PillarData,
} from "../../../components/ContentPillars/ContentPillars";
import AccStatus from "../../../components/AccStatus/page";
import QkFix from "../../../components/AccQkFix/page";
import AccBio from "../../../components/AccBio/AccBio";
import VelocityMeter, {
  VelocityData,
} from "../../../components/VelocityMeter/VelocityMeter";
import PsychTriggers, {
  PsychData,
} from "../../../components/PsychTriggers/PsychTriggers";
import PostFatigue, {
  FatigueData,
} from "../../../components/PostFatigue/PostFatigue";
import CompetitorGap, {
  GapData,
} from "../../../components/CompetitorGap/CompetitorGap";
import ViralRecipe, {
  ViralPostData,
} from "../../../components/ViralRecipe/ViralRecipe";
import VoiceSpectrum, {
  VoiceData,
} from "../../../components/VoiceSpectrum/VoiceSpectrum";
import SentimentMap, {
  CrowdAnalysisData,
} from "../../../components/SentimentMap/SentimentMap";
import ActiveHours, {
  ActiveHourData,
} from "../../../components/ActiveHours/ActiveHours";
import CrowdPersonas, {
  CrowdPersonaData,
} from "../../../components/CrowdPersonas/CrowdPersonas";
import QuestionCloud, {
  KeywordNode,
} from "../../../components/QuestionCloud/QuestionCloud";
import EthicalBribe from "../../../components/EthicalBribe/EthicalBribe";
import CTACommand from "../../../components/CTACommand/CTACommand";
import StackFingerprint from "../../../components/StackFingerprint/StackFingerprint";
import ValueLadder from "../../../components/ValueLadder/ValueLadder";
import GrowthCommand from "../../../components/GrowthCommand/GrowthCommand";
import LoadingScreen from "../../../components/LoadingScreen/LoadingScreen";
import { ErrorState } from "../../../components/ErrorState/ErrorState";
import AnalyzerTabs from "../../../components/Shared/AnalyzerTabs";
import CsiHealthBar from "../../../components/CsiHealthBar/CsiHealthBar";
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

  // Phase 2 Deep Analysis Data
  // Phase 2 Deep Analysis Data
  csiScore?: number;

  // The Lab Data
  contentPillars?: PillarData[];
  velocity?: VelocityData;
  triggers?: PsychData[];
  postFatigue?: FatigueData;
  competitorGap?: GapData;
  viralRecipe?: ViralPostData[];
  voiceSpectrum?: VoiceData;

  // The Crowd Data
  crowdSentiment?: CrowdAnalysisData;
  activeHours?: ActiveHourData[];
  crowdPersonas?: CrowdPersonaData;
  keywordCloud?: KeywordNode[];
}

const MOCK_PILLARS: PillarData[] = [
  {
    name: "Educational",
    percentage: 45,
    count: 22,
    avgEngagement: "4.2%",
    color: "#8b5cf6",
    description: "Tutorials, How-to, Industry News",
    topPosts: [
      {
        id: "1",
        type: "Reel",
        engagementRate: "5.1%",
        captionSnippet: "3 steps to master the algorithm in 2024...",
      },
      {
        id: "2",
        type: "Carousel",
        engagementRate: "4.8%",
        captionSnippet: "The ultimate guide to Next.js routing...",
      },
      {
        id: "3",
        type: "Reel",
        engagementRate: "4.5%",
        captionSnippet: "Stop doing this mistake in your code...",
      },
    ],
  },
  {
    name: "Personal",
    percentage: 25,
    count: 12,
    avgEngagement: "6.1%",
    color: "#ec4899",
    description: "Behind the scenes, Finder stories",
    topPosts: [
      {
        id: "4",
        type: "Image",
        engagementRate: "6.5%",
        captionSnippet: "My workspace setup for 2024!",
      },
    ],
  },
  {
    name: "Promotional",
    percentage: 15,
    count: 7,
    avgEngagement: "2.1%",
    color: "#f59e0b",
    description: "Sales, Launches, Discounts",
    topPosts: [],
  },
  {
    name: "Engagement",
    percentage: 15,
    count: 7,
    avgEngagement: "3.5%",
    color: "#10b981",
    description: "Memes, Polls, Questions",
    topPosts: [],
  },
];

const MOCK_VELOCITY: VelocityData = {
  hookRate: 88,
  category: "Flash",
  velocityGraph: [
    { hour: "1h", engagement: 320 },
    { hour: "2h", engagement: 680 },
    { hour: "4h", engagement: 750 },
    { hour: "12h", engagement: 810 },
    { hour: "24h", engagement: 830 },
  ],
  insight:
    "This competitor uses 'Open Loop' hooks. Their posts get 82% of total engagement in the first 2 hours.",
};

const MOCK_PSYCH: PsychData = {
  radarData: [
    { trigger: "Authority", score: 85, fullMark: 100 },
    { trigger: "Scarcity", score: 30, fullMark: 100 },
    { trigger: "Social Proof", score: 95, fullMark: 100 },
    { trigger: "Reciprocity", score: 60, fullMark: 100 },
    { trigger: "Liking", score: 75, fullMark: 100 },
    { trigger: "Curiosity", score: 50, fullMark: 100 },
  ],
  winningTrigger: "Social Proof",
  insight:
    "This brand leans heavily into Social Proof. Their engagement spikes by 40% when they use testimonials or user results.",
};

const MOCK_FATIGUE: FatigueData = {
  status: "Saturated",
  fatigueScore: 45,
  optimalFrequency: "3-4 posts/week",
  saturationPoint: 5,
  weeklyImpact: [
    { day: "Mon", posts: 1, impactScore: 1.1 },
    { day: "Tue", posts: 0, impactScore: 1.0 },
    { day: "Wed", posts: 2, impactScore: 0.6 },
    { day: "Thu", posts: 1, impactScore: 0.9 },
    { day: "Fri", posts: 1, impactScore: 1.2 },
    { day: "Sat", posts: 0, impactScore: 1.0 },
    { day: "Sun", posts: 1, impactScore: 1.05 },
  ],
};

const MOCK_GAPS: GapData = {
  metrics: [
    {
      category: "Reels",
      profileValue: 75,
      benchmarkValue: 40,
      gapType: "Over-indexed",
    },
    {
      category: "Carousels",
      profileValue: 10,
      benchmarkValue: 35,
      gapType: "Opportunity",
    },
    {
      category: "Static",
      profileValue: 15,
      benchmarkValue: 25,
      gapType: "Opportunity",
    },
  ],
  topOpportunity: "High-Value Carousels",
  insight:
    "This profile posts 75% Reels, but the industry average is only 40%. They are completely missing the 35% 'Carousel' market that drives saves & shares.",
  recommendations: [
    "Repurpose their top Reel into a 'Step-by-Step' Carousel.",
    "Post a 'Industry Update' slide deck on Tuesday (their silent day).",
    "Create a 'Checklist' graphic for their audience to save.",
  ],
};

const MOCK_VIRAL: ViralPostData = {
  id: "outlier-1",
  engagementMultiplier: "5.2x",
  hookType: "Controversial Statement",
  hookText: "Stop using useEffect for data fetching.",
  ingredients: [
    {
      name: "Caption Density",
      value: "Short & Punchy (Under 150 chars)",
      score: 9,
    },
    {
      name: "Emoji Saturation",
      value: "Minimalist (Only 2 emojis)",
      score: 8,
    },
    {
      name: "Visual Sentiment",
      value: "High Contrast / Bold Text",
      score: 9,
    },
  ],
  whyItWorked:
    "This post challenged a common developer habit (Controversy) and offered a simpler alternative immediately, creating a high 'Share' impulse.",
  templateStructure: [
    "HOOK: [Stop doing Common Habit X]",
    "BODY: [Explain why it's bad/slow]",
    "SOLUTION: [Introduce Better Alternative Y]",
    "CTA: [Save this for your next project]",
  ],
};

const MOCK_VOICE: VoiceData = {
  personaName: "The Scholarly Authority",
  axes: [
    { id: "tone", leftLabel: "Professional", rightLabel: "Casual", score: 2 },
    {
      id: "logic",
      leftLabel: "Scientific",
      rightLabel: "Emotional",
      score: 9,
    },
    {
      id: "energy",
      leftLabel: "Minimalist",
      rightLabel: "High-Energy",
      score: 3,
    },
    {
      id: "access",
      leftLabel: "Exclusive",
      rightLabel: "Accessible",
      score: 5,
    },
  ],
  signatureWords: ["Framework", "Analysis", "Deep-dive", "Nuance", "Strategic"],
  insight:
    "This brand wins by being the 'smartest person in the room.' They use a highly Professional and Scientific tone. Opportunity: There is zero 'Relatable' content here.",
};

function AnalysisContent() {
  const searchParams = useSearchParams();
  const link = searchParams.get("link");
  const source = searchParams.get("source");

  const [activeTab, setActiveTab] = useState("Pulse");

  // Default mock data (used as fallback for fields Gemini doesn't return)
  const mockDefaults: AnalysisData = {
    profile: {
      name: "Alex Hormozi Fan",
      headline: "Scaling companies to $100M+ | Acquisition.com",
      followers: 124500,
      projects: "3",
      profileScore: 78,
    },
    quickFixes: [
      {
        headline: "Optimize Headline Keywords",
        description:
          "Add 'SaaS' and 'Founder' to rank for high-value searches.",
        tag: "HIGH IMPACT",
      },
      {
        headline: "Update Featured Section",
        description: "Your top link is broken. Switch to your newsletter.",
        tag: "MEDIUM IMPACT",
      },
    ],
    bioAnalysis: {
      clarityScore: 8,
      keywordScore: 7,
      tone: "Authoritative",
      strengths: ["Clear Value Prop", "Strong Social Proof"],
      weaknesses: ["Missing specific niche keywords"],
      suggestions: ["Add 'Investor' to headline"],
    },
    keywords: {
      current: ["Business", "Scaling", "Money"],
      missing: ["SaaS", "B2B", "Equity"],
    },
    textAnalysis: {
      frequency: "Daily",
      contentMix: "Video Heavy",
      engagement: "High",
    },
    csiScore: 78,
    contentPillars: MOCK_PILLARS,
    velocity: MOCK_VELOCITY,
    triggers: MOCK_PSYCH,
    postFatigue: MOCK_FATIGUE,
    competitorGap: MOCK_GAPS,
    viralRecipe: [MOCK_VIRAL],
    voiceSpectrum: MOCK_VOICE,
  };

  const [data, setData] = useState<AnalysisData>(mockDefaults);
  const [loading, setLoading] = useState(source === "extension");
  const [error, setError] = useState("");

  // Fetch real analysis from extension API when source=extension
  useEffect(() => {
    if (source !== "extension") return;

    async function fetchExtensionAnalysis() {
      try {
        setLoading(true);
        const res = await fetch("/api/analyze-extension");

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Failed to load analysis");
        }

        const result = await res.json();
        const gemini = result.analysis;

        // Merge Gemini data with mock fallbacks for missing fields
        setData({
          profile: gemini.profile || mockDefaults.profile,
          quickFixes: gemini.quickFixes || mockDefaults.quickFixes,
          bioAnalysis: gemini.bioAnalysis || mockDefaults.bioAnalysis,
          keywords: gemini.keywords || mockDefaults.keywords,
          textAnalysis: gemini.textAnalysis || mockDefaults.textAnalysis,
          csiScore: gemini.csiScore ?? mockDefaults.csiScore,
          // Map Gemini contentPillars to PillarData format
          contentPillars: gemini.contentPillars
            ? gemini.contentPillars.map(
                (p: any, i: number) =>
                  ({
                    name: p.topic,
                    percentage: Math.round(100 / gemini.contentPillars.length),
                    count: 0,
                    avgEngagement: p.performance,
                    color: ["#8b5cf6", "#ec4899", "#f59e0b", "#10b981"][i % 4],
                    description: p.performance,
                    topPosts: [],
                  }) as PillarData,
              )
            : MOCK_PILLARS,
          velocity: MOCK_VELOCITY, // Not generated by Gemini
          triggers: MOCK_PSYCH, // Not generated by Gemini
          postFatigue: MOCK_FATIGUE, // Not generated by Gemini
          competitorGap: MOCK_GAPS, // Not generated by Gemini
          viralRecipe: [MOCK_VIRAL], // Not generated by Gemini
          voiceSpectrum: MOCK_VOICE, // Not generated by Gemini
        });
      } catch (err: any) {
        console.error("[Dashboard] Failed to load extension analysis:", err);
        setError(err.message || "Failed to load analysis data");
      } finally {
        setLoading(false);
      }
    }

    fetchExtensionAnalysis();
  }, [source]);

  const handleRetry = () => {
    window.location.reload();
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
                          <VelocityMeter data={MOCK_VELOCITY} />
                        </div>
                      </div>
                      <div className="col-span-12 md:col-span-6 lg:col-span-7 min-h-[380px]">
                        <div className="h-full bg-white rounded-[20px] border border-gray-100 shadow-sm">
                          <PsychTriggers data={MOCK_PSYCH} />
                        </div>
                      </div>
                      <div className="col-span-12 lg:col-span-12 min-h-[380px]">
                        <div className="h-full bg-white rounded-[20px] border border-gray-100 shadow-sm">
                          <ContentPillars
                            pillars={data?.contentPillars || MOCK_PILLARS}
                            aiSummary={
                              data?.contentPillars
                                ? "Analyzed from real data..."
                                : "This profile focuses heavily on 'Authority Building' through tutorials, using personal posts to maintain a human connection."
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
                          <PostFatigue data={MOCK_FATIGUE} />
                        </div>
                      </div>
                      <div className="col-span-12 md:col-span-6 lg:col-span-8 min-h-[360px]">
                        <div className="h-full bg-white rounded-[20px] border border-gray-100 shadow-sm">
                          <CompetitorGap data={MOCK_GAPS} />
                        </div>
                      </div>

                      {/* Row 3: Viral Recipe, Brand Voice */}
                      <div className="col-span-12 lg:col-span-6 min-h-[400px]">
                        <div className="h-full bg-white rounded-[20px] border border-gray-100 shadow-sm">
                          <ViralRecipe data={MOCK_VIRAL} />
                        </div>
                      </div>
                      <div className="col-span-12 lg:col-span-6 min-h-[400px]">
                        <div className="h-full bg-white rounded-[20px] border border-gray-100 shadow-sm">
                          <VoiceSpectrum data={MOCK_VOICE} />
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
                          <SentimentMap />
                        </div>
                      </div>

                      {/* 2. Active Hours (Clock Map) */}
                      <div className="col-span-12 md:col-span-6 lg:col-span-6 min-h-[400px]">
                        <div className="h-full bg-white rounded-[20px] border border-gray-100 shadow-sm">
                          <ActiveHours />
                        </div>
                      </div>

                      {/* Row 2: Top Fan Archetypes */}
                      <div className="col-span-12 lg:col-span-6 min-h-[400px]">
                        <div className="h-full bg-white rounded-[20px] border border-gray-100 shadow-sm">
                          <CrowdPersonas />
                        </div>
                      </div>

                      {/* 2. Headline Keyword Cloud */}
                      <div className="col-span-12 lg:col-span-6 min-h-[400px]">
                        <div className="h-full bg-white rounded-[20px] border border-gray-100 shadow-sm">
                          <QuestionCloud />
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
                        <EthicalBribe />
                      </div>

                      {/* Row 1: CTA Command Center */}
                      <div className="col-span-12 md:col-span-6 lg:col-span-7 min-h-[400px]">
                        <div className="h-full bg-white rounded-[20px] border border-gray-100 shadow-sm">
                          <CTACommand />
                        </div>
                      </div>

                      {/* Row 2: Stack Fingerprinting */}
                      <div className="col-span-12 md:col-span-4 min-h-[300px]">
                        <div className="h-full bg-white rounded-[20px] border border-gray-100 shadow-sm">
                          <StackFingerprint />
                        </div>
                      </div>

                      {/* Row 2: Value Ladder Reconstruction */}
                      <div className="col-span-12 md:col-span-8 min-h-[300px]">
                        <div className="h-full bg-white rounded-[20px] border border-gray-100 shadow-sm">
                          <ValueLadder />
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
