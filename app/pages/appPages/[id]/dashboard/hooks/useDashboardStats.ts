import { useEffect, useState } from "react";

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

  useEffect(() => {
    if (!accountId) return;
    const fetchData = async () => {
      setLoading(true);
      const res = await fetch(`/api/dashboard/stats?accountId=${accountId}`);
      const json = await res.json();
      setData(json.stats);
      setLoading(false);
    };

    fetchData();
  }, [accountId]);

  return { data, loading };
}
