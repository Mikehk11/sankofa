"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type DocFile = {
  name: string;
  mime: string;
  size: number;
  dataUrl: string; // base64
};

export type Doc = {
  id: string;
  title: string;
  content: string;     // markdown-lite
  links: string[];     // external urls
  projectId?: string;
  type?: "note" | "link" | "file";
  file?: DocFile;      // optional uploaded file
};

type DocsState = {
  docs: Doc[];
  add: (d: Omit<Doc, "id"> & { id?: string }) => void;
  update: (id: string, patch: Partial<Doc>) => void;
  remove: (id: string) => void;
  addLink: (id: string, url: string) => void;
  removeLink: (id: string, url: string) => void;
  setFile: (id: string, f: DocFile) => void;
  clearFile: (id: string) => void;
};

const SEED: Doc[] = [
  {
    id: "d1",
    title: "Welcome / Project Charter",
    content:
      "# Sankofa\n\nMission: empower Ivorian youth on democracy & civic engagement.\n\n- Goals: workshops, outreach, partners\n- Metrics: events, attendance, feedback\n",
    links: [],
    type: "note",
  },
];

export const useDocs = create<DocsState>()(
  persist(
    (set) => ({
      docs: SEED,
      add: (d) =>
        set((s) => ({
          docs: [...s.docs, { id: d.id ?? crypto.randomUUID(), ...d }],
        })),
      update: (id, patch) =>
        set((s) => ({
          docs: s.docs.map((x) => (x.id === id ? { ...x, ...patch } : x)),
        })),
      remove: (id) =>
        set((s) => ({ docs: s.docs.filter((x) => x.id !== id) })),
      addLink: (id, url) =>
        set((s) => ({
          docs: s.docs.map((x) =>
            x.id === id && url ? { ...x, links: [...x.links, url], type: "link" } : x
          ),
        })),
      removeLink: (id, url) =>
        set((s) => ({
          docs: s.docs.map((x) =>
            x.id === id ? { ...x, links: x.links.filter((u) => u !== url) } : x
          ),
        })),
      setFile: (id, f) =>
        set((s) => ({
          docs: s.docs.map((x) => (x.id === id ? { ...x, file: f, type: "file" } : x)),
        })),
      clearFile: (id) =>
        set((s) => ({
          docs: s.docs.map((x) => (x.id === id ? { ...x, file: undefined } : x)),
        })),
    }),
    { name: "sankofa-docs" }
  )
);