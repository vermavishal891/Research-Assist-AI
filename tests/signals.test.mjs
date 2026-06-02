import test from "node:test";
import assert from "node:assert/strict";

import { detectMarketSignals } from "../src/lib/core/signals.mjs";

test("detects weak SERP and forum ranking signals from forum-heavy results", () => {
  const signals = detectMarketSignals({
    category: "3D printing",
    region: "IN",
    language: "en",
    keywordMetrics: [
      { keyword: "3d printing cost calculator india", searchVolume: 900, cpcHigh: 1.8, difficulty: 18 },
    ],
    serpResults: [
      { rank: 1, title: "Reddit thread", domain: "reddit.com", contentType: "forum" },
      { rank: 2, title: "Quora question", domain: "quora.com", contentType: "forum" },
      { rank: 3, title: "Old guide", domain: "oldblog.example", contentType: "article" },
    ],
  });

  assert.ok(signals.some((signal) => signal.signalType === "weak_serp"));
  assert.ok(signals.some((signal) => signal.signalType === "forum_ranking"));
});

test("detects high CPC and content/tool gaps only from supplied evidence", () => {
  const signals = detectMarketSignals({
    category: "finance",
    region: "IN",
    language: "en",
    keywordMetrics: [
      { keyword: "sip calculator for freelancers", searchVolume: 1200, cpcHigh: 4.5, difficulty: 25 },
    ],
    serpResults: [
      { rank: 1, title: "SIP guide", domain: "example.com", contentType: "article" },
      { rank: 2, title: "Generic blog", domain: "blog.example", contentType: "article" },
    ],
    relatedSearches: ["sip calculator india", "freelancer tax sip template"],
  });

  assert.ok(signals.some((signal) => signal.signalType === "high_cpc"));
  assert.ok(signals.some((signal) => signal.signalType === "tool_gap"));
  assert.ok(signals.every((signal) => signal.measuredDataJson !== undefined));
});
