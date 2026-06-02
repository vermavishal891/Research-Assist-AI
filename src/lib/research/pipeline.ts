import { DataQualityState, Prisma, ProviderName, SignalType } from "@prisma/client";

import { getPrisma } from "@/lib/db";
import { buildInvestorMemo } from "@/lib/core/reports.mjs";
import { classifyDataQuality } from "@/lib/core/validation.mjs";
import { clusterSignals } from "@/lib/research/clustering";
import { classifyProviderError, summarizeProviderUsage } from "@/lib/research/provider-usage";
import { createProviders, detectSignalsForProviderData, type DetectedSignal } from "@/lib/research/providers";

const AUTO_CATEGORIES = [
  "AI tools",
  "education",
  "career",
  "finance",
  "local services",
  "health and fitness",
  "home improvement",
  "ecommerce",
  "gaming",
  "3D printing",
  "astronomy",
  "software tools",
  "small business tools",
  "India-specific calculators",
  "consumer tech",
  "productivity tools",
];

export type StartResearchInput = {
  topic: string;
  region?: string;
  language?: string;
  category?: string;
  depth?: string;
  maxKeywords?: number;
  minSearchVolume?: number;
  maxCompetition?: number;
  monetizationPreference?: string;
  useMockProviders?: boolean;
};

function providerMode(input: { useMockProviders?: boolean }) {
  return input.useMockProviders === true || process.env.USE_MOCK_PROVIDERS === "true";
}

function dataQualityFor(keywordMetricCount: number, serpResultCount: number, signalCount: number) {
  return (classifyDataQuality as (input: unknown) => { state: DataQualityState })({
    evidenceCount: keywordMetricCount + serpResultCount + signalCount,
    requiredEvidenceCount: 3,
    freshnessDays: 0,
    maxFreshnessDays: 30,
    hasConflicts: false,
    missingCriticalMetrics: keywordMetricCount === 0 || serpResultCount === 0,
  }).state;
}

export function isDatabaseConfigured() {
  const url = process.env.DATABASE_URL;
  return Boolean(url && !url.includes("replace_me") && !url.includes("project-ref"));
}

async function getScoringWeights(prisma: ReturnType<typeof getPrisma>) {
  const settings = await prisma.scoringSettings.upsert({
    where: { name: "default" },
    create: { name: "default" },
    update: {},
  });

  return {
    demand: settings.demandWeight,
    competitionAdvantage: settings.competitionAdvantageWeight,
    commercial: settings.commercialWeight,
    contentGap: settings.contentGapWeight,
    executionFeasibility: settings.executionFeasibilityWeight,
  };
}

async function logProviderUsage({
  prisma,
  researchRunId,
  provider,
  endpoint,
  requestCount,
  status,
}: {
  prisma: ReturnType<typeof getPrisma>;
  researchRunId: string;
  provider: ProviderName;
  endpoint: string;
  requestCount: number;
  status: "success" | "rate_limited" | "timeout" | "invalid_response" | "failed";
}) {
  const usage = summarizeProviderUsage({ provider, endpoint, requestCount, status });
  await prisma.apiUsageLog.create({
    data: {
      researchRunId,
      provider: usage.provider,
      endpoint: usage.endpoint,
      requestCount: usage.requestCount,
      status: usage.status,
      estimatedCost: usage.estimatedCost,
    },
  });
}

async function runProviderStep<T>({
  prisma,
  researchRunId,
  provider,
  endpoint,
  requestCount,
  execute,
}: {
  prisma: ReturnType<typeof getPrisma>;
  researchRunId: string;
  provider: ProviderName;
  endpoint: string;
  requestCount: number;
  execute: () => Promise<T>;
}) {
  try {
    const result = await execute();
    await logProviderUsage({ prisma, researchRunId, provider, endpoint, requestCount, status: "success" });
    return result;
  } catch (error) {
    await logProviderUsage({
      prisma,
      researchRunId,
      provider,
      endpoint,
      requestCount,
      status: classifyProviderError(error),
    });
    throw error;
  }
}

export async function startManualResearch(input: StartResearchInput) {
  if (!input.topic?.trim()) {
    throw new Error("Topic is required.");
  }

  const prisma = getPrisma();
  const region = input.region ?? "IN";
  const language = input.language ?? "en";
  const maxKeywords = Math.max(1, Math.min(100, input.maxKeywords ?? 25));
  const run = await prisma.researchRun.create({
    data: {
      mode: "manual",
      seedTopic: input.topic,
      category: input.category,
      region,
      language,
      depth: input.depth ?? "standard",
      maxKeywords,
      minSearchVolume: input.minSearchVolume,
      maxCompetition: input.maxCompetition,
      monetizationPref: input.monetizationPreference,
      status: "running",
    },
  });

  try {
    const providers = createProviders(providerMode(input));
    const scoringWeights = await getScoringWeights(prisma);
    const context = {
      topic: input.topic,
      category: input.category,
      region,
      language,
      maxKeywords,
    };

    const seedCandidates = await runProviderStep({
      prisma,
      researchRunId: run.id,
      provider: providers.ai.name,
      endpoint: "seed-expansion",
      requestCount: 1,
      execute: () => providers.ai.generateSeedCandidates(context),
    });
    const seeds = seedCandidates.map((candidate) => candidate.seed).slice(0, maxKeywords);

    await prisma.seedKeyword.createMany({
      data: seedCandidates.map((candidate) => ({
        researchRunId: run.id,
        keyword: candidate.seed,
        source: providers.ai.name,
        reason: candidate.reason_to_validate,
        intent: candidate.expected_intent,
      })),
    });

    const keywordMetrics = await runProviderStep({
      prisma,
      researchRunId: run.id,
      provider: providers.keywords.name,
      endpoint: "keyword-metrics",
      requestCount: Math.max(1, seeds.length),
      execute: () => providers.keywords.fetchKeywordMetrics(context, seeds),
    });
    await prisma.keywordMetric.createMany({
      data: keywordMetrics.map((metric) => ({
        researchRunId: run.id,
        keyword: metric.keyword,
        region: metric.region ?? region,
        language: metric.language ?? language,
        searchVolume: metric.searchVolume,
        cpcLow: metric.cpcLow,
        cpcHigh: metric.cpcHigh,
        competition: metric.competition,
        difficulty: metric.difficulty,
        intent: metric.intent,
        source: providers.keywords.name,
      })),
    });

    const serpKeywords = keywordMetrics.map((metric) => metric.keyword);
    const serpResults = await runProviderStep({
      prisma,
      researchRunId: run.id,
      provider: providers.serp.name,
      endpoint: "search",
      requestCount: Math.max(1, Math.min(5, serpKeywords.length, maxKeywords)),
      execute: () => providers.serp.fetchSerpResults(context, serpKeywords),
    });
    await prisma.serpResult.createMany({
      data: serpResults.map((result) => ({
        researchRunId: run.id,
        keyword: result.keyword,
        rank: result.rank,
        title: result.title,
        url: result.url,
        domain: result.domain,
        snippet: result.snippet,
        contentType: result.contentType,
        serpFeatureType: result.serpFeatureType,
        source: providers.serp.name,
      })),
    });

    const signals = detectSignalsForProviderData(context, keywordMetrics, serpResults);
    const signalRecords = await Promise.all(
      signals.map((signal) =>
        prisma.marketSignal.create({
          data: {
            researchRunId: run.id,
            signalType: signal.signalType as SignalType,
            title: signal.title,
            description: signal.description,
            category: input.category,
            region,
            language,
            source: (providerMode(input) ? "mock" : "dataforseo") as ProviderName,
            evidenceJson: signal.evidenceJson as Prisma.InputJsonValue,
            measuredDataJson: signal.measuredDataJson as Prisma.InputJsonValue,
            estimatedDataJson: (signal.estimatedDataJson ?? Prisma.JsonNull) as Prisma.InputJsonValue,
            assumptionsJson: (signal.assumptionsJson ?? Prisma.JsonNull) as Prisma.InputJsonValue,
            confidenceScore: signal.confidenceScore,
            riskScore: signal.riskScore,
            signalStrength: signal.signalStrength,
            dataFreshness: signal.dataFreshness,
            validationState: signal.validationState as DataQualityState,
          },
        }),
      ),
    );

    const cluster = clusterSignals({
      topic: input.topic,
      category: input.category,
      region,
      signals: signals as DetectedSignal[],
      keywordMetrics,
      scoringWeights,
    });
    const clusterRecord = await prisma.opportunityCluster.create({
      data: {
        researchRunId: run.id,
        title: cluster.title,
        category: cluster.category,
        region,
        primaryIntent: cluster.primaryIntent,
        totalVolume: cluster.totalVolume,
        avgCpc: cluster.avgCpc,
        avgDifficulty: cluster.avgDifficulty,
        signalCount: cluster.signalCount,
        validationState: cluster.validationState as DataQualityState,
        signalLinks: {
          create: signalRecords.map((signal) => ({
            marketSignalId: signal.id,
          })),
        },
      },
    });

    const breakdown = cluster.scoreBreakdown;
    const scoreRecord = await prisma.scoreBreakdown.create({
      data: {
        opportunityClusterId: clusterRecord.id,
        demandScore: breakdown.components.demandScore,
        competitionAdvantageScore: breakdown.components.competitionAdvantageScore,
        commercialScore: breakdown.components.commercialScore,
        contentGapScore: breakdown.components.contentGapScore,
        executionFeasibilityScore: breakdown.components.executionFeasibilityScore,
        riskPenalty: breakdown.riskPenalty,
        finalScore: breakdown.finalScore,
        confidenceScore: breakdown.confidenceScore,
        riskScore: breakdown.riskScore,
        formulaVersion: breakdown.formulaVersion,
        inputsJson: {
          weights: breakdown.weights,
          baseScore: breakdown.baseScore,
          keywordCount: keywordMetrics.length,
          serpResultCount: serpResults.length,
          signalCount: signals.length,
        },
      },
    });

    const evidenceItems = [
      {
        parentType: "opportunity_cluster",
        parentId: clusterRecord.id,
        sourceType: "keyword_metrics",
        sourceName: providers.keywords.name,
        metricName: "average_keyword_difficulty",
        value: cluster.avgDifficulty,
        confidence: 0.7,
      },
      {
        parentType: "opportunity_cluster",
        parentId: clusterRecord.id,
        sourceType: "serp",
        sourceName: providers.serp.name,
        metricName: "forum_result_count",
        value: serpResults.filter((result) => result.contentType === "forum").length,
        confidence: 0.75,
      },
    ];
    await prisma.evidenceItem.createMany({
      data: evidenceItems.map((item) => ({
        ...item,
        value: item.value ?? Prisma.JsonNull,
      })),
    });

    const missingData = [
      ...(cluster.totalVolume === null ? ["total monthly search volume"] : []),
      ...(cluster.avgCpc === null ? ["average CPC"] : []),
    ];
    const aiDraft = await runProviderStep({
      prisma,
      researchRunId: run.id,
      provider: providers.ai.name,
      endpoint: "memo-draft",
      requestCount: 1,
      execute: () =>
        providers.ai.draftMemo({
          cluster,
          scoreBreakdown: scoreRecord,
          evidenceItems,
          missingData,
        }),
    });
    const memoJson = (buildInvestorMemo as (input: unknown) => Record<string, unknown> & {
      measured_facts: unknown;
      calculated_estimates: unknown;
      assumptions: unknown;
      final_recommendation: string;
    })({
      cluster,
      scoreBreakdown: {
        finalScore: scoreRecord.finalScore,
        confidenceScore: scoreRecord.confidenceScore,
        riskScore: scoreRecord.riskScore,
      },
      evidenceItems,
      missingData,
      aiDraft,
    });

    await prisma.opportunityMemo.create({
      data: {
        opportunityClusterId: clusterRecord.id,
        memoJson: memoJson as Prisma.InputJsonValue,
        measuredFactsJson: memoJson.measured_facts as Prisma.InputJsonValue,
        calculatedEstimatesJson: memoJson.calculated_estimates as Prisma.InputJsonValue,
        assumptionsJson: memoJson.assumptions as Prisma.InputJsonValue,
        rawAiOutputJson: aiDraft as Prisma.InputJsonValue,
        validatedAiOutputJson: memoJson as Prisma.InputJsonValue,
        recommendation: memoJson.final_recommendation,
      },
    });

    const quality = dataQualityFor(keywordMetrics.length, serpResults.length, signals.length);
    await prisma.researchRun.update({
      where: { id: run.id },
      data: {
        status: quality === "insufficient_evidence" ? "partial" : "completed",
        dataQualityState: quality,
        completedAt: new Date(),
      },
    });

    return { researchRunId: run.id, opportunityClusterId: clusterRecord.id, signalCount: signals.length };
  } catch (error) {
    await prisma.researchRun.update({
      where: { id: run.id },
      data: {
        status: "partial",
        errorMessage: error instanceof Error ? error.message : "Unknown research pipeline failure",
        completedAt: new Date(),
      },
    });
    throw error;
  }
}

export async function startAutoDiscovery(input: { categories?: string[]; region?: string; language?: string; useMockProviders?: boolean }) {
  const categories = input.categories?.length ? input.categories : AUTO_CATEGORIES.slice(0, 4);
  const results = [];

  for (const category of categories) {
    results.push(
      await startManualResearch({
        topic: category,
        category,
        region: input.region ?? "IN",
        language: input.language ?? "en",
        maxKeywords: 10,
        useMockProviders: input.useMockProviders,
      }),
    );
  }

  return { categories, results };
}
