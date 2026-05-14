import { useEffect, useState } from "react";

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

  useEffect(() => {
    if (!accountId) return;
    const fetchData = async () => {
      setLoading(true);
      const res = await fetch(
        `/api/dashboard/best-posts?accountId=${accountId}&limit=${limit}`
      );
      const json = await res.json();
      setData(json.posts || []);
      setLoading(false);
    };

    fetchData();
  }, [accountId, limit]);

  return { data, loading };
}
