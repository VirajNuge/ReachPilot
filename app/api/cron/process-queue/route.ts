/**
 * GET /api/cron/process-queue
 *
 * Scheduled post execution daemon.
 * Finds all posts with status="scheduled" and scheduledDate <= now,
 * publishes them to their target platforms, and updates their status.
 *
 * Security: requires Authorization: Bearer {CRON_SECRET} header.
 *
 * Setup:
 *   - Vercel: add to vercel.json crons config calling this endpoint every 5 min
 *   - Other: use cron-job.org or GitHub Actions to GET this URL with the secret
 */
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getConnections } from "@/lib/models/connection";
import { normalizeConnectionPlatform, publishToPlatform, resolvePublishImageUrl } from "@/lib/publishing";
import type { PublishPayload } from "@/lib/publishing";
import type { PostGenerationDocument, PublishPlatformResult } from "@/lib/types/postGeneration";
import { ObjectId } from "mongodb";

export async function GET(req: NextRequest) {
  // 1. Authenticate via CRON_SECRET bearer token
  const authHeader = req.headers.get("authorization");
  const expectedToken = `Bearer ${process.env.CRON_SECRET}`;
  if (!authHeader || authHeader !== expectedToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const { db } = await connectToDatabase();
  const col = db.collection<PostGenerationDocument>("postGenerations");

  // 2. Find all due scheduled posts (max 50 per run to prevent timeout)
  const duePosts = await col
    .find({ status: "scheduled", scheduledDate: { $lte: now } })
    .limit(50)
    .toArray();

  if (duePosts.length === 0) {
    return NextResponse.json({ processed: 0, succeeded: 0, failed: 0 });
  }

  let succeeded = 0;
  let failed = 0;

  // 3. Process each post
  for (const post of duePosts) {
    const postId = post._id!.toString();

    try {
      if (!post.output) {
        // No content to publish — mark failed
        await col.updateOne(
          { _id: new ObjectId(postId) },
          { $set: { status: "failed", updatedAt: new Date() } }
        );
        failed++;
        continue;
      }

      const accountId = post.accountId ?? "";
      const connections = await getConnections(post.userId, accountId);
      const connectionMap = Object.fromEntries(connections.map((c) => [c.platform, c]));
      const platforms = (post.input?.platforms as string[] | undefined) ?? Object.keys(post.output.captions || {});

      const hashtags = [
        ...(post.output.hashtags?.highReach ?? []),
        ...(post.output.hashtags?.niche ?? []),
        ...(post.output.hashtags?.branded ?? []),
      ];
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
        const connection = connectionMap[connectionPlatform];
        if (!connection) {
          results.push({ platform, success: false, error: `Not connected to ${platform}` });
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

      const anySuccess = results.some((r) => r.success);
      const newStatus = results.every((r) => !r.success) ? "failed" : "published";

      await col.updateOne(
        { _id: new ObjectId(postId) },
        {
          $set: {
            status: newStatus,
            publishResults: results,
            publishedAt: anySuccess ? new Date() : undefined,
            updatedAt: new Date(),
          },
        }
      );

      if (anySuccess) succeeded++;
      else failed++;
    } catch (err) {
      console.error(`Cron: failed to process post ${postId}:`, err);
      await col.updateOne(
        { _id: new ObjectId(postId) },
        { $set: { status: "failed", updatedAt: new Date() } }
      );
      failed++;
    }
  }

  return NextResponse.json({
    processed: duePosts.length,
    succeeded,
    failed,
  });
}
