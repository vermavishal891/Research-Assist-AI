import Link from "next/link";

import { StatusBadge } from "@/components/status-badge";
import { formatDate, formatNumber } from "@/lib/format";
import { listWatchlist } from "@/lib/research/queries";

export default async function WatchlistPage() {
  const items = await listWatchlist();
  return (
    <div className="space-y-5">
      <section>
        <h2 className="text-lg font-semibold text-slate-50">Approved / Watchlisted Ideas</h2>
        <p className="mt-1 text-sm text-slate-400">Track opportunity decisions, score movement, and next review dates.</p>
      </section>
      <div className="overflow-x-auto rounded-lg border border-slate-800 bg-slate-950/80">
        <table className="w-full text-left text-sm">
          <thead className="text-xs uppercase text-slate-500">
            <tr><th className="px-4 py-3">Opportunity</th><th className="px-4 py-3">Current Score</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Next Review</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {items.length ? items.map((item) => (
              <tr key={item.id}>
                <td className="px-4 py-3"><Link href={`/opportunities/${item.opportunityClusterId}`} className="font-medium text-cyan-200">{item.opportunityCluster.title}</Link></td>
                <td className="px-4 py-3 text-slate-300">{formatNumber(item.currentScore ?? item.opportunityCluster.scoreBreakdown?.finalScore, "/100")}</td>
                <td className="px-4 py-3"><StatusBadge value={item.status} /></td>
                <td className="px-4 py-3 text-slate-400">{formatDate(item.nextReviewAt)}</td>
              </tr>
            )) : (
              <tr><td colSpan={4} className="px-4 py-5 text-slate-500">No watchlisted opportunities yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
