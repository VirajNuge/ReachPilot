import { connectToDatabase } from "../lib/mongodb";

async function migrate() {
  const { db } = await connectToDatabase();

  // Find sessions that haven't been migrated yet. We'll mark migrated sessions with _migratedToHistoryId
  const cursor = db.collection("analysis_sessions").find({ _migratedToHistoryId: { $exists: false } }).limit(1000);
  let count = 0;
  while (await cursor.hasNext()) {
    const session = await cursor.next();
    if (!session) break;

    try {
      const newDoc: any = {
        userId: session.userId,
        accountId: session.accountId || "",
        platform: session.platform || "unknown",
        profileUrl: session.profileUrl || undefined,
        profileHandle: session.profileHandle || session.profileName || "",
        profileName: session.profileName || "",
        overallScore: session.score || (session.data?.profile?.profileScore ?? 0),
        analysisData: session.data || {},
        snapshot: {
          quickFixes: (session.data?.quickFixes || []).map((q: any) => ({ headline: q.headline, tag: q.tag || q.impact })),
          topStrengths: session.data?.bioAnalysis?.strengths || [],
          topWeaknesses: session.data?.bioAnalysis?.weaknesses || [],
          recommendedActions: (session.data?.quickFixes || []).slice(0,3).map((q: any) => q.headline),
        },
        source: session.source || "migrated",
        status: "completed",
        createdAt: new Date(session.timestamp || new Date().toISOString()),
        updatedAt: new Date(),
      };

      const res = await db.collection("profileAnalyzerHistory").insertOne(newDoc);
      await db.collection("analysis_sessions").updateOne({ _id: session._id }, { $set: { _migratedToHistoryId: res.insertedId.toHexString() } });
      count++;
    } catch (e) {
      console.warn("Failed to migrate session", session._id, e);
    }
  }

  console.log(`Migrated ${count} sessions to profileAnalyzerHistory`);
  process.exit(0);
}

if (require.main === module) {
  migrate().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

export { migrate };
