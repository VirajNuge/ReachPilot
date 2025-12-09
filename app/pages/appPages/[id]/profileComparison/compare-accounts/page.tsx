"use client";
import ComAcc from "../../../components/ComAcc/ComAcc";
import ComBetter from "../../../components/ComBetter/ComBetter";
import ComRe from "../../../components/ComRe/ComRe";
import TopMenu from "../../../components/topMenu/topMenu";
import ComSimu from "../../../components/ComSimu/ComSimu";
import { useState } from "react";
import ComOverview from "../../../components/ComOverview/ComOverview";
import ComContent from "../../../components/ComContent/ComContent";
import ComEngagement from "../../../components/ComEngagement/ComEngagement";
import CadenceComparisonTab from "../../../components/ComCadence/ComCadence";
import AudienceComparisonTab from "../../../components/ComAudience/ComAudience";
import ProfileQualityTab from "../../../components/ComProfile/ComProfile";

// --- Data Definitions ---

// Recommendations based on Competitor Analysis (What They Do Better)
const recommendations = [
  {
    title: "Stronger Hook Length",
    observation:
      "Competitor uses shorter, punchy hooks (Avg: 8 words vs your 16).",
    impact: "Leads to +21% higher engagement rate.",
    example: "Most pitches fail in the first 5 seconds.",
  },
  {
    title: "Consistent Posting Cadence",
    observation: "Competitor posts 5x per week vs your 2x per week.",
    impact: "Algorithm favors consistency → +34% visibility.",
    example: "Mon/Wed/Fri + Sat thread.",
  },
  {
    title: "Clear Call-to-Action (CTA)",
    observation: "Competitor ends 80% of posts with a CTA vs your 10%.",
    impact: "CTA posts get 3x more comments/DMs.",
    example: "👉 Comment 'Playbook' if you want the PDF.",
  },
  {
    title: "Optimized Posting Time",
    observation: "Competitor posts at 8–10 AM vs your late nights (10 PM).",
    impact: "Morning posts see +28% engagement lift.",
    example: "“5 AM habits” post at 8:30 AM.",
  },
  {
    title: "Carousel/Document Usage",
    observation: "Competitor uses carousels in 40% of posts vs your 5%.",
    impact: "Carousels earn 2.4x more saves/shares.",
    example: "“10 AI Tools Every Freelancer Needs [Slide 1/10]”",
  },
  {
    title: "Visual Media Ratio",
    observation: "Competitor uses images/videos in 70% of posts vs your 25%.",
    impact: "Posts with visuals show +50% engagement.",
    example: "“Most pitches fail in the first 5 seconds.”",
  },
  {
    title: "Hashtag Efficiency",
    observation: "Competitor uses 2–3 hashtags per post vs your 8–10.",
    impact: "Shorter hashtag sets = +19% higher reach.",
    example:
      "#AI #GrowthMarketing vs your “#AI #AItools #BusinessGrowth #LinkedIn...”",
  },
  {
    title: "Post Length Discipline",
    observation: "Competitor writes 150–200 word posts vs your 400+ words.",
    impact: "Concise posts = +17% more shares.",
    example: "“Stop selling features. Start selling transformation.”",
  },
  {
    title: "Engaging Comment Strategy",
    observation: "Competitor replies to 75% of comments vs your 15%.",
    impact: "Replying doubles audience stickiness.",
    example: "Competitor replies: “Great point, Sarah! Here's a resource...”",
  },
  {
    title: "Audience Growth Momentum",
    observation: "Competitor's followers grew +540 in 90 days vs your +200.",
    impact: "Growth fueled by consistent hooks & carousels.",
    example: "Their follower milestone post got 1.5k likes.",
  },
];

// Action Items for the User (Make Me Better)
const actionItems = [
  {
    title: "🚀 Quick Win: Rewrite Headline",
    effort: "Low",
    lift: "+12% Engagement",
    current: "“Consultant | Helping businesses grow”",
    suggested: "Helping startups 2x sales with AI-driven growth systems 🚀",
  },
  {
    title: "📸 Add a Banner Image",
    effort: "Low",
    lift: "+8% Profile Views",
    current: "No banner detected",
    suggested: "Upload branded banner with tagline + contact info",
  },
  {
    title: "📊 Increase Posting Cadence",
    effort: "Medium",
    lift: "+15–20% Engagement",
    current: "Only 5% carousel usage",
    suggested: "Add 1 document post per week (case study / playbook format)",
  },
  {
    title: "📄 Create Weekly Carousels",
    effort: "Medium",
    lift: "+18% Saves/Shares",
    current: "No banner detected", // Text from image (might be a typo in design, but kept for accuracy)
    suggested: "Upload branded banner with tagline + contact info",
  },
  {
    title: "🏷️ Optimize Hashtags",
    effort: "Low",
    lift: "+10% Reach",
    current: "8–10 hashtags per post",
    suggested: "Use 2–3 targeted hashtags per niche",
  },
  {
    title: "✍️ Add Clear CTAs to Posts",
    effort: "Low",
    lift: "+25% Comments/DMs",
    current: "Only 1/10 posts have CTAs",
    suggested: "👉 Comment 'Guide' to get the PDF",
  },
  {
    title: "📅 Post at Peak Times",
    effort: "Low",
    lift: "+14% Engagement",
    current: "Posts at 10 PM",
    suggested: "Schedule posts at 8–10 AM (your audience’s peak hours)",
  },
  {
    title: "🤝 Engage in Comments",
    effort: "Medium",
    lift: "+20% Comment Depth",
    current: "You reply to 15% of comments",
    suggested: "Reply to at least 70% (AI can draft replies for you)",
  },
  {
    title: "📅 Post at Peak Times",
    effort: "Low",
    lift: "+14% Engagement",
    current: "Posts at 10 PM",
    suggested: "Schedule posts at 8–10 AM (your audience’s peak hours)",
  },
  {
    title: "🤝 Engage in Comments",
    effort: "Medium",
    lift: "+20% Comment Depth",
    current: "You reply to 15% of comments",
    suggested: "Reply to at least 70% (AI can draft replies for you)",
  },
];

// Content Tab Data
const formatDistributionData = [
  { name: "Text", User: 25, Competitor: 98 },
  { name: "Image", User: 22, Competitor: 68 },
  { name: "Video", User: 40, Competitor: 12 },
  { name: "Carousel", User: 20, Competitor: 18 },
];

const scatterDataYou = [{ x: 25, y: 42, z: 1 }];
const scatterDataCompetitor = [{ x: 48, y: 55, z: 1 }];

const topPostsData = [
  {
    id: 1,
    headline: "“Most pitches fail in 5 seconds.”",
    type: "Image",
    length: "80w",
    engagementRate: "4.2%",
    cta: "Yes",
  },
  {
    id: 2,
    headline: "“Stop selling features. Start selling transformation.”",
    type: "Text",
    length: "150w",
    engagementRate: "3.8%",
    cta: "Yes",
  },
  {
    id: 3,
    headline: "“10 AI Tools Every Freelancer Needs [Slide 1/10]”",
    type: "Carousel",
    length: "10 slides",
    engagementRate: "5.1%",
    cta: "Yes",
  },
  {
    id: 4,
    headline: "“My biggest mistake in 2023 (and what I learned).”",
    type: "Text",
    length: "210w",
    engagementRate: "4.5%",
    cta: "No",
  },
];

const insightsData = [
  "“Competitor drives 2.4x more saves with Carousels.”",
  "“Shorter posts (100–200 words) yield +17% higher engagement.”",
  "“Your posts rely heavily on text; competitor balances text with visuals.”",
  "“Your posts rely heavily on text; competitor balances text with visuals.”",
];

// Engagement Tab Data
const statsCards = [
  {
    title: "Engagement Rate",
    youValue: "2.1%",
    compValue: "3.4%",
    winner: "Competitor" as const,
  },
  {
    title: "Comments/Post",
    youValue: "5",
    compValue: "14",
    winner: "Competitor" as const,
  },
  {
    title: "Share Rate",
    youValue: "0.8%",
    compValue: "2.1%",
    winner: "Competitor" as const,
  },
  {
    title: "Reply to Comments",
    youValue: "75%",
    compValue: "15%",
    winner: "You" as const,
  },
];

const recentPostsTrendData = [
  { post: "P12", You: 20, Competitor: 45 },
  { post: "P11", You: 25, Competitor: 50 },
  { post: "P10", You: 40, Competitor: 48 },
  { post: "P9", You: 35, Competitor: 60 },
  { post: "P8", You: 50, Competitor: 65 },
  { post: "P7", You: 45, Competitor: 55 },
  { post: "P6", You: 60, Competitor: 70 }, // Competitor spikes
  { post: "P5", You: 55, Competitor: 65 },
  { post: "P4", You: 70, Competitor: 50 }, // You spike
  { post: "P3", You: 75, Competitor: 45 },
  { post: "P2", You: 65, Competitor: 40 },
  { post: "P1", You: 80, Competitor: 35 }, // Newest Post
];

const interactionsData = [
  {
    name: "Competitor",
    Likes: 38,
    Comments: 55,
    Shares: 42,
  },
  {
    name: "You",
    Likes: 98,
    Comments: 96,
    Shares: 55,
  },
];

// Cadence Tab Data
const cadenceStats = [
  {
    title: "Posts per Week",
    youValue: "3",
    compValue: "7",
    insight: "Competitor posts 2.3x more",
    isPositive: false,
  },
  {
    title: "Consistency",
    youValue: "72%",
    compValue: "98%",
    insight: "Competitor never misses a day",
    isPositive: false,
  },
  {
    title: "Weekend Activity",
    youValue: "0%",
    compValue: "20%",
    insight: "Competitor leverages Sundays",
    isPositive: true, // Context dependent, but kept as 'true' based on source.
  },
];

// Data for Radar Chart (Activity by Day)
const dayDistributionData = [
  { day: "Mon", You: 80, Competitor: 90, fullMark: 100 },
  { day: "Tue", You: 50, Competitor: 85, fullMark: 100 },
  { day: "Wed", You: 90, Competitor: 95, fullMark: 100 },
  { day: "Thu", You: 60, Competitor: 80, fullMark: 100 },
  { day: "Fri", You: 40, Competitor: 90, fullMark: 100 },
  { day: "Sat", You: 10, Competitor: 40, fullMark: 100 },
  { day: "Sun", You: 0, Competitor: 60, fullMark: 100 },
];

// Data for Horizontal Bar Chart (Time of Day)
const timeDistributionData = [
  { timeBlock: "Morning (6-12)", You: 20, Competitor: 80 },
  { timeBlock: "Mid-Day (12-5)", You: 60, Competitor: 40 },
  { timeBlock: "Evening (5-10)", You: 30, Competitor: 50 },
  { timeBlock: "Night (10+)", You: 10, Competitor: 5 },
];

// Cadence Text Insights
const cadenceInsights = [
  "Opportunity: Competitor is highly active on Sunday evenings (Planning ahead). You have zero presence then.",
  "Your posts cluster around lunch time (Mid-Day), while competitor dominates the Morning commute slot.",
  "Increasing frequency to 5x/week could capture the Tuesday/Thursday gap.",
];

// Audience Tab Data
const audienceStats = [
  {
    label: "Decision Makers",
    you: "12%",
    comp: "28%",
    icon: "briefcase" as const,
    winner: false,
  },
  {
    label: "Total Followers",
    you: "12.4k",
    comp: "45.1k",
    icon: "people" as const,
    winner: false,
  },
  {
    label: "Int'l Reach",
    you: "45%",
    comp: "15%",
    icon: "globe" as const,
    winner: true,
  },
];

// Pie Chart Data for Seniority (You)
const seniorityDataYou = [
  { name: "CXO/VP", value: 15 },
  { name: "Manager", value: 35 },
  { name: "Entry", value: 50 },
];

// Pie Chart Data for Seniority (Competitor)
const seniorityDataComp = [
  { name: "CXO/VP", value: 45 }, // They have more senior people
  { name: "Manager", value: 30 },
  { name: "Entry", value: 25 },
];

// Bar Chart Data (Industries)
const industryData = [
  { name: "Software", You: 60, Competitor: 40 },
  { name: "Marketing", You: 20, Competitor: 50 },
  { name: "Finance", You: 10, Competitor: 5 },
  { name: "Education", You: 10, Competitor: 5 },
];

// Top Locations List
const topLocations = [
  { city: "San Francisco", percentage: "32%" },
  { city: "New York", percentage: "18%" },
  { city: "London", percentage: "12%" },
];

// Audience Insights
const audienceinsights = [
  "Competitor has 3x more Decision Makers (CXOs) in their audience.",
  "You dominate the 'Software' niche, while they are broader in 'Marketing'.",
  "Your audience is more global (45% Int'l) compared to their US-centric base.",
];

// Profile Quality Tab Data
const attributeData = [
  { attribute: "Headline Impact", You: 6, Competitor: 9 },
  { attribute: "Visual Branding", You: 7, Competitor: 8 },
  { attribute: "SEO Keywords", You: 5, Competitor: 9 },
  { attribute: "Call-to-Action", You: 8, Competitor: 4 }, // You win here
  { attribute: "Social Proof", You: 4, Competitor: 8 },
];

// Checklist Data (Table)
const checklistData = [
  { feature: "Professional Headshot", you: true, competitor: true },
  { feature: "Banner with Value Prop", you: false, competitor: true },
  { feature: "Featured Section Active", you: true, competitor: true },
  { feature: "Link in Bio Optimized", you: true, competitor: false }, // You win
  { feature: "Contact Info Complete", you: false, competitor: true },
];

// Keyword Analysis (Tag Cloud)
const keywordData = [
  {
    type: "Competitor Only",
    words: ["AI Strategy", "SaaS Growth", "Automation", "Revenue Ops"],
  },
  {
    type: "Common",
    words: ["Marketing", "Founder", "Tech", "Startup"],
  },
  {
    type: "You Only",
    words: ["Consultant", "Freelancer", "Writer"],
  },
];

// Profile Quality Insights
const profileinsights = [
  "Critical Gap: Competitor uses specific niche keywords ('SaaS', 'Revenue') while you use generic terms ('Consultant').",
  "Quick Win: Upload a banner image. Competitor uses this space for a CTA, you have a default background.",
  "Your 'Call-to-Action' score is higher; keep your clear 'Book a Call' link, it's working better than their generic website link.",
];

// Overview Tab Data (used in default view logic)
const radarData = [
  { subject: "Content", A: 80, B: 65, fullMark: 100 },
  { subject: "Engagement", A: 60, B: 85, fullMark: 100 },
  { subject: "Cadence", A: 80, B: 85, fullMark: 100 },
  { subject: "Audience", A: 75, B: 45, fullMark: 100 },
  { subject: "Profile Quality", A: 95, B: 78, fullMark: 100 },
];

const tableData = [
  { label: "Profile Quality", you: "68", comp: "83", win: false },
  { label: "Content Effect", you: "70", comp: "79", win: false },
  { label: "Engagement Health", you: "73", comp: "69", win: true },
  { label: "Cadence", you: "62", comp: "85", win: false },
  { label: "Audience", you: "72.1k", comp: "68.4k", win: true },
];

const insights = [
  "Competitor wins in Profile Quality → Headline clearer, About shorter",
  "You outperform in Engagement Health → Your comments have more depth",
];

// --- Main Component ---
export default function Comparison() {
  const [activeTab, setActiveTab] = useState("Overview");

  const tabs = [
    "Overview",
    "Content",
    "Engagement",
    "Cadence",
    "Audience",
    "Profile Quality",
  ];

  /**
   * Renders the content component based on the active tab state.
   * Passes the relevant data to the corresponding child component.
   */
  const renderContent = () => {
    switch (activeTab) {
      case "Overview":
        return (
          <div>
            <ComOverview
              radarData={radarData}
              tableData={tableData}
              insights={insights}
            />
          </div>
        );
      case "Content":
        return (
          <div>
            <ComContent
              formatDistributionData={formatDistributionData}
              scatterDataYou={scatterDataYou}
              scatterDataCompetitor={scatterDataCompetitor}
              topPostsData={topPostsData}
              insightsData={insightsData}
            />
          </div>
        );
      case "Engagement":
        return (
          <div>
            <ComEngagement
              statsCards={statsCards}
              recentPostsTrendData={recentPostsTrendData}
              interactionsData={interactionsData}
            />
          </div>
        );
      case "Audience":
        return (
          <div>
            <AudienceComparisonTab
              audienceStats={audienceStats}
              seniorityDataYou={seniorityDataYou}
              seniorityDataComp={seniorityDataComp}
              industryData={industryData}
              topLocations={topLocations}
              insights={audienceinsights}
            />
          </div>
        );
      case "Cadence":
        return (
          <div>
            <div>
              <CadenceComparisonTab
                cadenceStats={cadenceStats}
                dayDistributionData={dayDistributionData}
                timeDistributionData={timeDistributionData}
                cadenceInsights={cadenceInsights}
              />
            </div>
          </div>
        );
      case "Profile Quality":
        return (
          <div>
            <ProfileQualityTab
              overallScoreYou={68}
              overallScoreComp={83}
              attributeData={attributeData}
              checklistData={checklistData}
              keywordData={keywordData as any} // TypeScript cast for literal types
              insights={profileinsights}
            />
          </div>
        );
    }
  };

  return (
    <>
      {/* Top Menu Component */}
      <TopMenu
        pageName="Profile Comparison"
        userName="Robert Downey Jr."
        userTier="Free Tier"
        tokens={2000}
      />
      <div className="flex gap-3 mt-[12px] mb-[12px]">
        {/* Left Column: Account Info and Recommendations */}
        <div>
          {/* Account Comparison Cards */}
          <div className="flex gap-4 flex-wrap">
            <ComAcc
              name="Anika Watkins"
              role="Microsoft, CEO"
              imageSrc="/images/app/pp.jpg"
              score={72}
              stats={{
                cadence: "3 posts/wk",
                engagement: "2.1%",
                growth: "+200",
              }}
            />

            <ComAcc
              name="Elon Musk"
              role="Tesla, CEO"
              imageSrc="/images/app/pp.jpg"
              score={95}
              stats={{
                cadence: "10 posts/day",
                engagement: "5.4%",
                growth: "+50k",
              }}
            />
          </div>
          {/* Recommendations Section */}
          <div>
            <div className="bg-[#F9F9F9] w-[740px] p-[12px] rounded-[12px] mt-[12px]">
              <h4 className="text-500">What They Do Better</h4>
              <div className=" bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {recommendations.map((item, index) => (
                    <ComRe
                      key={index}
                      title={item.title}
                      observation={item.observation}
                      impact={item.impact}
                      example={item.example}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Right Column: Deep-Dive Comparison Tabs */}
        <div className="bg-[#F9F9F9] w-[740px] h-[1095px] p-[12px] rounded-[12px]">
          <h4 className="mb-[8px]">Deep-Dive Profile Comparison</h4>
          {/* Tab Navigation */}
          <div className="flex gap-2">
            {tabs.map((tab) => (
              <p
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={` font-[500] w-max pl-3 pr-3 p-1 text-[14px] mb-2 rounded-[90px] cursor-pointer ease-in-out duration-200 hover:bg-[#D6D5FF]
                  ${
                    activeTab === tab
                      ? "text-[#EFEEFF] bg-[#5D5FEF]"
                      : "text-[#5D5FEF] bg-[#EFEEFF]"
                  }`}
              >
                {tab}
              </p>
            ))}
            <br />
          </div>
          {/* Tab Content Rendering */}
          <div>{renderContent()}</div>
        </div>
      </div>
      {/* Bottom Sections: Action Plan and Simulator */}
      <div className="flex gap-3">
        {/* Action Plan Section */}
        <div className="bg-[#F9F9F9] w-[800px] h-max p-[12px] rounded-[12px] mt-[12px]">
          <h4 className="text-500">Make Me Better (ReachPilot Action Plan)</h4>
          <div className=" bg-gray-50 flex justify-center">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 w-full max-w-5xl">
              {actionItems.map((item, index) => (
                <ComBetter
                  key={index}
                  title={item.title}
                  effort={item.effort}
                  lift={item.lift}
                  current={item.current}
                  suggested={item.suggested}
                />
              ))}
            </div>
          </div>
        </div>
        {/* What IF Simulator Section */}
        <div className="bg-[#F9F9F9] w-max p-[12px] rounded-[12px] mt-[12px]">
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900">
              What IF Simulator
            </h2>
            <p className="text-gray-600">
              Adjust your strategy and preview potential growth outcomes.
            </p>
          </div>
          <div>
            <ComSimu />
          </div>
        </div>
      </div>
    </>
  );
}
