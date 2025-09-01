// src/app/projects/[id]/page.tsx
"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

import { useProjects } from "@/state/projects";
import { useTasks, TaskStatus } from "@/state/tasks";
import { USERS } from "@/data/users";

const STATUSES: TaskStatus[] = ["todo", "doing", "review", "done"];

function initials(name = "?") {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "?") + (parts[1]?.[0] ?? "")).toUpperCase();
}
function colorFromName(name = "User") {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) | 0;
  const hue = Math.abs(h) % 360;
  return `hsl(${h} 60% 60%)`;
}

export default function ProjectDetail() {
  const params = useParams<{ id: string }>(); // Next 15: useParams on client
  const id = String(params.id);

  const project = useProjects((s) => s.projects[id]);
  const setName = useProjects((s) => s.setProjectName);
  const archive = useProjects((s) => s.archiveProject);

  const tasks = useTasks((s) => s.tasks);
  const addTask = useTasks((s) => s.addTask);
  const setStatus = useTasks((s) => s.setTaskStatus);
  const setAssignees = useTasks((s) => s.setTaskAssignees);

  const [title, setTitle] = useState("");
  const [picked, setPicked] = useState<string[]>([]); // assignees being picked

  const allUserIds = USERS.map((u) => u.id);
  const everyone = picked.length === allUserIds.length;

  const togglePick = (uid: string) =>
    setPicked((prev) =>
      prev.includes(uid) ? prev.filter((x) => x !== uid) : [...prev, uid]
    );
  const pickAll = () => setPicked(allUserIds);
  const clearAll = () => setPicked([]);

  const ptasks = useMemo(
    () => tasks.filter((t) => t.projectId === id),
    [tasks, id]
  );

  const done = ptasks.filter((t) => t.status === "done").length;
  const total = ptasks.length;
  const pct = total ? Math.round((done / total) * 100) : 0;

  if (!project) {
    return (
      <div style={{ padding: 24 }}>
        <p>Project not found.</p>
        <Link href="/projects" className="btn">
          ← Back to projects
        </Link>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: 16, padding: 16 }}>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <Link href="/projects" className="btn">
          ← All projects
        </Link>
        <input
          value={project.name}
          onChange={(e) => setName(project.id, e.target.value)}
          style={{
            fontWeight: 700,
            fontSize: 22,
            background: "transparent",
            border: "1px solid var(--border)",
            borderRadius: 10,
            padding: "6px 10px",
            minWidth: 260,
          }}
        />
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <button
            className="btn"
            onClick={() => archive(project.id, !project.archived)}
            title={project.archived ? "Unarchive" : "Archive"}
          >
            {project.archived ? "Unarchive" : "Archive"}
          </button>
        </div>
      </div>

      {/* Progress */}
      <div
        style={{
          padding: 12,
          borderRadius: 12,
          background: "var(--card)",
          border: "1px solid var(--border)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 8,
          }}
        >
          <div style={{ opacity: 0.8, fontWeight: 600 }}>Progress</div>
          <div style={{ fontVariantNumeric: "tabular-nums" }}>{pct}%</div>
        </div>
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
                "linear-gradient(90deg, color-mix(in srgb, #6ea8fe 70%, transparent), #1e90ff)",
            }}
          />
        </div>
      </div>

      {/* Add task to this project */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const title2 = title.trim();
          if (!title2) return;
          addTask(title2, project.id, picked);
          setTitle("");
        }}
        style={{
          display: "grid",
          gridTemplateColumns: "1fr auto",
          gap: 8,
          alignItems: "start",
        }}
      >
        <div style={{ display: "grid", gap: 8 }}>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="New task title…"
            style={{
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid var(--border)",
              background: "var(--card)",
            }}
          />

          {/* Assignees picker */}
          <div
            style={{
              display: "flex",
              gap: 6,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <span style={{ opacity: 0.8, fontSize: 13 }}>Assign to:</span>

            <button
              type="button"
              className="btn"
              onClick={everyone ? clearAll : pickAll}
              title="Toggle everyone"
              style={{ opacity: everyone ? 1 : 0.6 }}
            >
              Everyone
            </button>

            {USERS.map((u) => {
              const isOn = picked.includes(u.id);
              return (
                <button
                  key={u.id}
                  type="button"
                  className="btn"
                  onClick={() => togglePick(u.id)}
                  title={u.name || u.id}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    opacity: isOn ? 1 : 0.55,
                  }}
                >
                  <span
                    aria-hidden
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 999,
                      display: "grid",
                      placeItems: "center",
                      fontSize: 11,
                      fontWeight: 800,
                      color: "#0F2430",
                      background: colorFromName(u.name || u.id),
                      border: "1px solid var(--border)",
                    }}
                  >
                    {initials(u.name || u.id)}
                  </span>
                  <span style={{ fontSize: 12 }}>{u.name || u.id}</span>
                </button>
              );
            })}
          </div>
        </div>

        <button className="btn">Add task</button>
      </form>

      {/* Grouped by status */}
      <div
        style={{
          display: "grid",
          gap: 12,
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
        }}
      >
        {STATUSES.map((s) => {
          const list = ptasks.filter((t) => t.status === s);
          return (
            <section
              key={s}
              style={{
                border: "1px solid var(--border)",
                borderRadius: 12,
                background: "var(--card)",
                padding: 12,
                display: "grid",
                gap: 8,
              }}
            >
              <header style={{ opacity: 0.8, fontWeight: 600 }}>
                {s.toUpperCase()} · {list.length}
              </header>

              <div style={{ display: "grid", gap: 8 }}>
                {list.map((t) => (
                  <article
                    key={t.id}
                    style={{
                      border: "1px solid var(--border)",
                      borderRadius: 10,
                      padding: 10,
                      background: "var(--bg)",
                      display: "grid",
                      gap: 8,
                    }}
                  >
                    <div>{t.title}</div>

                    {/* Assignees badges */}
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {t.assignees.length === 0 ? (
                        <span style={{ opacity: 0.6, fontSize: 12 }}>
                          Unassigned
                        </span>
                      ) : (
                        t.assignees.map((uid) => {
                          const u = USERS.find((x) => x.id === uid);
                          const label = u?.name || uid;
                          return (
                            <span
                              key={uid}
                              title={label}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 6,
                                border: "1px solid var(--border)",
                                padding: "2px 6px",
                                borderRadius: 999,
                                background: "var(--card)",
                              }}
                            >
                              <span
                                aria-hidden
                                style={{
                                  width: 18,
                                  height: 18,
                                  borderRadius: 999,
                                  display: "grid",
                                  placeItems: "center",
                                  fontSize: 10,
                                  fontWeight: 800,
                                  color: "#0F2430",
                                  background: colorFromName(label),
                                  border: "1px solid var(--border)",
                                }}
                              >
                                {initials(label)}
                              </span>
                              <span style={{ fontSize: 12 }}>{label}</span>
                            </span>
                          );
                        })
                      )}
                    </div>

                    {/* Status shortcuts */}
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {STATUSES.map((ns) => (
                        <button
                          key={ns}
                          className="btn"
                          style={{
                            opacity: t.status === ns ? 1 : 0.6,
                            padding: "4px 8px",
                          }}
                          onClick={() => setStatus(t.id, ns)}
                        >
                          {ns}
                        </button>
                      ))}
                    </div>
                  </article>
                ))}

                {list.length === 0 && (
                  <div style={{ opacity: 0.7, fontSize: 13 }}>
                    No tasks in {s}.
                  </div>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}