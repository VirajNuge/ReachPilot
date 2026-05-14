export interface OptimalSlot {
  day: number;
  hour: number;
  minute: number;
  label: string;
  reason: string;
}

export interface OptimalSlotWithMeta extends OptimalSlot {
  score?: number;
  date?: string;
  month?: number;
  year?: number;
}
// Shared types for all platform publishing adapters

export interface PublishPayload {
  /** Platform-specific caption text */
  caption: string;
  /** Publicly accessible image/video URL (legacy) */
  imageUrl?: string;
  /** List of media URLs (for carousels or specific single media) */
  mediaUrls?: string[];
  /** Type of media: 'image', 'video', or 'carousel' */
  mediaType?: "image" | "video" | "carousel";
  /** Optional hashtags to append to caption */
  hashtags?: string[];
}

export interface PublishResult {
  success: boolean;
  /** Native post ID returned by the platform on success */
  platformPostId?: string;
  /** Human-readable error message on failure */
  error?: string;
}
