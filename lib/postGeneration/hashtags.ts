import type { PostPackage } from "@/lib/types/postGeneration";

type HashtagGroup = NonNullable<PostPackage["hashtags"]>;
type HashtagGroupKey = keyof HashtagGroup;

const GROUP_ORDER: HashtagGroupKey[] = ["highReach", "niche", "branded"];

function normalizeOne(tag: string): string {
  const stripped = tag.trim().replace(/^#+/, "").replace(/\s+/g, "");
  if (!stripped) return "";
  return `#${stripped}`;
}

function uniqueNormalized(tags: string[], seen: Set<string>): string[] {
  const output: string[] = [];
  for (const tag of tags) {
    const normalized = normalizeOne(tag);
    if (!normalized) continue;
    const dedupeKey = normalized.toLowerCase();
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);
    output.push(normalized);
  }
  return output;
}

export function normalizeGroupedHashtags(hashtags: Partial<HashtagGroup> | undefined): HashtagGroup {
  const seen = new Set<string>();
  const normalized: HashtagGroup = {
    highReach: uniqueNormalized(hashtags?.highReach ?? [], seen),
    niche: uniqueNormalized(hashtags?.niche ?? [], seen),
    branded: uniqueNormalized(hashtags?.branded ?? [], seen),
  };
  return normalized;
}

export function flattenGroupedHashtags(hashtags: Partial<HashtagGroup> | undefined): string[] {
  const normalized = normalizeGroupedHashtags(hashtags);
  return GROUP_ORDER.flatMap((group) => normalized[group]);
}

