import { useEffect, useState } from "react";

export interface DashboardConfig {
  layout: {
    columns: number;
    sectionOrder: string[];
    hiddenSections: string[];
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

  useEffect(() => {
    if (!accountId) return;
    const fetchConfig = async () => {
      setLoading(true);
      const res = await fetch(`/api/dashboard/config?accountId=${accountId}`);
      const json = await res.json();
      setConfig(json.config);
      setLoading(false);
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
    setConfig(json.config);
    return json.config;
  };

  return { config, setConfig, updateConfig, loading };
}
