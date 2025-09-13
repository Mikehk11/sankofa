"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";

import { useProjects } from "@/state/projects";
import type { Project } from "@/state/projects";
import { useTasks } from "@/state/tasks";

export default function ProjectsPage() {
  // ----- stable store reads (single-arg selectors only)
  const projectsMap = useProjects<Record<string, Project>>((s) => s.projects);
  const order       = useProjects<string[]>((s) => s.order);

  const addProject     = useProjects((s) => s.addProject);
  const archive        = useProjects((s) => s.archiveProject);
  const setName        = useProjects((s) => s.setProjectName);
  const setDue         = useProjects((s) => s.setProjectDue);
  const deleteProject  = useProjects((s) => s.deleteProject); // new

  const tasks = useTasks((s) => s.tasks);

  // ----- local UI state
  const [newName, setNewName] = useState("");
  const [newDue, setNewDue]   = useState<string>("");

  function onAdd(e?: React.FormEvent) {
    e?.preventDefault();
    const name = newName.trim();
    if (!name) return;
    const due = newDue ? new Date(newDue) : undefined;
    addProject(name, due);       // assumes addProject(name: string, due?: Date)
    setNewName("");
    setNewDue("");
  }

  // ----- derive arrays with useMemo so React sees a stable snapshot during render
  const projects = useMemo(
    () => order.map((id) => projectsMap[id]).filter(Boolean).filter((p) => !p.archived),
    [order, projectsMap]
  );

  return (
    <section style={{ display: "grid", gap: 16 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Projects</h1>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <Link className="btn-secondary" href="/projects/archive">
            View archive
          </Link>
        </div>
      </div>

      {/* Add new project */}
      <form
        onSubmit={onAdd}
        className="card"
        style={{
          padding: 12,
          display: "grid",
          gap: 8,
          gridTemplateColumns: "1fr 180px auto",
          alignItems: "center",
        }}
      >
        <input
          placeholder="New project name…"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          aria-label="Project name"
        />
        <input
          type="date"
          value={newDue}
          onChange={(e) => setNewDue(e.target.value)}
          aria-label="Due date (optional)"
        />
        <button className="btn" type="submit">Add</button>
      </form>

      {/* Project list */}
      <div className="card" style={{ padding: 8 }}>
        <div style={{ display: "grid", gap: 8 }}>
          {projects.map((p) => {
            const ptasks = tasks.filter((t) => t.projectId === p.id);
            const done = ptasks.filter((t) => t.status === "done").length;
            const pct = ptasks.length ? Math.round((done / ptasks.length) * 100) : 0;

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
                {/* Top row: name + meta */}
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Link
                    href={`/projects/${p.id}`}
                    style={{ fontWeight: 600, textDecoration: "none" }}
                  >
                    {p.name}
                  </Link>

                  <span style={{ opacity: 0.7, fontSize: 12 }}>
                    {p.due ? `Due ${format(p.due, "PP")}` : "No due date"}
                  </span>

                  <span style={{ marginLeft: "auto", opacity: 0.7, fontSize: 12 }}>
                    {done}/{ptasks.length} done · {pct}%
                  </span>
                </div>

                {/* progress bar */}
                <div
                  style={{
                    height: 10,
                    borderRadius: 999,
                    background: "var(--bg-2)",
                    border: "1px solid var(--border)",
                    overflow: "hidden",
                  }}
                  aria-label={`Progress ${pct}%`}
                >
                  <div
                    style={{
                      width: `${pct}%`,
                      height: "100%",
                      background:
                        "linear-gradient(90deg, color-mix(in srgb, #22c55e 85%, transparent), #16a34a)",
                    }}
                  />
                </div>

                {/* quick inline edit + actions */}
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <input
                    value={p.name}
                    onChange={(e) => setName(p.id, e.target.value)}
                    style={{ minWidth: 220 }}
                    aria-label={`Rename project ${p.name}`}
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
                    aria-label="Edit due date"
                  />

                  <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
                    <button
                      className="btn-secondary"
                      onClick={() => archive(p.id, true)}
                      title="Archive project"
                      type="button"
                    >
                      Archive
                    </button>
                    <button
                      className="btn-destructive"
                      onClick={() => {
                        if (confirm(`Delete “${p.name}” and all its tasks? This cannot be undone.`)) {
                          deleteProject(p.id);
                        }
                      }}
                      title="Delete project"
                      type="button"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            );
          })}

          {projects.length === 0 && (
            <div style={{ padding: 12, opacity: 0.7 }}>No active projects yet.</div>
          )}
        </div>
      </div>
    </section>
  );
}