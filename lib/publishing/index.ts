/**
 * Central publishing router.
 * Call publishToPlatform() with a platform name, the connection from DB,
 * and the payload — it dispatches to the correct adapter automatically.
 */
import type { ConnectionDocument } from "@/lib/models/connection";
import type { PublishPayload, PublishResult } from "./types";
import { publishToLinkedIn } from "./linkedin";
import { publishToX } from "./twitter";
import { publishToFacebook } from "./facebook";
import { publishToInstagram } from "./instagram";
import { publishToThreads } from "./threads";
import { publishToPinterest } from "./pinterest";

export type { PublishPayload, PublishResult };

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
      return publishToX(connection.accessToken, payload);

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
      return publishToPinterest(connection.accessToken, payload);

    default:
      return { success: false, error: `Unknown platform: ${platform}` };
  }
}
