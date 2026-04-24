export function formatCompactNumber(value: number): string {
  if (!Number.isFinite(value)) return "0";
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}k`;
  return `${value}`;
}

export function formatPercent(value: number, decimals = 1): string {
  if (!Number.isFinite(value)) return "0%";
  return `${value.toFixed(decimals)}%`;
}
