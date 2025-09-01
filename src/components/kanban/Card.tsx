"use client";

import type { Task } from "@/state/tasks";
import { useTasks } from "@/state/tasks";
import AssigneeBadge from "@/components/AssigneeBadge";
import { USERS } from "@/data/users";
import { useEffect, useRef, useState } from "react";

function DuePill({ due }: { due?: string }) {
  if (!due) return null;
  const d = new Date(due);
  const isPast = Date.now() > d.getTime();
  return (
    <span
      style={{
        padding: "2px 8px",
        borderRadius: 999,
        border: "1px solid var(--border)",
        background: isPast ? "rgba(255,0,0,0.08)" : "var(--bg)",
        color: "inherit",
        fontSize: 12,
        whiteSpace: "nowrap",
      }}
      title={`Due ${d.toLocaleDateString()}`}
    >
      Due {d.toLocaleDateString()}
    </span>
  );
}

export default function Card({ task }: { task: Task }) {
  const patch = useTasks((s) => s.patch);

  const [openAssign, setOpenAssign] = useState(false);
  const boxRef = useRef<HTMLDivElement | null>(null);

  // Close the assign menu on outside click or Escape
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!openAssign) return;
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setOpenAssign(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpenAssign(false);
    }
    document.addEventListener("mousedown", onDocClick);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      window.removeEventListener("keydown", onKey);
    };
  }, [openAssign]);

  return (
    <div
      style={{
        position: "relative",
        display: "grid",
        gridTemplateColumns: "1fr auto",
        gap: 8,
        padding: 10,
        border: "1px solid var(--border)",
        borderRadius: 12,
        background: "var(--card)",
      }}
    >
      <div style={{ display: "grid", gap: 6 }}>
        <div style={{ fontWeight: 700, lineHeight: 1.3 }}>{task.title}</div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <DuePill due={task.due} />
        </div>
      </div>

      {/* Assignee badge (click to open menu) */}
      <button
        onClick={() => setOpenAssign((v) => !v)}
        title={task.assigneeId ? "Change assignee" : "Assign"}
        style={{
          all: "unset",
          cursor: "pointer",
          alignSelf: "start",
          lineHeight: 0,
        }}
      >
        <AssigneeBadge id={task.assigneeId} />
      </button>

      {/* Small assign menu */}
      {openAssign && (
        <div
          ref={boxRef}
          style={{
            position: "absolute",
            top: 42,
            right: 8,
            zIndex: 20,
            width: 220,
            border: "1px solid var(--border)",
            borderRadius: 12,
            background: "var(--card)",
            boxShadow: "0 10px 30px rgba(0,0,0,.2)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: 10,
              borderBottom: "1px solid var(--border)",
              fontWeight: 700,
              fontSize: 13,
            }}
          >
            Assign to…
          </div>

          <button
            className="btn"
            onClick={() => {
              patch(task.id, { assigneeId: undefined });
              setOpenAssign(false);
            }}
            style={{
              width: "100%",
              justifyContent: "flex-start",
              borderRadius: 0,
              border: "none",
              background: "transparent",
            }}
          >
            Unassigned
          </button>

          {USERS.map((u) => (
            <button
              key={u.id}
              className="btn"
              onClick={() => {
                patch(task.id, { assigneeId: u.id });
                setOpenAssign(false);
              }}
              style={{
                width: "100%",
                justifyContent: "flex-start",
                borderRadius: 0,
                border: "none",
                background: "transparent",
              }}
            >
              {u.name} {u.online ? "•" : ""}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}