import { getSignal } from "@/lib/research/queries";
import { jsonError, jsonOk } from "@/lib/api";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const signal = await getSignal(id);
  if (!signal) return jsonError("Signal not found.", 404);
  return jsonOk({ signal });
}
