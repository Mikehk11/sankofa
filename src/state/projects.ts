"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Project } from "@/data/projects";
import { PROJECTS } from "@/data/projects";

type ProjectsState = {
  projects: Project[];
  add: (p: Omit<Project, "id"> & { id?: string }) => void;
  update: (id: string, patch: Partial<Project>) => void;
  remove: (id: string) => void;
};

export const useProjects = create<ProjectsState>()(
  persist(
    (set) => ({
      projects: PROJECTS,
      add: (p) =>
        set((s) => ({
          projects: [...s.projects, { id: p.id ?? crypto.randomUUID(), ...p }],
        })),
      update: (id, patch) =>
        set((s) => ({
          projects: s.projects.map((x) => (x.id === id ? { ...x, ...patch } : x)),
        })),
      remove: (id) =>
        set((s) => ({ projects: s.projects.filter((x) => x.id !== id) })),
    }),
    { name: "sankofa-projects" }
  )
);