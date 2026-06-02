import test from "node:test";
import assert from "node:assert/strict";

import {
  classifyDataQuality,
  normalizeKeywordMetric,
  normalizeSerpResults,
} from "../src/lib/core/validation.mjs";

test("normalizes missing keyword metrics as null instead of zero", () => {
  const metric = normalizeKeywordMetric({
    keyword: "3d printing cost calculator india",
    searchVolume: undefined,
    cpcLow: null,
    cpcHigh: undefined,
    competition: undefined,
    difficulty: null,
    source: "mock",
  });

  assert.equal(metric.searchVolume, null);
  assert.equal(metric.cpcLow, null);
  assert.equal(metric.cpcHigh, null);
  assert.equal(metric.competition, null);
  assert.equal(metric.difficulty, null);
});

test("classifies stale and incomplete data conservatively", () => {
  const state = classifyDataQuality({
    evidenceCount: 2,
    requiredEvidenceCount: 3,
    freshnessDays: 45,
    maxFreshnessDays: 30,
    hasConflicts: false,
    missingCriticalMetrics: true,
  });

  assert.equal(state.state, "insufficient_evidence");
  assert.match(state.reasons.join(" "), /fewer than 3 evidence points/);
  assert.match(state.reasons.join(" "), /missing critical metrics/);
});

test("normalizes SERP result content types and keeps top results ordered", () => {
  const results = normalizeSerpResults([
    { position: 2, title: "Forum thread", link: "https://reddit.com/r/x", snippet: "question" },
    { position: 1, title: "Calculator", link: "https://example.com/calc", snippet: "tool" },
  ]);

  assert.equal(results[0].rank, 1);
  assert.equal(results[0].contentType, "tool");
  assert.equal(results[1].contentType, "forum");
});
