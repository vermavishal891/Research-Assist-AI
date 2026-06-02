import { getPrisma } from "@/lib/db";
import { jsonError, jsonOk } from "@/lib/api";
import { isDatabaseConfigured } from "@/lib/research/pipeline";

export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  if (!isDatabaseConfigured()) return jsonError("Supabase DATABASE_URL is not configured yet.", 503);
  const { id } = await context.params;
  const signal = await getPrisma().marketSignal.update({
    where: { id },
    data: { decisionStatus: "watchlisted" },
  });
  return jsonOk({ signal });
}
