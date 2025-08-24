"use client";

import { useMemo, useState } from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { useTasks } from "@/state/tasks";

/** format YYYY-MM from a date string */
function ym(d: string | Date) {
  const dt = typeof d === "string" ? new Date(d) : d;
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`;
}
function labelMonth(key: string) {
  const [y, m] = key.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleString(undefined, { month: "short" });
}
function lastMonths(n: number) {
  const out: string[] = [];
  const base = new Date();
  base.setDate(1);
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(base);
    d.setMonth(base.getMonth() - i);
    out.push(ym(d));
  }
  return out;
}

export default function ProgressChart() {
  const [windowSize, setWindowSize] = useState<6 | 12>(6);
  const tasks = useTasks((s) => s.tasks);

  const data = useMemo(() => {
    const months = lastMonths(windowSize);
    const createdCount: Record<string, number> = {};
    const doneCount: Record<string, number> = {};
    months.forEach((k) => ((createdCount[k] = 0), (doneCount[k] = 0)));

    for (const t of tasks) {
      // created
      const cKey = ym(t.createdAt ?? new Date());
      if (cKey in createdCount) createdCount[cKey]++;

      // completed — prefer doneAt, otherwise approximate:
      if (t.status === "done") {
        const doneKey = ym(t.doneAt ?? t.createdAt ?? new Date());
        if (doneKey in doneCount) doneCount[doneKey]++;
      }
    }

    return months.map((k) => ({
      key: k,
      label: labelMonth(k),
      created: createdCount[k] ?? 0,
      completed: doneCount[k] ?? 0,
    }));
  }, [tasks, windowSize]);

  return (
    <div
      className="card"
      style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 18, padding: 16 }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <h3 style={{ margin: 0, flex: 1 }}>Project Progress</h3>
        <div style={{ display: "flex", gap: 6 }}>
          <button
            className="btn"
            onClick={() => setWindowSize(6)}
            style={{ opacity: windowSize === 6 ? 1 : 0.6 }}
          >
            6M
          </button>
          <button
            className="btn"
            onClick={() => setWindowSize(12)}
            style={{ opacity: windowSize === 12 ? 1 : 0.6 }}
          >
            12M
          </button>
        </div>
      </div>

      <div style={{ width: "100%", height: 280, marginTop: 8 }}>
        <ResponsiveContainer>
          <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="#00000020" vertical={false} />
            <XAxis dataKey="label" />
            <YAxis allowDecimals={false} />
            <Tooltip
              formatter={(value: number) => [value, "count"]}
              labelFormatter={(l) => `Month: ${l}`}
            />
            <Line type="monotone" dataKey="created" stroke="#8884d8" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="completed" stroke="#82ca9d" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}