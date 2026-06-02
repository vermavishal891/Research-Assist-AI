import { getPrisma } from "@/lib/db";
import { jsonOk } from "@/lib/api";
import { isDatabaseConfigured } from "@/lib/research/pipeline";

export async function GET() {
  if (!isDatabaseConfigured()) return jsonOk({ usage: [], totalEstimatedCost: 0, databaseReady: false });
  const usage = await getPrisma().apiUsageLog.findMany({ orderBy: { createdAt: "desc" }, take: 100 });
  const totalEstimatedCost = usage.reduce((sum, row) => sum + (row.estimatedCost ?? 0), 0);
  return jsonOk({ usage, totalEstimatedCost, databaseReady: true });
}
