import { useState, useEffect } from "react";
import { RawAnalysisData } from "../lib/types/analysis";

interface UseAnalysisResult {
  data: RawAnalysisData | null;
  platform: string | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useAnalysisData(initialData?: any, historyId?: string): UseAnalysisResult {
  const [data, setData] = useState<RawAnalysisData | null>(initialData || null);
  const [platform, setPlatform] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(!initialData);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (historyId) {
        const res = await fetch(`/api/analyze/${historyId}`);
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          setError(body.error || "Failed to load history analysis");
          return;
        }
        const body = await res.json();
        if (body.success && body.analysis) {
          setData(body.analysis);
          return;
        }
        setError(body.error || "Failed to load history analysis");
        return;
      }

      // The GET endpoint returns the cached analysis written by the extension.
      // It always responds with a complete JSON body (not a stream), so we use
      // response.json() here. The POST /api/analyze endpoint uses streaming but
      // is not called from this hook.
      const response = await fetch("/api/analyze-extension");

      interface ApiResponse {
        success: boolean;
        analysis: RawAnalysisData;
        platform?: string;
        error?: string;
      }

      if (!response.ok) {
        const result: ApiResponse = await response.json();
        setError(result.error || "Failed to fetch analysis data");
        return;
      }

      const result: ApiResponse = await response.json();

      if (result.success && result.analysis) {
        setData(result.analysis);
        setPlatform(result.platform ?? null);
      } else {
        setError(result.error || "Failed to fetch analysis data");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialData) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [historyId]);

  return { data, platform, loading, error, refetch: fetchData };
}
