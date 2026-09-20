import { useCallback, useEffect, useState } from "react";

export interface DashboardKPIs {
  kpis: Record<string, { current: number; previous: number; growth: number; trend: string }>;
}

export function useDashboardKPIs(accountId: string, period: string) {
  const [data, setData] = useState<DashboardKPIs | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (force = false) => {
    if (!accountId) return;
    setLoading(true);
    setError(null);
    try {
      const endpoint = force ? "/api/dashboard/kpis/refresh" : "/api/dashboard/kpis";
      const res = force
        ? await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ accountId, period }) })
        : await fetch(`${endpoint}?accountId=${accountId}&period=${period}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Unable to load metrics");
      setData(json.data || null);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "Unable to load metrics");
    } finally {
      setLoading(false);
    }
  }, [accountId, period]);

  useEffect(() => {
    load(false);
  }, [accountId, period, load]);

  return { data, loading, error, refresh: () => load(true), refetch: () => load(false) };
}
