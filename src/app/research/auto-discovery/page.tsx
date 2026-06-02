import { AutoDiscoveryForm } from "@/components/auto-discovery-form";

export default function AutoDiscoveryPage() {
  return (
    <div className="space-y-5">
      <section>
        <h2 className="text-lg font-semibold text-slate-50">Auto Signal Discovery</h2>
        <p className="mt-1 max-w-3xl text-sm text-slate-400">
          Scan predefined categories for seed topics, validate metrics, detect signals, and produce ranked opportunity clusters.
        </p>
      </section>
      <AutoDiscoveryForm />
    </div>
  );
}
