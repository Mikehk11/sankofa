"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import { useProjects, type Project } from "@/state/projects";
import { useTasks, type Task } from "@/state/tasks";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function toCSV(rows: string[][]) {
  const esc = (s: string) => (/[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s);
  return rows.map((r) => r.map(esc).join(",")).join("\n");
}

export default function ReportExport() {
  // stable reads (no new arrays returned by selectors)
  const projectsMap = useProjects((s) => s.projects as Record<string, Project>);
  const order = useProjects((s) => s.order);
  const tasks = useTasks((s) => s.tasks as Task[]);

  const allProjects = useMemo<Project[]>(
    () => order.map((id) => projectsMap[id]).filter(Boolean) as Project[],
    [order, projectsMap]
  );

  // controls
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth()); // 0..11

  // derived
  const projectsForPeriod = useMemo(() => {
    // Include project if due date falls in selected month/year (or has no due date)
    return allProjects.filter((p) => {
      if (!p.due) return true;
      const d = new Date(p.due);
      return d.getFullYear() === year && d.getMonth() === month;
    });
  }, [allProjects, month, year]);

  const tasksByProject = useMemo(() => {
    const map = new Map<string, Task[]>();
    for (const t of tasks) {
      const arr = map.get(t.projectId) ?? [];
      arr.push(t);
      map.set(t.projectId, arr);
    }
    return map;
  }, [tasks]);

  function downloadCSV() {
    const rows: string[][] = [
      ["Project", "Due Date", "Total Tasks", "Done", "Doing", "Todo", "Review", "Progress %"],
    ];

    for (const p of projectsForPeriod) {
      const ptasks = tasksByProject.get(p.id) ?? [];
      const done = ptasks.filter((t) => t.status === "done").length;
      const doing = ptasks.filter((t) => t.status === "doing").length;
      const todo = ptasks.filter((t) => t.status === "todo").length;
      const review = ptasks.filter((t) => t.status === "review").length;
      const total = ptasks.length || 1;
      const pct = Math.round((done / total) * 100);

      rows.push([
        p.name,
        p.due ? format(new Date(p.due), "yyyy-MM-dd") : "—",
        String(ptasks.length),
        String(done),
        String(doing),
        String(todo),
        String(review),
        `${pct}`,
      ]);
    }

    const csv = toCSV(rows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sankofa-report-${year}-${String(month + 1).padStart(2, "0")}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function openPrint() {
    const rows = projectsForPeriod.map((p) => {
      const ptasks = tasksByProject.get(p.id) ?? [];
      const done = ptasks.filter((t) => t.status === "done").length;
      const pct = Math.round((done / (ptasks.length || 1)) * 100);
      return `
        <tr>
          <td>${p.name}</td>
          <td>${p.due ? format(new Date(p.due), "PP") : "—"}</td>
          <td style="text-align:right">${ptasks.length}</td>
          <td style="text-align:right">${pct}%</td>
        </tr>`;
    });

    const html = `
<!doctype html>
<html><head><meta charset="utf-8"/>
<title>Sankofa Report – ${MONTHS[month]} ${year}</title>
<style>
:root { font-family: ui-sans-serif, system-ui, Inter, Segoe UI, Roboto, Arial; color-scheme: light dark; }
body { margin: 24px; color: #0b1320; }
h1 { margin: 0 0 12px; font-size: 20px; }
table { width: 100%; border-collapse: collapse; }
th, td { padding: 8px 10px; border-bottom: 1px solid #e3e7ef; }
th { text-align: left; background: #f6f8fb; }
@media (prefers-color-scheme: dark) {
  body { color: #eef2ff; background: #0b1017; }
  th, td { border-color: #1f2a38; }
  th { background: #121a24; }
}
</style></head>
<body>
<h1>Sankofa – ${MONTHS[month]} ${year} Report</h1>
<table>
<thead><tr><th>Project</th><th>Due</th><th style="text-align:right">Tasks</th><th style="text-align:right">Progress</th></tr></thead>
<tbody>${rows.join("")}</tbody>
</table>
<script>window.print()</script>
</body></html>`;
    const w = window.open("", "_blank");
    if (w) {
      w.document.open();
      w.document.write(html);
      w.document.close();
    }
  }

  // simple year options around current year
  const yearOpts = useMemo(() => {
    const y = now.getFullYear();
    return [y - 1, y, y + 1, y + 2];
  }, [now]);

  return (
    <div className="card" style={{ padding: 12, borderRadius: 12, display: "grid", gap: 10 }}>
      <header style={{ fontWeight: 700 }}>Reports</header>

      {/* controls */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <div className="select">
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            aria-label="Month"
          >
            {MONTHS.map((m, i) => (
              <option key={`m-${i}`} value={i}>{m}</option>
            ))}
          </select>
        </div>

        <div className="select">
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            aria-label="Year"
          >
            {yearOpts.map((y) => (
              <option key={`y-${y}`} value={y}>{y}</option>
            ))}
          </select>
        </div>

        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <button className="btn-secondary" onClick={downloadCSV}>Download CSV</button>
          <button className="btn" onClick={openPrint}>Print / PDF</button>
        </div>
      </div>

      {/* tiny legend */}
      <ul style={{ margin: 0, paddingLeft: 18, opacity: 0.8 }}>
        {[
          "CSV includes per-project task counts & status breakdown.",
          "Printable view opens in a new tab; use your browser to Save as PDF.",
        ].map((line, idx) => (
          <li key={`legend-${idx}`}>{line}</li>
        ))}
      </ul>
    </div>
  );
}