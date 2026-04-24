import type { PlatformKey } from "@/lib/analytics/platforms";
import type { VelocityMetric } from "@/lib/analytics/types";

// --- TYPES ---
type AnalyticsData = Record<
  PlatformKey,
  {
    audience: VelocityMetric;
    reach: VelocityMetric;
    engagement: VelocityMetric;
    clicks: VelocityMetric;
    topDriver?: string; // Optional for 'all' view
  }
>;

// --- 1. VITALS DATA ---
export const ANALYTICS_DATA: AnalyticsData = {
  all: {
    audience: {
      id: "1",
      label: "Total Audience",
      value: "84.2k",
      change: 12.5,
      trend: "up",
      velocity: "high",
    },
    reach: {
      id: "2",
      label: "Total Reach",
      value: "1.2M",
      change: 8.2,
      trend: "up",
      velocity: "high",
    },
    engagement: {
      id: "3",
      label: "Avg. Engagement",
      value: "4.8%",
      change: -1.2,
      trend: "down",
      velocity: "medium",
    },
    clicks: {
      id: "4",
      label: "Link Clicks",
      value: "12.5k",
      change: 24.0,
      trend: "up",
      velocity: "high",
    },
    topDriver: "Instagram",
  },
  linkedin: {
    audience: {
      id: "1",
      label: "Followers",
      value: "12.4k",
      change: 5.4,
      trend: "up",
      velocity: "medium",
    },
    reach: {
      id: "2",
      label: "Impressions",
      value: "45k",
      change: 12.1,
      trend: "up",
      velocity: "high",
    },
    engagement: {
      id: "3",
      label: "Eng. Rate",
      value: "3.2%",
      change: 0.5,
      trend: "up",
      velocity: "medium",
    },
    clicks: {
      id: "4",
      label: "Profile Views",
      value: "890",
      change: -5.0,
      trend: "down",
      velocity: "low",
    },
  },
  twitter: {
    audience: {
      id: "1",
      label: "Followers",
      value: "28.1k",
      change: 1.2,
      trend: "neutral",
      velocity: "low",
    },
    reach: {
      id: "2",
      label: "Impressions",
      value: "890k",
      change: -2.4,
      trend: "down",
      velocity: "low",
    },
    engagement: {
      id: "3",
      label: "Eng. Rate",
      value: "1.8%",
      change: 4.5,
      trend: "up",
      velocity: "medium",
    },
    clicks: {
      id: "4",
      label: "Link Clicks",
      value: "4.2k",
      change: 12.0,
      trend: "up",
      velocity: "high",
    },
  },
  instagram: {
    audience: {
      id: "1",
      label: "Followers",
      value: "35.2k",
      change: 18.5,
      trend: "up",
      velocity: "high",
    },
    reach: {
      id: "2",
      label: "Accounts Reached",
      value: "240k",
      change: 22.1,
      trend: "up",
      velocity: "high",
    },
    engagement: {
      id: "3",
      label: "Eng. Rate",
      value: "6.5%",
      change: 5.2,
      trend: "up",
      velocity: "high",
    },
    clicks: {
      id: "4",
      label: "Profile Visits",
      value: "6.1k",
      change: 15.0,
      trend: "up",
      velocity: "high",
    },
  },
  facebook: {
    audience: {
      id: "1",
      label: "Page Likes",
      value: "5.1k",
      change: 0.2,
      trend: "neutral",
      velocity: "low",
    },
    reach: {
      id: "2",
      label: "Reach",
      value: "12k",
      change: -10.5,
      trend: "down",
      velocity: "low",
    },
    engagement: {
      id: "3",
      label: "Eng. Rate",
      value: "1.1%",
      change: -2.0,
      trend: "down",
      velocity: "low",
    },
    clicks: {
      id: "4",
      label: "Website Clicks",
      value: "120",
      change: 0.0,
      trend: "neutral",
      velocity: "low",
    },
  },
  threads: {
    audience: {
      id: "1",
      label: "Followers",
      value: "2.4k",
      change: 45.0,
      trend: "up",
      velocity: "high",
    },
    reach: {
      id: "2",
      label: "Views",
      value: "15k",
      change: 30.2,
      trend: "up",
      velocity: "high",
    },
    engagement: {
      id: "3",
      label: "Eng. Rate",
      value: "4.1%",
      change: 12.0,
      trend: "up",
      velocity: "high",
    },
    clicks: {
      id: "4",
      label: "Clicks",
      value: "340",
      change: 8.5,
      trend: "up",
      velocity: "high",
    },
  },
  pinterest: {
    audience: {
      id: "1",
      label: "Followers",
      value: "1.0k",
      change: 2.5,
      trend: "up",
      velocity: "low",
    },
    reach: {
      id: "2",
      label: "Monthly Views",
      value: "55k",
      change: 5.0,
      trend: "up",
      velocity: "medium",
    },
    engagement: {
      id: "3",
      label: "Eng. Rate",
      value: "2.5%",
      change: 1.1,
      trend: "up",
      velocity: "low",
    },
    clicks: {
      id: "4",
      label: "Outbound Clicks",
      value: "850",
      change: 10.0,
      trend: "up",
      velocity: "medium",
    },
  },
};

// --- 2. CHART HISTORY DATA ---
export const HISTORY_DATA = [
  {
    date: "Nov 1",
    linkedin: 120,
    twitter: 200,
    instagram: 150,
    facebook: 50,
    threads: 80,
    pinterest: 20,
  },
  {
    date: "Nov 5",
    linkedin: 132,
    twitter: 210,
    instagram: 180,
    facebook: 55,
    threads: 90,
    pinterest: 25,
  },
  {
    date: "Nov 10",
    linkedin: 145,
    twitter: 250,
    instagram: 300,
    facebook: 60,
    threads: 110,
    pinterest: 30,
  },
  {
    date: "Nov 15",
    linkedin: 160,
    twitter: 280,
    instagram: 450,
    facebook: 70,
    threads: 130,
    pinterest: 45,
  },
  {
    date: "Nov 20",
    linkedin: 190,
    twitter: 320,
    instagram: 580,
    facebook: 85,
    threads: 160,
    pinterest: 60,
  },
  {
    date: "Nov 25",
    linkedin: 210,
    twitter: 400,
    instagram: 700,
    facebook: 90,
    threads: 200,
    pinterest: 80,
  },
  {
    date: "Nov 30",
    linkedin: 240,
    twitter: 450,
    instagram: 850,
    facebook: 95,
    threads: 240,
    pinterest: 100,
  },
];

// --- 3. RADAR INSIGHTS DATA ---
export const RADAR_DATA: Record<PlatformKey, any[]> = {
  all: [
    { subject: "Virality", A: 85, fullMark: 100 },
    { subject: "Consistency", A: 90, fullMark: 100 },
    { subject: "Conversion", A: 65, fullMark: 100 },
    { subject: "Authority", A: 80, fullMark: 100 },
    { subject: "Community", A: 70, fullMark: 100 },
  ],
  linkedin: [
    { subject: "Virality", A: 40, fullMark: 100 },
    { subject: "Consistency", A: 95, fullMark: 100 },
    { subject: "Conversion", A: 90, fullMark: 100 },
    { subject: "Authority", A: 95, fullMark: 100 },
    { subject: "Community", A: 60, fullMark: 100 },
  ],
  twitter: [
    { subject: "Virality", A: 95, fullMark: 100 },
    { subject: "Consistency", A: 80, fullMark: 100 },
    { subject: "Conversion", A: 40, fullMark: 100 },
    { subject: "Authority", A: 70, fullMark: 100 },
    { subject: "Community", A: 90, fullMark: 100 },
  ],
  instagram: [
    { subject: "Virality", A: 90, fullMark: 100 },
    { subject: "Consistency", A: 85, fullMark: 100 },
    { subject: "Conversion", A: 50, fullMark: 100 },
    { subject: "Authority", A: 60, fullMark: 100 },
    { subject: "Community", A: 85, fullMark: 100 },
  ],
  facebook: [
    { subject: "Virality", A: 50, fullMark: 100 },
    { subject: "Consistency", A: 60, fullMark: 100 },
    { subject: "Conversion", A: 70, fullMark: 100 },
    { subject: "Authority", A: 50, fullMark: 100 },
    { subject: "Community", A: 90, fullMark: 100 },
  ],
  threads: [
    { subject: "Virality", A: 80, fullMark: 100 },
    { subject: "Consistency", A: 50, fullMark: 100 },
    { subject: "Conversion", A: 30, fullMark: 100 },
    { subject: "Authority", A: 40, fullMark: 100 },
    { subject: "Community", A: 80, fullMark: 100 },
  ],
  pinterest: [
    { subject: "Virality", A: 60, fullMark: 100 },
    { subject: "Consistency", A: 90, fullMark: 100 },
    { subject: "Conversion", A: 80, fullMark: 100 },
    { subject: "Authority", A: 40, fullMark: 100 },
    { subject: "Community", A: 30, fullMark: 100 },
  ],
};

export const CONTENT_INSIGHTS: Record<PlatformKey, any[]> = {
  all: [
    {
      id: 1,
      format: "Carousel",
      performance: 95,
      engagement: "8.2%",
      insight: "Drives 2.5x more saves than average.",
      action: "Create Carousel",
    },
    {
      id: 2,
      format: "Short Video",
      performance: 88,
      engagement: "6.5%",
      insight: "Highest retention rate (45%).",
      action: "Create Reel",
    },
    {
      id: 3,
      format: "Single Image",
      performance: 60,
      engagement: "3.2%",
      insight: "Good for reach, low for conversion.",
      action: "Create Post",
    },
    {
      id: 4,
      format: "Text Only",
      performance: 45,
      engagement: "1.8%",
      insight: "Underperforming. Needs visuals.",
      action: "Enhance Text",
    },
  ],
  linkedin: [
    {
      id: 1,
      format: "PDF Carousel",
      performance: 98,
      engagement: "5.4%",
      insight: "Your #1 format for leads.",
      action: "Create PDF",
    },
    {
      id: 2,
      format: "Text + Image",
      performance: 75,
      engagement: "2.1%",
      insight: "Standard performance.",
      action: "Create Post",
    },
    {
      id: 3,
      format: "Poll",
      performance: 60,
      engagement: "1.5%",
      insight: "Engagement dropped 10% this month.",
      action: "Create Poll",
    },
  ],
  // Fallbacks for others
  twitter: [
    {
      id: 1,
      format: "Thread",
      performance: 92,
      engagement: "4.5%",
      insight: "High retweet potential.",
      action: "Draft Thread",
    },
    {
      id: 2,
      format: "Single Tweet",
      performance: 50,
      engagement: "1.2%",
      insight: "Low visibility.",
      action: "Write Tweet",
    },
  ],
  instagram: [
    {
      id: 1,
      format: "Reel",
      performance: 96,
      engagement: "9.2%",
      insight: "Viral driver.",
      action: "Create Reel",
    },
    {
      id: 2,
      format: "Carousel",
      performance: 85,
      engagement: "5.5%",
      insight: "High saves.",
      action: "Create Carousel",
    },
  ],
  facebook: [
    {
      id: 1,
      format: "Video",
      performance: 80,
      engagement: "3.2%",
      insight: "Best for shares.",
      action: "Upload Video",
    },
  ],
  threads: [
    {
      id: 1,
      format: "Text Thread",
      performance: 88,
      engagement: "6.0%",
      insight: "Strong discussions.",
      action: "Start Thread",
    },
  ],
  pinterest: [
    {
      id: 1,
      format: "Infographic",
      performance: 95,
      engagement: "4.5%",
      insight: "Evergreen traffic source.",
      action: "Create Pin",
    },
  ],
};

export const PREDICTION_DATA = [
  {
    date: "Nov 30",
    linkedin: 240,
    twitter: 450,
    instagram: 850,
    facebook: 95,
    threads: 240,
    pinterest: 100,
  }, // Start where history ends
  {
    date: "Dec 5",
    linkedin: 280,
    twitter: 520,
    instagram: 950,
    facebook: 100,
    threads: 280,
    pinterest: 120,
  },
  {
    date: "Dec 10",
    linkedin: 330,
    twitter: 600,
    instagram: 1100,
    facebook: 110,
    threads: 330,
    pinterest: 150,
  },
  {
    date: "Dec 15",
    linkedin: 400,
    twitter: 750,
    instagram: 1300,
    facebook: 125,
    threads: 390,
    pinterest: 180,
  },
];
export const DEMOGRAPHICS_DATA: Record<PlatformKey, any> = {
  all: {
    jobs: [
      { name: "Founders / CEOs", value: 35 },
      { name: "Product Managers", value: 25 },
      { name: "Software Engineers", value: 20 },
      { name: "Marketers", value: 15 },
      { name: "Other", value: 5 },
    ],
    locations: [
      { city: "San Francisco, US", percent: 28 },
      { city: "London, UK", percent: 18 },
      { city: "New York, US", percent: 15 },
      { city: "Berlin, DE", percent: 12 },
    ],
    seniority: "Senior Decision Makers",
  },
  linkedin: {
    jobs: [
      { name: "Founders / CEOs", value: 45 },
      { name: "VPs of Sales", value: 30 },
      { name: "Investors", value: 15 },
      { name: "Other", value: 10 },
    ],
    locations: [
      { city: "New York, US", percent: 40 },
      { city: "London, UK", percent: 20 },
    ],
    seniority: "Executive Level",
  },
  // Fallbacks for others (simplified for brevity, can duplicate 'all')
  twitter: {
    jobs: [
      { name: "Devs", value: 60 },
      { name: "Founders", value: 20 },
      { name: "VCs", value: 20 },
    ],
    locations: [{ city: "Global / Remote", percent: 100 }],
    seniority: "Tech Twitter",
  },
  instagram: {
    jobs: [
      { name: "Creatives", value: 50 },
      { name: "Students", value: 30 },
      { name: "Brands", value: 20 },
    ],
    locations: [{ city: "LA, US", percent: 30 }],
    seniority: "Creators",
  },
  facebook: {
    jobs: [
      { name: "Owners", value: 40 },
      { name: "Parents", value: 40 },
      { name: "Other", value: 20 },
    ],
    locations: [{ city: "Chicago, US", percent: 20 }],
    seniority: "General",
  },
  threads: {
    jobs: [
      { name: "Devs", value: 40 },
      { name: "Designers", value: 40 },
      { name: "Other", value: 20 },
    ],
    locations: [{ city: "SF, US", percent: 40 }],
    seniority: "Early Adopters",
  },
  pinterest: {
    jobs: [
      { name: "Designers", value: 70 },
      { name: "DIYers", value: 30 },
    ],
    locations: [{ city: "Europe", percent: 50 }],
    seniority: "Designers",
  },
};
export const ANOMALY_DATA = [
  {
    date: "Nov 10",
    type: "spike",
    value: 300, // Matches the Y-value in history for Nov 10
    icon: "🚀",
    reason:
      "Viral Spike detected. Cause: 'AI Tools' thread got retweeted by @TechLeader.",
  },
  {
    date: "Nov 20",
    type: "drop",
    value: 580, // Matches Y-value for Nov 20
    icon: "⚠️",
    reason:
      "Engagement Drop. Cause: Posted at 11PM (Off-Peak). Strategy: Reschedule to 9AM.",
  },
];
export const TOP_POSTS_DATA = [
  {
    id: 1,
    headline: "7 AI Tools You Missed in 2024",
    format: "Carousel",
    stats: { views: "145k", engagement: "8.5%" },
    score: 99,
    whyItWorked: "High-value listicle + 'Fear of Missing Out' hook.",
  },
  {
    id: 2,
    headline: "Stop Selling. Start Teaching.",
    format: "Text Post",
    stats: { views: "88k", engagement: "6.2%" },
    score: 95,
    whyItWorked: "Controversial opinion + Short punchy sentences.",
  },
  {
    id: 3,
    headline: "My $0 to $10k Journey (Breakdown)",
    format: "Case Study",
    stats: { views: "62k", engagement: "12.1%" },
    score: 92,
    whyItWorked: "Vulnerability + Transparency builds trust.",
  },
];
