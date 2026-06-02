import { ProviderHealthStatus, ProviderName } from "@prisma/client";

import { getPrisma } from "@/lib/db";
import { jsonOk } from "@/lib/api";
import { isDatabaseConfigured } from "@/lib/research/pipeline";

type HealthRow = {
  provider: ProviderName;
  status: ProviderHealthStatus;
  details: string;
  latencyMs?: number;
};

async function timedProbe(run: () => Promise<Response>) {
  const started = Date.now();
  const response = await run();
  return { response, latencyMs: Date.now() - started };
}

async function checkSupabase(): Promise<HealthRow> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !anon || !service || !isDatabaseConfigured()) {
    return {
      provider: "supabase",
      status: "failed",
      details: "Missing Supabase URL, anon key, service role key, or database URL.",
    };
  }

  try {
    const anonProbe = await timedProbe(() =>
      fetch(`${url}/auth/v1/settings`, {
        headers: { apikey: anon, authorization: `Bearer ${anon}` },
      }),
    );
    const serviceProbe = await timedProbe(() =>
      fetch(`${url}/rest/v1/`, {
        headers: { apikey: service, authorization: `Bearer ${service}` },
      }),
    );

    const healthy = anonProbe.response.ok && serviceProbe.response.ok;
    return {
      provider: "supabase",
      status: healthy ? "healthy" : "degraded",
      latencyMs: Math.max(anonProbe.latencyMs, serviceProbe.latencyMs),
      details: `Anon auth settings ${anonProbe.response.status}; service REST schema ${serviceProbe.response.status}; database URL configured.`,
    };
  } catch (error) {
    return {
      provider: "supabase",
      status: "failed",
      details: error instanceof Error ? error.message : "Supabase health check failed.",
    };
  }
}

function checkConfiguredProvider(
  provider: Exclude<ProviderName, "supabase" | "mock">,
  ready: boolean,
  details: string,
): HealthRow {
  return {
    provider,
    status: ready ? "healthy" : "failed",
    details,
  };
}

export async function GET() {
  const health: HealthRow[] = [
    checkConfiguredProvider(
      "dataforseo",
      Boolean(process.env.DATAFORSEO_LOGIN && process.env.DATAFORSEO_PASSWORD),
      process.env.DATAFORSEO_LOGIN && process.env.DATAFORSEO_PASSWORD ? "Credentials configured." : "Missing login or password.",
    ),
    checkConfiguredProvider(
      "serpapi",
      Boolean(process.env.SERPAPI_API_KEY),
      process.env.SERPAPI_API_KEY ? "API key configured." : "Missing API key.",
    ),
    checkConfiguredProvider(
      "openai",
      Boolean(process.env.OPENAI_API_KEY),
      process.env.OPENAI_API_KEY ? "API key configured." : "Missing API key.",
    ),
    await checkSupabase(),
  ];

  if (isDatabaseConfigured()) {
    const prisma = getPrisma();
    for (const item of health) {
      await prisma.dataSourceHealth.upsert({
        where: { provider: item.provider },
        create: {
          provider: item.provider,
          status: item.status,
          latencyMs: item.latencyMs,
          detailsJson: { details: item.details },
        },
        update: {
          status: item.status,
          latencyMs: item.latencyMs,
          detailsJson: { details: item.details },
          lastCheckedAt: new Date(),
        },
      });
    }
  }

  return jsonOk({ health });
}
