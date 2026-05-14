import { useEffect, useState } from "react";

export interface DashboardTemplateItem {
  _id?: string;
  template?: {
    name?: string;
    category?: string;
  };
  metadata?: {
    usageCount?: number;
  };
}

export function useDashboardTemplates(accountId: string, limit = 4) {
  const [data, setData] = useState<DashboardTemplateItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!accountId) return;
    const fetchData = async () => {
      setLoading(true);
      const res = await fetch(
        `/api/dashboard/templates?accountId=${accountId}&limit=${limit}`
      );
      const json = await res.json();
      setData(json.templates || []);
      setLoading(false);
    };

    fetchData();
  }, [accountId, limit]);

  return { data, loading };
}
