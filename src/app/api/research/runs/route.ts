import { jsonOk } from "@/lib/api";
import { listResearchRuns } from "@/lib/research/queries";

export async function GET() {
  return jsonOk({ runs: await listResearchRuns() });
}
