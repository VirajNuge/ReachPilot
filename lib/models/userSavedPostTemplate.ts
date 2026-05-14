import { connectToDatabase } from "../mongodb";
import { ObjectId } from "mongodb";

// ============================================================
// User Saved Post Template Model
// ============================================================

export type Platform = "linkedin" | "facebook" | "instagram" | "x" | "pinterest" | "threads";
export type TemplateCategory =
  | "how_to"
  | "listicle"
  | "thought_leadership"
  | "product_launch"
  | "behind_the_scenes"
  | "testimonial"
  | "engagement_question"
  | "personal_story"
  | "announcement"
  | "myth_busting"
  | "motivational"
  | "promotional";

export interface PlatformVariant {
  platform: Platform;
  structure: string;
  characterLimit?: number;
  exampleAdaptation?: string;
  confidence: number;
}

export interface UserSavedPostTemplateDocument {
  _id?: ObjectId;

  // User & Account Context
  userId: string;
  accountId: string;

  // Source Post Information
  sourcePost: {
    platform: Platform;
    postUrl: string;
    authorUsername: string;
    authorName?: string;
    authorProfileUrl?: string;
    caption: string;
    mediaUrls: string[];
    postedAt?: Date;
    metrics?: {
      likes: number;
      comments: number;
      shares: number;
      views?: number;
      replies?: number;
      retweets?: number;
    };
  };

  // Extracted Template
  template: {
    name: string;
    description: string;
    category: TemplateCategory;
    structure: string;
    hooks: string[];
    cta: string;
    tone: string;
    psychologyTriggers?: string[];
  };

  // Platform Variants
  platformVariants: PlatformVariant[];

  // AI Analysis Details
  aiAnalysis: {
    confidence: number;
    extractionMethod: "direct_structure" | "pattern_match" | "hybrid" | "ai_extraction" | "fallback_heuristic";
    aiModel: string;
    flags?: string[];
  };

  // Metadata
  metadata: {
    tags: string[];
    isPublic: boolean;
    communityStatus?: "pending" | "approved" | "rejected";
    viewCount: number;
    usageCount: number;
    isArchived: boolean;
    source: "extension_capture" | "manual_create" | "community";
    originalSourceId?: string;
  };

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  lastUsedAt?: Date;
}

const COLLECTION = "userSavedPostTemplates";

async function getCollection() {
  const { db } = await connectToDatabase();
  return db.collection<UserSavedPostTemplateDocument>(COLLECTION);
}

/**
 * Ensure all indexes are created
 */
export async function ensureTemplateIndexes(): Promise<void> {
  const col = await getCollection();

  await Promise.all([
    // Query user's templates
    col.createIndex({ userId: 1, createdAt: -1 }),

    // Search by template text and style
    col.createIndex({ userId: 1, "template.name": 1 }),
    col.createIndex({ userId: 1, "template.hooks": 1 }),

    // Filter by platform
    col.createIndex({ userId: 1, "platformVariants.platform": 1 }),

    // Filter by category
    col.createIndex({ userId: 1, "template.category": 1 }),

    // Find recently saved
    col.createIndex({ userId: 1, updatedAt: -1 }),

    // Prevent near-duplicates (same source URL)
    col.createIndex({ userId: 1, "sourcePost.postUrl": 1 }),

    // Faster lookup by author when saving X captures
    col.createIndex({ userId: 1, "sourcePost.authorUsername": 1 }),

    // Find public templates for sharing
    col.createIndex({ "metadata.isPublic": 1, createdAt: -1 }),
  ]);
}

/**
 * Save a new template from extension
 */
export async function saveUserTemplate(
  userId: string,
  accountId: string,
  data: Omit<UserSavedPostTemplateDocument, "_id" | "createdAt" | "updatedAt" | "userId" | "accountId">
): Promise<string> {
  const col = await getCollection();
  const now = new Date();

  const result = await col.insertOne({
    ...data,
    userId,
    accountId,
    createdAt: now,
    updatedAt: now,
  } as UserSavedPostTemplateDocument);

  return result.insertedId.toString();
}

/**
 * Check if a post URL already exists for user
 */
export async function findExistingTemplate(
  userId: string,
  postUrl: string
): Promise<UserSavedPostTemplateDocument | null> {
  const col = await getCollection();

  // Normalize URL for comparison
  const normalizedUrl = normalizeUrl(postUrl);

  return col.findOne({
    userId,
    "sourcePost.postUrl": {
      $regex: `^${escapeRegex(normalizedUrl)}`,
    },
  }) as Promise<UserSavedPostTemplateDocument | null>;
}

/**
 * Get user's saved templates with optional filtering
 */
export async function getUserTemplates(
  userId: string,
  filter?: {
    platform?: Platform;
    category?: TemplateCategory;
    search?: string;
    isArchived?: boolean;
  },
  pagination?: { page: number; limit: number }
): Promise<{ templates: UserSavedPostTemplateDocument[]; total: number }> {
  const col = await getCollection();

  const query: Record<string, unknown> = { userId };

  if (filter?.platform) {
    query["platformVariants.platform"] = filter.platform;
  }

  if (filter?.category) {
    query["template.category"] = filter.category;
  }

  if (filter?.isArchived !== undefined) {
    query["metadata.isArchived"] = filter.isArchived;
  }

  if (filter?.search) {
    const searchRegex = { $regex: filter.search, $options: "i" };
    query.$or = [
      { "template.name": searchRegex },
      { "template.description": searchRegex },
      { "template.hooks": searchRegex },
    ];
  }

  const skip = pagination ? (pagination.page - 1) * pagination.limit : 0;
  const limit = pagination?.limit || 10;

  const [templates, total] = await Promise.all([
    col
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray(),
    col.countDocuments(query),
  ]);

  return { templates, total };
}

/**
 * Get a single template by ID
 */
export async function getUserTemplateById(
  userId: string,
  templateId: string
): Promise<UserSavedPostTemplateDocument | null> {
  const col = await getCollection();

  try {
    return col.findOne({
      _id: new ObjectId(templateId),
      userId,
    }) as Promise<UserSavedPostTemplateDocument | null>;
  } catch {
    return null;
  }
}

/**
 * Update a template
 */
export async function updateUserTemplate(
  userId: string,
  templateId: string,
  data: Partial<Omit<UserSavedPostTemplateDocument, "_id" | "userId" | "createdAt">>
): Promise<boolean> {
  const col = await getCollection();

  try {
    const result = await col.updateOne(
      { _id: new ObjectId(templateId), userId },
      {
        $set: {
          ...data,
          updatedAt: new Date(),
        },
      }
    );

    return result.modifiedCount > 0;
  } catch {
    return false;
  }
}

/**
 * Delete a template
 */
export async function deleteUserTemplate(userId: string, templateId: string): Promise<boolean> {
  const col = await getCollection();

  try {
    const result = await col.deleteOne({
      _id: new ObjectId(templateId),
      userId,
    });

    return result.deletedCount > 0;
  } catch {
    return false;
  }
}

/**
 * Archive a template (soft delete)
 */
export async function archiveUserTemplate(userId: string, templateId: string): Promise<boolean> {
  return updateUserTemplate(userId, templateId, {
    metadata: {
      tags: [],
      isPublic: false,
      viewCount: 0,
      usageCount: 0,
      isArchived: true,
      source: "extension_capture",
    },
  });
}

/**
 * Increment usage count
 */
export async function incrementTemplateUsage(
  userId: string,
  templateId: string
): Promise<boolean> {
  const col = await getCollection();

  try {
    const result = await col.updateOne(
      { _id: new ObjectId(templateId), userId },
      {
        $inc: { "metadata.usageCount": 1 },
        $set: { lastUsedAt: new Date(), updatedAt: new Date() },
      }
    );

    return result.modifiedCount > 0;
  } catch {
    return false;
  }
}

/**
 * Helper: Normalize URL for comparison
 */
function normalizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    parsed.search = "";
    parsed.hash = "";
    return parsed.toString().replace(/\/$/, "");
  } catch {
    return url;
  }
}

/**
 * Helper: Escape regex special characters
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
