/**
 * Instagram Business publishing adapter.
 * Uses the two-step Instagram Graph API flow:
 *  1. Create a media container (POST /{igBusinessId}/media)
 *  2. Publish the container  (POST /{igBusinessId}/media_publish)
 *
 * Requires igBusinessId (stored as pageId) and pageAccessToken.
 */
import type { PublishPayload, PublishResult } from "./types";

const GRAPH_API = "https://graph.facebook.com/v21.0";

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

/** Poll for container readiness (max 20 retries × 3 s) */
async function waitForContainer(
  containerId: string,
  accessToken: string,
  maxRetries = 20
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
    const mediaUrls = payload.mediaUrls || (payload.imageUrl ? [payload.imageUrl] : []);
    if (mediaUrls.length === 0) {
      return { success: false, error: "Instagram requires at least one media URL to publish" };
    }

    const isCarousel = payload.mediaType === "carousel" || mediaUrls.length > 1;
    const isVideo = payload.mediaType === "video" || mediaUrls[0].toLowerCase().match(/\.(mp4|mov)$/);

    let containerId: string;

    if (isCarousel) {
      // 1. Create item containers for each media
      const childIds: string[] = [];
      for (const url of mediaUrls.slice(0, 10)) {
        const itemParams = new URLSearchParams({
          is_carousel_item: "true",
          access_token: pageAccessToken,
        });
        
        const isChildVideo = url.toLowerCase().match(/\.(mp4|mov)$/);
        if (isChildVideo) {
          itemParams.set("media_type", "VIDEO");
          itemParams.set("video_url", url);
        } else {
          itemParams.set("image_url", url);
        }

        const itemRes = await fetch(`${GRAPH_API}/${igBusinessId}/media`, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: itemParams.toString(),
        });
        const itemData = await itemRes.json() as { id?: string; error?: MetaErrorShape };
        if (!itemRes.ok || !itemData.id) {
          throw new Error(formatMetaError(itemData.error, `Carousel item creation failed (${itemRes.status})`));
        }
        childIds.push(itemData.id);
      }

      // 2. Create the carousel container
      const carouselParams = new URLSearchParams({
        media_type: "CAROUSEL",
        caption: payload.caption || "",
        children: childIds.join(","),
        access_token: pageAccessToken,
      });

      const carouselRes = await fetch(`${GRAPH_API}/${igBusinessId}/media`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: carouselParams.toString(),
      });
      const carouselData = await carouselRes.json() as { id?: string; error?: MetaErrorShape };
      if (!carouselRes.ok || !carouselData.id) {
        throw new Error(formatMetaError(carouselData.error, `Carousel creation failed (${carouselRes.status})`));
      }
      containerId = carouselData.id;
    } else {
      // Single Image or Video/Reel
      const params = new URLSearchParams({
        caption: payload.caption || "",
        access_token: pageAccessToken,
      });

      if (isVideo) {
        params.set("media_type", "REELS");
        params.set("video_url", mediaUrls[0]);
      } else {
        params.set("image_url", mediaUrls[0]);
      }

      const res = await fetch(`${GRAPH_API}/${igBusinessId}/media`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params.toString(),
      });
      const data = await res.json() as { id?: string; error?: MetaErrorShape };
      if (!res.ok || !data.id) {
        throw new Error(formatMetaError(data.error, `Media container creation failed (${res.status})`));
      }
      containerId = data.id;
    }

    // Step 2: Wait for container to be ready
    const ready = await waitForContainer(containerId, pageAccessToken);
    if (!ready) {
      return { success: false, error: "Instagram media container timed out or failed processing. Check media format/size." };
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

