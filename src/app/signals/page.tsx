import Link from "next/link";

import { StatusBadge } from "@/components/status-badge";
import { formatDate, formatNumber, titleCase } from "@/lib/format";
import { listSignals } from "@/lib/research/queries";

export default async function SignalsPage() {
  const signals = await listSignals();
  return (
    <div className="space-y-5">
      <section>
        <h2 className="text-lg font-semibold text-slate-50">Market Signals</h2>
        <p className="mt-1 text-sm text-slate-400">Validated and raw opportunity patterns with evidence, freshness, confidence, and risk labels.</p>
      </section>
      <div className="overflow-x-auto rounded-lg border border-slate-800 bg-slate-950/80">
        <table className="w-full text-left text-sm">
          <thead className="text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Signal</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Confidence</th>
              <th className="px-4 py-3">Risk</th>
              <th className="px-4 py-3">State</th>
              <th className="px-4 py-3">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {signals.length ? signals.map((signal) => (
              <tr key={signal.id}>
                <td className="px-4 py-3"><Link href={`/signals/${signal.id}`} className="font-medium text-cyan-200">{signal.title}</Link></td>
                <td className="px-4 py-3 text-slate-300">{titleCase(signal.signalType)}</td>
                <td className="px-4 py-3 text-slate-300">{formatNumber(signal.confidenceScore, "/100")}</td>
                <td className="px-4 py-3 text-slate-300">{formatNumber(signal.riskScore, "/100")}</td>
                <td className="px-4 py-3"><StatusBadge value={signal.validationState} /></td>
                <td className="px-4 py-3 text-slate-400">{formatDate(signal.createdAt)}</td>
              </tr>
            )) : (
              <tr><td colSpan={6} className="px-4 py-5 text-slate-500">No signals yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
