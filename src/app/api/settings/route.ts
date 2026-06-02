import { getPrisma } from "@/lib/db";
import { jsonError, jsonOk, readJson } from "@/lib/api";
import { isDatabaseConfigured } from "@/lib/research/pipeline";

function boundedNumber(value: unknown, fallback: number, min: number, max: number) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.max(min, Math.min(max, number));
}

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
  const data = {
    demandWeight: boundedNumber(input.demandWeight, 0.25, 0, 1),
    competitionAdvantageWeight: boundedNumber(input.competitionAdvantageWeight, 0.25, 0, 1),
    commercialWeight: boundedNumber(input.commercialWeight, 0.2, 0, 1),
    contentGapWeight: boundedNumber(input.contentGapWeight, 0.2, 0, 1),
    executionFeasibilityWeight: boundedNumber(input.executionFeasibilityWeight, 0.1, 0, 1),
    minimumEvidenceCount: Math.round(boundedNumber(input.minimumEvidenceCount, 3, 1, 20)),
    staleAfterDays: Math.round(boundedNumber(input.staleAfterDays, 30, 1, 365)),
  };
  const settings = await getPrisma().scoringSettings.upsert({
    where: { name: "default" },
    create: {
      name: "default",
      ...data,
    },
    update: data,
  });
  return jsonOk({ settings });
}
