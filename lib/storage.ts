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

export const saveAnalysis = (data: RawAnalysisData) => {
  if (typeof window === "undefined") return;

  try {
    const existing = getHistory();
    const newSession: AnalysisSession = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      profileHandle: data.profile.headline || "Unknown", // Fallback if no handle
      profileName: data.profile.name,
      score: data.profile.profileScore,
      data: data,
    };

    // Add to top, keep max 20
    const updated = [newSession, ...existing].slice(0, 20);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    console.log("Analysis saved:", newSession.id);
  } catch (error) {
    console.error("Failed to save analysis:", error);
  }
};

export const getHistory = (): AnalysisSession[] => {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Failed to load history:", error);
    return [];
  }
};

export const getAnalysisById = (id: string): AnalysisSession | undefined => {
  const history = getHistory();
  return history.find((s) => s.id === id);
};

export const clearHistory = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
};
