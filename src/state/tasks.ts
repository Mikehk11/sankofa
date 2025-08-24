"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Status = "todo" | "inprogress" | "done";

export type Task = {
  id: string;
  title: string;
  status: Status;
  projectId?: string;
  assigneeId?: string;
  due?: string;         // ISO date
  createdAt: string;    // ISO datetime
  doneAt?: string;      // ISO datetime
};

type TasksState = {
  tasks: Task[];
  addTask: (t: Omit<Task, "id" | "createdAt"> & { id?: string }) => void;
  patch: (id: string, patch: Partial<Task>) => void;
  remove: (id: string) => void;
};

const SEED: Task[] = [
  { id: "t1", title: "Plan kickoff workshop", status: "inprogress", createdAt: new Date().toISOString() },
  { id: "t2", title: "Design flyers", status: "todo", createdAt: new Date().toISOString() },
  { id: "t3", title: "Meet partners – Abobo", status: "done", createdAt: new Date(Date.now() - 86400000 * 10).toISOString(), doneAt: new Date(Date.now() - 86400000 * 7).toISOString() },
];

export const useTasks = create<TasksState>()(
  persist(
    (set, get) => ({
      tasks: SEED,

      addTask: (t) =>
        set((s) => ({
          tasks: [
            ...s.tasks,
            {
              id: t.id ?? crypto.randomUUID(),
              createdAt: new Date().toISOString(),
              ...t,
            },
          ],
        })),

      patch: (id, patch) =>
        set((s) => {
          const next = s.tasks.map((x) => {
            if (x.id !== id) return x;
            const prevStatus = x.status;
            const newStatus = (patch.status ?? x.status) as Status;

            let doneAt = x.doneAt;
            if (prevStatus !== "done" && newStatus === "done" && !doneAt) {
              doneAt = new Date().toISOString();
            }
            if (prevStatus === "done" && newStatus !== "done") {
              doneAt = undefined;
            }

            return { ...x, ...patch, status: newStatus, doneAt };
          });
          return { tasks: next };
        }),

      remove: (id) =>
        set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),
    }),
    { name: "sankofa-tasks" }
  )
);