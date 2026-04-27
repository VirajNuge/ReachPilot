/**
 * Instagram Business publishing adapter.
 * Uses the two-step Instagram Graph API flow:
 *  1. Create a media container (POST /{igBusinessId}/media)
 *  2. Publish the container  (POST /{igBusinessId}/media_publish)
 *
 * Requires igBusinessId (stored as pageId) and pageAccessToken.
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
  if (!error) return fallback ?? "Instagram API error";
  const parts = [error.message ?? fallback ?? "Instagram API error"];
  if (typeof error.code === "number") parts.push(`code=${error.code}`);
  if (typeof error.error_subcode === "number") parts.push(`subcode=${error.error_subcode}`);
  if (error.type) parts.push(`type=${error.type}`);
  return parts.join(" | ");
}

/** Poll for container readiness (max 10 retries × 3 s) */
async function waitForContainer(
  containerId: string,
  accessToken: string,
  maxRetries = 10
): Promise<boolean> {
  for (let i = 0; i < maxRetries; i++) {
    await new Promise((r) => setTimeout(r, 3000));
    const res = await fetch(
      `${GRAPH_API}/${containerId}?fields=status_code&access_token=${accessToken}`
    );
    const data = await res.json() as { status_code?: string };
    if (data.status_code === "FINISHED") return true;
    if (data.status_code === "ERROR" || data.status_code === "EXPIRED") return false;
  }
  return false;
}

export async function publishToInstagram(
  pageAccessToken: string,
  igBusinessId: string,
  payload: PublishPayload
): Promise<PublishResult> {
  try {
    if (!payload.imageUrl) {
      return { success: false, error: "Instagram requires an image to publish" };
    }

    // Step 1: Create media container
    const containerParams = new URLSearchParams({
      image_url: payload.imageUrl,
      caption: payload.caption,
      access_token: pageAccessToken,
    });

    const containerRes = await fetch(
      `${GRAPH_API}/${igBusinessId}/media`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: containerParams.toString(),
      }
    );

    const containerData = await containerRes.json() as { id?: string; error?: MetaErrorShape };
    if (!containerRes.ok || containerData.error) {
      return {
        success: false,
        error: formatMetaError(containerData.error, `IG container creation failed (${containerRes.status})`),
      };
    }

    const containerId = containerData.id!;

    // Step 2: Wait for container to be ready
    const ready = await waitForContainer(containerId, pageAccessToken);
    if (!ready) {
      return { success: false, error: "Instagram media container timed out or failed processing" };
    }

    // Step 3: Publish container
    const publishParams = new URLSearchParams({
      creation_id: containerId,
      access_token: pageAccessToken,
    });

    const publishRes = await fetch(
      `${GRAPH_API}/${igBusinessId}/media_publish`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: publishParams.toString(),
      }
    );

    const publishData = await publishRes.json() as { id?: string; error?: MetaErrorShape };
    if (!publishRes.ok || publishData.error) {
      return {
        success: false,
        error: formatMetaError(publishData.error, `IG publish failed (${publishRes.status})`),
      };
    }

    return { success: true, platformPostId: publishData.id };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Instagram publish failed" };
  }
}
