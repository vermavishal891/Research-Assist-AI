export const DEFAULT_SCORING_WEIGHTS = Object.freeze({
  demand: 0.25,
  competitionAdvantage: 0.25,
  commercial: 0.2,
  contentGap: 0.2,
  executionFeasibility: 0.1,
});

export const FORMULA_VERSION = "opportunity-v1";

function clampScore(value) {
  const numeric = Number.isFinite(value) ? value : 0;
  return Math.max(0, Math.min(100, numeric));
}

function roundOne(value) {
  return Math.round(value * 10) / 10;
}

export function normalizeWeights(weights = DEFAULT_SCORING_WEIGHTS) {
  const merged = { ...DEFAULT_SCORING_WEIGHTS, ...weights };
  const total =
    merged.demand +
    merged.competitionAdvantage +
    merged.commercial +
    merged.contentGap +
    merged.executionFeasibility;

  if (total <= 0) {
    return DEFAULT_SCORING_WEIGHTS;
  }

  if (Math.abs(total - 1) < 0.000001) {
    return merged;
  }

  return {
    demand: merged.demand / total,
    competitionAdvantage: merged.competitionAdvantage / total,
    commercial: merged.commercial / total,
    contentGap: merged.contentGap / total,
    executionFeasibility: merged.executionFeasibility / total,
  };
}

export function calculateOpportunityScore(input, weights = DEFAULT_SCORING_WEIGHTS) {
  const normalizedWeights = normalizeWeights(weights);
  const components = {
    demandScore: clampScore(input.demandScore),
    competitionAdvantageScore: clampScore(input.competitionAdvantageScore),
    commercialScore: clampScore(input.commercialScore),
    contentGapScore: clampScore(input.contentGapScore),
    executionFeasibilityScore: clampScore(input.executionFeasibilityScore),
  };
  const riskPenalty = Math.max(0, Number.isFinite(input.riskPenalty) ? input.riskPenalty : 0);

  const baseScore =
    components.demandScore * normalizedWeights.demand +
    components.competitionAdvantageScore * normalizedWeights.competitionAdvantage +
    components.commercialScore * normalizedWeights.commercial +
    components.contentGapScore * normalizedWeights.contentGap +
    components.executionFeasibilityScore * normalizedWeights.executionFeasibility;

  return {
    formulaVersion: FORMULA_VERSION,
    weights: normalizedWeights,
    components,
    riskPenalty: roundOne(riskPenalty),
    baseScore: roundOne(baseScore),
    finalScore: roundOne(clampScore(baseScore - riskPenalty)),
  };
}

export function calculateRiskPenalty({
  isYmyl = false,
  brandDominatedSerp = false,
  dataConfidence = 100,
  seasonal = false,
  executionComplexity = 50,
  monetizationClarity = 50,
} = {}) {
  let penalty = 0;
  if (isYmyl) penalty += 15;
  if (brandDominatedSerp) penalty += 12;
  if (seasonal) penalty += 7;
  penalty += Math.max(0, 100 - clampScore(dataConfidence)) * 0.25;
  penalty += Math.max(0, clampScore(executionComplexity) - 60) * 0.15;
  penalty += Math.max(0, 60 - clampScore(monetizationClarity)) * 0.2;
  return roundOne(Math.min(40, penalty));
}

export function calculateConfidenceScore({
  dataCompleteness = 0,
  sourceQuality = 0,
  freshness = 0,
  consistency = 0,
  sampleSize = 0,
  validationPassRate = 0,
} = {}) {
  return roundOne(
    clampScore(
      clampScore(dataCompleteness) * 0.25 +
        clampScore(sourceQuality) * 0.2 +
        clampScore(freshness) * 0.2 +
        clampScore(consistency) * 0.15 +
        clampScore(sampleSize) * 0.1 +
        clampScore(validationPassRate) * 0.1,
    ),
  );
}
