import { ObjectId } from "mongodb";
import { connectToDatabase } from "../mongodb";

export type Platform = "linkedin" | "facebook" | "instagram" | "x" | "pinterest" | "threads";
export type PostFormat = "text" | "image" | "video" | "carousel" | "reel" | "article";

export interface SocialMediaPostDocument {
  _id?: ObjectId;
  userId: string;
  accountId: string;
  platform: Platform;
  platformPostId: string;
  platformUsername?: string;

  // Content
  caption: string;
  mediaUrls: string[];
  format: PostFormat;

  // Timing
  postedAt: Date;

  // Engagement Metrics
  metrics: {
    likes: number;
    comments: number;
    shares: number;
    views: number;
    clicks?: number;
    saves?: number;
    reposts?: number;
  };

  // Calculated Fields
  engagement: {
    engagementRate: number;
    commentRate: number;
    shareRate: number;
  };

  // Metadata
  isPinned?: boolean;
  isSponsored?: boolean;
  url?: string;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  lastFetchedAt: Date;
}

const COLLECTION = "social_media_posts";

async function getCollection() {
  const { db } = await connectToDatabase();
  return db.collection<SocialMediaPostDocument>(COLLECTION);
}

/**
 * Ensure all indexes are created
 */
export async function ensurePostIndexes(): Promise<void> {
  const col = await getCollection();

  await Promise.all([
    // Query user's posts
    col.createIndex({ userId: 1, accountId: 1 }),

    // Filter by platform
    col.createIndex({ userId: 1, accountId: 1, platform: 1 }),

    // Timeline queries (newest first)
    col.createIndex({ userId: 1, accountId: 1, postedAt: -1 }),

    // Prevent duplicates
    col.createIndex(
      { platformPostId: 1, platform: 1, accountId: 1 },
      { unique: true }
    ),

    // Find stale data to refresh
    col.createIndex({ lastFetchedAt: 1 }),

    // Query by date range
    col.createIndex({ userId: 1, postedAt: -1 }),
  ]);
}

/**
 * Create a new social media post
 */
export async function createPost(
  data: Omit<SocialMediaPostDocument, "_id" | "createdAt" | "updatedAt">
): Promise<SocialMediaPostDocument> {
  const col = await getCollection();
  const now = new Date();

  const doc: SocialMediaPostDocument = {
    ...data,
    createdAt: now,
    updatedAt: now,
  };

  const result = await col.insertOne(doc);
  return { ...doc, _id: result.insertedId };
}

/**
 * Upsert a post by platformPostId (prevent duplicates, update metrics)
 */
export async function upsertPost(
  data: Omit<SocialMediaPostDocument, "_id" | "createdAt" | "updatedAt">
): Promise<SocialMediaPostDocument> {
  const col = await getCollection();
  const now = new Date();

  const result = await col.findOneAndUpdate(
    {
      platformPostId: data.platformPostId,
      platform: data.platform,
      accountId: data.accountId,
    },
    {
      $set: {
        ...data,
        updatedAt: now,
        lastFetchedAt: now,
      },
      $setOnInsert: {
        createdAt: now,
      },
    },
    { upsert: true, returnDocument: "after" }
  );

  if (!result) {
    throw new Error("Failed to upsert post");
  }

  return result;
}

/**
 * Get posts for a specific account
 */
export async function getPostsByAccount(
  userId: string,
  accountId: string,
  limit: number = 100,
  skip: number = 0
): Promise<SocialMediaPostDocument[]> {
  const col = await getCollection();
  return col
    .find({ userId, accountId })
    .sort({ postedAt: -1 })
    .skip(skip)
    .limit(limit)
    .toArray();
}

/**
 * Get posts from a specific platform for an account
 */
export async function getPostsByPlatform(
  userId: string,
  accountId: string,
  platform: Platform,
  limit: number = 100
): Promise<SocialMediaPostDocument[]> {
  const col = await getCollection();
  return col
    .find({ userId, accountId, platform })
    .sort({ postedAt: -1 })
    .limit(limit)
    .toArray();
}

/**
 * Get top posts by engagement rate
 */
export async function getTopPostsByEngagement(
  userId: string,
  accountId: string,
  limit: number = 10,
  startDate?: Date,
  endDate?: Date,
  platform?: Platform
): Promise<SocialMediaPostDocument[]> {
  const col = await getCollection();

  const query: any = { userId, accountId };
  if (platform) {
    query.platform = platform;
  }
  if (startDate || endDate) {
    query.postedAt = {};
    if (startDate) query.postedAt.$gte = startDate;
    if (endDate) query.postedAt.$lte = endDate;
  }

  return col
    .find(query)
    .sort({ "engagement.engagementRate": -1 })
    .limit(limit)
    .toArray();
}

/**
 * Get top posts by platform
 */
export async function getTopPostsByPlatform(
  userId: string,
  accountId: string,
  platform: Platform,
  limit: number = 5
): Promise<SocialMediaPostDocument[]> {
  const col = await getCollection();
  return col
    .find({ userId, accountId, platform })
    .sort({ "engagement.engagementRate": -1 })
    .limit(limit)
    .toArray();
}

/**
 * Update post metrics (called when syncing from API)
 */
export async function updatePostMetrics(
  platformPostId: string,
  platform: Platform,
  accountId: string,
  metrics: SocialMediaPostDocument["metrics"],
  impressions: number = 0
): Promise<void> {
  const col = await getCollection();

  // Calculate engagement rates
  const engagementRate =
    impressions > 0
      ? ((metrics.likes + metrics.comments + metrics.shares) / impressions) *
        100
      : 0;
  const commentRate = impressions > 0 ? (metrics.comments / impressions) * 100 : 0;
  const shareRate = impressions > 0 ? (metrics.shares / impressions) * 100 : 0;

  await col.updateOne(
    { platformPostId, platform, accountId },
    {
      $set: {
        metrics,
        engagement: {
          engagementRate: Math.min(engagementRate, 100),
          commentRate: Math.min(commentRate, 100),
          shareRate: Math.min(shareRate, 100),
        },
        updatedAt: new Date(),
        lastFetchedAt: new Date(),
      },
    }
  );
}

/**
 * Get posts that need metric refresh (older than specified hours)
 */
export async function getPostsNeedingRefresh(
  hoursOld: number = 24
): Promise<SocialMediaPostDocument[]> {
  const col = await getCollection();
  const cutoffTime = new Date(Date.now() - hoursOld * 60 * 60 * 1000);

  return col
    .find({ lastFetchedAt: { $lt: cutoffTime } })
    .sort({ lastFetchedAt: 1 })
    .limit(100)
    .toArray();
}

/**
 * Get posts by format type
 */
export async function getPostsByFormat(
  userId: string,
  accountId: string,
  format: PostFormat,
  limit: number = 50
): Promise<SocialMediaPostDocument[]> {
  const col = await getCollection();
  return col
    .find({ userId, accountId, format })
    .sort({ postedAt: -1 })
    .limit(limit)
    .toArray();
}

/**
 * Get posts by date range
 */
export async function getPostsByDateRange(
  userId: string,
  accountId: string,
  startDate: Date,
  endDate: Date,
  limit: number = 100
): Promise<SocialMediaPostDocument[]> {
  const col = await getCollection();
  return col
    .find({
      userId,
      accountId,
      postedAt: { $gte: startDate, $lte: endDate },
    })
    .sort({ postedAt: -1 })
    .limit(limit)
    .toArray();
}

/**
 * Get post count by format for an account
 */
export async function getPostCountByFormat(
  userId: string,
  accountId: string
): Promise<Record<PostFormat, number>> {
  const col = await getCollection();

  const results = await col
    .aggregate([
      { $match: { userId, accountId } },
      {
        $group: {
          _id: "$format",
          count: { $sum: 1 },
        },
      },
    ])
    .toArray();

  const counts: Record<string, number> = {};
  for (const result of results) {
    counts[result._id] = result.count;
  }

  return counts as Record<PostFormat, number>;
}

/**
 * Get average engagement metrics by format
 */
export async function getAverageEngagementByFormat(
  userId: string,
  accountId: string
): Promise<
  Array<{
    format: PostFormat;
    avgEngagementRate: number;
    avgComments: number;
    avgLikes: number;
    avgShares: number;
    postCount: number;
  }>
> {
  const col = await getCollection();

  const results = await col
    .aggregate([
      { $match: { userId, accountId } },
      {
        $group: {
          _id: "$format",
          avgEngagementRate: { $avg: "$engagement.engagementRate" },
          avgComments: { $avg: "$metrics.comments" },
          avgLikes: { $avg: "$metrics.likes" },
          avgShares: { $avg: "$metrics.shares" },
          postCount: { $sum: 1 },
        },
      },
      { $sort: { avgEngagementRate: -1 } },
    ])
    .toArray();

  return results.map((r) => ({
    format: r._id as PostFormat,
    avgEngagementRate: r.avgEngagementRate,
    avgComments: r.avgComments,
    avgLikes: r.avgLikes,
    avgShares: r.avgShares,
    postCount: r.postCount,
  }));
}

/**
 * Delete old posts (archive old data)
 */
export async function deleteOldPosts(daysOld: number = 90): Promise<number> {
  const col = await getCollection();
  const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);

  const result = await col.deleteMany({ createdAt: { $lt: cutoffDate } });
  return result.deletedCount ?? 0;
}

/**
 * Get a single post by ID
 */
export async function getPostById(
  postId: string
): Promise<SocialMediaPostDocument | null> {
  if (!ObjectId.isValid(postId)) return null;
  const col = await getCollection();
  return col.findOne({ _id: new ObjectId(postId) });
}

/**
 * Get total posts for account
 */
export async function getTotalPostCount(
  userId: string,
  accountId: string
): Promise<number> {
  const col = await getCollection();
  return col.countDocuments({ userId, accountId });
}
