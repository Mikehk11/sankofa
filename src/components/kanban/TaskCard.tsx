"use client";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import styles from "./Kanban.module.scss";
import type { Task } from "@/data/tasks";

export default function TaskCard({ task }: { task: Task }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: `task:${task.id}` });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className={styles.card} {...attributes} {...listeners}>
      <div style={{ fontWeight: 600 }}>{task.title}</div>
      <div style={{ fontSize: 12, opacity: .7, marginTop: 4 }}>
        {task.category} • {task.status}
      </div>
    </div>
  );
}