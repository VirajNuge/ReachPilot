// ============================================================
// Saved Idea Model — MongoDB CRUD for the Idea Planner
// ============================================================

import { connectToDatabase } from "../mongodb";
import { ObjectId } from "mongodb";
import type { GeneratedIdea, IdeaMode } from "../ideaFinder/types";

export type IdeaStatus = "idea-bank" | "drafting" | "published";
export type IdeaFeedback = "positive" | "negative";

export interface SavedIdeaDocument {
  _id?: ObjectId;
  userId: string;
  accountId: string;
  idea: GeneratedIdea;
  status: IdeaStatus;
  mode: IdeaMode;
  feedback?: IdeaFeedback;
  postGenerationId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const COLLECTION = "savedIdeas";

async function getCollection() {
  const { db } = await connectToDatabase();
  return db.collection<SavedIdeaDocument>(COLLECTION);
}

/** Save a new idea to the planner. */
export async function saveIdea(
  userId: string,
  accountId: string,
  idea: GeneratedIdea,
  mode: IdeaMode,
  status: IdeaStatus = "idea-bank"
): Promise<string> {
  const col = await getCollection();
  const now = new Date();
  const result = await col.insertOne({
    userId,
    accountId,
    idea,
    status,
    mode,
    createdAt: now,
    updatedAt: now,
  });
  return result.insertedId.toString();
}

/** Get saved ideas for a user+account, optionally filtered by status. */
export async function getSavedIdeas(
  userId: string,
  accountId: string,
  status?: IdeaStatus
): Promise<SavedIdeaDocument[]> {
  const col = await getCollection();
  const query: Record<string, unknown> = { userId, accountId };
  if (status) query.status = status;
  return col.find(query).sort({ createdAt: -1 }).toArray();
}

/** Update feedback on a saved idea. */
export async function updateIdeaFeedback(
  userId: string,
  ideaId: string,
  feedback: IdeaFeedback
): Promise<boolean> {
  const col = await getCollection();
  const result = await col.updateOne(
    {
      userId,
      $or: [{ _id: new ObjectId(ideaId) }, { "idea.id": ideaId }],
    },
    { $set: { feedback, updatedAt: new Date() } }
  );
  return result.modifiedCount > 0;
}

/** Update the status of a saved idea. */
export async function updateIdeaStatus(
  userId: string,
  ideaId: string,
  status: IdeaStatus
): Promise<boolean> {
  const col = await getCollection();
  const result = await col.updateOne(
    { _id: new ObjectId(ideaId), userId },
    { $set: { status, updatedAt: new Date() } }
  );
  return result.modifiedCount > 0;
}
