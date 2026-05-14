import { connectToDatabase } from "../mongodb";
import { ObjectId } from "mongodb";
import type { OverviewRecommendation } from "@/lib/analytics/overview";

export interface RecommendationsDocument {
  _id?: ObjectId;
  userId: string;
  accountId?: string;
  dateRange: string;
  recommendations: OverviewRecommendation[];
  createdAt: Date;
  updatedAt: Date;
}

const COLLECTION = "recommendations";

async function getCollection() {
  const { db } = await connectToDatabase();
  return db.collection<RecommendationsDocument>(COLLECTION);
}

export async function upsertRecommendations(
  userId: string,
  accountId: string | undefined,
  dateRange: string,
  recommendations: OverviewRecommendation[],
): Promise<{ id: string; updated: boolean }> {
  const col = await getCollection();
  const now = new Date();
  const query = accountId ? { userId, accountId, dateRange } : { userId, dateRange };
  const existing = await col.findOne(query);

  if (existing) {
    await col.updateOne(query, { $set: { recommendations, updatedAt: now } });
    return { id: existing._id!.toString(), updated: true };
  }

  const doc: RecommendationsDocument = {
    userId,
    ...(accountId ? { accountId } : {}),
    dateRange,
    recommendations,
    createdAt: now,
    updatedAt: now,
  };

  const result = await col.insertOne(doc);
  return { id: result.insertedId.toString(), updated: false };
}

export async function getRecommendationsForAccount(
  userId: string,
  accountId: string | undefined,
  dateRange: string,
) {
  const col = await getCollection();
  const query = accountId ? { userId, accountId, dateRange } : { userId, dateRange };
  return col.findOne(query) as Promise<RecommendationsDocument | null>;
}
