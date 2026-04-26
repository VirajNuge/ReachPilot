import { connectToDatabase } from "../mongodb";
import { ObjectId } from "mongodb";

export type Platform = "facebook" | "instagram" | "threads" | "linkedin" | "x" | "google" | "pinterest";

export interface ConnectionDocument {
  _id?: ObjectId;
  userId: string;
  accountId: string;
  platform: Platform;
  accessToken: string;
  refreshToken?: string;
  tokenExpiresAt?: Date;
  platformUserId?: string;
  platformUsername?: string;
  scope?: string;
  /** Facebook Page ID or Instagram Business Account ID — required for publishing */
  pageId?: string;
  /** Page-scoped access token — required for publishing to FB Pages / IG Business */
  pageAccessToken?: string;
  createdAt: Date;
  updatedAt: Date;
}

const COLLECTION = "social_connections";

async function getCollection() {
  const { db } = await connectToDatabase();
  return db.collection<ConnectionDocument>(COLLECTION);
}

export async function upsertConnection(
  userId: string,
  accountId: string,
  platform: Platform,
  tokenData: {
    accessToken: string;
    refreshToken?: string;
    tokenExpiresAt?: Date;
    platformUserId?: string;
    platformUsername?: string;
    scope?: string;
    pageId?: string;
    pageAccessToken?: string;
  }
): Promise<void> {
  const col = await getCollection();

  const now = new Date();

  await col.updateOne(
    { userId, accountId, platform },
    {
      $set: {
        accessToken: tokenData.accessToken,
        refreshToken: tokenData.refreshToken,
        tokenExpiresAt: tokenData.tokenExpiresAt,
        platformUserId: tokenData.platformUserId,
        platformUsername: tokenData.platformUsername,
        scope: tokenData.scope,
        ...(tokenData.pageId !== undefined ? { pageId: tokenData.pageId } : {}),
        ...(tokenData.pageAccessToken !== undefined ? { pageAccessToken: tokenData.pageAccessToken } : {}),
        updatedAt: now,
      },
      $setOnInsert: {
        userId,
        accountId,
        platform,
        createdAt: now,
      },
    },
    { upsert: true }
  );

  // Ensure indexes
  await col.createIndex({ userId: 1, accountId: 1, platform: 1 }, { unique: true });
}

export async function getConnections(
  userId: string,
  accountId: string
): Promise<ConnectionDocument[]> {
  const col = await getCollection();

  const connections = await col
    .find({ userId, accountId })
    .toArray();

  return connections;
}

export async function deleteConnection(
  userId: string,
  accountId: string,
  platform: Platform
): Promise<void> {
  const col = await getCollection();

  await col.deleteOne({ userId, accountId, platform });
}
