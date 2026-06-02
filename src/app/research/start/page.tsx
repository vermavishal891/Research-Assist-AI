import { ResearchForm } from "@/components/research-form";

export default function StartResearchPage() {
  return (
    <div className="space-y-5">
      <section>
        <h2 className="text-lg font-semibold text-slate-50">Start Research</h2>
        <p className="mt-1 max-w-3xl text-sm text-slate-400">
          Launch a manual research run. The pipeline validates keyword and SERP evidence before it creates scored opportunities.
        </p>
      </section>
      <ResearchForm />
    </div>
  );
}
