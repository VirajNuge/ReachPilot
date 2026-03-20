import { useState, useEffect } from "react";
import { RawAnalysisData } from "../lib/types/analysis";

interface UseAnalysisResult {
  data: RawAnalysisData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useAnalysisData(initialData?: any): UseAnalysisResult {
  const [data, setData] = useState<RawAnalysisData | null>(initialData || null);
  const [loading, setLoading] = useState<boolean>(!initialData);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // The GET endpoint returns the cached analysis written by the extension.
      // It always responds with a complete JSON body (not a stream), so we use
      // response.json() here. The POST /api/analyze endpoint uses streaming but
      // is not called from this hook.
      const response = await fetch("/api/analyze-extension");

      interface ApiResponse {
        success: boolean;
        analysis: RawAnalysisData;
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
      } else {
        setError(result.error || "Failed to fetch analysis data");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
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
  }, []);

  return { data, loading, error, refetch: fetchData };
}
