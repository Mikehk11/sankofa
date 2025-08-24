"use client";
import { useMemo } from "react";
import { useEvents } from "@/state/events";
import styles from "./Calendar.module.scss";

export default function EventsList({
  onEdit,
}: {
  onEdit: (id: string) => void;
}) {
  const { events, remove } = useEvents();

  const sorted = useMemo(
    () => [...events].sort((a, b) => a.date.localeCompare(b.date)),
    [events]
  );

  return (
    <div className={styles.card}>
      <div className="row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{ margin: 0 }}>Events</h3>
        <div className={styles.btnRow}>
          <a className={styles.linkBtn} href="https://meet.google.com/new" target="_blank" rel="noreferrer">
            Start Google Meet
          </a>
          <a className={styles.linkBtn} href="https://riverside.fm/" target="_blank" rel="noreferrer">
            Open Riverside
          </a>
        </div>
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th style={{ width: 120 }}>Date</th>
            <th>Title</th>
            <th style={{ width: 260 }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((e) => (
            <tr key={e.id}>
              <td className="mono">{e.date}</td>
              <td>{e.title}</td>
              <td>
                <div className={styles.row}>
                  <button className="btn" onClick={() => onEdit(e.id)}>Edit</button>
                  <button className={styles.delBtn} onClick={() => remove(e.id)}>Delete</button>
                  <a className={styles.linkBtn} href="https://meet.google.com/new" target="_blank" rel="noreferrer">
                    Meet
                  </a>
                  <a className={styles.linkBtn} href="https://riverside.fm/" target="_blank" rel="noreferrer">
                    Riverside
                  </a>
                </div>
              </td>
            </tr>
          ))}
          {sorted.length === 0 && (
            <tr>
              <td colSpan={3} style={{ opacity: 0.7, padding: 16 }}>
                No events yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}