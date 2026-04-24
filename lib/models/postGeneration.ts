import { connectToDatabase } from "../mongodb";
import { ObjectId } from "mongodb";
import type {
  PostGenerationDocument,
  PostGenerationStatus,
  SavedBrandStyle,
} from "../types/postGeneration";

// ============================================================
// PostGeneration Collection
// ============================================================

const COLLECTION = "postGenerations";

async function getCollection() {
  const { db } = await connectToDatabase();
  return db.collection<PostGenerationDocument>(COLLECTION);
}

/**
 * Create a new post generation record.
 */
export async function createPostGeneration(
  data: Omit<PostGenerationDocument, "_id" | "createdAt" | "updatedAt">
): Promise<string> {
  const col = await getCollection();
  const now = new Date();

  const doc: PostGenerationDocument = {
    ...data,
    createdAt: now,
    updatedAt: now,
  };

  const result = await col.insertOne(doc);
  return result.insertedId.toString();
}

/**
 * Get a post generation record by ID.
 */
export async function getPostGenerationById(
  id: string
): Promise<PostGenerationDocument | null> {
  if (!ObjectId.isValid(id)) return null;
  const col = await getCollection();
  return col.findOne({ _id: new ObjectId(id) }) as Promise<PostGenerationDocument | null>;
}

/**
 * Get all post generation records for a user (newest first).
 */
export async function getPostGenerationsByUser(
  userId: string,
  accountId?: string,
  limit = 50,
  status?: PostGenerationStatus
): Promise<PostGenerationDocument[]> {
  const col = await getCollection();
  const query: Record<string, unknown> = { userId };
  if (accountId) query.accountId = accountId;
  if (status) query.status = status;
  return col
    .find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray() as Promise<PostGenerationDocument[]>;
}

/**
 * Update a post generation record (partial update).
 * Pass userId to scope the update to the owning user (recommended for API routes).
 */
export async function updatePostGeneration(
  id: string,
  update: Partial<PostGenerationDocument>,
  userId?: string
): Promise<boolean> {
  if (!ObjectId.isValid(id)) return false;
  const col = await getCollection();
  const filter: Record<string, unknown> = { _id: new ObjectId(id) };
  if (userId) filter.userId = userId;
  const result = await col.updateOne(
    filter,
    {
      $set: {
        ...update,
        updatedAt: new Date(),
      },
    }
  );
  return result.modifiedCount > 0;
}

/**
 * Update the status of a post generation record.
 */
export async function updatePostGenerationStatus(
  id: string,
  status: PostGenerationStatus
): Promise<boolean> {
  return updatePostGeneration(id, { status });
}

/**
 * Delete a post generation record.
 * Pass userId to scope the delete to the owning user (recommended for API routes).
 */
export async function deletePostGeneration(id: string, userId?: string): Promise<boolean> {
  if (!ObjectId.isValid(id)) return false;
  const col = await getCollection();
  const filter: Record<string, unknown> = { _id: new ObjectId(id) };
  if (userId) filter.userId = userId;
  const result = await col.deleteOne(filter);
  return result.deletedCount > 0;
}

// ============================================================
// SavedBrandStyles Collection
// ============================================================

const BRAND_STYLES_COLLECTION = "savedBrandStyles";

async function getBrandStylesCollection() {
  const { db } = await connectToDatabase();
  return db.collection<SavedBrandStyle>(BRAND_STYLES_COLLECTION);
}

/**
 * Save a brand style preset.
 */
export async function saveBrandStyle(
  data: Omit<SavedBrandStyle, "_id" | "createdAt">
): Promise<string> {
  const col = await getBrandStylesCollection();
  const doc: SavedBrandStyle = {
    ...data,
    createdAt: new Date(),
  };
  const result = await col.insertOne(doc);
  return result.insertedId.toString();
}

/**
 * Get all brand styles for a user.
 */
export async function getBrandStylesByUser(
  userId: string
): Promise<SavedBrandStyle[]> {
  const col = await getBrandStylesCollection();
  return col
    .find({ userId })
    .sort({ createdAt: -1 })
    .toArray() as Promise<SavedBrandStyle[]>;
}

/**
 * Delete a brand style.
 */
export async function deleteBrandStyle(
  id: string,
  userId: string
): Promise<boolean> {
  if (!ObjectId.isValid(id)) return false;
  const col = await getBrandStylesCollection();
  const result = await col.deleteOne({
    _id: new ObjectId(id),
    userId,
  });
  return result.deletedCount > 0;
}
