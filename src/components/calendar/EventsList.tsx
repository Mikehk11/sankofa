"use client";

import { useMemo } from "react";
import { useEvents, type CalendarEvent } from "@/state/events";

const dtDate = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});
const dtTime = new Intl.DateTimeFormat("en-US", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: true,
  timeZone: "UTC",
});

function ts(e: CalendarEvent) {
  const t = new Date(e.start).getTime();
  return Number.isFinite(t) ? t : 0;
}
function fmt(e: CalendarEvent) {
  const d = new Date(e.start);
  return `${dtDate.format(d)} · ${dtTime.format(d)}`;
}

export default function EventsList() {
  const events = useEvents((s) => s.events);
  const remove = useEvents((s) => s.remove);

  const sorted = useMemo(() => [...events].sort((a, b) => ts(a) - ts(b)), [events]);

  return (
    <div
      className="card"
      style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 18, padding: 12 }}
    >
      <h3 style={{ margin: 0 }}>Upcoming events</h3>
      <div style={{ display: "grid", gap: 8, marginTop: 8 }}>
        {sorted.length === 0 && <div style={{ opacity: 0.6 }}>No events yet.</div>}
        {sorted.map((e) => (
          <div
            key={e.id}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr auto auto",
              gap: 8,
              alignItems: "center",
              padding: 8,
              border: "1px solid var(--border)",
              borderRadius: 12,
              background: "var(--bg)",
            }}
          >
            <div>
              <div style={{ fontWeight: 600 }}>{e.title}</div>
              <div style={{ opacity: 0.75, fontSize: 13 }} suppressHydrationWarning>
                {fmt(e)} {e.location ? `· ${e.location}` : ""}
              </div>
            </div>

            {e.link && (
              <a
                className="btn"
                href={e.link}
                target="_blank"
                rel="noreferrer"
                style={{ whiteSpace: "nowrap" }}
              >
                Join
              </a>
            )}

            <button className="btn" onClick={() => remove(e.id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}