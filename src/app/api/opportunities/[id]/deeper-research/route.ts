import { getPrisma } from "@/lib/db";
import { jsonError, jsonOk } from "@/lib/api";
import { isDatabaseConfigured, startManualResearch } from "@/lib/research/pipeline";

export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  if (!isDatabaseConfigured()) return jsonError("Supabase DATABASE_URL is not configured yet.", 503);
  const { id } = await context.params;
  const cluster = await getPrisma().opportunityCluster.findUnique({ where: { id } });
  if (!cluster) return jsonError("Opportunity not found.", 404);
  const deeperRun = await startManualResearch({
    topic: cluster.title,
    category: cluster.category ?? undefined,
    region: cluster.region,
    depth: "deep",
    maxKeywords: 50,
  });
  await getPrisma().opportunityCluster.update({ where: { id }, data: { decisionStatus: "needs_more_research" } });
  return jsonOk({ deeperRun });
}
