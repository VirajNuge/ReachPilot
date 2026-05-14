/**
 * Threads publishing adapter.
 * Uses the Threads Graph API — same two-step container pattern as Instagram.
 *  1. POST /{threadsUserId}/threads        → create container
 *  2. POST /{threadsUserId}/threads_publish → publish container
 */
import type { PublishPayload, PublishResult } from "./types";

const THREADS_API = "https://graph.threads.net/v1.0";

/** Poll for container readiness (max 20 retries × 3 s) */
async function waitForContainer(
  containerId: string,
  accessToken: string,
  maxRetries = 20
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
    const mediaUrls = payload.mediaUrls || (payload.imageUrl ? [payload.imageUrl] : []);
    const isCarousel = payload.mediaType === "carousel" || mediaUrls.length > 1;
    const isVideo = payload.mediaType === "video" || (mediaUrls.length > 0 && mediaUrls[0].toLowerCase().match(/\.(mp4|mov)$/));

    let containerId: string;

    if (isCarousel) {
      // 1. Create individual containers for carousel items
      const childIds: string[] = [];
      for (const url of mediaUrls.slice(0, 20)) {
        const itemParams = new URLSearchParams({
          is_carousel_item: "true",
          access_token: accessToken,
        });

        const isChildVideo = url.toLowerCase().match(/\.(mp4|mov)$/);
        if (isChildVideo) {
          itemParams.set("media_type", "VIDEO");
          itemParams.set("video_url", url);
        } else {
          itemParams.set("media_type", "IMAGE");
          itemParams.set("image_url", url);
        }

        const itemRes = await fetch(`${THREADS_API}/${platformUserId}/threads`, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: itemParams.toString(),
        });

        const itemData = await itemRes.json() as { id?: string; error?: { message: string } };
        if (!itemRes.ok || !itemData.id) {
          throw new Error(itemData.error?.message || `Threads carousel item creation failed (${itemRes.status})`);
        }
        childIds.push(itemData.id);
      }

      // 2. Create carousel container
      const carouselRes = await fetch(`${THREADS_API}/${platformUserId}/threads`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          media_type: "CAROUSEL",
          children: childIds.join(","),
          text: payload.caption || "",
          access_token: accessToken,
        }).toString(),
      });

      const carouselData = await carouselRes.json() as { id?: string; error?: { message: string } };
      if (!carouselRes.ok || !carouselData.id) {
        throw new Error(carouselData.error?.message || `Threads carousel creation failed (${carouselRes.status})`);
      }
      containerId = carouselData.id;
    } else {
      // Single Image, Video, or Text
      const params = new URLSearchParams({
        access_token: accessToken,
        text: payload.caption || "",
      });

      if (isVideo) {
        params.set("media_type", "VIDEO");
        params.set("video_url", mediaUrls[0]);
      } else if (mediaUrls.length > 0) {
        params.set("media_type", "IMAGE");
        params.set("image_url", mediaUrls[0]);
      } else {
        params.set("media_type", "TEXT");
      }

      const res = await fetch(`${THREADS_API}/${platformUserId}/threads`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params.toString(),
      });

      const data = await res.json() as { id?: string; error?: { message: string } };
      if (!res.ok || !data.id) {
        throw new Error(data.error?.message || `Threads container creation failed (${res.status})`);
      }
      containerId = data.id;
    }

    // Step 2: Wait for readiness (required for media)
    if (isCarousel || isVideo || mediaUrls.length > 0) {
      const ready = await waitForContainer(containerId, accessToken);
      if (!ready) {
        return { success: false, error: "Threads media container timed out or failed processing" };
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

