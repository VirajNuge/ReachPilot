import { ObjectId } from "mongodb";
import { connectToDatabase } from "../mongodb";

export type DashboardActivityType =
  | "post_generated"
  | "post_published"
  | "post_analyzed"
  | "template_saved"
  | "idea_created";

export type DashboardActivityStatus =
  | "draft"
  | "published"
  | "scheduled"
  | "analyzed"
  | "failed";

export interface DashboardActivityLogDocument {
  _id?: ObjectId;
  userId: string;
  accountId: string;
  activityType: DashboardActivityType;
  sourceFeature: "generator" | "analyzer" | "idea-finder" | "publishing";
  itemId: string;
  itemTitle: string;
  itemPreview: string;
  status: DashboardActivityStatus;
  platforms: string[];
  metrics?: {
    engagementRate?: number;
    likes?: number;
    comments?: number;
    shares?: number;
    score?: number;
    views?: number;
  };
  thumbnail?: {
    url: string;
    type: "image" | "video" | "text";
  };
  actionDate: Date;
  createdAt: Date;
}

const COLLECTION = "dashboard_activity_logs";

async function getCollection() {
  const { db } = await connectToDatabase();
  return db.collection<DashboardActivityLogDocument>(COLLECTION);
}

export async function ensureDashboardActivityIndexes(): Promise<void> {
  const col = await getCollection();
  await Promise.all([
    col.createIndex({ userId: 1, accountId: 1, actionDate: -1 }),
    col.createIndex({ userId: 1, accountId: 1, activityType: 1 }),
    col.createIndex({ createdAt: -1 }),
  ]);
}

export async function logDashboardActivity(
  activity: Omit<DashboardActivityLogDocument, "_id" | "createdAt">
): Promise<string> {
  const col = await getCollection();
  const now = new Date();
  const result = await col.insertOne({
    ...activity,
    createdAt: now,
  });
  return result.insertedId.toString();
}

export async function getDashboardActivities(
  userId: string,
  accountId: string,
  limit = 20
): Promise<DashboardActivityLogDocument[]> {
  const col = await getCollection();
  return col
    .find({ userId, accountId })
    .sort({ actionDate: -1 })
    .limit(limit)
    .toArray();
}
