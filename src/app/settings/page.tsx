import { SettingsForm } from "@/components/settings-form";
import { getSettings } from "@/lib/research/queries";

export default async function SettingsPage() {
  const settings = await getSettings();
  const values = {
    demandWeight: settings?.demandWeight ?? 0.25,
    competitionAdvantageWeight: settings?.competitionAdvantageWeight ?? 0.25,
    commercialWeight: settings?.commercialWeight ?? 0.2,
    contentGapWeight: settings?.contentGapWeight ?? 0.2,
    executionFeasibilityWeight: settings?.executionFeasibilityWeight ?? 0.1,
    minimumEvidenceCount: settings?.minimumEvidenceCount ?? 3,
    staleAfterDays: settings?.staleAfterDays ?? 30,
  };

  return (
    <div className="space-y-5">
      <section>
        <h2 className="text-lg font-semibold text-slate-50">Settings</h2>
        <p className="mt-1 text-sm text-slate-400">
          Scoring weights and evidence thresholds. Future research runs use these database-backed values.
        </p>
      </section>
      <SettingsForm initialValues={values} />
    </div>
  );
}
