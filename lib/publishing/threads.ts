/**
 * Threads publishing adapter.
 * Uses the Threads Graph API — same two-step container pattern as Instagram.
 *  1. POST /{threadsUserId}/threads        → create container
 *  2. POST /{threadsUserId}/threads_publish → publish container
 */
import type { PublishPayload, PublishResult } from "./types";

const THREADS_API = "https://graph.threads.net/v1.0";

/** Poll for container readiness (max 10 retries × 3 s) */
async function waitForContainer(
  containerId: string,
  accessToken: string,
  maxRetries = 10
): Promise<boolean> {
  for (let i = 0; i < maxRetries; i++) {
    await new Promise((r) => setTimeout(r, 3000));
    const res = await fetch(
      `${THREADS_API}/${containerId}?fields=status,error_message&access_token=${accessToken}`
    );
    const data = await res.json() as { status?: string };
    if (data.status === "FINISHED") return true;
    if (data.status === "ERROR" || data.status === "EXPIRED") return false;
  }
  return false;
}

export async function publishToThreads(
  accessToken: string,
  platformUserId: string,
  payload: PublishPayload
): Promise<PublishResult> {
  try {
    // Step 1: Create container
    const containerParams: Record<string, string> = {
      access_token: accessToken,
    };

    if (payload.imageUrl) {
      containerParams.media_type = "IMAGE";
      containerParams.image_url = payload.imageUrl;
      containerParams.text = payload.caption;
    } else {
      containerParams.media_type = "TEXT";
      containerParams.text = payload.caption;
    }

    const containerRes = await fetch(
      `${THREADS_API}/${platformUserId}/threads`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(containerParams).toString(),
      }
    );

    const containerData = await containerRes.json() as { id?: string; error?: { message: string } };
    if (!containerRes.ok || containerData.error) {
      return {
        success: false,
        error: containerData.error?.message || `Threads container creation failed (${containerRes.status})`,
      };
    }

    const containerId = containerData.id!;

    // Step 2: Wait for readiness (required for media, instant for text)
    if (payload.imageUrl) {
      const ready = await waitForContainer(containerId, accessToken);
      if (!ready) {
        return { success: false, error: "Threads media container timed out" };
      }
    }

    // Step 3: Publish
    const publishRes = await fetch(
      `${THREADS_API}/${platformUserId}/threads_publish`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          creation_id: containerId,
          access_token: accessToken,
        }).toString(),
      }
    );

    const publishData = await publishRes.json() as { id?: string; error?: { message: string } };
    if (!publishRes.ok || publishData.error) {
      return {
        success: false,
        error: publishData.error?.message || `Threads publish failed (${publishRes.status})`,
      };
    }

    return { success: true, platformPostId: publishData.id };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Threads publish failed" };
  }
}
