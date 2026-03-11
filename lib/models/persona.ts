import { connectToDatabase } from "../mongodb";
import { ObjectId } from "mongodb";

export interface PersonaDocument {
  _id?: ObjectId;
  userId: string;
  accountId?: string;
  createdAt: Date;
  updatedAt: Date;

  // Step 1 — Identity
  personaName: string;
  userRole: string;
  industry: string;
  tagline: string;
  websiteUrl: string;
  businessStage: string;
  scrapedWebsiteData: string;

  // New AI-impactful fields — Core Identity
  uniquePOV?: string; // Contrarian/unique take on their industry
  productsServices?: string; // What they sell or offer
  credibilitySignals?: string; // Proof points, awards, follower counts, years of experience
  writingSamples?: string; // 1-3 examples of their actual posts (up to 3000 chars)

  // Step 2 — Target Audience
  audienceSegments: string[];
  ageRange: string;
  region: string;
  education: string;
  painPoints: string;
  audienceGoals: string[];

  // New AI-impactful fields — Audience & Goals
  audienceDesiredOutcome?: string; // What the audience wants to achieve
  audienceRole?: string; // Job title / role of target audience
  conversionGoal?: string; // What action they want audience to take

  // Step 3 — Brand Objectives
  primaryObjective: string[];
  conversionTargets: string[];
  contentMix: string[];

  // Step 4 — Tone & Voice
  toneSliders: {
    formalCasual: number;
    seriousPlayful: number;
    inspiringInformative: number;
    dataDriven: number;
  };
  writingStyle: string;
  sentenceLength: string[];

  // Step 5 — Brand Personality
  brandArchetype: string;
  coreValues: string[];
  brandColorHex: string;

  // Step 6 — Brand Style (visual identity for post generation)
  logoUrl?: string;         // base64 data URL or external URL
  colorPalette?: string[];  // hex colors (up to 5)
  fontFamily?: string;      // e.g. "Inter", "Montserrat"

  // Step 6 — Content Inspiration
  favoriteInfluencer: string;
  influencerStyle?: string; // Name of influencer whose style they want to emulate
  contentThemes: string[];
  postingFrequency: string;
  contentDepth: string;
  doNotTalk: string;

  // Step 7 — Engagement Style
  commentReplyStyle: string[];
  emojiUsage: string;
  dmStrategy: string;

  // Step 8 — Connections
  connections: string[];
}

const COLLECTION = "personas";

async function getCollection() {
  const { db } = await connectToDatabase();
  return db.collection<PersonaDocument>(COLLECTION);
}

/**
 * Upsert persona for a user and account.
 * If the user/account already has a persona, it is updated; otherwise a new one is created.
 */
export async function upsertPersona(
  userId: string,
  accountId: string | undefined,
  data: Omit<PersonaDocument, "_id" | "userId" | "accountId" | "createdAt" | "updatedAt">
): Promise<{ id: string; updated: boolean }> {
  const col = await getCollection();
  const now = new Date();

  const query = accountId ? { userId, accountId } : { userId };
  const existing = await col.findOne(query);

  if (existing) {
    await col.updateOne(
      query,
      {
        $set: {
          ...data,
          updatedAt: now,
        },
      }
    );
    return { id: existing._id!.toString(), updated: true };
  }

  const doc: PersonaDocument = {
    userId,
    ...(accountId ? { accountId } : {}),
    createdAt: now,
    updatedAt: now,
    ...data,
  };

  const result = await col.insertOne(doc);
  // Ensure indexes
  await col.createIndex({ userId: 1, accountId: 1 });
  return { id: result.insertedId.toString(), updated: false };
}

/**
 * Retrieve the persona for a given user and account.
 */
export async function getPersonaByUserAndAccount(
  userId: string,
  accountId?: string
): Promise<PersonaDocument | null> {
  const col = await getCollection();
  const query = accountId ? { userId, accountId } : { userId };
  return col.findOne(query) as Promise<PersonaDocument | null>;
}

/**
 * Retrieve the persona for a given user (backwards compatibility).
 */
export async function getPersonaByUserId(
  userId: string
): Promise<PersonaDocument | null> {
  return getPersonaByUserAndAccount(userId);
}
