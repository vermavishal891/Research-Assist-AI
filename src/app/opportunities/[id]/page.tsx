import { notFound } from "next/navigation";

import { OpportunityActions } from "@/components/opportunity-actions";
import { StatusBadge } from "@/components/status-badge";
import { formatNumber } from "@/lib/format";
import { getOpportunity } from "@/lib/research/queries";

function asRecord(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function asStringArray(value: unknown) {
  return Array.isArray(value) ? value.map((item) => String(item)) : [];
}

function MemoSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-slate-800 bg-slate-950/80 p-5">
      <h3 className="text-sm font-semibold text-slate-100">{title}</h3>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function FactGrid({ facts }: { facts: Record<string, unknown> }) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {Object.entries(facts).map(([key, value]) => (
        <div key={key} className="rounded-md border border-slate-800 bg-slate-900 p-3">
          <p className="text-xs uppercase tracking-[0.08em] text-slate-500">{key.replace(/_/g, " ")}</p>
          <p className="mt-2 text-sm font-medium text-slate-100">
            {Array.isArray(value) ? (value.length ? value.join(", ") : "Data unavailable") : String(value ?? "Data unavailable")}
          </p>
        </div>
      ))}
    </div>
  );
}

function BulletList({ items, empty }: { items: string[]; empty: string }) {
  if (!items.length) return <p className="text-sm text-slate-500">{empty}</p>;
  return (
    <ul className="space-y-2 text-sm text-slate-300">
      {items.map((item) => (
        <li key={item} className="rounded-md border border-slate-800 bg-slate-900 px-3 py-2">
          {item}
        </li>
      ))}
    </ul>
  );
}

export default async function OpportunityDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const opportunity = await getOpportunity(id);
  if (!opportunity) notFound();
  const memo = opportunity.opportunityMemo?.memoJson as Record<string, unknown> | undefined;
  const measuredFacts = asRecord(memo?.measured_facts);
  const calculatedEstimates = asRecord(memo?.calculated_estimates);
  const evidenceSummary = Array.isArray(memo?.evidence_summary)
    ? memo.evidence_summary.map((item) => (typeof item === "string" ? item : JSON.stringify(item)))
    : [];
  const risks = asStringArray(memo?.risks_and_unknowns);
  const assumptions = asStringArray(memo?.assumptions);
  const nextResearch = asStringArray(memo?.recommended_next_research);

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
      <section className="grid gap-4 xl:grid-cols-2">
        <MemoSection title="Market Problem">
          <p className="text-sm leading-6 text-slate-300">{String(memo?.market_problem ?? "Needs validation")}</p>
        </MemoSection>
        <MemoSection title="Why This Signal Exists">
          <p className="text-sm leading-6 text-slate-300">{String(memo?.why_this_signal_exists ?? "Needs validation")}</p>
        </MemoSection>
      </section>

      <MemoSection title="Measured Facts">
        <FactGrid facts={measuredFacts} />
      </MemoSection>

      <section className="grid gap-4 xl:grid-cols-2">
        <MemoSection title="Evidence Summary">
          <BulletList items={evidenceSummary} empty="No evidence items recorded yet." />
        </MemoSection>
        <MemoSection title="Risks And Unknowns">
          <BulletList items={risks} empty="No risks recorded yet." />
        </MemoSection>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <MemoSection title="Assumptions">
          <BulletList items={assumptions} empty="No assumptions recorded." />
        </MemoSection>
        <MemoSection title="Recommended Next Research">
          <BulletList items={nextResearch} empty="No next research steps recorded." />
        </MemoSection>
      </section>

      <MemoSection title="Calculated Estimates">
        <FactGrid facts={calculatedEstimates} />
      </MemoSection>

      <MemoSection title="Raw Memo JSON">
        <pre className="max-h-[420px] overflow-auto rounded-md bg-slate-900 p-4 text-xs leading-6 text-slate-300">{JSON.stringify(memo ?? {}, null, 2)}</pre>
      </MemoSection>
    </div>
  );
}
