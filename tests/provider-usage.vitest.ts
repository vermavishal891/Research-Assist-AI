import { describe, expect, it } from "vitest";

import { classifyProviderError, estimateProviderCost, summarizeProviderUsage } from "../src/lib/research/provider-usage";
import { clusterSignals } from "../src/lib/research/clustering";

describe("provider usage reliability", () => {
  it("estimates known provider costs conservatively", () => {
    expect(estimateProviderCost("mock", "seed-expansion", 10)).toBe(0);
    expect(estimateProviderCost("serpapi", "search", 3)).toBeGreaterThan(0);
    expect(estimateProviderCost("dataforseo", "keyword-metrics", 20)).toBeGreaterThan(0);
  });

  it("classifies provider failures for research-run diagnostics", () => {
    expect(classifyProviderError(new Error("429 Too Many Requests"))).toBe("rate_limited");
    expect(classifyProviderError(new Error("request timeout after 30s"))).toBe("timeout");
    expect(classifyProviderError(new Error("invalid json response"))).toBe("invalid_response");
  });

  it("summarizes provider usage with endpoint, request count, and status", () => {
    const usage = summarizeProviderUsage({
      provider: "serpapi",
      endpoint: "search",
      requestCount: 2,
      status: "success",
    });

    expect(usage).toMatchObject({
      provider: "serpapi",
      endpoint: "search",
      requestCount: 2,
      status: "success",
    });
    expect(usage.estimatedCost).toBeGreaterThan(0);
  });
});

describe("database-backed scoring settings", () => {
  it("passes custom scoring weights into opportunity scoring", () => {
    const cluster = clusterSignals({
      topic: "3D printing cost calculator India",
      category: "3D printing",
      region: "IN",
      scoringWeights: {
        demand: 0.6,
        competitionAdvantage: 0.1,
        commercial: 0.1,
        contentGap: 0.1,
        executionFeasibility: 0.1,
      },
      signals: [
        {
          signalType: "tool_gap",
          title: "Tool gap",
          confidenceScore: 70,
          riskScore: 20,
          signalStrength: 80,
        },
      ],
      keywordMetrics: [{ keyword: "3d printing calculator india", searchVolume: 1000, cpcHigh: 2, difficulty: 20 }],
    });

    expect(cluster.scoreBreakdown.weights.demand).toBe(0.6);
  });
});
