import { getOpportunity } from "@/lib/research/queries";
import { jsonError, jsonOk } from "@/lib/api";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const opportunity = await getOpportunity(id);
  if (!opportunity) return jsonError("Opportunity not found.", 404);
  return jsonOk({ opportunity });
}
