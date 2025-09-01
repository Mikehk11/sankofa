"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { addDays, isWithinInterval, startOfDay, endOfDay } from "date-fns";

import { useProjects, type Project } from "@/state/projects";
import { useTasks } from "@/state/tasks";
import { useDocs } from "@/state/docs";

import GanttChart from "@/components/GanttChart";
import MiniCalendar, { CalItem } from "@/components/MiniCalendar";
import ReportExport from "@/components/ReportExport";

const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);

// small progress bar helper
function ProgressBar({ pct }: { pct: number }) {
  return (
    <div
      style={{
        height: 8,
        borderRadius: 999,
        background: "var(--bg-2)",
        border: "1px solid var(--border)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: `${Math.round(clamp01(pct) * 100)}%`,
          height: "100%",
          background:
            "linear-gradient(90deg, color-mix(in srgb, var(--brand) 70%, transparent), var(--brand))",
        }}
      />
    </div>
  );
}

export default function DashboardPage() {
  // ---- stable store reads (no new arrays/objects returned by selectors)
  const projectsMap = useProjects(
    (s) => s.projects as Record<string, Project>
  );
  const order = useProjects((s) => s.order);
  const addProject = useProjects((s) => s.addProject);

  const tasksCount = useTasks((s) => s.tasks.length);
  const doneCount = useTasks((s) => s.tasks.filter((t) => t.status === "done").length);

  const docsCount = useDocs((s) => {
    const d = (s as any).docs;
    return Array.isArray(d) ? d.length : 0;
  });

  // ---- derived data (memoized)
  const projects: Project[] = useMemo(
    () => order.map((id) => projectsMap[id]).filter(Boolean) as Project[],
    [order, projectsMap]
  );

  // week window for the "This Week" KPI
  const weekStart = startOfDay(addDays(new Date(), -new Date().getDay()));
  const weekEnd = endOfDay(addDays(weekStart, 6));

  const eventsThisWeek = useMemo(
    () =>
      projects.filter(
        (p) => p.due && isWithinInterval(new Date(p.due), { start: weekStart, end: weekEnd })
      ).length,
    [projects, weekStart, weekEnd]
  );

  // Mini calendar items (project due dates)
  const calendarItems: CalItem[] = useMemo(
    () =>
      projects
        .filter((p) => p.due)
        .map((p) => ({
          id: `proj-${p.id}`,
          date: new Date(p.due!),
          title: p.name,
          type: "projectDue" as const,
          href: `/projects/${p.id}`,
        })),
    [projects]
  );

  // quick-add project
  const [newName, setNewName] = useState("");
  const [newDue, setNewDue] = useState<string>("");

  const pctTasks = tasksCount ? doneCount / tasksCount : 0;
  const docsTarget = 10;
  const pctDocs = docsTarget ? docsCount / docsTarget : 0;

  return (
    // NOTE: layout already wraps children in <main className="container">,
    // so we return a div grid here to avoid nested <main>.
    <div
      style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: 16,
        display: "grid",
        gap: 16,
        gridTemplateColumns: "1fr 360px",
        alignItems: "start",
      }}
    >
      {/* left column */}
      <div style={{ display: "grid", gap: 16 }}>
        {/* KPI row */}
        <div style={{ display: "grid", gap: 16, gridTemplateColumns: "1fr 1fr 1fr" }}>
          <Link
            href="/projects"
            className="card"
            style={{ padding: 12, textDecoration: "none", color: "inherit" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <strong>Tasks</strong>
              <span style={{ opacity: 0.7 }}>{Math.round(clamp01(pctTasks) * 100)}%</span>
            </div>
            <ul style={{ margin: 0, paddingLeft: 18, opacity: 0.85 }}>
              <li>{doneCount} done</li>
              <li>{Math.max(0, tasksCount - doneCount)} left</li>
            </ul>
            <div style={{ marginTop: 8 }}>
              <ProgressBar pct={pctTasks} />
            </div>
          </Link>

          <Link
            href="/docs"
            className="card"
            style={{ padding: 12, textDecoration: "none", color: "inherit" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <strong>Docs</strong>
              <span style={{ opacity: 0.7 }}>{Math.round(clamp01(pctDocs) * 100)}%</span>
            </div>
            <ul style={{ margin: 0, paddingLeft: 18, opacity: 0.85 }}>
              <li>{docsCount}/{docsTarget} prepared</li>
            </ul>
            <div style={{ marginTop: 8 }}>
              <ProgressBar pct={pctDocs} />
            </div>
          </Link>

          <Link
            href="/calendar"
            className="card"
            style={{ padding: 12, textDecoration: "none", color: "inherit" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <strong>This Week</strong>
              <span style={{ opacity: 0.7 }}>{Math.round(((new Date().getDay()+1)/7)*100)}%</span>
            </div>
            <ul style={{ margin: 0, paddingLeft: 18, opacity: 0.85 }}>
              <li>{eventsThisWeek} event(s)</li>
            </ul>
            <div style={{ marginTop: 8 }}>
              <ProgressBar pct={(new Date().getDay()+1)/7} />
            </div>
          </Link>
        </div>

        {/* Project Progress */}
        <section
          className="card"
          style={{ borderRadius: 12, padding: 12, display: "grid", gap: 12 }}
        >
          <header style={{ fontWeight: 700 }}>Project Progress</header>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              const name = newName.trim();
              if (!name) return;
              addProject(name, newDue ? new Date(newDue) : undefined);
              setNewName("");
              setNewDue("");
            }}
            style={{ display: "grid", gridTemplateColumns: "1fr 160px auto", gap: 8 }}
          >
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="New project name..."
              style={{ border: "1px solid var(--border)", borderRadius: 10, padding: "8px 10px" }}
            />
            <input
              type="date"
              value={newDue}
              onChange={(e) => setNewDue(e.target.value)}
              style={{ border: "1px solid var(--border)", borderRadius: 10, padding: "8px 10px" }}
            />
            <button className="btn" type="submit">Add</button>
          </form>

          <GanttChart projects={projects} />

          {/* Reports (CSV + Print/PDF) */}
          <ReportExport />
        </section>
      </div>

      {/* right column */}
      <div style={{ display: "grid", gap: 16 }}>
        <MiniCalendar
          items={calendarItems}
          onSelect={() => {
            /* noop – calendar component already handles link clicks via href */
          }}
        />
      </div>
    </div>
  );
}