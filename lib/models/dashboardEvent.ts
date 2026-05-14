import { ObjectId } from "mongodb";
import { connectToDatabase } from "../mongodb";

export type DashboardEventType =
  | "dashboard_viewed"
  | "dashboard_loaded"
  | "settings_opened"
  | "settings_saved"
  | "section_hidden";

export interface DashboardEventDocument {
  _id?: ObjectId;
  userId: string;
  accountId: string;
  event: DashboardEventType;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

const COLLECTION = "dashboard_events";

async function getCollection() {
  const { db } = await connectToDatabase();
  return db.collection<DashboardEventDocument>(COLLECTION);
}

export async function ensureDashboardEventIndexes(): Promise<void> {
  const col = await getCollection();
  await Promise.all([
    col.createIndex({ userId: 1, accountId: 1, createdAt: -1 }),
    col.createIndex({ event: 1, createdAt: -1 }),
  ]);
}

export async function logDashboardEvent(
  event: Omit<DashboardEventDocument, "_id" | "createdAt">
): Promise<string> {
  const col = await getCollection();
  const result = await col.insertOne({
    ...event,
    createdAt: new Date(),
  });
  return result.insertedId.toString();
}
