"use client";

import { useState } from "react";
import { PlayCircle } from "lucide-react";

export function ResearchForm() {
  const [status, setStatus] = useState<string>("");
  const [pending, setPending] = useState(false);

  async function onSubmit(formData: FormData) {
    setPending(true);
    setStatus("Starting research run...");
    const response = await fetch("/api/research/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        topic: formData.get("topic"),
        region: formData.get("region"),
        language: formData.get("language"),
        category: formData.get("category"),
        depth: formData.get("depth"),
        maxKeywords: Number(formData.get("maxKeywords") || 25),
        minSearchVolume: Number(formData.get("minSearchVolume") || 0),
        monetizationPreference: formData.get("monetizationPreference"),
        useMockProviders: formData.get("useMockProviders") === "on",
      }),
    });
    const json = await response.json();
    setPending(false);
    setStatus(response.ok ? `Research run created: ${json.researchRunId}` : json.error);
  }

  return (
    <form action={onSubmit} className="space-y-5 rounded-lg border border-slate-800 bg-slate-950/80 p-5">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-300">Topic</span>
          <input name="topic" required placeholder="3D printing cost calculator India" className="w-full rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none focus:border-cyan-400" />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-300">Category</span>
          <input name="category" placeholder="3D printing" className="w-full rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none focus:border-cyan-400" />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-300">Region</span>
          <input name="region" defaultValue="IN" className="w-full rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none focus:border-cyan-400" />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-300">Language</span>
          <input name="language" defaultValue="en" className="w-full rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none focus:border-cyan-400" />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-300">Research Depth</span>
          <select name="depth" className="w-full rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none focus:border-cyan-400">
            <option value="standard">Standard</option>
            <option value="deep">Deep</option>
          </select>
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-300">Max Keywords</span>
          <input name="maxKeywords" type="number" min="1" max="100" defaultValue="25" className="w-full rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none focus:border-cyan-400" />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-300">Min Search Volume</span>
          <input name="minSearchVolume" type="number" min="0" defaultValue="0" className="w-full rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none focus:border-cyan-400" />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-300">Monetization Preference</span>
          <input name="monetizationPreference" placeholder="SaaS, affiliate, lead gen" className="w-full rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none focus:border-cyan-400" />
        </label>
      </div>
      <label className="flex items-center gap-2 text-sm text-slate-400">
        <input name="useMockProviders" type="checkbox" className="h-4 w-4 accent-cyan-400" />
        Use mock providers for a local dry run
      </label>
      <button disabled={pending} className="inline-flex items-center gap-2 rounded-md bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:opacity-60">
        <PlayCircle size={17} />
        {pending ? "Running..." : "Start Research"}
      </button>
      {status ? <p className="rounded-md border border-slate-800 bg-slate-900 p-3 text-sm text-slate-300">{status}</p> : null}
    </form>
  );
}
