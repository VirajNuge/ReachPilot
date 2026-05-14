import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/auth";
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
    const auth = await getAuthFromRequest(req);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

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

    const accountId = post.accountId ?? "";
    const connections = accountId
      ? await getConnections(auth.userId, accountId)
      : [];
    const connectionMap = Object.fromEntries(
      connections.map((connection) => [connection.platform, connection])
    );
    let userConnectionCache: ConnectionDocument[] | null = null;

    const findFallbackConnection = async (platformKey: string): Promise<ConnectionDocument | null> => {
      if (!userConnectionCache) {
        userConnectionCache = await getConnectionsByUser(auth.userId);
      }

      const candidates = userConnectionCache.filter((connection) => connection.platform === platformKey);
      return candidates.length === 1 ? candidates[0] : null;
    };

    const platforms = (post.input?.platforms as string[] | undefined) ?? Object.keys(post.output.captions || {});
    if (!platforms || platforms.length === 0) {
      return NextResponse.json({ error: "No platforms specified on post" }, { status: 400 });
    }

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

      const caption =
        post.output.captions?.[platform] ??
        post.output.captions?.[connectionPlatform] ??
        Object.values(post.output.captions ?? {})[0] ??
        "";

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

    const anySuccess = results.some((result) => result.success);
    const allFailed = results.every((result) => !result.success);
    const newStatus = allFailed ? "failed" : "published";

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
    console.error("Quick publish error:", error);
    return NextResponse.json(
      { error: "Failed to publish post" },
      { status: 500 }
    );
  }
}
