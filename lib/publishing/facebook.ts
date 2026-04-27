/**
 * Facebook Pages publishing adapter.
 * Publishes to a Facebook Page using a Page Access Token.
 * Requires pageId and pageAccessToken stored during OAuth.
 */
import type { PublishPayload, PublishResult } from "./types";

const GRAPH_API = "https://graph.facebook.com/v19.0";

type MetaErrorShape = {
  message?: string;
  code?: number;
  error_subcode?: number;
  type?: string;
};

function formatMetaError(error?: MetaErrorShape, fallback?: string): string {
  if (!error) return fallback ?? "Facebook API error";
  const parts = [error.message ?? fallback ?? "Facebook API error"];
  if (typeof error.code === "number") parts.push(`code=${error.code}`);
  if (typeof error.error_subcode === "number") parts.push(`subcode=${error.error_subcode}`);
  if (error.type) parts.push(`type=${error.type}`);
  return parts.join(" | ");
}

export async function publishToFacebook(
  pageAccessToken: string,
  pageId: string,
  payload: PublishPayload
): Promise<PublishResult> {
  try {
    let endpoint: string;
    let body: Record<string, string>;

    if (payload.imageUrl) {
      // POST photo with caption — creates a photo post on the Page
      endpoint = `${GRAPH_API}/${pageId}/photos`;
      body = {
        url: payload.imageUrl,
        message: payload.caption,
        access_token: pageAccessToken,
      };
    } else {
      // Text-only post to the Page feed
      endpoint = `${GRAPH_API}/${pageId}/feed`;
      body = {
        message: payload.caption,
        access_token: pageAccessToken,
      };
    }

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(body).toString(),
    });

    const data = await res.json();

    const metaError = (data as { error?: MetaErrorShape }).error;
    if (!res.ok || metaError) {
      const errMsg = formatMetaError(metaError, `Facebook API error ${res.status}`);
      return { success: false, error: errMsg };
    }

    // Graph API returns { id: "page_post_id" } or { post_id: "..." }
    const postId = (data as { id?: string; post_id?: string }).id ||
      (data as { post_id?: string }).post_id;
    return { success: true, platformPostId: postId };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Facebook publish failed" };
  }
}
