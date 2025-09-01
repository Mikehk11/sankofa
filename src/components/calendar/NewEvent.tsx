"use client";

import { useState } from "react";
import { useEvents } from "@/state/events";

export default function NewEvent() {
  const add = useEvents((s) => s.add);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [link, setLink] = useState<string>("");

  const toStartIso = (d: string) => new Date(`${d}T09:00:00`).toISOString();
  const normalizeUrl = (u: string) =>
    !u.trim() ? "" : /^https?:\/\//i.test(u) ? u.trim() : `https://${u.trim()}`;

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const t = title.trim();
    if (!t) return;
    const cleaned = normalizeUrl(link);
    add({ title: t, start: toStartIso(date), link: cleaned || undefined });
    setTitle("");
    setLink("");
  }

  return (
    <div className="card" style={{ border: "1px solid var(--border)", borderRadius: 18, padding: 12 }}>
      <h3 style={{ marginTop: 0 }}>New event</h3>
      <form onSubmit={onSubmit} style={{ display: "grid", gap: 8 }}>
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
        <input
          placeholder="Meeting link (https://…)"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--card)", color: "var(--fg)" }}
        />
        <button className="btn" type="submit">Add</button>
      </form>
    </div>
  );
}