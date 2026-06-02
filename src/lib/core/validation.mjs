function nullIfMissing(value) {
  return value === undefined || value === null || value === "" ? null : value;
}

function numericOrNull(value) {
  const normalized = nullIfMissing(value);
  if (normalized === null) return null;
  const numeric = Number(normalized);
  return Number.isFinite(numeric) ? numeric : null;
}

function inferDomain(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "unknown";
  }
}

function inferContentType({ title = "", link = "", snippet = "" }) {
  const haystack = `${title} ${link} ${snippet}`.toLowerCase();
  if (/(reddit|quora|forum|stackexchange|stackoverflow)/.test(haystack)) return "forum";
  if (/(calculator|calc|estimator|tool|generator)/.test(haystack)) return "tool";
  if (/(youtube|video)/.test(haystack)) return "video";
  if (/(news|press|magazine)/.test(haystack)) return "news";
  return "article";
}

export function normalizeKeywordMetric(input) {
  return {
    keyword: input.keyword,
    region: input.region ?? "IN",
    language: input.language ?? "en",
    searchVolume: numericOrNull(input.searchVolume ?? input.search_volume),
    cpcLow: numericOrNull(input.cpcLow ?? input.cpc_low),
    cpcHigh: numericOrNull(input.cpcHigh ?? input.cpc_high ?? input.cpc),
    competition: numericOrNull(input.competition),
    difficulty: numericOrNull(input.difficulty ?? input.keywordDifficulty ?? input.keyword_difficulty),
    intent: nullIfMissing(input.intent),
    source: input.source ?? "unknown",
    fetchedAt: input.fetchedAt ?? new Date().toISOString(),
  };
}

export function normalizeSerpResults(results = []) {
  return [...results]
    .map((item, index) => {
      const url = item.url ?? item.link ?? "";
      return {
        keyword: item.keyword ?? "",
        rank: Number(item.rank ?? item.position ?? index + 1),
        title: item.title ?? "Untitled result",
        url,
        domain: item.domain ?? inferDomain(url),
        snippet: item.snippet ?? "",
        contentType: item.contentType ?? inferContentType({ title: item.title, link: url, snippet: item.snippet }),
        serpFeatureType: item.serpFeatureType ?? item.type ?? "organic",
        source: item.source ?? "unknown",
        fetchedAt: item.fetchedAt ?? new Date().toISOString(),
      };
    })
    .sort((a, b) => a.rank - b.rank);
}

export function classifyDataQuality({
  evidenceCount = 0,
  requiredEvidenceCount = 3,
  freshnessDays = 0,
  maxFreshnessDays = 30,
  hasConflicts = false,
  missingCriticalMetrics = false,
} = {}) {
  const reasons = [];

  if (evidenceCount < requiredEvidenceCount) {
    reasons.push(`fewer than ${requiredEvidenceCount} evidence points`);
  }
  if (missingCriticalMetrics) {
    reasons.push("missing critical metrics");
  }
  if (hasConflicts) {
    reasons.push("conflicting source data");
  }
  if (freshnessDays > maxFreshnessDays) {
    reasons.push(`stale data older than ${maxFreshnessDays} days`);
  }

  if (evidenceCount < requiredEvidenceCount || missingCriticalMetrics) {
    return { state: "insufficient_evidence", reasons };
  }
  if (hasConflicts) {
    return { state: "conflicting", reasons };
  }
  if (freshnessDays > maxFreshnessDays) {
    return { state: "stale", reasons };
  }
  if (reasons.length > 0) {
    return { state: "partial", reasons };
  }
  return { state: "verified", reasons: ["minimum evidence gates passed"] };
}

export function valueOrUnavailable(value) {
  return value === null || value === undefined || value === "" ? "Data unavailable" : value;
}
