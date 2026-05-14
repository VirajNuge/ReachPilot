import { ObjectId } from "mongodb";
import { connectToDatabase } from "../mongodb";
import type { OptimalSlotWithMeta } from "@/lib/publishing/types";

export interface PublishingOptimalTimesDocument {
  _id?: ObjectId;
  userId: string;
  accountId: string;
  personaId: string;
  month: number;
  year: number;
  slots: OptimalSlotWithMeta[];
  createdAt: Date;
  updatedAt: Date;
}

const COLLECTION = "publishing_optimal_times";

async function getCollection() {
  const { db } = await connectToDatabase();
  return db.collection<PublishingOptimalTimesDocument>(COLLECTION);
}

export async function ensurePublishingOptimalTimesIndexes(): Promise<void> {
  const col = await getCollection();
  await Promise.all([
    col.createIndex({ userId: 1, accountId: 1, month: 1, year: 1, personaId: 1 }, { unique: true }),
    col.createIndex({ userId: 1, accountId: 1, updatedAt: -1 }),
  ]);
}

export async function getPublishingOptimalTimesForAccount(
  userId: string,
  accountId: string,
  month: number,
  year: number,
  personaId?: string
): Promise<PublishingOptimalTimesDocument | null> {
  const col = await getCollection();
  const query = personaId
    ? { userId, accountId, month, year, personaId }
    : { userId, accountId, month, year };

  const [doc] = await col.find(query).sort({ updatedAt: -1 }).limit(1).toArray();
  return doc ?? null;
}

export async function upsertPublishingOptimalTimes(
  userId: string,
  accountId: string,
  personaId: string,
  month: number,
  year: number,
  slots: OptimalSlotWithMeta[]
): Promise<PublishingOptimalTimesDocument> {
  const col = await getCollection();
  const now = new Date();
  const query = { userId, accountId, personaId, month, year };
  const existing = await col.findOne(query);

  if (existing) {
    await col.updateOne({ _id: existing._id }, { $set: { slots, updatedAt: now } });
    return {
      ...existing,
      slots,
      updatedAt: now,
    };
  }

  const doc: PublishingOptimalTimesDocument = {
    userId,
    accountId,
    personaId,
    month,
    year,
    slots,
    createdAt: now,
    updatedAt: now,
  };

  const result = await col.insertOne(doc);
  return { ...doc, _id: result.insertedId };
}