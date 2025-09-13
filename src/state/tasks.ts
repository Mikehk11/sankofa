import { create } from "zustand";

export type TaskStatus = "todo" | "doing" | "review" | "done";

export type Task = {
  id: string;
  title: string;
  status: TaskStatus;
  projectId: string | null;   // normalized (never undefined)
  assignees: string[];        // normalized (never undefined)
  createdAt: Date;
  updatedAt: Date;
};

type TasksState = {
  tasks: Task[];
  hydrated: boolean;
  load: () => Promise<void>;
  addTask: (
    title: string,
    projectId?: string | null,
    assignees?: string[]
  ) => Promise<void>;
  setTaskStatus: (id: string, status: TaskStatus) => Promise<void>;
  setTaskAssignees: (id: string, assignees: string[]) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
};

// Normalize any server object into our Task shape
const normalize = (raw: any): Task => ({
  id: String(raw.id),
  title: String(raw.title ?? ""),
  status: (raw.status ?? "todo") as TaskStatus,
  projectId: raw.projectId ?? null,
  assignees: Array.isArray(raw.assignees) ? raw.assignees.map(String) : [],
  createdAt: new Date(raw.createdAt),
  updatedAt: new Date(raw.updatedAt),
});

export const useTasks = create<TasksState>((set, get) => ({
  tasks: [],
  hydrated: false,

  async load() {
    if (get().hydrated) return;
    try {
      const res = await fetch("/api/tasks", { cache: "no-store" });
      const data = await res.json().catch(() => ({ tasks: [] }));
      const arr: Task[] = Array.isArray(data.tasks) ? data.tasks.map(normalize) : [];
      set({ tasks: arr, hydrated: true });
    } catch {
      // keep empty; don't flip hydrated so a later retry can work
    }
  },

  async addTask(title, projectId = null, assignees = []) {
    // optimistic record
    const temp: Task = {
      id: `tmp_${Math.random().toString(36).slice(2, 8)}`,
      title,
      status: "todo",
      projectId,
      assignees: Array.isArray(assignees) ? assignees : [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    set((s) => ({ tasks: [...s.tasks, temp] }));

    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, projectId, assignees }),
      });
      const saved = normalize(await res.json());
      set((s) => ({
        tasks: s.tasks.map((t) => (t.id === temp.id ? saved : t)),
      }));
    } catch {
      set((s) => ({ tasks: s.tasks.filter((t) => t.id !== temp.id) }));
    }
  },

  async setTaskStatus(id, status) {
    const prev = get().tasks;
    set((s) => ({
      tasks: s.tasks.map((t) => (t.id === id ? { ...t, status } : t)),
    }));
    try {
      await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
    } catch {
      set({ tasks: prev });
    }
  },

  async setTaskAssignees(id, assignees) {
    const prev = get().tasks;
    set((s) => ({
      tasks: s.tasks.map((t) => (t.id === id ? { ...t, assignees: [...assignees] } : t)),
    }));
    try {
      await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignees }),
      });
    } catch {
      set({ tasks: prev });
    }
  },

  async deleteTask(id) {
    const prev = get().tasks;
    set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) }));
    try {
      await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    } catch {
      set({ tasks: prev });
    }
  },
}));