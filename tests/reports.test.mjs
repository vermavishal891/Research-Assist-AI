import test from "node:test";
import assert from "node:assert/strict";

import { buildInvestorMemo, validateAiMemoDraft } from "../src/lib/core/reports.mjs";

test("builds investor memo with measured facts, assumptions, unknowns, and no invented metrics", () => {
  const memo = buildInvestorMemo({
    cluster: {
      title: "3D Printing Cost Calculator for India",
      category: "3D printing",
      region: "IN",
      totalVolume: null,
      avgCpc: null,
      avgDifficulty: 18,
    },
    scoreBreakdown: { finalScore: 63, confidenceScore: 52, riskScore: 30 },
    evidenceItems: [
      { metricName: "forum_result_count", value: 2, sourceName: "SerpAPI" },
      { metricName: "average_keyword_difficulty", value: 18, sourceName: "DataForSEO" },
    ],
    missingData: ["total monthly search volume", "average CPC"],
  });

  assert.equal(memo.measured_facts.total_monthly_search_volume, "Data unavailable");
  assert.equal(memo.measured_facts.average_cpc, "Data unavailable");
  assert.equal(memo.final_recommendation, "Needs More Data");
  assert.ok(memo.risks_and_unknowns.includes("Missing data: total monthly search volume, average CPC."));
});

test("rejects AI memo drafts that introduce unsupported numeric metrics", () => {
  const validation = validateAiMemoDraft(
    {
      one_line_thesis: "This has 100000 monthly searches and $500k revenue potential.",
      evidence_summary: ["CPC is 9.5"],
    },
    {
      allowedNumbers: [18, 2],
    },
  );

  assert.equal(validation.valid, false);
  assert.ok(validation.violations.length >= 2);
});
