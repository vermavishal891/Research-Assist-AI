import { notFound } from "next/navigation";

import { OpportunityActions } from "@/components/opportunity-actions";
import { StatusBadge } from "@/components/status-badge";
import { formatNumber } from "@/lib/format";
import { getOpportunity } from "@/lib/research/queries";

export default async function OpportunityDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const opportunity = await getOpportunity(id);
  if (!opportunity) notFound();
  const memo = opportunity.opportunityMemo?.memoJson as Record<string, unknown> | undefined;
  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-slate-800 bg-slate-950/80 p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-50">{opportunity.title}</h2>
            <p className="mt-1 text-sm text-slate-400">{String(memo?.one_line_thesis ?? "Investor memo pending.")}</p>
          </div>
          <StatusBadge value={opportunity.decisionStatus} />
        </div>
        <div className="mt-5"><OpportunityActions id={opportunity.id} /></div>
      </section>
      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-slate-800 bg-slate-950/80 p-4"><p className="text-xs uppercase text-slate-500">Opportunity Score</p><p className="mt-2 text-2xl font-semibold text-cyan-200">{formatNumber(opportunity.scoreBreakdown?.finalScore, "/100")}</p></div>
        <div className="rounded-lg border border-slate-800 bg-slate-950/80 p-4"><p className="text-xs uppercase text-slate-500">Confidence</p><p className="mt-2 text-2xl font-semibold text-slate-100">{formatNumber(opportunity.scoreBreakdown?.confidenceScore, "/100")}</p></div>
        <div className="rounded-lg border border-slate-800 bg-slate-950/80 p-4"><p className="text-xs uppercase text-slate-500">Risk</p><p className="mt-2 text-2xl font-semibold text-red-200">{formatNumber(opportunity.scoreBreakdown?.riskScore, "/100")}</p></div>
      </section>
      <section className="rounded-lg border border-slate-800 bg-slate-950/80 p-5">
        <h3 className="text-sm font-semibold text-slate-100">Investor Memo</h3>
        <pre className="mt-4 max-h-[600px] overflow-auto rounded-md bg-slate-900 p-4 text-xs leading-6 text-slate-300">{JSON.stringify(memo ?? {}, null, 2)}</pre>
      </section>
    </div>
  );
}
