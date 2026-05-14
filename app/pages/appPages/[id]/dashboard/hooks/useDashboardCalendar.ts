import { useEffect, useState } from "react";

export interface DashboardCalendarItem {
  date: string;
  count: number;
  status: string;
}

export function useDashboardCalendar(accountId: string, daysAhead = 14) {
  const [data, setData] = useState<DashboardCalendarItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!accountId) return;
    const fetchData = async () => {
      setLoading(true);
      const res = await fetch(
        `/api/dashboard/calendar?accountId=${accountId}&daysAhead=${daysAhead}`
      );
      const json = await res.json();
      const calendar = json.calendar || {};
      const items = Object.entries(calendar).map(([date, value]: any) => ({
        date,
        count: value.count,
        status: value.status,
      }));
      setData(items);
      setLoading(false);
    };

    fetchData();
  }, [accountId, daysAhead]);

  return { data, loading };
}
