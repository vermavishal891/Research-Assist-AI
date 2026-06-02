"use client";

import { useState } from "react";
import { Radar } from "lucide-react";

const defaultCategories = ["AI tools", "education", "career", "finance", "local services", "3D printing", "India-specific calculators", "productivity tools"];

export function AutoDiscoveryForm() {
  const [status, setStatus] = useState("");
  const [pending, setPending] = useState(false);

  async function startDiscovery(formData: FormData) {
    setPending(true);
    setStatus("Starting auto discovery...");
    const categories = defaultCategories.filter((category) => formData.get(category) === "on");
    const response = await fetch("/api/research/auto-discover", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        categories,
        region: formData.get("region"),
        language: formData.get("language"),
        useMockProviders: formData.get("useMockProviders") === "on",
      }),
    });
    const json = await response.json();
    setPending(false);
    setStatus(response.ok ? `Discovery completed for ${json.categories.length} categories.` : json.error);
  }

  return (
    <form action={startDiscovery} className="space-y-5 rounded-lg border border-slate-800 bg-slate-950/80 p-5">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-300">Region</span>
          <input name="region" defaultValue="IN" className="w-full rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none focus:border-cyan-400" />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-300">Language</span>
          <input name="language" defaultValue="en" className="w-full rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none focus:border-cyan-400" />
        </label>
      </div>
      <div>
        <p className="mb-3 text-sm font-medium text-slate-300">Enabled Categories</p>
        <div className="grid gap-2 md:grid-cols-2">
          {defaultCategories.map((category) => (
            <label key={category} className="flex items-center gap-2 rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-300">
              <input name={category} type="checkbox" defaultChecked className="h-4 w-4 accent-cyan-400" />
              {category}
            </label>
          ))}
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm text-slate-400">
        <input name="useMockProviders" type="checkbox" className="h-4 w-4 accent-cyan-400" />
        Use mock providers for a local dry run
      </label>
      <button disabled={pending} className="inline-flex items-center gap-2 rounded-md bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:opacity-60">
        <Radar size={17} />
        {pending ? "Scanning..." : "Run Auto Discovery"}
      </button>
      {status ? <p className="rounded-md border border-slate-800 bg-slate-900 p-3 text-sm text-slate-300">{status}</p> : null}
    </form>
  );
}
