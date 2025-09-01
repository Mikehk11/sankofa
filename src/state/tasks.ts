// src/state/tasks.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { nanoid } from "nanoid";

export type TaskStatus = "todo" | "doing" | "review" | "done";

export type Task = {
  id: string;
  title: string;
  status: TaskStatus;
  projectId: string;
  assignees: string[];       // NEW
  createdAt: number;
};

type TasksState = {
  tasks: Task[];
  addTask: (title: string, projectId: string, assignees?: string[]) => void;
  setTaskStatus: (id: string, status: TaskStatus) => void;
  setTaskAssignees: (id: string, assignees: string[]) => void; // NEW
  deleteTask: (id: string) => void;
};

export const useTasks = create<TasksState>()(
  persist(
    (set, get) => ({
      tasks: [],

      addTask: (title, projectId, assignees = []) =>
        set((s) => ({
          tasks: [
            ...s.tasks,
            {
              id: nanoid(),
              title,
              status: "todo",
              projectId,
              assignees,
              createdAt: Date.now(),
            },
          ],
        })),

      setTaskStatus: (id, status) =>
        set((s) => ({
          tasks: s.tasks.map((t) => (t.id === id ? { ...t, status } : t)),
        })),

      setTaskAssignees: (id, assignees) =>
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === id ? { ...t, assignees: [...new Set(assignees)] } : t
          ),
        })),

      deleteTask: (id) =>
        set((s) => ({
          tasks: s.tasks.filter((t) => t.id !== id),
        })),
    }),
    {
      name: "sankofa/tasks",
      version: 2,
      migrate: (persisted: any) => {
        if (!persisted) return { tasks: [] };
        const tasks =
          persisted.tasks?.map((t: any) => ({
            assignees: Array.isArray(t.assignees) ? t.assignees : [],
            ...t,
          })) ?? [];
        return { tasks };
      },
    }
  )
);