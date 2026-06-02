import OpenAI from "openai";

import { detectMarketSignals } from "@/lib/core/signals.mjs";
import { normalizeKeywordMetric, normalizeSerpResults } from "@/lib/core/validation.mjs";

export type KeywordMetricInput = {
  keyword: string;
  region?: string;
  language?: string;
  searchVolume: number | null;
  cpcLow: number | null;
  cpcHigh: number | null;
  competition: number | null;
  difficulty: number | null;
  intent?: string | null;
  source: string;
};

export type SerpResultInput = {
  keyword: string;
  rank: number;
  title: string;
  url: string;
  domain: string;
  snippet?: string;
  contentType: string;
  serpFeatureType?: string;
  source: string;
};

export type SeedCandidate = {
  seed: string;
  reason_to_validate: string;
  possible_user_problem: string;
  expected_intent: string;
};

export type DetectedSignal = {
  signalType: string;
  title: string;
  description: string;
  category?: string | null;
  region: string;
  language: string;
  evidenceJson: unknown;
  measuredDataJson: Record<string, unknown>;
  estimatedDataJson: unknown;
  assumptionsJson: unknown;
  confidenceScore: number;
  riskScore: number;
  signalStrength: number;
  dataFreshness: string;
  validationState: string;
};

export type ResearchProviderContext = {
  topic: string;
  region: string;
  language: string;
  category?: string | null;
  maxKeywords: number;
};

export interface KeywordMetricsProvider {
  name: "dataforseo" | "mock";
  fetchKeywordMetrics(context: ResearchProviderContext, seeds: string[]): Promise<KeywordMetricInput[]>;
}

export interface SerpProvider {
  name: "serpapi" | "mock";
  fetchSerpResults(context: ResearchProviderContext, keywords: string[]): Promise<SerpResultInput[]>;
}

export interface AiResearchProvider {
  name: "openai" | "mock";
  generateSeedCandidates(context: ResearchProviderContext): Promise<SeedCandidate[]>;
  draftMemo(input: unknown): Promise<Record<string, unknown>>;
}

function requireEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is not configured.`);
  }
  return value;
}

export class DataForSEOProvider implements KeywordMetricsProvider {
  name = "dataforseo" as const;

  async fetchKeywordMetrics(context: ResearchProviderContext, seeds: string[]) {
    const login = requireEnv("DATAFORSEO_LOGIN");
    const password = requireEnv("DATAFORSEO_PASSWORD");
    const auth = Buffer.from(`${login}:${password}`).toString("base64");
    const keywords = seeds.slice(0, context.maxKeywords);

    const response = await fetch("https://api.dataforseo.com/v3/keywords_data/google_ads/search_volume/live", {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([
        {
          keywords,
          location_name: context.region === "IN" ? "India" : context.region,
          language_code: context.language,
        },
      ]),
    });

    if (!response.ok) {
      throw new Error(`DataForSEO request failed with ${response.status}`);
    }

    const json = await response.json();
    const results = json.tasks?.flatMap((task: { result?: unknown[] }) => task.result ?? []) ?? [];

    return results.map((item: Record<string, unknown>) =>
      normalizeKeywordMetric({
        keyword: String(item.keyword ?? ""),
        searchVolume: item.search_volume,
        cpcHigh: item.cpc,
        competition: item.competition_index ?? item.competition,
        difficulty: item.keyword_difficulty ?? item.competition_index,
        region: context.region,
        language: context.language,
        source: this.name,
      }),
    ) as KeywordMetricInput[];
  }
}

export class SerpApiProvider implements SerpProvider {
  name = "serpapi" as const;

  async fetchSerpResults(context: ResearchProviderContext, keywords: string[]) {
    const apiKey = requireEnv("SERPAPI_API_KEY");
    const rows: SerpResultInput[] = [];

    for (const keyword of keywords.slice(0, Math.min(5, context.maxKeywords))) {
      const params = new URLSearchParams({
        engine: "google",
        q: keyword,
        google_domain: "google.co.in",
        gl: context.region.toLowerCase(),
        hl: context.language,
        api_key: apiKey,
      });
      const response = await fetch(`https://serpapi.com/search.json?${params}`);
      if (!response.ok) {
        throw new Error(`SerpAPI request failed with ${response.status}`);
      }
      const json = await response.json();
      const normalized = normalizeSerpResults(
        (json.organic_results ?? []).map((result: Record<string, unknown>) => ({
          ...result,
          keyword,
          source: this.name,
        })),
      ) as SerpResultInput[];
      rows.push(...normalized);
    }

    return rows;
  }
}

export class OpenAIResearchProvider implements AiResearchProvider {
  name = "openai" as const;

  private getClient() {
    return new OpenAI({ apiKey: requireEnv("OPENAI_API_KEY") });
  }

  async generateSeedCandidates(context: ResearchProviderContext) {
    const response = await this.getClient().responses.create({
      model: process.env.OPENAI_MODEL ?? "gpt-5.4-mini",
      input: [
        {
          role: "system",
          content:
            "You are an evidence-first market research assistant. Generate seed candidates for validation only. Do not claim demand exists.",
        },
        {
          role: "user",
          content: `Category: ${context.category ?? "general"}\nTopic: ${context.topic}\nRegion: ${context.region}\nLanguage: ${context.language}\nReturn JSON only with seed_candidates array.`,
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "seed_candidates",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              seed_candidates: {
                type: "array",
                items: {
                  type: "object",
                  additionalProperties: false,
                  properties: {
                    seed: { type: "string" },
                    reason_to_validate: { type: "string" },
                    possible_user_problem: { type: "string" },
                    expected_intent: { type: "string" },
                  },
                  required: ["seed", "reason_to_validate", "possible_user_problem", "expected_intent"],
                },
              },
            },
            required: ["seed_candidates"],
          },
        },
      },
    });

    const parsed = JSON.parse(response.output_text);
    return parsed.seed_candidates as SeedCandidate[];
  }

  async draftMemo(input: unknown) {
    const response = await this.getClient().responses.create({
      model: process.env.OPENAI_MODEL ?? "gpt-5.4-mini",
      input: [
        {
          role: "system",
          content:
            "Create investor-style market research narrative using only supplied evidence. Do not invent numeric metrics.",
        },
        {
          role: "user",
          content: JSON.stringify(input),
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "memo_draft",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              one_line_thesis: { type: "string" },
              market_problem: { type: "string" },
              why_this_signal_exists: { type: "string" },
              evidence_summary: { type: "array", items: { type: "string" } },
            },
            required: ["one_line_thesis", "market_problem", "why_this_signal_exists", "evidence_summary"],
          },
        },
      },
    });

    return JSON.parse(response.output_text);
  }
}

export class MockAiProvider implements AiResearchProvider {
  name = "mock" as const;

  async generateSeedCandidates(context: ResearchProviderContext) {
    const base = context.topic || context.category || "market opportunity";
    return [
      {
        seed: `${base} calculator india`,
        reason_to_validate: "Tool-oriented search intent may reveal a content/product gap.",
        possible_user_problem: "Users need localized calculations or comparison support.",
        expected_intent: "tool",
      },
      {
        seed: `best ${base} tool`,
        reason_to_validate: "Buyer-intent modifier may indicate commercial research value.",
        possible_user_problem: "Users compare software or service options before purchase.",
        expected_intent: "commercial",
      },
      {
        seed: `${base} template`,
        reason_to_validate: "Template intent may indicate underserved self-serve demand.",
        possible_user_problem: "Users want a reusable format instead of generic advice.",
        expected_intent: "template",
      },
    ];
  }

  async draftMemo() {
    return {
      one_line_thesis: "Evidence suggests this opportunity deserves validation, but missing data should limit confidence.",
      market_problem: "Searchers appear to need clearer, localized, or tool-driven answers.",
      why_this_signal_exists: "The current result set contains weak-format evidence and incomplete specialized coverage.",
      evidence_summary: ["Mock provider evidence only; replace with live API evidence before making decisions."],
    };
  }
}

export class MockKeywordProvider implements KeywordMetricsProvider {
  name = "mock" as const;

  async fetchKeywordMetrics(context: ResearchProviderContext, seeds: string[]) {
    return seeds.slice(0, context.maxKeywords).map((seed, index) =>
      normalizeKeywordMetric({
        keyword: seed,
        searchVolume: index === 0 ? 900 : index === 1 ? 550 : null,
        cpcHigh: index === 1 ? 3.4 : 1.2,
        competition: 0.22,
        difficulty: index === 0 ? 18 : 28,
        region: context.region,
        language: context.language,
        source: this.name,
      }),
    ) as KeywordMetricInput[];
  }
}

export class MockSerpProvider implements SerpProvider {
  name = "mock" as const;

  async fetchSerpResults(_context: ResearchProviderContext, keywords: string[]) {
    return normalizeSerpResults(
      keywords.flatMap((keyword) => [
        {
          keyword,
          position: 1,
          title: "Reddit discussion with unresolved questions",
          link: "https://reddit.com/r/example/comments/market-question",
          snippet: "Users ask for a localized calculator.",
          source: this.name,
        },
        {
          keyword,
          position: 2,
          title: "Generic article without tool",
          link: "https://example.com/generic-guide",
          snippet: "Overview article.",
          source: this.name,
        },
      ]),
    ) as SerpResultInput[];
  }
}

export function createProviders(useMockProviders = false) {
  if (useMockProviders) {
    return {
      ai: new MockAiProvider(),
      keywords: new MockKeywordProvider(),
      serp: new MockSerpProvider(),
    };
  }

  return {
    ai: new OpenAIResearchProvider(),
    keywords: new DataForSEOProvider(),
    serp: new SerpApiProvider(),
  };
}

export function detectSignalsForProviderData(context: ResearchProviderContext, keywordMetrics: KeywordMetricInput[], serpResults: SerpResultInput[]) {
  return (detectMarketSignals as (input: unknown) => DetectedSignal[])({
    category: context.category ?? context.topic,
    region: context.region,
    language: context.language,
    keywordMetrics,
    serpResults,
    relatedSearches: [],
  });
}
