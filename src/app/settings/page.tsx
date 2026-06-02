import { getSettings } from "@/lib/research/queries";

export default async function SettingsPage() {
  const settings = await getSettings();
  return (
    <div className="space-y-5">
      <section>
        <h2 className="text-lg font-semibold text-slate-50">Settings</h2>
        <p className="mt-1 text-sm text-slate-400">Scoring weights and evidence thresholds. Defaults match the main prompt formula.</p>
      </section>
      <section className="rounded-lg border border-slate-800 bg-slate-950/80 p-5">
        <pre className="overflow-auto text-sm text-slate-300">{JSON.stringify(settings ?? {
          demandWeight: 0.25,
          competitionAdvantageWeight: 0.25,
          commercialWeight: 0.2,
          contentGapWeight: 0.2,
          executionFeasibilityWeight: 0.1,
          minimumEvidenceCount: 3,
          staleAfterDays: 30,
        }, null, 2)}</pre>
      </section>
    </div>
  );
}
