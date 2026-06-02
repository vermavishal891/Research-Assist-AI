import { jsonError, jsonOk, readJson } from "@/lib/api";
import { isDatabaseConfigured, startManualResearch, type StartResearchInput } from "@/lib/research/pipeline";

export async function POST(request: Request) {
  if (!isDatabaseConfigured()) {
    return jsonError("Supabase DATABASE_URL is not configured yet.", 503);
  }

  try {
    const input = await readJson<StartResearchInput>(request);
    const result = await startManualResearch(input);
    return jsonOk(result, { status: 201 });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Unable to start research run.", 500);
  }
}
