import { useEffect, useState } from "react";

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

  useEffect(() => {
    if (!accountId) return;
    const fetchData = async () => {
      setLoading(true);
      const res = await fetch(
        `/api/dashboard/activity?accountId=${accountId}&limit=${limit}`
      );
      const json = await res.json();
      setData(json.activities || []);
      setLoading(false);
    };

    fetchData();
  }, [accountId, limit]);

  return { data, loading };
}
