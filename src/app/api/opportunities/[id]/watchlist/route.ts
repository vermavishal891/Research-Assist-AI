import { getPrisma } from "@/lib/db";
import { jsonError, jsonOk } from "@/lib/api";
import { isDatabaseConfigured } from "@/lib/research/pipeline";

export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  if (!isDatabaseConfigured()) return jsonError("Supabase DATABASE_URL is not configured yet.", 503);
  const { id } = await context.params;
  const prisma = getPrisma();
  const cluster = await prisma.opportunityCluster.update({
    where: { id },
    data: {
      decisionStatus: "watchlisted",
      watchlistItems: {
        create: {
          status: "watchlisted",
          nextReviewAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14),
        },
      },
    },
  });
  return jsonOk({ opportunity: cluster });
}
