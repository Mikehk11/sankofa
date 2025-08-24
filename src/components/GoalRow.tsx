"use client";

import styles from "./GoalRow.module.scss";
import { useTasks } from "@/state/tasks";
import { useDocs } from "@/state/docs";
import { useEvents } from "@/state/events";

function withinNextDays(dateStr: string, days = 7) {
  const now = new Date();
  const end = new Date(now);
  end.setDate(end.getDate() + days);
  const d = new Date(dateStr);
  return d >= now && d <= end;
}

function ProgressBar({ value }: { value: number }) {
  const v = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div className={styles.track} aria-label={`progress ${v}%`}>
      <div className={styles.fill} style={{ width: `${v}%` }} />
    </div>
  );
}

export default function GoalRow() {
  // Tasks
  const tasks = useTasks((s) => s.tasks);
  const totalTasks = tasks.length || 0;
  const doneTasks = tasks.filter((t) => t.status === "done").length;
  const tasksPct = totalTasks ? (doneTasks / totalTasks) * 100 : 0;

  // Docs
  const docs = useDocs((s) => s.docs);
  const docCount = docs.length;
  const docsTarget = 10;
  const docsPct = Math.min(100, (docCount / docsTarget) * 100);

  // Events (next 7 days)
  const events = useEvents((s) => s.events);
  const next7 = events.filter((e) => withinNextDays(e.start));
  const eventsCount = next7.length;
  const daysWithEvents = new Set(next7.map((e) => new Date(e.start).toDateString())).size;
  const eventsPct = (daysWithEvents / 7) * 100;

  const cards = [
    { title: "Tasks",   percent: tasksPct, bullets: [`${doneTasks} done`, `${Math.max(0, totalTasks - doneTasks)} left`] },
    { title: "Docs",    percent: docsPct,  bullets: [`${docCount} prepared`, `Target ${docsTarget}`] },
    { title: "This Week", percent: eventsPct, bullets: [`${eventsCount} event(s)`, `${daysWithEvents}/7 days busy`] },
  ];

  return (
    <div className={styles.row}>
      {cards.map((c) => (
        <div key={c.title} className={styles.card}>
          <div className={styles.cardHead}>
            <h3>{c.title}</h3>
            <strong>{Math.round(c.percent)}%</strong>
          </div>
          <ul className={styles.bullets}>{c.bullets.map((b, i) => <li key={i}>{b}</li>)}</ul>
          <ProgressBar value={c.percent} />
        </div>
      ))}
    </div>
  );
}