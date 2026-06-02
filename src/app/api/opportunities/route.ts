import { jsonOk } from "@/lib/api";
import { listOpportunities } from "@/lib/research/queries";

export async function GET() {
  return jsonOk({ opportunities: await listOpportunities() });
}
