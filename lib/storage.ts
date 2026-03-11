import { RawAnalysisData } from "./types/analysis";

export interface AnalysisSession {
  id: string;
  timestamp: string; // ISO date string
  profileHandle: string;
  profileName: string;
  score: number;
  data: RawAnalysisData;
}

const STORAGE_KEY = "reachpilot_analysis_history";

// Helper: get user-scoped storage key
const getUserStorageKey = (userId?: string) => {
  if (userId) return `${STORAGE_KEY}_${userId}`;
  return STORAGE_KEY;
};

// Try to save to server first, fallback to localStorage
export const saveAnalysis = async (
  data: RawAnalysisData,
  userId?: string
) => {
  if (typeof window === "undefined") return;

  // If user is logged in, save to server
  if (userId) {
    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data }),
      });
      if (res.ok) {
        // Also save locally for immediate access
        saveToLocalStorage(data, userId);
        return;
      }
    } catch (error) {
      console.error("Failed to save to server:", error);
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
export const getHistory = async (
  userId?: string
): Promise<AnalysisSession[]> => {
  if (typeof window === "undefined") return [];

  if (userId) {
    try {
      const res = await fetch("/api/sessions");
      if (res.ok) {
        const data = await res.json();
        return (data.sessions || []).map(
          (s: Record<string, unknown>) => ({
            id: (s.sessionId as string) || (s._id as string),
            timestamp: s.timestamp as string,
            profileHandle: s.profileHandle as string,
            profileName: s.profileName as string,
            score: s.score as number,
            data: s.data as RawAnalysisData,
          })
        );
      }
    } catch (error) {
      console.error("Failed to fetch from server:", error);
    }
  }

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
