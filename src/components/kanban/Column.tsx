"use client";
import { useState } from "react";

/* ✅ Correct imports */
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";

import styles from "./Kanban.module.scss";
import type { Status, Task } from "@/data/tasks";
import TaskCard from "./TaskCard";
import { useTasks } from "@/state/tasks";
import { nanoid } from "nanoid";

export default function Column({ status, items }: { status: Status; items: Task[] }) {
  const { setNodeRef } = useDroppable({ id: status });
  const [title, setTitle] = useState("");
  const add = useTasks((s) => s.addTask);

  return (
    <div ref={setNodeRef} className={styles.column}>
      <div className={styles.colHead}>
        <strong style={{ textTransform: "capitalize" }}>{status}</strong>
        <span className={styles.count}>{items.length}</span>
      </div>

      <SortableContext items={items.map((t) => `task:${t.id}`)} strategy={verticalListSortingStrategy}>
        <div className={styles.list}>
          {items.map((t) => (
            <TaskCard key={t.id} task={t} />
          ))}
        </div>
      </SortableContext>

      <form
        className={styles.addRow}
        onSubmit={(e) => {
          e.preventDefault();
          if (!title.trim()) return;
          add({ id: nanoid(), title, category: "outreach", status }); // default category for quick add
          setTitle("");
        }}
      >
        <input
          className={styles.input}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add task…"
        />
        <button className={styles.smallBtn} type="submit">
          Add
        </button>
      </form>
    </div>
  );
}