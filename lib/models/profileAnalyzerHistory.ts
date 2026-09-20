import { Db, ObjectId } from "mongodb";
import { connectToDatabase } from "../mongodb";

export type Platform = "linkedin" | "x" | "facebook" | "instagram" | string;

export interface ProfileAnalyzerSnapshot {
  quickFixes?: Array<{ headline: string; tag?: string }>;
  topStrengths?: string[];
  topWeaknesses?: string[];
  recommendedActions?: string[];
}

export interface ProfileAnalyzerHistoryDocument {
  _id?: ObjectId;
  userId: string;
  accountId: string;
  platform: Platform;
  profileUrl?: string;
  profileHandle: string;
  profileName?: string;
  overallScore: number;
  profileScore?: number;
  contentScore?: number;
  engagementScore?: number;
  growthScore?: number;
  analysisData: any;
  snapshot: ProfileAnalyzerSnapshot;
  source?: string;
  status: "completed" | "failed" | "processing";
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
  analyzedAt?: Date;
  isBaseline?: boolean;
  comparisonMetadata?: { previousAnalysisId?: string; changeInScore?: number };
  tags?: string[];
  notes?: string;
}

const COLLECTION = "profileAnalyzerHistory";

export async function createProfileAnalysisHistory(
  userId: string,
  accountId: string,
  doc: Omit<ProfileAnalyzerHistoryDocument, "_id" | "createdAt" | "updatedAt" | "userId" | "accountId">
): Promise<string> {
  const { db } = await connectToDatabase();

  const now = new Date();
  const toInsert = {
    ...doc,
    userId,
    accountId,
    createdAt: now,
    updatedAt: now,
  } as ProfileAnalyzerHistoryDocument;

  const res = await db.collection(COLLECTION).insertOne(toInsert as any);
  return res.insertedId.toHexString();
}

export async function getAnalysisById(id: string): Promise<ProfileAnalyzerHistoryDocument | null> {
  const { db } = await connectToDatabase();
  try {
    const _id = new ObjectId(id);
    const doc = await db.collection(COLLECTION).findOne({ _id });
    return doc as ProfileAnalyzerHistoryDocument | null;
  } catch (e) {
    return null;
  }
}

export async function getAnalysisHistoryForAccount(
  userId: string,
  accountId: string,
  limit = 50,
  skip = 0,
  filters?: { platform?: string; minScore?: number; startDate?: Date; endDate?: Date }
): Promise<{ analyses: ProfileAnalyzerHistoryDocument[]; total: number }>{
  const { db } = await connectToDatabase();
  const query: any = { userId, accountId };
  if (filters?.platform) query.platform = filters.platform;
  if (typeof filters?.minScore === "number") query.overallScore = { $gte: filters!.minScore };
  if (filters?.startDate || filters?.endDate) query.createdAt = {};
  if (filters?.startDate) query.createdAt.$gte = filters.startDate;
  if (filters?.endDate) query.createdAt.$lte = filters.endDate;

  const cursor = db.collection(COLLECTION).find(query).sort({ createdAt: -1 }).skip(skip).limit(limit);
  const analyses = (await cursor.toArray()) as ProfileAnalyzerHistoryDocument[];
  const total = await db.collection(COLLECTION).countDocuments(query);
  return { analyses, total };
}

export async function getLatestAnalysisForProfile(
  userId: string,
  accountId: string,
  profileHandle: string,
  platform?: string
): Promise<ProfileAnalyzerHistoryDocument | null> {
  const { db } = await connectToDatabase();
  const query: any = { userId, accountId, profileHandle };
  if (platform) query.platform = platform;
  const doc = await db.collection(COLLECTION).find(query).sort({ analyzedAt: -1, createdAt: -1 }).limit(1).next();
  return doc as ProfileAnalyzerHistoryDocument | null;
}

export async function updateAnalysisMetadata(
  id: string,
  userId: string,
  update: Partial<Pick<ProfileAnalyzerHistoryDocument, "notes" | "tags" | "isBaseline">>
): Promise<boolean> {
  const { db } = await connectToDatabase();
  try {
    const _id = new ObjectId(id);
    const res = await db.collection(COLLECTION).updateOne({ _id, userId }, { $set: { ...update, updatedAt: new Date() } });
    return res.modifiedCount > 0;
  } catch (e) {
    return false;
  }
}

export async function deleteAnalysis(id: string, userId: string): Promise<boolean> {
  const { db } = await connectToDatabase();
  try {
    const _id = new ObjectId(id);
    const res = await db.collection(COLLECTION).deleteOne({ _id, userId });
    return res.deletedCount > 0;
  } catch (e) {
    return false;
  }
}

export default {
  createProfileAnalysisHistory,
  getAnalysisById,
  getAnalysisHistoryForAccount,
  getLatestAnalysisForProfile,
  updateAnalysisMetadata,
  deleteAnalysis,
};
