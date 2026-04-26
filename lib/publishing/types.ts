// Shared types for all platform publishing adapters

export interface PublishPayload {
  /** Platform-specific caption text */
  caption: string;
  /** Publicly accessible image URL (AI-generated or CDN-hosted) */
  imageUrl?: string;
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
