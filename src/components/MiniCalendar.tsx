"use client";

import { useMemo, useState } from "react";
import { addDays, endOfMonth, format, isSameDay, startOfDay, startOfMonth } from "date-fns";

export type CalItem = {
  id: string;
  date: Date | string | number;
  title: string;
  type?: "projectDue" | "event";
  href?: string;
};

export default function MiniCalendar({
  items = [],
  onSelect,
}: {
  items?: CalItem[];
  onSelect?: (d: Date) => void;
}) {
  // --- normalize input and drop bad dates
  const normalized = useMemo(() => {
    const toDate = (v: any) => (v instanceof Date ? v : new Date(v));
    return items
      .map((it) => {
        const d = toDate(it.date);
        return Number.isFinite(d.getTime()) ? { ...it, date: startOfDay(d) } : null;
      })
      .filter(Boolean) as Required<CalItem>[];
  }, [items]);

  // Build a map yyyy-MM-dd -> items[]
  const byDay = useMemo(() => {
    const map = new Map<string, Required<CalItem>[]>();
    for (const it of normalized) {
      const key = format(it.date, "yyyy-MM-dd");
      const arr = map.get(key) ?? [];
      arr.push(it);
      map.set(key, arr);
    }
    return map;
  }, [normalized]);

  const [month, setMonth] = useState(startOfMonth(new Date()));
  const [selected, setSelected] = useState<Date | null>(null);

  const start = startOfMonth(month);
  const end = endOfMonth(month);

  // Render a simple 6x7 grid (leading/trailing days included)
  const days: Date[] = useMemo(() => {
    const out: Date[] = [];
    // start from the previous Sunday
    const lead = (start.getDay() + 7) % 7;
    let cur = addDays(start, -lead);
    while (out.length < 42) {
      out.push(cur);
      cur = addDays(cur, 1);
    }
    return out.map((d) => startOfDay(d));
  }, [start]);

  const header = (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
      <button className="btn" onClick={() => setMonth(addDays(start, -1))}>◀</button>
      <div style={{ fontWeight: 700 }}>{format(month, "MMMM yyyy")}</div>
      <button className="btn" onClick={() => setMonth(addDays(end, 1))}>▶</button>
    </div>
  );

  return (
    <section
      style={{
        border: "1px solid var(--border)",
        borderRadius: 12,
        background: "var(--card)",
        padding: 12,
        display: "grid",
        gap: 10,
        position: "relative",
      }}
    >
      <div style={{ fontWeight: 700 }}>This month</div>
      {header}

      {/* Weekday row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: 6,
          fontSize: 12,
          opacity: 0.7,
          marginTop: -6,
        }}
      >
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((w) => (
          <div key={w} style={{ textAlign: "center" }}>
            {w}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6 }}>
        {days.map((d) => {
          const key = format(d, "yyyy-MM-dd");
          const dayItems = byDay.get(key) ?? [];
          const isOtherMonth = d.getMonth() !== month.getMonth();
          const isSel = selected && isSameDay(selected, d);

          return (
            <button
              key={key}
              onClick={() => {
                setSelected(d);
                onSelect?.(d);
              }}
              title={
                dayItems.length
                  ? dayItems.map((i) => i.title).join(" • ")
                  : "No items"
              }
              style={{
                border: "1px solid var(--border)",
                borderRadius: 10,
                background: isSel ? "var(--pill-active)" : "var(--bg)",
                color: "inherit",
                padding: "10px 6px",
                textAlign: "center",
                opacity: isOtherMonth ? 0.55 : 1,
                position: "relative",
              }}
            >
              <div style={{ fontVariantNumeric: "tabular-nums" }}>{format(d, "d")}</div>

              {/* tiny markers */}
              {dayItems.length > 0 && (
                <div style={{ position: "absolute", left: 6, bottom: 6, display: "flex", gap: 3 }}>
                  {dayItems.slice(0, 3).map((i) => (
                    <span
                      key={i.id}
                      aria-label={i.title}
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: 999,
                        background: i.type === "projectDue" ? "#22c55e" : "#60a5fa",
                      }}
                    />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected-day details, contained within the panel (won’t overflow layout) */}
      <div
        style={{
          borderTop: "1px solid var(--border)",
          paddingTop: 8,
          marginTop: 4,
          display: "grid",
          gap: 8,
        }}
      >
        <div style={{ fontWeight: 700 }}>
          {selected ? format(selected, "EEE, MMM d") : "Select a date"}
        </div>
        {selected ? (
          (byDay.get(format(selected, "yyyy-MM-dd")) ?? []).length ? (
            <div style={{ display: "grid", gap: 6 }}>
              {(byDay.get(format(selected, "yyyy-MM-dd")) ?? []).map((i) => (
                <a
                  key={i.id}
                  href={i.href ?? "#"}
                  style={{
                    border: "1px solid var(--border)",
                    borderRadius: 10,
                    background: "var(--bg)",
                    padding: "8px 10px",
                    textDecoration: "none",
                    color: "inherit",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 999,
                      background: i.type === "projectDue" ? "#22c55e" : "#60a5fa",
                    }}
                  />
                  <span style={{ fontWeight: 600 }}>{i.title}</span>
                </a>
              ))}
            </div>
          ) : (
            <div style={{ opacity: 0.7, fontSize: 13 }}>No items on this day.</div>
          )
        ) : null}
      </div>
    </section>
  );
}