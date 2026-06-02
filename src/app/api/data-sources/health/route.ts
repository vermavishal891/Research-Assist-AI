import { ProviderHealthStatus, ProviderName } from "@prisma/client";

import { getPrisma } from "@/lib/db";
import { jsonOk } from "@/lib/api";
import { isDatabaseConfigured } from "@/lib/research/pipeline";

const providerChecks = [
  { provider: "dataforseo", ready: () => Boolean(process.env.DATAFORSEO_LOGIN && process.env.DATAFORSEO_PASSWORD) },
  { provider: "serpapi", ready: () => Boolean(process.env.SERPAPI_API_KEY) },
  { provider: "openai", ready: () => Boolean(process.env.OPENAI_API_KEY) },
  { provider: "supabase", ready: () => isDatabaseConfigured() },
] as const;

export async function GET() {
  const health = providerChecks.map((check) => ({
    provider: check.provider as ProviderName,
    status: (check.ready() ? "healthy" : "failed") as ProviderHealthStatus,
    details: check.ready() ? "Configured" : "Missing or placeholder credentials",
  }));

  if (isDatabaseConfigured()) {
    const prisma = getPrisma();
    for (const item of health) {
      await prisma.dataSourceHealth.upsert({
        where: { provider: item.provider },
        create: {
          provider: item.provider,
          status: item.status,
          detailsJson: { details: item.details },
        },
        update: {
          status: item.status,
          detailsJson: { details: item.details },
          lastCheckedAt: new Date(),
        },
      });
    }
  }

  return jsonOk({ health });
}
