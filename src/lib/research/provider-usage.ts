import type { ProviderName } from "@prisma/client";

type UsageStatus = "success" | "rate_limited" | "timeout" | "invalid_response" | "failed";

const COST_PER_REQUEST: Partial<Record<ProviderName, Record<string, number>>> = {
  mock: {
    "seed-expansion": 0,
    "keyword-metrics": 0,
    search: 0,
    "memo-draft": 0,
  },
  openai: {
    "seed-expansion": 0.002,
    "memo-draft": 0.004,
  },
  dataforseo: {
    "keyword-metrics": 0.0006,
  },
  serpapi: {
    search: 0.01,
  },
};

export function estimateProviderCost(provider: ProviderName, endpoint: string, requestCount: number) {
  const cost = COST_PER_REQUEST[provider]?.[endpoint] ?? 0;
  return Math.round(cost * Math.max(0, requestCount) * 10000) / 10000;
}

export function classifyProviderError(error: unknown): UsageStatus {
  const message = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();

  if (message.includes("429") || message.includes("rate limit") || message.includes("too many requests")) {
    return "rate_limited";
  }
  if (message.includes("timeout") || message.includes("timed out") || message.includes("abort")) {
    return "timeout";
  }
  if (message.includes("invalid json") || message.includes("parse") || message.includes("schema")) {
    return "invalid_response";
  }
  return "failed";
}

export function summarizeProviderUsage({
  provider,
  endpoint,
  requestCount,
  status,
}: {
  provider: ProviderName;
  endpoint: string;
  requestCount: number;
  status: UsageStatus;
}) {
  return {
    provider,
    endpoint,
    requestCount,
    status,
    estimatedCost: estimateProviderCost(provider, endpoint, requestCount),
  };
}
