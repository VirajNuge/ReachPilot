"use client";
import React from "react";
import "./analyzedAccount.css";
import TopMenu from "../../../components/topMenu/topMenu";
import AccStatus from "../../../components/AccStatus/page";
import QkFix from "../../../components/AccQkFix/page";
import AccBio from "../../../components/AccBio/AccBio";
import KeyAcc from "../../../components/KeyAcc/KeyAcc";
import AccEngagment from "../../../components/AccEngagement/AccEngagment";
import AccTime from "../../../components/AccTime/AccTime";

const quickFixes = [
  {
    headline: "Headline",
    description:
      "Your headline doesn’t include industry keywords. Add terms like ‘AI SaaS Growth’.",
    tag: "HIGH IMPACT",
  },
  {
    headline: "About Section",
    description: "Add measurable results or metrics to show real impact.",
    tag: "MEDIUM IMPACT",
  },
  {
    headline: "Profile Photo",
    description: "Use a clear, professional headshot with good lighting.",
    tag: "LOW IMPACT",
  },
  {
    headline: "Experience Details",
    description:
      "Include your key achievements with action verbs and measurable outcomes.",
    tag: "HIGH IMPACT",
  },
  {
    headline: "Skills Section",
    description:
      "Reorder skills by relevance and remove duplicates to highlight core strengths.",
    tag: "MEDIUM IMPACT",
  },
  {
    headline: "Featured Section",
    description:
      "Add projects, links, or case studies to showcase your best work visually.",
    tag: "HIGH IMPACT",
  },
  {
    headline: "Engagement",
    description:
      "Engage with posts weekly to increase visibility and algorithm reach.",
    tag: "LOW IMPACT",
  },
];

const myTags: string[] = [
  "Digital Marketing",
  "SaaS",
  "Customer Success",
  "Retention",
  "SEO",
  "Digital Marketing",
  "SaaS",
  "Customer Success",
  "Retention",
  "SEO",
  "Digital Marketing",
  "SaaS",
  "Customer Success",
  "Retention",
  "SEO",
  "Digital Marketing",
];

const myStatusData = {
  current: {
    label: "Current Skills:",
    keywords: "“SEO, Blog Content, Social Media.”",
    color: { bg: "bg-[#DFFFC7]", text: "text-[#208800]" },
  },
  missing: {
    label: "Needs Improvement:",
    keywords: "“PPC, Video Production.”",
    color: { bg: "bg-[#FFC7C7]", text: "text-[#D90000]" },
  },
};

const chartData = [
  {
    name: "Posting Frequency",
    value: 80,
    max: 100,
  },
  {
    name: "Average Engagement",
    value: 62,
    max: 100,
  },
];

const analysisText = {
  frequency:
    "You posted 1x in the last 30 days. Active professionals average 8–12 posts.",
  contentMix:
    "80% promotional, 20% value-adding. Aim for 70% educational, 30% promotional.",
  engagement:
    "High impressions, low comments → try asking open-ended questions in posts.",
};

const SCHEDULE = [
  {
    day: "Mon",
    slots: [
      { id: "m", label: "Morning", value: 20, engagement: "5%" },
      { id: "n", label: "Noon", value: 40, engagement: "12%" },
      { id: "e", label: "Evening", value: 65, engagement: "18%" },
      { id: "ni", label: "Night", value: 30, engagement: "8%" },
    ],
  },
  {
    day: "Tue",
    slots: [
      { id: "m", label: "Morning", value: 85, engagement: "22%" },
      { id: "n", label: "Noon", value: 50, engagement: "15%" },
      { id: "e", label: "Evening", value: 30, engagement: "10%" },
      { id: "ni", label: "Night", value: 20, engagement: "4%" },
    ],
  },
  {
    day: "Wed",
    slots: [
      { id: "m", label: "Morning", value: 30, engagement: "9%" },
      { id: "n", label: "Noon", value: 60, engagement: "16%" },
      { id: "e", label: "Evening", value: 90, engagement: "25%" },
      { id: "ni", label: "Night", value: 40, engagement: "11%" },
    ],
  },
  {
    day: "Thu",
    slots: [
      { id: "m", label: "Morning", value: 45, engagement: "11%" },
      { id: "n", label: "Noon", value: 55, engagement: "14%" },
      { id: "e", label: "Evening", value: 75, engagement: "20%" },
      { id: "ni", label: "Night", value: 35, engagement: "9%" },
    ],
  },
  {
    day: "Fri",
    slots: [
      { id: "m", label: "Morning", value: 70, engagement: "19%" },
      { id: "n", label: "Noon", value: 60, engagement: "16%" },
      { id: "e", label: "Evening", value: 40, engagement: "11%" },
      { id: "ni", label: "Night", value: 15, engagement: "3%" },
    ],
  },
  {
    day: "Sat",
    slots: [
      { id: "m", label: "Morning", value: 20, engagement: "5%" },
      { id: "n", label: "Noon", value: 35, engagement: "9%" },
      { id: "e", label: "Evening", value: 25, engagement: "7%" },
      { id: "ni", label: "Night", value: 10, engagement: "2%" },
    ],
  },
  {
    day: "Sun",
    slots: [
      { id: "m", label: "Morning", value: 15, engagement: "4%" },
      { id: "n", label: "Noon", value: 25, engagement: "6%" },
      { id: "e", label: "Evening", value: 50, engagement: "13%" },
      { id: "ni", label: "Night", value: 60, engagement: "16%" },
    ],
  },
];

const AI_INSIGHT_TEXT =
  "Your audience is most active on Tuesday (9–11 AM) and Wednesday evenings. Avoid posting late on Monday nights.";

const analyzedAccount = () => {
  const handleRewrite = () => {
    console.log("AI rewrite requested!");
  };
  return (
    <>
      <TopMenu
        pageName="Profile Analyzer"
        userName="Robert Downey Jr."
        userTier="Free Tier"
        tokens={2000}
      />
      <div className="analyzeAccContainer flex gap-[10px] mt-[10px]">
        <div className="analyzeLeft">
          <div className="mb-[10px]">
            <AccStatus
              name="Robert Pattinson"
              title="Sr.UI Designer | Graphic Designer | Brand Designer | Logo Designer | Book Cover Designer"
              image="/images/app/pp.jpg"
              followers={2456}
              projects="500+"
              target={65}
            />
          </div>
          <div className="QkFixContainer">
            <h3 className="font-[500] mb-[12px]">Quick Fixes</h3>
            <div className="custom-scroll">
              {quickFixes.map((fix, index) => (
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
            <div>
              <AccBio
                clarityScore={8}
                clarityTotal={10}
                keywordScore={6}
                keywordTotal={10}
                tone="Friendly"
                strengths={[
                  "You highlight your current role clearly.",
                  "You also clearly state your area of expertise.",
                ]}
                weaknesses={[
                  "Missing keywords that recruiters/clients search for.",
                  "Bio length could be optimized.",
                ]}
                suggestions={[
                  "Include terms like 'Growth Marketing', 'B2B SaaS', 'AI Strategy'.",
                  "Consider adding a measurable achievement.",
                ]}
                onRewriteWithAI={handleRewrite}
              />
            </div>
            <div>
              <KeyAcc alignmentTags={myTags} statusData={myStatusData} />
            </div>
          </div>
          <div className="PAna-Container-Right">
            <div className="mb-[12px]">
              <AccEngagment chartData={chartData} analysisText={analysisText} />
            </div>
            <div>
              <AccTime scheduleData={SCHEDULE} aiInsight={AI_INSIGHT_TEXT} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default analyzedAccount;
