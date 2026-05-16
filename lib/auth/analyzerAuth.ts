import { getAnalysisById } from "../models/profileAnalyzerHistory";
import { getAccountById } from "../models/account";

export async function verifyAnalysisAccess(userId: string, analysisId: string): Promise<boolean> {
  const analysis = await getAnalysisById(analysisId);
  if (!analysis) return false;
  return analysis.userId === userId;
}

export async function verifyAccountAccess(userId: string, accountId: string): Promise<boolean> {
  const account = await getAccountById(accountId);
  if (!account) return false;
  return account.userId === userId;
}

export default { verifyAnalysisAccess, verifyAccountAccess };
