"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useProjects } from "@/state/projects";
import { useTasks } from "@/state/tasks";

export default function ProjectsOverview() {
  // 1) Select a stable reference from the store (NOT Object.values here)
  const projectsMap = useProjects((s) => s.projects);
  const tasks = useTasks((s) => s.tasks);

  // 2) Derive arrays OUTSIDE the selector
  const projects = useMemo(() => Object.values(projectsMap), [projectsMap]);

  const rows = useMemo(
    () =>
      projects
        .filter((p) => !p.archived)
        .map((p) => {
          const ptasks = tasks.filter((t) => t.projectId === p.id);
          const done = ptasks.filter((t) => t.status === "done").length;
          const total = ptasks.length || 0;
          const pct = total ? Math.round((done / total) * 100) : 0;
          return { project: p, total, done, pct };
        }),
    [projects, tasks]
  );

  return (
    <div
      style={{
        display: "grid",
        gap: 12,
        gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
      }}
    >
      {rows.map(({ project, pct, total }) => (
        <Link
          key={project.id}
          href={`/projects/${project.id}`}
          style={{
            border: "1px solid var(--border)",
            borderRadius: 12,
            background: "var(--card)",
            padding: 12,
            display: "grid",
            gap: 8,
            textDecoration: "none",
            color: "inherit",
          }}
        >
          <div style={{ fontWeight: 700 }}>{project.name}</div>
          <div style={{ opacity: 0.8, fontSize: 12 }}>
            {total} task{total === 1 ? "" : "s"} · {pct}%
          </div>
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
                width: `${pct}%`,
                height: "100%",
                background:
                  "linear-gradient(90deg, color-mix(in srgb, #6ea8fe 70%, transparent), #1e90ff)",
              }}
            />
          </div>
        </Link>
      ))}
    </div>
  );
}