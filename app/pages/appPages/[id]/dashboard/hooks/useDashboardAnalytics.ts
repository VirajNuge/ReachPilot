import { useCallback, useEffect, useState } from "react";

export interface DashboardAnalytics {
  impressions: number;
  engagement: number;
  engagementRate: number;
  topPlatform: string;
  trend: number[];
}

export function useDashboardAnalytics(accountId: string, lookback: number) {
  const [data, setData] = useState<DashboardAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!accountId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/dashboard/analytics?accountId=${accountId}&lookback=${lookback}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Unable to load analytics");
      setData(json.data || null);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "Unable to load analytics");
    } finally {
      setLoading(false);
    }
  }, [accountId, lookback]);

  useEffect(() => {
    fetchData();
  }, [accountId, lookback, fetchData]);

  return { data, loading, error, refetch: fetchData };
}
