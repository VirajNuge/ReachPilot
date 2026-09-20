import { useEffect, useState } from "react";

export interface DashboardConfig {
  layout: {
    columns: number;
    sectionOrder: string[];
    hiddenSections: string[];
    sectionSizes: Record<string, number>;
  };
  timeRange: {
    default: "7days" | "30days" | "90days" | "all";
    analyticsLookback: number;
    activityFeedDays: number;
    calendarDaysAhead: number;
  };
  kpis: {
    selected: string[];
  };
}

export function useDashboardConfig(accountId: string) {
  const [config, setConfig] = useState<DashboardConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!accountId) return;
    const fetchConfig = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/dashboard/config?accountId=${accountId}`);
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || "Unable to load dashboard settings");
        setConfig(json.config);
      } catch (fetchError) {
        setError(fetchError instanceof Error ? fetchError.message : "Unable to load dashboard settings");
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, [accountId]);

  const updateConfig = async (updates: Partial<DashboardConfig>) => {
    const res = await fetch(`/api/dashboard/config`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accountId, config: updates }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json?.error || "Unable to save dashboard settings");
    setConfig(json.config);
    return json.config;
  };

  return { config, setConfig, updateConfig, loading, error, refetch: async () => {
    if (!accountId) return;
    const res = await fetch(`/api/dashboard/config?accountId=${accountId}`);
    const json = await res.json();
    if (!res.ok) throw new Error(json?.error || "Unable to load dashboard settings");
    setConfig(json.config);
  } };
}
