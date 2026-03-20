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

export interface PillarPost {
  id: string;
  type: string;
  engagementRate: string;
  captionSnippet: string;
  thumbnail?: string;
}

export interface PillarData {
  name: string;
  percentage: number;
  count: number;
  avgEngagement: string;
  color?: string;
  description: string;
  topPosts: PillarPost[];
}

export type VibeType = "Fanboys" | "Seekers" | "Skeptics" | "Critics";

export interface VibeData {
  type: VibeType;
  percentage: number;
  count: number;
  keywords: string[]; // Sample comment phrases
  color: string;
  description: string;
}

export interface CrowdAnalysisData {
  totalComments: number;
  vibeScore: number; // 0-10 overall sentiment
  vibes: VibeData[];
  sentimentTrend: { post: number; score: number }[]; // Last 5 posts
}

export type IntentType = "Urgency" | "Buying" | "Educational";

export interface QuestionData {
  text: string;
  likes: number;
}

export interface KeywordNode {
  id: string;
  word: string; // Keyword/topic, e.g. "Pricing", "Bug", "Tutorial"
  count: number; // Frequency across all comments
  engagement: number; // Avg likes/reactions on comments mentioning this
  intent: IntentType;
  sampleQuestions: QuestionData[]; // 2-3 actual questions
}

export interface ActiveHourData {
  hour: number; // 0-23
  creatorPosts: number; // Count of posts made in this hour
  audienceActivity: number; // 0-100 heat (based on comment timestamps)
}

export interface HeartbeatDay {
  day: string;
  activityScore: number;
  postsCount: number;
  peakHour: string;
  trend: "Rising" | "Flat" | "Dropping";
}

export interface EngagementVitals {
  /** Actual average engagement rate % from scraped data */
  engagementRate: number;
  /** Platform average engagement rate % for comparison */
  benchmarkRate: number;
  /** Discovery Ratio: 0–100. How well posts break out of the follower bubble.
   *  Formula: (uniqueReach / totalImpressions) * 100, or views-based proxy. */
  reachEfficiency: number;
  /** Conversation Density: comments / totalEngagements * 100.
   *  Measures quality of engagement — how many interactions require intent. */
  conversationDensity: number;
  /** Amplification Power: (shares + saves) / reach * 100.
   *  For Twitter/X uses retweets as shares proxy. */
  amplificationPower: number;
  status: "Healthy" | "Warning" | "Critical";
  insight: string;
}

export type AudienceTempLabel =
  | "Ice Cold"
  | "Cold"
  | "Warm"
  | "Hot"
  | "On Fire";

export interface AudienceTemperature {
  tempScore: number;
  label: AudienceTempLabel;
  fanboyPercent: number;
  criticPercent: number;
  dominantEmotion: string;
  recommendation: string;
}

export interface GrowthTrajectory {
  direction: "Up" | "Flat" | "Down";
  changePercent: number;
  forecast: string;
  sparkline: { week: number; score: number }[];
}

export interface SimpleCrowdPersona {
  name: string;
  description: string;
  percentage: number;
}

export interface LeadMagnetData {
  type: "Checklist" | "Webinar" | "Free Trial" | "Discovery Call" | "Other";
  title: string;
  hook: string;
  friction: "Low" | "Medium" | "High";
  temp: "Cold" | "Warm" | "Hot";
  suggestion: string; // Counter-strategy
  whyItWorks: string; // Added for compatibility with existing code if needed, or stick to the plan.
  // The previous interface had 'whyItWorks'. The component uses it.
  // I will keep 'whyItWorks' to avoid breaking the component immediately,
  // or I should check if the component uses 'suggestion' as 'counterStrategy'.
  // Looking at EthicalBribe.tsx: title=suggestion, hook=whyItWorks.
  // The new BribeData has title, hook.
  // Let's align with the component's BribeData but mapped from API.
}

export type CTAType = "Engagement" | "Bridge" | "Conversion" | "Conversation";

export interface CTAData {
  mix: { type: CTAType; score: number; fullMark: number }[];
  topTrigger: { keyword: string; count: number };
  urgencyScore: number; // 0-100
  dominantStyle: "Hunter-Killer" | "Reach Hunter" | "Community Builder";
  placementHeatmap: {
    location: "First Line" | "Bottom" | "P.S.";
    count: number;
  }[];
}

export interface TechStackData {
  tools: {
    category: "Hosting" | "Frontend" | "Tracking" | "Payment" | "Marketing";
    name: string;
    confidence: "High" | "Medium" | "Low";
  }[];
  businessClass: "Hobbyist" | "Pro Creator" | "SaaS / Agency" | "Enterprise";
  verdict: string;
}

// Alias for compatibility if needed, or use ViralRecipe directly
export type ViralPostData = ViralRecipe;

// Derived on frontend, not from API
export interface PulseScoreBreakdown {
  total: number; // 0-100 weighted composite
  grade: "S" | "A" | "B" | "C" | "D" | "F";
  components: {
    profileHealth: number; // from profile.profileScore
    contentFitness: number; // from csiScore
    engagementPower: number; // from contentMetrics.engagementScore
    streakBonus: number; // derived from postFatigue.fatigueScore (inverted)
  };
}

export interface RawAnalysisData {
  profile: {
    name: string;
    headline: string;
    followers: number;
    followingCount?: number;
    bio?: string;
    pfp?: string;
    banner?: string;
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
  pulseHeartbeat: HeartbeatDay[];
  engagementVitals: EngagementVitals;
  audienceTemperature: AudienceTemperature;
  growthTrajectory: GrowthTrajectory;

  // Lab Data uses extracted or existing interfaces
  contentPillars: PillarData[];
  pillarInsight: string;
  velocity: VelocityData;
  psychTriggers: PsychData;
  postFatigue: FatigueData;
  competitorGap: CompetitorData;
  viralRecipe: ViralRecipe[];
  voiceSpectrum: VoiceData;

  // Crowd & Blueprint Data uses extracted interfaces
  audiencePersonas: SimpleCrowdPersona[]; // Mapped from crowdPersonas?
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
  techStack: TechStackData;

  // New Fields for full UI integration
  valueLadder: LadderData;
  growthTasks: GrowthTask[];
  crowdPersonas: CrowdPersonaData;
  disruptor: DisruptorData;
  funnelTactics: FunnelTactic[];
  crowdTactics: CrowdTactic[];
}

// --- New Interfaces for UI Components ---

export type LadderRung = "Bait" | "Tripwire" | "Core" | "High-Ticket";

export interface ProductNode {
  name: string;
  price: string;
  type: string;
  intensity: "Low" | "Medium" | "High";
}

export interface LadderData {
  products: {
    [key in "Bait" | "Tripwire" | "Core" | "High-Ticket"]?: ProductNode;
  };
  gap: string;
  insight: string;
}

export interface Archetype {
  id: string;
  role: string;
  iconName: string; // Serialized icon name
  color: string;
  bio: string;
  percentage: number;
  triggers: string[];
  painPoints: string[];
}

// Replaces the simple CrowdPersonaData
export interface CrowdPersonaData {
  primaryArchetype: Archetype;
  secondaryArchetypes: Archetype[];
  insight: {
    title: string;
    description: string;
    actionable: string;
  };
}

// --- Growth Command Types ---

export type TaskCategory = "Quick Win" | "Big Bet" | "Filler" | "Money Pit";

export interface GrowthTask {
  id: string;
  title: string;
  category: TaskCategory;
  impact: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
  effort: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
  type: "Funnel" | "Content" | "Crowd";
  status: "Pending" | "In Progress" | "Completed";
  reasoning: string; // Added for UI details
  actionType: "Bio" | "Content" | "Strategy" | "Tech"; // extended for mapping
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

// Phase 4: Content Disruptor
export interface DisruptorDay {
  day: string;
  time: string;
  pillar: string;
  topic: string;
  hookStyle: "Empathetic" | "Controversial" | "Story-driven" | "Data-backed";
  suggestedHook: string;
  strategicReason: string;
}

export interface DisruptorData {
  score: number;
  focus: string;
  schedule: DisruptorDay[];
}

// Phase 5: Funnel Optimizer
export interface FunnelTactic {
  id: string;
  title: string;
  problem: string;
  solution: string;
  impact: string;
  difficulty: "Easy" | "Medium" | "Hard";
  status: "Pending" | "Active" | "Complete";
}

// Phase 6: Crowd Hijacker
export interface CrowdTactic {
  id: string;
  title: string;
  audienceState: "Skeptical" | "Frustrated" | "Engaged";
  action: string;
  targetParams: string;
  status: "Ready" | "Actioned";
}

export interface GrowthData {
  tasks: GrowthTask[];
  simulation: GrowthSimulationResult; // Initial state
  disruptor: DisruptorData;
  funnelTactics: FunnelTactic[];
  crowdTactics: CrowdTactic[];
}
