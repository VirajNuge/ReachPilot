export interface HookCTAProps {
  trigger: string;
  skeleton: string;
  pivotA: string;
  pivotAEngagement: string;
  pivotB: string;
  pivotBEngagement: string;
  pivotC: string;
  pivotCEngagement: string;
  ctaType: string;
  ctaTip: string;
}

export interface RetentionProps {
  segments: {
    text: string;
    retention: string;
    warning?: boolean;
    fix?: string;
  }[];
  seedComments: string[];
}

export interface LeadPersonaProps {
  audienceData: {
    label: string;
    value: number;
    color: string;
  }[];
  highIntentLeads: {
    name: string;
    role: string;
    intent: string;
    avatar: string;
  }[];
  icpAlignment: {
    title: string;
    score: number;
  };
}

export interface CommentGapProps {
  gapData: {
    gap: string;
    frequency: number;
    strategy: string;
  }[];
  confusionPoint: {
    text: string;
    sentiment: string;
    insight: string;
  };
  analysisId?: string;
}

export interface VisualStrategyProps {
  category: string;
  colors: string[];
  prompts: {
    midjourney: string;
    dalle: string;
  };
  // Injected by parent for template saving
  analysisId?: string;
  images?: string[];
}

export interface ViralVelocityProps {
  velocityData: {
    likesPerHour: number;
    trend: string;
    peakTime: string;
    accountAvg: number;
    growthPrediction: string;
  };
}

export interface SentimentProps {
  sentimentData: {
    positive: number;
    constructive: number;
    neutral: number;
    negative: number;
    keywords: string[];
    dominantEmotion: string;
    trustScore: string;
    sarcasmLevel: string;
    isControversial: boolean;
  };
}

export interface CompetitorProps {
  benchmarkData: {
    engagementRate: number;
    accountAvg: number;
    nicheAvg: number;
    isOutlier: boolean;
    botSignal: string;
    followers: string;
  };
}

export interface AnalysisPayload {
  hookCTA: HookCTAProps;
  retention: RetentionProps;
  leadPersona: LeadPersonaProps;
  commentGap: CommentGapProps;
  visualStrategy: VisualStrategyProps;
  viralVelocity: ViralVelocityProps;
  sentiment: SentimentProps;
  competitor: CompetitorProps;
}

export interface PostData {
  author: string;
  handle: string;
  content: string;
  postUrl: string;
  platform: string;
  images?: string[];
  videos?: string[];
  postedAt: string;
  metrics: {
    likes: number;
    replies: number;
    retweets: number;
    views: number;
  };
  comments: {
    user: string;
    text: string;
    timestamp?: string;
    engagement?: {
      likes: number;
    };
  }[];
  commentCount?: number;
}

export interface FullAnalysisData {
  id: string;
  analysis: AnalysisPayload;
  postData: PostData;
  timestamp: string;
}
