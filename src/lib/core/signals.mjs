const FORUM_DOMAINS = new Set(["reddit.com", "quora.com", "stackoverflow.com", "stackexchange.com"]);

function average(values) {
  const usable = values.filter((value) => Number.isFinite(value));
  return usable.length ? usable.reduce((sum, value) => sum + value, 0) / usable.length : null;
}

function createSignal({
  signalType,
  title,
  description,
  category,
  region,
  language,
  evidence,
  measuredData,
  confidenceScore,
  riskScore = 20,
  signalStrength,
}) {
  return {
    signalType,
    title,
    description,
    category,
    region,
    language,
    evidenceJson: evidence,
    measuredDataJson: measuredData,
    estimatedDataJson: null,
    assumptionsJson: [],
    confidenceScore,
    riskScore,
    signalStrength,
    dataFreshness: "current_run",
    validationState: evidence.length >= 2 ? "partial" : "insufficient_evidence",
  };
}

export function detectMarketSignals({
  category,
  region = "IN",
  language = "en",
  keywordMetrics = [],
  serpResults = [],
  relatedSearches = [],
} = {}) {
  const signals = [];
  const topResults = serpResults.filter((result) => result.rank <= 10);
  const forumResults = topResults.filter(
    (result) => result.contentType === "forum" || FORUM_DOMAINS.has(String(result.domain).replace(/^www\./, "")),
  );
  const toolResults = topResults.filter((result) => result.contentType === "tool");
  const avgDifficulty = average(keywordMetrics.map((metric) => Number(metric.difficulty)));
  const avgCpc = average(keywordMetrics.map((metric) => Number(metric.cpcHigh)));
  const totalVolume = keywordMetrics.reduce((sum, metric) => sum + (Number(metric.searchVolume) || 0), 0);
  const longTailCount = keywordMetrics.filter((metric) => String(metric.keyword).split(/\s+/).length >= 4).length;

  if (totalVolume > 0 && keywordMetrics.length >= 1) {
    signals.push(
      createSignal({
        signalType: "rising_demand",
        title: `${category ?? "Market"} shows measurable search demand`,
        description: "Keyword metrics contain measured search volume. Growth is not claimed without historical snapshots.",
        category,
        region,
        language,
        evidence: keywordMetrics.map((metric) => ({ keyword: metric.keyword, searchVolume: metric.searchVolume })),
        measuredData: { totalVolume, keywordCount: keywordMetrics.length },
        confidenceScore: totalVolume >= 1000 ? 65 : 50,
        signalStrength: Math.min(100, totalVolume / 50),
      }),
    );
  }

  if (avgDifficulty !== null && avgDifficulty <= 30) {
    signals.push(
      createSignal({
        signalType: "low_competition",
        title: "Keyword difficulty indicates a possible low-competition cluster",
        description: "Average difficulty is low enough to support investigation, but SERP evidence is still required.",
        category,
        region,
        language,
        evidence: keywordMetrics.map((metric) => ({ keyword: metric.keyword, difficulty: metric.difficulty })),
        measuredData: { avgDifficulty },
        confidenceScore: 62,
        signalStrength: 100 - avgDifficulty,
      }),
    );
  }

  if (forumResults.length >= 2 || forumResults.length / Math.max(1, topResults.length) >= 0.3) {
    signals.push(
      createSignal({
        signalType: "forum_ranking",
        title: "Forum and Q&A pages rank in top SERP positions",
        description: "Forum-heavy SERPs often indicate unsolved questions or weak specialized competition.",
        category,
        region,
        language,
        evidence: forumResults.map((result) => ({ rank: result.rank, domain: result.domain, title: result.title })),
        measuredData: { forumResultCount: forumResults.length, topResultCount: topResults.length },
        confidenceScore: 72,
        signalStrength: Math.min(100, forumResults.length * 25),
      }),
    );
  }

  if (topResults.length > 0 && (avgDifficulty === null || avgDifficulty <= 35) && forumResults.length >= 1) {
    signals.push(
      createSignal({
        signalType: "weak_serp",
        title: "SERP appears weak enough for deeper validation",
        description: "Weakness is based on observed result types only, not invented domain authority metrics.",
        category,
        region,
        language,
        evidence: topResults.map((result) => ({ rank: result.rank, domain: result.domain, contentType: result.contentType })),
        measuredData: { avgDifficulty, forumResultCount: forumResults.length },
        confidenceScore: 68,
        signalStrength: avgDifficulty === null ? 55 : 100 - avgDifficulty,
      }),
    );
  }

  if (avgCpc !== null && avgCpc >= 3) {
    signals.push(
      createSignal({
        signalType: "high_cpc",
        title: "Commercial CPC evidence is present",
        description: "CPC is sourced from keyword metrics and treated as commercial evidence, not revenue proof.",
        category,
        region,
        language,
        evidence: keywordMetrics.map((metric) => ({ keyword: metric.keyword, cpcHigh: metric.cpcHigh })),
        measuredData: { avgCpc },
        confidenceScore: 66,
        signalStrength: Math.min(100, avgCpc * 18),
      }),
    );
  }

  if (relatedSearches.length >= 2 || longTailCount >= 2) {
    signals.push(
      createSignal({
        signalType: "long_tail_cluster",
        title: "Related and long-tail searches suggest clustered intent",
        description: "Related searches are qualitative expansion evidence until validated with keyword metrics.",
        category,
        region,
        language,
        evidence: relatedSearches.map((search) => ({ relatedSearch: search })),
        measuredData: { relatedSearchCount: relatedSearches.length, longTailKeywordCount: longTailCount },
        confidenceScore: 55,
        signalStrength: Math.min(100, (relatedSearches.length + longTailCount) * 15),
      }),
    );
  }

  const toolIntent = [...keywordMetrics.map((metric) => metric.keyword), ...relatedSearches].some((text) =>
    /(calculator|template|generator|checker|estimator|comparison)/i.test(String(text)),
  );
  if (toolIntent && toolResults.length === 0) {
    signals.push(
      createSignal({
        signalType: "tool_gap",
        title: "Tool-oriented intent lacks dedicated tool results",
        description: "Search wording suggests users may prefer a calculator, template, or tool, but top results are not tools.",
        category,
        region,
        language,
        evidence: {
          keywordEvidence: keywordMetrics.map((metric) => metric.keyword),
          relatedSearches,
          toolResultCount: toolResults.length,
        },
        measuredData: { toolResultCount: toolResults.length },
        confidenceScore: 64,
        signalStrength: 70,
      }),
    );
  }

  if (toolIntent || forumResults.length > 0) {
    signals.push(
      createSignal({
        signalType: "content_gap",
        title: "Content format gap may exist",
        description: "The observed SERP suggests the search intent may need better structured answers, tools, templates, or localized examples.",
        category,
        region,
        language,
        evidence: { forumResultCount: forumResults.length, toolIntent },
        measuredData: { forumResultCount: forumResults.length, toolIntent },
        confidenceScore: 58,
        signalStrength: 60,
      }),
    );
  }

  if (avgCpc !== null && avgCpc >= 1.5 && totalVolume > 0) {
    signals.push(
      createSignal({
        signalType: "commercial_intent",
        title: "Measured CPC and demand support commercial investigation",
        description: "Commercial attractiveness requires further validation beyond CPC.",
        category,
        region,
        language,
        evidence: { avgCpc, totalVolume },
        measuredData: { avgCpc, totalVolume },
        confidenceScore: 61,
        signalStrength: Math.min(100, avgCpc * 12 + totalVolume / 100),
      }),
    );
  }

  return signals;
}
