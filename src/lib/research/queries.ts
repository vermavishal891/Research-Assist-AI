import { getPrisma } from "@/lib/db";
import { isDatabaseConfigured } from "@/lib/research/pipeline";

export async function getDashboardSummary() {
  if (!isDatabaseConfigured()) {
    return {
      databaseReady: false,
      kpis: {
        activeRuns: 0,
        signalsFound: 0,
        topOpportunityScore: null,
        averageConfidence: null,
        highRiskCount: 0,
      },
      topOpportunities: [],
      recentRuns: [],
      sourceHealth: [],
      alerts: ["Supabase DATABASE_URL is still using placeholder values."],
    };
  }

  const prisma = getPrisma();
  const [activeRuns, signalsFound, highRiskCount, topScores, topOpportunities, recentRuns, sourceHealth] =
    await Promise.all([
      prisma.researchRun.count({ where: { status: { in: ["queued", "running"] } } }),
      prisma.marketSignal.count(),
      prisma.scoreBreakdown.count({ where: { riskScore: { gte: 60 } } }),
      prisma.scoreBreakdown.findMany({ orderBy: { finalScore: "desc" }, take: 25 }),
      prisma.opportunityCluster.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { scoreBreakdown: true, opportunityMemo: true },
      }),
      prisma.researchRun.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
      prisma.dataSourceHealth.findMany({ orderBy: { provider: "asc" } }),
    ]);

  const averageConfidence = topScores.length
    ? topScores.reduce((sum, score) => sum + score.confidenceScore, 0) / topScores.length
    : null;
  const topOpportunityScore = topScores[0]?.finalScore ?? null;

  return {
    databaseReady: true,
    kpis: {
      activeRuns,
      signalsFound,
      topOpportunityScore,
      averageConfidence,
      highRiskCount,
    },
    topOpportunities,
    recentRuns,
    sourceHealth,
    alerts: sourceHealth.filter((source) => source.status === "failed").map((source) => `${source.provider} failed`),
  };
}

export async function listResearchRuns() {
  if (!isDatabaseConfigured()) return [];
  return getPrisma().researchRun.findMany({ orderBy: { createdAt: "desc" }, take: 100 });
}

export async function listSignals() {
  if (!isDatabaseConfigured()) return [];
  return getPrisma().marketSignal.findMany({ orderBy: { createdAt: "desc" }, take: 100 });
}

export async function getSignal(id: string) {
  if (!isDatabaseConfigured()) return null;
  return getPrisma().marketSignal.findUnique({ where: { id } });
}

export async function listOpportunities() {
  if (!isDatabaseConfigured()) return [];
  return getPrisma().opportunityCluster.findMany({
    orderBy: { createdAt: "desc" },
    include: { scoreBreakdown: true, opportunityMemo: true },
    take: 100,
  });
}

export async function getOpportunity(id: string) {
  if (!isDatabaseConfigured()) return null;
  return getPrisma().opportunityCluster.findUnique({
    where: { id },
    include: {
      scoreBreakdown: true,
      opportunityMemo: true,
      signalLinks: { include: { marketSignal: true } },
      watchlistItems: true,
    },
  });
}

export async function listWatchlist() {
  if (!isDatabaseConfigured()) return [];
  return getPrisma().watchlistItem.findMany({
    orderBy: { updatedAt: "desc" },
    include: { opportunityCluster: { include: { scoreBreakdown: true, opportunityMemo: true } } },
    take: 100,
  });
}

export async function getSettings() {
  if (!isDatabaseConfigured()) return null;
  return getPrisma().scoringSettings.upsert({
    where: { name: "default" },
    create: { name: "default" },
    update: {},
  });
}

export async function listDataSourceHealth() {
  if (!isDatabaseConfigured()) return [];
  return getPrisma().dataSourceHealth.findMany({ orderBy: { provider: "asc" } });
}

export async function listUsage() {
  if (!isDatabaseConfigured()) return [];
  return getPrisma().apiUsageLog.findMany({ orderBy: { createdAt: "desc" }, take: 100 });
}
