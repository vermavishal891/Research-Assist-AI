import { calculateConfidenceScore, calculateOpportunityScore, calculateRiskPenalty } from "@/lib/core/scoring.mjs";

export type ClusterSignalInput = {
  signalType: string;
  title: string;
  category?: string | null;
  region?: string;
  confidenceScore: number;
  riskScore: number;
  signalStrength: number;
  measuredDataJson?: Record<string, unknown>;
};

type KeywordMetric = {
  keyword: string;
  searchVolume: number | null;
  cpcHigh: number | null;
  difficulty: number | null;
};

export function clusterSignals({
  topic,
  category,
  region,
  signals,
  keywordMetrics,
}: {
  topic: string;
  category?: string | null;
  region: string;
  signals: ClusterSignalInput[];
  keywordMetrics: KeywordMetric[];
}) {
  const totalVolume = keywordMetrics.reduce((sum, metric) => sum + (metric.searchVolume ?? 0), 0) || null;
  const cpcs = keywordMetrics.map((metric) => metric.cpcHigh).filter((value): value is number => value !== null);
  const difficulties = keywordMetrics.map((metric) => metric.difficulty).filter((value): value is number => value !== null);
  const avgCpc = cpcs.length ? cpcs.reduce((sum, value) => sum + value, 0) / cpcs.length : null;
  const avgDifficulty = difficulties.length
    ? difficulties.reduce((sum, value) => sum + value, 0) / difficulties.length
    : null;
  const signalTypes = new Set(signals.map((signal) => signal.signalType));
  const confidenceScore = calculateConfidenceScore({
    dataCompleteness: totalVolume !== null && avgCpc !== null && avgDifficulty !== null ? 80 : 45,
    sourceQuality: 75,
    freshness: 85,
    consistency: 70,
    sampleSize: Math.min(100, keywordMetrics.length * 20 + signals.length * 10),
    validationPassRate: signals.length >= 3 ? 75 : 45,
  });
  const riskPenalty = calculateRiskPenalty({
    isYmyl: /health|finance|medical|tax|legal/i.test(category ?? topic),
    dataConfidence: confidenceScore,
    monetizationClarity: avgCpc !== null ? 70 : 35,
    executionComplexity: signalTypes.has("tool_gap") ? 65 : 45,
  });
  const score = calculateOpportunityScore({
    demandScore: totalVolume ? Math.min(100, totalVolume / 20) : 25,
    competitionAdvantageScore: avgDifficulty !== null ? Math.max(0, 100 - avgDifficulty) : 40,
    commercialScore: avgCpc !== null ? Math.min(100, avgCpc * 20) : 25,
    contentGapScore: signalTypes.has("tool_gap") || signalTypes.has("content_gap") ? 75 : 35,
    executionFeasibilityScore: signalTypes.has("tool_gap") ? 58 : 70,
    riskPenalty,
  });

  return {
    title: `${topic} opportunity cluster`,
    category,
    region,
    primaryIntent: signalTypes.has("tool_gap") ? "tool" : signalTypes.has("commercial_intent") ? "commercial" : "research",
    totalVolume,
    avgCpc,
    avgDifficulty,
    signalCount: signals.length,
    validationState: signals.length >= 3 ? "partial" : "insufficient_evidence",
    scoreBreakdown: {
      ...score,
      confidenceScore,
      riskScore: Math.min(100, riskPenalty * 2),
    },
  };
}
