import { ObjectId } from "mongodb";
import { connectToDatabase } from "../mongodb";

export type PostAnalyzerPlatform = "linkedin" | "x" | "facebook" | "instagram" | string;

export interface PostAnalyzerSnapshot {
  summary?: string;
  topHooks?: string[];
  topGaps?: string[];
  recommendedActions?: string[];
}

export interface PostAnalyzerHistoryDocument {
  _id?: ObjectId;
  userId: string;
  accountId: string;
  analysisId: string;
  platform: PostAnalyzerPlatform;
  postUrl?: string;
  postAuthor?: string;
  postHandle?: string;
  postContent?: string;
  overallScore?: number;
  analysisData: any;
  snapshot: PostAnalyzerSnapshot;
  source?: string;
  status: "completed" | "failed" | "processing";
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
  analyzedAt?: Date;
  tags?: string[];
  notes?: string;
}

const COLLECTION = "postAnalyzerHistory";

export async function createPostAnalysisHistory(
  userId: string,
  accountId: string,
  doc: Omit<PostAnalyzerHistoryDocument, "_id" | "createdAt" | "updatedAt" | "userId" | "accountId">
): Promise<string> {
  const { db } = await connectToDatabase();
  const now = new Date();
  const toInsert = {
    ...doc,
    userId,
    accountId,
    createdAt: now,
    updatedAt: now,
  } as PostAnalyzerHistoryDocument;

  const res = await db.collection(COLLECTION).insertOne(toInsert as any);
  return res.insertedId.toHexString();
}

export async function upsertPostAnalysisHistory(
  userId: string,
  accountId: string,
  analysisId: string,
  doc: Omit<PostAnalyzerHistoryDocument, "_id" | "createdAt" | "updatedAt" | "userId" | "accountId" | "analysisId">
): Promise<string> {
  const { db } = await connectToDatabase();
  const now = new Date();
  const existing = await db.collection(COLLECTION).findOne({ userId, accountId, analysisId });
  if (existing?._id) {
    await db.collection(COLLECTION).updateOne(
      { _id: existing._id, userId, accountId },
      { $set: { ...doc, updatedAt: now } },
    );
    return existing._id.toHexString();
  }

  const result = await db.collection(COLLECTION).insertOne({
    ...doc,
    userId,
    accountId,
    analysisId,
    createdAt: now,
    updatedAt: now,
  } as PostAnalyzerHistoryDocument);

  return result.insertedId.toHexString();
}

export async function getPostAnalysisHistoryById(id: string): Promise<PostAnalyzerHistoryDocument | null> {
  const { db } = await connectToDatabase();
  try {
    const _id = new ObjectId(id);
    return (await db.collection(COLLECTION).findOne({ _id })) as PostAnalyzerHistoryDocument | null;
  } catch {
    return null;
  }
}

export async function getPostAnalysisHistoryByAnalysisId(
  userId: string,
  accountId: string,
  analysisId: string,
): Promise<PostAnalyzerHistoryDocument | null> {
  const { db } = await connectToDatabase();
  return (await db.collection(COLLECTION).findOne({ userId, accountId, analysisId })) as PostAnalyzerHistoryDocument | null;
}

export async function getPostAnalysisHistoryForAccount(
  userId: string,
  accountId: string,
  limit = 50,
  skip = 0,
  filters?: { platform?: string; minScore?: number; startDate?: Date; endDate?: Date },
): Promise<{ analyses: PostAnalyzerHistoryDocument[]; total: number }> {
  const { db } = await connectToDatabase();
  const query: any = { userId, accountId };
  if (filters?.platform) query.platform = filters.platform;
  if (typeof filters?.minScore === "number") query.overallScore = { $gte: filters.minScore };
  if (filters?.startDate || filters?.endDate) query.createdAt = {};
  if (filters?.startDate) query.createdAt.$gte = filters.startDate;
  if (filters?.endDate) query.createdAt.$lte = filters.endDate;

  const cursor = db.collection(COLLECTION).find(query).sort({ createdAt: -1 }).skip(skip).limit(limit);
  const analyses = (await cursor.toArray()) as PostAnalyzerHistoryDocument[];
  const total = await db.collection(COLLECTION).countDocuments(query);
  return { analyses, total };
}

export async function updatePostAnalysisHistoryMetadata(
  id: string,
  userId: string,
  update: Partial<Pick<PostAnalyzerHistoryDocument, "notes" | "tags">>,
): Promise<boolean> {
  const { db } = await connectToDatabase();
  try {
    const _id = new ObjectId(id);
    const res = await db.collection(COLLECTION).updateOne(
      { _id, userId },
      { $set: { ...update, updatedAt: new Date() } },
    );
    return res.modifiedCount > 0;
  } catch {
    return false;
  }
}

export async function deletePostAnalysisHistory(id: string, userId: string): Promise<boolean> {
  const { db } = await connectToDatabase();
  try {
    const _id = new ObjectId(id);
    const res = await db.collection(COLLECTION).deleteOne({ _id, userId });
    return res.deletedCount > 0;
  } catch {
    return false;
  }
}

export default {
  createPostAnalysisHistory,
  upsertPostAnalysisHistory,
  getPostAnalysisHistoryById,
  getPostAnalysisHistoryByAnalysisId,
  getPostAnalysisHistoryForAccount,
  updatePostAnalysisHistoryMetadata,
  deletePostAnalysisHistory,
};