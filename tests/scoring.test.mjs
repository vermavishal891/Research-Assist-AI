import test from "node:test";
import assert from "node:assert/strict";

import { calculateOpportunityScore, DEFAULT_SCORING_WEIGHTS } from "../src/lib/core/scoring.mjs";

test("calculates opportunity score from configured weights and risk penalty", () => {
  const score = calculateOpportunityScore({
    demandScore: 80,
    competitionAdvantageScore: 70,
    commercialScore: 60,
    contentGapScore: 90,
    executionFeasibilityScore: 50,
    riskPenalty: 12,
  });

  assert.equal(score.finalScore, 60.5);
  assert.equal(score.formulaVersion, "opportunity-v1");
  assert.deepEqual(score.weights, DEFAULT_SCORING_WEIGHTS);
});

test("clamps component scores and final score to a 0 to 100 range", () => {
  const score = calculateOpportunityScore({
    demandScore: 150,
    competitionAdvantageScore: 100,
    commercialScore: 100,
    contentGapScore: 100,
    executionFeasibilityScore: 100,
    riskPenalty: -10,
  });

  assert.equal(score.finalScore, 100);
  assert.equal(score.components.demandScore, 100);
});

test("allows scoring weights to be configured", () => {
  const score = calculateOpportunityScore(
    {
      demandScore: 100,
      competitionAdvantageScore: 0,
      commercialScore: 0,
      contentGapScore: 0,
      executionFeasibilityScore: 0,
      riskPenalty: 0,
    },
    {
      demand: 0.5,
      competitionAdvantage: 0.2,
      commercial: 0.1,
      contentGap: 0.1,
      executionFeasibility: 0.1,
    },
  );

  assert.equal(score.finalScore, 50);
});
