import { jsonOk } from "@/lib/api";
import { listSignals } from "@/lib/research/queries";

export async function GET() {
  return jsonOk({ signals: await listSignals() });
}
