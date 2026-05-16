import { connectToDatabase } from "../mongodb";

export async function triggerRecurringAnalyses() {
  const { db } = await connectToDatabase();
  const now = new Date();
  const toRun = await db.collection("recurringAnalyses").find({ isActive: true, nextRunAt: { $lte: now } }).toArray();
  for (const cfg of toRun) {
    try {
      // Placeholder: in a full implementation we'd call the analyzer pipeline here.
      console.log("Would trigger analysis for", cfg.profileHandle || cfg.profileUrl || cfg._id);

      // Update nextRunAt based on frequency (simple weekly default)
      const next = new Date(now.getTime() + (cfg.frequency === "weekly" ? 7 * 24 * 60 * 60 * 1000 : 30 * 24 * 60 * 60 * 1000));
      await db.collection("recurringAnalyses").updateOne({ _id: cfg._id }, { $set: { nextRunAt: next } });
    } catch (e) {
      console.warn("Failed to trigger recurring analysis for", cfg._id, e);
    }
  }
}

export default { triggerRecurringAnalyses };
