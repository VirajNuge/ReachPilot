import { useCallback, useEffect, useState } from "react";

export interface DashboardBestPost {
  _id?: string;
  platform?: string;
  caption?: string;
  engagementRate?: number;
  postedAt?: string | Date;
}

export function useDashboardBestPosts(accountId: string, limit = 6) {
  const [data, setData] = useState<DashboardBestPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!accountId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/dashboard/best-posts?accountId=${accountId}&limit=${limit}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Unable to load top posts");
      setData(json.posts || []);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "Unable to load top posts");
    } finally {
      setLoading(false);
    }

  }, [accountId, limit]);
  useEffect(() => {
    fetchData();
  }, [accountId, limit, fetchData]);

  return { data, loading, error, refetch: fetchData };
}
