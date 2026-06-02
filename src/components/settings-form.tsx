"use client";

import { useState } from "react";
import { Save } from "lucide-react";

type SettingsValues = {
  demandWeight: number;
  competitionAdvantageWeight: number;
  commercialWeight: number;
  contentGapWeight: number;
  executionFeasibilityWeight: number;
  minimumEvidenceCount: number;
  staleAfterDays: number;
};

const fields: Array<{ name: keyof SettingsValues; label: string; step?: string; min?: string; max?: string }> = [
  { name: "demandWeight", label: "Demand Weight", step: "0.01", min: "0", max: "1" },
  { name: "competitionAdvantageWeight", label: "Competition Advantage Weight", step: "0.01", min: "0", max: "1" },
  { name: "commercialWeight", label: "Commercial Weight", step: "0.01", min: "0", max: "1" },
  { name: "contentGapWeight", label: "Content Gap Weight", step: "0.01", min: "0", max: "1" },
  { name: "executionFeasibilityWeight", label: "Execution Feasibility Weight", step: "0.01", min: "0", max: "1" },
  { name: "minimumEvidenceCount", label: "Minimum Evidence Count", step: "1", min: "1", max: "20" },
  { name: "staleAfterDays", label: "Stale After Days", step: "1", min: "1", max: "365" },
];

export function SettingsForm({ initialValues }: { initialValues: SettingsValues }) {
  const [status, setStatus] = useState("");
  const [pending, setPending] = useState(false);

  async function saveSettings(formData: FormData) {
    setPending(true);
    setStatus("Saving...");
    const payload = Object.fromEntries(
      fields.map((field) => [field.name, Number(formData.get(field.name) ?? initialValues[field.name])]),
    );
    const response = await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await response.json();
    setPending(false);
    setStatus(response.ok ? "Settings saved. Future research runs will use these weights." : json.error);
  }

  return (
    <form action={saveSettings} className="space-y-5 rounded-lg border border-slate-800 bg-slate-950/80 p-5">
      <div className="grid gap-4 md:grid-cols-2">
        {fields.map((field) => (
          <label key={field.name} className="space-y-2">
            <span className="text-sm font-medium text-slate-300">{field.label}</span>
            <input
              name={field.name}
              type="number"
              step={field.step}
              min={field.min}
              max={field.max}
              defaultValue={initialValues[field.name]}
              className="w-full rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none focus:border-cyan-400"
            />
          </label>
        ))}
      </div>
      <button
        disabled={pending}
        className="inline-flex items-center gap-2 rounded-md bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:opacity-60"
      >
        <Save size={17} />
        {pending ? "Saving..." : "Save Settings"}
      </button>
      {status ? <p className="rounded-md border border-slate-800 bg-slate-900 p-3 text-sm text-slate-300">{status}</p> : null}
    </form>
  );
}
