import { useCallback, useEffect, useState } from "react";

export interface DashboardStats {
  totalPosts: number;
  totalGenerated: number;
  totalAnalyzed: number;
  templatesCount: number;
  ideasCount: number;
  personaCompleteness: number;
}

export function useDashboardStats(accountId: string) {
  const [data, setData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!accountId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/dashboard/stats?accountId=${accountId}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Unable to load workspace stats");
      setData(json.stats || null);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "Unable to load workspace stats");
    } finally {
      setLoading(false);
    }

  }, [accountId]);
  useEffect(() => {
    fetchData();
  }, [accountId, fetchData]);

  return { data, loading, error, refetch: fetchData };
}
