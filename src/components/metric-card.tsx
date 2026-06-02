import { ReactNode } from "react";

export function MetricCard({
  label,
  value,
  detail,
  icon,
}: {
  label: string;
  value: ReactNode;
  detail?: string;
  icon?: ReactNode;
}) {
  return (
    <section className="rounded-lg border border-slate-800 bg-slate-950/80 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-medium uppercase tracking-[0.08em] text-slate-500">{label}</p>
        <div className="text-cyan-300">{icon}</div>
      </div>
      <div className="mt-3 text-2xl font-semibold text-slate-50">{value}</div>
      {detail ? <p className="mt-2 text-sm text-slate-500">{detail}</p> : null}
    </section>
  );
}
