/**
 * Pinterest publishing adapter.
 * Creates a Pin on the user's first available board.
 * Endpoint: POST https://api.pinterest.com/v5/pins
 */
import type { PublishPayload, PublishResult } from "./types";
import { upsertConnection } from "@/lib/models/connection";
import type { ConnectionDocument } from "@/lib/models/connection";

const PINTEREST_API = "https://api.pinterest.com/v5";

async function getFirstBoardId(accessToken: string): Promise<string | null> {
  try {
    const res = await fetch(`${PINTEREST_API}/boards?page_size=1`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const data = await res.json() as { items?: Array<{ id: string }>; code?: number; message?: string };
    if (!res.ok || data.code) {
      console.error("Pinterest board fetch failed (primary)", {
        status: res.status,
        body: data,
      });
      return null;
    }

    return data?.items?.[0]?.id ?? null;
  } catch (e) {
    console.error("Pinterest board fetch exception", e);
    return null;
  }
}

async function exchangeRefreshToken(refreshToken: string) {
  try {
    const credentials = Buffer.from(`${process.env.PINTEREST_APP_ID}:${process.env.PINTEREST_APP_SECRET}`).toString("base64");
    const res = await fetch(`${PINTEREST_API}/oauth/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${credentials}`,
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }).toString(),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("Pinterest refresh token exchange failed", { status: res.status, body: text });
      return null;
    }

    const data = await res.json();
    return data;
  } catch (e) {
    console.error("Pinterest token refresh exception", e);
    return null;
  }
}

export async function publishToPinterest(
  connection: ConnectionDocument,
  payload: PublishPayload
): Promise<PublishResult> {
  let accessToken = connection.accessToken;
  try {
    let boardId = await getFirstBoardId(accessToken);

    // If no boards found and we have a refresh token, attempt to refresh
    if (!boardId && connection.refreshToken) {
      const newTokens = await exchangeRefreshToken(connection.refreshToken);
      if (newTokens && newTokens.access_token) {
        accessToken = newTokens.access_token;
        const tokenExpiresAt = newTokens.expires_in
          ? new Date(Date.now() + newTokens.expires_in * 1000)
          : undefined;
        try {
          await upsertConnection(connection.userId, connection.accountId, "pinterest", {
            accessToken: newTokens.access_token,
            refreshToken: newTokens.refresh_token || connection.refreshToken,
            tokenExpiresAt,
            platformUserId: connection.platformUserId,
            platformUsername: connection.platformUsername,
            scope: connection.scope,
          });
        } catch (e) {
          console.warn("Failed to persist refreshed Pinterest token", e);
        }
        boardId = await getFirstBoardId(accessToken);
      }
    }

    // If still no boardId, try boards endpoint with user_account_id if we have platformUserId
    if (!boardId && connection.platformUserId) {
      try {
        const res = await fetch(`${PINTEREST_API}/boards?page_size=1&user_account_id=${encodeURIComponent(connection.platformUserId)}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const data = await res.json() as any;
        if (res.ok && Array.isArray(data.items) && data.items.length > 0) {
          boardId = data.items[0].id;
        } else {
          console.warn('Pinterest boards (user_account_id) returned no items', { status: res.status, body: data });
        }
      } catch (e) {
        console.warn('Pinterest boards fetch with user_account_id failed', e);
      }
    }

    if (!boardId) {
      return { success: false, error: "No Pinterest boards found. Create a board first." };
    }

    if (!payload.imageUrl) {
      return { success: false, error: "Pinterest requires an image to create a Pin" };
    }

    const pinBody: Record<string, unknown> = {
      board_id: boardId,
      title: (payload.caption ?? "").slice(0, 100),
      description: payload.caption,
      media_source: {
        source_type: "image_url",
        url: payload.imageUrl,
      },
    };

    if (process.env.PINTEREST_BYPASS_API === "true") {
      console.log("[MOCK] Bypassing Pinterest API for pin creation", pinBody);
      return { success: true, platformPostId: `mock_pin_${Date.now()}` };
    }

    const res = await fetch(`${PINTEREST_API}/pins`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(pinBody),
    });

    const text = await res.text();
    let data: any = undefined;
    try {
      data = JSON.parse(text);
    } catch (e) {
      data = { raw: text };
    }

    if (!res.ok || data?.code) {
      const base = data?.message || `Pinterest API error ${res.status}`;
      const enriched = typeof data?.code === "number" ? `${base} | code=${data.code}` : base;
      console.error('Pinterest create pin failed', { status: res.status, body: data });
      return { success: false, error: enriched };
    }

    return { success: true, platformPostId: data?.id ?? data?.pin_id ?? null };
  } catch (err) {
    console.error('Pinterest publish exception', err);
    return { success: false, error: err instanceof Error ? err.message : "Pinterest publish failed" };
  }
}
