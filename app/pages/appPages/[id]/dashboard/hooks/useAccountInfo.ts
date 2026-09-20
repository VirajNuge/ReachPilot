import { useCallback, useEffect, useState } from "react";

export interface AccountInfo {
  _id?: string;
  name?: string;
}

export function useAccountInfo(accountId: string) {
  const [data, setData] = useState<AccountInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!accountId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/accounts/${accountId}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Unable to load workspace");
      setData(json.account || null);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "Unable to load workspace");
    } finally {
      setLoading(false);
    }
  }, [accountId]);

  useEffect(() => {
    fetchData();
  }, [accountId, fetchData]);

  return { data, loading, error, refetch: fetchData };
}
