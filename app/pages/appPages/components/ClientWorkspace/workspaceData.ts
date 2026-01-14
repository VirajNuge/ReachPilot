import { ClientWorkspace } from "./workspaceTypes";

export const WORKSPACE_DATA: ClientWorkspace[] = [
  // --- WORKSPACE 1: TECHFLOW ---
  {
    id: "ws-1", // Unique ID
    clientId: "c5",
    clientName: "TechFlow Inc.",
    logo: "TF",
    description: "Enterprise AI solutions for logistics.",
    brand: {
      primaryColor: "#4F46E5", // Indigo
      secondaryColor: "#1E1B4B", // Midnight
      fontHeading: "Inter",
      fontBody: "Roboto",
      socials: [
        {
          platform: "LinkedIn",
          handle: "@techflow-inc",
          followers: "12.4k",
          url: "#",
        },
        {
          platform: "Twitter",
          handle: "@techflowAI",
          followers: "8.2k",
          url: "#",
        },
        {
          platform: "Website",
          handle: "techflow.io",
          followers: "N/A",
          url: "#",
        },
      ],
    },
    voice: {
      tone: "Authoritative & Innovative",
      keywords: ["Scalable", "Enterprise", "Secure", "Future"],
      restrictions: [
        "No slang",
        "Avoid exclamation marks",
        "No emojis in headlines",
      ],
      sampleCopy:
        "Efficiency isn't a goal; it's the baseline. Our new API reduces latency by 40%.",
    },
    audit: {
      overallScore: 78,
      toneConsistency: 85,
      visualConsistency: 60,
      topPerformingTopic: "API Integrations",
      contentGap: "Customer Case Studies",
      strategicAdvantage: "High engagement on technical deep-dives.",
    },
    competitors: [
      {
        name: "LogiChain",
        recentActivity: "Launched Q4 Webinar Series",
        threatLevel: "Medium",
      },
      {
        name: "FastTrack AI",
        recentActivity: "Aggressive Twitter Ad Campaign",
        threatLevel: "High",
      },
    ],
    notes: [
      {
        id: "n1",
        date: "Oct 20",
        title: "Q4 Strategy Kickoff",
        summary:
          "Discussed the new API launch. Client wants to focus on developer advocacy.",
        actionItems: ["Draft 3 technical threads", "Update LinkedIn Banner"],
      },
    ],
    assets: [
      {
        id: "a1",
        type: "image",
        name: "Logo_Dark.png",
        url: "bg-indigo-900",
        tags: ["Logo", "Brand"],
      },
      {
        id: "a2",
        type: "image",
        name: "Team_Happy.jpg",
        url: "bg-blue-500",
        tags: ["Culture", "Happy", "Office"],
      },
    ],
    postQueue: [
      {
        id: "p1",
        title: "Q3 Earnings Breakdown",
        date: "Oct 24",
        status: "Scheduled",
        platform: "LinkedIn",
      },
      {
        id: "p2",
        title: "New API Launch Teaser",
        date: "Oct 26",
        status: "In Review",
        platform: "Twitter",
      },
    ],
    totalPostsCreated: 124,
    lastActive: "2 hours ago",
  },

  // --- WORKSPACE 2: URBAN COFFEE (Unique ID 'ws-2') ---
  {
    id: "ws-2", // ⭐ CHANGED THIS FROM ws-1 to ws-2
    clientId: "c3",
    clientName: "Urban Coffee",
    logo: "UC",
    description: "Artisan coffee roasters in Portland.",
    brand: {
      primaryColor: "#78350F", // Coffee Brown
      secondaryColor: "#FFFBEB", // Cream
      fontHeading: "Playfair Display",
      fontBody: "Lato",
      socials: [
        {
          platform: "Instagram",
          handle: "@urbancoffee",
          followers: "45k",
          url: "#",
        },
        {
          platform: "Website",
          handle: "urbancoffee.com",
          followers: "N/A",
          url: "#",
        },
      ],
    },
    voice: {
      tone: "Cozy & Welcoming",
      keywords: ["Community", "Fresh", "Warm", "Sip"],
      restrictions: ["No corporate jargon", "Keep it short"],
      sampleCopy: "Rainy days were made for warm mugs. Come hide away with us.",
    },
    audit: {
      overallScore: 92,
      toneConsistency: 95,
      visualConsistency: 90,
      topPerformingTopic: "Latte Art Reels",
      contentGap: "Behind the Scenes Roasting",
      strategicAdvantage: "Extremely loyal local following.",
    },
    competitors: [
      {
        name: "Starbucks",
        recentActivity: "Holiday Cup Launch",
        threatLevel: "Low",
      },
      {
        name: "Blue Bottle",
        recentActivity: "New Single Origin Drop",
        threatLevel: "Medium",
      },
    ],
    notes: [
      {
        id: "n2",
        date: "Nov 01",
        title: "Holiday Menu Tasting",
        summary:
          "Client loved the Gingerbread Latte concept. Wants to push it early.",
        actionItems: ["Schedule photoshoot", "Draft Instagram Reels script"],
      },
    ],
    assets: [
      {
        id: "a3",
        type: "image",
        name: "Latte_Art.jpg",
        url: "bg-amber-700",
        tags: ["Product", "Cozy"],
      },
    ],
    postQueue: [
      {
        id: "p3",
        title: "Autumn Blend Reveal",
        date: "Nov 01",
        status: "Scheduled",
        platform: "Instagram",
      },
    ],
    totalPostsCreated: 45,
    lastActive: "1 day ago",
  },
];
