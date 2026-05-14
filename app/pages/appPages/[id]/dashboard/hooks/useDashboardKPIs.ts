import { useEffect, useState } from "react";

export interface DashboardKPIs {
  kpis: Record<string, { current: number; previous: number; growth: number; trend: string }>;
}

export function useDashboardKPIs(accountId: string, period: string) {
  const [data, setData] = useState<DashboardKPIs | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async (force = false) => {
    if (!accountId) return;
    setLoading(true);
    const endpoint = force ? "/api/dashboard/kpis/refresh" : "/api/dashboard/kpis";
    const res = force
      ? await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accountId, period }),
        })
      : await fetch(`${endpoint}?accountId=${accountId}&period=${period}`);

    const json = await res.json();
    setData(json.data);
    setLoading(false);
  };

  useEffect(() => {
    load(false);
  }, [accountId, period]);

  return { data, loading, refresh: () => load(true) };
}
