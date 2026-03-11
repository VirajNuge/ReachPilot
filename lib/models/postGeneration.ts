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
  await col.createIndex({ userId: 1, createdAt: -1 });
  return result.insertedId.toString();
}

/**
 * Get a post generation record by ID.
 */
export async function getPostGenerationById(
  id: string
): Promise<PostGenerationDocument | null> {
  const col = await getCollection();
  return col.findOne({ _id: new ObjectId(id) }) as Promise<PostGenerationDocument | null>;
}

/**
 * Get all post generation records for a user (newest first).
 */
export async function getPostGenerationsByUser(
  userId: string,
  accountId?: string,
  limit = 50
): Promise<PostGenerationDocument[]> {
  const col = await getCollection();
  const query = accountId ? { userId, accountId } : { userId };
  return col
    .find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray() as Promise<PostGenerationDocument[]>;
}

/**
 * Update a post generation record (partial update).
 */
export async function updatePostGeneration(
  id: string,
  update: Partial<PostGenerationDocument>
): Promise<boolean> {
  const col = await getCollection();
  const result = await col.updateOne(
    { _id: new ObjectId(id) },
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
 */
export async function deletePostGeneration(id: string): Promise<boolean> {
  const col = await getCollection();
  const result = await col.deleteOne({ _id: new ObjectId(id) });
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
  await col.createIndex({ userId: 1 });
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
  const col = await getBrandStylesCollection();
  const result = await col.deleteOne({
    _id: new ObjectId(id),
    userId,
  });
  return result.deletedCount > 0;
}
