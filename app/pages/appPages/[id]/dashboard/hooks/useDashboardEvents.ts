import { useCallback } from "react";

export function useDashboardEvents(accountId: string) {
  const track = useCallback(
    async (event: string, metadata?: Record<string, unknown>) => {
      if (!accountId) return;
      await fetch("/api/dashboard/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId, event, metadata }),
      });
    },
    [accountId]
  );

  return { track };
}
