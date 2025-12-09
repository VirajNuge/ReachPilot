"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

// Adjust these imports to match your folder structure exactly
import TopMenu from "../../../components/topMenu/topMenu";
import AccStatus from "../../../components/AccStatus/page";
import QkFix from "../../../components/AccQkFix/page";
import AccBio from "../../../components/AccBio/AccBio";
import KeyAcc from "../../../components/KeyAcc/KeyAcc";
import AccEngagment from "../../../components/AccEngagement/AccEngagment";
import AccTime from "../../../components/AccTime/AccTime";
import "./analyzedAccount.css";
import LoadingScreen from "../../../components/LoadingScreen/LoadingScreen";

interface AnalysisData {
  profile: {
    name: string;
    headline: string;
    followers: number;
    projects: string;
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
}

function AnalysisContent() {
  const searchParams = useSearchParams();
  const link = searchParams.get("link");

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

        const result = await res.json();
        setData(result);
      } catch (err) {
        console.error(err);
        setError("Analysis Failed. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [link]);

  if (loading) {
    return <LoadingScreen link={link || ""} />;
  }

  if (error || !data) {
    return <div className="p-10 text-center text-red-500">{error}</div>;
  }

  // --- SAFE MAPPING WITH OPTIONAL CHAINING ---
  const statusDataMap = {
    current: {
      label: "Current Skills:",
      keywords: data.keywords?.current?.join(", ") || "N/A", // CRITICAL FIX
      color: { bg: "bg-[#DFFFC7]", text: "text-[#208800]" },
    },
    missing: {
      label: "Needs Improvement:",
      keywords: data.keywords?.missing?.join(", ") || "N/A", // CRITICAL FIX
      color: { bg: "bg-[#FFC7C7]", text: "text-[#D90000]" },
    },
  };

  const chartDataMap = [
    { name: "Frequency", value: 75, max: 100 },
    { name: "Engagement", value: 60, max: 100 },
  ];

  return (
    <>
      <TopMenu
        pageName="Profile Analyzer"
        userName={data.profile?.name}
        userTier="Free Tier"
        tokens={1950}
      />

      <div className="analyzeAccContainer flex gap-[10px] mt-[10px]">
        <div className="analyzeLeft">
          <AccStatus
            name={data.profile?.name || "User"}
            title={data.profile?.headline || ""}
            image="/images/app/pp.jpg"
            followers={data.profile?.followers || 0}
            projects={data.profile?.projects || "0"}
            target={(data.bioAnalysis?.clarityScore || 0) * 10}
          />
          <div className="QkFixContainer">
            <h3 className="font-[500] mb-[12px]">Quick Fixes</h3>
            <div className="custom-scroll">
              {data.quickFixes?.map((fix, index) => (
                <QkFix
                  key={index}
                  headline={fix.headline}
                  description={fix.description}
                  tag={fix.tag}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="analyzeRight bg-[#f9f9f9] w-max h-max rounded-[12px] p-[12px] flex gap-[12px]">
          <div className="PAna-Container-Left">
            <AccBio
              clarityScore={data.bioAnalysis?.clarityScore || 0}
              clarityTotal={10}
              keywordScore={data.bioAnalysis?.keywordScore || 0}
              keywordTotal={10}
              tone={data.bioAnalysis?.tone || "Neutral"}
              strengths={data.bioAnalysis?.strengths || []}
              weaknesses={data.bioAnalysis?.weaknesses || []}
              suggestions={data.bioAnalysis?.suggestions || []}
              onRewriteWithAI={() => console.log("Rewrite")}
            />
            <KeyAcc
              alignmentTags={data.keywords?.current || []}
              statusData={statusDataMap}
            />
          </div>

          <div className="PAna-Container-Right">
            <AccEngagment
              chartData={chartDataMap}
              analysisText={data.textAnalysis}
            />
            <AccTime
              scheduleData={data.schedule || []}
              aiInsight={data.scheduleHighlight || ""}
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default function AnalyzedAccountPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AnalysisContent />
    </Suspense>
  );
}
