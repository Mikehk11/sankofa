"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { nanoid } from "nanoid";

export type Status = "todo" | "doing" | "review" | "done";

export type Task = {
  id: string;
  title: string;
  status: Status;
  projectId: string;
  createdAt: number;
  completedAt?: number;
};

export type Project = {
  id: string;
  name: string;
  due?: string;          // ISO date (optional)
  archived?: boolean;
  createdAt: number;
};

type Columns = Record<Status, string[]>;

type PMState = {
  // data
  projects: Record<string, Project>;
  projectOrder: string[];                  // ordering for lists
  tasks: Record<string, Task>;
  // board columns per project
  board: Record<string, Columns>;

  // derived helpers
  listProjects(): Project[];
  listTasks(projectId: string): Task[];
  progress(projectId: string): { done: number; total: number; percent: number };

  // project ops
  addProject(name: string, due?: string): string;
  renameProject(id: string, name: string): void;
  archiveProject(id: string): void;

  // task ops
  addTask(title: string, projectId: string, status?: Status): string;
  moveWithin(projectId: string, status: Status, fromIndex: number, toIndex: number): void;
  moveAcross(projectId: string, from: Status, to: Status, id: string, toIndex: number): void;
  setTaskStatus(id: string, status: Status): void;
  clearColumn(projectId: string, status: Status): void;
};

const ORDER: Status[] = ["todo", "doing", "review", "done"];

const seed = () => {
  const p1 = { id: "p1", name: "Civic Workshops 2025", createdAt: Date.now() - 5_000 } satisfies Project;
  const p2 = { id: "p2", name: "Schools Outreach – Abidjan", createdAt: Date.now() - 4_000 } satisfies Project;
  const p3 = { id: "p3", name: "brainstorming ideas", createdAt: Date.now() - 3_000 } satisfies Project;

  const projects: Record<string, Project> = { [p1.id]: p1, [p2.id]: p2, [p3.id]: p3 };
  const projectOrder = [p1.id, p2.id, p3.id];

  const tasks: Record<string, Task> = {};
  function T(title: string, status: Status, projectId: string) {
    const id = nanoid(8);
    tasks[id] = { id, title, status, projectId, createdAt: Date.now() };
    return id;
  }

  const b: Record<string, Columns> = {
    p1: { todo: [], doing: [], review: [], done: [] },
    p2: { todo: [], doing: [], review: [], done: [] },
    p3: { todo: [], doing: [], review: [], done: [] },
  };

  // sample tasks
  [T("Translate flyer to local langs", "todo", "p1"),
   T("Google Docs completed", "todo", "p1"),
   T("Instagram carousel (FR)", "doing", "p1"),
   T("Book venue in Yopougon", "review", "p1"),
   T("Volunteer roster (Sept)", "review", "p1"),
   T("Design civic-rights poster", "done", "p1"),
   T("Schedule Abidjan workshop", "done", "p1"),
  ].forEach((id) => { const t = tasks[id]; b[t.projectId][t.status].push(id); });

  return { projects, projectOrder, tasks, board: b };
};

export const usePM = create<PMState>()(
  persist(
    (set, get) => ({
      ...seed(),

      listProjects() {
        const s = get();
        return s.projectOrder.map((id) => s.projects[id]).filter(Boolean);
      },

      listTasks(projectId: string) {
        const s = get();
        const cols = s.board[projectId] ?? { todo: [], doing: [], review: [], done: [] };
        const ids = ORDER.flatMap((st) => cols[st]);
        return ids.map((id) => s.tasks[id]).filter(Boolean);
      },

      progress(projectId: string) {
        const s = get();
        const list = s.listTasks(projectId);
        const total = list.length;
        const done = list.filter((t) => t.status === "done").length;
        const percent = total ? Math.round((done / total) * 100) : 0;
        return { done, total, percent };
      },

      addProject(name: string, due?: string) {
        const id = nanoid(6);
        const createdAt = Date.now();
        set((s) => ({
          projects: { ...s.projects, [id]: { id, name: name.trim() || "Untitled", due, createdAt } },
          projectOrder: [id, ...s.projectOrder],
          board: { ...s.board, [id]: { todo: [], doing: [], review: [], done: [] } },
        }));
        return id;
      },

      renameProject(id, name) {
        set((s) => ({ projects: { ...s.projects, [id]: { ...s.projects[id], name } } }));
      },

      archiveProject(id) {
        set((s) => ({ projects: { ...s.projects, [id]: { ...s.projects[id], archived: true } } }));
      },

      addTask(title, projectId, status = "todo") {
        const id = nanoid(8);
        const t: Task = { id, title: title.trim(), status, projectId, createdAt: Date.now() };
        set((s) => ({
          tasks: { ...s.tasks, [id]: t },
          board: {
            ...s.board,
            [projectId]: {
              ...s.board[projectId],
              [status]: [id, ...s.board[projectId][status]],
            },
          },
        }));
        return id;
      },

      moveWithin(projectId, status, fromIndex, toIndex) {
        set((s) => {
          const list = s.board[projectId][status].slice();
          const [moved] = list.splice(fromIndex, 1);
          list.splice(toIndex, 0, moved);
          return { board: { ...s.board, [projectId]: { ...s.board[projectId], [status]: list } } };
        });
      },

      moveAcross(projectId, from, to, id, toIndex) {
        set((s) => {
          const fromList = s.board[projectId][from].slice();
          const toList = s.board[projectId][to].slice();
          const idx = fromList.indexOf(id);
          if (idx >= 0) fromList.splice(idx, 1);
          toList.splice(toIndex, 0, id);

          const tasks = { ...s.tasks, [id]: { ...s.tasks[id], status: to } };
          return {
            tasks,
            board: {
              ...s.board,
              [projectId]: { ...s.board[projectId], [from]: fromList, [to]: toList },
            },
          };
        });
      },

      setTaskStatus(id, status) {
        set((s) => ({ tasks: { ...s.tasks, [id]: { ...s.tasks[id], status } } }));
      },

      clearColumn(projectId, status) {
        set((s) => {
          const ids = new Set(s.board[projectId][status]);
          const tasks = { ...s.tasks };
          ids.forEach((id) => delete tasks[id]);
          return {
            tasks,
            board: { ...s.board, [projectId]: { ...s.board[projectId], [status]: [] } },
          };
        });
      },
    }),
    {
      name: "sankofa.pm@v1",
      storage: createJSONStorage(() => localStorage),
      version: 1,
    }
  )
);