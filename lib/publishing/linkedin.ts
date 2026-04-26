/**
 * LinkedIn publishing adapter.
 * Uses the UGC Posts API (api.linkedin.com/v2/ugcPosts).
 * Supports text-only and single image posts.
 */
import type { PublishPayload, PublishResult } from "./types";

const API_BASE = "https://api.linkedin.com/v2";

/**
 * Upload an image to LinkedIn's asset system and return the asset URN.
 */
async function uploadLinkedInImage(
  accessToken: string,
  personUrn: string,
  imageUrl: string
): Promise<string | null> {
  try {
    // Step 1: Register upload
    const registerRes = await fetch(`${API_BASE}/assets?action=registerUpload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "X-Restli-Protocol-Version": "2.0.0",
      },
      body: JSON.stringify({
        registerUploadRequest: {
          recipes: ["urn:li:digitalmediaRecipe:feedshare-image"],
          owner: personUrn,
          serviceRelationships: [
            {
              relationshipType: "OWNER",
              identifier: "urn:li:userGeneratedContent",
            },
          ],
        },
      }),
    });

    const registerData = await registerRes.json();
    const uploadUrl: string =
      registerData?.value?.uploadMechanism?.[
        "com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest"
      ]?.uploadUrl;
    const assetUrn: string = registerData?.value?.asset;

    if (!uploadUrl || !assetUrn) return null;

    // Step 2: Download image and PUT to LinkedIn
    const imgRes = await fetch(imageUrl);
    const imgBuffer = await imgRes.arrayBuffer();

    await fetch(uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": "image/jpeg" },
      body: imgBuffer,
    });

    return assetUrn;
  } catch {
    return null;
  }
}

export async function publishToLinkedIn(
  accessToken: string,
  platformUserId: string,
  payload: PublishPayload
): Promise<PublishResult> {
  try {
    const personUrn = `urn:li:person:${platformUserId}`;

    let body: Record<string, unknown>;

    if (payload.imageUrl) {
      // Attempt image upload
      const assetUrn = await uploadLinkedInImage(accessToken, personUrn, payload.imageUrl);

      if (assetUrn) {
        body = {
          author: personUrn,
          lifecycleState: "PUBLISHED",
          specificContent: {
            "com.linkedin.ugc.ShareContent": {
              shareCommentary: { text: payload.caption },
              shareMediaCategory: "IMAGE",
              media: [
                {
                  status: "READY",
                  description: { text: payload.caption.slice(0, 200) },
                  media: assetUrn,
                },
              ],
            },
          },
          visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" },
        };
      } else {
        // Fallback to text-only if image upload failed
        body = {
          author: personUrn,
          lifecycleState: "PUBLISHED",
          specificContent: {
            "com.linkedin.ugc.ShareContent": {
              shareCommentary: { text: payload.caption },
              shareMediaCategory: "NONE",
            },
          },
          visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" },
        };
      }
    } else {
      body = {
        author: personUrn,
        lifecycleState: "PUBLISHED",
        specificContent: {
          "com.linkedin.ugc.ShareContent": {
            shareCommentary: { text: payload.caption },
            shareMediaCategory: "NONE",
          },
        },
        visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" },
      };
    }

    const res = await fetch(`${API_BASE}/ugcPosts`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "X-Restli-Protocol-Version": "2.0.0",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      const msg = (errData as { message?: string }).message || `LinkedIn API error ${res.status}`;
      return { success: false, error: msg };
    }

    const data = await res.json();
    return { success: true, platformPostId: data.id as string };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "LinkedIn publish failed" };
  }
}
