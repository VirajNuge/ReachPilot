/**
 * Central publishing router.
 * Call publishToPlatform() with a platform name, the connection from DB,
 * and the payload — it dispatches to the correct adapter automatically.
 */
import { v2 as cloudinary } from "cloudinary";
import type { ConnectionDocument } from "@/lib/models/connection";
import type { PublishPayload, PublishResult } from "./types";
import { publishToLinkedIn } from "./linkedin";
import { publishToX } from "./twitter";
import { publishToFacebook } from "./facebook";
import { publishToInstagram } from "./instagram";
import { publishToThreads } from "./threads";
import { publishToPinterest } from "./pinterest";

export type { PublishPayload, PublishResult };

cloudinary.config(true);

function isCloudinaryConfigured(): boolean {
  return Boolean(process.env.CLOUDINARY_URL?.trim());
}

export function normalizeConnectionPlatform(platform: string): string {
  return platform === "instagram_post" ? "instagram" : platform;
}

function parseDataUrl(imageUrl: string): { mimeType: string; base64: string } | null {
  if (!imageUrl.startsWith("data:")) return null;

  const marker = ";base64,";
  const markerIndex = imageUrl.indexOf(marker);
  if (markerIndex === -1) return null;

  return {
    mimeType: imageUrl.slice(5, markerIndex) || "image/png",
    base64: imageUrl.slice(markerIndex + marker.length),
  };
}

async function uploadDataUrlImage(imageUrl: string): Promise<string | undefined> {
  if (!isCloudinaryConfigured()) {
    throw new Error("CLOUDINARY_URL is not configured");
  }

  const parsed = parseDataUrl(imageUrl);
  if (!parsed) return imageUrl;

  const buffer = Buffer.from(parsed.base64, "base64");

  const uploadResult = await new Promise<{ secure_url?: string }>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "reachpilot_generated_posts",
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(result ?? {});
      }
    );

    uploadStream.end(buffer);
  });

  return uploadResult.secure_url;
}

export async function resolvePublishImageUrl(imageUrl?: string): Promise<string | undefined> {
  if (!imageUrl) return undefined;

  try {
    return await uploadDataUrlImage(imageUrl);
  } catch (error) {
    console.warn("Failed to host publish image:", error);
    return undefined;
  }
}

/**
 * Dispatch a publish request to the appropriate platform adapter.
 *
 * @param platform  - Platform key matching ConnectionDocument.platform
 * @param connection - Connection record from MongoDB (contains tokens)
 * @param payload   - Caption, imageUrl, hashtags
 */
export async function publishToPlatform(
  platform: string,
  connection: ConnectionDocument,
  payload: PublishPayload
): Promise<PublishResult> {
  switch (platform) {
    case "linkedin":
      if (!connection.platformUserId) {
        return { success: false, error: "LinkedIn: platformUserId missing from connection" };
      }
      return publishToLinkedIn(connection.accessToken, connection.platformUserId, payload);

    case "x":
      return publishToX(connection, payload);

    case "facebook":
      if (!connection.pageId || !connection.pageAccessToken) {
        return {
          success: false,
          error: "Facebook: Page not linked. Please reconnect your Facebook account.",
        };
      }
      return publishToFacebook(connection.pageAccessToken, connection.pageId, payload);

    case "instagram_post":
    case "instagram":
      if (!connection.pageId || !connection.pageAccessToken) {
        return {
          success: false,
          error: "Instagram: Business account not linked. Please reconnect your Instagram account.",
        };
      }
      return publishToInstagram(connection.pageAccessToken, connection.pageId, payload);

    case "threads":
      if (!connection.platformUserId) {
        return { success: false, error: "Threads: platformUserId missing from connection" };
      }
      return publishToThreads(connection.accessToken, connection.platformUserId, payload);

    case "pinterest":
      return publishToPinterest(connection, payload);

    default:
      return { success: false, error: `Unknown platform: ${platform}` };
  }
}
