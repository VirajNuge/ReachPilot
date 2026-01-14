export type PostStatus = "Draft" | "In Review" | "Approved" | "Scheduled";

// --- EXISTING TYPES ---
export interface BrandAsset {
  id: string;
  type: "image" | "video" | "doc";
  url: string;
  name: string;
  tags: string[]; // ⭐ NEW: AI Vision Tags
}

export interface SocialAccount {
  platform: "LinkedIn" | "Twitter" | "Instagram" | "Website";
  handle: string;
  followers: string;
  url: string;
}

export interface BrandIdentity {
  primaryColor: string;
  secondaryColor: string;
  fontHeading: string;
  fontBody: string;
  socials: SocialAccount[];
}

export interface BrandVoice {
  tone: string;
  keywords: string[];
  restrictions: string[];
  sampleCopy: string;
}

export interface ClientPost {
  id: string;
  title: string;
  date: string;
  status: PostStatus;
  platform: "LinkedIn" | "Twitter";
}

// --- ⭐ NEW: INTELLIGENCE TYPES ---

export interface BrandAudit {
  overallScore: number; // 0-100
  toneConsistency: number; // 0-100
  visualConsistency: number; // 0-100
  topPerformingTopic: string;
  contentGap: string; // e.g. "Sustainability"
  strategicAdvantage: string; // The "Why we win" insight
}

export interface Competitor {
  name: string;
  recentActivity: string; // e.g. "Launched Black Friday Deal"
  threatLevel: "High" | "Medium" | "Low";
}

export interface MeetingNote {
  id: string;
  date: string;
  title: string;
  summary: string;
  actionItems: string[]; // ⭐ AI Extracted Tasks
}

export interface ClientWorkspace {
  id: string;
  clientId: string;
  clientName: string;
  logo: string;
  description: string;

  brand: BrandIdentity;
  voice: BrandVoice;
  audit: BrandAudit; // ⭐ The Zero-Day Scan Result
  competitors: Competitor[]; // ⭐ Watchtower

  assets: BrandAsset[];
  postQueue: ClientPost[];
  notes: MeetingNote[]; // ⭐ Smart Notebook

  totalPostsCreated: number;
  lastActive: string;
}
