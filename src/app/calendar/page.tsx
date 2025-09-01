"use client";

import { useMemo, useState } from "react";
import styles from "@/components/calendar/Calendar.module.scss";
import EventForm from "@/components/calendar/EventForm";
import EventsList from "@/components/calendar/EventsList";
import { useEvents, type CalendarEvent } from "@/state/events";

export default function CalendarPage() {
  // keep an id locally; look up the full event object for the form
  const [editingId, setEditingId] = useState<string | null>(null);

  // stable read of events from store
  const events = useEvents((s) => s.events ?? []);

  // derive the event object expected by <EventForm editing={...}>
  const editing: CalendarEvent | undefined = useMemo(
    () => events.find((e) => e.id === editingId),
    [events, editingId]
  );

  return (
    <section className="stack">
      <h1 style={{ margin: 0 }}>Calendar</h1>

      {/* force a two-column, left-aligned layout; overrides any module defaults */}
      <div
        className={styles.wrap}
        style={{
          display: "grid",
          gridTemplateColumns: "360px 1fr",
          gap: 16,
          alignItems: "start",
        }}
      >
        {/* EventForm expects the full object (or undefined), not an id */}
        <EventForm editing={editing} onSaved={() => setEditingId(null)} />

        {/* Your EventsList currently doesn't declare an onEdit prop.
            If you add it later, call: onEdit={(id) => setEditingId(id)} */}
        <EventsList />
      </div>
    </section>
  );
}