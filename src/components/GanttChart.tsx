"use client";

import { useMemo } from "react";
import {
  addMonths,
  differenceInDays,
  eachMonthOfInterval,
  endOfMonth,
  format,
  max,
  min,
  startOfMonth,
} from "date-fns";
import type { Project } from "@/state/projects";

type Props = { projects: Project[] };

export default function GanttChart({ projects }: Props) {
  const today = new Date();

  const range = useMemo(() => {
    // window sized around min/max due; fallback = around today
    const withDue = projects.filter(
      (p): p is Project & { due: Date } => Boolean(p.due)
    );

    const minDue = withDue.length
      ? withDue.reduce((d, p) => (p.due < d ? p.due : d), withDue[0].due)
      : addMonths(today, -1);

    const maxDue = withDue.length
      ? withDue.reduce((d, p) => (p.due > d ? p.due : d), withDue[0].due)
      : addMonths(today, 2);

    const start = startOfMonth(min([minDue, addMonths(today, -1)]));
    const end = endOfMonth(max([maxDue, addMonths(today, 2)]));

    const days = Math.max(1, differenceInDays(end, start));
    const months = eachMonthOfInterval({ start, end });
    return { start, end, days, months };
  }, [projects]);

  return (
    <div style={{ display: "grid", gap: 10 }}>
      {/* Month axis */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${range.months.length}, 1fr)`,
          fontSize: 12,
          color: "var(--muted)",
          paddingInline: 6,
          marginBottom: 4,
          userSelect: "none",
        }}
      >
        {range.months.map((m) => (
          <div key={m.toISOString()}>{format(m, "LLL yyyy")}</div>
        ))}
      </div>

      {/* Rows */}
      <div style={{ display: "grid", gap: 8 }}>
        {projects.map((p) => {
          const due = p.due ?? addMonths(today, 1);
          const startRef = addMonths(due, -2);

          const sPct = Math.max(
            0,
            Math.min(1, differenceInDays(startRef, range.start) / range.days)
          );
          const ePct = Math.max(
            0,
            Math.min(1, differenceInDays(due, range.start) / range.days)
          );

          const left = `${sPct * 100}%`;
          const width = `${Math.max(0.02, ePct - sPct) * 100}%`;

          return (
            <div
              key={p.id}
              className="gantt-row"
              title={p.due ? `Due ${format(due, "PP")}` : "No due date"}
            >
              <div className="gantt-label">{p.name}</div>
              <div className="gantt-bar" style={{ left, width }} />
            </div>
          );
        })}
      </div>
    </div>
  );
}