"use client";
import { useState } from "react";
import { useEvents } from "@/state/events";

export default function NewEvent() {
  const add = useEvents((s) => s.add);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));

  return (
    <div className="card">
      <h3 style={{ marginTop: 0 }}>New event</h3>
      <form
        style={{ display: "grid", gap: 8 }}
        onSubmit={(e) => {
          e.preventDefault();
          if (!title.trim()) return;
          add({ title, date });
          setTitle("");
        }}
      >
        <input
          placeholder="Event title…"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--card)", color: "var(--fg)" }}
        />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--card)", color: "var(--fg)" }}
        />
        <button className="btn" type="submit">Add</button>
      </form>
    </div>
  );
}