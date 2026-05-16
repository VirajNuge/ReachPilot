export interface PostAnalysisSnapshot {
  summary?: string;
  topHooks?: string[];
  topGaps?: string[];
  recommendedActions?: string[];
}

export interface PostAnalysisHistoryItem {
  id: string;
  analysisId: string;
  timestamp: string;
  postAuthor: string;
  postHandle: string;
  postPreview?: string;
  platform: string;
  summary?: string;
}

export interface PostAnalysisHistoryResponse {
  analyses: PostAnalysisHistoryItem[];
  total: number;
  hasMore: boolean;
}