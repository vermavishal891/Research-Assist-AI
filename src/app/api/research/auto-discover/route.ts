import { jsonError, jsonOk, readJson } from "@/lib/api";
import { isDatabaseConfigured, startAutoDiscovery } from "@/lib/research/pipeline";

export async function POST(request: Request) {
  if (!isDatabaseConfigured()) {
    return jsonError("Supabase DATABASE_URL is not configured yet.", 503);
  }

  try {
    const input = await readJson<{ categories?: string[]; region?: string; language?: string; useMockProviders?: boolean }>(
      request,
    );
    const result = await startAutoDiscovery(input);
    return jsonOk(result, { status: 201 });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Unable to start auto discovery.", 500);
  }
}
