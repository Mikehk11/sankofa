"use client";
import { addDays, endOfMonth, format, getDay, startOfMonth } from "date-fns";
import styles from "./MiniCalendar.module.scss";
import { useEvents } from "@/state/events";

export default function MiniCalendar() {
  const events = useEvents((s) => s.events);

  const now = new Date();
  const start = startOfMonth(now);
  const end = endOfMonth(now);
  const offset = getDay(start); // 0=Sun..6=Sat

  const days: Date[] = [];
  // pad previous days so the grid starts on Sunday
  for (let i = 0; i < offset; i++) days.push(addDays(start, -offset + i));
  // actual month days
  for (let d = 0; d < end.getDate(); d++) days.push(addDays(start, d));
  // pad to complete weeks
  while (days.length % 7 !== 0) days.push(addDays(end, days.length % 7));

  const upNext = [...events]
    .filter((e) => new Date(e.date) >= new Date())
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 5);

  return (
    <div className="card">
      <div className={styles.wrap}>
        <h3 style={{ margin: 0 }}>This Month</h3>

        <div className={styles.head}>
          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>

        <div className={styles.grid}>
          {days.map((d, i) => {
            const dStr = format(d, "yyyy-MM-dd");
            const isToday = dStr === format(new Date(), "yyyy-MM-dd");
            const count = events.filter((e) => e.date === dStr).length;
            return (
              <div key={i} className={`${styles.cell} ${isToday ? styles.today : ""}`}>
                <div className="mono" style={{ fontSize: 12 }}>{format(d, "d")}</div>
                {count > 0 && <div className={styles.dots}>• {count} event{count>1?"s":""}</div>}
              </div>
            );
          })}
        </div>

        <div className={styles.upnext}>
          <strong>Up next</strong>
          {upNext.length === 0 && (
            <div className={styles.item} style={{ opacity: 0.7 }}>
              No upcoming events.
            </div>
          )}
          {upNext.map((e) => (
            <div key={e.id} className={styles.item}>
              {new Date(e.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })} — {e.title}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}