import { useEffect, useState } from "react";

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

  useEffect(() => {
    if (!accountId) return;
    const fetchData = async () => {
      setLoading(true);
      const res = await fetch(
        `/api/dashboard/analytics?accountId=${accountId}&lookback=${lookback}`
      );
      const json = await res.json();
      setData(json.data);
      setLoading(false);
    };

    fetchData();
  }, [accountId, lookback]);

  return { data, loading };
}
