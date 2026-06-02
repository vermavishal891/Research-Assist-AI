import { describe, expect, it } from "vitest";

import { calculateOpportunityScore } from "../src/lib/core/scoring.mjs";
import { detectMarketSignals } from "../src/lib/core/signals.mjs";

const detectSignals = detectMarketSignals as unknown as (input: {
  category: string;
  region: string;
  language: string;
  keywordMetrics: Array<{ keyword: string; searchVolume: number; cpcHigh: number; difficulty: number }>;
  serpResults: Array<{ rank: number; title: string; domain: string; contentType: string }>;
}) => Array<{ signalType: string }>;

describe("core research engines", () => {
  it("scores opportunities with the configured deterministic formula", () => {
    const score = calculateOpportunityScore({
      demandScore: 80,
      competitionAdvantageScore: 70,
      commercialScore: 60,
      contentGapScore: 90,
      executionFeasibilityScore: 50,
      riskPenalty: 12,
    });

    expect(score.finalScore).toBe(60.5);
  });

  it("detects weak SERP evidence from forum-heavy results", () => {
    const signals = detectSignals({
      category: "3D printing",
      region: "IN",
      language: "en",
      keywordMetrics: [{ keyword: "3d printing calculator india", searchVolume: 900, cpcHigh: 1.8, difficulty: 18 }],
      serpResults: [
        { rank: 1, title: "Reddit thread", domain: "reddit.com", contentType: "forum" },
        { rank: 2, title: "Quora question", domain: "quora.com", contentType: "forum" },
      ],
    });

    expect(signals.some((signal) => signal.signalType === "weak_serp")).toBe(true);
  });
});
