import { MongoClient, Db } from "mongodb";

const MONGO_URI = process.env.MONGO_URI;

// Allow tests to run without a real MongoDB connection by skipping the
// hard fail when NODE_ENV === 'test'. Production and dev still require MONGO_URI.
if (!MONGO_URI && process.env.NODE_ENV !== "test") {
  throw new Error("Please define the MONGO_URI environment variable in .env.local");
} else if (!MONGO_URI && process.env.NODE_ENV === "test") {
  // eslint-disable-next-line no-console
  console.warn("MONGO_URI not defined; running in test mode without a MongoDB connection.");
}

interface MongoCache {
  client: MongoClient | null;
  db: Db | null;
  promise: Promise<MongoClient> | null;
  indexesEnsured: boolean;
}

// Cache the connection in development to avoid multiple connections during HMR
const globalWithMongo = globalThis as typeof globalThis & {
  _mongoCache?: MongoCache;
};

let cached: MongoCache = globalWithMongo._mongoCache || {
  client: null,
  db: null,
  promise: null,
  indexesEnsured: false,
};

if (!globalWithMongo._mongoCache) {
  globalWithMongo._mongoCache = cached;
}

/**
 * Ensure all collection indexes exist exactly once per process lifetime.
 * Calling createIndex when the index already exists is a no-op in MongoDB, but
 * it still requires a round-trip on every request when placed inside request
 * handlers. Centralising them here means the cost is paid only on cold start.
 */
async function ensureIndexes(db: Db): Promise<void> {
  if (cached.indexesEnsured) return;
  cached.indexesEnsured = true;

  await Promise.all([
    // users
    db.collection("users").createIndex({ username: 1 }, { unique: true, background: true }),
    db.collection("users").createIndex({ email: 1 }, { unique: true, background: true }),

    // accounts
    db.collection("accounts").createIndex({ userId: 1 }, { background: true }),

    // personas
    db.collection("personas").createIndex({ userId: 1, accountId: 1 }, { background: true }),

    // postGenerations
    db.collection("postGenerations").createIndex({ userId: 1, createdAt: -1 }, { background: true }),
    db.collection("postGenerations").createIndex({ userId: 1, accountId: 1 }, { background: true }),

    // savedBrandStyles
    db.collection("savedBrandStyles").createIndex({ userId: 1 }, { background: true }),

    // adminWritingStyles
    db.collection("adminWritingStyles").createIndex({ isActive: 1 }, { background: true }),

    // adminCaptionTemplates
    db.collection("adminCaptionTemplates").createIndex({ isActive: 1, sortOrder: 1 }, { background: true }),
    db.collection("adminCaptionTemplates").createIndex({ category: 1 }, { background: true }),
    db.collection("adminCaptionTemplates").createIndex({ platforms: 1 }, { background: true }),

    // adminVisualStyles
    db.collection("adminVisualStyles").createIndex({ isActive: 1, sortOrder: 1 }, { background: true }),

    // adminVisualStyleOptions
    db.collection("adminVisualStyleOptions").createIndex({ tab: 1, sortOrder: 1, isActive: 1 }, { background: true }),

    // savedIdeas (Idea Finder planner)
    db.collection("savedIdeas").createIndex({ userId: 1, accountId: 1, status: 1 }, { background: true }),
    db.collection("savedIdeas").createIndex({ createdAt: -1 }, { background: true }),
    // profileAnalyzerHistory
    db.collection("profileAnalyzerHistory").createIndex({ userId: 1, accountId: 1, createdAt: -1 }, { background: true }),
    db.collection("profileAnalyzerHistory").createIndex({ userId: 1, accountId: 1, platform: 1 }, { background: true }),
    db.collection("profileAnalyzerHistory").createIndex({ userId: 1, overallScore: -1 }, { background: true }),

    // postAnalyzerHistory
    db.collection("postAnalyzerHistory").createIndex({ userId: 1, accountId: 1, createdAt: -1 }, { background: true }),
    db.collection("postAnalyzerHistory").createIndex({ userId: 1, accountId: 1, platform: 1 }, { background: true }),
    db.collection("postAnalyzerHistory").createIndex({ userId: 1, analysisId: 1 }, { background: true }),
  ]);
}

export async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  if (cached.client && cached.db) {
    return { client: cached.client, db: cached.db };
  }

  if (!cached.promise) {
    cached.promise = MongoClient.connect(MONGO_URI!, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
  }

  const client = await cached.promise;
  const db = client.db("reachpilot");

  cached.client = client;
  cached.db = db;

  // Fire-and-forget — don't block requests on index creation after cold start
  ensureIndexes(db).catch((err) =>
    console.error("[mongodb] ensureIndexes failed:", err)
  );

  return { client, db };
}
