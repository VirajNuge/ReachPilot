import { useCallback, useEffect, useState } from "react";

export interface DashboardCalendarItem {
  date: string;
  count: number;
  status: string;
}

export function useDashboardCalendar(accountId: string, daysAhead = 14) {
  const [data, setData] = useState<DashboardCalendarItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!accountId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/dashboard/calendar?accountId=${accountId}&daysAhead=${daysAhead}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Unable to load calendar");
      const calendar = json.calendar || {};
      setData(Object.entries(calendar).map(([date, value]: any) => ({ date, count: value.count, status: value.status })));
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "Unable to load calendar");
    } finally {
      setLoading(false);
    }

  }, [accountId, daysAhead]);
  useEffect(() => {
    fetchData();
  }, [accountId, daysAhead, fetchData]);

  return { data, loading, error, refetch: fetchData };
}
