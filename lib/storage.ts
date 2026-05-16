import { RawAnalysisData } from "./types/analysis";

export interface PostAnalysisHistorySession {
  id: string;
  analysisId: string;
  timestamp: string;
  postAuthor: string;
  postHandle: string;
  score: number;
  summary?: string;
  data: any;
}

export interface AnalysisSession {
  id: string;
  timestamp: string; // ISO date string
  profileHandle: string;
  profileName: string;
  score: number;
  data: RawAnalysisData;
}

const STORAGE_KEY = "reachpilot_analysis_history";
const POST_STORAGE_KEY = "reachpilot_post_analysis_history";

// Helper: get user-scoped storage key
const getUserStorageKey = (userId?: string) => {
  if (userId) return `${STORAGE_KEY}_${userId}`;
  return STORAGE_KEY;
};

const getPostStorageKey = (accountId?: string) => {
  if (accountId) return `${POST_STORAGE_KEY}_${accountId}`;
  return POST_STORAGE_KEY;
};

// Try to save to server first, fallback to localStorage
export const saveAnalysis = async (
  data: RawAnalysisData,
  userId?: string,
  accountId?: string,
  extra?: { profileHandle?: string; profileName?: string }
) => {
  if (typeof window === "undefined") return;

  // If user is logged in, attempt server save to new history endpoint
  if (userId) {
    try {
      const body: any = { analysisData: data };
      if (accountId) body.accountId = accountId;
      if (extra?.profileHandle) body.profileHandle = extra.profileHandle;
      if (extra?.profileName) body.profileName = extra.profileName;

      const res = await fetch("/api/analyze/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        // Also save locally for immediate access
        saveToLocalStorage(data, userId);
        return;
      }
    } catch (error) {
      console.error("Failed to save to server history:", error);
    }
  }

  // Fallback: localStorage only
  saveToLocalStorage(data, userId);
};

const saveToLocalStorage = (data: RawAnalysisData, userId?: string) => {
  try {
    const key = getUserStorageKey(userId);
    const existing = getFromLocalStorage(userId);
    const newSession: AnalysisSession = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      profileHandle: data.profile.headline || "Unknown",
      profileName: data.profile.name,
      score: data.profile.profileScore,
      data: data,
    };

    const updated = [newSession, ...existing].slice(0, 20);
    localStorage.setItem(key, JSON.stringify(updated));
    console.log("Analysis saved:", newSession.id);
  } catch (error) {
    console.error("Failed to save analysis:", error);
  }
};

// Fetch history: server-first if logged in, else localStorage
export const fetchAnalysisHistory = async (
  accountId?: string,
  options?: { platform?: string; limit?: number; skip?: number }
): Promise<{ analyses: any[]; total: number; hasMore: boolean }> => {
  if (typeof window === "undefined") return { analyses: [], total: 0, hasMore: false };
  if (!accountId) return { analyses: [], total: 0, hasMore: false };

  const params = new URLSearchParams();
  params.set("accountId", accountId);
  if (options?.platform) params.set("platform", options.platform);
  if (options?.limit) params.set("limit", String(options.limit));
  if (options?.skip) params.set("skip", String(options.skip));

  const res = await fetch(`/api/analyze/history?${params.toString()}`);
  if (!res.ok) {
    throw new Error("Failed to fetch analysis history");
  }
  return res.json();
};

export const fetchAnalysisFull = async (analysisId: string): Promise<any | null> => {
  if (typeof window === "undefined") return null;
  try {
    const res = await fetch(`/api/analyze/${analysisId}`);
    if (!res.ok) return null;
    const json = await res.json();
    return json.analysis || null;
  } catch (e) {
    console.error("Failed to fetch analysis:", e);
    return null;
  }
};

export const savePostAnalysis = async (
  data: any,
  accountId?: string,
  extra?: { analysisId?: string; source?: string },
) => {
  if (typeof window === "undefined" || !accountId) return;

  try {
    const body: any = {
      accountId,
      analysisId: extra?.analysisId || data?.id,
      analysisData: data,
      source: extra?.source || "web",
    };

    const res = await fetch("/api/analyze-post/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      savePostToLocalStorage(data, accountId);
      return;
    }
  } catch (error) {
    console.error("Failed to save to server post history:", error);
  }

  savePostToLocalStorage(data, accountId);
};

export const fetchPostAnalysisHistory = async (
  accountId?: string,
  options?: { platform?: string; limit?: number; skip?: number },
): Promise<{ analyses: PostAnalysisHistorySession[]; total: number; hasMore: boolean }> => {
  if (typeof window === "undefined") return { analyses: [], total: 0, hasMore: false };
  if (!accountId) return { analyses: [], total: 0, hasMore: false };

  try {
    const params = new URLSearchParams();
    params.set("accountId", accountId);
    if (options?.platform) params.set("platform", options.platform);
    if (options?.limit) params.set("limit", String(options.limit));
    if (options?.skip) params.set("skip", String(options.skip));

    const res = await fetch(`/api/analyze-post/history?${params.toString()}`);
    if (res.ok) {
      const json = await res.json();
      return {
        analyses: (json.analyses || []).map((item: any) => ({
          id: item.id,
          analysisId: item.analysisId,
          timestamp: item.timestamp,
          postAuthor: item.postAuthor,
          postHandle: item.postHandle,
          score: item.score ?? 0,
          summary: item.summary,
          data: item,
        })),
        total: json.total || 0,
        hasMore: !!json.hasMore,
      };
    }
  } catch (error) {
    console.warn("Failed to fetch server post history, falling back to local:", error);
  }

  return getPostHistory(accountId);
};

// Backwards-compatible getHistory that falls back to localStorage when needed
export const getHistory = async (userId?: string): Promise<AnalysisSession[]> => {
  if (typeof window === "undefined") return [];
  // If userId is provided but account-level ID isn't known here, keep using localStorage
  return getFromLocalStorage(userId);
};

const getFromLocalStorage = (userId?: string): AnalysisSession[] => {
  try {
    const key = getUserStorageKey(userId);
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Failed to load history:", error);
    return [];
  }
};

// Synchronous version for backward compatibility (components that can't be async)
export const getHistorySync = (userId?: string): AnalysisSession[] => {
  return getFromLocalStorage(userId);
};

export const getAnalysisById = (
  id: string,
  userId?: string
): AnalysisSession | undefined => {
  const history = getFromLocalStorage(userId);
  return history.find((s) => s.id === id);
};

export const clearHistory = async (userId?: string) => {
  if (typeof window === "undefined") return;

  if (userId) {
    try {
      await fetch("/api/sessions", { method: "DELETE" });
    } catch (error) {
      console.error("Failed to clear server sessions:", error);
    }
  }

  const key = getUserStorageKey(userId);
  localStorage.removeItem(key);
};

const getPostHistorySync = (accountId?: string): PostAnalysisHistorySession[] => {
  try {
    const key = getPostStorageKey(accountId);
    const stored = localStorage.getItem(key);
    return stored ? (JSON.parse(stored) as PostAnalysisHistorySession[]) : [];
  } catch (error) {
    console.error("Failed to load post history:", error);
    return [];
  }
};

const savePostToLocalStorage = (data: any, accountId?: string) => {
  try {
    const key = getPostStorageKey(accountId);
    const existing = getPostHistorySync(accountId);
    const analysisId = data?.id || crypto.randomUUID();
    const newSession: PostAnalysisHistorySession = {
      id: analysisId,
      analysisId,
      timestamp: data?.timestamp || new Date().toISOString(),
      postAuthor: data?.postData?.author || "Unknown",
      postHandle: data?.postData?.handle || "",
      score: data?.postData?.metrics?.views || 0,
      summary:
        data?.analysis?.viralVelocity?.growthPrediction ||
        data?.analysis?.sentiment?.dominantEmotion ||
        "Post analysis completed",
      data,
    };

    const updated = [newSession, ...existing.filter((item) => item.analysisId !== newSession.analysisId)].slice(0, 20);
    localStorage.setItem(key, JSON.stringify(updated));
  } catch (error) {
    console.error("Failed to save post analysis:", error);
  }
};

export const getPostHistory = async (
  accountId?: string,
): Promise<{ analyses: PostAnalysisHistorySession[]; total: number; hasMore: boolean }> => {
  if (typeof window === "undefined") return { analyses: [], total: 0, hasMore: false };
  const analyses = getPostHistorySync(accountId);
  return { analyses, total: analyses.length, hasMore: false };
};
