"use client";
import { useState } from "react";
import styles from "@/components/calendar/Calendar.module.scss";
import EventForm from "@/components/calendar/EventForm";
import EventsList from "@/components/calendar/EventsList";

export default function CalendarPage() {
  const [editing, setEditing] = useState<string | null>(null);

  return (
    <section style={{ display: "grid", gap: 16 }}>
      <h1 style={{ margin: 0 }}>Calendar</h1>

      <div className={styles.wrap}>
        <EventForm eventId={editing} onSaved={() => setEditing(null)} />
        <EventsList onEdit={(id) => setEditing(id)} />
      </div>
    </section>
  );
}