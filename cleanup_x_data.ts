import * as dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function run() {
  const { connectToDatabase } = await import("./lib/mongodb");
  const { db } = await connectToDatabase();
  console.log("Cleaning up X posts...");
  const pRes = await db.collection("social_media_posts").deleteMany({ platform: "x" });
  console.log(`Deleted ${pRes.deletedCount} X posts.`);
  
  console.log("Cleaning up X metrics...");
  const mRes = await db.collection("social_media_metrics").deleteMany({ platform: "x" });
  console.log(`Deleted ${mRes.deletedCount} X metrics.`);
  
  process.exit(0);
}

run().catch(console.error);
