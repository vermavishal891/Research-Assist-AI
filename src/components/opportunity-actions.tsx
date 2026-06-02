"use client";

import { useState } from "react";
import { Eye, SearchX, Star } from "lucide-react";

export function OpportunityActions({ id }: { id: string }) {
  const [status, setStatus] = useState("");

  async function mutate(action: "watchlist" | "reject" | "deeper-research") {
    setStatus("Updating...");
    const response = await fetch(`/api/opportunities/${id}/${action}`, { method: "POST" });
    const json = await response.json();
    setStatus(response.ok ? `Updated: ${action}` : json.error);
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button onClick={() => mutate("watchlist")} className="inline-flex items-center gap-2 rounded-md border border-cyan-400/30 px-3 py-2 text-sm text-cyan-200 hover:bg-cyan-400/10">
        <Star size={16} />
        Watchlist
      </button>
      <button onClick={() => mutate("deeper-research")} className="inline-flex items-center gap-2 rounded-md border border-blue-400/30 px-3 py-2 text-sm text-blue-200 hover:bg-blue-400/10">
        <Eye size={16} />
        Deeper Research
      </button>
      <button onClick={() => mutate("reject")} className="inline-flex items-center gap-2 rounded-md border border-red-400/30 px-3 py-2 text-sm text-red-200 hover:bg-red-400/10">
        <SearchX size={16} />
        Reject
      </button>
      {status ? <span className="self-center text-sm text-slate-400">{status}</span> : null}
    </div>
  );
}
