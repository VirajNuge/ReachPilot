import type { PostGenerationDocument } from "@/lib/types/postGeneration";
import type { PostDraft, Platform, PostHashtags } from "./types";

/**
 * Transform a backend PostGenerationDocument into a frontend PostDraft.
 * Returns null if the document has no output (incomplete generation).
 */
export function postGenerationToPostDraft(
  doc: PostGenerationDocument
): PostDraft | null {
  const id = doc._id?.toString();
  if (!id) return null;

  // Build title: prefer headline from output, fall back to coreMessage
  const title =
    doc.output?.headline ??
    (doc.input?.coreMessage && doc.input.coreMessage.length > 50
      ? doc.input.coreMessage.slice(0, 50) + "…"
      : doc.input?.coreMessage ?? "Custom Post");

  // Platforms — PostPlatform and Platform are identical unions
  const inputPlatforms = doc.input?.platforms ?? [];
  const outputPlatforms = Object.keys(doc.output?.captions ?? {});
  const platforms = (inputPlatforms.length > 0 ? inputPlatforms : outputPlatforms) as Platform[];

  // Captions — direct pass-through (Record<string, string> → Partial<Record<Platform, string>>)
  const captions = (doc.output?.captions ?? {}) as Partial<Record<Platform, string>>;

  // Hashtags
  const hashtags: PostHashtags = doc.output?.hashtags ?? {
    highReach: [],
    niche: [],
    branded: [],
  };

  // Image
  const imageUrl = doc.output?.imageUrl;

  // Status
  const status = doc.status as PostDraft["status"];

  // Scheduled date — arrives as ISO string from JSON API
  const scheduledDate = doc.scheduledDate
    ? new Date(doc.scheduledDate)
    : undefined;

  return {
    id,
    title,
    platforms,
    captions,
    hashtags,
    imageUrl,
    status,
    scheduledDate,
  };
}

/**
 * Convert an array of backend documents to PostDraft[], filtering out incomplete records.
 */
export function postGenerationsToDrafts(
  docs: PostGenerationDocument[]
): PostDraft[] {
  const results: PostDraft[] = [];
  for (const doc of docs) {
    const draft = postGenerationToPostDraft(doc);
    if (draft) results.push(draft);
  }
  return results;
}
