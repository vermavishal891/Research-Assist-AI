import { getPrisma } from "@/lib/db";
import { jsonError, jsonOk } from "@/lib/api";
import { isDatabaseConfigured } from "@/lib/research/pipeline";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  if (!isDatabaseConfigured()) return jsonError("Supabase DATABASE_URL is not configured yet.", 503);
  const { id } = await context.params;
  const run = await getPrisma().researchRun.findUnique({
    where: { id },
    include: {
      seedKeywords: true,
      keywordMetrics: true,
      serpResults: true,
      marketSignals: true,
      opportunityClusters: { include: { scoreBreakdown: true, opportunityMemo: true } },
      apiUsageLogs: true,
    },
  });
  if (!run) return jsonError("Research run not found.", 404);
  return jsonOk({ run });
}
