/**
 * Pinterest publishing adapter.
 * Creates a Pin on the user's first available board.
 * Endpoint: POST https://api.pinterest.com/v5/pins
 */
import type { PublishPayload, PublishResult } from "./types";

const PINTEREST_API = "https://api.pinterest.com/v5";

async function getFirstBoardId(accessToken: string): Promise<string | null> {
  try {
    const res = await fetch(`${PINTEREST_API}/boards?page_size=1`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const data = await res.json() as { items?: Array<{ id: string }> };
    return data?.items?.[0]?.id ?? null;
  } catch {
    return null;
  }
}

export async function publishToPinterest(
  accessToken: string,
  payload: PublishPayload
): Promise<PublishResult> {
  try {
    const boardId = await getFirstBoardId(accessToken);
    if (!boardId) {
      return { success: false, error: "No Pinterest boards found. Create a board first." };
    }

    if (!payload.imageUrl) {
      return { success: false, error: "Pinterest requires an image to create a Pin" };
    }

    const pinBody: Record<string, unknown> = {
      board_id: boardId,
      title: payload.caption.slice(0, 100),
      description: payload.caption,
      media_source: {
        source_type: "image_url",
        url: payload.imageUrl,
      },
    };

    const res = await fetch(`${PINTEREST_API}/pins`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(pinBody),
    });

    const data = await res.json() as { id?: string; code?: number; message?: string };

    if (!res.ok || data.code) {
      return { success: false, error: data.message || `Pinterest API error ${res.status}` };
    }

    return { success: true, platformPostId: data.id };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Pinterest publish failed" };
  }
}
