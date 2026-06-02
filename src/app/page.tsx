import { AlertTriangle, Activity, BarChart3, Gauge, Signal } from "lucide-react";

import { ConfidenceScatterChart, OpportunityDistributionChart } from "@/components/charts";
import { MetricCard } from "@/components/metric-card";
import { StatusBadge } from "@/components/status-badge";
import { formatDate, formatNumber } from "@/lib/format";
import { getDashboardSummary } from "@/lib/research/queries";

export default async function DashboardPage() {
  const summary = await getDashboardSummary();
  const chartData = summary.topOpportunities.map((opportunity) => ({
    label: opportunity.title.slice(0, 12),
    value: opportunity.scoreBreakdown?.finalScore ?? 0,
  }));
  const scatterData = summary.topOpportunities.map((opportunity) => ({
    title: opportunity.title,
    score: opportunity.scoreBreakdown?.finalScore ?? 0,
    confidence: opportunity.scoreBreakdown?.confidenceScore ?? 0,
  }));

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-slate-800 bg-slate-950/70 p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-50">Executive Summary</h2>
            <p className="mt-1 max-w-3xl text-sm text-slate-400">
              Focused view only: critical KPIs, top decisions, recent activity, and source health. Use the sidebar pages for detailed analysis.
            </p>
          </div>
          <StatusBadge value={summary.databaseReady ? "verified" : "insufficient_evidence"} />
        </div>
      </section>

      {summary.alerts.length ? (
        <section className="rounded-lg border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-amber-100">
          <div className="flex items-start gap-3">
            <AlertTriangle size={18} />
            <div>
              <p className="font-medium">Critical alerts</p>
              <p className="mt-1 text-amber-200/80">{summary.alerts.join(" | ")}</p>
            </div>
          </div>
        </section>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard label="Active Runs" value={formatNumber(summary.kpis.activeRuns)} icon={<Activity size={18} />} />
        <MetricCard label="Signals Found" value={formatNumber(summary.kpis.signalsFound)} icon={<Signal size={18} />} />
        <MetricCard label="Top Score" value={formatNumber(summary.kpis.topOpportunityScore, "/100")} icon={<Gauge size={18} />} />
        <MetricCard label="Avg Confidence" value={formatNumber(summary.kpis.averageConfidence, "/100")} icon={<BarChart3 size={18} />} />
        <MetricCard label="High Risk" value={formatNumber(summary.kpis.highRiskCount)} detail="Risk score >= 60" />
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <OpportunityDistributionChart data={chartData.length ? chartData : [{ label: "No data", value: 0 }]} />
        <ConfidenceScatterChart data={scatterData.length ? scatterData : [{ title: "No data", score: 0, confidence: 0 }]} />
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2 rounded-lg border border-slate-800 bg-slate-950/80">
          <div className="border-b border-slate-800 p-4">
            <h2 className="text-sm font-semibold text-slate-100">Top 5 Opportunities Needing Decision</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Opportunity</th>
                  <th className="px-4 py-3">Score</th>
                  <th className="px-4 py-3">Confidence</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {summary.topOpportunities.length ? (
                  summary.topOpportunities.map((opportunity) => (
                    <tr key={opportunity.id}>
                      <td className="px-4 py-3 font-medium text-slate-100">{opportunity.title}</td>
                      <td className="px-4 py-3 text-cyan-200">{formatNumber(opportunity.scoreBreakdown?.finalScore, "/100")}</td>
                      <td className="px-4 py-3">{formatNumber(opportunity.scoreBreakdown?.confidenceScore, "/100")}</td>
                      <td className="px-4 py-3"><StatusBadge value={opportunity.decisionStatus} /></td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="px-4 py-5 text-slate-500" colSpan={4}>No opportunities yet. Start a research run to collect evidence.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-lg border border-slate-800 bg-slate-950/80">
          <div className="border-b border-slate-800 p-4">
            <h2 className="text-sm font-semibold text-slate-100">Recent Research Activity</h2>
          </div>
          <div className="divide-y divide-slate-800">
            {summary.recentRuns.length ? (
              summary.recentRuns.map((run) => (
                <div key={run.id} className="p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-slate-100">{run.seedTopic ?? run.category ?? "Research run"}</p>
                    <StatusBadge value={run.status} />
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{formatDate(run.createdAt)}</p>
                </div>
              ))
            ) : (
              <p className="p-4 text-sm text-slate-500">No research runs yet.</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
