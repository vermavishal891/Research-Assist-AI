import { valueOrUnavailable } from "./validation.mjs";

function collectAllowedNumbersFromEvidence(evidenceItems = []) {
  return evidenceItems
    .flatMap((item) => [item.value])
    .filter((value) => typeof value === "number" && Number.isFinite(value));
}

function extractNumbers(value) {
  const text = typeof value === "string" ? value : JSON.stringify(value);
  const matches = text.match(/(?<![a-zA-Z])\$?\d+(?:\.\d+)?%?/g) ?? [];
  return matches.map((match) => Number(match.replace(/[$%]/g, ""))).filter((number) => Number.isFinite(number));
}

export function validateAiMemoDraft(draft, { allowedNumbers = [] } = {}) {
  const allowed = new Set(allowedNumbers.map((number) => Number(number)));
  const foundNumbers = extractNumbers(draft);
  const violations = foundNumbers
    .filter((number) => !allowed.has(number))
    .map((number) => `unsupported numeric metric: ${number}`);

  return {
    valid: violations.length === 0,
    violations,
  };
}

export function buildInvestorMemo({ cluster, scoreBreakdown, evidenceItems = [], missingData = [], aiDraft = null }) {
  const allowedNumbers = collectAllowedNumbersFromEvidence(evidenceItems);
  const aiValidation = aiDraft ? validateAiMemoDraft(aiDraft, { allowedNumbers }) : { valid: true, violations: [] };
  const hasMissingData = missingData.length > 0;
  const finalRecommendation =
    scoreBreakdown.confidenceScore < 45 || hasMissingData || !aiValidation.valid
      ? "Needs More Data"
      : scoreBreakdown.finalScore >= 75
        ? "Strong Watch"
        : scoreBreakdown.finalScore >= 55
          ? "Worth Testing"
          : "Avoid";

  const memo = {
    memo_type: "Market Opportunity Research Memo",
    title: cluster.title,
    decision_status: "New",
    one_line_thesis:
      aiDraft?.one_line_thesis ??
      `${cluster.title} may deserve further validation if measured demand and SERP weakness remain consistent.`,
    target_region: cluster.region,
    target_audience: [],
    category: cluster.category,
    opportunity_score: scoreBreakdown.finalScore,
    confidence_score: scoreBreakdown.confidenceScore,
    risk_score: scoreBreakdown.riskScore,
    data_quality_state: hasMissingData ? "Partial" : "Verified",
    measured_facts: {
      total_monthly_search_volume: valueOrUnavailable(cluster.totalVolume),
      average_cpc: valueOrUnavailable(cluster.avgCpc),
      average_keyword_difficulty: valueOrUnavailable(cluster.avgDifficulty),
      serp_weakness_ratio: valueOrUnavailable(cluster.serpWeaknessRatio),
      forum_result_count: valueOrUnavailable(
        evidenceItems.find((item) => item.metricName === "forum_result_count")?.value ?? null,
      ),
      paa_questions: cluster.paaQuestions ?? [],
      related_searches: cluster.relatedSearches ?? [],
    },
    calculated_estimates: {
      traffic_capture_scenarios: [],
      monetization_scenarios: [],
      estimated_mvp_effort: "Needs validation",
    },
    assumptions: [
      "Scoring is deterministic and based only on supplied keyword, SERP, and evidence inputs.",
      "Any missing metric is displayed as unavailable rather than inferred.",
    ],
    market_problem: aiDraft?.market_problem ?? "Needs qualitative validation from user interviews or forum review.",
    why_this_signal_exists:
      aiDraft?.why_this_signal_exists ??
      "Current evidence suggests a possible mismatch between search intent and the quality or format of ranking results.",
    evidence_summary: evidenceItems.map((item) => ({
      metric: item.metricName,
      value: item.value,
      source: item.sourceName,
    })),
    competitor_landscape: [],
    content_and_product_gaps: [],
    possible_solution_angles: [],
    monetization_paths: [],
    risks_and_unknowns: [
      ...(missingData.length ? [`Missing data: ${missingData.join(", ")}.`] : []),
      ...(!aiValidation.valid ? aiValidation.violations : []),
    ],
    recommended_next_research: [
      "Refresh keyword metrics for the primary and related queries.",
      "Re-run SERP analysis for the top five intent-matched keywords.",
      "Manually review competitor pages for content quality and tool coverage.",
    ],
    final_recommendation: finalRecommendation,
  };

  return memo;
}
