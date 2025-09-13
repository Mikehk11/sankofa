import { create } from "zustand";

export type Project = {
  id: string;
  name: string;
  due?: Date | null;
  archived: boolean;
  createdAt: Date;
  updatedAt: Date;
};

type ProjectsState = {
  projects: Record<string, Project>;
  order: string[];
  hydrated: boolean;
  load: () => Promise<void>;
  addProject: (name: string, due?: Date) => Promise<void>;
  setProjectName: (id: string, name: string) => Promise<void>;
  setProjectDue: (id: string, due?: Date) => Promise<void>;
  archiveProject: (id: string, archived: boolean) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
};

export const useProjects = create<ProjectsState>((set, get) => ({
  projects: {},
  order: [],
  hydrated: false,

  async load() {
    if (get().hydrated) return;
    try {
      const res = await fetch("/api/projects", { cache: "no-store" });
      const data = await res.json();
      const arr = (data.projects ?? []).map((p: any) => ({
        ...p,
        due: p.due ? new Date(p.due) : undefined,
        createdAt: new Date(p.createdAt),
        updatedAt: new Date(p.updatedAt),
      })) as Project[];
      const map: Record<string, Project> = {};
      const order: string[] = [];
      for (const p of arr) {
        map[p.id] = p;
        order.push(p.id);
      }
      set({ projects: map, order, hydrated: true });
    } catch {
      // keep defaults; allow retry later
    }
  },

  async addProject(name, due) {
    // optimistic insert with temporary id
    const tempId = `tmp_${Math.random().toString(36).slice(2, 8)}`;
    const now = new Date();
    const temp: Project = {
      id: tempId,
      name,
      due,
      archived: false,
      createdAt: now,
      updatedAt: now,
    };
    set((s) => ({ projects: { ...s.projects, [tempId]: temp }, order: [...s.order, tempId] }));

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, due }),
      });
      const saved = await res.json();
      const fixed: Project = {
        ...saved,
        due: saved.due ? new Date(saved.due) : undefined,
        createdAt: new Date(saved.createdAt),
        updatedAt: new Date(saved.updatedAt),
      };
      set((s) => {
        const { [tempId]: _omit, ...rest } = s.projects;
        return {
          projects: { ...rest, [fixed.id]: fixed },
          order: s.order.map((id) => (id === tempId ? fixed.id : id)),
        };
      });
    } catch {
      // rollback
      set((s) => ({
        projects: Object.fromEntries(Object.entries(s.projects).filter(([id]) => id !== tempId)),
        order: s.order.filter((id) => id !== tempId),
      }));
    }
  },

  async setProjectName(id, name) {
    set((s) => ({ projects: { ...s.projects, [id]: { ...s.projects[id], name } } }));
    await fetch(`/api/projects/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
  },

  async setProjectDue(id, due) {
    set((s) => ({ projects: { ...s.projects, [id]: { ...s.projects[id], due } } }));
    await fetch(`/api/projects/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ due: due ?? null }),
    });
  },

  async archiveProject(id, archived) {
    set((s) => ({ projects: { ...s.projects, [id]: { ...s.projects[id], archived } } }));
    await fetch(`/api/projects/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ archived }),
    });
  },

  async deleteProject(id) {
    // optimistic removal
    const prev = get();
    const prevProjects = { ...prev.projects };
    const prevOrder = [...prev.order];

    const { [id]: _omit, ...rest } = prevProjects;
    set({ projects: rest, order: prevOrder.filter((x) => x !== id) });

    try {
      const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      // success: nothing else to do
    } catch {
      // rollback on failure
      set({ projects: prevProjects, order: prevOrder });
    }
  },
}));