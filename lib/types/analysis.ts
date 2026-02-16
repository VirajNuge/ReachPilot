export interface VelocityPoint {
  hour: string;
  engagement: number;
}

export interface VelocityData {
  hookRate: number;
  category: string;
  velocityGraph: VelocityPoint[];
  insight: string;
}

export interface PsychTrigger {
  trigger: string;
  score: number;
  fullMark: number;
}

export interface PsychData {
  radarData: PsychTrigger[];
  winningTrigger: string;
  insight: string;
}

export interface FatigueData {
  status: string;
  fatigueScore: number;
  optimalFrequency: string;
  saturationPoint: number;
  weeklyImpact: { day: string; posts: number; impactScore: number }[];
}

export interface CompetitorMetric {
  category: string;
  profileValue: number;
  benchmarkValue: number;
  gapType: "Opportunity" | "Over-indexed" | "On Par" | string;
}

export interface CompetitorData {
  metrics: CompetitorMetric[];
  topOpportunity: string;
  insight: string;
  recommendations: string[];
}

export interface ViralIngredient {
  name: string;
  value: string;
  score: number;
}

export interface ViralRecipe {
  id: string;
  engagementMultiplier: string;
  hookType: string;
  hookText: string;
  ingredients: ViralIngredient[];
  whyItWorked: string;
  templateStructure: string[];
}

export interface VoiceAxis {
  id: string;
  leftLabel: string;
  rightLabel: string;
  score: number;
}

export interface VoiceData {
  personaName: string;
  axes: VoiceAxis[];
  signatureWords: string[];
  insight: string;
}

// Extracted interfaces for reusability

export interface PillarData {
  topic: string;
  performance: string;
}

export interface CrowdAnalysisData {
  positivePercent: number;
  neutralPercent: number;
  negativePercent: number;
  dominantEmotion: string;
  insight: string;
}

export interface KeywordNode {
  text: string;
  frequency: number;
}

export interface ActiveHourData {
  day: string;
  hours: number[];
}

export interface CrowdPersonaData {
  name: string;
  description: string;
  percentage: number;
}

export interface LeadMagnetData {
  suggestion: string;
  type: string;
  relevanceScore: number;
  whyItWorks: string;
}

export interface CTAData {
  effectivenessScore: number;
  commonPhrases: string[];
  improvementSuggestion: string;
}

export interface TechStackData {
  tool: string;
  category: string;
  confidence: string;
}

// Alias for compatibility if needed, or use ViralRecipe directly
export type ViralPostData = ViralRecipe;

export interface RawAnalysisData {
  profile: {
    name: string;
    headline: string;
    followers: number;
    projects: string;
    profileScore: number;
  };
  quickFixes: {
    headline: string;
    description: string;
    tag: "HIGH IMPACT" | "MEDIUM IMPACT" | "LOW IMPACT";
  }[];
  bioAnalysis: {
    clarityScore: number;
    keywordScore: number;
    tone: string;
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
  };
  keywords: {
    current: string[];
    missing: string[];
  };
  textAnalysis: {
    frequency: string;
    contentMix: string;
    engagement: string;
  };
  contentMetrics: {
    frequencyScore: number;
    contentMixScore: number;
    engagementScore: number;
  };
  schedule: {
    day: string;
    slots: {
      id: string;
      label: string;
      value: number;
      engagement: string;
    }[];
  }[];
  scheduleHighlight: string;
  csiScore: number;

  // Lab Data uses extracted or existing interfaces
  contentPillars: PillarData[];
  velocity: VelocityData;
  psychTriggers: PsychData;
  postFatigue: FatigueData;
  competitorGap: CompetitorData;
  viralRecipe: ViralRecipe[];
  voiceSpectrum: VoiceData;

  // Crowd & Blueprint Data uses extracted interfaces
  audiencePersonas: CrowdPersonaData[]; // Mapped from crowdPersonas?
  hypeValueScore: {
    hype: number;
    value: number;
  };
  ideaBank: {
    concept: string;
    impact: string;
  }[];
  postDNA: {
    hookType: string;
    format: string;
    topic: string;
    verdict: string;
  }[];
  tribes: {
    name: string;
    size: number;
    growth: string;
    sentiment: string;
  }[];
  shadowAudience: {
    lurkersPercent: number;
    engagersPercent: number;
    insight: string;
  };

  crowdSentiment: CrowdAnalysisData;
  questionCloud: KeywordNode[];
  activeHours: ActiveHourData[];

  leadMagnet: LeadMagnetData;
  ctaAnalysis: CTAData;
  techStack: TechStackData[];
}

// --- Growth Command Types ---

export type TaskCategory = "Quick Win" | "Big Bet" | "Filler" | "Money Pit";

export interface GrowthTask {
  id: string;
  title: string;
  category: TaskCategory;
  impact: number;
  effort: number;
  type: "Funnel" | "Content" | "Crowd";
  status: "Pending" | "In Progress" | "Completed";
  reasoning?: string; // Added for UI details
  actionType?: "Bio" | "Content" | "Strategy" | "Tech"; // extended for mapping
}

export interface GrowthSimulationResult {
  input: {
    authority: number;
    frequency: number;
  };
  outcome: {
    followers: number;
    engagement: number;
    revenue_potential: number;
  };
  trajectory_graph: { day: number; value: number }[];
}

export interface GrowthData {
  tasks: GrowthTask[];
  simulation: GrowthSimulationResult; // Initial state
}
