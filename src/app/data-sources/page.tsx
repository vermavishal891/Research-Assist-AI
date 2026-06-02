import { StatusBadge } from "@/components/status-badge";
import { formatDate } from "@/lib/format";
import { listDataSourceHealth } from "@/lib/research/queries";

export default async function DataSourcesPage() {
  const health = await listDataSourceHealth();
  const fallback = [
    { provider: "dataforseo", status: process.env.DATAFORSEO_LOGIN ? "healthy" : "failed", lastCheckedAt: new Date() },
    { provider: "serpapi", status: process.env.SERPAPI_API_KEY ? "healthy" : "failed", lastCheckedAt: new Date() },
    { provider: "openai", status: process.env.OPENAI_API_KEY ? "healthy" : "failed", lastCheckedAt: new Date() },
    { provider: "supabase", status: process.env.DATABASE_URL?.includes("replace_me") ? "failed" : "healthy", lastCheckedAt: new Date() },
  ];
  const rows = health.length ? health : fallback;
  return (
    <div className="space-y-5">
      <section>
        <h2 className="text-lg font-semibold text-slate-50">Data Source Health</h2>
        <p className="mt-1 text-sm text-slate-400">Provider readiness and recent health snapshots.</p>
      </section>
      <div className="overflow-x-auto rounded-lg border border-slate-800 bg-slate-950/80">
        <table className="w-full text-left text-sm">
          <thead className="text-xs uppercase text-slate-500"><tr><th className="px-4 py-3">Provider</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Last Checked</th></tr></thead>
          <tbody className="divide-y divide-slate-800">
            {rows.map((row) => (
              <tr key={row.provider}>
                <td className="px-4 py-3 font-medium text-slate-100">{row.provider}</td>
                <td className="px-4 py-3"><StatusBadge value={row.status} /></td>
                <td className="px-4 py-3 text-slate-400">{formatDate(row.lastCheckedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
