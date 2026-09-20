import { NextRequest } from "next/server";
import { getRequestIdentity } from "@/lib/routeAuth";
import { getPostAnalysisHistoryByAnalysisId, type PostAnalyzerHistoryDocument } from "@/lib/models/postAnalyzerHistory";
import { getAnalysisHistoryForAccount, type ProfileAnalyzerHistoryDocument } from "@/lib/models/profileAnalyzerHistory";

export async function getOwnedPostAnalysis(
  request: NextRequest,
  analysisId: string,
  accountId?: string,
): Promise<{ record: PostAnalyzerHistoryDocument; userId: string; accountId: string } | null> {
  const identity = await getRequestIdentity(request, accountId);
  if (!identity || !identity.accountId) return null;
  const record = await getPostAnalysisHistoryByAnalysisId(identity.userId, identity.accountId, analysisId);
  return record ? { record, userId: identity.userId, accountId: identity.accountId } : null;
}

export async function getLatestOwnedProfileAnalysis(
  request: NextRequest,
  accountId?: string,
): Promise<{ record: ProfileAnalyzerHistoryDocument; userId: string; accountId: string } | null> {
  const identity = await getRequestIdentity(request, accountId);
  if (!identity || !identity.accountId) return null;
  const history = await getAnalysisHistoryForAccount(identity.userId, identity.accountId, 1, 0);
  const record = history.analyses[0];
  return record ? { record, userId: identity.userId, accountId: identity.accountId } : null;
}
