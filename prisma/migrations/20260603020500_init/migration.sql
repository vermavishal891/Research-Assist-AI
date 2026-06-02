-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "ResearchMode" AS ENUM ('manual', 'auto_discovery', 'deeper_research', 'watchlist_refresh');

-- CreateEnum
CREATE TYPE "ResearchStatus" AS ENUM ('queued', 'running', 'partial', 'completed', 'failed');

-- CreateEnum
CREATE TYPE "DataQualityState" AS ENUM ('verified', 'partial', 'conflicting', 'stale', 'insufficient_evidence');

-- CreateEnum
CREATE TYPE "SignalType" AS ENUM ('rising_demand', 'low_competition', 'high_cpc', 'weak_serp', 'content_gap', 'tool_gap', 'local_gap', 'forum_ranking', 'long_tail_cluster', 'commercial_intent', 'underserved_audience', 'seasonal_spike', 'competitor_weakness');

-- CreateEnum
CREATE TYPE "DecisionStatus" AS ENUM ('new', 'approved', 'rejected', 'watchlisted', 'needs_more_research');

-- CreateEnum
CREATE TYPE "ProviderName" AS ENUM ('dataforseo', 'serpapi', 'openai', 'supabase', 'mock');

-- CreateEnum
CREATE TYPE "ProviderHealthStatus" AS ENUM ('healthy', 'degraded', 'failed', 'unknown');

-- CreateTable
CREATE TABLE "ResearchRun" (
    "id" TEXT NOT NULL,
    "mode" "ResearchMode" NOT NULL,
    "seedTopic" TEXT,
    "category" TEXT,
    "region" TEXT NOT NULL DEFAULT 'IN',
    "language" TEXT NOT NULL DEFAULT 'en',
    "depth" TEXT NOT NULL DEFAULT 'standard',
    "maxKeywords" INTEGER NOT NULL DEFAULT 25,
    "minSearchVolume" INTEGER,
    "maxCompetition" DOUBLE PRECISION,
    "monetizationPref" TEXT,
    "status" "ResearchStatus" NOT NULL DEFAULT 'queued',
    "dataQualityState" "DataQualityState" NOT NULL DEFAULT 'partial',
    "errorMessage" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ResearchRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SeedKeyword" (
    "id" TEXT NOT NULL,
    "researchRunId" TEXT NOT NULL,
    "keyword" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "reason" TEXT,
    "intent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SeedKeyword_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RawApiResponse" (
    "id" TEXT NOT NULL,
    "researchRunId" TEXT,
    "provider" "ProviderName" NOT NULL,
    "endpoint" TEXT NOT NULL,
    "requestHash" TEXT NOT NULL,
    "responseSummary" JSONB NOT NULL,
    "rawJson" JSONB,
    "status" TEXT NOT NULL,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RawApiResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KeywordMetric" (
    "id" TEXT NOT NULL,
    "researchRunId" TEXT NOT NULL,
    "keyword" TEXT NOT NULL,
    "region" TEXT NOT NULL DEFAULT 'IN',
    "language" TEXT NOT NULL DEFAULT 'en',
    "searchVolume" INTEGER,
    "cpcLow" DOUBLE PRECISION,
    "cpcHigh" DOUBLE PRECISION,
    "competition" DOUBLE PRECISION,
    "difficulty" DOUBLE PRECISION,
    "intent" TEXT,
    "source" "ProviderName" NOT NULL,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KeywordMetric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SerpResult" (
    "id" TEXT NOT NULL,
    "researchRunId" TEXT NOT NULL,
    "keyword" TEXT NOT NULL,
    "rank" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "snippet" TEXT,
    "contentType" TEXT NOT NULL,
    "serpFeatureType" TEXT,
    "source" "ProviderName" NOT NULL,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SerpResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketSignal" (
    "id" TEXT NOT NULL,
    "researchRunId" TEXT NOT NULL,
    "signalType" "SignalType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT,
    "region" TEXT NOT NULL DEFAULT 'IN',
    "language" TEXT NOT NULL DEFAULT 'en',
    "source" "ProviderName" NOT NULL DEFAULT 'mock',
    "evidenceJson" JSONB NOT NULL,
    "measuredDataJson" JSONB NOT NULL,
    "estimatedDataJson" JSONB,
    "assumptionsJson" JSONB,
    "confidenceScore" DOUBLE PRECISION NOT NULL,
    "riskScore" DOUBLE PRECISION NOT NULL,
    "signalStrength" DOUBLE PRECISION NOT NULL,
    "dataFreshness" TEXT NOT NULL,
    "validationState" "DataQualityState" NOT NULL DEFAULT 'partial',
    "decisionStatus" "DecisionStatus" NOT NULL DEFAULT 'new',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MarketSignal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OpportunityCluster" (
    "id" TEXT NOT NULL,
    "researchRunId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT,
    "region" TEXT NOT NULL DEFAULT 'IN',
    "primaryIntent" TEXT NOT NULL,
    "totalVolume" INTEGER,
    "avgCpc" DOUBLE PRECISION,
    "avgDifficulty" DOUBLE PRECISION,
    "signalCount" INTEGER NOT NULL DEFAULT 0,
    "validationState" "DataQualityState" NOT NULL DEFAULT 'partial',
    "decisionStatus" "DecisionStatus" NOT NULL DEFAULT 'new',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OpportunityCluster_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OpportunitySignal" (
    "opportunityClusterId" TEXT NOT NULL,
    "marketSignalId" TEXT NOT NULL,

    CONSTRAINT "OpportunitySignal_pkey" PRIMARY KEY ("opportunityClusterId","marketSignalId")
);

-- CreateTable
CREATE TABLE "ScoreBreakdown" (
    "id" TEXT NOT NULL,
    "opportunityClusterId" TEXT NOT NULL,
    "demandScore" DOUBLE PRECISION NOT NULL,
    "competitionAdvantageScore" DOUBLE PRECISION NOT NULL,
    "commercialScore" DOUBLE PRECISION NOT NULL,
    "contentGapScore" DOUBLE PRECISION NOT NULL,
    "executionFeasibilityScore" DOUBLE PRECISION NOT NULL,
    "riskPenalty" DOUBLE PRECISION NOT NULL,
    "finalScore" DOUBLE PRECISION NOT NULL,
    "confidenceScore" DOUBLE PRECISION NOT NULL,
    "riskScore" DOUBLE PRECISION NOT NULL,
    "formulaVersion" TEXT NOT NULL,
    "inputsJson" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScoreBreakdown_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OpportunityMemo" (
    "id" TEXT NOT NULL,
    "opportunityClusterId" TEXT NOT NULL,
    "memoJson" JSONB NOT NULL,
    "measuredFactsJson" JSONB NOT NULL,
    "calculatedEstimatesJson" JSONB NOT NULL,
    "assumptionsJson" JSONB NOT NULL,
    "rawAiOutputJson" JSONB,
    "validatedAiOutputJson" JSONB,
    "recommendation" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OpportunityMemo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DecisionRecord" (
    "id" TEXT NOT NULL,
    "opportunityMemoId" TEXT NOT NULL,
    "decision" "DecisionStatus" NOT NULL,
    "notes" TEXT,
    "decidedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DecisionRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WatchlistItem" (
    "id" TEXT NOT NULL,
    "opportunityClusterId" TEXT NOT NULL,
    "status" "DecisionStatus" NOT NULL DEFAULT 'watchlisted',
    "nextReviewAt" TIMESTAMP(3),
    "lastScore" DOUBLE PRECISION,
    "currentScore" DOUBLE PRECISION,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WatchlistItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EvidenceItem" (
    "id" TEXT NOT NULL,
    "parentType" TEXT NOT NULL,
    "parentId" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL,
    "sourceName" TEXT NOT NULL,
    "metricName" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "unit" TEXT,
    "url" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confidence" DOUBLE PRECISION NOT NULL,
    "notes" TEXT,

    CONSTRAINT "EvidenceItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Competitor" (
    "id" TEXT NOT NULL,
    "opportunityClusterId" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "weaknessSummary" TEXT,
    "contentType" TEXT,
    "rank" INTEGER,

    CONSTRAINT "Competitor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentGap" (
    "id" TEXT NOT NULL,
    "opportunityClusterId" TEXT NOT NULL,
    "gapType" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "evidenceJson" JSONB NOT NULL,

    CONSTRAINT "ContentGap_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiUsageLog" (
    "id" TEXT NOT NULL,
    "researchRunId" TEXT,
    "provider" "ProviderName" NOT NULL,
    "endpoint" TEXT NOT NULL,
    "requestCount" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL,
    "estimatedCost" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApiUsageLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DataSourceHealth" (
    "id" TEXT NOT NULL,
    "provider" "ProviderName" NOT NULL,
    "status" "ProviderHealthStatus" NOT NULL DEFAULT 'unknown',
    "latencyMs" INTEGER,
    "lastCheckedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "errorMessage" TEXT,
    "detailsJson" JSONB,

    CONSTRAINT "DataSourceHealth_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScoringSettings" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'default',
    "demandWeight" DOUBLE PRECISION NOT NULL DEFAULT 0.25,
    "competitionAdvantageWeight" DOUBLE PRECISION NOT NULL DEFAULT 0.25,
    "commercialWeight" DOUBLE PRECISION NOT NULL DEFAULT 0.20,
    "contentGapWeight" DOUBLE PRECISION NOT NULL DEFAULT 0.20,
    "executionFeasibilityWeight" DOUBLE PRECISION NOT NULL DEFAULT 0.10,
    "minimumEvidenceCount" INTEGER NOT NULL DEFAULT 3,
    "staleAfterDays" INTEGER NOT NULL DEFAULT 30,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScoringSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ResearchRun_status_createdAt_idx" ON "ResearchRun"("status", "createdAt");

-- CreateIndex
CREATE INDEX "ResearchRun_mode_category_idx" ON "ResearchRun"("mode", "category");

-- CreateIndex
CREATE INDEX "SeedKeyword_researchRunId_idx" ON "SeedKeyword"("researchRunId");

-- CreateIndex
CREATE INDEX "RawApiResponse_provider_fetchedAt_idx" ON "RawApiResponse"("provider", "fetchedAt");

-- CreateIndex
CREATE INDEX "RawApiResponse_researchRunId_idx" ON "RawApiResponse"("researchRunId");

-- CreateIndex
CREATE INDEX "KeywordMetric_researchRunId_idx" ON "KeywordMetric"("researchRunId");

-- CreateIndex
CREATE INDEX "KeywordMetric_keyword_region_language_idx" ON "KeywordMetric"("keyword", "region", "language");

-- CreateIndex
CREATE INDEX "SerpResult_researchRunId_idx" ON "SerpResult"("researchRunId");

-- CreateIndex
CREATE INDEX "SerpResult_keyword_rank_idx" ON "SerpResult"("keyword", "rank");

-- CreateIndex
CREATE INDEX "MarketSignal_researchRunId_idx" ON "MarketSignal"("researchRunId");

-- CreateIndex
CREATE INDEX "MarketSignal_signalType_confidenceScore_idx" ON "MarketSignal"("signalType", "confidenceScore");

-- CreateIndex
CREATE INDEX "OpportunityCluster_researchRunId_idx" ON "OpportunityCluster"("researchRunId");

-- CreateIndex
CREATE INDEX "OpportunityCluster_decisionStatus_createdAt_idx" ON "OpportunityCluster"("decisionStatus", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ScoreBreakdown_opportunityClusterId_key" ON "ScoreBreakdown"("opportunityClusterId");

-- CreateIndex
CREATE UNIQUE INDEX "OpportunityMemo_opportunityClusterId_key" ON "OpportunityMemo"("opportunityClusterId");

-- CreateIndex
CREATE INDEX "WatchlistItem_status_nextReviewAt_idx" ON "WatchlistItem"("status", "nextReviewAt");

-- CreateIndex
CREATE INDEX "EvidenceItem_parentType_parentId_idx" ON "EvidenceItem"("parentType", "parentId");

-- CreateIndex
CREATE INDEX "ApiUsageLog_provider_createdAt_idx" ON "ApiUsageLog"("provider", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "DataSourceHealth_provider_key" ON "DataSourceHealth"("provider");

-- CreateIndex
CREATE UNIQUE INDEX "ScoringSettings_name_key" ON "ScoringSettings"("name");

-- AddForeignKey
ALTER TABLE "SeedKeyword" ADD CONSTRAINT "SeedKeyword_researchRunId_fkey" FOREIGN KEY ("researchRunId") REFERENCES "ResearchRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RawApiResponse" ADD CONSTRAINT "RawApiResponse_researchRunId_fkey" FOREIGN KEY ("researchRunId") REFERENCES "ResearchRun"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KeywordMetric" ADD CONSTRAINT "KeywordMetric_researchRunId_fkey" FOREIGN KEY ("researchRunId") REFERENCES "ResearchRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SerpResult" ADD CONSTRAINT "SerpResult_researchRunId_fkey" FOREIGN KEY ("researchRunId") REFERENCES "ResearchRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketSignal" ADD CONSTRAINT "MarketSignal_researchRunId_fkey" FOREIGN KEY ("researchRunId") REFERENCES "ResearchRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpportunityCluster" ADD CONSTRAINT "OpportunityCluster_researchRunId_fkey" FOREIGN KEY ("researchRunId") REFERENCES "ResearchRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpportunitySignal" ADD CONSTRAINT "OpportunitySignal_opportunityClusterId_fkey" FOREIGN KEY ("opportunityClusterId") REFERENCES "OpportunityCluster"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpportunitySignal" ADD CONSTRAINT "OpportunitySignal_marketSignalId_fkey" FOREIGN KEY ("marketSignalId") REFERENCES "MarketSignal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScoreBreakdown" ADD CONSTRAINT "ScoreBreakdown_opportunityClusterId_fkey" FOREIGN KEY ("opportunityClusterId") REFERENCES "OpportunityCluster"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpportunityMemo" ADD CONSTRAINT "OpportunityMemo_opportunityClusterId_fkey" FOREIGN KEY ("opportunityClusterId") REFERENCES "OpportunityCluster"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DecisionRecord" ADD CONSTRAINT "DecisionRecord_opportunityMemoId_fkey" FOREIGN KEY ("opportunityMemoId") REFERENCES "OpportunityMemo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WatchlistItem" ADD CONSTRAINT "WatchlistItem_opportunityClusterId_fkey" FOREIGN KEY ("opportunityClusterId") REFERENCES "OpportunityCluster"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Competitor" ADD CONSTRAINT "Competitor_opportunityClusterId_fkey" FOREIGN KEY ("opportunityClusterId") REFERENCES "OpportunityCluster"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentGap" ADD CONSTRAINT "ContentGap_opportunityClusterId_fkey" FOREIGN KEY ("opportunityClusterId") REFERENCES "OpportunityCluster"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiUsageLog" ADD CONSTRAINT "ApiUsageLog_researchRunId_fkey" FOREIGN KEY ("researchRunId") REFERENCES "ResearchRun"("id") ON DELETE SET NULL ON UPDATE CASCADE;
