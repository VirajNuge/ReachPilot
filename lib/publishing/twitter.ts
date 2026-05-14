/**
 * X publishing adapter.
 * Posts text and media using OAuth 2.0 user-context tokens.
 *
 * Required scope for media uploads: `media.write`.
 */
import type { ConnectionDocument } from "@/lib/models/connection";
import { upsertConnection } from "@/lib/models/connection";
import type { PublishPayload, PublishResult } from "./types";

const TWEETS_API = "https://api.x.com/2/tweets";
const MEDIA_UPLOAD_API = "https://upload.twitter.com/1.1/media/upload.json";

type XTokenResponse = {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  scope?: string;
  token_type?: string;
  error?: string;
  error_description?: string;
};

type MediaUploadResponse = {
  media_id?: number;
  media_id_string?: string;
  processing_info?: {
    state?: "pending" | "in_progress" | "succeeded" | "failed";
    check_after_secs?: number;
  };
  errors?: Array<{ message?: string }>;
  error?: { message?: string } | string;
};

function buildCaption(payload: PublishPayload): string {
  const base = payload.caption.trim();
  const hashtags = payload.hashtags?.length
    ? payload.hashtags.map((tag) => (tag.startsWith("#") ? tag : `#${tag}`)).join(" ")
    : "";

  if (!hashtags) return base;
  if (!base) return hashtags;
  return `${base}\n\n${hashtags}`;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getXClientId(): string | undefined {
  return process.env.X_CLIENT_ID?.trim() || process.env.X_CONSUMER_KEY?.trim();
}

function getXClientSecret(): string | undefined {
  return process.env.X_CLIENT_SECRET?.trim() || process.env.X_CONSUMER_SECRET?.trim();
}

async function refreshXAccessToken(connection: ConnectionDocument): Promise<string | null> {
  if (!connection.refreshToken) return null;

  const clientId = getXClientId();
  const clientSecret = getXClientSecret();

  if (!clientId || !clientSecret) {
    return null;
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const response = await fetch("https://api.x.com/2/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${credentials}`,
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: connection.refreshToken,
      client_id: clientId,
    }).toString(),
  });

  const tokenData = (await response.json().catch(() => ({}))) as XTokenResponse;
  if (!response.ok || !tokenData.access_token) {
    console.error("[X Publishing] Token Refresh Failed:", {
      status: response.status,
      statusText: response.statusText,
      error: tokenData.error,
      error_description: tokenData.error_description,
    });
    return null;
  }

  const tokenExpiresAt = tokenData.expires_in
    ? new Date(Date.now() + tokenData.expires_in * 1000)
    : undefined;

  await upsertConnection(connection.userId, connection.accountId, "x", {
    accessToken: tokenData.access_token,
    refreshToken: tokenData.refresh_token || connection.refreshToken,
    tokenExpiresAt,
    platformUserId: connection.platformUserId,
    platformUsername: connection.platformUsername,
    scope: tokenData.scope || connection.scope,
  });

  connection.accessToken = tokenData.access_token;
  if (tokenData.refresh_token) {
    connection.refreshToken = tokenData.refresh_token;
  }
  connection.tokenExpiresAt = tokenExpiresAt;

  return tokenData.access_token;
}

async function getUsableAccessToken(connection: ConnectionDocument): Promise<string | null> {
  const isExpired =
    connection.tokenExpiresAt instanceof Date &&
    connection.tokenExpiresAt.getTime() <= Date.now();

  if (!isExpired) return connection.accessToken;
  if (!connection.refreshToken) return null;

  return await refreshXAccessToken(connection);
}

async function uploadXMedia(accessToken: string, imageUrl: string): Promise<string | null> {
  try {
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) return null;

    const buffer = Buffer.from(await imageResponse.arrayBuffer());
    const mediaType = imageResponse.headers.get("content-type") || "image/jpeg";

    const formData = new FormData();
    formData.append("media", new Blob([buffer], { type: mediaType }), "media.jpg");
    formData.append("media_category", "tweet_image");

    const response = await fetch(MEDIA_UPLOAD_API, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: formData,
    });

    const data = (await response.json().catch(() => ({}))) as MediaUploadResponse;
    const mediaId = data.media_id_string;

    if (!response.ok || !mediaId) {
      return null;
    }

    const processingState = data.processing_info?.state;
    if (!processingState || processingState === "succeeded") {
      return mediaId;
    }

    if (processingState === "failed") {
      return null;
    }

    const maxAttempts = 10;
    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      const checkResponse = await fetch(
        `${MEDIA_UPLOAD_API}?command=STATUS&media_id=${encodeURIComponent(mediaId)}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const checkData = (await checkResponse.json().catch(() => ({}))) as MediaUploadResponse;
      const state = checkData.processing_info?.state;

      if (state === "succeeded") {
        return mediaId;
      }

      if (state === "failed") {
        return null;
      }

      const waitMs = (checkData.processing_info?.check_after_secs ?? 1) * 1000;
      await delay(waitMs);
    }

    return null;
  } catch {
    return null;
  }
}

export async function publishToX(
  connection: ConnectionDocument,
  payload: PublishPayload
): Promise<PublishResult> {
  try {
    const accessToken = await getUsableAccessToken(connection);
    if (!accessToken) {
      return {
        success: false,
        error: "X access token is missing or expired. Reconnect X and try again.",
      };
    }

    const caption = buildCaption(payload);
    const mediaUrls = payload.mediaUrls?.length
      ? payload.mediaUrls
      : payload.imageUrl
        ? [payload.imageUrl]
        : [];

    const mediaIds: string[] = [];
    if (mediaUrls.length > 0) {
      if (mediaUrls.length > 4) {
        return {
          success: false,
          error: "X posts support up to 4 images.",
        };
      }

      for (const mediaUrl of mediaUrls) {
        const mediaId = await uploadXMedia(accessToken, mediaUrl);
        if (!mediaId) {
          return {
            success: false,
            error: "X media upload failed. Check the media URL, file type, and permissions.",
          };
        }
        mediaIds.push(mediaId);
      }
    }

    const tweetBody: Record<string, unknown> = {
      text: caption,
    };

    if (mediaIds.length > 0) {
      tweetBody.media = { media_ids: mediaIds };
    }

    const res = await fetch(TWEETS_API, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(tweetBody),
    });

    const data = (await res.json().catch(() => ({}))) as XTokenResponse & {
      data?: { id?: string };
      errors?: Array<{ message?: string }>;
    };

    if (!res.ok || data.errors?.length) {
      const firstError = data.errors?.[0]?.message;
      const errorMessage = firstError || data.error_description || data.error || `X API error ${res.status}`;

      if ((res.status === 401 || res.status === 403) && connection.refreshToken) {
        const refreshedAccessToken = await refreshXAccessToken(connection);
        if (refreshedAccessToken) {
          const retryResponse = await fetch(TWEETS_API, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${refreshedAccessToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(tweetBody),
          });

          const retryData = (await retryResponse.json().catch(() => ({}))) as {
            data?: { id?: string };
            errors?: Array<{ message?: string }>;
          };

          if (retryResponse.ok && !retryData.errors?.length && retryData.data?.id) {
            return { success: true, platformPostId: retryData.data.id };
          }

          const retryError = retryData.errors?.[0]?.message || `X API error ${retryResponse.status}`;
          return { success: false, error: retryError };
        }
      }

      return { success: false, error: errorMessage };
    }

    return { success: true, platformPostId: data.data?.id };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "X publish failed" };
  }
}
