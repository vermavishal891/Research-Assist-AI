import { notFound } from "next/navigation";

import { StatusBadge } from "@/components/status-badge";
import { formatDate, formatNumber, titleCase } from "@/lib/format";
import { getSignal } from "@/lib/research/queries";

export default async function SignalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const signal = await getSignal(id);
  if (!signal) notFound();
  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-slate-800 bg-slate-950/80 p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-50">{signal.title}</h2>
            <p className="mt-1 text-sm text-slate-400">{signal.description}</p>
          </div>
          <StatusBadge value={signal.validationState} />
        </div>
      </section>
      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-slate-800 bg-slate-950/80 p-4"><p className="text-xs uppercase text-slate-500">Type</p><p className="mt-2 text-slate-100">{titleCase(signal.signalType)}</p></div>
        <div className="rounded-lg border border-slate-800 bg-slate-950/80 p-4"><p className="text-xs uppercase text-slate-500">Confidence</p><p className="mt-2 text-slate-100">{formatNumber(signal.confidenceScore, "/100")}</p></div>
        <div className="rounded-lg border border-slate-800 bg-slate-950/80 p-4"><p className="text-xs uppercase text-slate-500">Created</p><p className="mt-2 text-slate-100">{formatDate(signal.createdAt)}</p></div>
      </section>
      <section className="grid gap-4 xl:grid-cols-2">
        <pre className="overflow-auto rounded-lg border border-slate-800 bg-slate-950/80 p-4 text-xs text-slate-300">{JSON.stringify(signal.measuredDataJson, null, 2)}</pre>
        <pre className="overflow-auto rounded-lg border border-slate-800 bg-slate-950/80 p-4 text-xs text-slate-300">{JSON.stringify(signal.evidenceJson, null, 2)}</pre>
      </section>
    </div>
  );
}
