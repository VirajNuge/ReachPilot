import { useEffect, useState } from "react";

export interface DashboardPublishingStatus {
  drafts: number;
  scheduled: number;
  failed: number;
  nextPublish?: string | null;
}

export function useDashboardPublishing(accountId: string) {
  const [data, setData] = useState<DashboardPublishingStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!accountId) return;
    const fetchData = async () => {
      setLoading(true);
      const res = await fetch(`/api/dashboard/publishing?accountId=${accountId}`);
      const json = await res.json();
      setData(json.data);
      setLoading(false);
    };

    fetchData();
  }, [accountId]);

  return { data, loading };
}
