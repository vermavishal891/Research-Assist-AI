import { getPrisma } from "@/lib/db";
import { jsonError, jsonOk, readJson } from "@/lib/api";
import { isDatabaseConfigured } from "@/lib/research/pipeline";

export async function GET() {
  if (!isDatabaseConfigured()) return jsonOk({ settings: null, databaseReady: false });
  const settings = await getPrisma().scoringSettings.upsert({
    where: { name: "default" },
    create: { name: "default" },
    update: {},
  });
  return jsonOk({ settings, databaseReady: true });
}

export async function POST(request: Request) {
  if (!isDatabaseConfigured()) return jsonError("Supabase DATABASE_URL is not configured yet.", 503);
  const input = await readJson<Record<string, number>>(request);
  const settings = await getPrisma().scoringSettings.upsert({
    where: { name: "default" },
    create: {
      name: "default",
      demandWeight: input.demandWeight ?? 0.25,
      competitionAdvantageWeight: input.competitionAdvantageWeight ?? 0.25,
      commercialWeight: input.commercialWeight ?? 0.2,
      contentGapWeight: input.contentGapWeight ?? 0.2,
      executionFeasibilityWeight: input.executionFeasibilityWeight ?? 0.1,
    },
    update: input,
  });
  return jsonOk({ settings });
}
