import { getAnalysisById } from "./models/profileAnalyzerHistory";

export interface AnalysisComparison {
  baselineId: string;
  currentId: string;
  scoreDelta: number;
  addedStrengths: string[];
  removedStrengths: string[];
  addedWeaknesses: string[];
  removedWeaknesses: string[];
}

export async function compareAnalyses(baselineId: string, currentId: string): Promise<AnalysisComparison | null> {
  const baseline = await getAnalysisById(baselineId);
  const current = await getAnalysisById(currentId);
  if (!baseline || !current) return null;

  const baselineScore = baseline.overallScore || 0;
  const currentScore = current.overallScore || 0;
  const scoreDelta = currentScore - baselineScore;

  const bs = new Set((baseline.snapshot?.topStrengths || []).map(String));
  const cs = new Set((current.snapshot?.topStrengths || []).map(String));
  const bw = new Set((baseline.snapshot?.topWeaknesses || []).map(String));
  const cw = new Set((current.snapshot?.topWeaknesses || []).map(String));

  const addedStrengths = Array.from(cs).filter((s) => !bs.has(s));
  const removedStrengths = Array.from(bs).filter((s) => !cs.has(s));
  const addedWeaknesses = Array.from(cw).filter((s) => !bw.has(s));
  const removedWeaknesses = Array.from(bw).filter((s) => !cw.has(s));

  return {
    baselineId,
    currentId,
    scoreDelta,
    addedStrengths,
    removedStrengths,
    addedWeaknesses,
    removedWeaknesses,
  };
}

export default { compareAnalyses };
