import { formatDate, formatNumber } from "@/lib/format";
import { listUsage } from "@/lib/research/queries";

export default async function UsagePage() {
  const usage = await listUsage();
  const total = usage.reduce((sum, row) => sum + (row.estimatedCost ?? 0), 0);
  return (
    <div className="space-y-5">
      <section>
        <h2 className="text-lg font-semibold text-slate-50">API Usage / Cost Estimate</h2>
        <p className="mt-1 text-sm text-slate-400">Tracks provider usage logs and conservative estimated costs.</p>
      </section>
      <div className="rounded-lg border border-slate-800 bg-slate-950/80 p-4 text-sm text-slate-300">Total estimated cost: {formatNumber(total)}</div>
      <div className="overflow-x-auto rounded-lg border border-slate-800 bg-slate-950/80">
        <table className="w-full text-left text-sm">
          <thead className="text-xs uppercase text-slate-500"><tr><th className="px-4 py-3">Provider</th><th className="px-4 py-3">Endpoint</th><th className="px-4 py-3">Requests</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Created</th></tr></thead>
          <tbody className="divide-y divide-slate-800">
            {usage.length ? usage.map((row) => (
              <tr key={row.id}>
                <td className="px-4 py-3 text-slate-100">{row.provider}</td>
                <td className="px-4 py-3 text-slate-300">{row.endpoint}</td>
                <td className="px-4 py-3 text-slate-300">{row.requestCount}</td>
                <td className="px-4 py-3 text-slate-300">{row.status}</td>
                <td className="px-4 py-3 text-slate-400">{formatDate(row.createdAt)}</td>
              </tr>
            )) : (
              <tr><td colSpan={5} className="px-4 py-5 text-slate-500">No API usage logged yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
