"use client";

import { useEffect, useRef, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function useChartSize() {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      requestAnimationFrame(() => {
        setSize({ width: Math.floor(width), height: Math.floor(height) });
      });
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return { ref, size };
}

export function OpportunityDistributionChart({ data }: { data: { label: string; value: number }[] }) {
  const { ref, size } = useChartSize();
  return (
    <div className="h-64 rounded-lg border border-slate-800 bg-slate-950/80 p-4">
      <h2 className="text-sm font-semibold text-slate-100">Opportunity Score Distribution</h2>
      <div ref={ref} className="mt-3 h-[200px]">
        {size.width > 0 && size.height > 0 ? (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid stroke="#1e293b" />
            <XAxis dataKey="label" stroke="#64748b" fontSize={12} />
            <YAxis stroke="#64748b" fontSize={12} />
            <Tooltip contentStyle={{ background: "#020617", border: "1px solid #1e293b", color: "#e2e8f0" }} />
            <Bar dataKey="value" fill="#22d3ee" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-full rounded-md bg-slate-900" />
      )}
      </div>
    </div>
  );
}

export function ConfidenceScatterChart({ data }: { data: { score: number; confidence: number; title: string }[] }) {
  const { ref, size } = useChartSize();
  return (
    <div className="h-64 rounded-lg border border-slate-800 bg-slate-950/80 p-4">
      <h2 className="text-sm font-semibold text-slate-100">Confidence vs Opportunity</h2>
      <div ref={ref} className="mt-3 h-[200px]">
      {size.width > 0 && size.height > 0 ? (
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart>
            <CartesianGrid stroke="#1e293b" />
            <XAxis dataKey="score" name="Opportunity" stroke="#64748b" fontSize={12} />
            <YAxis dataKey="confidence" name="Confidence" stroke="#64748b" fontSize={12} />
            <Tooltip cursor={{ strokeDasharray: "3 3" }} contentStyle={{ background: "#020617", border: "1px solid #1e293b", color: "#e2e8f0" }} />
            <Scatter data={data} fill="#38bdf8" />
          </ScatterChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-full rounded-md bg-slate-900" />
      )}
      </div>
    </div>
  );
}
