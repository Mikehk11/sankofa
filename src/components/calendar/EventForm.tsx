"use client";

import { useEffect, useState } from "react";
import styles from "./Calendar.module.scss";
import { useEvents, type CalendarEvent } from "@/state/events";

export default function EventForm({
  editing,
  onSaved,
}: {
  editing?: CalendarEvent;
  onSaved?: () => void;
}) {
  const add = useEvents((s) => s.add);
  const update = useEvents((s) => s.update);

  const [title, setTitle] = useState("");
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [link, setLink] = useState<string>("");

  useEffect(() => {
    if (editing) {
      setTitle(editing.title);
      setDate(new Date(editing.start).toISOString().slice(0, 10));
      setLink(editing.link ?? "");
    } else {
      setTitle("");
      setDate(new Date().toISOString().slice(0, 10));
      setLink("");
    }
  }, [editing]);

  const toStartIso = (d: string) => new Date(`${d}T09:00:00`).toISOString();
  const normalizeUrl = (u: string) =>
    !u.trim() ? "" : /^https?:\/\//i.test(u) ? u.trim() : `https://${u.trim()}`;

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    const start = toStartIso(date);
    const cleaned = normalizeUrl(link);

    if (editing) {
      update(editing.id, { title, start, link: cleaned || undefined });
    } else {
      add({ title, start, link: cleaned || undefined });
    }

    onSaved?.();
    setTitle("");
  }

  return (
    <div className={styles.card}>
      <h3 style={{ marginTop: 0 }}>{editing ? "Edit event" : "New event"}</h3>
      <form onSubmit={onSubmit} style={{ display: "grid", gap: 8 }}>
        <input
          className={styles.inp}
          placeholder="Event title…"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          className={styles.inp}
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <input
          className={styles.inp}
          placeholder="Meeting link (Google Meet, Riverside, Zoom)…"
          value={link}
          onChange={(e) => setLink(e.target.value)}
        />
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn" type="submit">
            {editing ? "Save" : "Add"}
          </button>
        </div>
      </form>
    </div>
  );
}