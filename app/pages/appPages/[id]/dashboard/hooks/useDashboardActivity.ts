import { useCallback, useEffect, useState } from "react";

export interface DashboardActivityItem {
  id: string;
  title: string;
  preview: string;
  status: string;
  platform: string;
  time: string | Date;
  metric?: string;
}

export function useDashboardActivity(accountId: string, limit = 10) {
  const [data, setData] = useState<DashboardActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!accountId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/dashboard/activity?accountId=${accountId}&limit=${limit}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Unable to load recent activity");
      setData(json.activities || []);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "Unable to load recent activity");
    } finally {
      setLoading(false);
    }

  }, [accountId, limit]);
  useEffect(() => {
    fetchData();
  }, [accountId, limit, fetchData]);

  return { data, loading, error, refetch: fetchData };
}
