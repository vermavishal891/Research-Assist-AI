import { titleCase } from "@/lib/format";

const styles: Record<string, string> = {
  verified: "border-cyan-400/30 bg-cyan-400/10 text-cyan-200",
  healthy: "border-cyan-400/30 bg-cyan-400/10 text-cyan-200",
  completed: "border-cyan-400/30 bg-cyan-400/10 text-cyan-200",
  partial: "border-amber-400/30 bg-amber-400/10 text-amber-200",
  stale: "border-amber-400/30 bg-amber-400/10 text-amber-200",
  degraded: "border-amber-400/30 bg-amber-400/10 text-amber-200",
  running: "border-blue-400/30 bg-blue-400/10 text-blue-200",
  queued: "border-blue-400/30 bg-blue-400/10 text-blue-200",
  watchlisted: "border-blue-400/30 bg-blue-400/10 text-blue-200",
  failed: "border-red-400/30 bg-red-400/10 text-red-200",
  rejected: "border-red-400/30 bg-red-400/10 text-red-200",
  insufficient_evidence: "border-red-400/30 bg-red-400/10 text-red-200",
};

export function StatusBadge({ value }: { value: string | null | undefined }) {
  const key = value ?? "unknown";
  return (
    <span className={`inline-flex rounded-md border px-2 py-1 text-xs font-medium ${styles[key] ?? "border-slate-700 bg-slate-800 text-slate-300"}`}>
      {titleCase(key)}
    </span>
  );
}
