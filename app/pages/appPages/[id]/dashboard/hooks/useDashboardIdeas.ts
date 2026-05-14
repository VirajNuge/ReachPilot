import { useEffect, useState } from "react";

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

  useEffect(() => {
    if (!accountId) return;
    const fetchData = async () => {
      setLoading(true);
      const res = await fetch(`/api/dashboard/ideas?accountId=${accountId}&limit=${limit}`);
      const json = await res.json();
      setData(json.ideas || []);
      setLoading(false);
    };

    fetchData();
  }, [accountId, limit]);

  return { data, loading };
}
