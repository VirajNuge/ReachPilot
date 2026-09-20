import { useCallback, useEffect, useState } from "react";

export interface DashboardPublishingStatus {
  drafts: number;
  scheduled: number;
  failed: number;
  nextPublish?: string | null;
}

export function useDashboardPublishing(accountId: string) {
  const [data, setData] = useState<DashboardPublishingStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!accountId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/dashboard/publishing?accountId=${accountId}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Unable to load publishing status");
      setData(json.data || null);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "Unable to load publishing status");
    } finally {
      setLoading(false);
    }

  }, [accountId]);
  useEffect(() => {
    fetchData();
  }, [accountId, fetchData]);

  return { data, loading, error, refetch: fetchData };
}
