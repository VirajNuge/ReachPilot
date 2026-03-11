import { MongoClient, Db } from "mongodb";

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  throw new Error("Please define the MONGO_URI environment variable in .env.local");
}

interface MongoCache {
  client: MongoClient | null;
  db: Db | null;
  promise: Promise<MongoClient> | null;
}

// Cache the connection in development to avoid multiple connections during HMR
const globalWithMongo = globalThis as typeof globalThis & {
  _mongoCache?: MongoCache;
};

let cached: MongoCache = globalWithMongo._mongoCache || {
  client: null,
  db: null,
  promise: null,
};

if (!globalWithMongo._mongoCache) {
  globalWithMongo._mongoCache = cached;
}

export async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  if (cached.client && cached.db) {
    return { client: cached.client, db: cached.db };
  }

  if (!cached.promise) {
    cached.promise = MongoClient.connect(MONGO_URI!);
  }

  const client = await cached.promise;
  const db = client.db("reachpilot");

  cached.client = client;
  cached.db = db;

  return { client, db };
}
