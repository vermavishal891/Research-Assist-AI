import Link from "next/link";

import { StatusBadge } from "@/components/status-badge";
import { formatNumber } from "@/lib/format";
import { listOpportunities } from "@/lib/research/queries";

export default async function OpportunitiesPage() {
  const opportunities = await listOpportunities();
  return (
    <div className="space-y-5">
      <section>
        <h2 className="text-lg font-semibold text-slate-50">Opportunities</h2>
        <p className="mt-1 text-sm text-slate-400">Ranked clusters with score breakdowns, confidence, risk, and decision workflow.</p>
      </section>
      <div className="overflow-x-auto rounded-lg border border-slate-800 bg-slate-950/80">
        <table className="w-full text-left text-sm">
          <thead className="text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Opportunity</th>
              <th className="px-4 py-3">Score</th>
              <th className="px-4 py-3">Confidence</th>
              <th className="px-4 py-3">Risk</th>
              <th className="px-4 py-3">Signals</th>
              <th className="px-4 py-3">Decision</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {opportunities.length ? opportunities.map((opportunity) => (
              <tr key={opportunity.id}>
                <td className="px-4 py-3"><Link href={`/opportunities/${opportunity.id}`} className="font-medium text-cyan-200">{opportunity.title}</Link></td>
                <td className="px-4 py-3 text-cyan-200">{formatNumber(opportunity.scoreBreakdown?.finalScore, "/100")}</td>
                <td className="px-4 py-3 text-slate-300">{formatNumber(opportunity.scoreBreakdown?.confidenceScore, "/100")}</td>
                <td className="px-4 py-3 text-slate-300">{formatNumber(opportunity.scoreBreakdown?.riskScore, "/100")}</td>
                <td className="px-4 py-3 text-slate-300">{opportunity.signalCount}</td>
                <td className="px-4 py-3"><StatusBadge value={opportunity.decisionStatus} /></td>
              </tr>
            )) : (
              <tr><td colSpan={6} className="px-4 py-5 text-slate-500">No opportunities yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
