// src/state/projects.ts
import { create } from "zustand";
import { nanoid } from "nanoid";

export type Project = {
  id: string;
  name: string;
  due?: Date;
  archived?: boolean;
};

type ProjectsState = {
  projects: Record<string, Project>;
  order: string[];
  addProject: (name: string, due?: Date) => void;
  setProjectName: (id: string, name: string) => void;
  setProjectDue: (id: string, due?: Date) => void;
  archiveProject: (id: string, archived: boolean) => void;
};

export const useProjects = create<ProjectsState>()((set, get) => ({
  projects: {},
  order: [],

  addProject: (name, due) =>
    set((s) => {
      const id = nanoid(6);
      return {
        projects: { ...s.projects, [id]: { id, name, due } },
        order: [id, ...s.order],
      };
    }),

  setProjectName: (id, name) =>
    set((s) => {
      const p = s.projects[id];
      if (!p) return s;
      return { projects: { ...s.projects, [id]: { ...p, name } } };
    }),

  setProjectDue: (id, due) =>
    set((s) => {
      const p = s.projects[id];
      if (!p) return s;
      return { projects: { ...s.projects, [id]: { ...p, due } } };
    }),

  archiveProject: (id, archived) =>
    set((s) => {
      const p = s.projects[id];
      if (!p) return s;
      return { projects: { ...s.projects, [id]: { ...p, archived } } };
    }),
}));