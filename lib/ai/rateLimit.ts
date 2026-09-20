type Bucket = { startedAt: number; count: number };

const buckets = new Map<string, Bucket>();
const WINDOW_MS = 60_000;

export function consumeAiRateLimit(key: string, limit = 60): boolean {
  if (!Number.isFinite(limit) || limit <= 0) return true;

  const now = Date.now();
  const current = buckets.get(key);
  if (!current || now - current.startedAt >= WINDOW_MS) {
    buckets.set(key, { startedAt: now, count: 1 });
    return true;
  }

  if (current.count >= limit) return false;
  current.count += 1;
  return true;
}

export function clearAiRateLimitBuckets(): void {
  buckets.clear();
}
