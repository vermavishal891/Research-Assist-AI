import Link from "next/link";

import { StatusBadge } from "@/components/status-badge";
import { formatDate } from "@/lib/format";
import { listResearchRuns } from "@/lib/research/queries";

export default async function ResearchRunsPage() {
  const runs = await listResearchRuns();
  return (
    <div className="space-y-5">
      <section>
        <h2 className="text-lg font-semibold text-slate-50">Research Runs</h2>
        <p className="mt-1 text-sm text-slate-400">Audit log for manual research, auto-discovery, deeper research, and refresh jobs.</p>
      </section>
      <div className="overflow-x-auto rounded-lg border border-slate-800 bg-slate-950/80">
        <table className="w-full text-left text-sm">
          <thead className="text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Run</th>
              <th className="px-4 py-3">Mode</th>
              <th className="px-4 py-3">Region</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Quality</th>
              <th className="px-4 py-3">Started</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {runs.length ? runs.map((run) => (
              <tr key={run.id}>
                <td className="px-4 py-3"><Link href={`/api/research/runs/${run.id}`} className="font-medium text-cyan-200">{run.seedTopic ?? run.category ?? run.id}</Link></td>
                <td className="px-4 py-3 text-slate-300">{run.mode}</td>
                <td className="px-4 py-3 text-slate-300">{run.region}</td>
                <td className="px-4 py-3"><StatusBadge value={run.status} /></td>
                <td className="px-4 py-3"><StatusBadge value={run.dataQualityState} /></td>
                <td className="px-4 py-3 text-slate-400">{formatDate(run.startedAt)}</td>
              </tr>
            )) : (
              <tr><td colSpan={6} className="px-4 py-5 text-slate-500">No research runs yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
