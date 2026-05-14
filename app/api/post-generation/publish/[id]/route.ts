/**
 * POST /api/post-generation/publish/[id]
 *
 * Immediately publishes a saved post to all of its target platforms.
 * - Fetches the post record and verifies ownership
 * - Loads all social_connections for the account
 * - Dispatches to the correct platform adapter via lib/publishing
 * - Updates the record status to "published" (or "failed" if all failed)
 * - Returns per-platform results so the UI can show success/error per channel
 */
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/withAuth";
import { getPostGenerationById, updatePostGeneration } from "@/lib/models/postGeneration";
import { getConnections, getConnectionsByUser, type ConnectionDocument } from "@/lib/models/connection";
import { normalizeConnectionPlatform, publishToPlatform, resolvePublishImageUrl } from "@/lib/publishing";
import type { PublishPayload } from "@/lib/publishing";
import type { PublishPlatformResult } from "@/lib/types/postGeneration";
import { flattenGroupedHashtags } from "@/lib/postGeneration/hashtags";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAuth(req);
    if (authResult instanceof NextResponse) return authResult;
    const auth = authResult;

    const { id } = await params;

    // 1. Fetch post and verify ownership
    const post = await getPostGenerationById(id);
    if (!post || post.userId !== auth.userId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (!post.output) {
      return NextResponse.json(
        { error: "Post has no generated output to publish" },
        { status: 400 }
      );
    }

    // 2. Load social connections for this account
    const accountId = post.accountId ?? "";
    const connections = accountId
      ? await getConnections(auth.userId, accountId)
      : [];
    const connectionMap = Object.fromEntries(
      connections.map((c) => [c.platform, c])
    );
    let userConnectionCache: ConnectionDocument[] | null = null;

    const findFallbackConnection = async (platformKey: string): Promise<ConnectionDocument | null> => {
      if (!userConnectionCache) {
        userConnectionCache = await getConnectionsByUser(auth.userId);
      }

      const candidates = userConnectionCache.filter((conn) => conn.platform === platformKey);
      if (candidates.length === 1) return candidates[0];
      return null;
    };

    // 3. Determine target platforms from input
    const platforms = (post.input?.platforms as string[] | undefined) ?? Object.keys(post.output.captions || {});
    if (!platforms || platforms.length === 0) {
      return NextResponse.json({ error: "No platforms specified on post" }, { status: 400 });
    }

    // 4. Build publish payload
    const hashtags = flattenGroupedHashtags(post.output.hashtags);
    const hostedImageCache = new Map<string, string | undefined>();

    const getHostedImageUrl = async (candidateUrl?: string) => {
      if (!candidateUrl) return undefined;
      const cachedUrl = hostedImageCache.get(candidateUrl);
      if (cachedUrl !== undefined) return cachedUrl;

      const hostedUrl = await resolvePublishImageUrl(candidateUrl);
      hostedImageCache.set(candidateUrl, hostedUrl);
      return hostedUrl;
    };

    // 5. Publish to each platform
    const results: PublishPlatformResult[] = [];

    for (const platform of platforms) {
      const connectionPlatform = normalizeConnectionPlatform(platform);
      const connection =
        connectionMap[connectionPlatform] ??
        (await findFallbackConnection(connectionPlatform));

      if (!connection) {
        const accountHint = accountId
          ? `for account ${accountId}`
          : "for this draft";
        results.push({
          platform,
          success: false,
          error: `Not connected to ${platform} ${accountHint}. Reconnect on the same account and try again.`,
        });
        continue;
      }

      // Use platform-specific caption, fall back to first available
      const caption =
        post.output.captions?.[platform] ??
        post.output.captions?.[connectionPlatform] ??
        Object.values(post.output.captions ?? {})[0] ??
        "";
        
      // Use platform-specific image, fall back to global image
      const imageUrl = 
        post.output.platformImages?.[platform] ?? 
        post.output.platformImages?.[connectionPlatform] ??
        post.output.imageUrl;

      const hostedImageUrl = await getHostedImageUrl(imageUrl);

      const payload: PublishPayload = {
        caption,
        imageUrl: hostedImageUrl,
        hashtags,
      };

      const result = await publishToPlatform(platform, connection, payload);
      results.push({
        platform,
        success: result.success,
        platformPostId: result.platformPostId,
        error: result.error,
        publishedAt: result.success ? new Date() : undefined,
      });
    }

    // 6. Determine final status
    const anySuccess = results.some((r) => r.success);
    const allFailed = results.every((r) => !r.success);
    const newStatus = allFailed ? "failed" : "published";

    // 7. Persist results back to DB
    await updatePostGeneration(
      id,
      {
        status: newStatus,
        publishResults: results,
        publishedAt: anySuccess ? new Date() : undefined,
      },
      auth.userId
    );

    return NextResponse.json({
      status: newStatus,
      results,
    });
  } catch (error) {
    console.error("Publish error:", error);
    return NextResponse.json(
      { error: "Failed to publish post" },
      { status: 500 }
    );
  }
}
