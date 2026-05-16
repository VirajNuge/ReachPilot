import { connectToDatabase } from "../mongodb";

export type AnalysisAuditAction = "VIEW" | "CREATE" | "UPDATE" | "DELETE" | "EXPORT";

export async function logAnalysisAction(options: {
  userId: string;
  action: AnalysisAuditAction;
  analysisId?: string;
  accountId?: string;
  ipAddress?: string;
  userAgent?: string;
  meta?: Record<string, any>;
}) {
  try {
    const { db } = await connectToDatabase();
    const doc = {
      userId: options.userId,
      action: options.action,
      analysisId: options.analysisId,
      accountId: options.accountId,
      ipAddress: options.ipAddress,
      userAgent: options.userAgent,
      meta: options.meta || {},
      createdAt: new Date(),
    };
    await db.collection("analysisAuditLogs").insertOne(doc);
  } catch (e) {
    console.warn("Failed to write audit log:", e);
  }
}

export default { logAnalysisAction };
