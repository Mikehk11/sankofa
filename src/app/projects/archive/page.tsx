// src/app/projects/archive/page.tsx
"use client";

import Link from "next/link";
import { useMemo } from "react";
import { format } from "date-fns";

import { useProjects, type Project } from "@/state/projects";
import { useTasks } from "@/state/tasks";

export default function ProjectsArchivePage() {
  // Stable store reads
  const projectsMap = useProjects<Record<string, Project>>((s) => s.projects);
  const order       = useProjects<string[]>((s) => s.order);

  const archive        = useProjects((s) => s.archiveProject);
  const setName        = useProjects((s) => s.setProjectName);
  const setDue         = useProjects((s) => s.setProjectDue);
  const deleteProject  = useProjects((s) => s.deleteProject); // permanent delete

  const tasks = useTasks((s) => s.tasks);

  // Derive archived list once per change
  const archived = useMemo(
    () =>
      order
        .map((id) => projectsMap[id])
        .filter((p): p is Project => Boolean(p) && !!p.archived),
    [order, projectsMap]
  );

  return (
    <section style={{ display: "grid", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Link className="btn-secondary" href="/projects">← All projects</Link>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Archived projects</h1>
        <div style={{ marginLeft: "auto", opacity: 0.7, fontSize: 12 }}>
          {archived.length} archived
        </div>
      </div>

      <div className="card" style={{ padding: 8 }}>
        <div style={{ display: "grid", gap: 8 }}>
          {archived.map((p) => {
            const ptasks = tasks.filter((t) => t.projectId === p.id);
            const done   = ptasks.filter((t) => t.status === "done").length;
            const pct    = ptasks.length ? Math.round((done / ptasks.length) * 100) : 0;

            return (
              <article
                key={p.id}
                style={{
                  border: "1px solid var(--border)",
                  borderRadius: 12,
                  background: "var(--bg)",
                  padding: 12,
                  display: "grid",
                  gap: 10,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontWeight: 600 }}>{p.name}</span>
                  <span style={{ opacity: 0.7, fontSize: 12 }}>
                    {p.due ? `Due ${format(p.due, "PP")}` : "No due date"}
                  </span>
                  <span style={{ marginLeft: "auto", opacity: 0.7, fontSize: 12 }}>
                    {done}/{ptasks.length} done · {pct}%
                  </span>
                </div>

                {/* progress bar (theme color) */}
                <div
                  style={{
                    height: 10,
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
                        "linear-gradient(90deg, color-mix(in oklab, var(--bar-good) 85%, transparent), var(--bar-good))",
                    }}
                  />
                </div>

                {/* quick edit + restore + delete */}
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <input
                    value={p.name}
                    onChange={(e) => setName(p.id, e.target.value)}
                    style={{ minWidth: 220 }}
                    aria-label="Project name"
                  />
                  <input
                    type="date"
                    value={p.due ? format(p.due, "yyyy-MM-dd") : ""}
                    onChange={(e) =>
                      setDue(
                        p.id,
                        e.currentTarget.value ? new Date(e.currentTarget.value) : undefined
                      )
                    }
                    aria-label="Due date"
                  />

                  <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
                    <button
                      className="btn"
                      onClick={() => archive(p.id, false)}
                      title="Restore project"
                      type="button"
                    >
                      Restore
                    </button>
                    <button
                      className="btn-destructive"
                      title="Delete permanently"
                      type="button"
                      onClick={() => {
                        if (window.confirm("Delete this project permanently? This also deletes its tasks.")) {
                          deleteProject(p.id);
                        }
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            );
          })}

          {archived.length === 0 && (
            <div style={{ padding: 12, opacity: 0.7 }}>No archived projects.</div>
          )}
        </div>
      </div>
    </section>
  );
}