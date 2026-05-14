import { useEffect, useState } from "react";

export interface AccountInfo {
  _id?: string;
  name?: string;
}

export function useAccountInfo(accountId: string) {
  const [data, setData] = useState<AccountInfo | null>(null);

  useEffect(() => {
    if (!accountId) return;
    const fetchData = async () => {
      const res = await fetch(`/api/accounts/${accountId}`);
      const json = await res.json();
      setData(json.account || null);
    };

    fetchData();
  }, [accountId]);

  return { data };
}
