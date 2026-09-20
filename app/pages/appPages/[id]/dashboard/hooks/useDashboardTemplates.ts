import { useCallback, useEffect, useState } from "react";

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
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!accountId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/dashboard/templates?accountId=${accountId}&limit=${limit}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Unable to load templates");
      setData(json.templates || []);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "Unable to load templates");
    } finally {
      setLoading(false);
    }

  }, [accountId, limit]);
  useEffect(() => {
    fetchData();
  }, [accountId, limit, fetchData]);

  return { data, loading, error, refetch: fetchData };
}
