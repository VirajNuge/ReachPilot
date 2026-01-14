export type ClientStage =
  | "Lead"
  | "Discovery"
  | "Proposal"
  | "Active"
  | "Retention";

export type ClientHealth = "Healthy" | "At Risk" | "Critical" | "New";

export interface Client {
  id: string;
  name: string;
  logo: string; // Initials or Image URL
  stage: ClientStage;

  // Financials
  contractValue: number; // Monthly Recurring Revenue (MRR)
  currency: string;

  // The "AI Intelligence" Layer
  health: ClientHealth;
  sentimentScore: number; // 0-100 (100 = Happy)
  lastContact: string; // e.g. "2 days ago"
  nextTask: string; // e.g. "Send Contract"

  // Meta
  tags: string[]; // e.g. ["SaaS", "High Ticket"]
}

export interface PipelineStats {
  totalClients: number;
  totalMRR: number; // Active Revenue
  pipelineValue: number; // Potential Revenue (Leads/Proposal)
  atRiskCount: number; // Clients needing attention
}
