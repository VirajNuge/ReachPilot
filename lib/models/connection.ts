import { connectToDatabase } from "../mongodb";
import { ObjectId } from "mongodb";

export interface ConnectionDocument {
  _id?: ObjectId;
  userId: string;
  accountId: string;
  platform: "meta" | "x" | "linkedin" | "google";
  accessToken: string;
  refreshToken?: string;
  tokenExpiresAt?: Date;
  platformUserId?: string;
  platformUsername?: string;
  scope?: string;
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
  platform: "meta" | "x" | "linkedin" | "google",
  tokenData: {
    accessToken: string;
    refreshToken?: string;
    tokenExpiresAt?: Date;
    platformUserId?: string;
    platformUsername?: string;
    scope?: string;
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
  platform: "meta" | "x" | "linkedin" | "google"
): Promise<void> {
  const col = await getCollection();

  await col.deleteOne({ userId, accountId, platform });
}
