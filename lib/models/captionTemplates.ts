import { connectToDatabase } from "../mongodb";
import { ObjectId } from "mongodb";

// ============================================================
// Caption Template Model
// ============================================================

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

export type TemplatePlatform = "linkedin" | "x" | "instagram_post" | "facebook";

export interface PlatformTemplateVariant {
  platform: TemplatePlatform;
  structure: string;       // The full prompt framework for this platform
  examplePost?: string;    // Example post showing the template in action
  characterLimit?: number; // Enforced limit (280 for X, etc.)
}

export interface CaptionTemplateDocument {
  _id?: ObjectId;
  name: string;                          // e.g. "Product Launch Bundle"
  description: string;
  category: TemplateCategory;
  platforms: TemplatePlatform[];         // which platforms this bundle covers
  platformVariants: PlatformTemplateVariant[];
  isBundle: boolean;                     // true = multiple platform variants shown as one card
  matchKeywords: string[];               // keywords for AI auto-matching
  bestForObjectives: string[];           // PostObjective values this template suits
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const CAPTION_TEMPLATES_COLLECTION = "adminCaptionTemplates";

async function getCaptionTemplatesCollection() {
  const { db } = await connectToDatabase();
  return db.collection<CaptionTemplateDocument>(CAPTION_TEMPLATES_COLLECTION);
}

export async function getAllCaptionTemplates(filter?: {
  isActive?: boolean;
  category?: TemplateCategory;
  platform?: TemplatePlatform;
}): Promise<CaptionTemplateDocument[]> {
  const col = await getCaptionTemplatesCollection();
  const query: Record<string, unknown> = {};
  if (filter?.isActive !== undefined) query.isActive = filter.isActive;
  if (filter?.category) query.category = filter.category;
  if (filter?.platform) query.platforms = filter.platform;
  return col.find(query).sort({ sortOrder: 1, createdAt: -1 }).toArray() as Promise<CaptionTemplateDocument[]>;
}

export async function getCaptionTemplateById(id: string): Promise<CaptionTemplateDocument | null> {
  const col = await getCaptionTemplatesCollection();
  try {
    return col.findOne({ _id: new ObjectId(id) }) as Promise<CaptionTemplateDocument | null>;
  } catch {
    return null;
  }
}

export async function createCaptionTemplate(
  data: Omit<CaptionTemplateDocument, "_id" | "createdAt" | "updatedAt">
): Promise<string> {
  const col = await getCaptionTemplatesCollection();
  const now = new Date();
  const result = await col.insertOne({ ...data, createdAt: now, updatedAt: now });
  return result.insertedId.toString();
}

export async function updateCaptionTemplate(
  id: string,
  data: Partial<Omit<CaptionTemplateDocument, "_id" | "createdAt">>
): Promise<boolean> {
  const col = await getCaptionTemplatesCollection();
  try {
    const result = await col.updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...data, updatedAt: new Date() } }
    );
    return result.modifiedCount > 0;
  } catch {
    return false;
  }
}

export async function deleteCaptionTemplate(id: string): Promise<boolean> {
  const col = await getCaptionTemplatesCollection();
  try {
    const result = await col.deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount > 0;
  } catch {
    return false;
  }
}
