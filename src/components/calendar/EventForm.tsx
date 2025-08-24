"use client";
import { useEffect, useState } from "react";
import { useEvents } from "@/state/events";
import styles from "./Calendar.module.scss";

export default function EventForm({
  eventId,
  onSaved,
}: {
  eventId?: string | null;
  onSaved?: () => void;
}) {
  const { events, add, update } = useEvents();
  const editing = eventId ? events.find((e) => e.id === eventId) : undefined;

  const [title, setTitle] = useState("");
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));

  useEffect(() => {
    if (editing) {
      setTitle(editing.title);
      setDate(editing.date);
    } else {
      setTitle("");
      setDate(new Date().toISOString().slice(0, 10));
    }
  }, [eventId]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className={styles.card}>
      <h3 style={{ marginTop: 0 }}>{editing ? "Edit event" : "New event"}</h3>
      <form
        style={{ display: "grid", gap: 8 }}
        onSubmit={(e) => {
          e.preventDefault();
          if (!title.trim()) return;
          if (editing) update(editing.id, { title, date });
          else add({ title, date });
          onSaved?.();
          setTitle("");
        }}
      >
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
        <div className={styles.btnRow}>
          <button className="btn" type="submit">
            {editing ? "Update" : "Add"}
          </button>
          {editing && (
            <button className="btn" type="button" onClick={() => onSaved?.()}>
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}