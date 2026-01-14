import { Client, PipelineStats } from "./crmTypes";

export const CLIENTS_DATA: Client[] = [
  // --- COLUMN 1: LEADS ---
  {
    id: "c1",
    name: "Apex Fitness",
    logo: "AF",
    stage: "Lead",
    contractValue: 1500,
    currency: "$",
    health: "New",
    sentimentScore: 50,
    lastContact: "5 days ago",
    nextTask: "Send Outreach Email",
    tags: ["Fitness", "Local"],
  },
  {
    id: "c2",
    name: "Solaris Energy",
    logo: "SE",
    stage: "Lead",
    contractValue: 8000,
    currency: "$",
    health: "New",
    sentimentScore: 60,
    lastContact: "1 day ago",
    nextTask: "Research Competitors",
    tags: ["B2B", "High Ticket"],
  },

  // --- COLUMN 2: DISCOVERY ---
  {
    id: "c3",
    name: "Urban Coffee",
    logo: "UC",
    stage: "Discovery",
    contractValue: 2000,
    currency: "$",
    health: "Healthy",
    sentimentScore: 85,
    lastContact: "Yesterday",
    nextTask: "Book Strategy Call",
    tags: ["F&B"],
  },

  // --- COLUMN 3: PROPOSAL ---
  {
    id: "c4",
    name: "NextGen SaaS",
    logo: "NG",
    stage: "Proposal",
    contractValue: 5000,
    currency: "$",
    health: "Healthy",
    sentimentScore: 90,
    lastContact: "3 hours ago",
    nextTask: "Follow up on Contract",
    tags: ["SaaS", "Tech"],
  },

  // --- COLUMN 4: ACTIVE (REVENUE GENERATING) ---
  {
    id: "c5",
    name: "TechFlow Inc.",
    logo: "TF",
    stage: "Active",
    contractValue: 4500,
    currency: "$",
    health: "Healthy",
    sentimentScore: 95,
    lastContact: "1 week ago",
    nextTask: "Monthly Report",
    tags: ["Enterprise"],
  },
  {
    id: "c6",
    name: "Burger Joint",
    logo: "BJ",
    stage: "Active",
    contractValue: 1500,
    currency: "$",
    health: "At Risk", // ⚠️ AI Detected risk
    sentimentScore: 40,
    lastContact: "2 weeks ago",
    nextTask: "Schedule Save Call",
    tags: ["F&B"],
  },

  // --- COLUMN 5: RETENTION ---
  {
    id: "c7",
    name: "Dr. Smith Clinic",
    logo: "DS",
    stage: "Retention",
    contractValue: 3000,
    currency: "$",
    health: "Critical", // 🚨 Churn imminent
    sentimentScore: 20,
    lastContact: "3 weeks ago",
    nextTask: "Urgent Re-engagement",
    tags: ["Medical"],
  },
];

// Helper to calculate stats dynamically
export const getPipelineStats = (): PipelineStats => {
  const activeClients = CLIENTS_DATA.filter(
    (c) => c.stage === "Active" || c.stage === "Retention"
  );
  const potentialClients = CLIENTS_DATA.filter(
    (c) => c.stage !== "Active" && c.stage !== "Retention"
  );

  const totalMRR = activeClients.reduce((sum, c) => sum + c.contractValue, 0);
  const pipelineValue = potentialClients.reduce(
    (sum, c) => sum + c.contractValue,
    0
  );
  const atRiskCount = CLIENTS_DATA.filter(
    (c) => c.health === "At Risk" || c.health === "Critical"
  ).length;

  return {
    totalClients: CLIENTS_DATA.length,
    totalMRR,
    pipelineValue,
    atRiskCount,
  };
};
