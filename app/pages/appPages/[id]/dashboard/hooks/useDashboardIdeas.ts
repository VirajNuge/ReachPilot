import { useCallback, useEffect, useState } from "react";

export interface DashboardIdeaItem {
  _id?: string;
  idea?: {
    title?: string;
  };
  mode?: string;
}

export function useDashboardIdeas(accountId: string, limit = 4) {
  const [data, setData] = useState<DashboardIdeaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!accountId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/dashboard/ideas?accountId=${accountId}&limit=${limit}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Unable to load ideas");
      setData(json.ideas || []);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "Unable to load ideas");
    } finally {
      setLoading(false);
    }

  }, [accountId, limit]);
  useEffect(() => {
    fetchData();
  }, [accountId, limit, fetchData]);

  return { data, loading, error, refetch: fetchData };
}
