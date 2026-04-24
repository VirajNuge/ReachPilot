import { connectToDatabase } from "../mongodb";
import { ObjectId } from "mongodb";

// ============================================================
// Writing Style Model
// ============================================================

export interface WritingStyleDocument {
  _id?: ObjectId;
  name: string;
  description: string;
  toneProfile: {
    formalCasual: number;       // 0-100 (0=formal, 100=casual)
    seriousPlayful: number;     // 0-100 (0=serious, 100=playful)
    inspiringInformative: number; // 0-100 (0=inspiring, 100=informative)
    dataDriven: number;         // 0-100 (0=emotional, 100=data)
  };
  sentenceLength: string[];     // ["short", "medium", "long"]
  emojiUsage: "none" | "minimal" | "moderate" | "heavy";
  hashtagIntensity: "none" | "low" | "medium" | "high";
  ctas: string[];               // array of CTA types
  examplePost?: string;         // sample post demonstrating the style
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const WRITING_STYLES_COLLECTION = "adminWritingStyles";

async function getWritingStylesCollection() {
  const { db } = await connectToDatabase();
  return db.collection<WritingStyleDocument>(WRITING_STYLES_COLLECTION);
}

export async function getAllWritingStyles(activeOnly = false): Promise<WritingStyleDocument[]> {
  const col = await getWritingStylesCollection();
  const query = activeOnly ? { isActive: true } : {};
  return col.find(query).sort({ createdAt: -1 }).toArray() as Promise<WritingStyleDocument[]>;
}

export async function getWritingStyleById(id: string): Promise<WritingStyleDocument | null> {
  const col = await getWritingStylesCollection();
  try {
    return col.findOne({ _id: new ObjectId(id) }) as Promise<WritingStyleDocument | null>;
  } catch {
    return null;
  }
}

export async function createWritingStyle(
  data: Omit<WritingStyleDocument, "_id" | "createdAt" | "updatedAt">
): Promise<string> {
  const col = await getWritingStylesCollection();
  const now = new Date();
  const result = await col.insertOne({ ...data, createdAt: now, updatedAt: now });
  return result.insertedId.toString();
}

export async function updateWritingStyle(
  id: string,
  data: Partial<Omit<WritingStyleDocument, "_id" | "createdAt">>
): Promise<boolean> {
  const col = await getWritingStylesCollection();
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

export async function deleteWritingStyle(id: string): Promise<boolean> {
  const col = await getWritingStylesCollection();
  try {
    const result = await col.deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount > 0;
  } catch {
    return false;
  }
}

// ============================================================
// Visual Style Model
// ============================================================

export interface VisualStyleDocument {
  _id?: ObjectId;
  name: string;
  description: string;
  colorPalette: string[];       // array of hex colors (up to 6)
  primaryColor: string;         // main brand color hex
  fontFamily: string;           // e.g. "Inter", "Montserrat"
  fontHeadingWeight: string;    // e.g. "700", "900"
  imageStyle: string;           // from ImageStyle type: "photorealistic", "minimalist", etc.
  lightingDirection: string;    // from LightingDirection type
  shadingStyle: string;         // from ShadingStyle type
  compositionPreference: string; // from CompositionPreference type
  textStylePreference: string;  // from TextStylePreference type
  colorThemePreset: string;     // from ColorThemePreset type
  layoutStyle: string;          // from LayoutStyle type
  brandType: string;            // from BrandType type
  mood: string;                 // free text: "professional", "playful", "bold"
  tags: string[];               // for filtering
  thumbnailBg: string;          // hex for thumbnail preview bg
  sortOrder: number;            // display order in Templates tab
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const VISUAL_STYLES_COLLECTION = "adminVisualStyles";

async function getVisualStylesCollection() {
  const { db } = await connectToDatabase();
  return db.collection<VisualStyleDocument>(VISUAL_STYLES_COLLECTION);
}

export async function getAllVisualStyles(filter?: {
  isActive?: boolean;
}): Promise<VisualStyleDocument[]> {
  const col = await getVisualStylesCollection();
  const query: Record<string, unknown> = {};
  if (filter?.isActive !== undefined) query.isActive = filter.isActive;
  return col.find(query).sort({ sortOrder: 1, createdAt: -1 }).toArray() as Promise<VisualStyleDocument[]>;
}

export async function getVisualStyleById(id: string): Promise<VisualStyleDocument | null> {
  const col = await getVisualStylesCollection();
  try {
    return col.findOne({ _id: new ObjectId(id) }) as Promise<VisualStyleDocument | null>;
  } catch {
    return null;
  }
}

export async function createVisualStyle(
  data: Omit<VisualStyleDocument, "_id" | "createdAt" | "updatedAt">
): Promise<string> {
  const col = await getVisualStylesCollection();
  const now = new Date();
  const result = await col.insertOne({ ...data, createdAt: now, updatedAt: now });
  return result.insertedId.toString();
}

export async function updateVisualStyle(
  id: string,
  data: Partial<Omit<VisualStyleDocument, "_id" | "createdAt">>
): Promise<boolean> {
  const col = await getVisualStylesCollection();
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

export async function deleteVisualStyle(id: string): Promise<boolean> {
  const col = await getVisualStylesCollection();
  try {
    const result = await col.deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount > 0;
  } catch {
    return false;
  }
}

// ============================================================
// Visual Style Option Model
// One document per selectable option within a style tab.
// ============================================================

export type VisualStyleTab =
  | "imageStyle"
  | "lighting"
  | "shading"
  | "composition"
  | "textStyle"
  | "colorTheme";

export interface VisualStyleOptionDocument {
  _id?: ObjectId;
  tab: VisualStyleTab;            // which picker tab this option belongs to
  value: string;                  // the enum value passed to PostGenerationInput
  label: string;                  // display name, e.g. "Photorealistic"
  description: string;            // short description shown under the label
  referenceImageUrl: string;      // path like /visual-styles/cyberpunk.jpg (or empty)
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const VISUAL_STYLE_OPTIONS_COLLECTION = "adminVisualStyleOptions";

async function getVisualStyleOptionsCollection() {
  const { db } = await connectToDatabase();
  return db.collection<VisualStyleOptionDocument>(VISUAL_STYLE_OPTIONS_COLLECTION);
}

export async function getAllVisualStyleOptions(filter?: {
  tab?: VisualStyleTab;
  isActive?: boolean;
}): Promise<VisualStyleOptionDocument[]> {
  const col = await getVisualStyleOptionsCollection();
  const query: Record<string, unknown> = {};
  if (filter?.tab) query.tab = filter.tab;
  if (filter?.isActive !== undefined) query.isActive = filter.isActive;
  return col.find(query).sort({ tab: 1, sortOrder: 1, createdAt: 1 }).toArray() as Promise<VisualStyleOptionDocument[]>;
}

export async function getVisualStyleOptionById(id: string): Promise<VisualStyleOptionDocument | null> {
  const col = await getVisualStyleOptionsCollection();
  try {
    return col.findOne({ _id: new ObjectId(id) }) as Promise<VisualStyleOptionDocument | null>;
  } catch {
    return null;
  }
}

export async function createVisualStyleOption(
  data: Omit<VisualStyleOptionDocument, "_id" | "createdAt" | "updatedAt">
): Promise<string> {
  const col = await getVisualStyleOptionsCollection();
  const now = new Date();
  const result = await col.insertOne({ ...data, createdAt: now, updatedAt: now });
  return result.insertedId.toString();
}

export async function updateVisualStyleOption(
  id: string,
  data: Partial<Omit<VisualStyleOptionDocument, "_id" | "createdAt">>
): Promise<boolean> {
  const col = await getVisualStyleOptionsCollection();
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

export async function deleteVisualStyleOption(id: string): Promise<boolean> {
  const col = await getVisualStyleOptionsCollection();
  try {
    const result = await col.deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount > 0;
  } catch {
    return false;
  }
}
