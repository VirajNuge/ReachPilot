/**
 * X (Twitter) publishing adapter.
 * Text posting uses OAuth2 bearer token via v2 API.
 * Image upload uses OAuth1.0a signed request via v1.1 media/upload endpoint.
 *
 * Requires env vars:
 *   X_CONSUMER_KEY, X_CONSUMER_SECRET  (for OAuth1 media upload)
 *   accessToken + refreshToken          (user's OAuth2 token from DB)
 *
 * Note: X_OAUTH1_ACCESS_TOKEN and X_OAUTH1_TOKEN_SECRET must also be set
 * in .env.local — these are the user-level OAuth1 tokens, distinct from
 * the OAuth2 token. They must be obtained separately from the X developer
 * portal "Access Token & Secret" section under your own account.
 */
import type { PublishPayload, PublishResult } from "./types";
import { generateOAuth1Header } from "./oauth1Sign";

const TWEETS_API = "https://api.twitter.com/2/tweets";
const MEDIA_UPLOAD_API = "https://upload.twitter.com/1.1/media/upload.json";

/** Upload image to Twitter v1.1 media upload and return media_id_string */
async function uploadTwitterMedia(imageUrl: string): Promise<string | null> {
  const consumerKey = process.env.X_CONSUMER_KEY;
  const consumerSecret = process.env.X_CONSUMER_SECRET;
  const oauthToken = process.env.X_OAUTH1_ACCESS_TOKEN;
  const oauthTokenSecret = process.env.X_OAUTH1_TOKEN_SECRET;

  if (!consumerKey || !consumerSecret || !oauthToken || !oauthTokenSecret) {
    console.warn("X OAuth1 env vars missing — skipping media upload, posting text only");
    return null;
  }

  try {
    // Download the image
    const imgRes = await fetch(imageUrl);
    if (!imgRes.ok) return null;
    const imgBuffer = Buffer.from(await imgRes.arrayBuffer());
    const totalBytes = imgBuffer.length;
    const mediaType = imgRes.headers.get("content-type") || "image/jpeg";

    // INIT
    const initParams = new URLSearchParams({
      command: "INIT",
      total_bytes: totalBytes.toString(),
      media_type: mediaType,
    });
    const initHeader = generateOAuth1Header(
      "POST",
      MEDIA_UPLOAD_API,
      consumerKey,
      consumerSecret,
      oauthToken,
      oauthTokenSecret
    );
    const initRes = await fetch(MEDIA_UPLOAD_API, {
      method: "POST",
      headers: {
        Authorization: initHeader,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: initParams.toString(),
    });
    const initData = await initRes.json() as { media_id_string?: string };
    if (!initRes.ok || !initData.media_id_string) return null;
    const mediaId = initData.media_id_string;

    // APPEND (single chunk — fine for <5MB images)
    const appendHeader = generateOAuth1Header(
      "POST",
      MEDIA_UPLOAD_API,
      consumerKey,
      consumerSecret,
      oauthToken,
      oauthTokenSecret
    );
    const formData = new FormData();
    formData.append("command", "APPEND");
    formData.append("media_id", mediaId);
    formData.append("segment_index", "0");
    formData.append("media", new Blob([imgBuffer], { type: mediaType }));
    await fetch(MEDIA_UPLOAD_API, {
      method: "POST",
      headers: { Authorization: appendHeader },
      body: formData,
    });

    // FINALIZE
    const finalizeParams = new URLSearchParams({
      command: "FINALIZE",
      media_id: mediaId,
    });
    const finalizeHeader = generateOAuth1Header(
      "POST",
      MEDIA_UPLOAD_API,
      consumerKey,
      consumerSecret,
      oauthToken,
      oauthTokenSecret
    );
    await fetch(MEDIA_UPLOAD_API, {
      method: "POST",
      headers: {
        Authorization: finalizeHeader,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: finalizeParams.toString(),
    });

    return mediaId;
  } catch {
    return null;
  }
}

export async function publishToX(
  accessToken: string,
  payload: PublishPayload
): Promise<PublishResult> {
  try {
    let mediaId: string | null = null;
    if (payload.imageUrl) {
      mediaId = await uploadTwitterMedia(payload.imageUrl);
    }

    const tweetBody: Record<string, unknown> = {
      text: payload.caption,
    };
    if (mediaId) {
      tweetBody.media = { media_ids: [mediaId] };
    }

    const res = await fetch(TWEETS_API, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(tweetBody),
    });

    const data = await res.json() as { data?: { id: string }; errors?: Array<{ message: string }> };

    if (!res.ok || data.errors?.length) {
      const errMsg = data.errors?.[0]?.message || `X API error ${res.status}`;
      return { success: false, error: errMsg };
    }

    return { success: true, platformPostId: data.data?.id };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "X publish failed" };
  }
}
